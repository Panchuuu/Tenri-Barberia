<?php

namespace Database\Factories;

use App\Models\Barberia;
use App\Models\Servicio;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CitaFactory extends Factory
{
    public function definition(): array
    {
        $barberia = Barberia::factory()->create();
        $barbero  = User::factory()->barbero($barberia->id)->create();
        $servicio = Servicio::factory()->create(['barberia_id' => $barberia->id]);

        return [
            'barberia_id' => $barberia->id,
            'cliente_id'  => User::factory()->cliente(),
            'barbero_id'  => $barbero->id,
            'servicio_id' => $servicio->id,
            'fecha'       => fake()->dateTimeBetween('now', '+30 days')->format('Y-m-d'),
            'hora'        => fake()->randomElement([
                '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'
            ]),
            'estado'      => 'pendiente',
        ];
    }

    public function confirmada(): static
    {
        return $this->state(fn (array $attributes) => [
            'estado' => 'confirmada',
        ]);
    }

    public function cancelada(): static
    {
        return $this->state(fn (array $attributes) => [
            'estado' => 'cancelada',
        ]);
    }
}
