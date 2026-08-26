<?php

namespace App\Events;

use App\Models\Rank;
use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RankAchieved 
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly User $user,
        public readonly Rank $rank,
    ) {
    }
}
