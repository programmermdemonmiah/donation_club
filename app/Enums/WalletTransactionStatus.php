<?php

namespace App\Enums;

/**
 * Ledger entry lifecycle:
 *  - held     : funds locked (withdrawal hold), balance not yet moved
 *  - consumed : hold converted into a final debit (withdrawal completed)
 *  - released : hold released back to available balance
 */
enum WalletTransactionStatus: string
{
    case Completed = 'completed';
    case Held = 'held';
    case Consumed = 'consumed';
    case Released = 'released';
    case Reversed = 'reversed';
}
