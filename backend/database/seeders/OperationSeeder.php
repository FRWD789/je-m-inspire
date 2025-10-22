<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Event;
use App\Models\Paiement;
use App\Models\Operation;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class OperationSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('operations')->insert([
        [
            'user_id' => 3,
            'event_id' => 1,
            'type_operation_id' => 1, // Paiement réservation
            'paiement_id' => 1,
            'abonnement_id' => null,
            'created_at' => Carbon::now()->subDays(3),
            'updated_at' => Carbon::now()->subDays(3),
        ],
        [
            'user_id' => 3,
            'event_id' => 1,
            'type_operation_id' => 2, // Remboursement (ex.)
            'paiement_id' => 2,
            'abonnement_id' => null,
            'created_at' => Carbon::now()->subDay(),
            'updated_at' => Carbon::now()->subDay(),
        ],
    ]);

    }
}
