<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class BarberiaFactory extends Factory
{
    public function definition(): array
    {
        $nombre = fake()->company() . ' Barbería';

        return [
            'nombre'              => $nombre,
            'slug'                => Str::slug($nombre) . '-' . fake()->unique()->numberBetween(1, 9999),
            'color_principal'     => fake()->hexColor(),
            'tiempo_cancelacion'  => fake()->numberBetween(0, 1440),
        ];
    }
}
