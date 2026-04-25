<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class BarberoController extends Controller
{
    public function index()
    {
        $barberos = User::where('rol', 'barbero')->get();
        return response()->json($barberos);
    }

    public function store(Request $request)
    {
        // 1. Validamos los datos que vienen de React
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
        ]);

        // 2. Creamos el usuario con el rol de barbero
        $barbero = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password), // Encriptamos la clave
            'rol' => 'barbero',
        ]);

        return response()->json([
            'mensaje' => 'Barbero registrado exitosamente',
            'barbero' => $barbero
        ], 201);
    }
}