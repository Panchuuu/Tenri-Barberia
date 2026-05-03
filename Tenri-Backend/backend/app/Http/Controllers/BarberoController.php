<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Barberia;
use Illuminate\Http\Request;

class BarberoController extends Controller
{
    // 🌍 LISTAR PÚBLICO: Filtrado por el "slug" de la empresa (Ej: tenri-barber)
    public function index(Request $request) {
        $slug = $request->query('barberia'); 
        if (!$slug) return response()->json(['error' => 'Debes indicar la barbería'], 400);

        $barberia = Barberia::where('slug', $slug)->firstOrFail();

        // Devolvemos solo los barberos de ESA empresa
        return User::where('rol', 'barbero')->where('barberia_id', $barberia->id)->get();
    }

    // 🔒 ASIGNAR ROL (ADMIN): Se amarra a la empresa del administrador
    public function asignarRol(Request $request) {
        $user = User::where('email', $request->email)->first();
        
        if($user) {
            $user->rol = 'barbero';
            $user->hora_inicio = $request->hora_inicio ?? '10:00:00';
            $user->hora_fin = $request->hora_fin ?? '19:00:00';
            
            // 👇 MAGIA SAAS: Lo asignamos a la empresa del Admin
            $user->barberia_id = $request->user()->barberia_id;
            
            $user->save();
            return response()->json($user);
        }
        return response()->json(['error' => 'Usuario no encontrado'], 404);
    }

    // 🔒 ACTUALIZAR (ADMIN)
    public function update(Request $request, $id) {
        // Aseguramos que el Admin solo edite barberos de SU empresa
        $barbero = User::where('id', $id)
                       ->where('barberia_id', $request->user()->barberia_id)
                       ->firstOrFail();

        $barbero->update([
            'name' => $request->name ?? $barbero->name,
            'hora_inicio' => $request->hora_inicio ?? $barbero->hora_inicio,
            'hora_fin' => $request->hora_fin ?? $barbero->hora_fin,
        ]);

        return response()->json(['mensaje' => 'Especialista actualizado', 'barbero' => $barbero]);
    }

    public function destroy(Request $request, $id) {
        $barbero = User::where('id', $id)
                       ->where('barberia_id', $request->user()->barberia_id)
                       ->firstOrFail();

        // Le quitamos el rol y lo sacamos de la barbería
        $barbero->update([
            'rol' => 'cliente',
            'barberia_id' => null
        ]);

        return response()->json(['mensaje' => 'Especialista removido correctamente']);
    }
}