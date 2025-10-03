<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Paiement;
use App\Models\Event;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class VendorEarningsController extends Controller
{
    /**
     * Obtenir le résumé des revenus du vendeur
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // Vérifier que c'est un professionnel
        if (!$user->roles()->where('role', 'professionnel')->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Accès réservé aux professionnels'
            ], 403);
        }

        // Période (par défaut : tout)
        $period = $request->get('period', 'all'); // all, month, week, today
        $query = Paiement::where('vendor_id', $user->id)
            ->where('status', 'paid');

        // Filtrer par période
        switch ($period) {
            case 'today':
                $query->whereDate('created_at', today());
                break;
            case 'week':
                $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]);
                break;
            case 'month':
                $query->whereMonth('created_at', now()->month)
                      ->whereYear('created_at', now()->year);
                break;
        }

        $paiements = $query->with(['operation.event', 'operation.user'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Calculer les totaux
        $totalSales = $paiements->sum('total');
        $totalCommission = $paiements->sum(function($p) {
            return $p->total * ($p->taux_commission / 100);
        });
        $netEarnings = $totalSales - $totalCommission;

        // Nombre de transactions
        $transactionCount = $paiements->count();

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => [
                    'total_sales' => round($totalSales, 2),
                    'total_commission' => round($totalCommission, 2),
                    'net_earnings' => round($netEarnings, 2),
                    'transaction_count' => $transactionCount,
                    'commission_rate' => $user->commission_rate,
                    'period' => $period
                ],
                'transactions' => $paiements->map(function($p) {
                    $commission = $p->total * ($p->taux_commission / 100);
                    return [
                        'id' => $p->paiement_id,
                        'date' => $p->created_at->format('d/m/Y H:i'),
                        'event_name' => $p->operation->event->name ?? 'N/A',
                        'event_id' => $p->operation->event_id ?? null,
                        'customer_name' => $p->operation->user->name ?? 'Anonyme',
                        'amount' => round($p->total, 2),
                        'commission_rate' => $p->taux_commission,
                        'commission_amount' => round($commission, 2),
                        'net_amount' => round($p->total - $commission, 2),
                        'payment_method' => $p->session_id ? 'Stripe' : ($p->paypal_id ? 'PayPal' : 'N/A'),
                        'status' => $p->status
                    ];
                })
            ]
        ]);
    }

    /**
     * Obtenir les statistiques détaillées
     */
    public function statistics()
    {
        $user = Auth::user();

        if (!$user->roles()->where('role', 'professionnel')->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Accès réservé aux professionnels'
            ], 403);
        }

        // Revenus par mois (12 derniers mois)
        $monthlyEarnings = Paiement::where('vendor_id', $user->id)
            ->where('status', 'paid')
            ->where('created_at', '>=', now()->subMonths(12))
            ->select(
                DB::raw('YEAR(created_at) as year'),
                DB::raw('MONTH(created_at) as month'),
                DB::raw('SUM(total) as total_sales'),
                DB::raw('SUM(total * taux_commission / 100) as total_commission')
            )
            ->groupBy('year', 'month')
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->get()
            ->map(function($item) {
                return [
                    'period' => Carbon::create($item->year, $item->month)->format('M Y'),
                    'total_sales' => round($item->total_sales, 2),
                    'total_commission' => round($item->total_commission, 2),
                    'net_earnings' => round($item->total_sales - $item->total_commission, 2)
                ];
            });

        // Événements les plus rentables
        $topEvents = Paiement::where('vendor_id', $user->id)
            ->where('status', 'paid')
            ->join('operations', 'paiements.paiement_id', '=', 'operations.paiement_id')
            ->join('events', 'operations.event_id', '=', 'events.id')
            ->select(
                'events.id',
                'events.name',
                DB::raw('COUNT(paiements.paiement_id) as transaction_count'),
                DB::raw('SUM(paiements.total) as total_revenue'),
                DB::raw('SUM(paiements.total * paiements.taux_commission / 100) as total_commission')
            )
            ->groupBy('events.id', 'events.name')
            ->orderBy('total_revenue', 'desc')
            ->limit(5)
            ->get()
            ->map(function($item) {
                return [
                    'event_id' => $item->id,
                    'event_name' => $item->name,
                    'transaction_count' => $item->transaction_count,
                    'total_revenue' => round($item->total_revenue, 2),
                    'total_commission' => round($item->total_commission, 2),
                    'net_revenue' => round($item->total_revenue - $item->total_commission, 2)
                ];
            });

        // Répartition par méthode de paiement
       $paymentMethods = Paiement::where('vendor_id', $user->id)
            ->where('status', 'paid')
            ->get()
            ->groupBy(function($p) {
                if ($p->paypal_id) return 'PayPal';
                if ($p->session_id) return 'Stripe';
                return 'Autre';
            })
            ->map(function($group, $method) {
                return [
                    'method' => $method,
                    'count' => $group->count(),
                    'total' => round($group->sum('total'), 2)
                ];
            })
            ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'monthly_earnings' => $monthlyEarnings,
                'top_events' => $topEvents,
                'payment_methods' => $paymentMethods
            ]
        ]);
    }

    /**
     * Exporter les transactions en CSV
     */
    public function export(Request $request)
    {
        $user = Auth::user();

        if (!$user->roles()->where('role', 'professionnel')->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Accès réservé aux professionnels'
            ], 403);
        }

        $paiements = Paiement::where('vendor_id', $user->id)
            ->where('status', 'paid')
            ->with(['operation.event', 'operation.user'])
            ->orderBy('created_at', 'desc')
            ->get();

        $csv = "Date,Événement,Client,Montant,Taux Commission,Commission,Net,Méthode\n";

        foreach ($paiements as $p) {
            $commission = $p->total * ($p->taux_commission / 100);
            $net = $p->total - $commission;
            $method = $p->session_id ? 'Stripe' : ($p->paypal_id ? 'PayPal' : 'N/A');

            $csv .= sprintf(
                "%s,%s,%s,%.2f,%.2f%%,%.2f,%.2f,%s\n",
                $p->created_at->format('d/m/Y H:i'),
                $p->operation->event->name ?? 'N/A',
                $p->operation->user->name ?? 'Anonyme',
                $p->total,
                $p->taux_commission,
                $commission,
                $net,
                $method
            );
        }

        return response($csv, 200)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="revenus_' . now()->format('Y-m-d') . '.csv"');
    }
}
