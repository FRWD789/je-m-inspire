<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Tymon\JWTAuth\Facades\JWTAuth;

class RegisterUserTest extends TestCase
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
     * Test 1: Inscription réussie d'un utilisateur sans photo de profil
     */
    public function test_inscription_utilisateur_sans_photo()
    {
        $data = [
            'name' => 'Jean',
            'last_name' => 'Dupont',
            'email' => 'jean.dupont@example.com',
            'date_of_birth' => '1990-05-15',
            'city' => 'Paris',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson('/api/register/user', $data);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Inscription réussie',
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'user' => [
                    'id',
                    'name',
                    'last_name',
                    'email',
                    'date_of_birth',
                    'city',
                    'is_approved',
                    'roles',
                ],
                'token',
                'expires_in',
                'refresh_token',
            ]);

        // Vérifier que l'utilisateur existe en DB
        $this->assertDatabaseHas('users', [
            'email' => 'jean.dupont@example.com',
            'name' => 'Jean',
            'last_name' => 'Dupont',
            'is_approved' => true,
        ]);

        // Vérifier que le mot de passe est hashé
        $user = User::where('email', 'jean.dupont@example.com')->first();
        $this->assertTrue(Hash::check('password123', $user->password));

        // Vérifier que le rôle utilisateur est attaché
        $this->assertTrue($user->roles()->where('role', 'utilisateur')->exists());

        // Vérifier que approved_at est défini
        $this->assertNotNull($user->approved_at);

        // Vérifier que les tokens sont valides
        $this->assertNotEmpty($response->json('token'));
        $this->assertEquals(3600, $response->json('expires_in')); // 60 min * 60 sec
    }

    /**
     * Test 2: Inscription réussie avec photo de profil
     */
    public function test_inscription_utilisateur_avec_photo()
    {
        $file = UploadedFile::fake()->image('profile.jpg', 600, 600);

        $data = [
            'name' => 'Marie',
            'last_name' => 'Martin',
            'email' => 'marie.martin@example.com',
            'date_of_birth' => '1995-08-20',
            'city' => 'Lyon',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'profile_picture' => $file,
        ];

        $response = $this->postJson('/api/register/user', $data);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Inscription réussie',
            ]);

        // Vérifier que le fichier a été uploadé
        $user = User::where('email', 'marie.martin@example.com')->first();
        $this->assertNotNull($user->profile_picture);
        Storage::disk('public')->assertExists($user->profile_picture);
    }

    /**
     * Test 3: Inscription échoue - email déjà utilisé
     */
    public function test_inscription_email_deja_utilise()
    {
        // Créer un utilisateur existant
        User::factory()->create([
            'email' => 'existing@example.com',
        ]);

        $data = [
            'name' => 'Test',
            'last_name' => 'User',
            'email' => 'existing@example.com',
            'date_of_birth' => '1990-01-01',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson('/api/register/user', $data);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ])
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * Test 4: Inscription échoue - champs requis manquants
     */
    public function test_inscription_champs_requis_manquants()
    {
        $response = $this->postJson('/api/register/user', []);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ])
            ->assertJsonValidationErrors([
                'name',
                'last_name',
                'email',
                'date_of_birth',
                'password',
            ]);
    }

    /**
     * Test 5: Inscription échoue - email invalide
     */
    public function test_inscription_email_invalide()
    {
        $data = [
            'name' => 'Test',
            'last_name' => 'User',
            'email' => 'email-invalide',
            'date_of_birth' => '1990-01-01',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson('/api/register/user', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * Test 6: Inscription échoue - mot de passe trop court
     */
    public function test_inscription_mot_de_passe_trop_court()
    {
        $data = [
            'name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'date_of_birth' => '1990-01-01',
            'password' => '123',
            'password_confirmation' => '123',
        ];

        $response = $this->postJson('/api/register/user', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    /**
     * Test 7: Inscription échoue - confirmation mot de passe incorrecte
     */
    public function test_inscription_confirmation_mot_de_passe_incorrecte()
    {
        $data = [
            'name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'date_of_birth' => '1990-01-01',
            'password' => 'password123',
            'password_confirmation' => 'differentpassword',
        ];

        $response = $this->postJson('/api/register/user', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    /**
     * Test 8: Inscription échoue - date de naissance dans le futur
     */
    public function test_inscription_date_naissance_future()
    {
        $data = [
            'name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'date_of_birth' => now()->addDays(1)->format('Y-m-d'),
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson('/api/register/user', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['date_of_birth']);
    }

    /**
     * Test 9: Inscription échoue - type de fichier invalide pour photo
     */
    public function test_inscription_photo_type_invalide()
    {
        $file = UploadedFile::fake()->create('document.pdf', 100);

        $data = [
            'name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'date_of_birth' => '1990-01-01',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'profile_picture' => $file,
        ];

        $response = $this->postJson('/api/register/user', $data);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ])
            ->assertJsonValidationErrors(['profile_picture']);
    }

    /**
     * Test 10: Inscription échoue - fichier trop volumineux
     */
    public function test_inscription_photo_trop_volumineuse()
    {
        // Créer un fichier de plus de 2MB (2048 KB)
        $file = UploadedFile::fake()->image('large.jpg')->size(3000);

        $data = [
            'name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'date_of_birth' => '1990-01-01',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'profile_picture' => $file,
        ];

        $response = $this->postJson('/api/register/user', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['profile_picture']);
    }

    /**
     * Test 11: Inscription sans ville (champ optionnel)
     */
    public function test_inscription_sans_ville()
    {
        $data = [
            'name' => 'Pierre',
            'last_name' => 'Durand',
            'email' => 'pierre.durand@example.com',
            'date_of_birth' => '1992-03-10',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson('/api/register/user', $data);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Inscription réussie',
            ]);

        // Vérifier que city est null
        $user = User::where('email', 'pierre.durand@example.com')->first();
        $this->assertNull($user->city);
    }

    /**
     * Test 12: Vérifier que l'utilisateur peut se connecter après inscription
     */
    public function test_inscription_puis_connexion()
    {
        $data = [
            'name' => 'Sophie',
            'last_name' => 'Bernard',
            'email' => 'sophie.bernard@example.com',
            'date_of_birth' => '1988-12-25',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson('/api/register/user', $data);
        $response->assertStatus(201);

        // Essayer de se connecter avec les mêmes identifiants
        $loginResponse = $this->postJson('/api/login', [
            'email' => 'sophie.bernard@example.com',
            'password' => 'password123',
        ]);

        $loginResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Connexion réussie',
            ]);

        // Vérifier que le token de connexion est valide
        $this->assertNotEmpty($loginResponse->json('token'));
    }

    /**
     * Test 13: Vérifier que les types MIME autorisés fonctionnent
     */
    public function test_inscription_avec_differents_types_images()
    {
        $imageTypes = ['jpg', 'png', 'gif', 'webp'];

        foreach ($imageTypes as $type) {
            $file = UploadedFile::fake()->image("profile.$type");

            $data = [
                'name' => 'Test',
                'last_name' => 'Image',
                'email' => "test.$type@example.com",
                'date_of_birth' => '1990-01-01',
                'password' => 'password123',
                'password_confirmation' => 'password123',
                'profile_picture' => $file,
            ];

            $response = $this->postJson('/api/register/user', $data);

            $response->assertStatus(201, "Failed for image type: $type");
        }
    }

    /**
     * Test 14: Vérifier que profile_picture est null sans upload
     */
    public function test_inscription_profile_picture_null_sans_upload()
    {
        $data = [
            'name' => 'Test',
            'last_name' => 'NoPhoto',
            'email' => 'nophoto@example.com',
            'date_of_birth' => '1990-01-01',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson('/api/register/user', $data);

        $response->assertStatus(201);

        $user = User::where('email', 'nophoto@example.com')->first();
        $this->assertNull($user->profile_picture);
    }

    /**
     * Test 15: Vérifier le format et contenu du token JWT
     */
    public function test_inscription_format_token_jwt()
    {
        $data = [
            'name' => 'Token',
            'last_name' => 'Test',
            'email' => 'token@example.com',
            'date_of_birth' => '1990-01-01',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson('/api/register/user', $data);

        $response->assertStatus(201);

        // Le token access est dans le JSON
        $token = $response->json('token');
        $this->assertNotNull($token, 'Le token access est null');

        // Vérifier que le token JWT a le bon format (3 parties séparées par des points)
        $this->assertMatchesRegularExpression('/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/', $token);

        // Vérifier que le payload contient 'type' => 'access'
        $payload = JWTAuth::setToken($token)->getPayload();
        $this->assertEquals('access', $payload->get('type'));

        // Vérifier que le payload contient l'ID de l'utilisateur
        $user = User::where('email', 'token@example.com')->first();
        $this->assertEquals($user->id, $payload->get('sub'));
    }
}