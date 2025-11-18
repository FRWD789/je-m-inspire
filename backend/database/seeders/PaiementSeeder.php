<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class PaiementSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('paiements')->insert([
            [
                'total' => 100.00,
                'status' => 'paid',
                'type_paiement_id' => 1, // ⚠️ doit exister dans type_paiements
                'taux_commission' => 10,
                'vendor_id' => 2,
                'session_id' => 'sess_' . uniqid(),
                'paypal_id' => 'paypal_' . uniqid(),
                'paypal_capture_id' => 'capture_' . uniqid(),
                'created_at' => Carbon::now()->subDays(3),
                'updated_at' => Carbon::now()->subDays(3),
            ],
            [
                'total' => 75.50,
                'status' => 'pending',
                'type_paiement_id' => 1,
                'taux_commission' => 5,
                'vendor_id' => 4,
                'session_id' => 'sess_' . uniqid(),
                'paypal_id' => null,
                'paypal_capture_id' => null,
                'created_at' => Carbon::now()->subDays(2),
                'updated_at' => Carbon::now()->subDays(2),
            ],
            [
                'total' => 49.99,
                'status' => 'failed',
                'type_paiement_id' => 2, // ex : paiement abonnement
                'taux_commission' => null,
                'vendor_id' => 1,
                'session_id' => 'sess_' . uniqid(),
                'paypal_id' => 'paypal_' . uniqid(),
                'paypal_capture_id' => null,
                'created_at' => Carbon::now()->subDay(),
                'updated_at' => Carbon::now()->subDay(),
            ],
        ]);
    }
}
