<?php

namespace App\Jobs;

use App\Models\Event;
use App\Models\Operation;
use App\Notifications\EventReminderNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendEventRemindersJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 120;

    public function __construct()
    {
        //
    }

    public function handle()
    {
        $debug = config('app.debug');

        // Date cible : exactement dans 2 jours
        $targetDate = now()->addDays(2)->startOfDay();
        $endDate = now()->addDays(2)->endOfDay();

        if ($debug) {
            Log::info('[Event Reminders] Recherche des événements', [
                'target_date' => $targetDate->toDateString(),
                'start' => $targetDate->toDateTimeString(),
                'end' => $endDate->toDateTimeString()
            ]);
        }

        // Récupérer les événements qui commencent dans 2 jours
        $events = Event::whereBetween('start_date', [$targetDate, $endDate])
            ->with(['operations' => function($query) {
                $query->where('type_operation_id', 2) // Réservations uniquement
                      ->with(['user', 'paiement']);
            }])
            ->get();

        if ($debug) {
            Log::info('[Event Reminders] Événements trouvés', [
                'count' => $events->count()
            ]);
        }

        $sentCount = 0;
        $errorCount = 0;

        foreach ($events as $event) {
            foreach ($event->operations as $operation) {
                // Vérifier que la réservation est payée
                if (!$operation->paiement || $operation->paiement->status !== 'paid') {
                    continue;
                }

                try {
                    $user = $operation->user;

                    if ($user && $user->email) {
                        $user->notify(new EventReminderNotification($event, $operation));
                        $sentCount++;

                        if ($debug) {
                            Log::info('[Event Reminders] Email envoyé', [
                                'event_id' => $event->id,
                                'event_name' => $event->name,
                                'user_id' => $user->id,
                                'user_email' => $user->email
                            ]);
                        }
                    }
                } catch (\Exception $e) {
                    $errorCount++;
                    Log::error('[Event Reminders] Erreur envoi email', [
                        'event_id' => $event->id,
                        'user_id' => $operation->user_id,
                        'error' => $e->getMessage()
                    ]);
                }
            }
        }

        Log::info('[Event Reminders] Traitement terminé', [
            'events_processed' => $events->count(),
            'emails_sent' => $sentCount,
            'errors' => $errorCount
        ]);
    }

    public function failed(\Throwable $exception)
    {
        Log::error('[Event Reminders] Job échoué', [
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString()
        ]);
    }
}