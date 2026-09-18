<?php

namespace Tests\Feature\Admin;

use App\Enums\WalletTransactionStatus;
use App\Enums\WalletTransactionType;
use App\Models\Rank;
use App\Models\WalletTransaction;
use App\Services\Wallet\WalletService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminDashboardRankIncentiveTest extends TestCase
{
    use RefreshDatabase;

    public function test_total_rank_incentive_counts_completed_rank_credits_and_users(): void
    {
        $admin = $this->createUser(['is_admin' => true]);
        $firstMember = $this->createUser();
        $secondMember = $this->createUser();
        $excludedMember = $this->createUser();

        $bronze = Rank::query()->where('slug', 'bronze')->firstOrFail();
        $silver = Rank::query()->where('slug', 'silver')->firstOrFail();

        WalletService::credit($firstMember, '10.00', WalletTransactionType::RankIncentive, $bronze, 'Incentive for achieving Bronze rank');
        WalletService::credit($firstMember, '50.00', WalletTransactionType::RankIncentive, $silver, 'Incentive for achieving Silver rank');
        WalletService::credit($secondMember, '10.00', WalletTransactionType::RankIncentive, $bronze, 'Incentive for achieving Bronze rank');
        WalletService::credit($excludedMember, '10.00', WalletTransactionType::RankIncentive, $bronze, 'Incentive for achieving Bronze rank');
        WalletTransaction::query()->where('user_id', $excludedMember->id)->latest('id')->first()?->forceFill([
            'status' => WalletTransactionStatus::Reversed->value,
        ])->save();
        WalletService::credit($excludedMember, '25.00', WalletTransactionType::MonthlySalary, $bronze, 'Monthly salary for holding Bronze rank');
        WalletService::credit($excludedMember, '5.00', WalletTransactionType::Commission, null, 'Generation 1 commission');

        $this->actingAs($admin)
            ->get('/admin')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('stats.rank_incentives.total', '70.00')
                ->where('stats.rank_incentives.users', 2)
            );
    }
}
