<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBarberiaRequest;
use App\Http\Requests\UpdateConfigBarberiaRequest;
use App\Models\Barberia;
use App\Models\Servicio;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class BarberiaController extends Controller
{
    public function index()
    {
        return response()->json(Barberia::paginate(10));
    }

    public function store(StoreBarberiaRequest $request)
    {
        $rutaLogo = null;
        if ($request->hasFile('logo')) {
            $rutaLogo = $request->file('logo')->store('logos_barberias', 'public');
        }

        $slug = Str::slug($request->nombre_barberia);

        $barberia = Barberia::create([
            'nombre'          => $request->nombre_barberia,
            'slug'            => $slug,
            'color_principal' => $request->color_principal,
            'logo'            => $rutaLogo,
        ]);

        User::create([
            'name'        => $request->admin_nombre,
            'email'       => $request->admin_email,
            'password'    => Hash::make($request->admin_password),
            'rol'         => 'admin',
            'barberia_id' => $barberia->id,
        ]);

        return response()->json([
            'mensaje'  => 'Barbería y administrador creados con éxito',
            'barberia' => $barberia,
        ], 201);
    }

    public function miBarberia(Request $request)
    {
        $barberia = Barberia::findOrFail($request->user()->barberia_id);
        return response()->json($barberia);
    }

    /**
     * Actualiza configuración de la barbería del admin autenticado.
     *
     * 🎯 Pack 2/C: validación migrada a UpdateConfigBarberiaRequest.
     *    Antes: validate() inline con max:43200 (sin mensajes ES).
     *    Ahora: el FormRequest valida tiempo_cancelacion 0-43200 minutos
     *           (30 días) + 4 mensajes en español (required/integer/min/max).
     *
     * 🔧 FIX #4 (PDF): "no se limita el tiempo máximo que se puede
     *    cancelar con anticipación y además da error." Ahora el límite
     *    superior está enforced y el mensaje de error es claro.
     */
    public function updateConfig(UpdateConfigBarberiaRequest $request)
    {
        $barberia = Barberia::findOrFail($request->user()->barberia_id);
        $barberia->tiempo_cancelacion = $request->tiempo_cancelacion;
        $barberia->save();

        return response()->json([
            'mensaje'  => 'Configuración actualizada correctamente',
            'barberia' => $barberia,
        ]);
    }

    /**
     * 🔧 FIX FASE 1:
     * Endpoint para que el Admin obtenga SU equipo sin tener que
     * mandar el slug hardcodeado ("tenri-barber") como hacía el
     * frontend. Filtra automáticamente por la barbería del admin
     * autenticado.
     */
    public function miEquipo(Request $request)
    {
        $barberos = User::where('rol', 'barbero')
            ->where('barberia_id', $request->user()->barberia_id)
            ->get();

        return response()->json($barberos);
    }

    /**
     * 🔧 FIX FASE 1:
     * Lo mismo para el catálogo de servicios del admin.
     */
    public function misServicios(Request $request)
    {
        $servicios = Servicio::where('barberia_id', $request->user()->barberia_id)
            ->orderBy('nombre')
            ->get();

        return response()->json($servicios);
    }
}
