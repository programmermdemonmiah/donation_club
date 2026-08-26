<?php

namespace App\Events;

use App\Models\FundRequest;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FundDisbursed 
{
    use Dispatchable, SerializesModels;

    public function __construct(public readonly FundRequest $fundRequest)
    {
    }
}
