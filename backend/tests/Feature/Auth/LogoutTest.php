<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Str;

class LogoutTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Créer les rôles nécessaires
        Role::factory()->create(['role' => 'utilisateur']);
        Role::factory()->create(['role' => 'professionnel']);
        Role::factory()->create(['role' => 'admin']);
    }

    /**
     * Test 1: Logout réussi avec refresh token valide
     */
    public function test_logout_avec_refresh_token_valide()
    {
        // Créer un utilisateur
        $user = User::factory()->create([
            'is_approved' => true,
            'approved_at' => now(),
        ]);

        $role = Role::where('role', 'utilisateur')->first();
        $user->roles()->attach($role->id);

        // Générer un access token (pour l'authentification)
        $accessToken = JWTAuth::claims(['type' => 'access'])->fromUser($user);

        // Générer un refresh token avec JTI
        $jti = Str::uuid()->toString();
        $refreshToken = JWTAuth::claims([
            'type' => 'refresh',
            'jti' => $jti
        ])->fromUser($user);

        // Stocker le JTI dans le cache
        Cache::put("refresh_token:$jti", $user->id, 7*24*60);

        // Vérifier que le token est dans le cache
        $this->assertTrue(Cache::has("refresh_token:$jti"));

        // Utiliser call() avec cookies
        $response = $this->call(
            'POST',
            '/api/logout',
            [], // parameters
            ['refresh_token' => $refreshToken], // cookies
            [], // files
            [
                'HTTP_Authorization' => 'Bearer ' . $accessToken,
                'HTTP_Accept' => 'application/json',
            ]
        );

        // Assertions
        $this->assertEquals(200, $response->status());
        $response->assertJson([
            'success' => true,
            'message' => 'Déconnexion réussie'
        ]);

        // Vérifier que le JTI a été supprimé du cache
        $this->assertFalse(Cache::has("refresh_token:$jti"));
    }

    /**
     * Test 2: Logout sans refresh token (erreur 400)
     */
    public function test_logout_sans_refresh_token()
    {
        $user = User::factory()->create([
            'is_approved' => true,
            'approved_at' => now(),
        ]);

        $role = Role::where('role', 'utilisateur')->first();
        $user->roles()->attach($role->id);

        // Générer un access token pour l'authentification
        $accessToken = JWTAuth::claims(['type' => 'access'])->fromUser($user);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $accessToken,
            'Accept' => 'application/json',
        ])->postJson('/api/logout');

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'error' => 'Aucun refresh token fourni'
            ]);
    }

    /**
     * Test 3: Logout avec refresh token invalide (malformé)
     */
    public function test_logout_avec_refresh_token_invalide()
    {
        $user = User::factory()->create([
            'is_approved' => true,
            'approved_at' => now(),
        ]);

        $role = Role::where('role', 'utilisateur')->first();
        $user->roles()->attach($role->id);

        $accessToken = JWTAuth::claims(['type' => 'access'])->fromUser($user);

        $response = $this->call(
            'POST',
            '/api/logout',
            [],
            ['refresh_token' => 'token_invalide_blabla'],
            [],
            [
                'HTTP_Authorization' => 'Bearer ' . $accessToken,
                'HTTP_Accept' => 'application/json',
            ]
        );

        $this->assertEquals(500, $response->status());
        $response->assertJson([
            'success' => false,
            'error' => 'Erreur lors de la déconnexion'
        ]);
    }

    /**
     * Test 4: Logout sans authentification (401)
     */
    public function test_logout_sans_authentification()
    {
        $response = $this->withHeaders([
            'Accept' => 'application/json',
        ])->postJson('/api/logout');

        // Laravel retourne "Unauthenticated." par défaut
        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Unauthenticated.'
            ]);
    }

    /**
     * Test 5: Logout avec refresh token déjà utilisé (pas dans le cache)
     */
    public function test_logout_avec_refresh_token_deja_utilise()
    {
        $user = User::factory()->create([
            'is_approved' => true,
            'approved_at' => now(),
        ]);

        $role = Role::where('role', 'utilisateur')->first();
        $user->roles()->attach($role->id);

        $accessToken = JWTAuth::claims(['type' => 'access'])->fromUser($user);

        $jti = Str::uuid()->toString();
        $refreshToken = JWTAuth::claims([
            'type' => 'refresh',
            'jti' => $jti
        ])->fromUser($user);

        // Ne PAS mettre le JTI dans le cache

        $response = $this->call(
            'POST',
            '/api/logout',
            [],
            ['refresh_token' => $refreshToken],
            [],
            [
                'HTTP_Authorization' => 'Bearer ' . $accessToken,
                'HTTP_Accept' => 'application/json',
            ]
        );

        $this->assertEquals(200, $response->status());
        $response->assertJson([
            'success' => true,
            'message' => 'Déconnexion réussie'
        ]);
    }

    /**
     * Test 6: Vérifier que le JTI est bien supprimé du cache
     */
    public function test_logout_supprime_jti_du_cache()
    {
        $user = User::factory()->create([
            'is_approved' => true,
            'approved_at' => now(),
        ]);

        $role = Role::where('role', 'utilisateur')->first();
        $user->roles()->attach($role->id);

        $accessToken = JWTAuth::claims(['type' => 'access'])->fromUser($user);

        $jti = Str::uuid()->toString();
        $refreshToken = JWTAuth::claims([
            'type' => 'refresh',
            'jti' => $jti
        ])->fromUser($user);

        Cache::put("refresh_token:$jti", $user->id, 7*24*60);

        // Vérifier que c'est bien dans le cache avant
        $this->assertTrue(Cache::has("refresh_token:$jti"));

        $response = $this->call(
            'POST',
            '/api/logout',
            [],
            ['refresh_token' => $refreshToken],
            [],
            [
                'HTTP_Authorization' => 'Bearer ' . $accessToken,
                'HTTP_Accept' => 'application/json',
            ]
        );

        $this->assertEquals(200, $response->status());

        // Vérifier que c'est supprimé du cache après
        $this->assertFalse(Cache::has("refresh_token:$jti"));
    }

    /**
     * Test 7: Logout avec access token malformé (401)
     */
    public function test_logout_avec_access_token_malformed()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer token_malformed_xyz123',
            'Accept' => 'application/json',
        ])->postJson('/api/logout');

        // Laravel retourne "Unauthenticated." par défaut
        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Unauthenticated.'
            ]);
    }

    /**
     * Test 8: Logout avec refresh token dans Authorization (sans cookie)
     * Le middleware vérifie que type === 'access' et rejette les refresh tokens
     */
    public function test_logout_avec_refresh_token_dans_authorization()
    {
        $user = User::factory()->create([
            'is_approved' => true,
            'approved_at' => now(),
        ]);

        $role = Role::where('role', 'utilisateur')->first();
        $user->roles()->attach($role->id);

        // Créer un refresh token au lieu d'un access token dans le header
        $jti = Str::uuid()->toString();
        $refreshTokenInHeader = JWTAuth::claims([
            'type' => 'refresh', // ❌ Type incorrect pour Authorization
            'jti' => $jti
        ])->fromUser($user);

        Cache::put("refresh_token:$jti", $user->id, 7*24*60);

        // NE PAS mettre de cookie - tester uniquement le header Authorization
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $refreshTokenInHeader,
            'Accept' => 'application/json',
        ])->postJson('/api/logout');

        // Le middleware JwtMiddleware vérifie que type === 'access'
        $response->assertStatus(401)
            ->assertJson([
                'error' => 'Invalid token type'
            ]);
    }

    /**
     * Test 9: Logout avec utilisateur non approuvé
     */
    public function test_logout_avec_utilisateur_non_approuve()
    {
        $user = User::factory()->create([
            'is_approved' => false,
            'approved_at' => null,
        ]);

        $role = Role::where('role', 'professionnel')->first();
        $user->roles()->attach($role->id);

        $accessToken = JWTAuth::claims(['type' => 'access'])->fromUser($user);

        $jti = Str::uuid()->toString();
        $refreshToken = JWTAuth::claims([
            'type' => 'refresh',
            'jti' => $jti
        ])->fromUser($user);

        Cache::put("refresh_token:$jti", $user->id, 7*24*60);

        $response = $this->call(
            'POST',
            '/api/logout',
            [],
            ['refresh_token' => $refreshToken],
            [],
            [
                'HTTP_Authorization' => 'Bearer ' . $accessToken,
                'HTTP_Accept' => 'application/json',
            ]
        );

        $this->assertEquals(200, $response->status());
        $response->assertJson([
            'success' => true,
            'message' => 'Déconnexion réussie'
        ]);
    }
}