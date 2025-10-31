<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Operation;

class ReservationConfirmedNotification extends Notification
{
    use Queueable;

    public $operation;

    public function __construct(Operation $operation)
    {
        $this->operation = $operation;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $event = $this->operation->event;
        $paiement = $this->operation->paiement;

        $eventUrl = config('app.frontend_url', 'http://localhost:5173') . '/events/' . $event->id;
        $myReservationsUrl = config('app.frontend_url', 'http://localhost:5173') . '/my-reservations';

        return (new MailMessage)
            ->subject('✅ Confirmation de réservation - ' . $event->name)
            ->greeting('Bonjour ' . $notifiable->name . ' ' . $notifiable->last_name . ',')
            ->line('Votre réservation a été **confirmée avec succès** ! 🎉')
            ->line('---')
            ->line('**Détails de l\'événement :**')
            ->line('📌 **Événement :** ' . $event->name)
            ->line('📅 **Date de début :** ' . $event->start_date->locale('fr')->isoFormat('dddd D MMMM YYYY à HH:mm'))
            ->line('📅 **Date de fin :** ' . $event->end_date->locale('fr')->isoFormat('dddd D MMMM YYYY à HH:mm'))
            ->line('📍 **Lieu :** ' . $event->localisation->name . ' - ' . $event->localisation->address)
            ->line('📊 **Niveau :** ' . $event->level)
            ->line('---')
            ->line('**Détails du paiement :**')
            ->line('💰 **Montant payé :** ' . number_format($paiement->total, 2, ',', ' ') . ' CAD')
            ->line('✅ **Statut :** ' . ($paiement->status === 'paid' ? 'Payé' : ucfirst($paiement->status)))
            ->line('🔖 **Numéro de réservation :** #' . $this->operation->id)
            ->line('---')
            ->action('Voir l\'événement', $eventUrl)
            ->line('Vous pouvez consulter toutes vos réservations dans votre espace personnel.')
            ->action('Mes réservations', $myReservationsUrl)
            ->line('---')
            ->line('**Informations importantes :**')
            ->line('• Veuillez conserver cet email comme preuve de réservation')
            ->line('• En cas de questions, contactez l\'organisateur via la page de l\'événement')
            ->line('• Consultez notre politique d\'annulation sur notre site')
            ->line('---')
            ->line('Nous vous souhaitons un excellent événement !')
            ->salutation('À bientôt, L\'équipe ' . config('app.name'));
    }

    public function toArray(object $notifiable): array
    {
        return [
            'message' => 'Réservation confirmée',
            'event_id' => $this->operation->event_id,
            'operation_id' => $this->operation->id,
            'confirmed_at' => now(),
        ];
    }
}