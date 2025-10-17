<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Event;
use App\Models\Operation;
use App\Models\Role;
use App\Models\Localisation;
use App\Models\CategorieEvent;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class MyEventTest extends TestCase
{
    use DatabaseMigrations;

    protected $user;
    protected $professionalUser;
    protected $localisation;
    protected $categorie;

    protected function setUp(): void
    {
        parent::setUp();

        // Créer les rôles
        Role::create(['id' => 1, 'role' => 'client', 'description' => 'Client standard']);
        Role::create(['id' => 2, 'role' => 'professionnel', 'description' => 'Professionnel']);
        Role::create(['id' => 3, 'role' => 'admin', 'description' => 'Administrateur']);

        // Créer les type_operations
        \DB::table('type_operations')->insert([
            ['id' => 1, 'name' => 'creation', 'description' => 'Création événement'],
            ['id' => 2, 'name' => 'reservation', 'description' => 'Réservation'],
        ]);

        // Créer les utilisateurs
        $this->user = User::factory()->create([
            'email' => 'client@test.com',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);
        $this->user->roles()->attach(1); // client

        $this->professionalUser = User::factory()->create([
            'email' => 'pro@test.com',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);
        $this->professionalUser->roles()->attach(2); // professionnel

        // Créer localisation et catégorie
        $this->localisation = Localisation::create([
            'name' => 'Test Location',
            'address' => '123 Test St',
            'latitude' => 45.5017,
            'longitude' => -73.5673,
        ]);

        $this->categorie = CategorieEvent::create([
            'name' => 'Test Category',
            'description' => 'Test description',
        ]);
    }

    public function test_user_can_get_their_created_events()
    {
        // Créer un événement
        $event = Event::create([
            'name' => 'Mon événement',
            'description' => 'Description test',
            'start_date' => now()->addDays(10),
            'end_date' => now()->addDays(11),
            'base_price' => 50.00,
            'capacity' => 100,
            'max_places' => 100,
            'available_places' => 100,
            'level' => 'Débutant',
            'priority' => 5,
            'localisation_id' => $this->localisation->id,
            'categorie_event_id' => $this->categorie->id,
        ]);

        // Créer une opération de création
        Operation::create([
            'user_id' => $this->professionalUser->id,
            'event_id' => $event->id,
            'type_operation_id' => 1, // création
            'quantity' => 0,
        ]);

        // Générer le token JWT
        $token = JWTAuth::fromUser($this->professionalUser);

        // Appeler la route avec le token dans le header
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/my-events');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'events',
                'created_events',
                'reserved_events',
                'total',
                'total_created',
                'total_reserved',
            ])
            ->assertJson([
                'success' => true,
                'total_created' => 1,
                'total_reserved' => 0,
            ]);

        // Vérifier que l'événement est bien dans created_events
        $this->assertEquals('Mon événement', $response->json('created_events.0.name'));
        $this->assertTrue($response->json('created_events.0.is_creator'));
    }

    public function test_user_can_get_their_reserved_events()
    {
        // Créer un événement d'un autre utilisateur
        $event = Event::create([
            'name' => 'Événement réservé',
            'description' => 'Description test',
            'start_date' => now()->addDays(10),
            'end_date' => now()->addDays(11),
            'base_price' => 50.00,
            'capacity' => 100,
            'max_places' => 100,
            'available_places' => 95,
            'level' => 'Débutant',
            'priority' => 5,
            'localisation_id' => $this->localisation->id,
            'categorie_event_id' => $this->categorie->id,
        ]);

        // Créer une opération de création pour le pro
        Operation::create([
            'user_id' => $this->professionalUser->id,
            'event_id' => $event->id,
            'type_operation_id' => 1, // création
            'quantity' => 0,
        ]);

        // Créer une réservation pour le client
        Operation::create([
            'user_id' => $this->user->id,
            'event_id' => $event->id,
            'type_operation_id' => 2, // réservation
            'quantity' => 5,
        ]);

        // Générer le token JWT pour le client
        $token = JWTAuth::fromUser($this->user);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/my-events');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'total_created' => 0,
                'total_reserved' => 1,
            ]);

        // Vérifier que l'événement est bien dans reserved_events
        $this->assertEquals('Événement réservé', $response->json('reserved_events.0.name'));
        $this->assertFalse($response->json('reserved_events.0.is_creator'));
        $this->assertTrue($response->json('reserved_events.0.is_reserved'));
    }

    public function test_user_can_have_both_created_and_reserved_events()
    {
        // Événement créé par l'utilisateur
        $eventCreated = Event::create([
            'name' => 'Mon événement créé',
            'description' => 'Description',
            'start_date' => now()->addDays(10),
            'end_date' => now()->addDays(11),
            'base_price' => 50.00,
            'capacity' => 100,
            'max_places' => 100,
            'available_places' => 100,
            'level' => 'Débutant',
            'priority' => 5,
            'localisation_id' => $this->localisation->id,
            'categorie_event_id' => $this->categorie->id,
        ]);

        Operation::create([
            'user_id' => $this->professionalUser->id,
            'event_id' => $eventCreated->id,
            'type_operation_id' => 1,
            'quantity' => 0,
        ]);

        // Événement réservé par l'utilisateur
        $eventReserved = Event::create([
            'name' => 'Événement réservé',
            'description' => 'Description',
            'start_date' => now()->addDays(15),
            'end_date' => now()->addDays(16),
            'base_price' => 30.00,
            'capacity' => 50,
            'max_places' => 50,
            'available_places' => 45,
            'level' => 'Intermédiaire',
            'priority' => 3,
            'localisation_id' => $this->localisation->id,
            'categorie_event_id' => $this->categorie->id,
        ]);

        // Créé par un autre pro
        Operation::create([
            'user_id' => $this->user->id,
            'event_id' => $eventReserved->id,
            'type_operation_id' => 1,
            'quantity' => 0,
        ]);

        // Réservé par le pro
        Operation::create([
            'user_id' => $this->professionalUser->id,
            'event_id' => $eventReserved->id,
            'type_operation_id' => 2,
            'quantity' => 5,
        ]);

        $token = JWTAuth::fromUser($this->professionalUser);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/my-events');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'total_created' => 1,
                'total_reserved' => 1,
                'total' => 2,
            ]);

        $createdEvents = $response->json('created_events');
        $reservedEvents = $response->json('reserved_events');

        $this->assertCount(1, $createdEvents);
        $this->assertCount(1, $reservedEvents);
        $this->assertEquals('Mon événement créé', $createdEvents[0]['name']);
        $this->assertEquals('Événement réservé', $reservedEvents[0]['name']);
    }

    public function test_user_with_multiple_reservations_for_same_event_sees_all()
    {
        $event = Event::create([
            'name' => 'Événement multi-réservation',
            'description' => 'Description',
            'start_date' => now()->addDays(10),
            'end_date' => now()->addDays(11),
            'base_price' => 50.00,
            'capacity' => 100,
            'max_places' => 100,
            'available_places' => 90,
            'level' => 'Débutant',
            'priority' => 5,
            'localisation_id' => $this->localisation->id,
            'categorie_event_id' => $this->categorie->id,
        ]);

        Operation::create([
            'user_id' => $this->professionalUser->id,
            'event_id' => $event->id,
            'type_operation_id' => 1,
            'quantity' => 0,
        ]);

        // Créer 2 réservations distinctes
        Operation::create([
            'user_id' => $this->user->id,
            'event_id' => $event->id,
            'type_operation_id' => 2,
            'quantity' => 5,
        ]);

        Operation::create([
            'user_id' => $this->user->id,
            'event_id' => $event->id,
            'type_operation_id' => 2,
            'quantity' => 5,
        ]);

        $token = JWTAuth::fromUser($this->user);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/my-events');

        $response->assertStatus(200);

        // L'utilisateur devrait voir 2 entrées pour le même événement
        $reservedEvents = $response->json('data.reserved_events');
        $this->assertCount(2, $reservedEvents);
    }

    public function test_unauthenticated_user_cannot_access_my_events()
    {
        $response = $this->getJson('/api/my-events');

        $response->assertStatus(401);
    }

    public function test_user_with_no_events_gets_empty_arrays()
    {
        $token = JWTAuth::fromUser($this->user);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/my-events');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'total_created' => 0,
                    'total_reserved' => 0,
                    'total' => 0,
                ]
            ]);

        $this->assertEmpty($response->json('data.created_events'));
        $this->assertEmpty($response->json('data.reserved_events'));
    }
}