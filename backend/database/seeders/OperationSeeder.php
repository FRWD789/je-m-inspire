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
        // Récupère un user et un event (ou en crée si besoin)
        $user = User::first() ?? User::factory()->create();
        $event = Event::first() ?? Event::factory()->create([
            'name' => 'Concert Test',
            'base_price' => 50,
            'available_places' => 100,
            'start_date' => now()->addDays(10),
        ]);

        // Simuler plusieurs paiements + opérations
        for ($i = 1; $i <= 5; $i++) {
            $quantity = rand(1, 3);
            $total = $quantity * $event->base_price;

            // Paiement fictif
            $paiement = Paiement::create([
                'total' => $total,
                'status' => fake()->randomElement(['pending', 'paid', 'failed']),
                'type_paiement_id' => 1, // Paiement unique
                'taux_commission' => 0,
                'vendor_id' => $event->localisation_id ?? null,
                'session_id' => 'fake_session_' . uniqid(),
                'stripe_id' => 'fake_stripe_' . uniqid(),
                'paypal_id' => null,
                'stripe_subscription_id' => null,
            ]);

            // Operation liée (réservation)
            Operation::create([
                'user_id' => $user->id,
                'event_id' => $event->id,
                'type_operation_id' => 2, // réservation
                'quantity' => $quantity,
                'paiement_id' => $paiement->paiement_id,
            ]);
        }
    }
}
