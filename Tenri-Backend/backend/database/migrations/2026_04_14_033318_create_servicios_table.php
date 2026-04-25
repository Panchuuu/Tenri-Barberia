<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // 'up' define qué columnas tendrá la tabla
    public function up(): void
    {
        Schema::create('servicios', function (Blueprint $table) {
            $table->id(); // ID único
            $table->string('nombre'); // Ej: "Corte Degradado"
            $table->text('descripcion')->nullable(); // Explicación del servicio
            $table->integer('precio'); // Precio en CLP
            $table->integer('duracion_minutos'); // Cuánto demora (ej: 30)
            $table->timestamps(); // Created_at y Updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('servicios');
    }
};