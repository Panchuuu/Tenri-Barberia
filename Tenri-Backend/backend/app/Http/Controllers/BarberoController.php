<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Requests\UpdateBarberoRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BarberoController extends Controller
{
    /**
     * Listado público de barberos (con filtro por barberia).
     *
     * 🎨 FASE 4A: ahora se incluye avatar_url, bio, especialidad y rating.
     */
    public function index(Request $request)
    {
        $query = User::where('rol', 'barbero');

        if ($request->filled('barberia')) {
            $query->whereHas('barberia', fn ($q) => $q->where('slug', $request->barberia));
        }

        $barberos = $query->get();

        // Modelo User ya incluye avatar_url, promedio_calificacion y total_resenas
        // por sus accessors y campos, así que no necesitamos transformar.
        return response()->json($barberos);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users',
            'password' => 'required|min:8',
        ]);

        $usuario = User::create([
            'name'        => $request->name,
            'email'       => $request->email,
            'password'    => bcrypt($request->password),
            'rol'         => 'barbero',
            'barberia_id' => $request->user()->barberia_id,
        ]);

        return response()->json(['mensaje' => 'Barbero creado', 'barbero' => $usuario], 201);
    }

    /**
     * Asignar rol de barbero a un usuario existente.
     */
    public function asignarRol(Request $request)
    {
        $request->validate([
            'email'       => 'required|email|exists:users,email',
            'hora_inicio' => 'nullable|date_format:H:i',
            'hora_fin'    => 'nullable|date_format:H:i',
        ]);

        $usuario = User::where('email', $request->email)->firstOrFail();

        $usuario->rol         = 'barbero';
        $usuario->barberia_id = $request->user()->barberia_id;

        if ($request->filled('hora_inicio')) $usuario->hora_inicio = $request->hora_inicio;
        if ($request->filled('hora_fin'))    $usuario->hora_fin    = $request->hora_fin;

        $usuario->save();

        return response()->json(['mensaje' => 'Rol asignado', 'barbero' => $usuario]);
    }

    /**
     * 🎨 FASE 4A: update completo del barbero (nombre, horario, bio, especialidad, foto).
     */
    public function update(UpdateBarberoRequest $request, $id)
    {
        $usuario = User::findOrFail($id);

        // Validar que el barbero pertenece a la barbería del admin
        if ($usuario->barberia_id !== $request->user()->barberia_id) {
            return response()->json(['error' => 'No tienes permiso sobre este barbero.'], 403);
        }

        if ($request->filled('name'))         $usuario->name         = $request->name;
        if ($request->filled('hora_inicio'))  $usuario->hora_inicio  = $request->hora_inicio;
        if ($request->filled('hora_fin'))     $usuario->hora_fin     = $request->hora_fin;

        // Campos nuevos Fase 4A
        if ($request->has('bio'))          $usuario->bio          = $request->bio;
        if ($request->has('especialidad')) $usuario->especialidad = $request->especialidad;

        // Avatar
        if ($request->hasFile('avatar')) {
            if ($usuario->avatar && Storage::disk('public')->exists($usuario->avatar)) {
                Storage::disk('public')->delete($usuario->avatar);
            }
            $usuario->avatar = $request->file('avatar')->store('avatares', 'public');
        }

        $usuario->save();

        return response()->json(['mensaje' => 'Barbero actualizado', 'barbero' => $usuario]);
    }

    public function destroy(Request $request, $id)
    {
        $usuario = User::findOrFail($id);

        if ($usuario->barberia_id !== $request->user()->barberia_id) {
            return response()->json(['error' => 'No tienes permiso.'], 403);
        }

        // No borramos al usuario; lo "despasamos" a cliente
        $usuario->rol         = 'cliente';
        $usuario->barberia_id = null;
        $usuario->save();

        return response()->json(['mensaje' => 'Barbero removido del equipo']);
    }
}
