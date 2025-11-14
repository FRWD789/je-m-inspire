<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProfessionalApprovedNotification extends Notification
{
    use Queueable;

    public function __construct()
    {
        //
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $loginUrl = config(env("FRONTEND_URL"), env("APP_URL")) . '/login';
        $dashboardUrl = config(env("FRONTEND_URL"), env("APP_URL")) . '/dashboard';

        $greeting = 'Bonjour ' . $notifiable->name . ' ' . $notifiable->last_name . ',';

        return (new MailMessage)
            ->subject('🎉 Félicitations ! Votre compte professionnel a été approuvé')
            ->view('emails.notifications.professional-approved', [
                'user' => $notifiable,
                'loginUrl' => $loginUrl,
                'dashboardUrl' => $dashboardUrl,
                'greeting' => $greeting,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'message' => 'Votre compte professionnel a été approuvé',
            'approved_at' => now(),
        ];
    }
}