<?php

namespace Tests\Feature;

use App\Models\Barberia;
use App\Models\Servicio;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ServicioTest extends TestCase
{
    use RefreshDatabase;

    private function crearAdminConBarberia(): array
    {
        $barberia = Barberia::factory()->create();
        $admin    = User::factory()->admin($barberia->id)->create();
        return [$admin, $barberia];
    }

    public function test_admin_puede_crear_servicio(): void
    {
        [$admin, $barberia] = $this->crearAdminConBarberia();

        $response = $this->actingAs($admin)
                         ->postJson('/api/servicios', [
                             'nombre'   => 'Corte clásico',
                             'precio'   => 15000,
                             'duracion' => 30,
                         ]);

        $response->assertStatus(201)
                 ->assertJsonPath('nombre', 'Corte clásico');
    }

    public function test_cliente_no_puede_crear_servicio(): void
    {
        $cliente = User::factory()->cliente()->create();

        $response = $this->actingAs($cliente)
                         ->postJson('/api/servicios', [
                             'nombre'   => 'Corte',
                             'precio'   => 10000,
                             'duracion' => 30,
                         ]);

        $response->assertStatus(403);
    }

    public function test_admin_puede_listar_sus_servicios(): void
    {
        [$admin, $barberia] = $this->crearAdminConBarberia();
        Servicio::factory()->count(3)->create(['barberia_id' => $barberia->id]);

        $response = $this->actingAs($admin)
                         ->getJson('/api/mis-servicios');

        $response->assertStatus(200)
                 ->assertJsonCount(3);
    }

    public function test_servicio_requiere_campos_obligatorios(): void
    {
        [$admin] = $this->crearAdminConBarberia();

        $response = $this->actingAs($admin)
                         ->postJson('/api/servicios', []);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['nombre', 'precio', 'duracion']);
    }

    public function test_admin_puede_eliminar_servicio(): void
    {
        [$admin, $barberia] = $this->crearAdminConBarberia();
        $servicio = Servicio::factory()->create(['barberia_id' => $barberia->id]);

        $response = $this->actingAs($admin)
                         ->deleteJson("/api/servicios/{$servicio->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('servicios', ['id' => $servicio->id]);
    }
}
