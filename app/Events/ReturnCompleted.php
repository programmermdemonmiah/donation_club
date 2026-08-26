<?php

namespace App\Events;

use App\Models\MemberReturn;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ReturnCompleted 
{
    use Dispatchable, SerializesModels;

    public function __construct(public readonly MemberReturn $memberReturn)
    {
    }
}
