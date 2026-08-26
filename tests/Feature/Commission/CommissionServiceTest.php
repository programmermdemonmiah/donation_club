<?php

namespace Tests\Feature\Commission;

use App\Events\DepositCompleted;
use App\Models\CommissionRule;
use App\Services\Settings\SettingsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommissionServiceTest extends TestCase
{
    use RefreshDatabase;

    private SettingsService $settings;

    protected function setUp(): void
    {
        parent::setUp();

        $this->settings = app(SettingsService::class);
        $this->settings->set('commission.enabled', true, group: 'business');
    }

    public function test_direct_commission_credited_on_referred_member_deposit(): void
    {
        $referrer = $this->createUser();
        $member = $this->createUser(['referred_by' => $referrer->id]);
        \App\Services\Referral\ReferralService::attachReferrer($member, $referrer);

        $deposit = $this->createCompletedDeposit($member, '10.00');
        DepositCompleted::dispatch($deposit, $deposit->payments()->first());

        $commission = $referrer->commissions()->sole();

        $this->assertSame('0.50', (string) $commission->amount); // 5% of 10.00
        $this->assertSame('1', (string) $commission->generation);
        $this->assertSame('completed', $commission->status->value);
        $this->assertSame('0.50', (string) $referrer->wallet()->first()->balance);

        // ledger entry exists and matches
        $ledger = $referrer->walletTransactions()->where('type', 'commission')->sole();
        $this->assertSame('0.50', (string) $ledger->amount);
    }

    public function test_direct_commission_not_paid_when_module_disabled(): void
    {
        $this->settings->set('commission.enabled', false, group: 'business');

        $referrer = $this->createUser();
        $member = $this->createUser(['referred_by' => $referrer->id]);
        \App\Services\Referral\ReferralService::attachReferrer($member, $referrer);

        $deposit = $this->createCompletedDeposit($member, '10.00');
        DepositCompleted::dispatch($deposit, $deposit->payments()->first());

        $this->assertSame(0, $referrer->commissions()->count());
    }

    public function test_return_completion_pays_generation_commissions_up_the_chain(): void
    {
        // Chain: root <- g2 <- g3 ... leaf. Leaf completes a return.
        $users = $this->buildChain(4); // users[0..3], each referred by the previous
        $leaf = end($users);

        $deposit = $this->createCompletedDeposit($leaf, '10.00');

        // Create a completed return for the leaf.
        $return = \App\Models\MemberReturn::create([
            'reference' => 'RTN-TEST0001',
            'user_id' => $leaf->id,
            'deposit_id' => $deposit->id,
            'base_amount' => '10.00',
            'rate' => '100.000',
            'payout_amount' => '10.00',
            'status' => \App\Enums\ReturnStatus::Processing,
        ]);

        app(\App\Services\Return\ReturnService::class)->complete($return, $this->createUser(['is_admin' => true]));

        // leaf receives payout
        $this->assertSame('10.00', (string) $leaf->wallet()->first()->balance);

        // users[2] is generation 1 — only the deposit-triggered direct rule (5%)
        // exists for gen 1; return-triggered rules start at generation 2.
        $directOnDeposit = $users[2]->commissions()->sole();
        $this->assertSame('0.50', (string) $directOnDeposit->amount);
        $this->assertSame('0.50', (string) $users[2]->wallet()->first()->balance);

        // gen2 = users[1]: rule gen 2 @ 2% of payout
        $gen2 = $users[1]->commissions()->sole();
        $this->assertSame('0.20', (string) $gen2->amount);
        $this->assertEquals(2, $gen2->generation);
        $this->assertSame('0.20', (string) $users[1]->wallet()->first()->balance);

        // gen3 = users[0]: rule gen 3 @ 1%
        $gen3 = $users[0]->commissions()->sole();
        $this->assertSame('0.10', (string) $gen3->amount);
        $this->assertEquals(3, $gen3->generation);
    }

    public function test_commission_is_never_paid_twice_for_same_source(): void
    {
        $referrer = $this->createUser();
        $member = $this->createUser(['referred_by' => $referrer->id]);
        \App\Services\Referral\ReferralService::attachReferrer($member, $referrer);

        $deposit = $this->createCompletedDeposit($member, '10.00');
        $event = new DepositCompleted($deposit, $deposit->payments()->first());

        app(\App\Services\Commission\CommissionService::class)->handleDepositCompleted($event->deposit);
        app(\App\Services\Commission\CommissionService::class)->handleDepositCompleted($event->deposit);

        $this->assertSame(1, $referrer->commissions()->count());
        $this->assertSame('0.50', (string) $referrer->wallet()->first()->balance);
    }
}
