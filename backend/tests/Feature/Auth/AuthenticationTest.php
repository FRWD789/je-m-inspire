<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }

    public function test_users_can_authenticate_using_the_login_screen(): void
    {

        $user = User::create([
            'name' => "Helpy",
            'last_name' => "Fazbear",
            'email' => "helpyfazbear@gmail.com",
            'date_of_birth' => Carbon::parse("2002-06-10"),
            'city' => "Wingen sur Moder",
            'password' => Hash::make("Freddy"),
        ]);


        $response = $this->post('/', [
            'email' => $user->email,
            'password' => 'Freddy',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = User::create([
            'name' => "Helpy",
            'last_name' => "Fazbear",
            'email' => "helpyfazbear@gmail.com",
            'date_of_birth' => Carbon::parse("2002-06-10"),
            'city' => "Wingen sur Moder",
            'password' => Hash::make("Freddy"),
        ]);

        $this->post('/', [
            'email' => $user->email,
            'password' => 'Fazbear',
        ]);

        $this->assertGuest();
    }

    public function test_users_can_logout(): void
    {
        $user = User::create([
            'name' => "Helpy",
            'last_name' => "Fazbear",
            'email' => "helpyfazbear@gmail.com",
            'date_of_birth' => Carbon::parse("2002-06-10"),
            'city' => "Wingen sur Moder",
            'password' => Hash::make("Freddy"),
        ]);

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');
    }
}
