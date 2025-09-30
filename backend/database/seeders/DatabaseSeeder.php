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
        $this->call([
            RoleSeeder::class,
            TypeOperationSeeder::class,
            TypePaiementSeeder::class,
            CategorieEventSeeder::class,
            LocalisationSeeder::class,
            PlanAbonnementSeeder::class,  // <-- AJOUTER ICI
            UserSeeder::class,
            EventSeeder::class,
        ]);
    }
}
