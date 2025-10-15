<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Event;
use App\Models\EventImage;
use App\Models\Operation;
use App\Models\Role;
use App\Models\Localisation;
use App\Models\CategorieEvent;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class EventUpdateTest extends TestCase
{
    use DatabaseMigrations;

    protected $creator;
    protected $otherUser;
    protected $admin;
    protected $localisation;
    protected $categorie;
    protected $event;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

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
        $this->creator = User::factory()->create([
            'email' => 'creator@test.com',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);
        $this->creator->roles()->attach(2); // professionnel

        $this->otherUser = User::factory()->create([
            'email' => 'other@test.com',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);
        $this->otherUser->roles()->attach(2); // professionnel

        $this->admin = User::factory()->create([
            'email' => 'admin@test.com',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);
        $this->admin->roles()->attach(3); // admin

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

        // Créer un événement de base
        $this->event = Event::create([
            'name' => 'Événement Test',
            'description' => 'Description initiale',
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

        // Associer le créateur
        Operation::create([
            'user_id' => $this->creator->id,
            'event_id' => $this->event->id,
            'type_operation_id' => 1,
            'quantity' => 0,
        ]);
    }

    public function test_creator_can_update_event_basic_info()
    {
        $token = JWTAuth::fromUser($this->creator);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/events/{$this->event->id}", [
                'name' => 'Événement Modifié',
                'description' => 'Nouvelle description',
                'base_price' => 75.00,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Événement mis à jour avec succès',
            ]);

        $this->assertDatabaseHas('events', [
            'id' => $this->event->id,
            'name' => 'Événement Modifié',
            'description' => 'Nouvelle description',
            'base_price' => 75.00,
        ]);
    }

    public function test_admin_can_update_any_event()
    {
        $token = JWTAuth::fromUser($this->admin);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/events/{$this->event->id}", [
                'name' => 'Modifié par Admin',
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('events', [
            'id' => $this->event->id,
            'name' => 'Modifié par Admin',
        ]);
    }

    public function test_non_creator_cannot_update_event()
    {
        $token = JWTAuth::fromUser($this->otherUser);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/events/{$this->event->id}", [
                'name' => 'Tentative de modification',
            ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Vous n\'êtes pas autorisé à modifier cet événement',
            ]);

        // Vérifier que l'événement n'a pas été modifié
        $this->assertDatabaseHas('events', [
            'id' => $this->event->id,
            'name' => 'Événement Test',
        ]);
    }

    public function test_cannot_update_nonexistent_event()
    {
        $token = JWTAuth::fromUser($this->creator);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/events/99999", [
                'name' => 'Test',
            ]);

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => 'Événement non trouvé',
            ]);
    }

    public function test_can_add_new_images_to_event()
    {
        $token = JWTAuth::fromUser($this->creator);

        $image1 = UploadedFile::fake()->image('test1.jpg', 800, 600);
        $image2 = UploadedFile::fake()->image('test2.jpg', 800, 600);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/events/{$this->event->id}", [
                'images' => [$image1, $image2],
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseCount('event_images', 2);
        $this->assertDatabaseHas('event_images', [
            'event_id' => $this->event->id,
            'display_order' => 0,
        ]);
        $this->assertDatabaseHas('event_images', [
            'event_id' => $this->event->id,
            'display_order' => 1,
        ]);

        Storage::disk('public')->assertExists(
            EventImage::where('event_id', $this->event->id)->first()->image_path
        );
    }

    public function test_can_delete_existing_images()
    {
        // Créer 3 images existantes
        $image1 = EventImage::create([
            'event_id' => $this->event->id,
            'image_path' => 'event_images/test1.jpg',
            'display_order' => 0,
        ]);

        $image2 = EventImage::create([
            'event_id' => $this->event->id,
            'image_path' => 'event_images/test2.jpg',
            'display_order' => 1,
        ]);

        $image3 = EventImage::create([
            'event_id' => $this->event->id,
            'image_path' => 'event_images/test3.jpg',
            'display_order' => 2,
        ]);

        // Créer les fichiers fictifs
        Storage::disk('public')->put('event_images/test1.jpg', 'fake content');
        Storage::disk('public')->put('event_images/test2.jpg', 'fake content');
        Storage::disk('public')->put('event_images/test3.jpg', 'fake content');

        $token = JWTAuth::fromUser($this->creator);

        // Supprimer les images 1 et 2
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/events/{$this->event->id}", [
                'delete_images' => [$image1->id, $image2->id],
            ]);

        $response->assertStatus(200);

        // Vérifier que les images sont supprimées de la base de données
        $this->assertDatabaseMissing('event_images', ['id' => $image1->id]);
        $this->assertDatabaseMissing('event_images', ['id' => $image2->id]);
        $this->assertDatabaseHas('event_images', ['id' => $image3->id]);

        // Vérifier que les fichiers sont supprimés du stockage
        Storage::disk('public')->assertMissing('event_images/test1.jpg');
        Storage::disk('public')->assertMissing('event_images/test2.jpg');
        Storage::disk('public')->assertExists('event_images/test3.jpg');
    }

    public function test_can_reorder_images()
    {
        // Créer 3 images
        $image1 = EventImage::create([
            'event_id' => $this->event->id,
            'image_path' => 'event_images/test1.jpg',
            'display_order' => 0,
        ]);

        $image2 = EventImage::create([
            'event_id' => $this->event->id,
            'image_path' => 'event_images/test2.jpg',
            'display_order' => 1,
        ]);

        $image3 = EventImage::create([
            'event_id' => $this->event->id,
            'image_path' => 'event_images/test3.jpg',
            'display_order' => 2,
        ]);

        $token = JWTAuth::fromUser($this->creator);

        // Réorganiser : image3, image1, image2
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/events/{$this->event->id}", [
                'images_order' => [$image3->id, $image1->id, $image2->id],
            ]);

        $response->assertStatus(200);

        // Vérifier le nouvel ordre
        $this->assertDatabaseHas('event_images', [
            'id' => $image3->id,
            'display_order' => 0,
        ]);

        $this->assertDatabaseHas('event_images', [
            'id' => $image1->id,
            'display_order' => 1,
        ]);

        $this->assertDatabaseHas('event_images', [
            'id' => $image2->id,
            'display_order' => 2,
        ]);
    }

    public function test_cannot_exceed_5_images_limit()
    {
        // Créer 4 images existantes
        for ($i = 0; $i < 4; $i++) {
            EventImage::create([
                'event_id' => $this->event->id,
                'image_path' => "event_images/test{$i}.jpg",
                'display_order' => $i,
            ]);
        }

        $token = JWTAuth::fromUser($this->creator);

        // Tenter d'ajouter 2 nouvelles images (total = 6)
        $image1 = UploadedFile::fake()->image('new1.jpg');
        $image2 = UploadedFile::fake()->image('new2.jpg');

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/events/{$this->event->id}", [
                'images' => [$image1, $image2],
            ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Maximum 5 images au total autorisées',
            ]);

        // Vérifier qu'on a toujours que 4 images
        $this->assertDatabaseCount('event_images', 4);
    }

    public function test_can_update_max_places_if_no_reservations()
    {
        $token = JWTAuth::fromUser($this->creator);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/events/{$this->event->id}", [
                'max_places' => 150,
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('events', [
            'id' => $this->event->id,
            'max_places' => 150,
            'available_places' => 150,
        ]);
    }

    public function test_cannot_reduce_max_places_below_reserved()
    {
        // Créer une réservation de 20 places
        $this->event->update([
            'available_places' => 80, // 100 - 20 réservées
        ]);

        Operation::create([
            'user_id' => $this->otherUser->id,
            'event_id' => $this->event->id,
            'type_operation_id' => 2,
            'quantity' => 20,
        ]);

        $token = JWTAuth::fromUser($this->creator);

        // Tenter de réduire à 15 places (moins que les 20 réservées)
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/events/{$this->event->id}", [
                'max_places' => 15,
            ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Le nouveau nombre maximum de places ne peut pas être inférieur aux places déjà réservées',
            ]);

        // Vérifier que max_places n'a pas changé
        $this->assertDatabaseHas('events', [
            'id' => $this->event->id,
            'max_places' => 100,
        ]);
    }

    public function test_can_increase_max_places_with_existing_reservations()
    {
        // 20 places réservées
        $this->event->update([
            'available_places' => 80,
        ]);

        Operation::create([
            'user_id' => $this->otherUser->id,
            'event_id' => $this->event->id,
            'type_operation_id' => 2,
            'quantity' => 20,
        ]);

        $token = JWTAuth::fromUser($this->creator);

        // Augmenter à 150 places
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/events/{$this->event->id}", [
                'max_places' => 150,
            ]);

        $response->assertStatus(200);

        // available_places devrait être 130 (150 - 20 réservées)
        $this->assertDatabaseHas('events', [
            'id' => $this->event->id,
            'max_places' => 150,
            'available_places' => 130,
        ]);
    }

    public function test_validation_errors_for_invalid_data()
    {
        $token = JWTAuth::fromUser($this->creator);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/events/{$this->event->id}", [
                'base_price' => -10, // Prix négatif
                'max_places' => 0, // Zéro places
                'priority' => 15, // Hors limite (max 10)
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['base_price', 'max_places', 'priority']);
    }

    public function test_can_update_dates()
    {
        $token = JWTAuth::fromUser($this->creator);

        $newStartDate = now()->addDays(20)->format('Y-m-d H:i:s');
        $newEndDate = now()->addDays(21)->format('Y-m-d H:i:s');

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/events/{$this->event->id}", [
                'start_date' => $newStartDate,
                'end_date' => $newEndDate,
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('events', [
            'id' => $this->event->id,
        ]);

        // Vérifier que les dates ont été mises à jour
        $this->event->refresh();
        $this->assertEquals($newStartDate, $this->event->start_date->format('Y-m-d H:i:s'));
        $this->assertEquals($newEndDate, $this->event->end_date->format('Y-m-d H:i:s'));
    }

    public function test_unauthenticated_user_cannot_update_event()
    {
        $response = $this->putJson("/api/events/{$this->event->id}", [
            'name' => 'Tentative sans auth',
        ]);

        $response->assertStatus(401);
    }

    public function test_can_update_multiple_fields_at_once()
    {
        $token = JWTAuth::fromUser($this->creator);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/events/{$this->event->id}", [
                'name' => 'Événement Complet',
                'description' => 'Description complète',
                'base_price' => 99.99,
                'level' => 'Avancé',
                'priority' => 8,
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('events', [
            'id' => $this->event->id,
            'name' => 'Événement Complet',
            'description' => 'Description complète',
            'base_price' => 99.99,
            'level' => 'Avancé',
            'priority' => 8,
        ]);
    }
}