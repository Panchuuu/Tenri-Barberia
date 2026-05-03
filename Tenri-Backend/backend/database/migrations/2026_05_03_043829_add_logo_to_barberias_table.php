<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('barberias', function (Blueprint $table) {
            // Agregamos la columna 'logo', que puede estar vacía (nullable)
            $table->string('logo')->nullable()->after('color_principal');
        });
    }

    public function down()
    {
        Schema::table('barberias', function (Blueprint $table) {
            $table->dropColumn('logo');
        });
    }
};