<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('citas', function (Blueprint $table) {
            $table->id();
            
            // Relaciones (Foreign Keys)
            // Vinculamos con la tabla 'users' (clientes y barberos)
            $table->foreignId('cliente_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('barbero_id')->constrained('users')->onDelete('cascade');
            
            // Vinculamos con la tabla 'servicios'
            $table->foreignId('servicio_id')->constrained('servicios')->onDelete('cascade');

            // Datos de la reserva
            $table->date('fecha');
            $table->time('hora');
            
            // Estado: pendiente, confirmada, cancelada
            $table->string('estado')->default('pendiente');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('citas');
    }
};