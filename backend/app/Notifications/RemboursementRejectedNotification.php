<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Remboursement;

class RemboursementRejectedNotification extends Notification
{
    use Queueable;

    public $remboursement;

    public function __construct(Remboursement $remboursement)
    {
        $this->remboursement = $remboursement;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $operation = $this->remboursement->operation;
        $event = $operation->event;

        $contactUrl = config('app.url') . '/contact';
        $greeting = 'Bonjour ' . $notifiable->name . ' ' . $notifiable->last_name . ',';
        $processedDate = $this->remboursement->date_traitement->locale('fr')->isoFormat('D MMMM YYYY à HH:mm');

        return (new MailMessage)
            ->subject('❌ Votre demande de remboursement a été refusée')
            ->view('emails.notifications.remboursement-rejected', [
                'user' => $notifiable,
                'amount' => $this->remboursement->montant,
                'processedDate' => $processedDate,
                'refundId' => $this->remboursement->id,
                'event' => $event,
                'commentaire' => $this->remboursement->commentaire_admin,
                'contactUrl' => $contactUrl,
                'greeting' => $greeting,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'message' => 'Remboursement refusé',
            'remboursement_id' => $this->remboursement->id,
            'montant' => $this->remboursement->montant,
            'processed_at' => $this->remboursement->date_traitement,
        ];
    }
}