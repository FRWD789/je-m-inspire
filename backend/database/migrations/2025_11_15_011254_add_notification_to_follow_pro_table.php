<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('follow_pro', function (Blueprint $table) {
            $table->boolean('notifications_enabled')->default(true)->after('pro_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('follow_pro', function (Blueprint $table) {
            $table->dropColumn('notifications_enabled');
        });
    }
};