<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('operations', function (Blueprint $table) {
            $table->id();

            // FK user (1 user peut avoir plusieurs opérations)
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');

            // FK event (1 event peut avoir plusieurs opérations)
            $table->foreignId('event_id')->constrained('events')->onDelete('cascade');

            // FK type_operation
            $table->foreignId('type_operation_id')->constrained('type_operations')->onDelete('cascade');

            // Nombre de places (remplace adults + children)
            $table->integer('quantity')->default(1);

            // FK paiement (optionnel)
            $table->foreignId('paiement_id')->nullable()->constrained('paiements', 'paiement_id')->onDelete('set null');

            // FK abonnement (optionnel)
            $table->foreignId('abonnement_id')->nullable()->constrained('abonnements', 'abonnement_id')->onDelete('set null');

            $table->timestamps();

            // Index pour les requêtes courantes
            $table->index(['user_id', 'type_operation_id']);
            $table->index(['event_id', 'type_operation_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('operations');
    }
};
