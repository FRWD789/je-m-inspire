<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('localisations', function (Blueprint $table) {
            $table->id(); // clé primaire "id"
            $table->string('name'); // nom de la localisation (ex: "Salle A")
            $table->string('address')->nullable(); // adresse complète ou facultative
            $table->decimal('latitude', 10, 7)->nullable(); // latitude GPS
            $table->decimal('longitude', 10, 7)->nullable(); // longitude GPS
            $table->timestamps();
        });
    }
    //Bright : Ce n'est pas la structure noté dans le schema le plus récent de la DB

    public function down()
    {
        Schema::dropIfExists('localisations');
    }
};
