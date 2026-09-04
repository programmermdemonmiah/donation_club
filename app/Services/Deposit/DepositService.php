<?php

namespace App\Services\Deposit;

use App\Enums\DepositStatus;
use App\Events\DepositCompleted;
use App\Models\Deposit;
use App\Models\DepositSequence;
use App\Models\Payment;
use App\Models\User;
use App\Services\Audit\AuditLogService;
use App\Services\Payment\PaymentGatewayInterface;
use App\Services\Wallet\WalletService;
use App\Enums\WalletTransactionType;
use App\Support\Money;
use App\Support\ReferenceGenerator;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use Throwable;

class DepositService
{
    public function __construct(
        private readonly DepositEligibilityService $eligibility,
        private readonly PaymentGatewayInterface $gateway,
    ) {
    }

    /**
     * Validate + create a pending deposit with its payment, returning
     * [Deposit, Payment, initiation payload].
     */
    public function initiate(User $user, string $amount, array $meta = []): array
    {
        $amount = Money::parse($amount);

        $result = $this->eligibility->check($user, $amount);

        if (! $result['eligible']) {
            throw new RuntimeException($result['reason'] ?? 'Deposit not allowed.');
        }

        return DB::transaction(function () use ($user, $amount, $result, $meta) {
            $deposit = Deposit::create([
                'reference' => ReferenceGenerator::generate('DEP'),
                'user_id' => $user->id,
                'amount' => $amount,
                'status' => DepositStatus::Pending->value,
                'eligibility_snapshot' => $this->eligibility->snapshot($result),
            ]);

            $payment = $this->gateway->createPayment($deposit, $meta);
            $initiation = $this->gateway->initiate($payment);

            AuditLogService::log('deposit.initiated', $deposit, [], [
                'reference' => $deposit->reference,
                'amount' => $amount,
                'payment' => $payment->reference,
            ]);

            return [$deposit, $payment, $initiation];
        });
    }

    /**
     * Validate + create a completed deposit using the user's wallet balance.
     */
    public function initiateFromWallet(User $user, string $amount): Deposit
    {
        $amountMoney = Money::parse($amount);

        $result = $this->eligibility->check($user, $amountMoney);

        if (! $result['eligible']) {
            throw new RuntimeException($result['reason'] ?? 'Deposit not allowed.');
        }
        
        $wallet = $user->wallet()->first();
        if (! $wallet || ! Money::gte($wallet->availableBalance(), $amountMoney)) {
            throw new RuntimeException('Insufficient wallet balance to make this donation.');
        }

        return DB::transaction(function () use ($user, $amountMoney, $result) {
            WalletService::debit(
                user: $user,
                amount: $amountMoney,
                type: WalletTransactionType::Adjustment,
                description: 'Wallet Donation'
            );

            $deposit = Deposit::create([
                'reference' => ReferenceGenerator::generate('DEP'),
                'user_id' => $user->id,
                'amount' => $amountMoney,
                'status' => DepositStatus::Completed->value,
                'eligibility_snapshot' => $this->eligibility->snapshot($result),
                'completed_at' => now(),
            ]);

            $payment = Payment::create([
                'reference' => ReferenceGenerator::generate('PAY'),
                'deposit_id' => $deposit->id,
                'gateway' => 'wallet',
                'amount' => $amountMoney,
                'status' => \App\Enums\PaymentStatus::Successful->value,
                'paid_at' => now(),
            ]);

            $sequenceNumber = $this->allocateSequenceNumber();

            DepositSequence::create([
                'sequence_number' => $sequenceNumber,
                'deposit_id' => $deposit->id,
                'allocated_at' => now(),
            ]);

            AuditLogService::log('deposit.completed_from_wallet', $deposit, [], [
                'status' => DepositStatus::Completed->value,
                'sequence' => sprintf('#%06d', $sequenceNumber),
                'amount' => Money::parse((string) $deposit->amount),
            ]);

            DepositCompleted::dispatch($deposit->refresh(), $payment);

            return $deposit;
        });
    }

    /**
     * Idempotent completion pipeline. Safe to call multiple times (webhook
     * retries, manual re-submission): only the first call has effect.
     */
    public function complete(Payment $payment, ?string $externalReference = null): Deposit
    {
        return DB::transaction(function () use ($payment, $externalReference) {
            /** @var Payment $locked */
            $locked = Payment::query()->whereKey($payment->getKey())->lockForUpdate()->firstOrFail();

            if ($locked->isSuccessful()) {
                return $locked->deposit; // idempotent replay
            }

            if ($locked->status === \App\Enums\PaymentStatus::Failed || $locked->status === \App\Enums\PaymentStatus::Cancelled) {
                throw new RuntimeException('Payment already reached a terminal state.');
            }

            $locked->forceFill([
                'status' => \App\Enums\PaymentStatus::Successful->value,
                'paid_at' => now(),
                'gateway_reference' => $externalReference ?? $locked->gateway_reference,
            ])->save();

            $deposit = $locked->deposit()->lockForUpdate()->firstOrFail();

            $deposit->forceFill([
                'status' => DepositStatus::Completed->value,
                'completed_at' => now(),
            ])->save();

            $sequenceNumber = $this->allocateSequenceNumber();

            DepositSequence::create([
                'sequence_number' => $sequenceNumber,
                'deposit_id' => $deposit->id,
                'allocated_at' => now(),
            ]);

            AuditLogService::log('deposit.completed', $deposit, ['status' => DepositStatus::Pending->value], [
                'status' => DepositStatus::Completed->value,
                'sequence' => sprintf('#%06d', $sequenceNumber),
                'amount' => Money::parse((string) $deposit->amount),
            ]);

            DepositCompleted::dispatch($deposit->refresh(), $locked);

            return $deposit;
        });
    }

    public function markFailed(Payment $payment, string $reason = ''): void
    {
        DB::transaction(function () use ($payment, $reason) {
            /** @var Payment $locked */
            $locked = Payment::query()->whereKey($payment->getKey())->lockForUpdate()->firstOrFail();

            if ($locked->isSuccessful()) {
                throw new RuntimeException('Cannot fail a successful payment. Use refund/reversal instead.');
            }

            if (in_array($locked->status, [\App\Enums\PaymentStatus::Failed, \App\Enums\PaymentStatus::Cancelled], true)) {
                return; // idempotent
            }

            $old = $locked->status->value;

            $locked->forceFill(['status' => \App\Enums\PaymentStatus::Failed->value])->save();
            $locked->deposit->forceFill(['status' => DepositStatus::Failed->value])->save();

            AuditLogService::log('deposit.failed', $locked->deposit, ['payment_status' => $old], [
                'payment_status' => \App\Enums\PaymentStatus::Failed->value,
                'reason' => $reason,
            ]);
        });
    }

    /**
     * Allocate the next deposit sequence number inside the current transaction.
     * Row-level locking on the counter serializes allocation; rollback restores it.
     */
    private function allocateSequenceNumber(): int
    {
        DB::table('sequence_counters')
            ->where('name', 'deposit')
            ->lockForUpdate()
            ->increment('current_value');

        return (int) DB::table('sequence_counters')
            ->where('name', 'deposit')
            ->value('current_value');
    }
}
