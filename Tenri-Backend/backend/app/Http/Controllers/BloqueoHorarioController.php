<?php

namespace App\Http\Controllers;

use App\Models\BloqueoHorario;
use App\Models\User;
use Illuminate\Http\Request;

class BloqueoHorarioController extends Controller
{
    /**
     * 🚫 FASE 4A: listar todos los bloqueos del equipo del admin.
     */
    public function index(Request $request)
    {
        $bloqueos = BloqueoHorario::with('barbero:id,name')
            ->where('barberia_id', $request->user()->barberia_id)
            ->orderBy('fecha_inicio', 'desc')
            ->get();

        return response()->json($bloqueos);
    }

    /**
     * Crear un bloqueo (admin asigna vacaciones a un barbero).
     */
    public function store(Request $request)
    {
        $request->validate([
            'barbero_id'   => 'required|exists:users,id',
            'fecha_inicio' => 'required|date',
            'fecha_fin'    => 'required|date|after_or_equal:fecha_inicio',
            'motivo'       => 'nullable|in:vacaciones,dia_libre,permiso,otro',
            'descripcion'  => 'nullable|string|max:200',
        ]);

        $barbero = User::findOrFail($request->barbero_id);

        // 🔒 Multi-tenant safety
        if ($barbero->barberia_id !== $request->user()->barberia_id) {
            return response()->json(['error' => 'Ese barbero no pertenece a tu barbería.'], 403);
        }

        $bloqueo = BloqueoHorario::create([
            'barbero_id'   => $barbero->id,
            'barberia_id'  => $request->user()->barberia_id,
            'fecha_inicio' => $request->fecha_inicio,
            'fecha_fin'    => $request->fecha_fin,
            'motivo'       => $request->motivo ?? 'otro',
            'descripcion'  => $request->descripcion,
        ]);

        $bloqueo->load('barbero:id,name');

        return response()->json([
            'mensaje'  => 'Bloqueo creado con éxito',
            'bloqueo'  => $bloqueo,
        ], 201);
    }

    /**
     * Eliminar bloqueo.
     */
    public function destroy(Request $request, $id)
    {
        $bloqueo = BloqueoHorario::findOrFail($id);

        if ($bloqueo->barberia_id !== $request->user()->barberia_id) {
            return response()->json(['error' => 'No tienes permiso sobre este bloqueo.'], 403);
        }

        $bloqueo->delete();

        return response()->json(['mensaje' => 'Bloqueo eliminado']);
    }
}
