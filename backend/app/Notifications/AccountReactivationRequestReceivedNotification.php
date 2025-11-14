<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\User;

class AccountReactivationRequestReceivedNotification extends Notification
{
    use Queueable;

    public $user;
    public $reason;

    public function __construct(User $user, ?string $reason = null)
    {
        $this->user = $user;
        $this->reason = $reason ?? 'Aucune raison fournie';
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $adminUrl = config(env("FRONTEND_URL"), env("APP_URL")) . '/admin/users/' . $this->user->id;

        $greeting = 'Bonjour l\'équipe administrative,';

        $deactivatedAt = $this->user->deactivated_at
            ? $this->user->deactivated_at->locale('fr')->isoFormat('D MMMM YYYY à HH:mm')
            : 'Information non disponible';

        $lastLogin = $this->user->last_login_at
            ? $this->user->last_login_at->locale('fr')->isoFormat('D MMMM YYYY à HH:mm')
            : 'Jamais connecté';

        return (new MailMessage)
            ->subject('📨 Nouvelle demande de réactivation de compte')
            ->view('emails.notifications.account-reactivation', [
                'user' => $this->user,
                'reason' => $this->reason,
                'deactivatedAt' => $deactivatedAt,
                'lastLogin' => $lastLogin,
                'adminUrl' => $adminUrl,
                'greeting' => $greeting,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'message' => 'Demande de réactivation de compte reçue',
            'user_id' => $this->user->id,
            'requested_at' => now(),
        ];
    }
}