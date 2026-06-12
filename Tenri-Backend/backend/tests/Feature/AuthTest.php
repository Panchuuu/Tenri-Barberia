<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_usuario_puede_registrarse(): void
    {
        $response = $this->postJson('/api/register', [
            'name'                  => 'Test Usuario',
            'email'                 => 'test@tenri.cl',
            'password'              => 'Test1234',
            'password_confirmation' => 'Test1234',
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure(['access_token', 'user']);
    }

    public function test_usuario_puede_hacer_login(): void
    {
        User::factory()->create([
            'email'    => 'login@tenri.cl',
            'password' => bcrypt('Test1234'),
        ]);

        $response = $this->postJson('/api/login', [
            'email'    => 'login@tenri.cl',
            'password' => 'Test1234',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure(['access_token', 'user']);
    }

    public function test_login_falla_con_credenciales_incorrectas(): void
    {
        $response = $this->postJson('/api/login', [
            'email'    => 'noexiste@tenri.cl',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401);
    }

    public function test_usuario_suspendido_no_puede_hacer_login(): void
    {
        User::factory()->suspendido()->create([
            'email'    => 'suspendido@tenri.cl',
            'password' => bcrypt('Test1234'),
        ]);

        $response = $this->postJson('/api/login', [
            'email'    => 'suspendido@tenri.cl',
            'password' => 'Test1234',
        ]);

        $response->assertStatus(403);
    }

    public function test_usuario_autenticado_puede_hacer_logout(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/logout');

        $response->assertStatus(200);
    }
}
