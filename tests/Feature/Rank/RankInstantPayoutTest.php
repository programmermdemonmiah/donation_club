<?php

namespace Tests\Feature\Rank;

use App\Enums\WalletTransactionType;
use App\Models\Deposit;
use App\Models\Rank;
use App\Models\User;
use App\Models\UserRank;
use App\Models\WalletTransaction;
use App\Notifications\RankUpdated;
use App\Services\Rank\RankService;
use App\Services\Referral\ReferralService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RankInstantPayoutTest extends TestCase
{
    use RefreshDatabase;

    private RankService $service;

    protected function setUp(): void
    {
        parent::setUp();
        Notification::fake();
        $this->service = app(RankService::class);
    }

    public function test_each_filled_rank_is_awarded_and_paid_immediately(): void
    {
        $member = $this->createUser();
        $this->fillHands($member, '100.00');

        $this->assertTrue($this->service->promoteIfEligible($member));

        $this->assertSame('Silver', $this->service->currentRank($member->refresh())?->name);
        $this->assertSame(1, UserRank::query()->where('user_id', $member->id)->count());
        $this->assertSame('60.00', (string) WalletTransaction::query()
            ->where('user_id', $member->id)
            ->where('type', WalletTransactionType::RankIncentive->value)
            ->sum('amount'));
        $this->assertSame('60.00', (string) $member->wallet()->first()->balance);
        $this->assertSame(2, $member->rankHistories()->count());
        Notification::assertSentTo($member, RankUpdated::class);
    }

    public function test_rank_incentive_is_not_paid_twice_for_the_same_rank(): void
    {
        $member = $this->createUser();
        $this->fillHands($member, '100.00');

        $this->assertTrue($this->service->promoteIfEligible($member));
        $this->assertFalse($this->service->promoteIfEligible($member));

        $this->assertSame(1, WalletTransaction::query()
            ->where('user_id', $member->id)
            ->where('type', WalletTransactionType::RankIncentive->value)
            ->where('reference_id', Rank::query()->where('slug', 'bronze')->value('id'))
            ->count());
        $this->assertSame('60.00', (string) WalletTransaction::query()
            ->where('user_id', $member->id)
            ->where('type', WalletTransactionType::RankIncentive->value)
            ->sum('amount'));
    }

    public function test_completed_deposit_promotes_upline_on_the_spot(): void
    {
        $sponsor = $this->createUser();
        $member = $this->createUser();
        ReferralService::attachReferrer($member, $sponsor);

        $this->createCompletedDeposit($member, '10.00');

        $this->assertSame('Bronze', $this->service->currentRank($sponsor->refresh())?->name);
        $this->assertSame('10.00', (string) WalletTransaction::query()
            ->where('user_id', $sponsor->id)
            ->where('type', WalletTransactionType::RankIncentive->value)
            ->sum('amount'));
    }

    public function test_rank_page_shows_current_rank_after_requirements_are_met(): void
    {
        $member = $this->createUser();
        $this->fillHands($member, '100.00');

        $this->actingAs($member)
            ->get('/rank')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('currentRank.name', 'Silver')
                ->has('history', 2)
            );
    }

    private function fillHands(User $member, string $amount): void
    {
        foreach (range(1, 3) as $_) {
            $hand = $this->createUser(['referred_by' => $member->id]);
            ReferralService::attachReferrer($hand, $member);
            Deposit::query()->create([
                'reference' => 'DEP-'.strtoupper(uniqid()),
                'user_id' => $hand->id,
                'amount' => $amount,
                'status' => 'completed',
                'completed_at' => now(),
            ]);
        }
    }
}
