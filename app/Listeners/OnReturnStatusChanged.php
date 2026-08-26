<?php

namespace App\Listeners;

use App\Enums\ReturnStatus;
use App\Events\ReturnCompleted;
use App\Events\ReturnStatusChanged;
use App\Notifications\ReturnApproved;
use App\Notifications\ReturnCompleted as ReturnCompletedNotification;

class OnReturnStatusChanged
{
    public $afterCommit = true;

    public function handle(ReturnStatusChanged|ReturnCompleted $event): void
    {
        if ($event instanceof ReturnCompleted) {
            $event->memberReturn->user->notify(new ReturnCompletedNotification([
                'message' => sprintf(
                    'Return %s completed. %s has been credited to your wallet.',
                    $event->memberReturn->reference,
                    $event->memberReturn->payout_amount,
                ),
                'url' => route('returns.index'),
            ]));

            return;
        }

        if ($event->memberReturn->status === ReturnStatus::Approved) {
            $event->memberReturn->user->notify(new ReturnApproved([
                'message' => "Return {$event->memberReturn->reference} was approved and is queued for payout.",
                'url' => route('returns.index'),
            ]));
        }
    }
}
