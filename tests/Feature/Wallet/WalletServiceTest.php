<?php

namespace Tests\Feature\Wallet;

use App\Models\User;
use App\Services\Wallet\WalletService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use RuntimeException;
use Tests\TestCase;

class WalletServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_credit_increases_balance_and_creates_ledger_entry(): void
    {
        $user = $this->createUser();

        WalletService::credit($user, '10.00', \App\Enums\WalletTransactionType::Commission);

        $wallet = $user->wallet()->first();
        $tx = $user->walletTransactions()->sole();

        $this->assertSame('10.00', (string) $wallet->balance);
        $this->assertSame('credit', $tx->direction->value);
        $this->assertSame('0.00', (string) $tx->balance_before);
        $this->assertSame('10.00', (string) $tx->balance_after);
    }

    public function test_debit_reduces_balance_and_rejects_overdraft(): void
    {
        $user = $this->createUser();
        WalletService::credit($user, '5.00', \App\Enums\WalletTransactionType::Adjustment);

        WalletService::debit($user->fresh(), '2.50', \App\Enums\WalletTransactionType::Adjustment);

        $this->assertSame('2.50', (string) $user->wallet()->first()->balance);

        $this->expectException(RuntimeException::class);
        WalletService::debit($user->fresh(), '100.00', \App\Enums\WalletTransactionType::Adjustment);
    }

    public function test_hold_locks_funds_without_touching_balance(): void
    {
        $user = $this->createUser();
        WalletService::credit($user, '20.00', \App\Enums\WalletTransactionType::ReturnPayout);
        $user = $user->fresh();

        $withdrawal = \App\Models\Withdrawal::create([
            'reference' => 'WDL-TEST0001',
            'user_id' => $user->id,
            'amount' => '5.00',
            'fee' => '0.05',
            'net_amount' => '4.95',
            'method' => 'bank',
            'account_information' => ['account_details' => 'x'],
            'status' => \App\Enums\WithdrawalStatus::Pending,
            'requested_at' => now(),
        ]);

        $hold = WalletService::hold($user, '5.00', $withdrawal);

        $wallet = $user->wallet()->first();

        $this->assertSame('20.00', (string) $wallet->balance); // balance untouched
        $this->assertSame('5.00', (string) $wallet->locked_balance);
        $this->assertSame('15.00', $wallet->availableBalance());
        $this->assertSame(\App\Enums\WalletTransactionStatus::Held, $hold->status);

        // Cannot hold more than available
        $this->expectException(RuntimeException::class);
        WalletService::hold($user->fresh(), '16.00', $withdrawal);
    }

    public function test_consume_hold_finalizes_withdrawal(): void
    {
        $user = $this->createUser();
        WalletService::credit($user, '20.00', \App\Enums\WalletTransactionType::ReturnPayout);

        $withdrawal = \App\Models\Withdrawal::create([
            'reference' => 'WDL-TEST0002',
            'user_id' => $user->id,
            'amount' => '8.00',
            'fee' => '0.08',
            'net_amount' => '7.92',
            'method' => 'bank',
            'account_information' => ['account_details' => 'x'],
            'status' => \App\Enums\WithdrawalStatus::Processing,
            'requested_at' => now(),
        ]);

        $hold = WalletService::hold($user->fresh(), '8.00', $withdrawal);
        WalletService::consumeHold($hold, $withdrawal);

        $wallet = $user->wallet()->first();

        $this->assertSame('12.00', (string) $wallet->balance);
        $this->assertSame('0.00', (string) $wallet->locked_balance);
        $this->assertSame(\App\Enums\WalletTransactionStatus::Consumed, $hold->fresh()->status);
    }

    public function test_release_hold_restores_availability(): void
    {
        $user = $this->createUser();
        WalletService::credit($user, '20.00', \App\Enums\WalletTransactionType::ReturnPayout);

        $withdrawal = \App\Models\Withdrawal::create([
            'reference' => 'WDL-TEST0003',
            'user_id' => $user->id,
            'amount' => '6.00',
            'fee' => '0',
            'net_amount' => '6.00',
            'method' => 'bank',
            'account_information' => ['account_details' => 'x'],
            'status' => \App\Enums\WithdrawalStatus::Rejected,
            'requested_at' => now(),
        ]);

        $hold = WalletService::hold($user->fresh(), '6.00', $withdrawal);
        WalletService::releaseHold($hold);

        $wallet = $user->wallet()->first();

        $this->assertSame('0.00', (string) $wallet->locked_balance);
        $this->assertSame('20.00', (string) $wallet->availableBalance());
        $this->assertSame('20.00', (string) $wallet->balance);
        $this->assertSame(\App\Enums\WalletTransactionStatus::Released, $hold->fresh()->status);
    }
}
