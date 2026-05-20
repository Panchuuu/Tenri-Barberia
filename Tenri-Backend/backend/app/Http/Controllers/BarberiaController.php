<?php

namespace App\Http\Controllers;

use App\Models\Barberia;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
// 👇 Importamos nuestro nuevo Request
use App\Http\Requests\StoreBarberiaRequest;

class BarberiaController extends Controller
{
    public function index() {
        return response()->json(\App\Models\Barberia::paginate(10));
    }

    // 👇 Usamos StoreBarberiaRequest. Si llega aquí, todo es válido.
    public function store(StoreBarberiaRequest $request) {
        
        $rutaLogo = null;
        if ($request->hasFile('logo')) {
            $rutaLogo = $request->file('logo')->store('logos_barberias', 'public');
        }

        $slug = Str::slug($request->nombre_barberia);

        $barberia = Barberia::create([
            'nombre' => $request->nombre_barberia,
            'slug' => $slug,
            'color_principal' => $request->color_principal,
            'logo' => $rutaLogo
        ]);

        $admin = User::create([
            'name' => $request->admin_nombre,
            'email' => $request->admin_email,
            'password' => Hash::make($request->admin_password),
            'rol' => 'admin',
            'barberia_id' => $barberia->id
        ]);

        return response()->json([
            'mensaje' => 'Barbería y administrador creados con éxito',
            'barberia' => $barberia
        ], 201);
    }

    public function miBarberia(Request $request)
    {
        $barberia = Barberia::findOrFail($request->user()->barberia_id);
        return response()->json($barberia);
    }

    public function updateConfig(Request $request)
    {
        // Como esta validación es de solo 1 línea, podemos dejarla aquí para no hacer un archivo extra,
        // pero el método 'store' (que era gigante) ya está completamente limpio.
        $request->validate([
            'tiempo_cancelacion' => 'required|integer|min:0'
        ]);

        $barberia = Barberia::findOrFail($request->user()->barberia_id);
        
        $barberia->tiempo_cancelacion = $request->tiempo_cancelacion;
        $barberia->save();

        return response()->json([
            'mensaje' => 'Configuración actualizada correctamente', 
            'barberia' => $barberia
        ]);
    }
}