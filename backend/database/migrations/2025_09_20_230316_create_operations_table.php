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
        Schema::create('operations', function (Blueprint $table) {
            $table->id();

            // FK user (1 user peut avoir plusieurs opérations)
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');

            // FK event (1 event a UNE operation seulement)
            $table->foreignId('event_id')->constrained('events')->onDelete('cascade');

            // FK type_operation
            $table->foreignId('type_operation_id')->constrained('type_operations')->onDelete('cascade');
            $table->integer('adults')->default(0);
            $table->integer('children')->default(0);

            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('operations');
    }
};
