<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('abonnements', function (Blueprint $table) {
            $table->id('abonnement_id');

            // Informations de base
            $table->string('nom');
            $table->text('description')->nullable();

            // Dates
            $table->dateTime('date_debut')->nullable();
            $table->dateTime('date_fin')->nullable();

            // IDs externes (Stripe et PayPal)
            $table->string('stripe_subscription_id')->nullable()->unique();
            $table->string('paypal_subscription_id')->nullable()->unique();

            // Foreign key vers le plan
            $table->foreignId('plan_abonnement_id')
                  ->nullable()
                  ->constrained('plan_abonnements')
                  ->nullOnDelete();

            // Statut de l'abonnement
            $table->enum('status', ['active', 'cancelled', 'suspended', 'expired', 'past_due'])
                  ->default('active');

            // Date de prochain paiement
            $table->timestamp('next_billing_date')->nullable();

            // Si annulation programmée
            $table->boolean('cancel_at_period_end')->default(false);

            // Timestamp de dernière mise à jour du statut
            $table->timestamp('status_updated_at')->nullable();

            $table->timestamps();

            // Index
            $table->index('status');
            $table->index('stripe_subscription_id');
            $table->index('paypal_subscription_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('abonnements');
    }
};
