<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // 🎨 FASE 4A: Bio y especialidad para barberos
            $table->string('bio', 500)->nullable()->after('avatar');
            $table->string('especialidad', 100)->nullable()->after('bio');

            // ⭐ Rating cacheado para evitar recalcular en cada lectura
            $table->decimal('promedio_calificacion', 3, 2)->default(0)->after('especialidad');
            $table->unsignedInteger('total_resenas')->default(0)->after('promedio_calificacion');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['bio', 'especialidad', 'promedio_calificacion', 'total_resenas']);
        });
    }
};
