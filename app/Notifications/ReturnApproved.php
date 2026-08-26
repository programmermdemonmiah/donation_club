<?php

namespace App\Notifications;

class ReturnApproved extends PlatformNotification
{
    public function __construct(private readonly array $data = [])
    {
    }

    public function title(): string
    {
        return 'Return Approved';
    }

    public function message(): string
    {
        return $this->data['message'] ?? 'Your return request has been approved and is being processed.';
    }

    public function url(): ?string
    {
        return $this->data['url'] ?? null;
    }
}
