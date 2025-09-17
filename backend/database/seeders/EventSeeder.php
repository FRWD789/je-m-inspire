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
        $events = [
            [
                'name' => 'Yoga du Matin',
                'description' => 'Commencez votre journée avec une séance de yoga énergisante pour éveiller le corps et l’esprit.',
                'start_date' => Carbon::now()->addDays(1)->setTime(7, 0),
                'end_date' => Carbon::now()->addDays(1)->setTime(8, 30),
                'base_price' => 15.00,
                'capacity' => 20,
                'max_places' => 2,
                'available_places' => 20,
                'level' => 'Débutant',
                'priority' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Méditation Guidée',
                'description' => 'Détendez-vous et trouvez la paix intérieure grâce à une séance de méditation guidée.',
                'start_date' => Carbon::now()->addDays(2)->setTime(18, 0),
                'end_date' => Carbon::now()->addDays(2)->setTime(19, 0),
                'base_price' => 10.00,
                'capacity' => 25,
                'max_places' => 1,
                'available_places' => 25,
                'level' => 'Tous niveaux',
                'priority' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Atelier Holistique : Corps & Esprit',
                'description' => 'Explorez des techniques de bien-être holistique incluant étirements, respiration et pleine conscience.',
                'start_date' => Carbon::now()->addDays(3)->setTime(14, 0),
                'end_date' => Carbon::now()->addDays(3)->setTime(17, 0),
                'base_price' => 40.00,
                'capacity' => 15,
                'max_places' => 1,
                'available_places' => 15,
                'level' => 'Intermédiaire',
                'priority' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Séance de Respiration Consciente',
                'description' => 'Apprenez à gérer le stress et à augmenter votre énergie grâce à des techniques de respiration guidée.',
                'start_date' => Carbon::now()->addDays(4)->setTime(10, 0),
                'end_date' => Carbon::now()->addDays(4)->setTime(11, 30),
                'base_price' => 12.00,
                'capacity' => 20,
                'max_places' => 1,
                'available_places' => 20,
                'level' => 'Tous niveaux',
                'priority' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Atelier Relaxation Profonde',
                'description' => 'Découvrez des techniques de relaxation profonde pour relâcher les tensions physiques et mentales.',
                'start_date' => Carbon::now()->addDays(5)->setTime(16, 0),
                'end_date' => Carbon::now()->addDays(5)->setTime(18, 0),
                'base_price' => 30.00,
                'capacity' => 15,
                'max_places' => 1,
                'available_places' => 15,
                'level' => 'Avancé',
                'priority' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];
        DB::table('events')->insert($events);
    }
}
