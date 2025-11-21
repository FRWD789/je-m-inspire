<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Event;
use App\Models\Paiement;
use App\Models\Operation;

class OperationSeeder extends Seeder
{
    public function run(): void
    {
        // Récupère le premier user et le 2ème event (Atelier de Yoga du 5 décembre 2025)
        $user = User::skip(2)->first();
        $event = Event::skip(1)->first(); // 2ème événement: Atelier de Yoga en Plein Air du 05/12/2025

        if (!$user || !$event) {
            $this->command->warn('Pas d\'utilisateur ou d\'événement trouvé, création ignorée.');
            return;
        }

        // Créer un paiement déjà effectué (status = 'paid') pour un événement futur
        $quantity = 2;
        $total = $quantity * $event->base_price;

        $paiement = Paiement::create([
            'total' => $total,
            'status' => 'paid', // Paiement déjà effectué
            'type_paiement_id' => 1, // Paiement unique (réservation)
            'taux_commission' => 10,
            'vendor_id' => $event->localisation_id ?? null,
            'session_id' => 'sess_' . uniqid(),
            'paypal_id' => 'paypal_' . uniqid(),
            'paypal_capture_id' => 'capture_' . uniqid(),
        ]);

        // Créer l'opération de réservation liée à ce paiement
        Operation::create([
            'user_id' => $user->id,
            'event_id' => $event->id, // Utiliser 'id' au lieu de 'event_id'
            'type_operation_id' => 2, // Type réservation
            'paiement_id' => $paiement->paiement_id,
        ]);

        $this->command->info("Paiement effectué créé pour l'événement futur: {$event->name}");
    }
}