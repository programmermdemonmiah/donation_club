<?php

namespace App\Services\Commission;

use App\Enums\CommissionScope;
use App\Enums\CommissionStatus;
use App\Enums\CommissionTrigger;
use App\Events\CommissionCredited;
use App\Models\Commission;
use App\Models\CommissionRule;
use App\Models\Deposit;
use App\Models\MemberReturn;
use App\Models\User;
use App\Services\Audit\AuditLogService;
use App\Services\Referral\ReferralService;
use App\Services\Settings\SettingsService;
use App\Services\Wallet\WalletService;
use App\Support\Money;
use App\Support\ReferenceGenerator;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * All commission math happens server-side inside DB transactions.
 * Master switch + per-rule percentages live in commission_rules / settings.
 */
class CommissionService
{
    public function __construct(private readonly SettingsService $settings)
    {
    }

    /**
     * Direct referral commission when a referred member's deposit completes.
     */
    public function handleDepositCompleted(Deposit $deposit): void
    {
        if (! $this->settings->commissionsEnabled()) {
            return;
        }

        $rule = CommissionRule::query()
            ->where('trigger_event', CommissionTrigger::Deposit->value)
            ->where('scope', CommissionScope::Direct->value)
            ->where('generation', 1)
            ->where('enabled', true)
            ->first();

        if (! $rule) {
            return;
        }

        $beneficiary = $deposit->user->referrer;

        if (! $beneficiary || ! $this->isBeneficiaryEligible($beneficiary)) {
            return;
        }

        DB::transaction(function () use ($deposit, $rule, $beneficiary) {
            // Idempotency: one commission per source deposit per beneficiary.
            $exists = Commission::query()
                ->where('source_type', $deposit->getMorphClass())
                ->where('source_id', $deposit->id)
                ->where('user_id', $beneficiary->id)
                ->lockForUpdate()
                ->exists();

            if ($exists) {
                return;
            }

            self::createAndCredit(
                beneficiary: $beneficiary,
                sourceUser: $deposit->user,
                rule: $rule,
                baseAmount: Money::parse((string) $deposit->amount),
                source: $deposit,
                description: 'Direct referral commission',
            );
        });
    }

    /**
     * Upline generation commissions triggered by a member's completed return:
     * Member Return → Find Upline (1..10) → Check rules → Credit.
     */
    public function handleReturnCompleted(MemberReturn $return): void
    {
        if (! $this->settings->commissionsEnabled()) {
            return;
        }

        $rules = CommissionRule::query()
            ->where('trigger_event', CommissionTrigger::ReturnPayout->value)
            ->where('enabled', true)
            ->orderBy('generation')
            ->get()
            ->keyBy('generation');

        if ($rules->isEmpty()) {
            return;
        }

        $member = $return->user;

        DB::transaction(function () use ($return, $rules, $member) {
            foreach (ReferralService::upline($member, ReferralService::MAX_GENERATIONS) as $entry) {
                /** @var User $uplineUser */
                $uplineUser = $entry['user'];
                $generation = $entry['generation'];

                $rule = $rules->get($generation);

                if (! $rule || ! $this->isBeneficiaryEligible($uplineUser)) {
                    continue;
                }

                // Idempotency per (source, beneficiary, generation).
                $exists = Commission::query()
                    ->where('source_type', $return->getMorphClass())
                    ->where('source_id', $return->id)
                    ->where('user_id', $uplineUser->id)
                    ->where('generation', $generation)
                    ->lockForUpdate()
                    ->exists();

                if ($exists) {
                    continue;
                }

                self::createAndCredit(
                    beneficiary: $uplineUser,
                    sourceUser: $member,
                    rule: $rule,
                    baseAmount: Money::parse((string) $return->payout_amount),
                    source: $return,
                    description: "Generation {$generation} commission",
                );
            }
        });
    }

    /**
     * Reverse all commissions tied to a source (e.g. reversed return).
     * Commissions are never deleted — they are marked reversed and the credited
     * amounts are debited back where possible.
     */
    public function reverseForSource(string $sourceType, int $sourceId): void
    {
        DB::transaction(function () use ($sourceType, $sourceId) {
            Commission::query()
                ->where('source_type', $sourceType)
                ->where('source_id', $sourceId)
                ->where('status', CommissionStatus::Completed->value)
                ->lockForUpdate()
                ->get()
                ->each(function (Commission $commission) {
                    try {
                        WalletService::debit(
                            $commission->user_id,
                            (string) $commission->amount,
                            \App\Enums\WalletTransactionType::Adjustment,
                            $commission,
                            "Reversal of commission {$commission->reference}",
                        );
                    } catch (Throwable) {
                        // Beneficiary already spent the funds; leave a negative-free
                        // trail: mark reversed without debit, flagged for manual review.
                        AuditLogService::log('commission.reversal_skipped_insufficient_balance', $commission);
                    }

                    $commission->forceFill([
                        'status' => CommissionStatus::Reversed->value,
                        'credited_at' => null,
                    ])->save();

                    AuditLogService::log('commission.reversed', $commission);
                });
        });
    }

    private static function createAndCredit(
        User $beneficiary,
        User $sourceUser,
        CommissionRule $rule,
        string $baseAmount,
        object $source,
        string $description,
    ): Commission {
        $rate = (string) $rule->percentage;
        $amount = Money::percentOf($baseAmount, $rate);

        if (Money::lte($amount, '0')) {
            throw new \RuntimeException('Computed commission must be positive.');
        }

        $commission = Commission::create([
            'reference' => ReferenceGenerator::generate('COM'),
            'user_id' => $beneficiary->id,
            'source_user_id' => $sourceUser->id,
            'commission_rule_id' => $rule->id,
            'generation' => $rule->generation,
            'rate' => $rate,
            'base_amount' => $baseAmount,
            'amount' => $amount,
            'source_type' => $source->getMorphClass(),
            'source_id' => $source->getKey(),
            'status' => CommissionStatus::Completed->value,
            'credited_at' => now(),
        ]);

        WalletService::credit(
            $beneficiary,
            $amount,
            \App\Enums\WalletTransactionType::Commission,
            $commission,
            "{$description} ({$sourceUser->name})",
        );

        CommissionCredited::dispatch($commission);

        return $commission;
    }

    private function isBeneficiaryEligible(User $user): bool
    {
        return $user->isActive() && $user->hasVerifiedEmail();
    }
}
