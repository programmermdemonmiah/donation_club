<?php

namespace App\Support;

use InvalidArgumentException;

/**
 * Money math using bcmath only. Never use floats for money.
 */
final class Money
{
    public const SCALE = 2;

    public static function parse(mixed $value): string
    {
        if (is_int($value) || is_float($value)) {
            $value = number_format($value, self::SCALE, '.', '');
        }

        if (! is_string($value) || ! preg_match('/^-?\d+(\.\d+)?$/', trim($value))) {
            throw new InvalidArgumentException('Invalid monetary value.');
        }

        return bcadd(trim($value), '0', self::SCALE);
    }

    public static function add(string ...$amounts): string
    {
        $total = '0';

        foreach ($amounts as $amount) {
            $total = bcadd($total, self::parse($amount), self::SCALE);
        }

        return $total;
    }

    public static function sub(string $left, string $right): string
    {
        return bcsub(self::parse($left), self::parse($right), self::SCALE);
    }

    public static function mul(string $left, string $right): string
    {
        return bcmul(self::parse($left), self::parse($right), self::SCALE);
    }

    /**
     * Percentage of an amount, e.g. percentOf('100', '5') => '5.00'.
     */
    public static function percentOf(string $amount, string $percent): string
    {
        return bcdiv(bcmul(self::parse($amount), self::parse($percent), 6), '100', self::SCALE);
    }

    public static function gte(string $left, string $right): bool
    {
        return bccomp(self::parse($left), self::parse($right), self::SCALE) >= 0;
    }

    public static function gt(string $left, string $right): bool
    {
        return bccomp(self::parse($left), self::parse($right), self::SCALE) > 0;
    }

    public static function lt(string $left, string $right): bool
    {
        return bccomp(self::parse($left), self::parse($right), self::SCALE) < 0;
    }

    public static function lte(string $left, string $right): bool
    {
        return bccomp(self::parse($left), self::parse($right), self::SCALE) <= 0;
    }

    public static function eq(string $left, string $right): bool
    {
        return bccomp(self::parse($left), self::parse($right), self::SCALE) === 0;
    }

    public static function format(mixed $amount): string
    {
        return '$'.number_format((float) self::parse((string) $amount), 2);
    }
}
