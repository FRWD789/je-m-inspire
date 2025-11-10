<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountDeactivatedNotification extends Notification
{
    use Queueable;

    public $daysInactive;

    public function __construct(int $daysInactive)
    {
        $this->daysInactive = $daysInactive;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $contactEmail = config('mail.from.address', 'support@example.com');
        $loginUrl = config('app.frontend_url', 'http://localhost:5173') . '/login';

        $greeting = 'Bonjour ' . $notifiable->name . ' ' . $notifiable->last_name . ',';

        $lastLogin = $notifiable->last_login_at
            ? $notifiable->last_login_at->locale('fr')->isoFormat('D MMMM YYYY à HH:mm')
            : 'Jamais connecté';

        return (new MailMessage)
            ->subject('⚠️ Votre compte a été désactivé pour inactivité')
            ->view('emails.notifications.account-deactivated', [
                'user' => $notifiable,
                'daysInactive' => $this->daysInactive,
                'lastLogin' => $lastLogin,
                'contactEmail' => $contactEmail,
                'loginUrl' => $loginUrl,
                'greeting' => $greeting,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'message' => 'Compte désactivé pour inactivité',
            'days_inactive' => $this->daysInactive,
            'deactivated_at' => now(),
        ];
    }
}