<?php

namespace App\Enums;

enum CommissionScope: string
{
    case Direct = 'direct';
    case Generation = 'generation';

    public function label(): string
    {
        return match ($this) {
            self::Direct => 'Direct Referral',
            self::Generation => 'Generation',
        };
    }
}
