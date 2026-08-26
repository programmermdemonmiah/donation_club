<?php

namespace App\Services\Wallet;

use App\Enums\WalletDirection;
use App\Enums\WalletTransactionStatus;
use App\Enums\WalletTransactionType;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Support\Money;
use App\Support\ReferenceGenerator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use RuntimeException;
use Throwable;

/**
 * Single authority for all wallet mutations.
 *
 * Invariants:
 *  - Every balance/locked_balance change happens inside DB::transaction().
 *  - The wallet row is selected FOR UPDATE to serialize concurrent updates.
 *  - Every mutation produces exactly one append-only ledger entry.
 *  - Available balance can never go below zero.
 */
class WalletService
{
    /**
     * Add funds to the spendable balance.
     */
    public static function credit(
        User|int $user,
        string $amount,
        WalletTransactionType $type,
        ?Model $reference = null,
        ?string $description = null,
    ): WalletTransaction {
        $amount = Money::parse($amount);

        if (Money::lte($amount, '0')) {
            throw new InvalidArgumentException('Credit amount must be positive.');
        }

        return DB::transaction(function () use ($user, $amount, $type, $reference, $description) {
            $wallet = self::lockWallet($user);

            $before = Money::parse((string) $wallet->balance);
            $after = Money::add($before, $amount);

            $wallet->forceFill(['balance' => $after])->save();

            return self::createEntry(
                userId: $wallet->user_id,
                type: $type,
                direction: WalletDirection::Credit,
                amount: $amount,
                balanceBefore: $before,
                balanceAfter: $after,
                reference: $reference,
                description: $description ?? $type->label(),
            );
        });
    }

    /**
     * Remove funds from the spendable balance immediately (e.g. admin adjustment).
     */
    public static function debit(
        User|int $user,
        string $amount,
        WalletTransactionType $type,
        ?Model $reference = null,
        ?string $description = null,
    ): WalletTransaction {
        $amount = Money::parse($amount);

        if (Money::lte($amount, '0')) {
            throw new InvalidArgumentException('Debit amount must be positive.');
        }

        return DB::transaction(function () use ($user, $amount, $type, $reference, $description) {
            $wallet = self::lockWallet($user);

            if (! Money::gte($wallet->availableBalance(), $amount)) {
                throw new RuntimeException('Insufficient available balance.');
            }

            $before = Money::parse((string) $wallet->balance);
            $after = Money::sub($before, $amount);

            $wallet->forceFill(['balance' => $after])->save();

            return self::createEntry(
                userId: $wallet->user_id,
                type: $type,
                direction: WalletDirection::Debit,
                amount: $amount,
                balanceBefore: $before,
                balanceAfter: $after,
                reference: $reference,
                description: $description ?? $type->label(),
            );
        });
    }

    /**
     * Lock funds for a pending withdrawal: moves the amount from available
     * into locked_balance without yet reducing the real balance.
     * Ledger entry is recorded as "held" against the available-balance context.
     */
    public static function hold(
        User|int $user,
        string $amount,
        Model $reference,
        ?string $description = null,
    ): WalletTransaction {
        $amount = Money::parse($amount);

        return DB::transaction(function () use ($user, $amount, $reference, $description) {
            $wallet = self::lockWallet($user);
            $availableBefore = $wallet->availableBalance();

            if (! Money::gte($availableBefore, $amount)) {
                throw new RuntimeException('Insufficient available balance.');
            }

            $wallet->forceFill([
                'locked_balance' => Money::add((string) $wallet->locked_balance, $amount),
            ])->save();

            return self::createEntry(
                userId: $wallet->user_id,
                type: WalletTransactionType::WithdrawalHold,
                direction: WalletDirection::Debit,
                amount: $amount,
                balanceBefore: $availableBefore,
                balanceAfter: Money::sub($availableBefore, $amount),
                reference: $reference,
                description: $description ?? 'Funds locked for withdrawal',
                status: WalletTransactionStatus::Held,
                context: 'available',
            );
        });
    }

    /**
     * Finalize a hold: actually deduct from balance and release the lock.
     */
    public static function consumeHold(WalletTransaction $hold, Model $reference, ?string $description = null): WalletTransaction
    {
        return DB::transaction(function () use ($hold, $reference, $description) {
            $wallet = self::lockWallet($hold->user_id);
            $amount = Money::parse((string) $hold->amount);

            if ($hold->status !== WalletTransactionStatus::Held) {
                throw new RuntimeException('Hold is not in a held state.');
            }

            $before = Money::parse((string) $wallet->balance);

            $wallet->forceFill([
                'balance' => Money::sub($before, $amount),
                'locked_balance' => Money::sub((string) $wallet->locked_balance, $amount),
            ])->save();

            $hold->forceFill(['status' => WalletTransactionStatus::Consumed])->save();

            return self::createEntry(
                userId: $wallet->user_id,
                type: WalletTransactionType::Withdrawal,
                direction: WalletDirection::Debit,
                amount: $amount,
                balanceBefore: $before,
                balanceAfter: Money::sub($before, $amount),
                reference: $reference,
                description: $description ?? 'Withdrawal completed',
            );
        });
    }

    /**
     * Release a held amount back to available balance (withdrawal rejected/cancelled).
     */
    public static function releaseHold(WalletTransaction $hold, ?string $reason = null): void
    {
        DB::transaction(function () use ($hold, $reason) {
            $wallet = self::lockWallet($hold->user_id);
            $amount = Money::parse((string) $hold->amount);

            if ($hold->status !== WalletTransactionStatus::Held) {
                throw new RuntimeException('Hold is not in a held state.');
            }

            $availableBefore = $wallet->availableBalance();

            $wallet->forceFill([
                'locked_balance' => Money::sub((string) $wallet->locked_balance, $amount),
            ])->save();

            $hold->forceFill(['status' => WalletTransactionStatus::Released])->save();

            self::createEntry(
                userId: $wallet->user_id,
                type: WalletTransactionType::WithdrawalRelease,
                direction: WalletDirection::Credit,
                amount: $amount,
                balanceBefore: $availableBefore,
                balanceAfter: Money::add($availableBefore, $amount),
                reference: $hold,
                description: $reason ?? 'Withdrawal hold released',
                status: WalletTransactionStatus::Released,
                context: 'available',
            );
        });
    }

    private static function lockWallet(User|int $user): Wallet
    {
        $userId = $user instanceof User ? $user->id : $user;

        $wallet = Wallet::query()
            ->where('user_id', $userId)
            ->lockForUpdate()
            ->first();

        if (! $wallet) {
            $wallet = new Wallet(['user_id' => $userId, 'balance' => '0.00', 'locked_balance' => '0.00']);
            $wallet->save();
            $wallet = Wallet::query()->where('user_id', $userId)->lockForUpdate()->first();
        }

        return $wallet;
    }

    private static function createEntry(
        int $userId,
        WalletTransactionType $type,
        WalletDirection $direction,
        string $amount,
        string $balanceBefore,
        string $balanceAfter,
        ?Model $reference = null,
        ?string $description = null,
        WalletTransactionStatus $status = WalletTransactionStatus::Completed,
        string $context = 'balance',
    ): WalletTransaction {
        return WalletTransaction::create([
            'reference' => ReferenceGenerator::generate('WTX'),
            'user_id' => $userId,
            'type' => $type->value,
            'direction' => $direction->value,
            'amount' => $amount,
            'balance_context' => $context,
            'balance_before' => $balanceBefore,
            'balance_after' => $balanceAfter,
            'status' => $status->value,
            'reference_type' => $reference?->getMorphClass(),
            'reference_id' => $reference?->getKey(),
            'description' => $description,
        ]);
    }
}
