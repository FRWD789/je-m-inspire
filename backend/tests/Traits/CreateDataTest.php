<?php

namespace Tests\Traits;

use App\Models\Event;
use App\Models\User;
use App\Models\Operation;
use App\Models\Paiement;
use App\Models\Localisation;
use App\Models\CategorieEvent;
use App\Models\Role;
use Illuminate\Support\Facades\DB;

trait CreatesTestData
{
    /**
     * Créer toutes les données de base nécessaires pour les tests
     */
    protected function createBaseData(): void
    {
        // Localisation
        Localisation::create([
            'name' => 'Test Location',
            'address' => '123 Test Street, Montreal, QC',
            'latitude' => 45.5017,
            'longitude' => -73.5673,
        ]);

        // Catégorie d'événement
        CategorieEvent::create([
            'name' => 'Test Category',
            'description' => 'Test category description',
        ]);

        // Rôles
        Role::firstOrCreate(['role' => 'utilisateur']);
        Role::firstOrCreate(['role' => 'professionnel']);
        Role::firstOrCreate(['role' => 'admin']);

        // Types de paiement
        DB::table('type_paiements')->insert([
            ['name' => 'Carte de crédit', 'description' => 'Paiement par carte'],
            ['name' => 'PayPal', 'description' => 'Paiement PayPal'],
            ['name' => 'Virement', 'description' => 'Virement bancaire'],
        ]);

        // Types d'opération
        DB::table('type_operations')->insert([
            ['name' => 'Création', 'description' => 'Création d\'événement'],
            ['name' => 'Réservation', 'description' => 'Réservation de places'],
            ['name' => 'Abonnement', 'description' => 'Souscription abonnement'],
        ]);
    }

    /**
     * Créer un événement dans X jours
     */
    protected function createEvent(
        int $daysFromNow = 2,
        string $name = 'Test Event',
        int $hour = 14,
        int $minute = 0,
        float $price = 25.00
    ): Event {
        return Event::create([
            'name' => $name,
            'description' => 'Test event description for ' . $name,
            'start_date' => now()->addDays($daysFromNow)->setTime($hour, $minute),
            'end_date' => now()->addDays($daysFromNow)->setTime($hour + 2, $minute),
            'base_price' => $price,
            'capacity' => 50,
            'max_places' => 50,
            'available_places' => 50,
            'level' => 'Débutant',
            'priority' => 5,
            'localisation_id' => 1,
            'categorie_event_id' => 1,
        ]);
    }

    /**
     * Créer un événement dans X jours (alias)
     */
    protected function createEventInDays(int $days, ?string $name = null, int $hour = 14, int $minute = 0): Event
    {
        return $this->createEvent($days, $name ?? "Event in {$days} days", $hour, $minute);
    }

    /**
     * Créer une réservation payée
     */
    protected function createPaidReservation(
        User $user,
        Event $event,
        int $quantity = 1
    ): Operation {
        $paiement = Paiement::create([
            'total' => $event->base_price * $quantity,
            'status' => 'paid',
            'type_paiement_id' => 1,
            'taux_commission' => 10,
            'vendor_id' => $user->id,
        ]);

        return Operation::create([
            'user_id' => $user->id,
            'event_id' => $event->id,
            'type_operation_id' => 2, // Réservation
            'quantity' => $quantity,
            'paiement_id' => $paiement->paiement_id,
        ]);
    }

    /**
     * Créer une réservation en attente de paiement
     */
    protected function createPendingReservation(
        User $user,
        Event $event,
        int $quantity = 1
    ): Operation {
        return $this->createReservationWithStatus($user, $event, 'pending', $quantity);
    }

    /**
     * Créer une réservation avec un statut spécifique
     */
    protected function createReservationWithStatus(
        User $user,
        Event $event,
        string $status,
        int $quantity = 1
    ): Operation {
        $paiement = Paiement::create([
            'total' => $event->base_price * $quantity,
            'status' => $status,
            'type_paiement_id' => 1,
            'taux_commission' => 10,
            'vendor_id' => $user->id,
        ]);

        return Operation::create([
            'user_id' => $user->id,
            'event_id' => $event->id,
            'type_operation_id' => 2,
            'quantity' => $quantity,
            'paiement_id' => $paiement->paiement_id,
        ]);
    }

    /**
     * Créer une opération de création d'événement
     */
    protected function createEventCreationOperation(User $creator, Event $event): Operation
    {
        return Operation::create([
            'user_id' => $creator->id,
            'event_id' => $event->id,
            'type_operation_id' => 1, // Création
            'quantity' => 0,
        ]);
    }

    /**
     * Créer un utilisateur avec un rôle
     */
    protected function createUserWithRole(string $role, array $attributes = []): User
    {
        $user = User::factory()->create($attributes);

        $roleModel = Role::where('role', $role)->first();
        if ($roleModel) {
            $user->roles()->attach($roleModel->id);
        }

        return $user;
    }

    /**
     * Créer un utilisateur professionnel
     */
    protected function createProfessional(array $attributes = []): User
    {
        return $this->createUserWithRole('professionnel', $attributes);
    }

    /**
     * Créer un utilisateur admin
     */
    protected function createAdmin(array $attributes = []): User
    {
        return $this->createUserWithRole('admin', $attributes);
    }
}