<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('roles')->insert([
            ['role' => 'utilisateur', 'description' => 'utilisateur du site'],
            ['role' => 'professionnel', 'description' => 'professionnel du site'],
            ['role' => 'admin', 'description' => 'admin du site']
        ]);
    }
}
