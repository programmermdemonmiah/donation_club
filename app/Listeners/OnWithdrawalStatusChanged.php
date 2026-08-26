<?php

namespace App\Listeners;

use App\Enums\WithdrawalStatus;
use App\Events\WithdrawalStatusChanged;
use App\Notifications\WithdrawalApproved;
use App\Notifications\WithdrawalCompleted;
use App\Notifications\WithdrawalRejected;

class OnWithdrawalStatusChanged
{
    public $afterCommit = true;

    public function handle(WithdrawalStatusChanged $event): void
    {
        $withdrawal = $event->withdrawal;
        $payload = [
            'message' => sprintf('Withdrawal %s (%s) status: %s.', $withdrawal->reference, $withdrawal->net_amount, $withdrawal->status->label()),
            'url' => route('withdrawals.index'),
        ];

        match ($withdrawal->status) {
            WithdrawalStatus::Approved => $withdrawal->user->notify(new WithdrawalApproved($payload)),
            WithdrawalStatus::Completed => $withdrawal->user->notify(new WithdrawalCompleted($payload)),
            WithdrawalStatus::Rejected, WithdrawalStatus::Failed => $withdrawal->user->notify(new WithdrawalRejected($payload)),
            default => null,
        };
    }
}
