<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProfessionalRejectedNotification extends Notification
{
    use Queueable;

    public $reason;

    public function __construct(string $reason)
    {
        $this->reason = $reason;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $contactUrl = config(env("FRONTEND_URL"), env("APP_URL")) . '/contact';
        $loginUrl = config(env("FRONTEND_URL"), env("APP_URL")) . '/login';

        $greeting = 'Bonjour ' . $notifiable->name . ' ' . $notifiable->last_name . ',';

        return (new MailMessage)
            ->subject('⚠️ Mise à jour concernant votre demande professionnelle')
            ->view('emails.notifications.professional-rejected', [
                'user' => $notifiable,
                'reason' => $this->reason,
                'contactUrl' => $contactUrl,
                'loginUrl' => $loginUrl,
                'greeting' => $greeting,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'message' => 'Votre demande d\'inscription a été rejetée',
            'reason' => $this->reason,
            'rejected_at' => now(),
        ];
    }
}