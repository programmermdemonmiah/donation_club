<?php

namespace App\Notifications;

class DepositSuccessful extends PlatformNotification
{
    public function __construct(private readonly array $data = [])
    {
    }

    public function title(): string
    {
        return 'Deposit Successful';
    }

    public function message(): string
    {
        return $this->data['message'] ?? 'Your deposit has been confirmed and added to the club sequence.';
    }

    public function url(): ?string
    {
        return $this->data['url'] ?? null;
    }
}
