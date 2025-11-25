<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Remboursement;

class RemboursementApprovedNotification extends Notification
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
        $paiement = $operation->paiement;

        $myReservationsUrl = config('app.frontend_url') . '/my-reservations';
        $greeting = 'Bonjour ' . $notifiable->name . ' ' . $notifiable->last_name . ',';
        $processedDate = $this->remboursement->date_traitement->locale('fr')->isoFormat('D MMMM YYYY à HH:mm');
        $paymentMethod = $paiement->provider === 'stripe' ? 'Carte bancaire (Stripe)' : 'PayPal';

        return (new MailMessage)
            ->subject('✅ Votre remboursement a été approuvé')
            ->view('emails.notifications.remboursement-approved', [
                'user' => $notifiable,
                'amount' => $this->remboursement->montant,
                'processedDate' => $processedDate,
                'refundId' => $this->remboursement->id,
                'paymentMethod' => $paymentMethod,
                'event' => $event,
                'commentaire' => $this->remboursement->commentaire_admin,
                'myReservationsUrl' => $myReservationsUrl,
                'greeting' => $greeting,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'message' => 'Remboursement approuvé',
            'remboursement_id' => $this->remboursement->id,
            'montant' => $this->remboursement->montant,
            'processed_at' => $this->remboursement->date_traitement,
        ];
    }
}
