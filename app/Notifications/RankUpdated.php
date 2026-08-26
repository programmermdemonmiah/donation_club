<?php

namespace App\Notifications;

class RankUpdated extends PlatformNotification
{
    public function __construct(private readonly array $data = [])
    {
    }

    public function title(): string
    {
        return 'Rank Updated';
    }

    public function message(): string
    {
        return $this->data['message'] ?? 'Congratulations! Your rank has been updated.';
    }

    public function url(): ?string
    {
        return $this->data['url'] ?? null;
    }
}
