<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\UpdatePerfilRequest;

class AuthController extends Controller
{
    // 👇 Inyectamos RegisterRequest
    public function register(RegisterRequest $request) {
        
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'rol' => 'cliente' 
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'user' => $user
        ]);
    }

    public function login(LoginRequest $request) {
        
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Credenciales incorrectas'], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'user' => $user
        ]);
    }

    public function updatePerfil(UpdatePerfilRequest $request)
    {
        $user = $request->user();

        $user->name = $request->name;
        $user->email = $request->email;

        if ($request->filled('password')) {
            $user->password = \Illuminate\Support\Facades\Hash::make($request->password);
        }

        // 👇 Guardamos la imagen si el usuario subió una
        if ($request->hasFile('avatar')) {
            // (Opcional) Si quieres ser muy pro, puedes borrar la imagen anterior aquí
            $rutaAvatar = $request->file('avatar')->store('avatares', 'public');
            $user->avatar = $rutaAvatar;
        }

        $user->save();

        // Le agregamos la URL completa para que React la pueda mostrar directo
        if ($user->avatar) {
            $user->avatar_url = asset('storage/' . $user->avatar);
        }

        return response()->json([
            'mensaje' => 'Perfil actualizado con éxito',
            'user' => $user
        ]);
    }
}