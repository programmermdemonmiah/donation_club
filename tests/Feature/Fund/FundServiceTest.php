<?php

namespace Tests\Feature\Fund;

use App\Models\Fund;
use App\Models\Rank;
use App\Models\User;
use App\Services\Fund\FundService;
use App\Services\Rank\RankService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use RuntimeException;
use Tests\TestCase;

class FundServiceTest extends TestCase
{
    use RefreshDatabase;

    private FundService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(FundService::class);
    }

    private function fundForRank(?string $rankSlug): Fund
    {
        $rankId = $rankSlug ? Rank::where('slug', $rankSlug)->value('id') : null;

        return Fund::create([
            'name' => 'Test Fund',
            'minimum_rank_id' => $rankId,
            'min_amount' => '50.00',
            'max_amount' => '500.00',
            'requires_proof' => false,
            'enabled' => true,
        ]);
    }

    private function promoteTo(User $user, string $slug): void
    {
        $rank = Rank::where('slug', $slug)->firstOrFail();

        \App\Models\UserRank::create([
            'user_id' => $user->id,
            'rank_id' => $rank->id,
            'status' => 'active',
            'achieved_at' => now(),
        ]);
    }

    public function test_request_requires_minimum_rank(): void
    {
        $fund = $this->fundForRank('silver');
        $user = $this->createUser(); // no rank

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Silver');

        $this->service->request($user, $fund, '100.00', 'Starting a small tailoring business.');
    }

    public function test_request_enforces_amount_range(): void
    {
        $fund = $this->fundForRank(null);
        $user = $this->createUser();

        try {
            $this->service->request($user, $fund, '10.00', 'Below the configured minimum amount.');
            $this->fail('should reject');
        } catch (RuntimeException) {
            // expected
        }

        try {
            $this->service->request($user, $fund, '900.00', 'Above the configured maximum amount.');
            $this->fail('should reject');
        } catch (RuntimeException) {
            // expected
        }

        // valid amount passes
        $request = $this->service->request($user, $fund, '150.00', 'Valid purpose within range.');
        $this->assertSame('pending', $request->status->value);
    }

    public function test_full_disbursement_lifecycle_credits_wallet(): void
    {
        $admin = $this->createUser(['is_admin' => true]);
        $fund = $this->fundForRank(null);
        $user = $this->createUser();

        $request = $this->service->request($user, $fund, '200.00', 'Buying equipment for a workshop.');

        $this->service->approve($request, $admin, '180.00', 'Partial approval');
        $this->service->startProcessing($request->fresh(), $admin);
        $completed = $this->service->complete($request->fresh(), $admin);

        $this->assertSame('completed', $completed->status->value);
        $this->assertSame('180.00', (string) $user->wallet()->first()->balance);

        // fund transaction ledger row exists and links to the wallet entry
        $tx = $completed->transactions()->sole();
        $this->assertSame('disbursement', $tx->type);
        $this->assertNotNull($tx->wallet_transaction_id);
    }

    public function test_rejected_request_never_credits_wallet(): void
    {
        $admin = $this->createUser(['is_admin' => true]);
        $fund = $this->fundForRank(null);
        $user = $this->createUser();

        $request = $this->service->request($user, $fund, '100.00', 'Purpose that will be rejected soon.');

        $this->service->reject($request->fresh(), $admin, 'Incomplete documentation');

        $this->assertSame('rejected', $request->fresh()->status->value);
        $this->assertSame('0.00', (string) $user->wallet()->first()->balance);
    }
}
