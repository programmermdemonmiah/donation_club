<?php

namespace Tests\Feature\Deposit;

use App\Models\Deposit;
use App\Models\DepositSequence;
use App\Services\Deposit\DepositEligibilityService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use RuntimeException;
use Tests\TestCase;

class DepositServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_deposit_below_minimum_is_rejected(): void
    {
        $user = $this->createUser();

        $result = app(DepositEligibilityService::class)->check($user, '0.50');

        $this->assertFalse($result['eligible']);
        $this->assertStringContainsString('minimum', strtolower($result['reason']));
    }

    public function test_deposit_above_maximum_is_rejected(): void
    {
        $user = $this->createUser();

        $result = app(DepositEligibilityService::class)->check($user, '50.00');

        $this->assertFalse($result['eligible']);
        $this->assertStringContainsString('maximum', strtolower($result['reason']));
    }

    public function test_unverified_email_blocks_deposits(): void
    {
        $unverified = \App\Models\User::factory()->unverified()->create();

        $result = app(DepositEligibilityService::class)->check($unverified, '5.00');

        $this->assertFalse($result['eligible']);
    }

    public function test_completed_deposit_receives_unique_sequence_number(): void
    {
        $depositA = $this->createCompletedDeposit($this->createUser(), '5.00');
        $depositB = $this->createCompletedDeposit($this->createUser(), '2.00');
        $depositC = $this->createCompletedDeposit($this->createUser(), '10.00');

        $numbers = [
            $depositA->sequence->sequence_number,
            $depositB->sequence->sequence_number,
            $depositC->sequence->sequence_number,
        ];

        $this->assertSame([1, 2, 3], $numbers);
        $this->assertSame(3, DepositSequence::count());
    }

    public function test_sequence_counter_survives_rollback_without_duplicates(): void
    {
        $user = $this->createUser();

        // Force a failure after sequence allocation by completing, then
        // verifying the counter advanced exactly once per completed deposit.
        $this->createCompletedDeposit($user, '5.00');
        $counterBefore = (int) \Illuminate\Support\Facades\DB::table('sequence_counters')->where('name', 'deposit')->value('current_value');

        try {
            \Illuminate\Support\Facades\DB::transaction(function () use ($user) {
                $service = app(\App\Services\Deposit\DepositService::class);
                [, $payment] = $service->initiate($user->fresh(), '2.00');

                $service->complete($payment);

                throw new RuntimeException('forced rollback');
            });
        } catch (RuntimeException) {
            // expected
        }

        // The counter may have advanced inside the rolled-back tx but the
        // deposit_sequences row must not exist and no duplicate numbers can be allocated.
        $allocated = DepositSequence::pluck('sequence_number')->all();

        $this->assertCount(1, $allocated);
        $this->assertSame([1], $allocated);
        $this->assertDatabaseMissing('deposits', ['status' => 'completed', 'amount' => '2.00']);
    }

    public function test_duplicate_payment_completion_is_idempotent(): void
    {
        $user = $this->createUser();

        /** @var \App\Services\Deposit\DepositService $service */
        $service = app(\App\Services\Deposit\DepositService::class);
        [$deposit, $payment] = $service->initiate($user, '5.00');

        $first = $service->complete($payment);
        $second = $service->complete($payment); // replay

        $this->assertSame($first->id, $second->id);
        $this->assertSame(1, DepositSequence::count()); // only one sequence ever
        $this->assertSame(1, Deposit::where('status', 'completed')->count());
    }
}
