<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorieEventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('categorie_events')->insert([
            [
                'name' => 'Méditation',
                'description' => 'Événements liés à la pratique de la méditation et de la pleine conscience.',
            ],
            [
                'name' => 'Yoga',
                'description' => 'Événements dédiés à la pratique du yoga sous différentes formes.',
            ],
            [
                'name' => 'Santé Mentale',
                'description' => 'Événements abordant le bien-être mental et émotionnel, incluant des séminaires et ateliers.',
            ],
            [
                'name' => 'Retraite',
                'description' => 'Retraites immersives pour explorer le bien-être physique et spirituel.',
            ],
        ]);
    }
}
