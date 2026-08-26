<?php

namespace App\Services\Withdrawal;

use App\Enums\WithdrawalStatus;
use App\Events\WithdrawalStatusChanged;
use App\Models\User;
use App\Models\Withdrawal;
use App\Services\Audit\AuditLogService;
use App\Services\Settings\SettingsService;
use App\Services\Wallet\WalletService;
use App\Support\Money;
use App\Support\ReferenceGenerator;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Withdrawal lifecycle with wallet locking:
 * request (hold) → approved → processing → completed (final debit)
 *                ↘ rejected/failed/cancelled → hold released
 * Wallet balance can never go negative; holds are enforced server-side.
 */
class WithdrawalService
{
    public function __construct(private readonly SettingsService $settings)
    {
    }

    public function request(User $user, string $amount, string $method, array $accountInformation): Withdrawal
    {
        if (! $this->settings->withdrawalsEnabled()) {
            throw new RuntimeException('Withdrawals are temporarily disabled.');
        }

        if (! $user->isActive() || ! $user->hasVerifiedEmail()) {
            throw new RuntimeException('Account must be active with a verified email.');
        }

        $amount = Money::parse($amount);
        $min = $this->settings->minWithdrawal();
        $max = $this->settings->maxWithdrawal();

        if (Money::lt($amount, $min)) {
            throw new RuntimeException("Minimum withdrawal amount is {$min}.");
        }

        if (Money::gt($amount, $max)) {
            throw new RuntimeException("Maximum withdrawal amount is {$max}.");
        }

        if (! array_key_exists('account_details', $accountInformation) || blank(trim((string) $accountInformation['account_details']))) {
            throw new RuntimeException('Account information is required.');
        }

        return DB::transaction(function () use ($user, $amount, $method, $accountInformation) {
            // Lock the user's wallet row first to serialize requests vs spends.
            $walletLocked = DB::table('wallets')->where('user_id', $user->id)->lockForUpdate()->exists();

            $feePercent = $this->settings->withdrawalFeePercent();
            $fee = Money::percentOf($amount, $feePercent);
            $net = Money::sub($amount, $fee);

            $withdrawal = Withdrawal::create([
                'reference' => ReferenceGenerator::generate('WDL'),
                'user_id' => $user->id,
                'amount' => $amount,
                'fee' => $fee,
                'net_amount' => $net,
                'method' => $method,
                'account_information' => $accountInformation,
                'status' => WithdrawalStatus::Pending->value,
                'requested_at' => now(),
            ]);

            WalletService::hold($user, $amount, $withdrawal, "Withdrawal {$withdrawal->reference} hold");

            AuditLogService::log('withdrawal.requested', $withdrawal, [], [
                'amount' => $amount,
                'fee' => $fee,
                'net_amount' => $net,
                'method' => $method,
            ]);

            return $withdrawal;
        });
    }

    public function cancel(User $user, Withdrawal $withdrawal): Withdrawal
    {
        return DB::transaction(function () use ($user, $withdrawal) {
            /** @var Withdrawal $locked */
            $locked = Withdrawal::query()->whereKey($withdrawal->getKey())->lockForUpdate()->firstOrFail();

            if ($locked->user_id !== $user->id) {
                throw new RuntimeException('This withdrawal does not belong to you.');
            }

            if ($locked->status !== WithdrawalStatus::Pending) {
                throw new RuntimeException('Only pending withdrawals can be cancelled.');
            }

            $old = ['status' => $locked->status->value];
            $locked->forceFill(['status' => WithdrawalStatus::Cancelled->value])->save();

            self::releaseHoldFor($locked);

            AuditLogService::log('withdrawal.cancelled', $locked, $old, ['status' => WithdrawalStatus::Cancelled->value], $user->id);

            return $locked;
        });
    }

    public function approve(Withdrawal $withdrawal, User $admin, ?string $note = null): Withdrawal
    {
        return $this->transition($withdrawal, $admin, WithdrawalStatus::Approved, [WithdrawalStatus::Pending], $note);
    }

    public function startProcessing(Withdrawal $withdrawal, User $admin, ?string $note = null): Withdrawal
    {
        return $this->transition($withdrawal, $admin, WithdrawalStatus::Processing, [WithdrawalStatus::Approved], $note);
    }

    /**
     * Finalize: converts hold into a real balance debit.
     */
    public function complete(Withdrawal $withdrawal, User $admin, ?string $note = null): Withdrawal
    {
        return DB::transaction(function () use ($withdrawal, $admin, $note) {
            /** @var Withdrawal $locked */
            $locked = Withdrawal::query()->whereKey($withdrawal->getKey())->lockForUpdate()->firstOrFail();

            if (! in_array($locked->status, [WithdrawalStatus::Processing, WithdrawalStatus::Approved], true)) {
                throw new RuntimeException("Only approved/processing withdrawals can be completed (current: {$locked->status->value}).");
            }

            $hold = $this->activeHoldFor($locked);

            if (! $hold) {
                throw new RuntimeException('No active wallet hold found for this withdrawal.');
            }

            WalletService::consumeHold(
                $hold,
                $locked,
                "Withdrawal {$locked->reference} completed",
            );

            $old = ['status' => $locked->status->value];
            $locked->forceFill([
                'status' => WithdrawalStatus::Completed->value,
                'processed_by' => $admin->id,
                'processed_at' => now(),
                'completed_at' => now(),
                'admin_note' => $note ?? $locked->admin_note,
            ])->save();

            AuditLogService::log('withdrawal.completed', $locked, $old, ['status' => WithdrawalStatus::Completed->value], $admin->id);

            $completed = $locked->refresh();
            WithdrawalStatusChanged::dispatch($completed);

            return $completed;
        });
    }

    public function reject(Withdrawal $withdrawal, User $admin, string $reason): Withdrawal
    {
        $result = $this->transition($withdrawal, $admin, WithdrawalStatus::Rejected, [WithdrawalStatus::Pending, WithdrawalStatus::Approved, WithdrawalStatus::Processing], $reason);

        self::releaseHoldFor($result);

        return $result;
    }

    public function fail(Withdrawal $withdrawal, User $admin, string $reason): Withdrawal
    {
        $result = $this->transition($withdrawal, $admin, WithdrawalStatus::Failed, [WithdrawalStatus::Processing, WithdrawalStatus::Approved], $reason);

        // Payout attempt failed — funds must be returned to the member.
        self::releaseHoldFor($result);

        return $result;
    }

    // -----------------------------------------------------------------------

    private function transition(
        Withdrawal $withdrawal,
        User $actor,
        WithdrawalStatus $to,
        array $allowedFrom,
        ?string $note = null,
    ): Withdrawal {
        return DB::transaction(function () use ($withdrawal, $actor, $to, $allowedFrom, $note) {
            /** @var Withdrawal $locked */
            $locked = Withdrawal::query()->whereKey($withdrawal->getKey())->lockForUpdate()->firstOrFail();

            if (! in_array($locked->status, $allowedFrom, true)) {
                throw new RuntimeException("Cannot move withdrawal from {$locked->status->value} to {$to->value}.");
            }

            $old = ['status' => $locked->status->value];

            $locked->forceFill([
                'status' => $to->value,
                'processed_by' => $actor->id,
                'processed_at' => now(),
                'admin_note' => $note ?? $locked->admin_note,
            ])->save();

            AuditLogService::log("withdrawal.{$to->value}", $locked, $old, ['status' => $to->value], $actor->id);

            $updated = $locked->refresh();
            WithdrawalStatusChanged::dispatch($updated);

            return $updated;
        });
    }

    private static function activeHoldFor(Withdrawal $withdrawal)
    {
        return \App\Models\WalletTransaction::query()
            ->where('user_id', $withdrawal->user_id)
            ->where('type', \App\Enums\WalletTransactionType::WithdrawalHold->value)
            ->where('status', \App\Enums\WalletTransactionStatus::Held->value)
            ->where('reference_type', $withdrawal->getMorphClass())
            ->where('reference_id', $withdrawal->id)
            ->lockForUpdate()
            ->first();
    }

    private static function releaseHoldFor(Withdrawal $withdrawal): void
    {
        DB::transaction(function () use ($withdrawal) {
            /** @var Withdrawal $fresh */
            $fresh = Withdrawal::query()->whereKey($withdrawal->getKey())->lockForUpdate()->firstOrFail();

            if ($fresh->status->isLocked()) {
                return;
            }

            $hold = self::activeHoldFor($fresh);

            if ($hold) {
                WalletService::releaseHold($hold, "Withdrawal {$fresh->reference} released");
            }
        });
    }
}
