<?php

namespace Tests\Unit;

use App\Support\Money;
use PHPUnit\Framework\TestCase;

class MoneyTest extends TestCase
{
    public function test_basic_arithmetic_uses_decimal_scale(): void
    {
        $this->assertSame('15.00', Money::add('10.00', '5.00'));
        $this->assertSame('7.50', Money::sub('10.00', '2.50'));
        $this->assertSame('25.00', Money::mul('5.00', '5'));
    }

    public function test_percentage_of(): void
    {
        $this->assertSame('0.50', Money::percentOf('10.00', '5'));     // 5% of 10
        $this->assertSame('0.05', Money::percentOf('1.00', '5'));
        $this->assertSame('0.03', Money::percentOf('10.00', '0.3'));
        $this->assertSame('15.00', Money::percentOf('10.00', '150'));
    }

    public function test_comparisons(): void
    {
        $this->assertTrue(Money::gte('5.00', '5.00'));
        $this->assertTrue(Money::gt('5.01', '5.00'));
        $this->assertTrue(Money::lte('4.99', '5.00'));
        $this->assertTrue(Money::eq('5', '5.00'));
        $this->assertFalse(Money::gt('5.00', '5.00'));
    }

    public function test_float_contamination_is_avoided(): void
    {
        // The classic float trap: 0.1 + 0.2 !== 0.3 in IEEE754.
        $result = Money::add('0.10', '0.20');

        $this->assertSame('0.30', $result);
        $this->assertTrue(Money::eq($result, '0.30'));
    }
}
