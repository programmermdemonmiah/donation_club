<?php

namespace App\Listeners;

use App\Enums\WalletDirection;
use App\Enums\WalletTransactionStatus;
use App\Enums\WalletTransactionType;
use App\Events\RankAchieved;
use App\Models\Rank;
use App\Models\WalletTransaction;
use App\Notifications\RankUpdated;
use App\Services\Wallet\WalletService;
use App\Support\Money;
use Throwable;

class OnRankAchieved
{
    public function handle(RankAchieved $event): void
    {
        $user = $event->user;
        $rank = $event->rank;

        if (Money::gt((string) $rank->incentive_amount, '0.00') && ! $this->incentiveAlreadyPaid($user->id, $rank)) {
            WalletService::credit(
                $user,
                (string) $rank->incentive_amount,
                WalletTransactionType::RankIncentive,
                $rank,
                "Incentive for achieving {$rank->name} rank"
            );
        }

        try {
            $user->notify(new RankUpdated([
                'message' => "Congratulations! You achieved the {$rank->name} rank.",
                'url' => route('rank.index'),
            ]));
        } catch (Throwable $e) {
            report($e);
        }
    }

    private function incentiveAlreadyPaid(int $userId, Rank $rank): bool
    {
        return WalletTransaction::query()
            ->where('user_id', $userId)
            ->where('type', WalletTransactionType::RankIncentive->value)
            ->where('direction', WalletDirection::Credit->value)
            ->where('status', WalletTransactionStatus::Completed->value)
            ->where('reference_type', $rank->getMorphClass())
            ->where('reference_id', $rank->id)
            ->exists();
    }
}
