<?php

namespace App\Notifications;

class FundRejected extends PlatformNotification
{
    public function __construct(private readonly array $data = [])
    {
    }

    public function title(): string
    {
        return 'Fund Rejected';
    }

    public function message(): string
    {
        return $this->data['message'] ?? 'Your support fund request was not approved this time.';
    }

    public function url(): ?string
    {
        return $this->data['url'] ?? null;
    }
}
