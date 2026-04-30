<?php

namespace App\Http\Controllers;

use App\Models\Cita;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\CitaConfirmadaMail;

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
        // 1. Validamos que nos envíen todos los datos básicos
        $request->validate([
            'servicio_id' => 'required',
            'barbero_id' => 'required',
            'fecha' => 'required|date',
            'hora' => 'required'
        ]);

        // 2. EL GUARDIA DE SEGURIDAD: Buscamos si ya existe una cita en esa fecha, hora y con ese barbero
        $citaExistente = Cita::where('barbero_id', $request->barbero_id)
                             ->where('fecha', $request->fecha)
                             ->where('hora', $request->hora)
                             ->where('estado', '!=', 'cancelada') // Ignoramos si la cita anterior fue cancelada
                             ->first();

        if ($citaExistente) {
            // Si ya existe, le devolvemos un error 422 (Unprocessable Entity) a React
            return response()->json([
                'message' => '¡Ese horario ya está reservado con este especialista! Por favor elige otro.'
            ], 422);
        }

        // 3. Si pasó el guardia, guardamos la cita normalmente
        $cita = Cita::create([
            'cliente_id' => $request->user()->id, 
            'barbero_id' => $request->barbero_id,
            'servicio_id' => $request->servicio_id,
            'fecha' => $request->fecha,
            'hora' => $request->hora,
            'estado' => 'pendiente'
        ]);

        $cita->load(['cliente', 'barbero', 'servicio']);
        Mail::to($request->user()->email)->send(new CitaConfirmadaMail($cita));

        return response()->json(['mensaje' => 'Cita guardada con éxito', 'cita' => $cita]);
    }

    public function misCitas(Request $request)
    {
        // Usamos el token ($request->user()) para saber quién pregunta
        // y filtramos las citas donde él sea el 'cliente_id'
        $citas = Cita::with(['servicio', 'barbero'])
                     ->where('cliente_id', $request->user()->id)
                     ->orderBy('fecha', 'desc')
                     ->get();
                     
        return response()->json($citas);
    }
    // Función para que el Admin cambie el estado de la cita
    public function updateEstado(Request $request, $id)
    {
        // Ampliamos el filtro para aceptar todos los estados operativos del sistema
        $request->validate([
            'estado' => 'required|in:pendiente,confirmada,finalizada,cancelada'
        ]);

        // Buscamos la cita por su ID
        $cita = Cita::findOrFail($id);
        
        // Actualizamos y guardamos
        $cita->estado = $request->estado;
        $cita->save();

        return response()->json([
            'mensaje' => 'Estado actualizado con éxito', 
            'cita' => $cita
        ]);
    }

    // Función para que el Barbero vea únicamente las citas que tiene asignadas
    public function citasBarbero(Request $request)
    {
        // 1. Buscamos en el modelo Cita
        $citas = Cita::with(['servicio', 'cliente']) // 2. Traemos los nombres reales del cliente y servicio
                     ->where('barbero_id', $request->user()->id) // 3. FILTRO VITAL: Solo donde el barbero sea el usuario actual
                     ->orderBy('fecha', 'asc') // 4. Ordenamos por fecha ascendente (lo más pronto arriba)
                     ->orderBy('hora', 'asc')  // 5. Y luego por hora
                     ->get();
                     
        // 6. Devolvemos la lista en formato JSON al frontend
        return response()->json($citas);
    }

    public function resumenFinancieroHoy(Request $request)
    {
        // 1. Obtener la fecha de hoy
        $hoy = now()->toDateString(); // Ej: '2026-04-29'

        // 2. Buscar citas finalizadas de hoy, trayendo la información del servicio (para el precio) y del barbero
        $citasDeHoy = Cita::with(['servicio', 'barbero'])
            ->where('fecha', $hoy)
            ->where('estado', 'finalizada')
            ->get();

        // 3. Calcular el total general
        $totalIngresos = 0;
        foreach ($citasDeHoy as $cita) {
            // Asegurarnos de que la cita tenga un servicio asociado antes de sumar
            if ($cita->servicio) {
                $totalIngresos += $cita->servicio->precio;
            }
        }

        // 4. Calcular el desglose por barbero
        // Estructura: [ "Nombre del Barbero" => Total generado ]
        $desgloseBarberos = [];
        foreach ($citasDeHoy as $cita) {
            if ($cita->servicio && $cita->barbero) {
                $nombreBarbero = $cita->barbero->name;
                $precioServicio = $cita->servicio->precio;

                if (!isset($desgloseBarberos[$nombreBarbero])) {
                    $desgloseBarberos[$nombreBarbero] = 0;
                }
                $desgloseBarberos[$nombreBarbero] += $precioServicio;
            }
        }

        // 5. Enviar la respuesta a React
        return response()->json([
            'fecha' => $hoy,
            'cantidad_cortes' => $citasDeHoy->count(),
            'total_ingresos' => $totalIngresos,
            'desglose_barberos' => $desgloseBarberos
        ]);
    }
}