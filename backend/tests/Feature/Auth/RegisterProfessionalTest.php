<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;

class RegisterProfessionalTest extends TestCase
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
     * Test 1: Inscription professionnel réussie sans photo
     */
    public function test_inscription_professionnel_sans_photo()
    {
        $data = [
            'name' => 'Pierre',
            'last_name' => 'Leclerc',
            'email' => 'pierre.leclerc@example.com',
            'date_of_birth' => '1985-03-20',
            'city' => 'Marseille',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'motivation_letter' => 'Je suis passionné par mon métier et je souhaite rejoindre votre plateforme pour partager mon expertise avec la communauté.',
        ];

        $response = $this->postJson('/api/register/professional', $data);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Votre demande d\'inscription a été envoyée. Un administrateur examinera votre candidature.',
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'status',
                'user' => [
                    'id',
                    'name',
                    'last_name',
                    'email',
                    'is_approved',
                ],
            ]);

        // Vérifier que l'utilisateur existe en DB
        $this->assertDatabaseHas('users', [
            'email' => 'pierre.leclerc@example.com',
            'name' => 'Pierre',
            'last_name' => 'Leclerc',
            'is_approved' => false, // ❗ Important : pas approuvé par défaut
        ]);

        // Vérifier que le mot de passe est hashé
        $user = User::where('email', 'pierre.leclerc@example.com')->first();
        $this->assertTrue(Hash::check('password123', $user->password));

        // Vérifier que le rôle professionnel est attaché
        $this->assertTrue($user->roles()->where('role', 'professionnel')->exists());

        // Vérifier que approved_at est null
        $this->assertNull($user->approved_at);

        // Vérifier que la lettre de motivation est enregistrée
        $this->assertEquals('Je suis passionné par mon métier et je souhaite rejoindre votre plateforme pour partager mon expertise avec la communauté.', $user->motivation_letter);

        // Vérifier le status dans la réponse
        $this->assertEquals('pending', $response->json('status'));
        $this->assertFalse($response->json('user.is_approved'));
    }

    /**
     * Test 2: Inscription professionnel avec photo de profil
     */
    public function test_inscription_professionnel_avec_photo()
    {
        $file = UploadedFile::fake()->image('profile.jpg', 600, 600);

        $data = [
            'name' => 'Marie',
            'last_name' => 'Durand',
            'email' => 'marie.durand@example.com',
            'date_of_birth' => '1990-07-12',
            'city' => 'Lyon',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'motivation_letter' => 'Je possède 10 ans d\'expérience dans mon domaine et souhaite développer mon activité sur votre plateforme.',
            'profile_picture' => $file,
        ];

        $response = $this->postJson('/api/register/professional', $data);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
            ]);

        // Vérifier que le fichier a été uploadé
        $user = User::where('email', 'marie.durand@example.com')->first();
        $this->assertNotNull($user->profile_picture);
        Storage::disk('public')->assertExists($user->profile_picture);
    }

    /**
     * Test 3: Inscription échoue - lettre de motivation manquante
     */
    public function test_inscription_sans_lettre_motivation()
    {
        $data = [
            'name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'date_of_birth' => '1990-01-01',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            // motivation_letter manquante
        ];

        $response = $this->postJson('/api/register/professional', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['motivation_letter']);
    }

    /**
     * Test 4: Inscription échoue - lettre de motivation trop courte
     */
    public function test_inscription_lettre_motivation_trop_courte()
    {
        $data = [
            'name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'date_of_birth' => '1990-01-01',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'motivation_letter' => 'Trop court', // Moins de 50 caractères
        ];

        $response = $this->postJson('/api/register/professional', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['motivation_letter']);
    }

    /**
     * Test 5: Inscription échoue - lettre de motivation trop longue
     */
    public function test_inscription_lettre_motivation_trop_longue()
    {
        $data = [
            'name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'date_of_birth' => '1990-01-01',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'motivation_letter' => str_repeat('A', 2001), // Plus de 2000 caractères
        ];

        $response = $this->postJson('/api/register/professional', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['motivation_letter']);
    }

    /**
     * Test 6: Inscription échoue - email déjà utilisé
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
            'motivation_letter' => 'Je souhaite rejoindre votre plateforme pour développer mon activité professionnelle.',
        ];

        $response = $this->postJson('/api/register/professional', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * Test 7: Inscription échoue - champs requis manquants
     */
    public function test_inscription_champs_requis_manquants()
    {
        $response = $this->postJson('/api/register/professional', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'name',
                'last_name',
                'email',
                'date_of_birth',
                'password',
                'motivation_letter',
            ]);
    }

    /**
     * Test 8: Inscription échoue - email invalide
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
            'motivation_letter' => 'Je souhaite rejoindre votre plateforme pour développer mon activité professionnelle.',
        ];

        $response = $this->postJson('/api/register/professional', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * Test 9: Inscription échoue - mot de passe trop court
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
            'motivation_letter' => 'Je souhaite rejoindre votre plateforme pour développer mon activité professionnelle.',
        ];

        $response = $this->postJson('/api/register/professional', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    /**
     * Test 10: Inscription échoue - confirmation mot de passe incorrecte
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
            'motivation_letter' => 'Je souhaite rejoindre votre plateforme pour développer mon activité professionnelle.',
        ];

        $response = $this->postJson('/api/register/professional', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    /**
     * Test 11: Inscription échoue - date de naissance dans le futur
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
            'motivation_letter' => 'Je souhaite rejoindre votre plateforme pour développer mon activité professionnelle.',
        ];

        $response = $this->postJson('/api/register/professional', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['date_of_birth']);
    }

    /**
     * Test 12: Inscription échoue - type de fichier invalide
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
            'motivation_letter' => 'Je souhaite rejoindre votre plateforme pour développer mon activité professionnelle.',
            'profile_picture' => $file,
        ];

        $response = $this->postJson('/api/register/professional', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['profile_picture']);
    }

    /**
     * Test 13: Inscription échoue - fichier trop volumineux
     */
    public function test_inscription_photo_trop_volumineuse()
    {
        $file = UploadedFile::fake()->image('large.jpg')->size(3000);

        $data = [
            'name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'date_of_birth' => '1990-01-01',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'motivation_letter' => 'Je souhaite rejoindre votre plateforme pour développer mon activité professionnelle.',
            'profile_picture' => $file,
        ];

        $response = $this->postJson('/api/register/professional', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['profile_picture']);
    }

    /**
     * Test 14: Inscription sans ville (champ optionnel)
     */
    public function test_inscription_sans_ville()
    {
        $data = [
            'name' => 'Jean',
            'last_name' => 'Martin',
            'email' => 'jean.martin@example.com',
            'date_of_birth' => '1988-05-10',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'motivation_letter' => 'Je souhaite rejoindre votre plateforme pour développer mon activité professionnelle et partager mon savoir-faire.',
        ];

        $response = $this->postJson('/api/register/professional', $data);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
            ]);

        // Vérifier que city est null
        $user = User::where('email', 'jean.martin@example.com')->first();
        $this->assertNull($user->city);
    }

    /**
     * Test 15: Le professionnel ne peut PAS se connecter avant approbation
     */
    public function test_professionnel_non_approuve_ne_peut_pas_se_connecter()
    {
        $data = [
            'name' => 'Sophie',
            'last_name' => 'Rousseau',
            'email' => 'sophie.rousseau@example.com',
            'date_of_birth' => '1992-11-30',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'motivation_letter' => 'Je souhaite rejoindre votre plateforme pour développer mon activité professionnelle.',
        ];

        // Inscription
        $response = $this->postJson('/api/register/professional', $data);
        $response->assertStatus(201);

        // Vérifier que l'utilisateur n'est pas approuvé
        $user = User::where('email', 'sophie.rousseau@example.com')->first();
        $this->assertFalse($user->is_approved);

        // Tenter de se connecter
        $loginResponse = $this->postJson('/api/login', [
            'email' => 'sophie.rousseau@example.com',
            'password' => 'password123',
        ]);

        // Doit recevoir une erreur 403
        $loginResponse->assertStatus(403)
            ->assertJson([
                'success' => false,
                'error' => 'Compte en attente d\'approbation',
            ]);
    }

    /**
     * Test 16: Vérifier que la réponse ne contient PAS de token
     */
    public function test_inscription_professionnel_sans_token()
    {
        $data = [
            'name' => 'Lucas',
            'last_name' => 'Bernard',
            'email' => 'lucas.bernard@example.com',
            'date_of_birth' => '1987-04-15',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'motivation_letter' => 'Je souhaite rejoindre votre plateforme pour développer mon activité professionnelle.',
        ];

        $response = $this->postJson('/api/register/professional', $data);

        $response->assertStatus(201);

        // Vérifier qu'il n'y a PAS de token dans la réponse
        $this->assertNull($response->json('token'));
        $this->assertNull($response->json('refresh_token'));
        $this->assertNull($response->json('expires_in'));

        // Seulement les infos de base de l'utilisateur
        $response->assertJsonStructure([
            'success',
            'message',
            'status',
            'user' => ['id', 'name', 'last_name', 'email', 'is_approved'],
        ]);
    }

    /**
     * Test 17: Lettre de motivation avec exactement 50 caractères (min valide)
     */
    public function test_inscription_lettre_motivation_minimum_valide()
    {
        $data = [
            'name' => 'Test',
            'last_name' => 'User',
            'email' => 'test50@example.com',
            'date_of_birth' => '1990-01-01',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'motivation_letter' => str_repeat('A', 50), // Exactement 50 caractères
        ];

        $response = $this->postJson('/api/register/professional', $data);

        $response->assertStatus(201);
    }

    /**
     * Test 18: Lettre de motivation avec exactement 2000 caractères (max valide)
     */
    public function test_inscription_lettre_motivation_maximum_valide()
    {
        $data = [
            'name' => 'Test',
            'last_name' => 'User',
            'email' => 'test2000@example.com',
            'date_of_birth' => '1990-01-01',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'motivation_letter' => str_repeat('A', 2000), // Exactement 2000 caractères
        ];

        $response = $this->postJson('/api/register/professional', $data);

        $response->assertStatus(201);
    }
}