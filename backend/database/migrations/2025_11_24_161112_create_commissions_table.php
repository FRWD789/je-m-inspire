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
        Schema::create('commissions', function (Blueprint $table) {
            $table->id();

            // Relation avec le paiement
            $table->foreignId('paiement_id')
                  ->constrained('paiements', 'paiement_id')
                  ->onDelete('cascade');

            // Relation avec le vendor (professionnel)
            $table->foreignId('vendor_id')
                  ->constrained('users')
                  ->onDelete('cascade');

            // Montants
            $table->decimal('montant_total', 10, 2); // Montant total du paiement
            $table->decimal('taux_commission', 5, 2); // Taux de commission appliqué (ex: 10.00)
            $table->decimal('montant_commission', 10, 2); // Montant de la commission
            $table->decimal('montant_net', 10, 2); // Montant que le vendor reçoit (total - commission)

            // Type de commission
            // 'direct' : Le vendor a reçu le paiement directement (Pro Plus + compte lié)
            // 'indirect' : La plateforme a reçu le paiement, admin doit transférer
            $table->enum('type', ['direct', 'indirect'])->default('indirect');

            // Statut de la commission
            // 'pending' : En attente de paiement au vendor
            // 'paid' : Payé au vendor (soit automatiquement si direct, soit manuellement par admin)
            $table->enum('status', ['pending', 'paid'])->default('pending');

            // Date de paiement (quand l'admin marque comme payé)
            $table->timestamp('paid_at')->nullable();

            // Notes optionnelles
            $table->text('notes')->nullable();

            $table->timestamps();

            // Index pour optimiser les requêtes
            $table->index(['vendor_id', 'status']);
            $table->index(['type', 'status']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commissions');
    }
};
