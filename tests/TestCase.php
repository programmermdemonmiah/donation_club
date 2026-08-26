<?php

namespace Tests;

use App\Models\Deposit;
use App\Models\Payment;
use App\Models\User;
use App\Services\Deposit\DepositService;
use App\Services\Referral\ReferralService;
use App\Support\Money;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(DatabaseSeeder::class);
    }

    protected function createUser(array $attributes = []): User
    {
        $user = User::factory()->create($attributes);

        // Mirror RegistrationService: every member starts with an empty wallet.
        $user->wallet()->create(['balance' => '0.00', 'locked_balance' => '0.00']);

        return $user;
    }

    protected function createCompletedDeposit(User $user, string $amount = '5.00'): Deposit
    {
        /** @var DepositService $service */
        $service = app(DepositService::class);

        [$deposit, $payment] = $service->initiate($user, $amount);

        return $this->completeDeposit($payment);
    }

    protected function completeDeposit(Payment $payment): Deposit
    {
        return app(DepositService::class)->complete($payment);
    }

    protected function buildChain(int $depth, int $startGeneration = 1): array
    {
        $users = [];

        $previous = $this->createUser([
            'name' => "Root {$startGeneration}",
            'email' => "root{$startGeneration}".uniqid().'@test.local',
            'referral_code' => ReferralService::generateReferralCode(),
        ]);

        for ($i = 0; $i < $depth; $i++) {
            $user = $this->createUser([
                'name' => 'Member '.($i + 1),
                'email' => 'member'.$i.uniqid().'@test.local',
                'referral_code' => ReferralService::generateReferralCode(),
            ]);

            ReferralService::attachReferrer($user, $previous);
            $users[] = $user;
            $previous = $user;
        }

        return $users;
    }
}
