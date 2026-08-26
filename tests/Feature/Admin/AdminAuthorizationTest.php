<?php

namespace Tests\Feature\Admin;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_access_admin(): void
    {
        $this->get('/admin')->assertRedirect(route('login'));
    }

    public function test_regular_members_cannot_access_admin(): void
    {
        $user = $this->createUser();

        $this->actingAs($user)
            ->get('/admin')
            ->assertForbidden();
    }

    public function test_admin_can_access_admin_dashboard(): void
    {
        $admin = $this->createUser(['is_admin' => true]);

        $this->actingAs($admin)
            ->get('/admin')
            ->assertOk();
    }

    public function test_admin_can_block_and_activate_users(): void
    {
        $admin = $this->createUser(['is_admin' => true]);
        $member = $this->createUser();

        $this->actingAs($admin)->post(route('admin.users.block', $member))->assertRedirect();

        $this->assertSame('blocked', $member->fresh()->status->value);
        $this->assertDatabaseHas('audit_logs', ['action' => 'user.blocked']);

        // blocked member cannot log in
        $this->post('/logout');

        $response = $this->from('/login')->post('/login', [
            'email' => $member->email,
            'password' => 'password',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();

        // reactivate
        $this->actingAs($admin)->post(route('admin.users.activate', $member))->assertRedirect();
        $this->assertSame('active', $member->fresh()->status->value);
    }

    public function test_financial_settings_changes_are_audited(): void
    {
        $admin = $this->createUser(['is_admin' => true]);

        $this->actingAs($admin)->get(route('admin.settings.edit'))->assertOk();

        $payload = [
            'deposit_min_amount' => '2.00',
            'deposit_max_amount' => '20.00',
            'deposit_required_sequence_gap' => 30,
            'deposit_max_per_account_cycle' => 2,
            'withdrawal_enabled' => '1',
            'withdrawal_min_amount' => '10.00',
            'withdrawal_max_amount' => '5000.00',
            'withdrawal_fee_percent' => '2.00',
            'return_min_direct_referrals' => 3,
            'return_deposit_requirement' => '0',
            'return_sequence_requirement' => 0,
        ];

        $this->actingAs($admin)->put(route('admin.settings.update'), $payload)->assertRedirect();

        app(\App\Services\Settings\SettingsService::class)->flush();

        $settings = app(\App\Services\Settings\SettingsService::class);

        $this->assertSame('2.00', $settings->minDeposit());
        $this->assertSame('20.00', $settings->maxDeposit());
        $this->assertSame(30, $settings->requiredSequenceGap());
        $this->assertSame(2, (int) ($settings->get('deposit.max_per_account_cycle')));

        $this->assertDatabaseHas('audit_logs', ['action' => 'settings.updated']);
        $this->assertSame(1, AuditLog::where('action', 'settings.updated')->count());
    }

    public function test_regular_member_cannot_verify_payments(): void
    {
        $member = $this->createUser();
        $target = $this->createUser();

        [$deposit] = app(\App\Services\Deposit\DepositService::class)->initiate($target, '5.00');

        $this->actingAs($member)
            ->post(route('admin.deposits.verify-payment', $deposit), ['payment_id' => 9999999, 'decision' => 'approve'])
            ->assertForbidden();
    }
}
