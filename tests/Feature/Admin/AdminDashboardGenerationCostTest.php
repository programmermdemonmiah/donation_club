<?php

namespace Tests\Feature\Admin;

use App\Enums\CommissionStatus;
use App\Models\Commission;
use App\Models\Deposit;
use App\Models\User;
use App\Support\ReferenceGenerator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminDashboardGenerationCostTest extends TestCase
{
    use RefreshDatabase;

    public function test_total_generation_cost_counts_completed_commissions_and_users(): void
    {
        $admin = $this->createUser(['is_admin' => true]);
        $firstMember = $this->createUser();
        $secondMember = $this->createUser();
        $pendingMember = $this->createUser();
        $sourceMember = $this->createUser();

        $firstDeposit = $this->createCompletedDeposit($sourceMember, '10.00');
        $secondDeposit = $this->createCompletedDeposit($sourceMember, '4.00');
        $thirdDeposit = $this->createCompletedDeposit($sourceMember, '2.00');
        $pendingDeposit = $this->createCompletedDeposit($sourceMember, '16.00');
        $reversedDeposit = $this->createCompletedDeposit($sourceMember, '8.00');

        $this->createCommission($firstMember, $sourceMember, $firstDeposit, '0.50', CommissionStatus::Completed);
        $this->createCommission($firstMember, $sourceMember, $secondDeposit, '0.20', CommissionStatus::Completed);
        $this->createCommission($secondMember, $sourceMember, $thirdDeposit, '0.10', CommissionStatus::Completed);
        $this->createCommission($pendingMember, $sourceMember, $pendingDeposit, '0.80', CommissionStatus::Pending);
        $this->createCommission($pendingMember, $sourceMember, $reversedDeposit, '0.40', CommissionStatus::Reversed);

        $this->actingAs($admin)
            ->get('/admin')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('stats.commissions.total', '0.80')
                ->where('stats.commissions.users', 2)
            );
    }

    private function createCommission(
        User $beneficiary,
        User $sourceUser,
        Deposit $source,
        string $amount,
        CommissionStatus $status,
    ): void {
        Commission::query()->create([
            'reference' => ReferenceGenerator::generate('COM'),
            'user_id' => $beneficiary->id,
            'source_user_id' => $sourceUser->id,
            'generation' => 1,
            'rate' => '5.000',
            'base_amount' => (string) $source->amount,
            'amount' => $amount,
            'source_type' => $source->getMorphClass(),
            'source_id' => $source->id,
            'status' => $status,
            'credited_at' => $status === CommissionStatus::Completed ? now() : null,
        ]);
    }
}
