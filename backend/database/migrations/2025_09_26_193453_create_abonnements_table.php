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
       Schema::create('abonnements', function (Blueprint $table) {
            $table->id('abonnement_id');
            $table->string('nom');                  // Nom de l’abonnement (ex: Pro Plus)
            $table->text('description')->nullable();
            $table->dateTime('date_debut')->nullable();  // Début abonnement
            $table->dateTime('date_fin')->nullable();    // Fin abonnement (calculée depuis plan)
            $table->string('stripe_subscription_id')->nullable();
            $table->string('paypal_subscription_id')->nullable();
            $table->integer('user_id')->constrained('users'); // Utilisateur propriétaire
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('abonnements');
    }
};
