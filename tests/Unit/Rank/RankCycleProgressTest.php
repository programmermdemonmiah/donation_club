<?php

namespace Tests\Unit\Rank;

use App\Services\Rank\RankService;
use PHPUnit\Framework\TestCase;

class RankCycleProgressTest extends TestCase
{
    public function test_extra_above_a_filled_hand_counts_toward_the_next_rank_from_zero(): void
    {
        $bronze = RankService::cycleProgress('150.00', '100.00', '0.00');
        $silver = RankService::cycleProgress('150.00', '500.00', '100.00');

        $this->assertSame('100.00', $bronze['actual']);
        $this->assertTrue($bronze['met']);
        $this->assertSame('50.00', $silver['actual']);
        $this->assertSame('400.00', $silver['required']);
        $this->assertFalse($silver['met']);
    }

    public function test_a_hand_below_the_previous_rank_does_not_carry_into_the_next_rank(): void
    {
        $bronze = RankService::cycleProgress('50.00', '100.00', '0.00');
        $silver = RankService::cycleProgress('50.00', '500.00', '100.00');

        $this->assertSame('50.00', $bronze['actual']);
        $this->assertFalse($bronze['met']);
        $this->assertSame('0.00', $silver['actual']);
        $this->assertFalse($silver['met']);
    }

    public function test_next_rank_is_reached_only_when_the_lifetime_total_hits_its_threshold(): void
    {
        $almost = RankService::cycleProgress('499.00', '500.00', '100.00');
        $reached = RankService::cycleProgress('500.00', '500.00', '100.00');

        $this->assertFalse($almost['met']);
        $this->assertSame('400.00', $reached['actual']);
        $this->assertTrue($reached['met']);
    }
}
