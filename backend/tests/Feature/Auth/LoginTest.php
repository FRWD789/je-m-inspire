<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function user_can_login_with_correct_credentials() : void
    {
        // Arrange
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123')
        ]);

        // Act
        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password123'
        ]);

        // Assert
        $response->assertStatus(200)
                 ->assertJsonStructure([
                    'success',
                    'message',
                    'token',
                    'user',
                    'expires_in',
                    'refresh_token'
                 ]);
    }

    #[Test]
    public function user_cannot_login_with_wrong_password() : void
    {
        // Arrange
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123')
        ]);

        // Act
        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'wrongpassword'
        ]);

        // Assert
        $response->assertStatus(401)
                 ->assertJson([
                     'success' => false,
                     'error' => 'Identifiants invalides'
                 ]);
    }

    #[Test]
    public function user_cannot_login_with_wrong_email() : void
    {
        // Arrange
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123')
        ]);

        // Act
        $response = $this->postJson('/api/login', [
            'email' => 'helpy@example.com',
            'password' => 'password123'
        ]);

        // Assert
        $response->assertStatus(401)
                    ->assertJson([
                        'success' => false,
                        'error' => 'Identifiants invalides'
                    ]);

    }

    #[Test]
    public function user_cannot_inject_sql_as_password()
    {
        // Arrange
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123')
        ]);

        // Act
        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password123\' OR \'1\'=\'1'
        ]);

        // Assert
        $response->assertStatus(401)
                    ->assertJson([
                        'success' => false,
                        'error' => 'Identifiants invalides'
                    ]);
    }

    #[Test]
    public function user_cannot_inject_sql_as_email()
    {
        // Arrange
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123')
        ]);

        // Act
        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com\' OR \'1\'=\'1',
            'password' => 'password123'
        ]);

        // Assert
        $response->assertStatus(401)
                    ->assertJson([
                        'success' => false,
                        'error' => 'Identifiant invalides'
                    ]);
    }

    #[Test]
    public function login_requires_email_and_password() : void
    {
        // Act
        $response = $this->postJson('/api/login', []);

        // Assert
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email', 'password']);
    }

    #[Test]
    public function login_cannot_login_with_unapproved_account() : void
    {
        // Arrange
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
            'is_approved' => false
        ]);

        // Act
        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password123'
        ]);

        // Assert
        $response->assertStatus(403)
                    ->assertJson([
                        'success' => false,
                        'error' => 'Compte en attente d\'approbation'
                    ]);
    }

    #[Test]
    public function login_cannot_login_with_disabled_account() : void
    {
        // Arrange
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
            'email_verified_at' => date('2023-01-01'),
            'last_login_at' => date('2023-01-02'),
        ]);
        Role::factory()->create(['id' => 2, 'role' => 'utilisateur']); // Ensure the 'utilisateur' role exists
        $user->roles()->attach(2); // Attach 'utilisateur' role

        // Act
        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password123'
        ]);

        // Assert
        $response->assertStatus(403)
                    ->assertJson([
                        'success' => false,
                        'error' => 'Votre compte a été désactivé en raison d\'une inactivité de plus de 90 jours. Veuillez contacter le support.'
                    ]);
    }
}