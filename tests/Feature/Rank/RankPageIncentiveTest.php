<?php

namespace Tests\Feature\Rank;

use App\Models\Rank;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RankPageIncentiveTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Notification::fake();
    }

    public function test_rank_ladder_shows_the_admin_configured_incentive_for_each_rank(): void
    {
        $member = $this->createUser();

        $this->actingAs($member)
            ->get('/rank')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('ladder.0.name', 'Bronze')
                ->where('ladder.0.incentive_amount', '10.00')
                ->where('ladder.1.name', 'Silver')
                ->where('ladder.1.incentive_amount', '50.00')
            );
    }

    public function test_rank_ladder_incentive_updates_when_admin_changes_the_amount(): void
    {
        $member = $this->createUser();
        $bronze = Rank::query()->where('slug', 'bronze')->firstOrFail();
        $bronze->update(['incentive_amount' => '37.50']);

        $this->actingAs($member)
            ->get('/rank')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('ladder.0.name', 'Bronze')
                ->where('ladder.0.incentive_amount', '37.50')
                ->where('ladder.1.name', 'Silver')
                ->where('ladder.1.incentive_amount', '50.00')
            );
    }
}
