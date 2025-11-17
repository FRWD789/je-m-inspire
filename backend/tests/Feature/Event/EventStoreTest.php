<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Event;
use App\Models\Localisation;
use App\Models\CategorieEvent;
use App\Models\Operation;
use App\Models\EventImage;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Tymon\JWTAuth\Facades\JWTAuth;

class EventStoreTest extends TestCase
{
    use DatabaseMigrations;

    protected function setUp(): void
    {
        parent::setUp();

        // Créer les rôles
        /*
        Role::factory()->create(['role' => 'utilisateur']);
        Role::factory()->create(['role' => 'professionnel']);
        Role::factory()->create(['role' => 'admin']);*/

        // Créer les rôles
        Role::create(['id' => 1, 'role' => 'client', 'description' => 'Client standard']);
        Role::create(['id' => 2, 'role' => 'professionnel', 'description' => 'Professionnel']);
        Role::create(['id' => 3, 'role' => 'admin', 'description' => 'Administrateur']);

        // Créer les types d'opérations (nécessaires pour les events)
        DB::table('type_operations')->insert([
            ['id' => 1, 'name' => 'creation', 'description' => 'Création d\'événement'],
            ['id' => 2, 'name' => 'reservation', 'description' => 'Réservation'],
        ]);

        // Créer une catégorie par défaut
        CategorieEvent::create([
            'name' => 'Sport',
            'description' => 'Événements sportifs',
        ]);

        Storage::fake('public');
    }

    /**
     * Créer un professionnel authentifié
     */
    private function createProfessional()
    {
        $user = User::factory()->create([
            'is_approved' => true,
            'approved_at' => now(),
        ]);

        $role = Role::where('role', 'professionnel')->first();
        $user->roles()->attach($role->id);

        $token = JWTAuth::claims(['type' => 'access'])->fromUser($user);

        return ['user' => $user, 'token' => $token];
    }

    /**
     * Données valides pour créer un événement
     */
    private function getValidEventData()
    {
        return [
            'name' => 'Cours de Yoga',
            'description' => 'Un cours de yoga pour tous les niveaux dans un cadre zen',
            'start_date' => now()->addDays(7)->format('Y-m-d H:i:s'),
            'end_date' => now()->addDays(7)->addHours(2)->format('Y-m-d H:i:s'),
            'base_price' => 25.50,
            'capacity' => 20,
            'max_places' => 20,
            'level' => 'Débutant',
            'priority' => 5,
            'localisation_address' => '123 Rue de la Paix, Paris',
            'localisation_lat' => 48.8566,
            'localisation_lng' => 2.3522,
            'categorie_event_id' => 1,
        ];
    }

    /**
     * Test 1: Création d'événement réussie par un professionnel
     */
    public function test_creation_evenement_par_professionnel()
    {
        $auth = $this->createProfessional();
        $data = $this->getValidEventData();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson('/api/events', $data);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Événement créé avec succès',
            ]);

        // Vérifier en DB
        $this->assertDatabaseHas('events', [
            'name' => 'Cours de Yoga',
            'base_price' => 25.50,
            'capacity' => 20,
            'max_places' => 20,
            'available_places' => 20,
        ]);

        // Vérifier que l'opération de création a été enregistrée
        $event = Event::where('name', 'Cours de Yoga')->first();
        $this->assertDatabaseHas('operations', [
            'user_id' => $auth['user']->id,
            'event_id' => $event->id,
            'type_operation_id' => 1, // Création
            'quantity' => 0,
        ]);
    }

    /**
     * Test 2: Création avec images
     */
    public function test_creation_evenement_avec_images()
    {
        $auth = $this->createProfessional();
        $data = $this->getValidEventData();

        $image1 = UploadedFile::fake()->image('event1.jpg');
        $image2 = UploadedFile::fake()->image('event2.png');
        $data['images'] = [$image1, $image2];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson('/api/events', $data);

        $response->assertStatus(201);

        // Vérifier que les images ont été créées
        $event = Event::where('name', 'Cours de Yoga')->first();
        $this->assertCount(2, $event->images);

        // Vérifier que les fichiers existent
        foreach ($event->images as $image) {
            Storage::disk('public')->assertExists($image->image_path);
        }
    }

    /**
     * Test 3: Création échoue - trop d'images (max 5)
     */
    public function test_creation_echec_trop_images()
    {
        $auth = $this->createProfessional();
        $data = $this->getValidEventData();

        // Créer 6 images
        $images = [];
        for ($i = 0; $i < 6; $i++) {
            $images[] = UploadedFile::fake()->image("event{$i}.jpg");
        }
        $data['images'] = $images;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson('/api/events', $data);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'error' => 'Maximum 5 images autorisées',
            ]);
    }

    /**
     * Test 4: Création échoue - capacity > max_places
     */
    public function test_creation_echec_capacity_superieure_max_places()
    {
        $auth = $this->createProfessional();
        $data = $this->getValidEventData();
        $data['capacity'] = 30;
        $data['max_places'] = 20;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson('/api/events', $data);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'error' => 'La capacité ne peut pas dépasser le nombre maximum de places',
            ]);
    }

    /**
     * Test 5: Création échoue - sans authentification
     */
    public function test_creation_sans_authentification()
    {
        $data = $this->getValidEventData();

        $response = $this->postJson('/api/events', $data);

        $response->assertStatus(401);
    }

    /**
     * Test 6: Création échoue - utilisateur simple (pas professionnel)
     */
    public function test_creation_par_utilisateur_simple()
    {
        $user = User::factory()->create([
            'is_approved' => true,
            'approved_at' => now(),
        ]);

        $role = Role::where('role', 'client')->first();
        $user->roles()->attach($role->id);

        $token = JWTAuth::claims(['type' => 'access'])->fromUser($user);

        $data = $this->getValidEventData();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json',
        ])->postJson('/api/events', $data);

        // Le controller utilise unauthorizedResponse() qui retourne 401
        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'error' => 'Seuls les professionnels peuvent créer des événements',
            ]);
    }

    /**
     * Test 7: Création réussie par un admin
     */
    public function test_creation_par_admin()
    {
        $user = User::factory()->create([
            'is_approved' => true,
            'approved_at' => now(),
        ]);

        $role = Role::where('role', 'admin')->first();
        $user->roles()->attach($role->id);

        $token = JWTAuth::claims(['type' => 'access'])->fromUser($user);

        $data = $this->getValidEventData();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json',
        ])->postJson('/api/events', $data);

        $response->assertStatus(201);
    }

    /**
     * Test 8: Création échoue - champs requis manquants
     */
    public function test_creation_champs_requis_manquants()
    {
        $auth = $this->createProfessional();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson('/api/events', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'name',
                'description',
                'start_date',
                'end_date',
                'base_price',
                'capacity',
                'max_places',
                'level',
                'priority',
                'localisation_address',
                'localisation_lat',
                'localisation_lng',
                'categorie_event_id',
            ]);
    }

    /**
     * Test 9: Création échoue - start_date dans le passé
     */
    public function test_creation_start_date_passe()
    {
        $auth = $this->createProfessional();
        $data = $this->getValidEventData();
        $data['start_date'] = now()->subDays(1)->format('Y-m-d H:i:s');

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson('/api/events', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['start_date']);
    }

    /**
     * Test 10: Création échoue - end_date avant start_date
     */
    public function test_creation_end_date_avant_start_date()
    {
        $auth = $this->createProfessional();
        $data = $this->getValidEventData();
        $data['start_date'] = now()->addDays(10)->format('Y-m-d H:i:s');
        $data['end_date'] = now()->addDays(5)->format('Y-m-d H:i:s');

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson('/api/events', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['end_date']);
    }

    /**
     * Test 11: Création avec localisation existante (réutilisation)
     */
    public function test_creation_reutilise_localisation_existante()
    {
        // Créer une localisation existante
        $existingLoc = Localisation::create([
            'name' => 'Paris Centre',
            'address' => '123 Rue de la Paix, Paris',
            'latitude' => 48.8566,
            'longitude' => 2.3522,
        ]);

        $auth = $this->createProfessional();
        $data = $this->getValidEventData();
        // Utiliser les mêmes coordonnées (dans la marge de 0.0001)
        $data['localisation_lat'] = 48.85661;
        $data['localisation_lng'] = 2.35221;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson('/api/events', $data);

        $response->assertStatus(201);

        // Vérifier qu'une seule localisation existe toujours
        $this->assertCount(1, Localisation::all());

        // Vérifier que l'événement utilise la localisation existante
        $event = Event::where('name', 'Cours de Yoga')->first();
        $this->assertEquals($existingLoc->id, $event->localisation_id);
    }

    /**
     * Test 12: Création avec nouvelle localisation
     */
    public function test_creation_cree_nouvelle_localisation()
    {
        $auth = $this->createProfessional();
        $data = $this->getValidEventData();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson('/api/events', $data);

        $response->assertStatus(201);

        // Vérifier qu'une localisation a été créée
        $this->assertDatabaseHas('localisations', [
            'address' => '123 Rue de la Paix, Paris',
            'latitude' => 48.8566,
            'longitude' => 2.3522,
        ]);
    }

    /**
     * Test 13: Création échoue - prix négatif
     */
    public function test_creation_prix_negatif()
    {
        $auth = $this->createProfessional();
        $data = $this->getValidEventData();
        $data['base_price'] = -10;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson('/api/events', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['base_price']);
    }

    /**
     * Test 14: Création échoue - catégorie inexistante
     */
    public function test_creation_categorie_inexistante()
    {
        $auth = $this->createProfessional();
        $data = $this->getValidEventData();
        $data['categorie_event_id'] = 999;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson('/api/events', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['categorie_event_id']);
    }

    /**
     * Test 15: Vérifier que available_places = max_places à la création
     */
    public function test_creation_available_places_egal_max_places()
    {
        $auth = $this->createProfessional();
        $data = $this->getValidEventData();
        $data['max_places'] = 50;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson('/api/events', $data);

        $response->assertStatus(201);

        $event = Event::where('name', 'Cours de Yoga')->first();
        $this->assertEquals(50, $event->available_places);
        $this->assertEquals(50, $event->max_places);
    }
}