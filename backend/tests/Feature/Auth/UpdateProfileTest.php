<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tymon\JWTAuth\Facades\JWTAuth;

class UpdateProfileTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Créer les rôles avec factory
        Role::factory()->create(['role' => 'utilisateur']);
        Role::factory()->create(['role' => 'professionnel']);
        Role::factory()->create(['role' => 'admin']);

        // Fake storage pour les tests d'upload
        Storage::fake('public');
    }

    /**
     * Créer un utilisateur authentifié et retourner son token
     */
    private function createAuthenticatedUser($overrides = [])
    {
        $user = User::factory()->create(array_merge([
            'is_approved' => true,
            'approved_at' => now(),
        ], $overrides));

        $role = Role::where('role', 'utilisateur')->first();
        $user->roles()->attach($role->id);

        $token = JWTAuth::claims(['type' => 'access'])->fromUser($user);

        return ['user' => $user, 'token' => $token];
    }

    /**
     * Test 1: Mise à jour du nom réussie
     */
    public function test_mise_a_jour_nom()
    {
        $auth = $this->createAuthenticatedUser(['name' => 'Jean']);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson('/api/profile/update', [
            'name' => 'Pierre',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Profil mis à jour avec succès',
            ]);

        // Vérifier en DB
        $this->assertDatabaseHas('users', [
            'id' => $auth['user']->id,
            'name' => 'Pierre',
        ]);
    }

    /**
     * Test 2: Mise à jour du nom de famille réussie
     */
    public function test_mise_a_jour_last_name()
    {
        $auth = $this->createAuthenticatedUser(['last_name' => 'Dupont']);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson('/api/profile/update', [
            'last_name' => 'Martin',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('users', [
            'id' => $auth['user']->id,
            'last_name' => 'Martin',
        ]);
    }

    /**
     * Test 3: Mise à jour de l'email réussie
     */
    public function test_mise_a_jour_email()
    {
        $auth = $this->createAuthenticatedUser(['email' => 'old@example.com']);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson('/api/profile/update', [
            'email' => 'new@example.com',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('users', [
            'id' => $auth['user']->id,
            'email' => 'new@example.com',
        ]);
    }

    /**
     * Test 4: Mise à jour de la ville réussie
     */
    public function test_mise_a_jour_ville()
    {
        $auth = $this->createAuthenticatedUser(['city' => 'Paris']);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson('/api/profile/update', [
            'city' => 'Lyon',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('users', [
            'id' => $auth['user']->id,
            'city' => 'Lyon',
        ]);
    }

    /**
     * Test 5: Mise à jour de la date de naissance réussie
     */
    public function test_mise_a_jour_date_naissance()
    {
        $auth = $this->createAuthenticatedUser(['date_of_birth' => '1990-01-01']);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson('/api/profile/update', [
            'date_of_birth' => '1992-05-15',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('users', [
            'id' => $auth['user']->id,
            'date_of_birth' => '1992-05-15',
        ]);
    }

    /**
     * Test 6: Mise à jour de la photo de profil
     */
    public function test_mise_a_jour_photo_profil()
    {
        $auth = $this->createAuthenticatedUser();

        $newFile = UploadedFile::fake()->image('new-profile.jpg', 600, 600);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson('/api/profile/update', [
            'profile_picture' => $newFile,
        ]);

        $response->assertStatus(200);

        // Vérifier que la nouvelle photo existe
        $auth['user']->refresh();
        $this->assertNotNull($auth['user']->profile_picture);
        Storage::disk('public')->assertExists($auth['user']->profile_picture);
    }

    /**
     * Test 7: Remplacement d'une ancienne photo de profil
     */
    public function test_remplacement_ancienne_photo()
    {
        // Créer une ancienne photo
        $oldFile = UploadedFile::fake()->image('old-profile.jpg');
        $oldPath = $oldFile->storeAs('profile_pictures', 'old_pic.jpg', 'public');

        $auth = $this->createAuthenticatedUser(['profile_picture' => $oldPath]);

        // Vérifier que l'ancienne photo existe
        Storage::disk('public')->assertExists($oldPath);

        // Uploader une nouvelle photo
        $newFile = UploadedFile::fake()->image('new-profile.jpg');

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson('/api/profile/update', [
            'profile_picture' => $newFile,
        ]);

        $response->assertStatus(200);

        // Vérifier que l'ancienne photo a été supprimée
        Storage::disk('public')->assertMissing($oldPath);

        // Vérifier que la nouvelle photo existe
        $auth['user']->refresh();
        Storage::disk('public')->assertExists($auth['user']->profile_picture);
    }

    /**
     * Test 8: Mise à jour de plusieurs champs en même temps
     */
    public function test_mise_a_jour_plusieurs_champs()
    {
        $auth = $this->createAuthenticatedUser([
            'name' => 'Jean',
            'last_name' => 'Dupont',
            'city' => 'Paris',
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson('/api/profile/update', [
            'name' => 'Pierre',
            'last_name' => 'Martin',
            'city' => 'Marseille',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('users', [
            'id' => $auth['user']->id,
            'name' => 'Pierre',
            'last_name' => 'Martin',
            'city' => 'Marseille',
        ]);
    }

    /**
     * Test 9: Mise à jour échoue - email déjà utilisé par un autre utilisateur
     */
    public function test_mise_a_jour_email_deja_utilise()
    {
        // Créer un autre utilisateur avec cet email
        User::factory()->create(['email' => 'taken@example.com']);

        $auth = $this->createAuthenticatedUser(['email' => 'myemail@example.com']);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson('/api/profile/update', [
            'email' => 'taken@example.com',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);

        // Vérifier que l'email n'a pas changé
        $auth['user']->refresh();
        $this->assertEquals('myemail@example.com', $auth['user']->email);
    }

    /**
     * Test 10: Mise à jour échoue - email invalide
     */
    public function test_mise_a_jour_email_invalide()
    {
        $auth = $this->createAuthenticatedUser();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson('/api/profile/update', [
            'email' => 'email-invalide',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * Test 11: Mise à jour échoue - date de naissance dans le futur
     */
    public function test_mise_a_jour_date_naissance_future()
    {
        $auth = $this->createAuthenticatedUser();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson('/api/profile/update', [
            'date_of_birth' => now()->addDays(1)->format('Y-m-d'),
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['date_of_birth']);
    }

    /**
     * Test 12: Mise à jour échoue - type de fichier invalide
     */
    public function test_mise_a_jour_photo_type_invalide()
    {
        $auth = $this->createAuthenticatedUser();

        $file = UploadedFile::fake()->create('document.pdf', 100);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson('/api/profile/update', [
            'profile_picture' => $file,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['profile_picture']);
    }

    /**
     * Test 13: Mise à jour échoue - fichier trop volumineux
     */
    public function test_mise_a_jour_photo_trop_volumineuse()
    {
        $auth = $this->createAuthenticatedUser();

        $file = UploadedFile::fake()->image('large.jpg')->size(3000);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson('/api/profile/update', [
            'profile_picture' => $file,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['profile_picture']);
    }

    /**
     * Test 14: Mise à jour échoue - sans authentification
     */
    public function test_mise_a_jour_sans_authentification()
    {
        $response = $this->postJson('/api/profile/update', [
            'name' => 'Test',
        ]);

        $response->assertStatus(401);
    }

    /**
     * Test 15: Mise à jour échoue - token invalide
     */
    public function test_mise_a_jour_token_invalide()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer token_invalide',
            'Accept' => 'application/json',
        ])->postJson('/api/profile/update', [
            'name' => 'Test',
        ]);

        $response->assertStatus(401);
    }

    /**
     * Test 16: Mise à jour avec le même email (devrait réussir)
     */
    public function test_mise_a_jour_meme_email()
    {
        $auth = $this->createAuthenticatedUser(['email' => 'same@example.com']);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson('/api/profile/update', [
            'email' => 'same@example.com',
            'name' => 'NewName',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('users', [
            'id' => $auth['user']->id,
            'email' => 'same@example.com',
            'name' => 'NewName',
        ]);
    }

    /**
     * Test 17: Mise à jour sans envoyer de champs (devrait réussir)
     */
    public function test_mise_a_jour_sans_champs()
    {
        $auth = $this->createAuthenticatedUser();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson('/api/profile/update', []);

        $response->assertStatus(200);
    }

    /**
     * Test 18: Mise à jour city à null (champ optionnel)
     */
    public function test_mise_a_jour_city_null()
    {
        $auth = $this->createAuthenticatedUser(['city' => 'Paris']);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson('/api/profile/update', [
            'city' => null,
        ]);

        $response->assertStatus(200);

        $auth['user']->refresh();
        $this->assertNull($auth['user']->city);
    }

    /**
     * Test 19: Vérifier que les rôles sont retournés dans la réponse
     */
    public function test_mise_a_jour_retourne_roles()
    {
        $auth = $this->createAuthenticatedUser();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->postJson('/api/profile/update', [
            'name' => 'NewName',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'id',
                'name',
                'email',
                'roles',
            ]);

        // Vérifier que le nom a été mis à jour dans la réponse
        $this->assertEquals('NewName', $response->json('name'));
    }

    /**
     * Test 20: Vérifier que les différents types d'images fonctionnent
     */
    public function test_mise_a_jour_differents_types_images()
    {
        $imageTypes = ['jpg', 'png', 'gif', 'webp'];

        foreach ($imageTypes as $type) {
            $auth = $this->createAuthenticatedUser([
                'email' => "test{$type}@example.com",
            ]);

            $file = UploadedFile::fake()->image("profile.{$type}");

            $response = $this->withHeaders([
                'Authorization' => 'Bearer ' . $auth['token'],
                'Accept' => 'application/json',
            ])->postJson('/api/profile/update', [
                'profile_picture' => $file,
            ]);

            $response->assertStatus(200, "Failed for image type: {$type}");
        }
    }
}