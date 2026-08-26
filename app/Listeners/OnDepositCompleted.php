<?php

namespace App\Listeners;

use App\Events\DepositCompleted;
use App\Notifications\DepositSuccessful;
use App\Services\Commission\CommissionService;
use App\Services\Return\ReturnService;

/**
 * Post-deposit pipeline:
 *  1. create pending return record (rate locked at creation)
 *  2. direct referral commission (if enabled)
 *  3. notify the member
 */
class OnDepositCompleted
{
    public function __construct(
        private readonly ReturnService $returns,
        private readonly CommissionService $commissions,
    ) {
    }

    public function handle(DepositCompleted $event): void
    {
        // 1) Return record (only when module enabled — service checks rules)
        $this->returns->createFromDeposit($event->deposit);

        // 2) Direct commission on referred member's deposit
        $this->commissions->handleDepositCompleted($event->deposit);

        // 3) Member notification
        $event->deposit->user->notify(new DepositSuccessful([
            'message' => sprintf(
                'Your deposit of %s was confirmed. Sequence number: #%06d.',
                $event->deposit->amount,
                $event->deposit->sequence->sequence_number ?? 0,
            ),
            'url' => route('deposits.index'),
        ]));
    }
}
