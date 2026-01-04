<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('social_connections', function (Blueprint $table) {
            $table->id();

            // Relation user
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');

            // Plateforme (facebook, instagram, twitter, etc.)
            $table->string('platform'); // 'facebook', 'instagram'

            // Identifiants de la plateforme
            $table->string('platform_user_id')->nullable(); // User ID sur la plateforme
            $table->string('platform_page_id')->nullable(); // Page/Business ID (pour FB/IG)
            $table->string('platform_username')->nullable(); // @username

            // Tokens OAuth
            $table->text('access_token'); // Encrypted
            $table->text('refresh_token')->nullable(); // Encrypted (si plateforme supporte)
            $table->timestamp('token_expires_at')->nullable();

            // Métadonnées
            $table->json('metadata')->nullable(); // Infos additionnelles (permissions, page name, etc.)

            // Status
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_synced_at')->nullable();

            $table->timestamps();

            // Index
            $table->unique(['user_id', 'platform', 'platform_page_id']);
            $table->index(['platform', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('social_connections');
    }
};
