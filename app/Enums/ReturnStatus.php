<?php

namespace App\Enums;

enum ReturnStatus: string
{
    case Pending = 'pending';
    case Eligible = 'eligible';
    case Approved = 'approved';
    case Processing = 'processing';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
    case Reversed = 'reversed';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::Eligible => 'Eligible',
            self::Approved => 'Approved',
            self::Processing => 'Processing',
            self::Completed => 'Completed',
            self::Cancelled => 'Cancelled',
            self::Reversed => 'Reversed',
        };
    }
}
