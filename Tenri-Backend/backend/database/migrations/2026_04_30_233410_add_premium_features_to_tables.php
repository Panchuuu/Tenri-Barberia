<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // 1. Agregamos la columna de imagen a los servicios
        Schema::table('servicios', function (Blueprint $table) {
            $table->string('imagen')->nullable()->after('descripcion');
        });

        // 2. Agregamos avatar y horarios a los usuarios (barberos)
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar')->nullable()->after('email');
            // Por defecto, si no le pones horario, trabajarán de 10 a 19
            $table->time('hora_inicio')->default('10:00:00')->after('rol');
            $table->time('hora_fin')->default('19:00:00')->after('hora_inicio');
        });
    }

    public function down()
    {
        Schema::table('servicios', function (Blueprint $table) {
            $table->dropColumn('imagen');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['avatar', 'hora_inicio', 'hora_fin']);
        });
    }
};