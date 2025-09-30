<?php

namespace Database\Seeders;

use App\Models\User;
use Carbon\Carbon;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'password' => Hash::make('password123'), // mot de passe défini
            'date_of_birth' => Carbon::parse('2000-01-01'),
            'city' => 'Sherbrooke',
            'profile_picture' => null,
        ]);

        $this->call([

            RoleSeeder::class,
            CategorieEventSeeder::class,
            LocalisationSeeder::class,
            TypeOperationSeeder::class,
            EventSeeder::class,
            UserSeeder::class,
            TypePaiementSeeder::class,
            OperationSeeder::class,
        ]);
    }
}
