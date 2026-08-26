<?php

namespace App\Services\Return;

use App\Enums\ReturnStatus;
use App\Events\ReturnCompleted;
use App\Events\ReturnStatusChanged;
use App\Models\MemberReturn;
use App\Models\ReturnRule;
use App\Models\User;
use App\Services\Audit\AuditLogService;
use App\Services\Commission\CommissionService;
use App\Support\Money;
use App\Support\ReferenceGenerator;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Return/reward lifecycle: pending → eligible → approved → processing → completed
 * (with cancel / reverse paths). No fixed dates are promised; processing is
 * admin-driven and gated by the enabled flag in return_rules.
 */
class ReturnService
{
    public function __construct(
        private readonly EligibilityService $eligibility,
        private readonly CommissionService $commissions,
    ) {
    }

    /**
     * Create a pending return record when a deposit completes.
     * Rate is locked at creation time from the current rule.
     */
    public function createFromDeposit(object $deposit): ?MemberReturn
    {
        $rule = ReturnRule::query()->first();

        if (! $rule || ! $rule->enabled || ! $rule->return_percent) {
            return null;
        }

        if ($deposit->memberReturn()->whereIn('status', [
            ReturnStatus::Pending->value,
            ReturnStatus::Eligible->value,
            ReturnStatus::Approved->value,
            ReturnStatus::Processing->value,
            ReturnStatus::Completed->value,
        ])->exists()) {
            return $deposit->memberReturn; // idempotent
        }

        $base = Money::parse((string) $deposit->amount);
        $rate = (string) $rule->return_percent;
        $payout = Money::percentOf($base, $rate);

        return MemberReturn::create([
            'reference' => ReferenceGenerator::generate('RTN'),
            'user_id' => $deposit->user_id,
            'deposit_id' => $deposit->id,
            'base_amount' => $base,
            'rate' => $rate,
            'payout_amount' => $payout,
            'status' => ReturnStatus::Pending->value,
        ]);
    }

    /**
     * Scheduler/admin scan: flip pending returns whose owner now qualifies.
     */
    public function markEligible(int $limit = 200): int
    {
        $count = 0;

        MemberReturn::query()
            ->where('status', ReturnStatus::Pending->value)
            ->orderBy('id')
            ->limit($limit)
            ->get()
            ->each(function (MemberReturn $return) use (&$count) {
                $result = $this->eligibility->evaluate($return->user);

                if (! $result['eligible']) {
                    return;
                }

                DB::transaction(function () use ($return, &$count) {
                    $updated = MemberReturn::query()
                        ->whereKey($return->id)
                        ->where('status', ReturnStatus::Pending->value)
                        ->update([
                            'status' => ReturnStatus::Eligible->value,
                            'eligible_at' => now(),
                        ]);

                    if ($updated) {
                        $count++;
                        AuditLogService::log('return.marked_eligible', $return);
                        ReturnStatusChanged::dispatch($return->refresh());
                    }
                });
            });

        return $count;
    }

    public function approve(MemberReturn $return, User $approver, ?string $note = null): MemberReturn
    {
        return DB::transaction(function () use ($return, $approver, $note) {
            /** @var MemberReturn $locked */
            $locked = MemberReturn::query()->whereKey($return->getKey())->lockForUpdate()->firstOrFail();

            if (! in_array($locked->status, [ReturnStatus::Eligible, ReturnStatus::Pending], true)) {
                throw new RuntimeException("Only pending/eligible returns can be approved (current: {$locked->status->value}).");
            }

            $old = ['status' => $locked->status->value];

            $locked->forceFill([
                'status' => ReturnStatus::Approved->value,
                'approved_by' => $approver->id,
                'approved_at' => now(),
                'note' => $note ?? $locked->note,
            ])->save();

            AuditLogService::log('return.approved', $locked, $old, ['status' => ReturnStatus::Approved->value]);
            ReturnStatusChanged::dispatch($locked);

            return $locked;
        });
    }

    public function startProcessing(MemberReturn $return, User $actor): MemberReturn
    {
        return DB::transaction(function () use ($return, $actor) {
            /** @var MemberReturn $locked */
            $locked = MemberReturn::query()->whereKey($return->getKey())->lockForUpdate()->firstOrFail();

            if ($locked->status !== ReturnStatus::Approved) {
                throw new RuntimeException('Only approved returns can be processed.');
            }

            $old = ['status' => $locked->status->value];
            $locked->forceFill(['status' => ReturnStatus::Processing->value, 'processed_at' => now()])->save();

            AuditLogService::log('return.processing', $locked, $old, ['status' => ReturnStatus::Processing->value], $actor->id);
            ReturnStatusChanged::dispatch($locked);

            return $locked;
        });
    }

    /**
     * Complete: credit the wallet payout then fan out upline commissions —
     * all atomically. Idempotent via status check + unique commission keys.
     */
    public function complete(MemberReturn $return, User $actor): MemberReturn
    {
        return DB::transaction(function () use ($return, $actor) {
            /** @var MemberReturn $locked */
            $locked = MemberReturn::query()->whereKey($return->getKey())->lockForUpdate()->firstOrFail();

            if ($locked->status !== ReturnStatus::Processing && $locked->status !== ReturnStatus::Approved) {
                throw new RuntimeException("Only approved/processing returns can be completed (current: {$locked->status->value}).");
            }

            $old = ['status' => $locked->status->value];

            \App\Services\Wallet\WalletService::credit(
                $locked->user_id,
                (string) $locked->payout_amount,
                \App\Enums\WalletTransactionType::ReturnPayout,
                $locked,
                "Return {$locked->reference} payout",
            );

            $locked->forceFill([
                'status' => ReturnStatus::Completed->value,
                'completed_at' => now(),
            ])->save();

            AuditLogService::log('return.completed', $locked, $old, [
                'status' => ReturnStatus::Completed->value,
                'payout_amount' => Money::parse((string) $locked->payout_amount),
            ], $actor->id);

            $completed = $locked->refresh();

            // Upline generation commissions (same transaction).
            $this->commissions->handleReturnCompleted($completed);

            ReturnCompleted::dispatch($completed);

            return $completed;
        });
    }

    public function cancel(MemberReturn $return, User $actor, string $reason): MemberReturn
    {
        return DB::transaction(function () use ($return, $actor, $reason) {
            /** @var MemberReturn $locked */
            $locked = MemberReturn::query()->whereKey($return->getKey())->lockForUpdate()->firstOrFail();

            if (in_array($locked->status, [ReturnStatus::Completed, ReturnStatus::Reversed, ReturnStatus::Cancelled], true)) {
                throw new RuntimeException("Return cannot be cancelled in state {$locked->status->value}. Use reversal.");
            }

            $old = ['status' => $locked->status->value];
            $locked->forceFill(['status' => ReturnStatus::Cancelled->value, 'cancelled_at' => now(), 'note' => $reason])->save();

            AuditLogService::log('return.cancelled', $locked, $old, ['status' => ReturnStatus::Cancelled->value, 'reason' => $reason], $actor->id);
            ReturnStatusChanged::dispatch($locked);

            return $locked;
        });
    }

    /**
     * Reverse a completed return: debit the payout back from the member's
     * wallet and reverse dependent commissions. Creates an audit trail; the
     * original row is never deleted.
     */
    public function reverse(MemberReturn $return, User $actor, string $reason): MemberReturn
    {
        return DB::transaction(function () use ($return, $actor, $reason) {
            /** @var MemberReturn $locked */
            $locked = MemberReturn::query()->whereKey($return->getKey())->lockForUpdate()->firstOrFail();

            if ($locked->status !== ReturnStatus::Completed) {
                throw new RuntimeException('Only completed returns can be reversed.');
            }

            \App\Services\Wallet\WalletService::debit(
                $locked->user_id,
                (string) $locked->payout_amount,
                \App\Enums\WalletTransactionType::Adjustment,
                $locked,
                "Reversal of return {$locked->reference}: {$reason}",
            );

            $this->commissions->reverseForSource($locked->getMorphClass(), (int) $locked->getKey());

            $reversal = MemberReturn::create([
                'reference' => ReferenceGenerator::generate('RTN'),
                'user_id' => $locked->user_id,
                'deposit_id' => $locked->deposit_id,
                'base_amount' => 0,
                'rate' => 0,
                'payout_amount' => 0,
                'status' => ReturnStatus::Reversed->value,
                'reversal_of_return_id' => $locked->id,
                'note' => $reason,
            ]);

            $locked->forceFill(['status' => ReturnStatus::Reversed->value])->save();
            $locked->refresh();

            AuditLogService::log('return.reversed', $locked, ['status' => ReturnStatus::Completed->value], [
                'status' => ReturnStatus::Reversed->value,
                'reason' => $reason,
                'reversal_reference' => $reversal->reference,
            ], $actor->id);

            ReturnStatusChanged::dispatch($locked);

            return $locked;
        });
    }
}
