<?php

namespace App\Listeners;

use App\Enums\WalletTransactionType;
use App\Events\RankAchieved;
use App\Notifications\RankUpdated;
use App\Services\Wallet\WalletService;
use App\Support\Money;

class OnRankAchieved
{
    public $afterCommit = true;

    public function handle(RankAchieved $event): void
    {
        $user = $event->user;
        $rank = $event->rank;

        // Credit incentive amount if greater than 0
        if (Money::gt((string) $rank->incentive_amount, '0.00')) {
            WalletService::credit(
                $user,
                (string) $rank->incentive_amount,
                WalletTransactionType::RankIncentive,
                $rank,
                "Incentive for achieving {$rank->name} rank"
            );
        }

        $user->notify(new RankUpdated([
            'message' => "Congratulations! You achieved the {$rank->name} rank.",
            'url' => route('rank.index'),
        ]));
    }
}
