<?php

namespace App\Http\Controllers;

use App\Http\Requests\ActualizarRolUsuarioRequest;
use App\Models\User;
use Illuminate\Http\Request;

class SuperAdminUsuarioController extends Controller
{
    /**
     * Listar todos los usuarios del sistema.
     * Soporta filtro por rol y búsqueda por nombre/email.
     */
    public function index(Request $request)
    {
        $query = User::with('barberia:id,nombre')
            ->select('id','name','email','rol','suspendido',
                     'barberia_id','avatar','created_at');

        // Filtro opcional por rol
        if ($request->filled('rol')) {
            $query->where('rol', $request->rol);
        }

        // Búsqueda por nombre o email
        if ($request->filled('buscar')) {
            $query->where(function ($q) use ($request) {
                $q->where('name',  'ilike', '%'.$request->buscar.'%')
                  ->orWhere('email', 'ilike', '%'.$request->buscar.'%');
            });
        }

        $usuarios = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json($usuarios);
    }

    /**
     * Cambiar el rol de un usuario.
     * Guard: no puede cambiarse el propio rol.
     */
    public function cambiarRol(ActualizarRolUsuarioRequest $request, $id)
    {
        $usuario = User::findOrFail($id);

        // Self-protection: el superadmin no puede degradar su propio rol.
        if ($usuario->id === $request->user()->id) {
            return response()->json([
                'message' => 'No puedes cambiar tu propio rol.',
            ], 403);
        }

        $usuario->rol = $request->rol;

        // Si pasa a barbero o admin sin barberia_id, no forzamos —
        // eso se gestiona desde el panel de equipo de cada barbería.
        $usuario->save();

        return response()->json([
            'mensaje'  => 'Rol actualizado correctamente.',
            'usuario'  => $usuario,
        ]);
    }

    /**
     * Suspender o reactivar un usuario.
     * Al suspender: se revocan todos sus tokens activos.
     * Guard: no puede suspenderse a sí mismo.
     */
    public function toggleSuspendido(Request $request, $id)
    {
        $usuario = User::findOrFail($id);

        if ($usuario->id === $request->user()->id) {
            return response()->json([
                'message' => 'No puedes suspender tu propia cuenta.',
            ], 403);
        }

        $usuario->suspendido = !$usuario->suspendido;
        $usuario->save();

        // Si se suspende, revocar todos los tokens activos.
        // Así el usuario queda deslogueado en el próximo request.
        if ($usuario->suspendido) {
            $usuario->tokens()->delete();
        }

        return response()->json([
            'mensaje'   => $usuario->suspendido
                ? 'Usuario suspendido. Sus sesiones activas han sido cerradas.'
                : 'Usuario reactivado correctamente.',
            'usuario'   => $usuario,
        ]);
    }

    /**
     * Eliminar un usuario permanentemente.
     * Guard: no puede eliminarse a sí mismo.
     * Nota: las citas históricas pueden restringir el borrado
     *       si las FKs no tienen onDelete('cascade').
     */
    public function destroy(Request $request, $id)
    {
        $usuario = User::findOrFail($id);

        if ($usuario->id === $request->user()->id) {
            return response()->json([
                'message' => 'No puedes eliminar tu propia cuenta.',
            ], 403);
        }

        // Revocar tokens antes de eliminar.
        $usuario->tokens()->delete();

        try {
            $usuario->delete();
        } catch (\Illuminate\Database\QueryException $e) {
            // FK constraint violation — el usuario tiene citas asociadas.
            return response()->json([
                'message' => 'No se puede eliminar el usuario porque tiene citas en el historial. Suspéndelo en su lugar.',
            ], 422);
        }

        return response()->json([
            'mensaje' => 'Usuario eliminado permanentemente.',
        ]);
    }
}
