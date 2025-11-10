<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\User;

class ProfessionalApplicationReceivedNotification extends Notification
{
    use Queueable;

    public $applicant;
    public $motivation;
    public $experience;

    public function __construct(User $applicant, ?string $motivation = null, ?string $experience = null)
    {
        $this->applicant = $applicant;
        $this->motivation = $motivation;
        $this->experience = $experience;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $reviewUrl = config('app.frontend_url', 'http://localhost:5173') . '/admin/users/' . $this->applicant->id;

        $greeting = 'Bonjour l\'équipe administrative,';

        return (new MailMessage)
            ->subject('📨 Nouvelle demande d\'inscription professionnelle')
            ->view('emails.notifications.professional-application', [
                'user' => $this->applicant,
                'motivation' => $this->motivation,
                'experience' => $this->experience,
                'reviewUrl' => $reviewUrl,
                'greeting' => $greeting,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'message' => 'Nouvelle demande d\'inscription professionnelle',
            'applicant_id' => $this->applicant->id,
            'submitted_at' => now(),
        ];
    }
}