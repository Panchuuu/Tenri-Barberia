<?php

namespace Database\Factories;

use App\Models\Barberia;
use Illuminate\Database\Eloquent\Factories\Factory;

class ServicioFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nombre'      => fake()->randomElement([
                'Corte clásico', 'Degradado', 'Barba', 'Corte + barba',
                'Afeitado', 'Corte infantil', 'Diseño de cejas',
            ]),
            'precio'      => fake()->numberBetween(5000, 50000),
            'duracion_minutos' => fake()->randomElement([15, 20, 30, 45, 60, 90]),
            'descripcion' => fake()->optional()->sentence(),
            'barberia_id' => Barberia::factory(),
        ];
    }
}
