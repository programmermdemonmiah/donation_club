<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Shared base for all platform notifications: email + in-app (database).
 */
abstract class PlatformNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct()
    {
        // Delay until the current DB transaction commits, when queued.
        $this->afterCommit = true;
    }

    abstract public function title(): string;

    abstract public function message(): string;

    public function url(): ?string
    {
        return null;
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject($this->title())
            ->greeting("Hello {$notifiable->name},")
            ->line($this->message());

        if ($this->url()) {
            $mail->action($this->title(), $this->url());
        }

        return $mail->line('Thank you for being part of the club.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->title(),
            'message' => $this->message(),
            'url' => $this->url(),
            'event' => class_basename(static::class),
        ];
    }
}
