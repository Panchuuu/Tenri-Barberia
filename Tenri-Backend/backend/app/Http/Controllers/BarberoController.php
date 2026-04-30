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

    public function asignarRol(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'No existe ningún usuario registrado con este correo.'], 404);
        }

        $user->rol = 'barbero';
        $user->save();

        return response()->json([
            'mensaje' => 'Usuario ascendido a Especialista con éxito',
            'barbero' => $user
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
        ]);

        $barbero = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'rol' => 'barbero',
        ]);

        return response()->json([
            'mensaje' => 'Barbero registrado exitosamente',
            'barbero' => $barbero
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email,' . $id
        ]);

        $user->update([
            'name' => $request->name,
            'email' => $request->email
        ]);

        return response()->json(['mensaje' => 'Especialista actualizado', 'barbero' => $user]);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->rol = 'cliente';
        $user->save();

        return response()->json(['mensaje' => 'Especialista removido del equipo']);
    }
}