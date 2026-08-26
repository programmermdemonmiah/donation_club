<?php

namespace Tests\Feature\Return;

use App\Models\MemberReturn;
use App\Models\Rank;
use App\Models\RankRequirement;
use App\Services\Referral\ReferralService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReturnServiceTest extends TestCase
{
    use RefreshDatabase;

    private \App\Services\Return\ReturnService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(\App\Services\Return\ReturnService::class);
        $this->enableModule();
    }

    private function enableModule(): void
    {
        \App\Models\ReturnRule::query()->update([
            'enabled' => true,
            'return_percent' => '150.000',
            'minimum_direct_referrals' => 2,
            'deposit_requirement' => '0',
        ]);

        // generation commissions ride on completed returns
        app(\App\Services\Settings\SettingsService::class)->set('commission.enabled', true, group: 'business');
    }

    public function test_return_record_created_when_deposit_completes(): void
    {
        $user = $this->createUser();
        $deposit = $this->createCompletedDeposit($user, '10.00');

        $return = MemberReturn::where('deposit_id', $deposit->id)->sole();

        $this->assertSame('pending', $return->status->value);
        $this->assertSame('15.00', (string) $return->payout_amount); // 150% of 10
    }

    public function test_eligibility_requires_minimum_direct_referrals(): void
    {
        $user = $this->createUser();

        // one direct referral — short of the required two
        $child = $this->createUser(['referred_by' => $user->id]);
        ReferralService::attachReferrer($child, $user);

        $evaluation = app(\App\Services\Return\EligibilityService::class)->evaluate($user);

        $this->assertFalse($evaluation['eligible']);
        $this->assertArrayHasKey('direct_referrals', $evaluation['failed']);

        // second referral satisfies it
        $child2 = $this->createUser(['referred_by' => $user->id]);
        ReferralService::attachReferrer($child2, $user);

        $evaluation = app(\App\Services\Return\EligibilityService::class)->evaluate($user);
        $this->assertTrue($evaluation['eligible']);
    }

    public function test_mark_eligible_promotes_pending_returns(): void
    {
        $user = $this->createUser();
        for ($i = 0; $i < 2; $i++) {
            $child = $this->createUser(['referred_by' => $user->id]);
            ReferralService::attachReferrer($child, $user);
        }

        $deposit = $this->createCompletedDeposit($user, '10.00');
        $pending = MemberReturn::where('deposit_id', $deposit->id)->sole();

        $count = $this->service->markEligible();

        $this->assertSame(1, $count);
        $this->assertSame('eligible', $pending->fresh()->status->value);
    }

    public function test_full_lifecycle_approve_process_complete_credits_wallet(): void
    {
        $admin = $this->createUser(['is_admin' => true]);
        $user = $this->createUser();
        $deposit = $this->createCompletedDeposit($user, '10.00');

        $return = MemberReturn::where('deposit_id', $deposit->id)->sole();

        $this->service->approve($return, $admin);
        $this->service->startProcessing($return->fresh(), $admin);
        $completed = $this->service->complete($return->fresh(), $admin);

        $this->assertSame('completed', $completed->status->value);
        $this->assertSame('15.00', (string) $user->wallet()->first()->balance);

        // ledger entry exists
        $payoutTx = $user->walletTransactions()->where('type', 'return_payout')->sole();
        $this->assertSame('15.00', (string) $payoutTx->amount);
    }

    public function test_reversal_debits_wallet_and_reverses_commissions(): void
    {
        $admin = $this->createUser(['is_admin' => true]);

        // chain of 3: users[0] <- users[1] <- users[2] (leaf)
        // leaf's gen-2 upline (users[0]) receives a 2% generation commission on payout.
        [$a, $b, $leaf] = $this->buildChain(3);

        $deposit = $this->createCompletedDeposit($leaf, '10.00');
        $return = MemberReturn::where('deposit_id', $deposit->id)->sole();

        $this->service->approve($return, $admin);
        $completed = $this->service->complete($return->fresh(), $admin);

        $this->assertSame('15.00', (string) $leaf->wallet()->first()->balance);
        $commission = $a->commissions()->sole();
        $this->assertSame('0.30', (string) $commission->amount); // 2% of 15.00
        $this->assertSame('0.30', (string) $a->wallet()->first()->balance);

        $reversed = $this->service->reverse($return->fresh(), $admin, 'erroneous payout');

        $this->assertSame('reversed', $reversed->status->value);
        $this->assertSame('0.00', (string) $leaf->wallet()->first()->balance);
        $this->assertSame('0.00', (string) $a->wallet()->first()->balance); // commission debited back

        // commissions tied to this return were marked reversed (never deleted)
        $this->assertSame(1, $a->commissions()->where('status', 'reversed')->count());
    }

    public function test_disabled_module_blocks_eligibility(): void
    {
        \App\Models\ReturnRule::query()->update(['enabled' => false]);

        $user = $this->createUser();

        $evaluation = app(\App\Services\Return\EligibilityService::class)->evaluate($user);

        $this->assertFalse($evaluation['eligible']);
        $this->assertArrayHasKey('module', $evaluation['failed']);
    }
}
