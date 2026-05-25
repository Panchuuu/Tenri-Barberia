<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('barberias', function (Blueprint $table) {
            // 👇 Añadimos el plan. Por defecto será 'pro'
            $table->string('plan')->default('pro')->after('color_principal');
            
            // 👇 Añadimos el estado. Puede ser 'activa' o 'suspendida'
            $table->string('estado_suscripcion')->default('activa')->after('plan');
        });
    }

    public function down()
    {
        Schema::table('barberias', function (Blueprint $table) {
            // Si hacemos rollback, borramos estas columnas
            $table->dropColumn(['plan', 'estado_suscripcion']);
        });
    }
};