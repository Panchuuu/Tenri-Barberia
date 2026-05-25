<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\UpdatePerfilRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'rol'      => 'cliente',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'user'         => $this->withAvatarUrl($user),
        ], 201);
    }

    public function login(LoginRequest $request)
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Credenciales incorrectas'], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'user'         => $this->withAvatarUrl($user),
        ]);
    }

    /**
     * 🆕 FIX FASE 1:
     * Endpoint logout que revoca el token actual del usuario.
     * Antes el frontend solo borraba el token del localStorage,
     * dejando el token "huérfano" pero válido en el servidor.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['mensaje' => 'Sesión cerrada correctamente.']);
    }

    public function updatePerfil(UpdatePerfilRequest $request)
    {
        $user = $request->user();

        $user->name  = $request->name;
        $user->email = $request->email;

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        if ($request->hasFile('avatar')) {
            // Borramos el avatar anterior si existía
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }
            $user->avatar = $request->file('avatar')->store('avatares', 'public');
        }

        $user->save();

        return response()->json([
            'mensaje' => 'Perfil actualizado con éxito',
            'user'    => $this->withAvatarUrl($user),
        ]);
    }

    /**
     * Helper privado: anexa avatar_url al usuario antes de devolverlo.
     */
    private function withAvatarUrl(User $user): User
    {
        if ($user->avatar) {
            $user->avatar_url = asset('storage/' . $user->avatar);
        }
        return $user;
    }
}
