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

        $greeting = 'Bonjour ' . $notifiable->name . ' ' . $notifiable->last_name . ',';

        return (new MailMessage)
            ->subject('✅ Confirmation de réservation - ' . $event->name)
            ->view('emails.notifications.reservation-confirmed', [
                'user' => $notifiable,
                'operation' => $this->operation,
                'event' => $event,
                'paiement' => $paiement,
                'eventUrl' => $eventUrl,
                'myReservationsUrl' => $myReservationsUrl,
                'greeting' => $greeting,
            ]);
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