<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Servicio; // Importamos el modelo para insertar datos

class ServicioSeeder extends Seeder
{
    public function run(): void
    {
        // Insertamos los servicios básicos de la barbería
        Servicio::create([
            'nombre' => 'Corte de Pelo Senior',
            'descripcion' => 'Corte clásico o moderno con asesoría de imagen.',
            'precio' => 12000,
            'duracion_minutos' => 45
        ]);

        Servicio::create([
            'nombre' => 'Perfilado de Barba',
            'descripcion' => 'Recorte y perfilado con toalla caliente.',
            'precio' => 8000,
            'duracion_minutos' => 30
        ]);

        Servicio::create([
            'nombre' => 'Servicio Full (Pelo + Barba)',
            'descripcion' => 'Corte premium con perfilado completo.',
            'precio' => 18000,
            'duracion_minutos' => 75
        ]);
    }
}