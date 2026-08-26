<?php

namespace App\Support;

use Illuminate\Support\Str;

/**
 * Generates human-friendly, unique business references like DEP-8F3K2M9Q.
 * Uniqueness is enforced by DB unique indexes; callers must retry on collision.
 */
final class ReferenceGenerator
{
    public static function generate(string $prefix): string
    {
        return strtoupper($prefix.'-'.Str::random(10));
    }
}
