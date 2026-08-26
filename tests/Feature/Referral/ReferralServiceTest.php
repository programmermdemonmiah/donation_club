<?php

namespace Tests\Feature\Referral;

use App\Models\User;
use App\Services\Referral\ReferralService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use InvalidArgumentException;
use Tests\TestCase;

class ReferralServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_with_valid_referral_code_links_users(): void
    {
        $referrer = $this->createUser();

        $response = $this->post('/register', [
            'name' => 'New Member',
            'email' => 'new@test.local',
            'password' => 'Sup3r-Secret!',
            'password_confirmation' => 'Sup3r-Secret!',
            'referral_code' => $referrer->referral_code,
        ]);

        $response->assertRedirect(route('verification.notice'));

        $member = User::where('email', 'new@test.local')->firstOrFail();

        $this->assertSame($referrer->id, $member->referred_by);
        $this->assertDatabaseHas('referral_relationships', [
            'user_id' => $member->id,
            'referrer_id' => $referrer->id,
        ]);
    }

    public function test_invalid_referral_code_is_rejected(): void
    {
        $response = $this->from('/register')->post('/register', [
            'name' => 'New Member',
            'email' => 'invalid-ref@test.local',
            'password' => 'Sup3r-Secret!',
            'password_confirmation' => 'Sup3r-Secret!',
            'referral_code' => 'NOPE1234',
        ]);

        $response->assertSessionHasErrors('referral_code');
        $this->assertGuest();
    }

    public function test_self_referral_cannot_be_created(): void
    {
        $this->expectException(InvalidArgumentException::class);

        ReferralService::attachReferrer($referrer = $this->createUser(), $referrer);
    }

    public function test_circular_referral_is_prevented(): void
    {
        [$a, $b] = $this->buildChain(2); // A <- B (B under A)

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('circular');

        // Making A a child of B would create A -> B -> A cycle.
        ReferralService::attachReferrer($a, $b);
    }

    public function test_upline_walks_ten_generations_in_order(): void
    {
        $users = $this->buildChain(12); // 12 members chained
        $leaf = end($users);

        $upline = ReferralService::upline($leaf, ReferralService::MAX_GENERATIONS);

        $this->assertCount(10, $upline);
        $this->assertEquals($users[10]->id, $upline[0]['user']->id); // direct referrer first
        $this->assertEquals(1, $upline[0]['generation']);
        $this->assertEquals($users[1]->id, $upline[9]['user']->id); // 10th generation
        $this->assertEquals(10, $upline[9]['generation']);
    }

    public function test_team_size_and_generation_members(): void
    {
        $root = $this->createUser();
        $direct = $this->createUser(['referred_by' => $root->id]);
        ReferralService::attachReferrer($direct, $root);

        $secondGen = $this->createUser(['referred_by' => $direct->id]);
        ReferralService::attachReferrer($secondGen, $direct);

        $this->assertSame(2, ReferralService::teamSize($root));
        $this->assertSame(1, ReferralService::generationMembers($root, 1)->count());
        $this->assertSame(1, ReferralService::generationMembers($root, 2)->count());
        $this->assertTrue(ReferralService::isDescendant($secondGen->id, $root->id));
        $this->assertFalse(ReferralService::isDescendant($root->id, $secondGen->id));
    }
}
