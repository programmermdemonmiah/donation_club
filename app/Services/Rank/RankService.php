<?php

namespace App\Services\Rank;

use App\Enums\UserRankStatus;
use App\Events\RankAchieved;
use App\Models\Rank;
use App\Models\RankHistory;
use App\Models\RankRequirement;
use App\Models\ReturnRule;
use App\Models\User;
use App\Models\UserRank;
use App\Services\Audit\AuditLogService;
use App\Services\Referral\ReferralService;
use App\Services\Settings\SettingsService;
use App\Support\Money;
use Illuminate\Support\Facades\DB;

/**
 * Evaluates rank requirements against live team metrics and promotes members.
 */
class RankService
{
    public function __construct(private readonly SettingsService $settings)
    {
    }

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

        foreach ($ranks as $rank) {
            if ($this->satisfies($rank, $metrics)) {
                $target = $rank; // keep the highest satisfied
            }
        }

        return $target;
    }

    private function satisfies(Rank $rank, array $metrics): bool
    {
        foreach ($rank->requirements as $requirement) {
            /** @var RankRequirement $requirement */
            $actual = match ($requirement->key) {
                RankRequirement::DIRECT_REFERRALS => $metrics['direct_referrals'],
                RankRequirement::TEAM_SIZE => $metrics['team_size'],
                RankRequirement::TEAM_VOLUME => $metrics['team_volume'],
                RankRequirement::QUALIFIED_MEMBERS => $metrics['qualified_members'],
                RankRequirement::MIN_DEPOSIT => $metrics['own_total_deposit'],
                default => 0,
            };

            if (! Money::gte((string) $actual, (string) $requirement->value)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Promote if the evaluated target is higher than the current rank.
     * Returns true when a promotion happened.
     */
    public function promoteIfEligible(User $user, ?int $actorId = null): bool
    {
        $metrics = $this->metrics($user);
        $target = $this->evaluateTarget($user, $metrics);

        if (! $target) {
            return false;
        }

        return DB::transaction(function () use ($user, $target, $metrics, $actorId) {
            // Lock user's rank rows to avoid double promotion under concurrency.
            UserRank::query()->where('user_id', $user->id)->lockForUpdate()->get();

            $current = UserRank::query()
                ->where('user_id', $user->id)
                ->where('status', UserRankStatus::Active->value)
                ->first();

            if ($current && $current->rank_id >= $target->id) {
                return false;
            }

            $oldRankId = $current?->rank_id;

            if ($current) {
                $current->forceFill(['status' => UserRankStatus::Superseded->value])->save();
            }

            UserRank::create([
                'user_id' => $user->id,
                'rank_id' => $target->id,
                'status' => UserRankStatus::Active->value,
                'metrics_snapshot' => $metrics,
                'achieved_at' => now(),
            ]);

            RankHistory::create([
                'user_id' => $user->id,
                'old_rank_id' => $oldRankId,
                'new_rank_id' => $target->id,
                'reason' => 'Automated requirement evaluation',
                'changed_by' => $actorId,
            ]);

            AuditLogService::log('rank.promoted', $user, ['rank' => $oldRankId], ['rank' => $target->id]);

            RankAchieved::dispatch($user->refresh(), $target);

            return true;
        });
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
                    if ($this->promoteIfEligible($user)) {
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
