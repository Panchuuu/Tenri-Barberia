<?php

namespace App\Http\Controllers;

use App\Models\Cita;
use App\Models\User;
use App\Mail\CitaCanceladaMail;
use App\Http\Requests\UpdateBarberoRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class BarberoController extends Controller
{
    /**
     * 🎨 FASE 4A: incluye avatar_url, bio, especialidad y rating.
     */
    public function index(Request $request)
    {
        $query = User::where('rol', 'barbero');

        if ($request->filled('barberia')) {
            $query->whereHas('barberia', fn ($q) => $q->where('slug', $request->barberia));
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:80',
            'email'    => 'required|email:rfc,dns,filter|max:120|unique:users',
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

    public function asignarRol(Request $request)
    {
        $request->validate([
            'email'       => 'required|email:rfc,dns,filter|max:120|exists:users,email',
            'hora_inicio' => 'nullable|date_format:H:i',
            'hora_fin'    => 'nullable|date_format:H:i',
        ], [
            'email.exists' => 'No existe ningún usuario con ese correo. Pídele que se registre primero.',
        ]);

        $usuario = User::where('email', $request->email)->firstOrFail();

        $usuario->rol         = 'barbero';
        $usuario->barberia_id = $request->user()->barberia_id;

        if ($request->filled('hora_inicio')) $usuario->hora_inicio = $request->hora_inicio;
        if ($request->filled('hora_fin'))    $usuario->hora_fin    = $request->hora_fin;

        $usuario->save();

        return response()->json(['mensaje' => 'Rol asignado', 'barbero' => $usuario]);
    }

    public function update(UpdateBarberoRequest $request, $id)
    {
        $usuario = User::findOrFail($id);

        if ($usuario->barberia_id !== $request->user()->barberia_id) {
            return response()->json(['error' => 'No tienes permiso sobre este barbero.'], 403);
        }

        if ($request->filled('name'))        $usuario->name        = $request->name;
        if ($request->filled('hora_inicio')) $usuario->hora_inicio = $request->hora_inicio;
        if ($request->filled('hora_fin'))    $usuario->hora_fin    = $request->hora_fin;
        if ($request->has('bio'))            $usuario->bio          = $request->bio;
        if ($request->has('especialidad'))   $usuario->especialidad = $request->especialidad;

        if ($request->hasFile('avatar')) {
            if ($usuario->avatar && Storage::disk('public')->exists($usuario->avatar)) {
                Storage::disk('public')->delete($usuario->avatar);
            }
            $usuario->avatar = $request->file('avatar')->store('avatares', 'public');
        }

        $usuario->save();

        return response()->json(['mensaje' => 'Barbero actualizado', 'barbero' => $usuario]);
    }

    /**
     * ============================================================
     * 🔧 FIX #17: al remover un barbero, CANCELAR todas sus citas
     *             pendientes/confirmadas + avisar a los clientes
     * ============================================================
     * Antes: el destroy solo cambiaba el rol → quedaban citas huérfanas
     *        que el cliente todavía veía como "pendientes" y podía
     *        intentar reagendar.
     *
     * Ahora:
     *   1. Buscamos todas las citas no-finalizadas del barbero
     *   2. Las marcamos como "cancelada" en una transacción
     *   3. Enviamos email al cliente de cada cita cancelada
     *   4. Removemos al barbero del equipo
     * ============================================================
     */
    public function destroy(Request $request, $id)
    {
        $usuario = User::findOrFail($id);

        if ($usuario->barberia_id !== $request->user()->barberia_id) {
            return response()->json(['error' => 'No tienes permiso.'], 403);
        }

        // Buscamos citas activas (no finalizadas ni canceladas) del barbero
        $citasActivas = Cita::with(['cliente', 'servicio'])
            ->where('barbero_id', $usuario->id)
            ->whereNotIn('estado', ['finalizada', 'cancelada'])
            ->get();

        $cantidadCanceladas = 0;
        $erroresEmail       = 0;

        DB::transaction(function () use ($usuario, $citasActivas, &$cantidadCanceladas, &$erroresEmail) {
            foreach ($citasActivas as $cita) {
                $cita->estado = 'cancelada';
                $cita->save();
                $cantidadCanceladas++;

                // Email al cliente (no rompemos la transacción si falla)
                try {
                    if ($cita->cliente && $cita->cliente->email) {
                        Mail::to($cita->cliente->email)->send(new CitaCanceladaMail($cita));
                    }
                } catch (\Throwable $e) {
                    $erroresEmail++;
                    \Log::warning("Email no enviado al cancelar cita #{$cita->id}: " . $e->getMessage());
                }
            }

            // Despasamos al barbero a cliente normal
            $usuario->rol         = 'cliente';
            $usuario->barberia_id = null;
            $usuario->save();
        });

        return response()->json([
            'mensaje'             => 'Barbero removido del equipo',
            'citas_canceladas'    => $cantidadCanceladas,
            'errores_email'       => $erroresEmail,
            'detalle'             => $cantidadCanceladas > 0
                ? "Se cancelaron {$cantidadCanceladas} citas activas y se notificó a los clientes."
                : 'El barbero no tenía citas activas.',
        ]);
    }
}
