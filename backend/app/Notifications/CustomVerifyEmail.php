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

    /**
     * Create a new notification instance.
     */
    public function __construct()
    {
        //
    }

    protected function verificationUrl($notifiable)
    {
        $expiration = Carbon::now()->addMinutes(60); // link valid 60 mins
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

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $url = $this->verificationUrl($notifiable); // your custom frontend URL

        return (new MailMessage)
            ->subject('Verify Your Email Address')
            ->line('Please click the button below to verify your email address.')
            ->action('Verify Email', $url) // <- point to React frontend
            ->line('If you did not create an account, no further action is required.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
