<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Récupérer les rôles existants avec les BONS noms
        $adminRole = Role::where('role', 'admin')->first();

        // Vérifier que les rôles existent
        if (!$adminRole) {
            $this->command->error('Les rôles n\'existent pas. Vérifiez que RoleSeeder s\'exécute avant UserSeeder.');
            return;
        }

        // Créer un utilisateur admin
        $admin = User::firstOrCreate(
            ['email' => 'Jcbeaulieu006@gmail.com'],
            [
                'name' => 'Jean-Christophe',
                'last_name' => 'Beaulieu',
                'date_of_birth' => Carbon::parse('1990-01-01'),
                'city' => 'Sherbrooke',
                'profile_picture' => null,
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );

        // Attacher le rôle admin
        if (!$admin->roles->contains($adminRole->id)) {
            $admin->roles()->attach($adminRole->id);
        }

        $this->command->info('Admin: Jcbeaulieu006@gmail.com / password123');
    }
}
