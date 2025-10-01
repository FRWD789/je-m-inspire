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
        Schema::create('paiements', function (Blueprint $table) {
            $table->id('paiement_id');
            $table->float("total",6,2);
            $table->string('status');
            $table->unsignedBigInteger('type_paiement_id');
            $table->integer('taux_commission')->nullable(); //permet de calculer la commission en multipliant avec le montant
            $table->integer('vendor_id')->nullable();
            $table->string("session_id")->nullable();
            $table->string("paypal_id")->nullable();
            $table->string("paypal_capture_id")->nullable();

            $table->timestamps();

            $table->foreign('type_paiement_id')->references('type_paiement_id')->on('type_paiements');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('paiements');
    }
};
