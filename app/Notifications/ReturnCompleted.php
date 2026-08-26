<?php

namespace App\Notifications;

class ReturnCompleted extends PlatformNotification
{
    public function __construct(private readonly array $data = [])
    {
    }

    public function title(): string
    {
        return 'Return Completed';
    }

    public function message(): string
    {
        return $this->data['message'] ?? 'Your return payout has been completed and credited to your wallet.';
    }

    public function url(): ?string
    {
        return $this->data['url'] ?? null;
    }
}
