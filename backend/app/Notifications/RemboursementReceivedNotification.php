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

        $myRefundsUrl = config('app.frontend_url', 'http://localhost:5173') . '/mes-remboursements';

        return (new MailMessage)
            ->subject('📨 Demande de remboursement reçue')
            ->greeting('Bonjour ' . $notifiable->name . ' ' . $notifiable->last_name . ',')
            ->line('Nous avons bien **reçu votre demande de remboursement**.')
            ->line('---')
            ->line('**Détails de la demande :**')
            ->line('🔖 **Numéro de demande :** #' . $this->remboursement->id)
            ->line('📅 **Date de demande :** ' . $this->remboursement->created_at->locale('fr')->isoFormat('dddd D MMMM YYYY à HH:mm'))
            ->line('💰 **Montant :** ' . number_format($this->remboursement->montant, 2, ',', ' ') . ' CAD')
            ->line('📊 **Statut :** En attente de traitement')
            ->line('---')
            ->line('**Événement concerné :**')
            ->line('📌 ' . $event->name)
            ->line('📅 ' . $event->start_date->locale('fr')->isoFormat('D MMMM YYYY'))
            ->line('---')
            ->line('**Motif de la demande :**')
            ->line('> ' . $this->remboursement->motif)
            ->line('---')
            ->action('Suivre ma demande', $myRefundsUrl)
            ->line('**Prochaines étapes :**')
            ->line('• Notre équipe va examiner votre demande sous **48h ouvrables**')
            ->line('• Vous recevrez un email dès qu\'une décision sera prise')
            ->line('• Vous pouvez suivre l\'état de votre demande dans votre espace personnel')
            ->line('---')
            ->line('**Informations importantes :**')
            ->line('• Si votre demande est approuvée, le remboursement sera effectué sous 5-10 jours ouvrables')
            ->line('• Le remboursement sera effectué sur le même moyen de paiement utilisé lors de l\'achat')
            ->line('• Pour toute question, contactez notre support')
            ->salutation('Cordialement, L\'équipe ' . config('app.name'));
    }

    public function toArray(object $notifiable): array
    {
        return [
            'message' => 'Demande de remboursement reçue',
            'remboursement_id' => $this->remboursement->id,
            'montant' => $this->remboursement->montant,
            'received_at' => now(),
        ];
    }
}