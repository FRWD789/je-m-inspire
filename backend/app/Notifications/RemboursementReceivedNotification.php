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

        $myReservationsUrl = config('app.frontend_url') . '/my-reservations';

        $greeting = 'Bonjour ' . $notifiable->name . ' ' . $notifiable->last_name . ',';

        $processedDate = $this->remboursement->updated_at->locale('fr')->isoFormat('D MMMM YYYY à HH:mm');
        $paymentMethod = $paiement->provider === 'stripe' ? 'Carte bancaire (Stripe)' : 'PayPal';

        return (new MailMessage)
            ->subject('✅ Demande de remboursement reçue')
            ->view('emails.notifications.remboursement-received', [
                'amount' => $this->remboursement->montant,
                'receivedDate' => $this->remboursement->created_at->locale('fr')->isoFormat('D MMMM YYYY à HH:mm'),
                'refundId' => $this->remboursement->id,
                'paymentMethod' => $paymentMethod,
                'event' => $event,
                'myReservationsUrl' => $myReservationsUrl,
                'greeting' => $greeting,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'message' => 'Demande de remboursement reçue',
            'remboursement_id' => $this->remboursement->remboursement_id,
            'montant' => $this->remboursement->montant,
            'received_at' => $this->remboursement->created_at,
        ];
    }
}
