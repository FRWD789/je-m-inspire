<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LocalisationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('localisations')->insert([
            [
                'name' => 'Salle A',
                'address' => '10 Rue de la Paix, Paris, France',
                'latitude' => 48.8566,
                'longitude' => 2.3522,
            ],
            [
                'name' => 'Salle B',
                'address' => '15 Rue du Bien-être, Lyon, France',
                'latitude' => 45.7640,
                'longitude' => 4.8357,
            ],
            [
                'name' => 'Jardin Zen',
                'address' => '32 Avenue de la Nature, Nice, France',
                'latitude' => 43.7102,
                'longitude' => 7.2620,
            ],
            [
                'name' => 'Centre Holistique',
                'address' => '50 Rue de la Sérénité, Marseille, France',
                'latitude' => 43.2965,
                'longitude' => 5.3698,
            ],
        ]);
    }
}
