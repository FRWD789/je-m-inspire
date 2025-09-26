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
        $professionalRole = Role::where('role', 'professionnel')->first(); // 'professionnel' pas 'professional'
        $userRole = Role::where('role', 'utilisateur')->first(); // 'utilisateur' pas 'user'

        // Vérifier que les rôles existent
        if (!$adminRole || !$professionalRole || !$userRole) {
            $this->command->error('Les rôles n\'existent pas. Vérifiez que RoleSeeder s\'exécute avant UserSeeder.');
            return;
        }

        // Créer un utilisateur admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin',
                'last_name' => 'Administrateur',
                'date_of_birth' => Carbon::parse('1990-01-01'),
                'city' => 'Paris',
                'profile_picture' => null,
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );

        // Attacher le rôle admin
        if (!$admin->roles->contains($adminRole->id)) {
            $admin->roles()->attach($adminRole->id);
        }

        // Créer un utilisateur professionnel
        $professional = User::firstOrCreate(
            ['email' => 'pro@example.com'],
            [
                'name' => 'Pro',
                'last_name' => 'Professionnel',
                'date_of_birth' => Carbon::parse('1985-05-15'),
                'city' => 'Lyon',
                'profile_picture' => null,
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );

        // Attacher le rôle professionnel
        if (!$professional->roles->contains($professionalRole->id)) {
            $professional->roles()->attach($professionalRole->id);
        }

        // Créer un utilisateur normal
        $user = User::firstOrCreate(
            ['email' => 'user@example.com'],
            [
                'name' => 'User',
                'last_name' => 'Utilisateur',
                'date_of_birth' => Carbon::parse('1995-12-25'),
                'city' => 'Marseille',
                'profile_picture' => null,
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );

        // Attacher le rôle utilisateur
        if (!$user->roles->contains($userRole->id)) {
            $user->roles()->attach($userRole->id);
        }

        $this->command->info('Utilisateurs créés avec succès !');
        $this->command->info('Admin: admin@example.com / password123');
        $this->command->info('Pro: pro@example.com / password123');
        $this->command->info('User: user@example.com / password123');
    }
}
