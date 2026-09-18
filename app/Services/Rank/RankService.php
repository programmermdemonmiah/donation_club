<?php

namespace App\Services\Rank;

use App\Enums\UserRankStatus;
use App\Events\RankAchieved;
use App\Models\Rank;
use App\Models\RankHistory;
use App\Models\RankRequirement;
use App\Models\User;
use App\Models\UserRank;
use App\Services\Audit\AuditLogService;
use App\Services\Referral\ReferralService;
use App\Services\Settings\SettingsService;
use App\Support\Money;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * Evaluates rank requirements against live team metrics and promotes members.
 */
class RankService
{
    public function __construct(private readonly SettingsService $settings) {}

    /**
     * Live metrics for a user used by rank evaluation and dashboards.
     */
    public function metrics(User $user): array
    {
        $qualifiedMin = (string) ($this->settings->get('rank.qualified_min_deposit') ?? '10.00');

        return [
            'direct_referrals' => ReferralService::directReferralCount($user),
            'team_size' => ReferralService::teamSize($user),
            'team_volume' => ReferralService::teamVolume($user),
            'qualified_members' => count(ReferralService::qualifiedMemberIds($user, $qualifiedMin)),
            'own_total_deposit' => (string) $user->deposits()->completed()->sum('amount'),
            'gen1_volume' => ReferralService::handVolume($user, 1),
            'gen2_volume' => ReferralService::handVolume($user, 2),
            'gen3_volume' => ReferralService::handVolume($user, 3),
        ];
    }

    public function currentRank(User $user): ?Rank
    {
        return $user->activeRank->first();
    }

    /**
     * Highest active rank whose every requirement is satisfied. null = none.
     */
    public function evaluateTarget(User $user, ?array &$metrics = null): ?Rank
    {
        $metrics ??= $this->metrics($user);

        $ranks = Rank::query()->where('active', true)->with('requirements')->orderBy('level')->get();

        $target = null;
        $baselines = [];

        foreach ($ranks as $rank) {
            if ($this->satisfies($rank, $metrics, $baselines)) {
                $target = $rank;
            }

            foreach ($rank->requirements as $requirement) {
                $baselines[$requirement->key] = Money::add(
                    $baselines[$requirement->key] ?? '0.00',
                    (string) $requirement->value,
                );
            }
        }

        return $target;
    }

    /**
     * @param  array<string, string>  $baselines
     */
    private function satisfies(Rank $rank, array $metrics, array $baselines): bool
    {
        foreach ($rank->requirements as $requirement) {
            /** @var RankRequirement $requirement */
            $progress = self::cycleProgress(
                self::metricAmount($requirement->key, $metrics),
                (string) $requirement->value,
                $baselines[$requirement->key] ?? '0.00',
            );

            if (! $progress['met']) {
                return false;
            }
        }

        return true;
    }

    /**
     * Lifetime amount used for a requirement. Rank awards still use this total.
     */
    public static function metricAmount(string $key, array $metrics): string
    {
        $actual = match ($key) {
            RankRequirement::DIRECT_REFERRALS => $metrics['direct_referrals'] ?? 0,
            RankRequirement::TEAM_SIZE => $metrics['team_size'] ?? 0,
            RankRequirement::TEAM_VOLUME => $metrics['team_volume'] ?? 0,
            RankRequirement::QUALIFIED_MEMBERS => $metrics['qualified_members'] ?? 0,
            RankRequirement::MIN_DEPOSIT => $metrics['own_total_deposit'] ?? 0,
            RankRequirement::GEN1_VOLUME => $metrics['gen1_volume'] ?? 0,
            RankRequirement::GEN2_VOLUME => $metrics['gen2_volume'] ?? 0,
            RankRequirement::GEN3_VOLUME => $metrics['gen3_volume'] ?? 0,
            default => 0,
        };

        return Money::parse((string) $actual);
    }

    /**
     * Progress inside one rank cycle.
     *
     * The required amount is exactly the value saved in admin. The previous ranks'
     * targets are only the starting line, so this rank always fills from 0 up to
     * that saved amount.
     *
     * @return array{actual: string, required: string, met: bool}
     */
    public static function cycleProgress(string $lifetime, string $requirement, string $baseline): array
    {
        $lifetime = Money::parse($lifetime);
        $requirement = Money::parse($requirement);
        $baseline = Money::parse($baseline);

        if (Money::lt($baseline, '0')) {
            $baseline = '0.00';
        }

        if (Money::lt($requirement, '0')) {
            $requirement = '0.00';
        }

        $cycleActual = Money::sub($lifetime, $baseline);

        if (Money::lt($cycleActual, '0')) {
            $cycleActual = '0.00';
        }

        $met = Money::gte($cycleActual, $requirement);

        if (Money::gt($cycleActual, $requirement)) {
            $cycleActual = $requirement;
        }

        return [
            'actual' => $cycleActual,
            'required' => $requirement,
            'met' => $met,
        ];
    }

    /**
     * @param  array<string, string|int|float>  $metrics
     * @return array{key: string, label: string, value: string, actual: string, met: bool}
     */
    public function presentRequirement(RankRequirement $requirement, array $metrics, string $baseline): array
    {
        $progress = self::cycleProgress(
            self::metricAmount($requirement->key, $metrics),
            (string) $requirement->value,
            $baseline,
        );

        return [
            'key' => $requirement->key,
            'label' => $requirement->keyLabel(),
            'value' => $progress['required'],
            'actual' => $progress['actual'],
            'met' => $progress['met'],
        ];
    }

    /**
     * Promote every filled rank above the current one, in order, so each
     * rank's one-time incentive can be paid. Returns true when any promotion happened.
     */
    public function promoteIfEligible(User $user, ?int $actorId = null): bool
    {
        if ($user->isAdmin() || ! $user->isActive()) {
            return false;
        }

        $metrics = $this->metrics($user);
        $target = $this->evaluateTarget($user, $metrics);

        if (! $target) {
            return false;
        }

        return DB::transaction(function () use ($user, $target, $metrics, $actorId) {
            UserRank::query()->where('user_id', $user->id)->lockForUpdate()->get();

            $current = UserRank::query()
                ->where('user_id', $user->id)
                ->where('status', UserRankStatus::Active->value)
                ->first();

            $currentLevel = $current
                ? (int) Rank::query()->whereKey($current->rank_id)->value('level')
                : 0;

            if ($currentLevel >= (int) $target->level) {
                return false;
            }

            $ranksToAward = Rank::query()
                ->where('active', true)
                ->where('level', '>', $currentLevel)
                ->where('level', '<=', (int) $target->level)
                ->orderBy('level')
                ->get();

            $previousRankId = $current?->rank_id;
            $promoted = false;

            foreach ($ranksToAward as $rank) {
                if ($current) {
                    $current->delete();
                }

                $current = UserRank::create([
                    'user_id' => $user->id,
                    'rank_id' => $rank->id,
                    'status' => UserRankStatus::Active->value,
                    'metrics_snapshot' => $metrics,
                    'achieved_at' => now(),
                ]);

                RankHistory::create([
                    'user_id' => $user->id,
                    'old_rank_id' => $previousRankId,
                    'new_rank_id' => $rank->id,
                    'reason' => 'Automated requirement evaluation',
                    'changed_by' => $actorId,
                ]);

                AuditLogService::log('rank.promoted', $user, ['rank' => $previousRankId], ['rank' => $rank->id]);

                RankAchieved::dispatch($user->refresh(), $rank);

                $previousRankId = $rank->id;
                $promoted = true;
            }

            return $promoted;
        });
    }

    /**
     * Instant evaluation for a member and every upline whose hand volume may have changed.
     */
    public function evaluateUserAndUpline(User $user): void
    {
        $this->promoteSafely($user);

        foreach (ReferralService::upline($user) as $entry) {
            $this->promoteSafely($entry['user']);
        }
    }

    private function promoteSafely(User $user): bool
    {
        try {
            return $this->promoteIfEligible($user);
        } catch (Throwable $e) {
            report($e);

            return false;
        }
    }

    /**
     * Batch evaluation for the scheduler.
     */
    public function evaluateAll(int $chunkSize = 200): int
    {
        $promoted = 0;

        User::query()
            ->where('is_admin', false)
            ->where('status', 'active')
            ->orderBy('id')
            ->chunkById($chunkSize, function ($users) use (&$promoted) {
                foreach ($users as $user) {
                    if ($this->promoteSafely($user)) {
                        $promoted++;
                    }
                }
            });

        return $promoted;
    }

    public static function requirementKeyLabels(): array
    {
        return collect(RankRequirement::KEYS)
            ->mapWithKeys(fn ($key) => [$key => (new RankRequirement(['key' => $key]))->keyLabel()])
            ->all();
    }
}
