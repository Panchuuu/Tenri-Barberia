<?php

namespace Tests\Feature;

use App\Models\Barberia;
use App\Models\Cita;
use App\Models\Servicio;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BarberoTest extends TestCase
{
    use RefreshDatabase;

    private function setupBarbero(): array
    {
        $barberia = Barberia::factory()->create();
        $barbero  = User::factory()->barbero($barberia->id)->create();
        return [$barberia, $barbero];
    }

    public function test_barbero_puede_ver_sus_citas(): void
    {
        [$barberia, $barbero] = $this->setupBarbero();
        $cliente  = User::factory()->cliente()->create();
        $servicio = Servicio::factory()->create(['barberia_id' => $barberia->id]);

        Cita::factory()->count(3)->create([
            'barberia_id' => $barberia->id,
            'barbero_id'  => $barbero->id,
            'servicio_id' => $servicio->id,
            'cliente_id'  => $cliente->id,
        ]);

        $response = $this->actingAs($barbero)
                         ->getJson('/api/barbero/citas');

        $response->assertStatus(200);
    }

    public function test_barbero_puede_actualizar_su_perfil(): void
    {
        $barberia = Barberia::factory()->create();
        $barbero  = User::factory()->barbero($barberia->id)->create([
            'email' => 'barbero.test@gmail.com',
        ]);

        $response = $this->actingAs($barbero)
                         ->putJson('/api/perfil', [
                             'name'         => 'Barbero Actualizado',
                             'email'        => $barbero->email,
                             'especialidad' => 'Degradados y diseños',
                             'bio'          => 'Especialista con 5 años de experiencia.',
                         ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', [
            'id'           => $barbero->id,
            'especialidad' => 'Degradados y diseños',
        ]);
    }

    public function test_cliente_no_puede_ver_citas_del_barbero(): void
    {
        $cliente = User::factory()->cliente()->create();

        $response = $this->actingAs($cliente)
                         ->getJson('/api/barbero/citas');

        $response->assertStatus(403);
    }

    public function test_barbero_puede_cambiar_estado_de_cita(): void
    {
        [$barberia, $barbero] = $this->setupBarbero();
        $cliente  = User::factory()->cliente()->create();
        $servicio = Servicio::factory()->create(['barberia_id' => $barberia->id]);

        $cita = Cita::factory()->create([
            'barberia_id' => $barberia->id,
            'barbero_id'  => $barbero->id,
            'servicio_id' => $servicio->id,
            'cliente_id'  => $cliente->id,
            'estado'      => 'pendiente',
        ]);

        $response = $this->actingAs($barbero)
                         ->patchJson("/api/citas/{$cita->id}/estado", [
                             'estado' => 'confirmada',
                         ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('citas', [
            'id'     => $cita->id,
            'estado' => 'confirmada',
        ]);
    }

    public function test_barbero_no_puede_crear_servicios(): void
    {
        [$barberia, $barbero] = $this->setupBarbero();

        $response = $this->actingAs($barbero)
                         ->postJson('/api/servicios', [
                             'nombre'           => 'Corte',
                             'precio'           => 10000,
                             'duracion_minutos' => 30,
                         ]);

        $response->assertStatus(403);
    }
}
