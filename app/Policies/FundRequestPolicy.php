<?php

namespace App\Policies;

use App\Models\FundRequest;
use App\Models\User;

class FundRequestPolicy
{
    public function view(User $user, FundRequest $request): bool
    {
        return $user->isAdmin() || $request->user_id === $user->id;
    }

    public function cancel(User $user, FundRequest $request): bool
    {
        return $request->user_id === $user->id && $request->status === \App\Enums\FundRequestStatus::Pending;
    }
}
