<?php

namespace App\Notifications;

use Illuminate\Support\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\URL;

class CustomVerifyEmail extends Notification
{
    use Queueable;

    public function __construct()
    {
        //
    }

    protected function verificationUrl($notifiable)
    {
        $expiration = Carbon::now()->addMinutes(60);
        $signedUrl = URL::temporarySignedRoute(
            'verification.verify',
            $expiration,
            ['id' => $notifiable->getKey(), 'hash' => sha1($notifiable->email)]
        );

        $query = parse_url($signedUrl, PHP_URL_QUERY);
        $frontendUrl = config('app.frontend_url')
            . '/verify-email?id=' . $notifiable->getKey()
            . '&hash=' . sha1($notifiable->email)
            . '&' . $query;

        return $frontendUrl;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = $this->verificationUrl($notifiable);

        // Vérifier si c'est un professionnel approuvé
        $isProfessional = $notifiable->roles()->where('role', 'professionnel')->exists();
        $isApproved = $notifiable->is_approved ?? false;

        $subject = $isProfessional && $isApproved
            ? '🎉 Félicitations ! Votre compte professionnel a été approuvé'
            : 'Vérifiez votre adresse email';

        $greeting = 'Bonjour ' . $notifiable->name . ' ' . $notifiable->last_name . ',';

        return (new MailMessage)
            ->subject($subject)
            ->view('emails.notifications.verify-email', [
                'user' => $notifiable,
                'url' => $url,
                'greeting' => $greeting,
                'isProfessional' => $isProfessional,
                'isApproved' => $isApproved,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'message' => 'Vérification email requise',
            'email' => $notifiable->email
        ];
    }
}