<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Operation;
use App\Models\Remboursement;
use App\Models\Paiement;
use App\Notifications\EventCancelledNotification;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Tymon\JWTAuth\Facades\JWTAuth;
use Barryvdh\DomPDF\Facade\Pdf;

class EventManagementController extends Controller
{
    use ApiResponse;

    /**
     * Récupérer la liste des participants d'un événement
     */
    public function getParticipants($eventId)
    {
        $debug = config('app.debug');
        $user = JWTAuth::user();

        if (!$user) {
            return $this->unauthenticatedResponse();
        }

        try {
            // Vérifier que l'utilisateur est bien le créateur via Operations
            $isCreator = Operation::where([
                'event_id' => $eventId,
                'user_id' => $user->id,
                'type_operation_id' => 1
            ])->exists();

            if (!$isCreator) {
                return $this->notFoundResponse('Événement introuvable ou vous n\'êtes pas le créateur');
            }

            $event = Event::find($eventId);
            if (!$event) {
                return $this->notFoundResponse('Événement introuvable');
            }

            // Récupérer toutes les réservations avec paiement confirmé
            $participants = Operation::with(['user', 'paiement'])
                ->where('event_id', $eventId)
                ->where('type_operation_id', 2)
                ->whereHas('paiement', function($query) {
                    $query->where('status', 'paid');
                })
                ->get()
                ->map(function($operation) {
                    return [
                        'id' => $operation->id,
                        'user_id' => $operation->user_id,
                        'name' => $operation->user->name ?? 'N/A',
                        'last_name' => $operation->user->last_name ?? '',
                        'email' => $operation->user->email ?? 'N/A',
                        'phone' => $operation->user->phone ?? 'N/A',
                        'total_paid' => $operation->paiement->total ?? 0,
                        'payment_method' => $operation->paiement->session_id ? 'Stripe' :
                                           ($operation->paiement->paypal_id ? 'PayPal' : 'N/A'),
                        'reservation_date' => $operation->created_at->format('Y-m-d H:i:s'),
                    ];
                });

            if ($debug) {
                Log::info('[EventManagement] Participants récupérés', [
                    'event_id' => $eventId,
                    'user_id' => $user->id,
                    'participants_count' => $participants->count()
                ]);
            }

            return $this->successResponse([
                'event_id' => $eventId,
                'event_name' => $event->name,
                'participants' => $participants,
                'total_participants' => $participants->count(),
            ], 'Liste des participants récupérée avec succès');

        } catch (\Exception $e) {
            Log::error('[EventManagement] Erreur récupération participants: ' . $e->getMessage());
            return $this->errorResponse('Erreur lors de la récupération des participants', 500);
        }
    }

    /**
     * Générer un PDF avec la liste des participants
     * ?action=print pour ouvrir dans le navigateur (impression)
     * ?action=download (ou par défaut) pour télécharger
     */
    public function generateParticipantsPDF(Request $request, $eventId)
    {
        $debug = config('app.debug');
        $user = JWTAuth::user();

        if (!$user) {
            return $this->unauthenticatedResponse();
        }

        try {
            // Vérifier que l'utilisateur est bien le créateur via Operations
            $isCreator = Operation::where([
                'event_id' => $eventId,
                'user_id' => $user->id,
                'type_operation_id' => 1
            ])->exists();

            if (!$isCreator) {
                return $this->notFoundResponse('Événement introuvable ou vous n\'êtes pas le créateur');
            }

            $event = Event::with('localisation')->find($eventId);
            if (!$event) {
                return $this->notFoundResponse('Événement introuvable');
            }

            // Récupérer les participants (garder les relations complètes pour la vue)
            $participants = Operation::with(['user', 'paiement'])
                ->where('event_id', $eventId)
                ->where('type_operation_id', 2)
                ->whereHas('paiement', function($query) {
                    $query->where('status', 'paid');
                })
                ->orderBy('created_at', 'asc')
                ->get();

            if ($debug) {
                Log::info('[EventManagement] Génération PDF participants', [
                    'event_id' => $eventId,
                    'user_id' => $user->id,
                    'participants_count' => $participants->count(),
                    'action' => $request->query('action', 'download')
                ]);
            }

            // Préparer les données pour la vue PDF
            $data = [
                'event' => $event,
                'participants' => $participants,
                'total_participants' => $participants->count(),
                'generated_at' => now()->format('d/m/Y à H:i'),
                'organizer' => $user->name . ' ' . $user->last_name,
            ];

            // Générer le PDF
            $pdf = Pdf::loadView('pdf.participants-list', $data);
            $pdf->setPaper('A4', 'portrait');

            $filename = 'participants_' . str_replace(' ', '_', $event->name) . '_' . now()->format('Y-m-d') . '.pdf';

            // Si action=print, ouvrir dans le navigateur, sinon télécharger
            $action = $request->query('action', 'download');
            if ($action === 'print') {
                return $pdf->stream($filename);
            }

            return $pdf->download($filename);

        } catch (\Exception $e) {
            Log::error('[EventManagement] Erreur génération PDF: ' . $e->getMessage());
            return $this->errorResponse('Erreur lors de la génération du PDF', 500);
        }
    }

    /**
     * Annuler un événement
     * - Masque l'événement pour les nouveaux utilisateurs
     * - Crée des demandes de remboursement pour tous les participants
     * - Envoie un email au créateur avec la liste des remboursements à effectuer
     */
    public function cancelEvent($eventId)
    {
        $debug = config('app.debug');
        $user = JWTAuth::user();

        if (!$user) {
            return $this->unauthenticatedResponse();
        }

        try {
            DB::beginTransaction();

            // Vérifier que l'utilisateur est bien le créateur via Operations
            $isCreator = Operation::where([
                'event_id' => $eventId,
                'user_id' => $user->id,
                'type_operation_id' => 1
            ])->exists();

            if (!$isCreator) {
                DB::rollBack();
                return $this->notFoundResponse('Événement introuvable ou vous n\'êtes pas le créateur');
            }

            $event = Event::find($eventId);
            if (!$event) {
                DB::rollBack();
                return $this->notFoundResponse('Événement introuvable');
            }

            // Vérifier que l'événement n'est pas déjà annulé
            if ($event->is_cancelled) {
                DB::rollBack();
                return $this->errorResponse('Cet événement est déjà annulé', 400);
            }

            // Marquer l'événement comme annulé (masqué)
            $event->update([
                'is_cancelled' => true,
                'cancelled_at' => now(),
            ]);

            // Récupérer toutes les réservations avec paiement confirmé
            $reservations = Operation::with(['user', 'paiement'])
                ->where('event_id', $eventId)
                ->where('type_operation_id', 2)
                ->whereHas('paiement', function($query) {
                    $query->where('status', 'paid');
                })
                ->get();

            $refundsCreated = 0;
            $refundsList = [];

            foreach ($reservations as $reservation) {
                // Vérifier qu'il n'y a pas déjà une demande de remboursement
                $existingRefund = Remboursement::where('operation_id', $reservation->id)->first();

                if (!$existingRefund) {
                    // Créer une demande de remboursement automatique
                    $remboursement = Remboursement::create([
                        'user_id' => $reservation->user->id,
                        'operation_id' => $reservation->id,
                        'montant' => $reservation->paiement->total,
                        'motif' => 'Événement annulé par l\'organisateur',
                        'statut' => 'en_attente',
                    ]);

                    $refundsCreated++;

                    $refundsList[] = [
                        'participant' => $reservation->user->name . ' ' . $reservation->user->last_name,
                        'email' => $reservation->user->email,
                        'montant' => $reservation->paiement->total,
                        'remboursement_id' => $remboursement->id,
                    ];
                }
            }

            DB::commit();

            if ($debug) {
                Log::info('[EventManagement] Événement annulé', [
                    'event_id' => $eventId,
                    'user_id' => $user->id,
                    'refunds_created' => $refundsCreated,
                    'total_reservations' => $reservations->count()
                ]);
            }

            // Envoyer un email au créateur avec la liste des remboursements
            try {
                $user->notify(new EventCancelledNotification($event, $refundsList));

                if ($debug) {
                    Log::info('[EventManagement] Email annulation envoyé', [
                        'user_email' => $user->email,
                        'event_id' => $eventId
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('[EventManagement] Erreur envoi email: ' . $e->getMessage());
                // Ne pas bloquer la réponse si l'email échoue
            }

            return $this->successResponse([
                'event_id' => $event->id,
                'event_name' => $event->name,
                'participants_count' => $reservations->count(),
                'refunds_created' => $refundsCreated,
                'refunds_list' => $refundsList,
            ], 'Événement annulé avec succès. Les demandes de remboursement ont été créées.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('[EventManagement] Erreur annulation événement: ' . $e->getMessage());
            return $this->errorResponse('Erreur lors de l\'annulation de l\'événement', 500);
        }
    }
}
