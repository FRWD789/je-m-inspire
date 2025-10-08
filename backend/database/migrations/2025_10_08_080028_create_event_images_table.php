<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->onDelete('cascade');
            $table->string('image_path');
            $table->integer('display_order')->default(0);
            $table->timestamps();

            $table->index(['event_id', 'display_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_images');
    }
};
