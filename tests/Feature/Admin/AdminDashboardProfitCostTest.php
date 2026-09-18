<?php

namespace Tests\Feature\Admin;

use App\Enums\ReturnStatus;
use App\Models\MemberReturn;
use App\Support\ReferenceGenerator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminDashboardProfitCostTest extends TestCase
{
    use RefreshDatabase;

    public function test_total_profit_cost_counts_completed_double_return_profit_and_users(): void
    {
        $admin = $this->createUser(['is_admin' => true]);
        $firstMember = $this->createUser();
        $secondMember = $this->createUser();
        $pendingMember = $this->createUser();

        $firstDeposit = $this->createCompletedDeposit($firstMember, '10.00');
        $secondDeposit = $this->createCompletedDeposit($secondMember, '5.00');
        $pendingDeposit = $this->createCompletedDeposit($pendingMember, '8.00');

        MemberReturn::query()->create([
            'reference' => ReferenceGenerator::generate('RTN'),
            'user_id' => $firstMember->id,
            'deposit_id' => $firstDeposit->id,
            'base_amount' => '10.00',
            'rate' => '200.000',
            'payout_amount' => '20.00',
            'status' => ReturnStatus::Completed,
            'completed_at' => now(),
        ]);

        MemberReturn::query()->create([
            'reference' => ReferenceGenerator::generate('RTN'),
            'user_id' => $secondMember->id,
            'deposit_id' => $secondDeposit->id,
            'base_amount' => '5.00',
            'rate' => '200.000',
            'payout_amount' => '10.00',
            'status' => ReturnStatus::Completed,
            'completed_at' => now(),
        ]);

        MemberReturn::query()->create([
            'reference' => ReferenceGenerator::generate('RTN'),
            'user_id' => $pendingMember->id,
            'deposit_id' => $pendingDeposit->id,
            'base_amount' => '8.00',
            'rate' => '200.000',
            'payout_amount' => '16.00',
            'status' => ReturnStatus::Pending,
        ]);

        $secondCompletedForFirst = $this->createCompletedDeposit($firstMember, '4.00');
        MemberReturn::query()->create([
            'reference' => ReferenceGenerator::generate('RTN'),
            'user_id' => $firstMember->id,
            'deposit_id' => $secondCompletedForFirst->id,
            'base_amount' => '4.00',
            'rate' => '200.000',
            'payout_amount' => '8.00',
            'status' => ReturnStatus::Completed,
            'completed_at' => now(),
        ]);

        $reversedDeposit = $this->createCompletedDeposit($pendingMember, '9.00');
        MemberReturn::query()->create([
            'reference' => ReferenceGenerator::generate('RTN'),
            'user_id' => $pendingMember->id,
            'deposit_id' => $reversedDeposit->id,
            'base_amount' => '9.00',
            'rate' => '200.000',
            'payout_amount' => '18.00',
            'status' => ReturnStatus::Reversed,
        ]);

        $this->actingAs($admin)
            ->get('/admin')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('stats.profit.total', '19.00')
                ->where('stats.profit.users', 2)
            );
    }
}
