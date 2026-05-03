<?php

namespace App\Http\Controllers;

use App\Models\Barberia;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class BarberiaController extends Controller
{
    // 🌍 LISTAR PÚBLICO: Para la página de inicio (Directorio)
    public function index() {
        return response()->json(Barberia::all());
    }

    // 👑 CREAR (SUPER ADMIN): Crea el negocio y a su primer administrador
    public function store(Request $request) {
        // 1. Validamos todos los datos (incluyendo el logo si viene)
        $request->validate([
            'nombre_barberia' => 'required|string|max:255',
            'color_principal' => 'required|string|max:20',
            'logo' => 'nullable|image|max:2048', // Máximo 2MB
            'admin_nombre' => 'required|string|max:255',
            'admin_email' => 'required|email|unique:users,email',
            'admin_password' => 'required|string|min:6'
        ]);

        // 2. Guardamos el logo en la carpeta storage si es que el admin subió uno
        $rutaLogo = null;
        if ($request->hasFile('logo')) {
            $rutaLogo = $request->file('logo')->store('logos_barberias', 'public');
        }

        // 3. Generamos el "slug" automáticamente
        $slug = \Illuminate\Support\Str::slug($request->nombre_barberia);

        // 4. Creamos la empresa con su logo
        $barberia = Barberia::create([
            'nombre' => $request->nombre_barberia,
            'slug' => $slug,
            'color_principal' => $request->color_principal,
            'logo' => $rutaLogo
        ]);

        // 5. Creamos al administrador dueño de ese negocio
        $admin = User::create([
            'name' => $request->admin_nombre,
            'email' => $request->admin_email,
            'password' => \Illuminate\Support\Facades\Hash::make($request->admin_password),
            'rol' => 'admin',
            'barberia_id' => $barberia->id
        ]);

        return response()->json([
            'mensaje' => 'Barbería y administrador creados con éxito',
            'barberia' => $barberia
        ], 201);
    }
}