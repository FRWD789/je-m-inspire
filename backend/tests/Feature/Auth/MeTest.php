<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tymon\JWTAuth\Facades\JWTAuth;

class MeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Créer les rôles avec factory
        Role::factory()->create(['role' => 'utilisateur']);
        Role::factory()->create(['role' => 'professionnel']);
        Role::factory()->create(['role' => 'admin']);
    }

    /**
     * Créer un utilisateur authentifié
     */
    private function createAuthenticatedUser($roleType = 'utilisateur', $overrides = [])
    {
        $user = User::factory()->create(array_merge([
            'is_approved' => true,
            'approved_at' => now(),
        ], $overrides));

        $role = Role::where('role', $roleType)->first();
        $user->roles()->attach($role->id);

        $token = JWTAuth::claims(['type' => 'access'])->fromUser($user);

        return ['user' => $user, 'token' => $token];
    }

    /**
     * Test 1: Récupération de l'utilisateur connecté réussie
     */
    public function test_recuperation_utilisateur_connecte()
    {
        $auth = $this->createAuthenticatedUser('utilisateur', [
            'name' => 'Jean',
            'last_name' => 'Dupont',
            'email' => 'jean.dupont@example.com',
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->getJson('/api/me');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Utilisateur récupéré',
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'id',
                'name',
                'last_name',
                'email',
                'roles',
            ]);

        // Vérifier les données retournées
        $this->assertEquals('Jean', $response->json('name'));
        $this->assertEquals('Dupont', $response->json('last_name'));
        $this->assertEquals('jean.dupont@example.com', $response->json('email'));
    }

    /**
     * Test 2: Me retourne les rôles de l'utilisateur
     */
    public function test_me_retourne_roles()
    {
        $auth = $this->createAuthenticatedUser('utilisateur');

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->getJson('/api/me');

        $response->assertStatus(200);

        // Vérifier que roles est un tableau
        $roles = $response->json('roles');
        $this->assertIsArray($roles);
        $this->assertNotEmpty($roles);

        // Vérifier que le rôle utilisateur est présent
        $roleNames = array_column($roles, 'role');
        $this->assertContains('utilisateur', $roleNames);
    }

    /**
     * Test 3: Me fonctionne pour un professionnel
     */
    public function test_me_professionnel()
    {
        $auth = $this->createAuthenticatedUser('professionnel', [
            'name' => 'Marie',
            'email' => 'marie@example.com',
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->getJson('/api/me');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'name' => 'Marie',
                'email' => 'marie@example.com',
            ]);

        // Vérifier le rôle professionnel
        $roles = $response->json('roles');
        $roleNames = array_column($roles, 'role');
        $this->assertContains('professionnel', $roleNames);
    }

    /**
     * Test 4: Me fonctionne pour un admin
     */
    public function test_me_admin()
    {
        $auth = $this->createAuthenticatedUser('admin', [
            'name' => 'Admin',
            'email' => 'admin@example.com',
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->getJson('/api/me');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'name' => 'Admin',
                'email' => 'admin@example.com',
            ]);

        // Vérifier le rôle admin
        $roles = $response->json('roles');
        $roleNames = array_column($roles, 'role');
        $this->assertContains('admin', $roleNames);
    }

    /**
     * Test 5: Me échoue sans token
     */
    public function test_me_sans_token()
    {
        $response = $this->getJson('/api/me');

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Unauthenticated.',
            ]);
    }

    /**
     * Test 6: Me échoue avec un token invalide
     */
    public function test_me_avec_token_invalide()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer token_invalide_xyz123',
            'Accept' => 'application/json',
        ])->getJson('/api/me');

        $response->assertStatus(401);
    }

    /**
     * Test 7: Me échoue avec un refresh token (mauvais type)
     */
    public function test_me_avec_refresh_token()
    {
        $user = User::factory()->create([
            'is_approved' => true,
            'approved_at' => now(),
        ]);

        $role = Role::where('role', 'utilisateur')->first();
        $user->roles()->attach($role->id);

        // Générer un REFRESH token (pas access)
        $refreshToken = JWTAuth::claims(['type' => 'refresh'])->fromUser($user);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $refreshToken,
            'Accept' => 'application/json',
        ])->getJson('/api/me');

        // Le middleware JWT devrait rejeter car type !== 'access'
        $response->assertStatus(401)
            ->assertJson([
                'error' => 'Invalid token type',
            ]);
    }

    /**
     * Test 8: Me retourne toutes les données de l'utilisateur
     */
    public function test_me_retourne_toutes_donnees()
    {
        $auth = $this->createAuthenticatedUser('utilisateur', [
            'name' => 'Pierre',
            'last_name' => 'Martin',
            'email' => 'pierre@example.com',
            'city' => 'Paris',
            'date_of_birth' => '1990-05-15',
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->getJson('/api/me');

        $response->assertStatus(200)
            ->assertJson([
                'name' => 'Pierre',
                'last_name' => 'Martin',
                'email' => 'pierre@example.com',
                'city' => 'Paris',
                'date_of_birth' => '1990-05-15',
            ]);
    }

    /**
     * Test 9: Me retourne is_approved
     */
    public function test_me_retourne_is_approved()
    {
        $auth = $this->createAuthenticatedUser('professionnel', [
            'is_approved' => true,
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->getJson('/api/me');

        $response->assertStatus(200);

        $this->assertTrue($response->json('is_approved'));
    }

    /**
     * Test 10: Me avec un utilisateur ayant une photo de profil
     */
    public function test_me_avec_photo_profil()
    {
        $auth = $this->createAuthenticatedUser('utilisateur', [
            'profile_picture' => 'profile_pictures/test.jpg',
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->getJson('/api/me');

        $response->assertStatus(200);

        $this->assertNotNull($response->json('profile_picture'));
        $this->assertStringContainsString('profile_pictures/test.jpg', $response->json('profile_picture'));
    }

    /**
     * Test 11: Me avec un utilisateur sans ville (nullable)
     */
    public function test_me_sans_ville()
    {
        $auth = $this->createAuthenticatedUser('utilisateur', [
            'city' => null,
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->getJson('/api/me');

        $response->assertStatus(200);

        $this->assertNull($response->json('city'));
    }

    /**
     * Test 12: Me retourne l'ID de l'utilisateur
     */
    public function test_me_retourne_id_utilisateur()
    {
        $auth = $this->createAuthenticatedUser('utilisateur');

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token'],
            'Accept' => 'application/json',
        ])->getJson('/api/me');

        $response->assertStatus(200);

        $this->assertEquals($auth['user']->id, $response->json('id'));
    }

    /**
     * Test 13: Me fonctionne pour un utilisateur non approuvé (s'il a un token)
     */
    public function test_me_utilisateur_non_approuve()
    {
        // Créer un utilisateur non approuvé avec un token
        $user = User::factory()->create([
            'is_approved' => false,
            'approved_at' => null,
        ]);

        $role = Role::where('role', 'professionnel')->first();
        $user->roles()->attach($role->id);

        $token = JWTAuth::claims(['type' => 'access'])->fromUser($user);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json',
        ])->getJson('/api/me');

        // Me devrait fonctionner même si l'utilisateur n'est pas approuvé
        // (s'il a un token, c'est qu'il a pu se connecter d'une manière ou d'une autre)
        $response->assertStatus(200);

        $this->assertFalse($response->json('is_approved'));
    }

    /**
     * Test 14: Me avec un utilisateur ayant plusieurs rôles
     */
    public function test_me_utilisateur_plusieurs_roles()
    {
        $user = User::factory()->create([
            'is_approved' => true,
            'approved_at' => now(),
        ]);

        // Attacher plusieurs rôles
        $roleUser = Role::where('role', 'utilisateur')->first();
        $roleAdmin = Role::where('role', 'admin')->first();
        $user->roles()->attach([$roleUser->id, $roleAdmin->id]);

        $token = JWTAuth::claims(['type' => 'access'])->fromUser($user);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json',
        ])->getJson('/api/me');

        $response->assertStatus(200);

        $roles = $response->json('roles');
        $this->assertCount(2, $roles);

        $roleNames = array_column($roles, 'role');
        $this->assertContains('utilisateur', $roleNames);
        $this->assertContains('admin', $roleNames);
    }
}