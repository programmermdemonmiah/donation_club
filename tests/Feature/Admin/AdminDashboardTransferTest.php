<?php

namespace Tests\Feature\Admin;

use App\Enums\WalletTransactionType;
use App\Services\Wallet\WalletService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminDashboardTransferTest extends TestCase
{
    use RefreshDatabase;

    public function test_total_dollar_transfer_counts_only_completed_admin_credits_to_members(): void
    {
        $admin = $this->createUser(['is_admin' => true]);
        $firstMember = $this->createUser();
        $secondMember = $this->createUser();

        WalletService::credit($firstMember, '25.00', WalletTransactionType::Adjustment, null, 'Admin adjustment: bonus');
        WalletService::credit($firstMember, '10.00', WalletTransactionType::Adjustment, null, 'Admin adjustment: second');
        WalletService::credit($secondMember, '5.00', WalletTransactionType::Adjustment, null, 'Admin adjustment: other');
        WalletService::debit($firstMember, '3.00', WalletTransactionType::Adjustment, null, 'Admin adjustment: take back');
        WalletService::credit($firstMember, '7.00', WalletTransactionType::Adjustment, null, 'Transfer from someone');

        $this->actingAs($admin)
            ->get('/admin')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('stats.transfers.total', '40.00')
                ->where('stats.transfers.users', 2)
            );
    }
}
