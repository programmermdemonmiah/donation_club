<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRankStatus;
use App\Enums\WalletTransactionStatus;
use App\Enums\WalletTransactionType;
use App\Models\Rank;
use App\Models\RankHistory;
use App\Models\User;
use App\Models\UserRank;
use App\Models\WalletTransaction;
use App\Services\Wallet\WalletService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminRanksIndexTest extends TestCase
{
    use RefreshDatabase;

    public function test_ranks_index_shows_lifetime_achievers_and_recorded_incentive_paid(): void
    {
        $admin = $this->createUser(['is_admin' => true]);
        $firstMember = $this->createUser();
        $secondMember = $this->createUser();
        $excludedMember = $this->createUser();

        $bronze = Rank::query()->where('slug', 'bronze')->firstOrFail();
        $silver = Rank::query()->where('slug', 'silver')->firstOrFail();

        $this->recordAchievement($firstMember, $bronze);
        $this->recordAchievement($firstMember, $silver, $bronze);
        $this->recordAchievement($secondMember, $bronze);
        $this->recordAchievement($excludedMember, $bronze);

        WalletService::credit($firstMember, '10.00', WalletTransactionType::RankIncentive, $bronze, 'Incentive for achieving Bronze rank');
        WalletService::credit($firstMember, '50.00', WalletTransactionType::RankIncentive, $silver, 'Incentive for achieving Silver rank');
        WalletService::credit($secondMember, '10.00', WalletTransactionType::RankIncentive, $bronze, 'Incentive for achieving Bronze rank');
        WalletService::credit($excludedMember, '10.00', WalletTransactionType::RankIncentive, $bronze, 'Incentive for achieving Bronze rank');
        WalletTransaction::query()->where('user_id', $excludedMember->id)->latest('id')->first()?->forceFill([
            'status' => WalletTransactionStatus::Reversed->value,
        ])->save();
        WalletService::credit($excludedMember, '25.00', WalletTransactionType::MonthlySalary, $bronze, 'Monthly salary for holding Bronze rank');
        WalletService::credit($excludedMember, '5.00', WalletTransactionType::Commission, null, 'Generation 1 commission');

        $bronze->update(['incentive_amount' => '25.00']);

        $this->actingAs($admin)
            ->get('/admin/ranks')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('ranks.0.slug', 'bronze')
                ->where('ranks.0.incentive_amount', '25.00')
                ->where('ranks.0.holders', 2)
                ->where('ranks.0.lifetime_achievers', 3)
                ->where('ranks.0.incentive_paid', '20.00')
                ->where('ranks.1.slug', 'silver')
                ->where('ranks.1.holders', 1)
                ->where('ranks.1.lifetime_achievers', 1)
                ->where('ranks.1.incentive_paid', '50.00')
                ->where('ranks.2.slug', 'gold')
                ->where('ranks.2.holders', 0)
                ->where('ranks.2.lifetime_achievers', 0)
                ->where('ranks.2.incentive_paid', '0.00')
            );
    }

    private function recordAchievement(User $user, Rank $rank, ?Rank $previous = null): void
    {
        UserRank::query()->where('user_id', $user->id)->delete();

        UserRank::query()->create([
            'user_id' => $user->id,
            'rank_id' => $rank->id,
            'status' => UserRankStatus::Active,
            'achieved_at' => now(),
        ]);

        RankHistory::query()->create([
            'user_id' => $user->id,
            'old_rank_id' => $previous?->id,
            'new_rank_id' => $rank->id,
            'reason' => 'Automated requirement evaluation',
        ]);
    }
}
