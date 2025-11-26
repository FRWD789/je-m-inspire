<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Operation;
use App\Models\Paiement;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class DashboardController extends Controller
{
    use ApiResponse;

    /**
     * Récupérer les statistiques du dashboard selon le rôle de l'utilisateur
     */
    public function getStats()
    {
        $debug = config('app.debug');
        $user = Auth::user();

        if (!$user) {
            return $this->unauthenticatedResponse();
        }

        try {
            $stats = [];

            // Déterminer le rôle principal de l'utilisateur
            $role = $user->roles->first()->role ?? 'utilisateur';

            if ($debug) {
                Log::info('[Dashboard] Récupération stats', [
                    'user_id' => $user->id,
                    'role' => $role
                ]);
            }

            // 🎫 STATS PROFESSIONNELS : Meilleur événement
            if ($role === 'professionnel') {
                $stats['best_event'] = $this->getBestEvent($user);

                // 💰 STATS PRO PLUS : Revenus du mois
                if ($this->hasProPlus($user)) {
                    $stats['monthly_earnings'] = $this->getMonthlyEarnings($user);
                }
            }

            // 📅 STATS POUR TOUS : Prochaine réservation
            $stats['next_reservation'] = $this->getNextReservation($user);

            // 👥 STATS ADMIN : Demandes pending
            if ($role === 'admin') {
                $stats['pending_approvals'] = $this->getPendingApprovals();
            }

            if ($debug) {
                Log::info('[Dashboard] Stats générées', [
                    'user_id' => $user->id,
                    'stats_keys' => array_keys($stats)
                ]);
            }

            return $this->successResponse($stats, 'Statistiques du dashboard récupérées avec succès');

        } catch (\Exception $e) {
            Log::error('[Dashboard] Erreur récupération stats: ' . $e->getMessage(), [
                'user_id' => $user->id ?? null,
                'trace' => $e->getTraceAsString()
            ]);
            return $this->errorResponse('Erreur lors de la récupération des statistiques', 500);
        }
    }

    /**
     * Récupérer le meilleur événement (celui avec le plus de réservations)
     */
    private function getBestEvent($user): ?array
    {
        try {
            // Récupérer les événements créés par l'utilisateur
            $events = Event::where('creator_id', $user->id)
                ->get();

            if ($events->isEmpty()) {
                return null;
            }

            // Trouver l'événement avec le plus de réservations
            $bestEvent = null;
            $maxReservations = 0;

            foreach ($events as $event) {
                $reservations = ($event->capacity ?? 0) - ($event->available_places ?? 0);

                if ($reservations > $maxReservations) {
                    $maxReservations = $reservations;
                    $bestEvent = $event;
                }
            }

            if (!$bestEvent) {
                return null;
            }

            return [
                'name' => $bestEvent->name,
                'reservations' => $maxReservations,
                'event_id' => $bestEvent->id
            ];

        } catch (\Exception $e) {
            Log::error('[Dashboard] Erreur getBestEvent: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Récupérer la prochaine réservation à venir
     */
    private function getNextReservation($user): ?array
    {
        try {
            // Récupérer les réservations de l'utilisateur avec paiement confirmé
            $reservations = Operation::with('event')
                ->where('user_id', $user->id)
                ->where('type_operation_id', 2) // Type réservation
                ->whereHas('paiement', function($query) {
                    $query->where('status', 'paid');
                })
                ->get();

            if ($reservations->isEmpty()) {
                return null;
            }

            // Filtrer les événements futurs et trier par date
            $futureReservations = $reservations
                ->filter(function($res) {
                    return $res->event && $res->event->start_date > now();
                })
                ->sortBy(function($res) {
                    return $res->event->start_date;
                });

            if ($futureReservations->isEmpty()) {
                return null;
            }

            $nextRes = $futureReservations->first();

            return [
                'event_name' => $nextRes->event->name,
                'event_id' => $nextRes->event->id,
                'date' => $nextRes->event->start_date->toISOString(),
                'days_until' => now()->diffInDays($nextRes->event->start_date, false)
            ];

        } catch (\Exception $e) {
            Log::error('[Dashboard] Erreur getNextReservation: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Récupérer les revenus du mois en cours (pour Pro Plus uniquement)
     */
    private function getMonthlyEarnings($user): float
    {
        try {
            $paiements = Paiement::where('vendor_id', $user->id)
                ->where('status', 'paid')
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->get();

            // Calculer les revenus nets (total - commission)
            $totalSales = $paiements->sum('total');
            $totalCommission = $paiements->sum(function($p) {
                return $p->total * ($p->taux_commission / 100);
            });

            $netEarnings = $totalSales - $totalCommission;

            return round($netEarnings, 2);

        } catch (\Exception $e) {
            Log::error('[Dashboard] Erreur getMonthlyEarnings: ' . $e->getMessage());
            return 0.0;
        }
    }

    /**
     * Récupérer le nombre de demandes d'approbation en attente
     */
    private function getPendingApprovals(): int
    {
        try {
            return User::where('is_approved', false)
                ->whereNull('rejection_reason')
                ->whereHas('roles', function($q) {
                    $q->where('role', 'professionnel');
                })
                ->count();

        } catch (\Exception $e) {
            Log::error('[Dashboard] Erreur getPendingApprovals: ' . $e->getMessage());
            return 0;
        }
    }

    /**
     * Vérifier si l'utilisateur a un abonnement Pro Plus actif
     */
    private function hasProPlus($user): bool
    {
        try {
            // Vérifier si l'utilisateur a un abonnement actif via les opérations
            $hasActiveSubscription = Operation::where('user_id', $user->id)
                ->where('type_operation_id', 3) // Type abonnement
                ->whereHas('abonnement', function($query) {
                    $query->where('status', 'active');
                })
                ->exists();

            return $hasActiveSubscription;

        } catch (\Exception $e) {
            Log::error('[Dashboard] Erreur hasProPlus: ' . $e->getMessage());
            return false;
        }
    }
}
