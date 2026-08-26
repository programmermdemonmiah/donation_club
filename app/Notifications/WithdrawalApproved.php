<?php

namespace App\Notifications;

class WithdrawalApproved extends PlatformNotification
{
    public function __construct(private readonly array $data = [])
    {
    }

    public function title(): string
    {
        return 'Withdrawal Approved';
    }

    public function message(): string
    {
        return $this->data['message'] ?? 'Your withdrawal request has been approved and is being processed.';
    }

    public function url(): ?string
    {
        return $this->data['url'] ?? null;
    }
}
