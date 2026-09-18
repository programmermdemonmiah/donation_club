<?php

namespace Tests\Feature\Referral;

use App\Models\Deposit;
use App\Models\Rank;
use App\Models\RankRequirement;
use App\Models\User;
use App\Services\Referral\ReferralService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ReferralHandsTableTest extends TestCase
{
    use RefreshDatabase;

    public function test_referrals_page_lists_the_first_three_direct_usernames_as_hands(): void
    {
        $member = $this->createUser(['username' => 'sponsor1']);
        $this->attachDirectReferral($member, 'handone');
        $this->attachDirectReferral($member, 'handtwo');
        $this->attachDirectReferral($member, 'handthree');
        $this->attachDirectReferral($member, 'handfour');

        $this->actingAs($member)
            ->get('/referrals')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('hands.0.username', 'handone')
                ->where('hands.1.username', 'handtwo')
                ->where('hands.2.username', 'handthree')
                ->has('referralCode')
                ->has('directReferrals.data', 4)
                ->missing('tree')
            );
    }

    public function test_referrals_page_shows_cycle_hand_volume_matching_rank_progress(): void
    {
        $member = $this->createUser(['username' => 'sponsor2']);
        $this->setHandRequirements('bronze', '100.00');

        $first = $this->attachDirectReferral($member, 'alpha');
        $underFirst = $this->attachDirectReferral($first, 'alphateam');
        $second = $this->attachDirectReferral($member, 'bravo');
        $this->attachDirectReferral($member, 'charlie');

        $this->recordDeposit($first, '40.00');
        $this->recordDeposit($underFirst, '110.00');
        $this->recordDeposit($second, '20.00');

        $this->actingAs($member)
            ->get('/referrals')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('hands.0.username', 'alpha')
                ->where('handRanks.0.name', 'Bronze')
                ->where('handRanks.0.hands.0.actual', '100.00')
                ->where('handRanks.0.hands.0.value', '100.00')
                ->where('handRanks.0.hands.0.met', true)
                ->where('handRanks.0.hands.1.actual', '20.00')
                ->where('handRanks.0.hands.1.met', false)
                ->where('handRanks.0.hands.2.actual', '0.00')
                ->where('handRanks.1.name', 'Silver')
                ->where('handRanks.1.hands.0.actual', '50.00')
                ->where('handRanks.1.hands.0.value', '100.00')
                ->where('handRanks.1.hands.0.met', false)
                ->where('handRanks.2.name', 'Gold')
                ->where('handRanks.2.hands.0.actual', '0.00')
                ->where('handRanks.2.hands.0.value', '500.00')
                ->where('handRanks.2.hands.0.met', false)
            );
    }

    public function test_referrals_page_uses_updated_admin_hand_requirements(): void
    {
        $member = $this->createUser();
        $this->setHandRequirements('bronze', '200.00');
        $first = $this->attachDirectReferral($member, 'solo');
        $this->recordDeposit($first, '150.00');

        $this->actingAs($member)
            ->get('/referrals')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('handRanks.0.name', 'Bronze')
                ->where('handRanks.0.hands.0.actual', '150.00')
                ->where('handRanks.0.hands.0.value', '200.00')
                ->where('handRanks.0.hands.0.met', false)
                ->where('handRanks.1.name', 'Silver')
                ->where('handRanks.1.hands.0.actual', '0.00')
            );
    }

    private function attachDirectReferral(User $referrer, string $username): User
    {
        $referral = $this->createUser([
            'username' => $username,
            'referred_by' => $referrer->id,
        ]);
        ReferralService::attachReferrer($referral, $referrer);

        return $referral;
    }

    private function recordDeposit(User $user, string $amount): void
    {
        Deposit::query()->create([
            'reference' => 'DEP-'.strtoupper(uniqid()),
            'user_id' => $user->id,
            'amount' => $amount,
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }

    private function setHandRequirements(string $slug, string $amount): void
    {
        $rank = Rank::query()->where('slug', $slug)->firstOrFail();

        foreach ([
            RankRequirement::GEN1_VOLUME,
            RankRequirement::GEN2_VOLUME,
            RankRequirement::GEN3_VOLUME,
        ] as $key) {
            $rank->requirements()->updateOrCreate(
                ['key' => $key],
                ['value' => $amount],
            );
        }
    }
}
