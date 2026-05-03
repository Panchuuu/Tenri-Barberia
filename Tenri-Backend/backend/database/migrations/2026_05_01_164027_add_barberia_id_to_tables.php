<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // 1. Usuarios: Qué barbería administran o en cuál trabajan
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('barberia_id')->nullable()->constrained('barberias')->cascadeOnDelete();
        });

        // 2. Servicios: Catálogo exclusivo de cada local
        Schema::table('servicios', function (Blueprint $table) {
            $table->foreignId('barberia_id')->nullable()->constrained('barberias')->cascadeOnDelete();
        });

        // 3. Citas: En qué local se agendó
        Schema::table('citas', function (Blueprint $table) {
            $table->foreignId('barberia_id')->nullable()->constrained('barberias')->cascadeOnDelete();
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['barberia_id']);
            $table->dropColumn('barberia_id');
        });

        Schema::table('servicios', function (Blueprint $table) {
            $table->dropForeign(['barberia_id']);
            $table->dropColumn('barberia_id');
        });

        Schema::table('citas', function (Blueprint $table) {
            $table->dropForeign(['barberia_id']);
            $table->dropColumn('barberia_id');
        });
    }
};