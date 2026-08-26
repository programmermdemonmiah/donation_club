<?php

namespace Tests\Feature\Rank;

use App\Models\Rank;
use App\Models\RankRequirement;
use App\Services\Referral\ReferralService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RankServiceTest extends TestCase
{
    use RefreshDatabase;

    private \App\Services\Rank\RankService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(\App\Services\Rank\RankService::class);
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

        $current = \App\Models\UserRank::where('user_id', $user->id)->where('status', 'active')->first();

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
        $activeCountBefore = \App\Models\UserRank::where('user_id', $user->id)->where('status', 'active')->count();

        // re-run — should be a no-op
        $this->assertFalse($this->service->promoteIfEligible($user));

        $this->assertSame(1, $activeCountBefore);
        $this->assertSame(1, \App\Models\UserRank::where('user_id', $user->id)->count());
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

    public function test_blocked_users_are_skipped_in_batch_evaluation(): void
    {
        $blocked = $this->createUser(['status' => \App\Enums\UserStatus::Blocked]);

        for ($i = 0; $i < 5; $i++) {
            $child = $this->createUser(['referred_by' => $blocked->id]);
            // attach relationship rows directly (attachReferrer rejects blocked referrers by design)
            \Illuminate\Support\Facades\DB::table('referral_relationships')->insert([
                'user_id' => $child->id,
                'referrer_id' => $blocked->id,
                'depth' => 1,
                'ancestor_path' => "/{$blocked->id}/",
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->service->evaluateAll();

        $this->assertSame(0, \App\Models\UserRank::where('user_id', $blocked->id)->count());
    }
}
