<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Remboursement;

class RemboursementReceivedNotification extends Notification
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

        $myReservationsUrl = env("FRONTEND_URL") . '/my-reservations';

        $greeting = 'Bonjour ' . $notifiable->name . ' ' . $notifiable->last_name . ',';

        $processedDate = $this->remboursement->updated_at->locale('fr')->isoFormat('D MMMM YYYY à HH:mm');
        $paymentMethod = $paiement->provider === 'stripe' ? 'Carte bancaire (Stripe)' : 'PayPal';

        return (new MailMessage)
            ->subject('✅ Votre remboursement a été traité')
            ->view('emails.notifications.remboursement-received', [
                'user' => $notifiable,
                'amount' => $this->remboursement->montant,
                'processedDate' => $processedDate,
                'transactionId' => $this->remboursement->id,
                'paymentMethod' => $paymentMethod,
                'event' => $event,
                'myReservationsUrl' => $myReservationsUrl,
                'greeting' => $greeting,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'message' => 'Remboursement traité',
            'remboursement_id' => $this->remboursement->id,
            'montant' => $this->remboursement->montant,
            'processed_at' => now(),
        ];
    }
}
