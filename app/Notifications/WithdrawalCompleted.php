<?php

namespace App\Notifications;

class WithdrawalCompleted extends PlatformNotification
{
    public function __construct(private readonly array $data = [])
    {
    }

    public function title(): string
    {
        return 'Withdrawal Completed';
    }

    public function message(): string
    {
        return $this->data['message'] ?? 'Your withdrawal has been completed successfully.';
    }

    public function url(): ?string
    {
        return $this->data['url'] ?? null;
    }
}
