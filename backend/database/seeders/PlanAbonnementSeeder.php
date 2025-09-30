<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PlanAbonnement;

class PlanAbonnementSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('📝 Seeding des plans d\'abonnement...');

        // Plan Pro Plus Mensuel
        PlanAbonnement::create([
            'slug' => 'pro-plus-monthly',
            'external_id_stripe' => config('services.stripe.pro_plus_price_id'),
            'external_id_paypal' => config('services.paypal.pro_plus_plan_id'),
            'nom' => 'Pro Plus Mensuel',
            'description' => 'Abonnement Pro Plus mensuel avec toutes les fonctionnalités premium',
            'prix' => 29.99,
            'devise' => 'CAD',
            'intervalle' => 'month',
            'intervalle_count' => 1,
            'actif' => true,
            'populaire' => true,
        ]);

        $this->command->info('✅ Plans d\'abonnement créés');
    }
}
