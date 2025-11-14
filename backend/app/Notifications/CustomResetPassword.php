<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CustomResetPassword extends Notification
{
    use Queueable;

    public $token;

    public function __construct($token)
    {
        $this->token = $token;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = config(env("FRONTEND_URL"), env("APP_URL"));
        $url = $frontendUrl . '/reset-password?token=' . $this->token . '&email=' . urlencode($notifiable->email);

        $greeting = 'Bonjour ' . $notifiable->name . ',';

        return (new MailMessage)
            ->subject('Réinitialisation de votre mot de passe')
            ->view('emails.notifications.reset-password', [
                'user' => $notifiable,
                'url' => $url,
                'greeting' => $greeting,
                'count' => 60, // Minutes avant expiration
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'message' => 'Réinitialisation de mot de passe demandée',
            'email' => $notifiable->email
        ];
    }
}