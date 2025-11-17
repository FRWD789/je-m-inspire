<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('categorie_events', function (Blueprint $table) {
            $table->id(); // clé primaire "id"
            $table->string('name')->unique(); // nom de la catégorie
            $table->text('description')->nullable(); // description facultative
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('categorie_events');
    }
};
