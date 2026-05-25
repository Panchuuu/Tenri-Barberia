<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bloqueos_horario', function (Blueprint $table) {
            $table->id();

            // El barbero al que aplica
            $table->foreignId('barbero_id')->constrained('users')->cascadeOnDelete();

            // La barbería (para consultas rápidas + multi-tenant safety)
            $table->foreignId('barberia_id')->constrained('barberias')->cascadeOnDelete();

            // Rango de fechas (puede ser un solo día: fecha_inicio == fecha_fin)
            $table->date('fecha_inicio');
            $table->date('fecha_fin');

            // Tipo de bloqueo (opcional, solo para mostrar al admin)
            $table->enum('motivo', ['vacaciones', 'dia_libre', 'permiso', 'otro'])->default('otro');

            // Nota libre opcional
            $table->string('descripcion', 200)->nullable();

            $table->timestamps();

            // Índices para consultas rápidas
            $table->index(['barbero_id', 'fecha_inicio', 'fecha_fin']);
            $table->index('barberia_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bloqueos_horario');
    }
};
