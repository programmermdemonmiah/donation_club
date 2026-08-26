<?php

namespace Tests\Feature\Withdrawal;

use App\Enums\WalletTransactionType;
use App\Models\User;
use App\Services\Settings\SettingsService;
use App\Services\Wallet\WalletService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use RuntimeException;
use Tests\TestCase;

class WithdrawalServiceTest extends TestCase
{
    use RefreshDatabase;

    private \App\Services\Withdrawal\WithdrawalService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(\App\Services\Withdrawal\WithdrawalService::class);
    }

    private function fundedUser(string $balance = '100.00'): User
    {
        $user = $this->createUser();
        WalletService::credit($user, $balance, WalletTransactionType::ReturnPayout);

        return $user->fresh();
    }

    public function test_request_locks_amount_and_calculates_fee(): void
    {
        $user = $this->fundedUser();

        $withdrawal = $this->service->request($user, '50.00', 'bank', [
            'account_name' => 'John Doe',
            'account_details' => 'ACC-123',
        ]);

        // 1% fee seeded by DatabaseSeeder
        $this->assertSame('0.50', (string) $withdrawal->fee);
        $this->assertSame('49.50', (string) $withdrawal->net_amount);

        $wallet = $user->wallet()->first();
        $this->assertSame('50.00', (string) $wallet->locked_balance);
        $this->assertSame('50.00', $wallet->availableBalance()); // 100 - 50 locked

        // hold ledger entry exists
        $hold = $user->walletTransactions()->where('type', 'withdrawal_hold')->sole();
        $this->assertSame(\App\Enums\WalletTransactionStatus::Held->value, $hold->status->value);

        // balance untouched while pending
        $this->assertSame('100.00', (string) $wallet->balance);
    }

    public function test_request_rejects_insufficient_available_balance(): void
    {
        $user = $this->fundedUser('10.00');

        $this->expectException(RuntimeException::class);
        $this->service->request($user, '50.00', 'bank', ['account_details' => 'x']);
    }

    public function test_request_enforces_min_and_max(): void
    {
        app(SettingsService::class)->setMany([
            'withdrawal.min_amount' => '10.00',
            'withdrawal.max_amount' => '20.00',
        ], 'business');

        $user = $this->fundedUser();

        try {
            $this->service->request($user, '5.00', 'bank', ['account_details' => 'x']);
            $this->fail('Should reject below minimum');
        } catch (RuntimeException $e) {
            $this->assertStringContainsString('Minimum', $e->getMessage());
        }

        try {
            $this->service->request($user, '500.00', 'bank', ['account_details' => 'x']);
            $this->fail('Should reject above maximum');
        } catch (RuntimeException $e) {
            $this->assertStringContainsString('Maximum', $e->getMessage());
        }
    }

    public function test_full_lifecycle_complete(): void
    {
        $admin = $this->createUser(['is_admin' => true]);
        $user = $this->fundedUser();

        $withdrawal = $this->service->request($user, '40.00', 'bank', ['account_name' => 'J', 'account_details' => 'X']);

        $this->service->approve($withdrawal, $admin);
        $this->service->startProcessing($withdrawal->fresh(), $admin);
        $completed = $this->service->complete($withdrawal->fresh(), $admin);

        $wallet = $user->wallet()->first();

        $this->assertSame('completed', $completed->status->value);
        $this->assertSame('60.00', (string) $wallet->balance);      // real debit happened
        $this->assertSame('0.00', (string) $wallet->locked_balance); // lock released
    }

    public function test_rejection_releases_hold(): void
    {
        $admin = $this->createUser(['is_admin' => true]);
        $user = $this->fundedUser();

        $withdrawal = $this->service->request($user, '30.00', 'bank', ['account_name' => 'J', 'account_details' => 'X']);
        $this->service->reject($withdrawal->fresh(), $admin, 'Suspicious activity');

        $wallet = $user->wallet()->first();

        $this->assertSame('rejected', $withdrawal->fresh()->status->value);
        $this->assertSame('100.00', (string) $wallet->balance);   // never debited
        $this->assertSame('0.00', (string) $wallet->locked_balance);
        $this->assertSame('100.00', $wallet->availableBalance());
    }

    public function test_member_can_cancel_pending_withdrawal(): void
    {
        $user = $this->fundedUser();

        $withdrawal = $this->service->request($user, '25.00', 'bank', ['account_name' => 'J', 'account_details' => 'X']);
        $this->service->cancel($user, $withdrawal);

        $wallet = $user->wallet()->first();

        $this->assertSame('cancelled', $withdrawal->fresh()->status->value);
        $this->assertSame('0.00', (string) $wallet->locked_balance);
    }
}
