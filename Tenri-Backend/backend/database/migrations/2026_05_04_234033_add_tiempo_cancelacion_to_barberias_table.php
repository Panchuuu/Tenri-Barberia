<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('barberias', function (Blueprint $table) {
            // Agregamos el tiempo en minutos. Por defecto le pondremos 60 minutos (1 hora).
            $table->integer('tiempo_cancelacion')->default(60);
        });
    }

    public function down(): void
    {
        Schema::table('barberias', function (Blueprint $table) {
            $table->dropColumn('tiempo_cancelacion');
        });
    }
};