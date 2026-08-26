<?php

namespace App\Enums;

enum CommissionTrigger: string
{
    case Deposit = 'deposit';
    case ReturnPayout = 'return_payout';

    public function label(): string
    {
        return match ($this) {
            self::Deposit => 'Deposit',
            self::ReturnPayout => 'Return Payout',
        };
    }
}
