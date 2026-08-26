<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Withdrawal;

class WithdrawalPolicy
{
    public function view(User $user, Withdrawal $withdrawal): bool
    {
        return $user->isAdmin() || $withdrawal->user_id === $user->id;
    }

    public function cancel(User $user, Withdrawal $withdrawal): bool
    {
        return $withdrawal->user_id === $user->id && $withdrawal->status === \App\Enums\WithdrawalStatus::Pending;
    }
}
