<?php

namespace App\Listeners;

use App\Events\FundDisbursed;
use App\Notifications\FundApproved;

class OnFundDisbursed
{
    public $afterCommit = true;

    public function handle(FundDisbursed $event): void
    {
        $request = $event->fundRequest;

        $request->user->notify(new FundApproved([
            'message' => sprintf(
                'Support fund %s approved. %s disbursed to your wallet.',
                $request->reference,
                $request->approved_amount,
            ),
            'url' => route('fund.index'),
        ]));
    }
}
