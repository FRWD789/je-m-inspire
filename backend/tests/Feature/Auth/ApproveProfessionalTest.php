<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tymon\JWTAuth\Facades\JWTAuth;

class ApproveProfessionalTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Créer les rôles avec factory
        Role::factory()->create(['role' => 'utilisateur']);
        Role::factory()->create(['role' => 'professionnel']);
        Role::factory()->create(['role' => 'admin']);

        Storage::fake('public');
    }

    /**
     * Créer un admin authentifié
     */
    private function createAdmin()
    {
        $admin = User::factory()->create([
            'is_approved' => true,
            'approved_at' => now(),
        ]);

        $role = Role::where('role', 'admin')->first();
        $admin->roles()->attach($role->id);

        $token = JWTAuth::claims(['type' => 'access'])->fromUser($admin);

        return ['user' => $admin, 'token' => $token];
    }

    /**
     * Créer un professionnel en attente d'approbation
     */
    private function createPendingProfessional($overrides = [])
    {
        $professional = User::factory()->create(array_merge([
            'is_approved' => false,
            'approved_at' => null,
            'motivation_letter' => 'Je souhaite rejoindre la plateforme.',
        ], $overrides));

        $role = Role::where('role', 'professionnel')->first();
        $professional->roles()->attach($role->id);

        return $professional;
    }

    // ========================================
    // TESTS APPROVE PROFESSIONAL
    // ========================================

    /**
     * Test 1: Approbation réussie par un admin
     */
    public function test_approbation_professionnelle_par_admin()
    {
        $admin = $this->createAdmin();
        $professional = $this->createPendingProfessional();

        // Vérifier l'état initial
        $this->assertFalse($professional->is_approved);
        $this->assertNull($professional->approved_at);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $admin['token'],
            'Accept' => 'application/json',
        ])->postJson("/api/admin/approvals/{$professional->id}/approve");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Professionnel approuvé avec succès',
            ]);

        // Vérifier en DB
        $this->assertDatabaseHas('users', [
            'id' => $professional->id,
            'is_approved' => true,
        ]);

        // Vérifier que approved_at est défini
        $professional->refresh();
        $this->assertTrue($professional->is_approved);
        $this->assertNotNull($professional->approved_at);
    }

    /**
     * Test 2: Le professionnel peut se connecter après approbation
     */
    public function test_connexion_apres_approbation()
    {
        $admin = $this->createAdmin();
        $professional = $this->createPendingProfessional([
            'email' => 'pro@example.com',
            'password' => bcrypt('password123'),
        ]);

        // Tenter de se connecter AVANT approbation
        $loginBefore = $this->postJson('/api/login', [
            'email' => 'pro@example.com',
            'password' => 'password123',
        ]);

        $loginBefore->assertStatus(403)
            ->assertJson([
                'success' => false,
                'error' => 'Compte en attente d\'approbation',
            ]);

        // Approuver le professionnel
        $this->withHeaders([
            'Authorization' => 'Bearer ' . $admin['token'],
            'Accept' => 'application/json',
        ])->postJson("/api/admin/approvals/{$professional->id}/approve");

        // Tenter de se connecter APRÈS approbation
        $loginAfter = $this->postJson('/api/login', [
            'email' => 'pro@example.com',
            'password' => 'password123',
        ]);

        $loginAfter->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Connexion réussie',
            ]);

        $this->assertNotEmpty($loginAfter->json('token'));
    }

    /**
     * Test 3: Approbation échoue - professionnel non trouvé
     */
    public function test_approbation_professionnel_non_trouve()
    {
        $admin = $this->createAdmin();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $admin['token'],
            'Accept' => 'application/json',
        ])->postJson("/api/admin/approvals/99999/approve");

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'error' => 'Utilisateur non trouvé',
            ]);
    }

    /**
     * Test 4: Approbation échoue - sans authentification
     */
    public function test_approbation_sans_authentification()
    {
        $professional = $this->createPendingProfessional();

        $response = $this->postJson("/api/admin/approvals/{$professional->id}/approve");

        $response->assertStatus(401);
    }

    /**
     * Test 5: Approbation d'un professionnel déjà approuvé (devrait réussir quand même)
     */
    public function test_approbation_professionnel_deja_approuve()
    {
        $admin = $this->createAdmin();
        $professional = $this->createPendingProfessional([
            'is_approved' => true,
            'approved_at' => now()->subDays(5),
        ]);

        $oldApprovedAt = $professional->approved_at;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $admin['token'],
            'Accept' => 'application/json',
        ])->postJson("/api/admin/approvals/{$professional->id}/approve");

        $response->assertStatus(200);

        // Vérifier que approved_at a été mis à jour
        $professional->refresh();
        $this->assertTrue($professional->is_approved);
        $this->assertNotEquals($oldApprovedAt, $professional->approved_at);
    }

    // ========================================
    // TESTS REJECT PROFESSIONAL
    // ========================================

    /**
     * Test 6: Rejet réussi par un admin
     */
    public function test_rejet_professionnel_par_admin()
    {
        $admin = $this->createAdmin();
        $professional = $this->createPendingProfessional();

        $professionalId = $professional->id;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $admin['token'],
            'Accept' => 'application/json',
        ])->postJson("/api/admin/approvals/{$professionalId}/reject");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Professionnel rejeté avec succès',
            ]);

        // Vérifier que l'utilisateur a été supprimé
        $this->assertDatabaseMissing('users', [
            'id' => $professionalId,
        ]);
    }

    /**
     * Test 7: Rejet supprime la photo de profil si elle existe
     */
    public function test_rejet_supprime_photo_profil()
    {
        $admin = $this->createAdmin();

        // Créer une photo de profil
        $file = UploadedFile::fake()->image('profile.jpg');
        $path = $file->storeAs('profile_pictures', 'pro_pic.jpg', 'public');

        $professional = $this->createPendingProfessional([
            'profile_picture' => $path,
        ]);

        // Vérifier que la photo existe
        Storage::disk('public')->assertExists($path);

        $professionalId = $professional->id;

        // Rejeter le professionnel
        $this->withHeaders([
            'Authorization' => 'Bearer ' . $admin['token'],
            'Accept' => 'application/json',
        ])->postJson("/api/admin/approvals/{$professionalId}/reject");

        // Vérifier que la photo a été supprimée
        Storage::disk('public')->assertMissing($path);

        // Vérifier que l'utilisateur a été supprimé
        $this->assertDatabaseMissing('users', [
            'id' => $professionalId,
        ]);
    }

    /**
     * Test 8: Rejet échoue - professionnel non trouvé
     */
    public function test_rejet_professionnel_non_trouve()
    {
        $admin = $this->createAdmin();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $admin['token'],
            'Accept' => 'application/json',
        ])->postJson("/api/admin/approvals/99999/reject");

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'error' => 'Utilisateur non trouvé',
            ]);
    }

    /**
     * Test 9: Rejet échoue - sans authentification
     */
    public function test_rejet_sans_authentification()
    {
        $professional = $this->createPendingProfessional();

        $response = $this->postJson("/api/admin/approvals/{$professional->id}/reject");

        $response->assertStatus(401);
    }

    /**
     * Test 10: Rejet d'un professionnel sans photo (devrait réussir)
     */
    public function test_rejet_professionnel_sans_photo()
    {
        $admin = $this->createAdmin();
        $professional = $this->createPendingProfessional([
            'profile_picture' => null,
        ]);

        $professionalId = $professional->id;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $admin['token'],
            'Accept' => 'application/json',
        ])->postJson("/api/admin/approvals/{$professionalId}/reject");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('users', [
            'id' => $professionalId,
        ]);
    }

    /**
     * Test 11: Vérifier que les relations sont supprimées lors du rejet
     */
    public function test_rejet_supprime_relations()
    {
        $admin = $this->createAdmin();
        $professional = $this->createPendingProfessional();

        $professionalId = $professional->id;

        // Vérifier que la relation role existe
        $this->assertDatabaseHas('role_user', [
            'user_id' => $professionalId,
        ]);

        // Rejeter
        $this->withHeaders([
            'Authorization' => 'Bearer ' . $admin['token'],
            'Accept' => 'application/json',
        ])->postJson("/api/admin/approvals/{$professionalId}/reject");

        // Vérifier que la relation a été supprimée
        $this->assertDatabaseMissing('role_user', [
            'user_id' => $professionalId,
        ]);
    }

    /**
     * Test 12: Approbation retourne les données du professionnel
     */
    public function test_approbation_retourne_donnees_professionnel()
    {
        $admin = $this->createAdmin();
        $professional = $this->createPendingProfessional([
            'name' => 'Jean',
            'last_name' => 'Dupont',
            'email' => 'jean@example.com',
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $admin['token'],
            'Accept' => 'application/json',
        ])->postJson("/api/admin/approvals/{$professional->id}/reject");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'user' => [
                    'id',
                    'name',
                    'last_name',
                    'email',
                    'is_approved',
                ],
            ]);

        // Vérifier les données
        $responseUser = $response->json('user');
        $this->assertEquals('Jean', $responseUser['name']);
        $this->assertEquals('Dupont', $responseUser['last_name']);
        $this->assertEquals('jean@example.com', $responseUser['email']);
        $this->assertTrue($responseUser['is_approved']);
    }

    /**
     * Test 13: Rejet ne retourne que le message de succès
     */
    public function test_rejet_retourne_message_succes()
    {
        $admin = $this->createAdmin();
        $professional = $this->createPendingProfessional();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $admin['token'],
            'Accept' => 'application/json',
        ])->postJson("/api/admin/approvals/{$professional->id}/reject");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Professionnel rejeté avec succès',
            ])
            ->assertJsonMissing(['user']);
    }
}