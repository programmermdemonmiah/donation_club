<?php

namespace App\Notifications;

class CommissionCredited extends PlatformNotification
{
    public function __construct(private readonly array $data = [])
    {
    }

    public function title(): string
    {
        return 'Commission Credited';
    }

    public function message(): string
    {
        return $this->data['message'] ?? 'A referral commission has been credited to your wallet.';
    }

    public function url(): ?string
    {
        return $this->data['url'] ?? null;
    }
}
