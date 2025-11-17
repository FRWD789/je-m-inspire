<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plan_abonnements', function (Blueprint $table) {
            $table->id();

            // Identifiants
            $table->string('slug')->unique(); // 'pro-plus-monthly', 'pro-plus-yearly'
            $table->string('external_id_stripe')->nullable()->unique(); // Price ID Stripe
            $table->string('external_id_paypal')->nullable()->unique(); // Plan ID PayPal

            // Informations du plan
            $table->string('nom'); // "Pro Plus Mensuel"
            $table->text('description')->nullable();

            // Tarification
            $table->decimal('prix', 10, 2); // 29.99
            $table->char('devise', 3)->default('CAD');
            $table->enum('intervalle', ['month', 'year'])->default('month');
            $table->unsignedTinyInteger('intervalle_count')->default(1);


            // Statut
            $table->boolean('actif')->default(true);
            $table->boolean('populaire')->default(false);

            // Synchronisation
            $table->timestamp('last_synced_at')->nullable();

            $table->timestamps();

            // Index
            $table->index('actif');
            $table->index('slug');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plan_abonnements');
    }
};
