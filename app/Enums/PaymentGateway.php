<?php

namespace App\Enums;

enum PaymentGateway: string
{
    case Manual = 'manual';

    public function label(): string
    {
        return match ($this) {
            self::Manual => 'Manual / Bank Transfer',
        };
    }
}
