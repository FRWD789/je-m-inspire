<?php

namespace Tests\Unit\Models;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;

class UserTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function user_can_have_roles() : void
    {
        // Arrange
        $user = User::factory()->create();
        $role = Role::create(['role' => 'pro',
                              'description' => 'Professional user']);

        // Act
        $user->roles()->attach($role->id);

        // Assert
        $this->assertTrue($user->roles->contains($role->id));
        $this->assertEquals('pro', $user->roles->first()->role);
    }

    #[Test]
    public function user_has_commission_rate_attribute() : void
    {
        // Arrange & Act
        $user = User::factory()->create([
            'commission_rate' => 15.5
        ]);

        // Assert
        $this->assertEquals(15.5, $user->commission_rate);
    }

    #[Test]
    public function user_can_have_stripe_account() : void
    {
        // Arrange & Act
        $user = User::factory()->create([
            'stripeAccount_id' => 'acct_test123'
        ]);

        // Assert
        $this->assertNotNull($user->stripeAccount_id);
        $this->assertEquals('acct_test123', $user->stripeAccount_id);
    }
}