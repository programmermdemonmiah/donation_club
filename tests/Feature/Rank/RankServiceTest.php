<?php

namespace Tests\Feature\Rank;

use App\Enums\UserStatus;
use App\Models\Deposit;
use App\Models\Rank;
use App\Models\User;
use App\Models\UserRank;
use App\Services\Rank\RankService;
use App\Services\Referral\ReferralService;
use App\Support\Money;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class RankServiceTest extends TestCase
{
    use RefreshDatabase;

    private RankService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(RankService::class);
    }

    public function test_member_with_enough_direct_referrals_achieves_silver(): void
    {
        $user = $this->createUser();

        for ($i = 0; $i < 5; $i++) {
            $child = $this->createUser(['referred_by' => $user->id]);
            ReferralService::attachReferrer($child, $user);
        }

        $promoted = $this->service->promoteIfEligible($user);

        $this->assertTrue($promoted);

        $current = UserRank::where('user_id', $user->id)->where('status', 'active')->first();

        $this->assertSame('Silver', Rank::find($current->rank_id)->name);
        $this->assertDatabaseHas('rank_histories', [
            'user_id' => $user->id,
            'new_rank_id' => $current->rank_id,
        ]);
    }

    public function test_promotion_does_not_demote_or_duplicate(): void
    {
        $user = $this->createUser();

        for ($i = 0; $i < 5; $i++) {
            $child = $this->createUser(['referred_by' => $user->id]);
            ReferralService::attachReferrer($child, $user);
        }

        $this->assertTrue($this->service->promoteIfEligible($user));
        $activeCountBefore = UserRank::where('user_id', $user->id)->where('status', 'active')->count();

        // re-run — should be a no-op
        $this->assertFalse($this->service->promoteIfEligible($user));

        $this->assertSame(1, $activeCountBefore);
        $this->assertSame(1, UserRank::where('user_id', $user->id)->count());
    }

    public function test_higher_rank_requires_team_size_too(): void
    {
        $user = $this->createUser();

        for ($i = 0; $i < 5; $i++) {
            $child = $this->createUser(['referred_by' => $user->id]);
            ReferralService::attachReferrer($child, $user);
        }

        $this->service->promoteIfEligible($user);

        // Gold needs 10 direct + 25 team — not met with 5 members.
        $target = $this->service->evaluateTarget($user);

        $this->assertSame('Silver', $target->name);
    }

    public function test_each_hand_totals_that_referral_and_their_whole_team(): void
    {
        $member = $this->createUser();
        $firstHand = $this->attachDirectReferral($member);
        $secondHand = $this->attachDirectReferral($member);
        $thirdHand = $this->attachDirectReferral($member);
        $underFirst = $this->attachDirectReferral($firstHand);
        $underFirstAgain = $this->attachDirectReferral($underFirst);
        $deepUnderFirst = $this->attachDirectReferral($underFirstAgain);
        $underSecond = $this->attachDirectReferral($secondHand);

        $this->recordDeposit($firstHand, '10.00');
        $this->recordDeposit($underFirst, '40.00');
        $this->recordDeposit($underFirstAgain, '50.00');
        $this->recordDeposit($deepUnderFirst, '7.00');
        $this->recordDeposit($secondHand, '15.00');
        $this->recordDeposit($underSecond, '25.00');
        $this->recordDeposit($thirdHand, '20.00');
        $this->recordDeposit($firstHand, '99.00', 'pending');

        $metrics = $this->service->metrics($member);

        $this->assertSame('107.00', $metrics['gen1_volume']);
        $this->assertSame('40.00', $metrics['gen2_volume']);
        $this->assertSame('20.00', $metrics['gen3_volume']);
        $this->assertSame('0.00', ReferralService::handVolume($member, 4));
        $this->assertSame('167.00', Money::parse($metrics['team_volume']));
    }

    public function test_blocked_users_are_skipped_in_batch_evaluation(): void
    {
        $blocked = $this->createUser(['status' => UserStatus::Blocked]);

        for ($i = 0; $i < 5; $i++) {
            $child = $this->createUser(['referred_by' => $blocked->id]);
            // attach relationship rows directly (attachReferrer rejects blocked referrers by design)
            DB::table('referral_relationships')->insert([
                'user_id' => $child->id,
                'referrer_id' => $blocked->id,
                'depth' => 1,
                'ancestor_path' => "/{$blocked->id}/",
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->service->evaluateAll();

        $this->assertSame(0, UserRank::where('user_id', $blocked->id)->count());
    }

    private function attachDirectReferral(User $referrer): User
    {
        $referral = $this->createUser(['referred_by' => $referrer->id]);
        ReferralService::attachReferrer($referral, $referrer);

        return $referral;
    }

    private function recordDeposit(User $user, string $amount, string $status = 'completed'): void
    {
        Deposit::query()->create([
            'reference' => 'DEP-'.strtoupper(uniqid()),
            'user_id' => $user->id,
            'amount' => $amount,
            'status' => $status,
            'completed_at' => $status === 'completed' ? now() : null,
        ]);
    }
}
