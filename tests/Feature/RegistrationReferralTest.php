<?php

namespace Tests\Feature;

use App\Enums\UserStatus;
use App\Models\Pin;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationReferralTest extends TestCase
{
    use RefreshDatabase;

    public function test_blocked_referrer_returns_validation_error_instead_of_500(): void
    {
        $referrer = $this->createUser([
            'username' => 'kaysar4',
            'status' => UserStatus::Blocked,
        ]);

        Pin::query()->create([
            'pin_code' => '123456',
            'is_used' => false,
        ]);

        $response = $this->from('/register')->post('/register', $this->payload($referrer->referral_code));

        $response->assertRedirect('/register');
        $response->assertSessionHasErrors('referral_code');
        $this->assertGuest();
        $this->assertDatabaseMissing('users', ['username' => 'newmember1']);
    }

    public function test_active_referrer_registers_the_new_member(): void
    {
        $referrer = $this->createUser([
            'username' => 'kaysar4active',
            'status' => UserStatus::Active,
        ]);

        Pin::query()->create([
            'pin_code' => '123456',
            'is_used' => false,
        ]);

        $this->post('/register', $this->payload($referrer->referral_code))
            ->assertRedirect(route('dashboard'));

        $member = User::query()->where('username', 'newmember1')->first();

        $this->assertNotNull($member);
        $this->assertSame($referrer->id, $member->referred_by);
        $this->assertDatabaseHas('referral_relationships', [
            'user_id' => $member->id,
            'referrer_id' => $referrer->id,
        ]);
    }

    public function test_registration_accepts_referrer_username_instead_of_code(): void
    {
        $referrer = $this->createUser([
            'username' => 'kaysar4',
            'status' => UserStatus::Active,
        ]);

        Pin::query()->create([
            'pin_code' => '123456',
            'is_used' => false,
        ]);

        $this->post('/register', $this->payload('KAYSAR4'))
            ->assertRedirect(route('dashboard'));

        $member = User::query()->where('username', 'newmember1')->first();

        $this->assertNotNull($member);
        $this->assertSame($referrer->id, $member->referred_by);
    }

    /**
     * @return array<string, string>
     */
    private function payload(string $referralCode): array
    {
        return [
            'name' => 'New Member',
            'username' => 'newmember1',
            'email' => 'new@test.local',
            'password' => 'Sup3r-Secret!',
            'password_confirmation' => 'Sup3r-Secret!',
            'referral_code' => $referralCode,
            'secret_code' => '123456',
        ];
    }
}
