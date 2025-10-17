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
use Illuminate\Support\Facades\DB;
use Tymon\JWTAuth\Facades\JWTAuth;

class EventReserveTest extends TestCase
{
    use DatabaseMigrations;

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
    private function createAuthenticatedUser($roleType = 'utilisateur')
    {
        $user = User::factory()->create([
            'is_approved' => true,
            'approved_at' => now(),
        ]);

        $role = Role::where('role', $roleType)->first();
        $user->roles()->attach($role->id);

        $token = JWTAuth::claims(['type' => 'access'])->fromUser($user);

        return ['user' => $user, 'token' => $token];
    }

    /**
     * Créer un événement futur
     */
    private function createFutureEvent($availablePlaces = 10)
    {
        $localisation = Localisation::create([
            'name' => 'Paris Centre',
            'address' => '123 Rue de la Paix',
            'latitude' => 48.8566,
            'longitude' => 2.3522,
        ]);

        return Event::create([
            'name' => 'Cours de Yoga',
            'description' => 'Un super cours',
            'start_date' => now()->addDays(7),
            'end_date' => now()->addDays(7)->addHours(2),
            'base_price' => 25.50,
            'capacity' => 20,
            'max_places' => 20,
            'available_places' => $availablePlaces,
            'level' => 'Débutant',
            'priority' => 5,
            'localisation_id' => $localisation->id,
            'categorie_event_id' => 1,
        ]);
    }

    /**
     * Test 1: Réservation réussie
     */
    public function test_reservation_reussie()
    {
        $auth = $this->createAuthenticatedUser();
        $event = $this->createFutureEvent(10);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson("/api/events/{$event->id}/reserve", [
            'quantity' => 2,
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Réservation effectuée avec succès',
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'operation',
                'event',
                'remaining_places',
            ]);

        // Vérifier en DB
        $this->assertDatabaseHas('operations', [
            'user_id' => $auth['user']->id,
            'event_id' => $event->id,
            'type_operation_id' => 2,
            'quantity' => 2,
        ]);

        // Vérifier que available_places a diminué
        $event->refresh();
        $this->assertEquals(8, $event->available_places);

        // Vérifier remaining_places dans la réponse
        $this->assertEquals(8, $response->json('remaining_places'));
    }

    /**
     * Test 2: Réservation échoue - événement non trouvé
     */
    public function test_reservation_evenement_non_trouve()
    {
        $auth = $this->createAuthenticatedUser();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson('/api/events/999/reserve', [
            'quantity' => 2,
        ]);

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'error' => 'Événement non trouvé',
            ]);
    }

    /**
     * Test 3: Réservation échoue - sans authentification
     */
    public function test_reservation_sans_authentification()
    {
        $event = $this->createFutureEvent();

        $response = $this->postJson("/api/events/{$event->id}/reserve", [
            'quantity' => 2,
        ]);

        $response->assertStatus(401);
    }

    /**
     * Test 4: Réservation échoue - événement passé
     */
    public function test_reservation_evenement_passe()
    {
        $auth = $this->createAuthenticatedUser();

        $localisation = Localisation::create([
            'name' => 'Paris Centre',
            'address' => '123 Rue de la Paix',
            'latitude' => 48.8566,
            'longitude' => 2.3522,
        ]);

        $event = Event::create([
            'name' => 'Cours passé',
            'description' => 'Un super cours',
            'start_date' => now()->subDays(1), // ❌ Dans le passé
            'end_date' => now()->subDays(1)->addHours(2),
            'base_price' => 25.50,
            'capacity' => 20,
            'max_places' => 20,
            'available_places' => 10,
            'level' => 'Débutant',
            'priority' => 5,
            'localisation_id' => $localisation->id,
            'categorie_event_id' => 1,
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson("/api/events/{$event->id}/reserve", [
            'quantity' => 2,
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'error' => 'Impossible de réserver pour un événement passé ou en cours',
            ]);
    }

    /**
     * Test 5: Réservation échoue - places insuffisantes
     */
    public function test_reservation_places_insuffisantes()
    {
        $auth = $this->createAuthenticatedUser();
        $event = $this->createFutureEvent(3); // Seulement 3 places disponibles

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson("/api/events/{$event->id}/reserve", [
            'quantity' => 5, // Demande 5 places
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'error' => 'Places insuffisantes disponibles',
            ]);

        // Vérifier que rien n'a été créé
        $this->assertDatabaseMissing('operations', [
            'user_id' => $auth['user']->id,
            'event_id' => $event->id,
            'type_operation_id' => 2,
        ]);

        // Vérifier que available_places n'a pas changé
        $event->refresh();
        $this->assertEquals(3, $event->available_places);
    }

    /**
     * Test 6: Réservation échoue - réservation déjà existante
     */
    public function test_reservation_deja_existante()
    {
        $auth = $this->createAuthenticatedUser();
        $event = $this->createFutureEvent(10);

        // Créer une première réservation
        Operation::create([
            'user_id' => $auth['user']->id,
            'event_id' => $event->id,
            'type_operation_id' => 2,
            'quantity' => 2,
        ]);

        // Tenter une deuxième réservation
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson("/api/events/{$event->id}/reserve", [
            'quantity' => 1,
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'error' => 'Vous avez déjà une réservation pour cet événement',
            ]);
    }

    /**
     * Test 7: Réservation échoue - quantity manquante
     */
    public function test_reservation_quantity_manquante()
    {
        $auth = $this->createAuthenticatedUser();
        $event = $this->createFutureEvent();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson("/api/events/{$event->id}/reserve", []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['quantity']);
    }

    /**
     * Test 8: Réservation échoue - quantity invalide (< 1)
     */
    public function test_reservation_quantity_invalide_min()
    {
        $auth = $this->createAuthenticatedUser();
        $event = $this->createFutureEvent();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson("/api/events/{$event->id}/reserve", [
            'quantity' => 0,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['quantity']);
    }

    /**
     * Test 9: Réservation échoue - quantity invalide (> 10)
     */
    public function test_reservation_quantity_invalide_max()
    {
        $auth = $this->createAuthenticatedUser();
        $event = $this->createFutureEvent();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson("/api/events/{$event->id}/reserve", [
            'quantity' => 11,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['quantity']);
    }

    /**
     * Test 10: Réservation de la dernière place disponible
     */
    public function test_reservation_derniere_place()
    {
        $auth = $this->createAuthenticatedUser();
        $event = $this->createFutureEvent(1); // 1 seule place

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson("/api/events/{$event->id}/reserve", [
            'quantity' => 1,
        ]);

        $response->assertStatus(201);

        // Vérifier que available_places = 0
        $event->refresh();
        $this->assertEquals(0, $event->available_places);
    }

    /**
     * Test 11: Réservation maximum autorisée (10 places)
     */
    public function test_reservation_quantite_maximum()
    {
        $auth = $this->createAuthenticatedUser();
        $event = $this->createFutureEvent(15);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson("/api/events/{$event->id}/reserve", [
            'quantity' => 10, // Maximum autorisé
        ]);

        $response->assertStatus(201);

        $event->refresh();
        $this->assertEquals(5, $event->available_places);
    }

    /**
     * Test 12: Plusieurs utilisateurs peuvent réserver le même événement
     */
    public function test_reservation_plusieurs_utilisateurs()
    {
        $auth1 = $this->createAuthenticatedUser();
        $auth2 = $this->createAuthenticatedUser();
        $event = $this->createFutureEvent(10);

        // Première réservation
        $response1 = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth1['token'],
            'Accept' => 'application/json',
        ])->postJson("/api/events/{$event->id}/reserve", [
            'quantity' => 3,
        ]);

        $response1->assertStatus(201);

        // Deuxième réservation par un autre utilisateur
        $response2 = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth2['token'],
            'Accept' => 'application/json',
        ])->postJson("/api/events/{$event->id}/reserve", [
            'quantity' => 2,
        ]);

        $response2->assertStatus(201);

        // Vérifier available_places
        $event->refresh();
        $this->assertEquals(5, $event->available_places); // 10 - 3 - 2 = 5
    }

    /**
     * Test 13: Un professionnel peut réserver un événement
     */
    public function test_reservation_par_professionnel()
    {
        $auth = $this->createAuthenticatedUser('professionnel');
        $event = $this->createFutureEvent(10);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson("/api/events/{$event->id}/reserve", [
            'quantity' => 2,
        ]);

        $response->assertStatus(201);
    }

    /**
     * Test 14: Transaction rollback en cas d'erreur
     * (Ce test vérifie l'intégrité transactionnelle)
     */
    public function test_reservation_transaction_rollback()
    {
        $auth = $this->createAuthenticatedUser();
        $event = $this->createFutureEvent(5);

        // Essayer de réserver trop de places
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson("/api/events/{$event->id}/reserve", [
            'quantity' => 10, // Plus que disponible
        ]);

        $response->assertStatus(422);

        // Vérifier que rien n'a été modifié
        $event->refresh();
        $this->assertEquals(5, $event->available_places);

        $this->assertDatabaseMissing('operations', [
            'user_id' => $auth['user']->id,
            'event_id' => $event->id,
            'type_operation_id' => 2,
        ]);
    }

    /**
     * Test 15: Vérifier le format de la réponse complète
     */
    public function test_reservation_format_reponse()
    {
        $auth = $this->createAuthenticatedUser();
        $event = $this->createFutureEvent(10);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson("/api/events/{$event->id}/reserve", [
            'quantity' => 2,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'operation' => [
                    'id',
                    'user_id',
                    'event_id',
                    'type_operation_id',
                    'quantity',
                ],
                'event',
                'remaining_places',
            ]);

        // Vérifier les valeurs
        $this->assertEquals($auth['user']->id, $response->json('operation.user_id'));
        $this->assertEquals($event->id, $response->json('operation.event_id'));
        $this->assertEquals(2, $response->json('operation.quantity'));
        $this->assertEquals(8, $response->json('remaining_places'));
    }
}