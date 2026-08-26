<?php

namespace App\Listeners;

use App\Events\RankAchieved;
use App\Notifications\RankUpdated;

class OnRankAchieved
{
    public $afterCommit = true;

    public function handle(RankAchieved $event): void
    {
        $event->user->notify(new RankUpdated([
            'message' => "Congratulations! You achieved the {$event->rank->name} rank.",
            'url' => route('rank.index'),
        ]));
    }
}
