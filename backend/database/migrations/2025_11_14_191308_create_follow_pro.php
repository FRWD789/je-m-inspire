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
        Schema::create('follow_pro', function (Blueprint $table) {
            $table->id(); // Clé primaire auto-incrémentée
            $table->foreignId('follower_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('pro_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            // Contrainte unique : un utilisateur ne peut suivre le même pro qu'une seule fois
            $table->unique(['follower_id', 'pro_id']);

            // Index pour améliorer les performances des requêtes
            $table->index('follower_id');
            $table->index('pro_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('follow_pro');
    }
};