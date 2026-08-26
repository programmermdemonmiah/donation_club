<?php

namespace App\Listeners;

use App\Events\CommissionCredited;
use App\Notifications\CommissionCredited as CommissionCreditedNotification;

class SendCommissionCreditedNotification
{
    public $afterCommit = true;

    public function handle(CommissionCredited $event): void
    {
        $commission = $event->commission->loadMissing(['sourceUser']);

        $event->commission->user->notify(new CommissionCreditedNotification([
            'message' => sprintf(
                '%s credited from %s activity of %s.',
                $commission->amount,
                $commission->generation === 1 ? 'a direct referral' : "generation {$commission->generation}",
                $commission->sourceUser?->name ?? 'a member',
            ),
            'url' => route('commissions.index'),
        ]));
    }
}
