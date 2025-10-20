<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Event;
use App\Models\Localisation;
use App\Models\CategorieEvent;
use App\Models\Operation;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tymon\JWTAuth\Facades\JWTAuth;

class EventCancelReservationTest extends TestCase
{
    use DatabaseMigrations;

    /**
     * Désactiver les transactions pour éviter le conflit avec DB::beginTransaction()
     */
    protected $connectionsToTransact = [];

    protected function setUp(): void
    {
        parent::setUp();

        // Créer les rôles
        Role::factory()->create(['role' => 'utilisateur']);
        Role::factory()->create(['role' => 'professionnel']);
        Role::factory()->create(['role' => 'admin']);

        // Créer les types d'opérations
        DB::table('type_operations')->insert([
            ['id' => 1, 'name' => 'creation', 'description' => 'Création d\'événement'],
            ['id' => 2, 'name' => 'reservation', 'description' => 'Réservation'],
        ]);

        // Créer une catégorie
        CategorieEvent::create([
            'name' => 'Sport',
            'description' => 'Événements sportifs',
        ]);
    }

    /**
     * Créer un utilisateur authentifié
     */
    private function createAuthenticatedUser()
    {
        $user = User::factory()->create([
            'is_approved' => true,
            'approved_at' => now(),
        ]);

        $role = Role::where('role', 'utilisateur')->first();
        $user->roles()->attach($role->id);

        $token = JWTAuth::claims(['type' => 'access'])->fromUser($user);

        return ['user' => $user, 'token' => $token];
    }

    /**
     * Créer un événement avec une réservation
     */
    private function createEventWithReservation($user, $quantity = 2, $availablePlaces = 8)
    {
        $localisation = Localisation::create([
            'name' => 'Paris Centre',
            'address' => '123 Rue de la Paix',
            'latitude' => 48.8566,
            'longitude' => 2.3522,
        ]);

        $event = Event::create([
            'name' => 'Cours de Yoga',
            'description' => 'Un super cours',
            'start_date' => now()->addDays(7),
            'end_date' => now()->addDays(7)->addHours(2),
            'base_price' => 25.50,
            'capacity' => 20,
            'max_places' => 20,
            'available_places' => $availablePlaces, // 20 - $quantity
            'level' => 'Débutant',
            'priority' => 5,
            'localisation_id' => $localisation->id,
            'categorie_event_id' => 1,
        ]);

        // Créer la réservation
        $operation = Operation::create([
            'user_id' => $user->id,
            'event_id' => $event->id,
            'type_operation_id' => 2,
            'quantity' => $quantity,
        ]);

        return ['event' => $event, 'operation' => $operation];
    }

    /**
     * Test 1: Annulation réussie
     */
    public function test_annulation_reussie()
    {
        $auth = $this->createAuthenticatedUser();
        $data = $this->createEventWithReservation($auth['user'], 3, 17);

        // Vérifier l'état initial
        $this->assertEquals(17, $data['event']->available_places);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->deleteJson("/api/events/{$data['event']->id}/reservation");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Réservation annulée avec succès',
            ]);

        // Vérifier que la réservation a été supprimée
        $this->assertDatabaseMissing('operations', [
            'id' => $data['operation']->id,
        ]);

        // Vérifier que available_places a augmenté
        $data['event']->refresh();
        $this->assertEquals(20, $data['event']->available_places); // 17 + 3
    }

    /**
     * Test 2: Annulation échoue - réservation non trouvée
     */
    public function test_annulation_reservation_non_trouvee()
    {
        $auth = $this->createAuthenticatedUser();

        $localisation = Localisation::create([
            'name' => 'Paris Centre',
            'address' => '123 Rue de la Paix',
            'latitude' => 48.8566,
            'longitude' => 2.3522,
        ]);

        $event = Event::create([
            'name' => 'Cours de Yoga',
            'description' => 'Un super cours',
            'start_date' => now()->addDays(7),
            'end_date' => now()->addDays(7)->addHours(2),
            'base_price' => 25.50,
            'capacity' => 20,
            'max_places' => 20,
            'available_places' => 20,
            'level' => 'Débutant',
            'priority' => 5,
            'localisation_id' => $localisation->id,
            'categorie_event_id' => 1,
        ]);

        // Pas de réservation créée
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->deleteJson("/api/events/{$event->id}/reservation");

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'error' => 'Réservation non trouvée',
            ]);
    }

    /**
     * Test 3: Annulation échoue - sans authentification
     */
    public function test_annulation_sans_authentification()
    {
        $auth = $this->createAuthenticatedUser();
        $data = $this->createEventWithReservation($auth['user']);

        $response = $this->deleteJson("/api/events/{$data['event']->id}/reservation");

        $response->assertStatus(401);
    }

    /**
     * Test 4: Un utilisateur ne peut annuler que SA réservation
     */
    public function test_annulation_reservation_autre_utilisateur()
    {
        $auth1 = $this->createAuthenticatedUser();
        $auth2 = $this->createAuthenticatedUser();

        $data = $this->createEventWithReservation($auth1['user']);

        // auth2 essaie d'annuler la réservation de auth1
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth2['token'],
            'Accept' => 'application/json',
        ])->deleteJson("/api/events/{$data['event']->id}/reservation");

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'error' => 'Réservation non trouvée',
            ]);

        // Vérifier que la réservation de auth1 existe toujours
        $this->assertDatabaseHas('operations', [
            'id' => $data['operation']->id,
            'user_id' => $auth1['user']->id,
        ]);
    }

    /**
     * Test 5: Annulation avec quantity = 1
     */
    public function test_annulation_une_place()
    {
        $auth = $this->createAuthenticatedUser();
        $data = $this->createEventWithReservation($auth['user'], 1, 19);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->deleteJson("/api/events/{$data['event']->id}/reservation");

        $response->assertStatus(200);

        $data['event']->refresh();
        $this->assertEquals(20, $data['event']->available_places);
    }

    /**
     * Test 6: Annulation avec quantity = 10 (maximum)
     */
    public function test_annulation_dix_places()
    {
        $auth = $this->createAuthenticatedUser();
        $data = $this->createEventWithReservation($auth['user'], 10, 10);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->deleteJson("/api/events/{$data['event']->id}/reservation");

        $response->assertStatus(200);

        $data['event']->refresh();
        $this->assertEquals(20, $data['event']->available_places);
    }

    /**
     * Test 7: Transaction rollback en cas d'erreur
     */
    public function test_annulation_transaction_rollback()
    {
        $auth = $this->createAuthenticatedUser();
        $data = $this->createEventWithReservation($auth['user'], 2, 18);

        // Forcer une erreur en supprimant l'opération avant la requête
        // (pour simuler une condition de course)
        $operationId = $data['operation']->id;
        $data['operation']->delete();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->deleteJson("/api/events/{$data['event']->id}/reservation");

        $response->assertStatus(404);

        // Vérifier que available_places n'a pas changé
        $data['event']->refresh();
        $this->assertEquals(18, $data['event']->available_places);
    }

    /**
     * Test 8: Annulation puis nouvelle réservation possible
     */
    public function test_annulation_puis_nouvelle_reservation()
    {
        $auth = $this->createAuthenticatedUser();
        $data = $this->createEventWithReservation($auth['user'], 2, 18);

        // Annuler
        $response1 = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->deleteJson("/api/events/{$data['event']->id}/reservation");

        $response1->assertStatus(200);

        // Réserver à nouveau
        $response2 = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson("/api/events/{$data['event']->id}/reserve", [
            'quantity' => 3,
        ]);

        $response2->assertStatus(201);

        // Vérifier available_places final
        $data['event']->refresh();
        $this->assertEquals(17, $data['event']->available_places); // 20 - 3
    }

    /**
     * Test 9: Plusieurs utilisateurs peuvent annuler leurs réservations indépendamment
     */
    public function test_annulation_plusieurs_utilisateurs()
    {
        $auth1 = $this->createAuthenticatedUser();
        $auth2 = $this->createAuthenticatedUser();

        $localisation = Localisation::create([
            'name' => 'Paris Centre',
            'address' => '123 Rue de la Paix',
            'latitude' => 48.8566,
            'longitude' => 2.3522,
        ]);

        $event = Event::create([
            'name' => 'Cours de Yoga',
            'description' => 'Un super cours',
            'start_date' => now()->addDays(7),
            'end_date' => now()->addDays(7)->addHours(2),
            'base_price' => 25.50,
            'capacity' => 20,
            'max_places' => 20,
            'available_places' => 15, // 20 - 3 - 2
            'level' => 'Débutant',
            'priority' => 5,
            'localisation_id' => $localisation->id,
            'categorie_event_id' => 1,
        ]);

        // Créer 2 réservations
        Operation::create([
            'user_id' => $auth1['user']->id,
            'event_id' => $event->id,
            'type_operation_id' => 2,
            'quantity' => 1,
        ]);

        Operation::create([
            'user_id' => $auth2['user']->id,
            'event_id' => $event->id,
            'type_operation_id' => 2,
            'quantity' => 1,
        ]);

        // auth1 annule
        $response1 = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth1['token'],
            'Accept' => 'application/json',
        ])->deleteJson("/api/events/{$event->id}/reservation");

        $response1->assertStatus(200);

        $event->refresh();
        $this->assertEquals(19, $event->available_places);

        // auth2 annule
        $response2 = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth2['token'],
            'Accept' => 'application/json',
        ])->deleteJson("/api/events/{$event->id}/reservation");

        $response2->assertStatus(200);

        $event->refresh();
        $this->assertEquals(20, $event->available_places); // 18 + 2
    }

    /**
     * Test 10: Annulation ne retourne que le message de succès
     */
    public function test_annulation_format_reponse()
    {
        $auth = $this->createAuthenticatedUser();
        $data = $this->createEventWithReservation($auth['user']);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->deleteJson("/api/events/{$data['event']->id}/reservation");

        $response->assertStatus(200)
            ->assertExactJson([
                'success' => true,
                'message' => 'Réservation annulée avec succès',
            ]);

        // Pas d'autres données dans la réponse
        $this->assertArrayNotHasKey('operation', $response->json());
        $this->assertArrayNotHasKey('event', $response->json());
    }

    /**
     * Test 11: Vérifier le lock pessimiste (lockForUpdate)
     */
    public function test_annulation_avec_lock()
    {
        $auth = $this->createAuthenticatedUser();
        $data = $this->createEventWithReservation($auth['user'], 5, 15);

        // Vérifier l'état avant
        $this->assertEquals(15, $data['event']->available_places);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->deleteJson("/api/events/{$data['event']->id}/reservation");

        $response->assertStatus(200);

        // Vérifier que le calcul est correct
        $data['event']->refresh();
        $this->assertEquals(20, $data['event']->available_places);
    }

    /**
     * Test 12: Annulation d'un événement avec available_places = 0
     */
    public function test_annulation_evenement_complet()
    {
        $auth = $this->createAuthenticatedUser();
        $data = $this->createEventWithReservation($auth['user'], 5, 0);

        // L'événement est complet (0 places dispo)
        $this->assertEquals(0, $data['event']->available_places);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->deleteJson("/api/events/{$data['event']->id}/reservation");

        $response->assertStatus(200);

        // Après annulation, 5 places redeviennent disponibles
        $data['event']->refresh();
        $this->assertEquals(5, $data['event']->available_places);
    }
}