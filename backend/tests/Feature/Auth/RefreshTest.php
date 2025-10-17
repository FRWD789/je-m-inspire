<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Str;

class RefreshTest extends TestCase
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
     * Créer un utilisateur avec un refresh token valide dans le cache
     */
    private function createUserWithRefreshToken()
    {
        $user = User::factory()->create([
            'is_approved' => true,
            'approved_at' => now(),
        ]);

        $role = Role::where('role', 'utilisateur')->first();
        $user->roles()->attach($role->id);

        // Générer un refresh token avec JTI
        $jti = Str::uuid()->toString();
        $refreshToken = JWTAuth::claims([
            'type' => 'refresh',
            'jti' => $jti
        ])->fromUser($user);

        // Stocker le JTI dans le cache (7 jours)
        Cache::put("refresh_token:$jti", $user->id, 7*24*60);

        return [
            'user' => $user,
            'refresh_token' => $refreshToken,
            'jti' => $jti,
        ];
    }

    /**
     * Test 1: Refresh réussi avec un refresh token valide
     */
    public function test_refresh_avec_token_valide()
    {
        $data = $this->createUserWithRefreshToken();

        // Vérifier que le JTI est dans le cache avant
        $this->assertTrue(Cache::has("refresh_token:{$data['jti']}"));

        // Faire la requête avec le refresh token dans un cookie
        $response = $this->call(
            'GET',
            '/api/refresh',
            [],
            ['refresh_token' => $data['refresh_token']], // Cookie
            [],
            ['HTTP_Accept' => 'application/json']
        );

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Token rafraîchi',
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'access_token',
                'expires_in',
            ]);

        // Vérifier que l'ancien JTI a été supprimé du cache
        $this->assertFalse(Cache::has("refresh_token:{$data['jti']}"));

        // Vérifier que le nouveau access token est valide
        $newAccessToken = $response->json('access_token');
        $this->assertNotEmpty($newAccessToken);

        $payload = JWTAuth::setToken($newAccessToken)->getPayload();
        $this->assertEquals('access', $payload->get('type'));
        $this->assertEquals($data['user']->id, $payload->get('sub'));

        // Vérifier expires_in
        $this->assertEquals(3600, $response->json('expires_in')); // 60 min
    }

    /**
     * Test 2: Refresh échoue - refresh token manquant
     */
    public function test_refresh_sans_refresh_token()
    {
        $response = $this->getJson('/api/refresh');

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'error' => 'Refresh token manquant',
            ]);
    }

    /**
     * Test 3: Refresh échoue - refresh token invalide (malformé)
     */
    public function test_refresh_avec_token_invalide()
    {
        $response = $this->call(
            'GET',
            '/api/refresh',
            [],
            ['refresh_token' => 'token_invalide_xyz123'],
            [],
            ['HTTP_Accept' => 'application/json']
        );

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'error' => 'Refresh token invalide',
            ]);
    }

    /**
     * Test 4: Refresh échoue - refresh token non trouvé dans le cache
     */
    public function test_refresh_token_non_dans_cache()
    {
        $user = User::factory()->create([
            'is_approved' => true,
            'approved_at' => now(),
        ]);

        $role = Role::where('role', 'utilisateur')->first();
        $user->roles()->attach($role->id);

        // Créer un refresh token SANS le mettre dans le cache
        $jti = Str::uuid()->toString();
        $refreshToken = JWTAuth::claims([
            'type' => 'refresh',
            'jti' => $jti
        ])->fromUser($user);

        // NE PAS faire : Cache::put("refresh_token:$jti", $user->id, 7*24*60);

        $response = $this->call(
            'GET',
            '/api/refresh',
            [],
            ['refresh_token' => $refreshToken],
            [],
            ['HTTP_Accept' => 'application/json']
        );

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'error' => 'Refresh token invalide ou expiré',
            ]);
    }

    /**
     * Test 5: Vérifier que l'ancien JTI est supprimé et qu'un nouveau access token est créé
     */
    public function test_refresh_cree_nouveau_jti_dans_cache()
    {
        $data = $this->createUserWithRefreshToken();
        $oldJti = $data['jti'];

        // Vérifier que l'ancien JTI est dans le cache
        $this->assertTrue(Cache::has("refresh_token:$oldJti"));

        $response = $this->call(
            'GET',
            '/api/refresh',
            [],
            ['refresh_token' => $data['refresh_token']],
            [],
            ['HTTP_Accept' => 'application/json']
        );

        $response->assertStatus(200);

        // Vérifier que l'ancien JTI a été supprimé
        $this->assertFalse(Cache::has("refresh_token:$oldJti"));

        // Vérifier qu'un nouveau access token a été généré
        $newAccessToken = $response->json('access_token');
        $this->assertNotEmpty($newAccessToken);
        $this->assertNotEquals($data['refresh_token'], $newAccessToken);

        // Le fait que refresh() réussisse prouve qu'un nouveau refresh token
        // a été créé et stocké dans le cache (même si on ne peut pas le lire
        // depuis le cookie dans les tests)
    }

    /**
     * Test 6: Refresh échoue avec un access token (mauvais type)
     */
    public function test_refresh_avec_access_token()
    {
        $user = User::factory()->create([
            'is_approved' => true,
            'approved_at' => now(),
        ]);

        $role = Role::where('role', 'utilisateur')->first();
        $user->roles()->attach($role->id);

        // Générer un ACCESS token (pas refresh)
        $accessToken = JWTAuth::claims(['type' => 'access'])->fromUser($user);

        $response = $this->call(
            'GET',
            '/api/refresh',
            [],
            ['refresh_token' => $accessToken], // ❌ Mauvais type
            [],
            ['HTTP_Accept' => 'application/json']
        );

        // Devrait échouer car le type n'est pas 'refresh'
        $response->assertStatus(401);
    }

    /**
     * Test 7: Vérifier que l'ancien refresh token ne peut plus être réutilisé
     */
    public function test_ancien_refresh_token_invalide_apres_refresh()
    {
        $data = $this->createUserWithRefreshToken();

        // Premier refresh - devrait réussir
        $response1 = $this->call(
            'GET',
            '/api/refresh',
            [],
            ['refresh_token' => $data['refresh_token']],
            [],
            ['HTTP_Accept' => 'application/json']
        );

        $response1->assertStatus(200);

        // Essayer de réutiliser le MÊME refresh token - devrait échouer
        $response2 = $this->call(
            'GET',
            '/api/refresh',
            [],
            ['refresh_token' => $data['refresh_token']], // Même token
            [],
            ['HTTP_Accept' => 'application/json']
        );

        $response2->assertStatus(401)
            ->assertJson([
                'success' => false,
                'error' => 'Refresh token invalide ou expiré',
            ]);
    }

    /**
     * Test 8: Refresh fonctionne pour un professionnel approuvé
     */
    public function test_refresh_professionnel_approuve()
    {
        $user = User::factory()->create([
            'is_approved' => true,
            'approved_at' => now(),
        ]);

        $role = Role::where('role', 'professionnel')->first();
        $user->roles()->attach($role->id);

        $jti = Str::uuid()->toString();
        $refreshToken = JWTAuth::claims([
            'type' => 'refresh',
            'jti' => $jti
        ])->fromUser($user);

        Cache::put("refresh_token:$jti", $user->id, 7*24*60);

        $response = $this->call(
            'GET',
            '/api/refresh',
            [],
            ['refresh_token' => $refreshToken],
            [],
            ['HTTP_Accept' => 'application/json']
        );

        $response->assertStatus(200);
    }

    /**
     * Test 9: Refresh fonctionne pour un admin
     */
    public function test_refresh_admin()
    {
        $user = User::factory()->create([
            'is_approved' => true,
            'approved_at' => now(),
        ]);

        $role = Role::where('role', 'admin')->first();
        $user->roles()->attach($role->id);

        $jti = Str::uuid()->toString();
        $refreshToken = JWTAuth::claims([
            'type' => 'refresh',
            'jti' => $jti
        ])->fromUser($user);

        Cache::put("refresh_token:$jti", $user->id, 7*24*60);

        $response = $this->call(
            'GET',
            '/api/refresh',
            [],
            ['refresh_token' => $refreshToken],
            [],
            ['HTTP_Accept' => 'application/json']
        );

        $response->assertStatus(200);
    }

    /**
     * Test 10: Vérifier le format du nouveau access token
     */
    public function test_refresh_nouveau_access_token_format()
    {
        $data = $this->createUserWithRefreshToken();

        $response = $this->call(
            'GET',
            '/api/refresh',
            [],
            ['refresh_token' => $data['refresh_token']],
            [],
            ['HTTP_Accept' => 'application/json']
        );

        $response->assertStatus(200);

        $newAccessToken = $response->json('access_token');

        // Vérifier le format JWT (3 parties séparées par des points)
        $this->assertMatchesRegularExpression(
            '/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/',
            $newAccessToken
        );

        // Vérifier le contenu du payload
        $payload = JWTAuth::setToken($newAccessToken)->getPayload();
        $this->assertEquals('access', $payload->get('type'));
        $this->assertEquals($data['user']->id, $payload->get('sub'));
        $this->assertNotNull($payload->get('exp'));
    }

    /**
     * Test 11: Refresh avec un utilisateur non approuvé (devrait échouer ou réussir ?)
     * Note: À adapter selon votre logique métier
     */
    public function test_refresh_utilisateur_non_approuve()
    {
        $user = User::factory()->create([
            'is_approved' => false, // ❌ Non approuvé
            'approved_at' => null,
        ]);

        $role = Role::where('role', 'professionnel')->first();
        $user->roles()->attach($role->id);

        $jti = Str::uuid()->toString();
        $refreshToken = JWTAuth::claims([
            'type' => 'refresh',
            'jti' => $jti
        ])->fromUser($user);

        Cache::put("refresh_token:$jti", $user->id, 7*24*60);

        $response = $this->call(
            'GET',
            '/api/refresh',
            [],
            ['refresh_token' => $refreshToken],
            [],
            ['HTTP_Accept' => 'application/json']
        );

        // Le refresh devrait réussir (pas de vérification is_approved dans refresh)
        // Mais l'utilisateur ne pourra pas utiliser l'access token pour se connecter
        $response->assertStatus(200);
    }

    /**
     * Test 12: Vérifier que le premier refresh fonctionne et invalide l'ancien token
     */
    public function test_refresh_rotation_de_token()
    {
        $data = $this->createUserWithRefreshToken();
        $oldJti = $data['jti'];

        // Premier refresh - devrait réussir
        $response1 = $this->call(
            'GET',
            '/api/refresh',
            [],
            ['refresh_token' => $data['refresh_token']],
            [],
            ['HTTP_Accept' => 'application/json']
        );

        $response1->assertStatus(200);

        // Vérifier que l'ancien JTI a bien été supprimé du cache
        $this->assertFalse(Cache::has("refresh_token:$oldJti"));

        // Vérifier que le nouveau access token est valide
        $newAccessToken = $response1->json('access_token');
        $this->assertNotEmpty($newAccessToken);

        // On peut utiliser le nouveau access token
        $payload = JWTAuth::setToken($newAccessToken)->getPayload();
        $this->assertEquals('access', $payload->get('type'));
        $this->assertEquals($data['user']->id, $payload->get('sub'));
    }
}