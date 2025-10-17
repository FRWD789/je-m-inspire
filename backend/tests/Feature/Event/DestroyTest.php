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
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Tymon\JWTAuth\Facades\JWTAuth;

class EventDestroyTest extends TestCase
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

        Storage::fake('public');
    }

    /**
     * Créer un utilisateur authentifié
     */
    private function createAuthenticatedUser($roleType = 'professionnel')
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
     * Créer un événement
     */
    private function createEvent($creatorId = null)
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
            'available_places' => 20,
            'level' => 'Débutant',
            'priority' => 5,
            'localisation_id' => $localisation->id,
            'categorie_event_id' => 1,
        ]);

        // Créer l'opération de création si un créateur est fourni
        if ($creatorId) {
            Operation::create([
                'user_id' => $creatorId,
                'event_id' => $event->id,
                'type_operation_id' => 1,
                'quantity' => 0,
            ]);
        }

        return $event;
    }

    /**
     * Test 1: Suppression réussie par le créateur
     */
    public function test_suppression_par_createur()
    {
        $auth = $this->createAuthenticatedUser('professionnel');
        $event = $this->createEvent($auth['user']->id);

        $eventId = $event->id;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->deleteJson("/api/events/{$eventId}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Événement supprimé avec succès',
            ]);

        // Vérifier que l'événement a été supprimé
        $this->assertDatabaseMissing('events', [
            'id' => $eventId,
        ]);

        // Vérifier que l'opération de création a été supprimée (cascade)
        $this->assertDatabaseMissing('operations', [
            'event_id' => $eventId,
            'type_operation_id' => 1,
        ]);
    }

    /**
     * Test 2: Suppression réussie par un admin
     */
    public function test_suppression_par_admin()
    {
        $creator = $this->createAuthenticatedUser('professionnel');
        $admin = $this->createAuthenticatedUser('admin');

        $event = $this->createEvent($creator['user']->id);
        $eventId = $event->id;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $admin['token'],
            'Accept' => 'application/json',
        ])->deleteJson("/api/events/{$eventId}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('events', [
            'id' => $eventId,
        ]);
    }

    /**
     * Test 3: Suppression échoue - événement non trouvé
     */
    public function test_suppression_evenement_non_trouve()
    {
        $auth = $this->createAuthenticatedUser('professionnel');

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->deleteJson('/api/events/99999');

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'error' => 'Événement non trouvé',
            ]);
    }

    /**
     * Test 4: Suppression échoue - sans authentification
     */
    public function test_suppression_sans_authentification()
    {
        $auth = $this->createAuthenticatedUser('professionnel');
        $event = $this->createEvent($auth['user']->id);

        $response = $this->deleteJson("/api/events/{$event->id}");

        $response->assertStatus(401);
    }

    /**
     * Test 5: Suppression échoue - par un autre professionnel
     */
    public function test_suppression_par_autre_professionnel()
    {
        $creator = $this->createAuthenticatedUser('professionnel');
        $otherPro = $this->createAuthenticatedUser('professionnel');

        $event = $this->createEvent($creator['user']->id);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $otherPro['token'],
            'Accept' => 'application/json',
        ])->deleteJson("/api/events/{$event->id}");

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'error' => 'Vous n\'êtes pas autorisé à supprimer cet événement',
            ]);

        // Vérifier que l'événement existe toujours
        $this->assertDatabaseHas('events', [
            'id' => $event->id,
        ]);
    }

    /**
     * Test 6: Suppression échoue - par un utilisateur simple
     */
    public function test_suppression_par_utilisateur_simple()
    {
        $creator = $this->createAuthenticatedUser('professionnel');
        $user = $this->createAuthenticatedUser('utilisateur');

        $event = $this->createEvent($creator['user']->id);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $user['token'],
            'Accept' => 'application/json',
        ])->deleteJson("/api/events/{$event->id}");

        $response->assertStatus(401);

        // Vérifier que l'événement existe toujours
        $this->assertDatabaseHas('events', [
            'id' => $event->id,
        ]);
    }

    /**
     * Test 7: Suppression avec images - les fichiers sont supprimés
     */
    public function test_suppression_avec_images()
    {
        $auth = $this->createAuthenticatedUser('professionnel');
        $event = $this->createEvent($auth['user']->id);

        // Créer des images
        $file1 = UploadedFile::fake()->image('image1.jpg');
        $file2 = UploadedFile::fake()->image('image2.jpg');

        $path1 = $file1->storeAs('event_images', 'image1.jpg', 'public');
        $path2 = $file2->storeAs('event_images', 'image2.jpg', 'public');

        EventImage::create([
            'event_id' => $event->id,
            'image_path' => $path1,
            'display_order' => 0,
        ]);

        EventImage::create([
            'event_id' => $event->id,
            'image_path' => $path2,
            'display_order' => 1,
        ]);

        // Vérifier que les fichiers existent
        Storage::disk('public')->assertExists($path1);
        Storage::disk('public')->assertExists($path2);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->deleteJson("/api/events/{$event->id}");

        $response->assertStatus(200);

        // Vérifier que les fichiers ont été supprimés
        Storage::disk('public')->assertMissing($path1);
        Storage::disk('public')->assertMissing($path2);

        // Vérifier que les entrées DB des images sont supprimées
        $this->assertDatabaseMissing('event_images', [
            'event_id' => $event->id,
        ]);
    }

    /**
     * Test 8: Suppression avec réservations existantes
     */
    public function test_suppression_avec_reservations()
    {
        $creator = $this->createAuthenticatedUser('professionnel');
        $user1 = $this->createAuthenticatedUser('utilisateur');
        $user2 = $this->createAuthenticatedUser('utilisateur');

        $event = $this->createEvent($creator['user']->id);

        // Créer des réservations
        Operation::create([
            'user_id' => $user1['user']->id,
            'event_id' => $event->id,
            'type_operation_id' => 2,
            'quantity' => 3,
        ]);

        Operation::create([
            'user_id' => $user2['user']->id,
            'event_id' => $event->id,
            'type_operation_id' => 2,
            'quantity' => 2,
        ]);

        $eventId = $event->id;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $creator['token'],
            'Accept' => 'application/json',
        ])->deleteJson("/api/events/{$eventId}");

        $response->assertStatus(200);

        // Vérifier que toutes les opérations ont été supprimées (cascade)
        $this->assertDatabaseMissing('operations', [
            'event_id' => $eventId,
        ]);
    }

    /**
     * Test 9: Transaction rollback en cas d'erreur
     */
    public function test_suppression_transaction_rollback()
    {
        $auth = $this->createAuthenticatedUser('professionnel');
        $event = $this->createEvent($auth['user']->id);

        // Supprimer l'événement avant la requête pour forcer une erreur
        $eventId = $event->id;
        $event->delete();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->deleteJson("/api/events/{$eventId}");

        $response->assertStatus(404);
    }

    /**
     * Test 10: La localisation n'est PAS supprimée (peut être utilisée par d'autres événements)
     */
    public function test_suppression_garde_localisation()
    {
        $auth = $this->createAuthenticatedUser('professionnel');
        $event = $this->createEvent($auth['user']->id);

        $localisationId = $event->localisation_id;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->deleteJson("/api/events/{$event->id}");

        $response->assertStatus(200);

        // La localisation doit toujours exister
        $this->assertDatabaseHas('localisations', [
            'id' => $localisationId,
        ]);
    }

    /**
     * Test 11: Suppression ne retourne que le message de succès
     */
    public function test_suppression_format_reponse()
    {
        $auth = $this->createAuthenticatedUser('professionnel');
        $event = $this->createEvent($auth['user']->id);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->deleteJson("/api/events/{$event->id}");

        $response->assertStatus(200)
            ->assertExactJson([
                'success' => true,
                'message' => 'Événement supprimé avec succès',
            ]);
    }

    /**
     * Test 12: Admin peut supprimer n'importe quel événement
     */
    public function test_admin_peut_tout_supprimer()
    {
        $pro1 = $this->createAuthenticatedUser('professionnel');
        $pro2 = $this->createAuthenticatedUser('professionnel');
        $admin = $this->createAuthenticatedUser('admin');

        // Créer des événements de différents créateurs
        $event1 = $this->createEvent($pro1['user']->id);
        $event2 = $this->createEvent($pro2['user']->id);

        // Admin supprime l'événement de pro1
        $response1 = $this->withHeaders([
            'Authorization' => 'Bearer ' . $admin['token'],
            'Accept' => 'application/json',
        ])->deleteJson("/api/events/{$event1->id}");

        $response1->assertStatus(200);

        // Admin supprime l'événement de pro2
        $response2 = $this->withHeaders([
            'Authorization' => 'Bearer ' . $admin['token'],
            'Accept' => 'application/json',
        ])->deleteJson("/api/events/{$event2->id}");

        $response2->assertStatus(200);

        // Les deux événements sont supprimés
        $this->assertDatabaseMissing('events', ['id' => $event1->id]);
        $this->assertDatabaseMissing('events', ['id' => $event2->id]);
    }
}