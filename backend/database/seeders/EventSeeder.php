<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('events')->insert([
            [
                'name' => 'Retraite de Méditation',
                'description' => 'Un week-end de retraite immersive pour explorer la pleine conscience et la méditation en pleine nature.',
                'start_date' => Carbon::create('2025', '11', '15', '10', '00', '00'),
                'end_date' => Carbon::create('2025', '11', '17', '16', '00', '00'),
                'base_price' => 299.99,
                'capacity' => 30,
                'max_places' => 30,
                'available_places' => 30,
                'level' => 'Débutant',
                'priority' => 1,
                'localisation_id' => 1,  // Assure-toi que l'ID existe dans la table localisations
                'categorie_event_id' => 2,  // Assure-toi que l'ID existe dans la table categorie_events
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Atelier de Yoga en Plein Air',
                'description' => 'Un atelier de yoga guidé en plein air pour se reconnecter avec la nature et son corps.',
                'start_date' => Carbon::create('2025', '12', '05', '08', '30', '00'),
                'end_date' => Carbon::create('2025', '12', '05', '12', '30', '00'),
                'base_price' => 50.00,
                'capacity' => 20,
                'max_places' => 20,
                'available_places' => 20,
                'level' => 'Tous niveaux',
                'priority' => 2,
                'localisation_id' => 2,  // Assure-toi que l'ID existe dans la table localisations
                'categorie_event_id' => 1,  // Assure-toi que l'ID existe dans la table categorie_events
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Séminaire Holistique sur la Santé Mentale',
                'description' => 'Un séminaire pour apprendre à mieux gérer le stress et améliorer sa santé mentale grâce aux approches holistiques.',
                'start_date' => Carbon::create('2025', '12', '10', '09', '00', '00'),
                'end_date' => Carbon::create('2025', '12', '10', '17', '00', '00'),
                'base_price' => 180.00,
                'capacity' => 50,
                'max_places' => 50,
                'available_places' => 50,
                'level' => 'Intermédiaire',
                'priority' => 3,
                'localisation_id' => 3,  // Assure-toi que l'ID existe dans la table localisations
                'categorie_event_id' => 3,  // Assure-toi que l'ID existe dans la table categorie_events
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
