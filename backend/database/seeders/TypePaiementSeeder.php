<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TypePaiementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
         DB::table('type_paiements')->insert([
            ['type_paiement_id' => 1, 'nom' => 'Paiement unique', 'description' => 'paiement unique'],
            ['type_paiement_id' => 2, 'nom' => 'Abonnement', 'description' => 'Paiement initial et renouvellement d\' abonnement'],

        ]);
    }
}
