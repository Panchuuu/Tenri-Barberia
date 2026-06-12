<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    // ── States por rol ──────────────────────────────────────

    public function superadmin(): static
    {
        return $this->state(fn (array $attributes) => [
            'rol' => 'superadmin',
        ]);
    }

    public function admin(?int $barberiaId = null): static
    {
        return $this->state(fn (array $attributes) => [
            'rol'         => 'admin',
            'barberia_id' => $barberiaId,
        ]);
    }

    public function barbero(?int $barberiaId = null): static
    {
        return $this->state(fn (array $attributes) => [
            'rol'         => 'barbero',
            'barberia_id' => $barberiaId,
            'hora_inicio' => '09:00',
            'hora_fin'    => '18:00',
        ]);
    }

    public function cliente(): static
    {
        return $this->state(fn (array $attributes) => [
            'rol' => 'cliente',
        ]);
    }

    public function suspendido(): static
    {
        return $this->state(fn (array $attributes) => [
            'suspendido' => true,
        ]);
    }
}
