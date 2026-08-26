<?php

namespace App\Enums;

enum WalletDirection: string
{
    case Credit = 'credit';
    case Debit = 'debit';
}
