<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('barberias', function (Blueprint $table) {
            $table->id();
            $table->string('nombre'); // Ej: Tenri Barber
            $table->string('slug')->unique(); // Ej: tenri-barber (para la URL tu-sistema.com/tenri-barber)
            $table->string('logo')->nullable();
            $table->string('color_principal')->default('#10b981'); // Tu esmeralda por defecto
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('barberias');
    }
};