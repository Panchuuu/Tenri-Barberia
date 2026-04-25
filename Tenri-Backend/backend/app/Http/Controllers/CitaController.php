<?php

namespace App\Http\Controllers;

use App\Models\Cita;
use Illuminate\Http\Request;

class CitaController extends Controller
{   
    public function index()
    {
        // Traemos todas las citas, pero "cargando" (with) los datos del servicio, barbero y cliente
        $citas = Cita::with(['servicio', 'barbero', 'cliente'])
                     ->orderBy('fecha', 'desc') // Ordenamos por fecha
                     ->get();
                     
        return response()->json($citas);
    }
    
    public function store(Request $request)
    {   
        $request->validate([
            'servicio_id' => 'required',
            'barbero_id' => 'required',
            'fecha' => 'required|date',
            'hora' => 'required'
        ]);

        $cita = Cita::create([
            'cliente_id' => $request->user()->id, 
            'barbero_id' => $request->barbero_id,
            'servicio_id' => $request->servicio_id,
            'fecha' => $request->fecha,
            'hora' => $request->hora,
            'estado' => 'pendiente'
        ]);

        return response()->json(['mensaje' => 'Cita guardada con éxito', 'cita' => $cita]);
    }
}