<?php

namespace App\Notifications;

class WithdrawalRejected extends PlatformNotification
{
    public function __construct(private readonly array $data = [])
    {
    }

    public function title(): string
    {
        return 'Withdrawal Rejected';
    }

    public function message(): string
    {
        return $this->data['message'] ?? 'Your withdrawal request was rejected. The amount has been returned to your wallet.';
    }

    public function url(): ?string
    {
        return $this->data['url'] ?? null;
    }
}
