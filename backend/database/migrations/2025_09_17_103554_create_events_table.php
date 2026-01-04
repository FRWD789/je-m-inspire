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
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->dateTime('start_date');
            $table->dateTime('end_date');
            $table->decimal('base_price', 10, 2);
            $table->integer('capacity');
            $table->integer('max_places');
            $table->integer('available_places');
            $table->boolean('is_cancelled')->default(false);
            $table->timestamp('cancelled_at')->nullable();
            $table->string('level');
            $table->integer('priority');

            // ✅ CORRECTION : Retirer tous les ->after() pour CREATE TABLE
            // ID de l'event sur les différentes plateformes (JSON pour supporter plusieurs)
            $table->json('social_platform_ids')->nullable();
            // Ex: {"facebook": "123456", "instagram": "789012"}

            // Statut de synchronisation global
            $table->enum('sync_status', ['pending', 'synced', 'failed', 'disabled'])
                ->default('disabled');

            // Dernière tentative de sync
            $table->timestamp('last_synced_at')->nullable();

            // Erreurs de sync (JSON pour tracker les erreurs par plateforme)
            $table->json('sync_errors')->nullable();
            // Ex: {"facebook": "Invalid token", "instagram": null}

            // FK localisation
            $table->foreignId('localisation_id')->constrained('localisations')->onDelete('cascade');

            // FK catégorie
            $table->foreignId('categorie_event_id')->constrained('categorie_events')->onDelete('cascade');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
