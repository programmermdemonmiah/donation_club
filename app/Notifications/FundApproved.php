<?php

namespace App\Notifications;

class FundApproved extends PlatformNotification
{
    public function __construct(private readonly array $data = [])
    {
    }

    public function title(): string
    {
        return 'Fund Approved';
    }

    public function message(): string
    {
        return $this->data['message'] ?? 'Your support fund request has been approved and will be disbursed soon.';
    }

    public function url(): ?string
    {
        return $this->data['url'] ?? null;
    }
}
