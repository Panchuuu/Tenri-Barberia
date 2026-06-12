<?php

namespace Tests\Feature;

use App\Models\Barberia;
use App\Models\Cita;
use App\Models\Servicio;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class CitaTest extends TestCase
{
    use RefreshDatabase;

    private function setupBarberia(): array
    {
        $barberia = Barberia::factory()->create();
        $barbero  = User::factory()->barbero($barberia->id)->create();
        $servicio = Servicio::factory()->create(['barberia_id' => $barberia->id]);
        $cliente  = User::factory()->cliente()->create();
        return [$barberia, $barbero, $servicio, $cliente];
    }

    public function test_cliente_puede_crear_cita(): void
    {
        Mail::fake();
        [$barberia, $barbero, $servicio, $cliente] = $this->setupBarberia();

        $response = $this->actingAs($cliente)
                         ->postJson('/api/citas', [
                             'barberia_id' => $barberia->id,
                             'barbero_id'  => $barbero->id,
                             'servicio_id' => $servicio->id,
                             'fecha'       => now()->addDays(3)->format('Y-m-d'),
                             'hora'        => '10:00',
                         ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('citas', [
            'cliente_id'  => $cliente->id,
            'barbero_id'  => $barbero->id,
            'servicio_id' => $servicio->id,
        ]);
    }

    public function test_cliente_puede_cancelar_su_cita(): void
    {
        Mail::fake();
        // tiempo_cancelacion=0 evita el check de minutos restantes.
        $barberia = \App\Models\Barberia::factory()->create([
            'tiempo_cancelacion' => 0,
        ]);
        $barbero  = User::factory()->barbero($barberia->id)->create();
        $servicio = \App\Models\Servicio::factory()->create([
            'barberia_id' => $barberia->id,
        ]);
        $cliente  = User::factory()->cliente()->create();

        $cita = Cita::factory()->create([
            'barberia_id' => $barberia->id,
            'barbero_id'  => $barbero->id,
            'servicio_id' => $servicio->id,
            'cliente_id'  => $cliente->id,
            'fecha'       => now()->addDays(5)->format('Y-m-d'),
            'hora'        => '15:00',
            'estado'      => 'confirmada',
        ]);

        $response = $this->actingAs($cliente)
                         ->patchJson("/api/mis-citas/{$cita->id}/cancelar");

        $response->assertStatus(200);
        $this->assertDatabaseHas('citas', [
            'id'     => $cita->id,
            'estado' => 'cancelada',
        ]);
    }

    public function test_no_se_puede_reservar_con_mas_de_90_dias_de_anticipacion(): void
    {
        [$barberia, $barbero, $servicio, $cliente] = $this->setupBarberia();

        $response = $this->actingAs($cliente)
                         ->postJson('/api/citas', [
                             'barberia_id' => $barberia->id,
                             'barbero_id'  => $barbero->id,
                             'servicio_id' => $servicio->id,
                             'fecha'       => now()->addDays(91)->format('Y-m-d'),
                             'hora'        => '10:00',
                         ]);

        $response->assertStatus(422);
    }

    public function test_usuario_no_autenticado_no_puede_crear_cita(): void
    {
        [$barberia, $barbero, $servicio] = $this->setupBarberia();

        $response = $this->postJson('/api/citas', [
            'barberia_id' => $barberia->id,
            'barbero_id'  => $barbero->id,
            'servicio_id' => $servicio->id,
            'fecha'       => now()->addDays(3)->format('Y-m-d'),
            'hora'        => '10:00',
        ]);

        $response->assertStatus(401);
    }
}
