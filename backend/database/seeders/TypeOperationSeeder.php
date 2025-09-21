<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TypeOperationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('type_operations')->insert([
            ['id' => 1, 'name' => 'Creation Evenement', 'description' => 'Opération liée à la création dun événement par un professionnel.'],
            ['id' => 2, 'name' => 'Reserver Evenement', 'description' => 'Opération pour réserver un événement par un utilisateur.'],
            ['id' => 3, 'name' => 'Transaction', 'description' => 'Opération de transaction financière.'],
        ]);
    }
}
