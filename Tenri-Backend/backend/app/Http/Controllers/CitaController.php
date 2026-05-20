<?php

namespace App\Http\Controllers;

use App\Models\Cita;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;
use App\Mail\CitaConfirmadaMail;
use App\Mail\CitaCanceladaMail;
// 👇 1. Importamos el Request inteligente
use App\Http\Requests\StoreCitaRequest;

class CitaController extends Controller
{   
    public function index(Request $request)
    {
        $citas = \App\Models\Cita::with(['cliente', 'barbero', 'servicio'])
            ->where('barberia_id', $request->user()->barberia_id)
            ->orderBy('fecha', 'desc')
            ->orderBy('hora', 'asc')
            ->paginate(10);
            
        return response()->json($citas);
    }
    
    // 👇 2. Cambiamos Request por StoreCitaRequest
    public function store(StoreCitaRequest $request)
    {
        // 🗑️ ¡Las validaciones se fueron al Form Request!

        $servicioNuevo = \App\Models\Servicio::findOrFail($request->servicio_id);

        // ========================================================================
        // 🛡️ ESCUDO ANTI-CHOQUES DE HORARIO (PREVENIR DOBLE RESERVA)
        // ========================================================================
        $horaInicioSolicitada = \Carbon\Carbon::parse($request->hora);
        $horaFinSolicitada = $horaInicioSolicitada->copy()->addMinutes($servicioNuevo->duracion ?? 30);

        $citasDelDia = \App\Models\Cita::with('servicio')
            ->where('barbero_id', $request->barbero_id)
            ->where('fecha', $request->fecha)
            ->where('estado', '!=', 'cancelada')
            ->get();

        foreach ($citasDelDia as $citaExistente) {
            $duracionExistente = $citaExistente->servicio->duracion ?? 30;
            $inicioExistente = \Carbon\Carbon::parse($citaExistente->hora);
            $finExistente = $inicioExistente->copy()->addMinutes($duracionExistente);

            if ($horaInicioSolicitada < $finExistente && $horaFinSolicitada > $inicioExistente) {
                return response()->json([
                    'message' => '¡Ups! Este horario acaba de ser reservado por otro cliente. Por favor, elige otro.'
                ], 409);
            }
        }
        // ========================================================================

        $cita = new \App\Models\Cita();
        $cita->cliente_id = $request->user()->id;
        $cita->barbero_id = $request->barbero_id;
        $cita->servicio_id = $request->servicio_id;
        $cita->fecha = $request->fecha;
        $cita->hora = $request->hora;
        $cita->estado = 'confirmada';
        
        // 👇 MAGIA SAAS
        $cita->barberia_id = $servicioNuevo->barberia_id; 
        
        $cita->save();

        $cita->load(['barbero', 'servicio', 'cliente']);

        \Illuminate\Support\Facades\Mail::to($request->user()->email)->send(new \App\Mail\CitaConfirmadaMail($cita));
        \Illuminate\Support\Facades\Mail::to($cita->barbero->email)->send(new \App\Mail\NuevaCitaBarberoMail($cita));

        return response()->json($cita, 201);
    }

    public function misReservas(Request $request)
    {
        $citas = \App\Models\Cita::with(['barbero', 'servicio'])
            ->where('cliente_id', $request->user()->id)
            ->orderBy('fecha', 'desc')
            ->orderBy('hora', 'desc')
            ->get();

        return response()->json($citas);
    }

    public function resumenFinancieroHoy(Request $request)
    {
        $hoy = now()->toDateString(); 

        $citasDeHoy = \App\Models\Cita::with(['servicio', 'barbero'])
            ->where('barberia_id', $request->user()->barberia_id)
            ->where('fecha', $hoy)
            ->where('estado', 'finalizada')
            ->get();

        $totalIngresos = 0;
        $desgloseBarberos = [];

        foreach ($citasDeHoy as $cita) {
            if ($cita->servicio && $cita->barbero) {
                $precioServicio = $cita->servicio->precio;
                $nombreBarbero = $cita->barbero->name;

                $totalIngresos += $precioServicio;

                if (!isset($desgloseBarberos[$nombreBarbero])) {
                    $desgloseBarberos[$nombreBarbero] = 0;
                }
                $desgloseBarberos[$nombreBarbero] += $precioServicio;
            }
        }

        return response()->json([
            'fecha' => $hoy,
            'cantidad_cortes' => $citasDeHoy->count(),
            'total_ingresos' => $totalIngresos,
            'desglose_barberos' => $desgloseBarberos
        ]);
    }

    public function updateEstado(Request $request, $id)
    {
        $request->validate([
            'estado' => 'required|in:pendiente,confirmada,finalizada,cancelada'
        ]);

        $cita = Cita::findOrFail($id);
        $cita->estado = $request->estado;
        $cita->save();

        return response()->json([
            'mensaje' => 'Estado actualizado con éxito', 
            'cita' => $cita
        ]);
    }

    public function citasBarbero(Request $request)
    {
        $citas = Cita::with(['servicio', 'cliente']) 
                     ->where('barbero_id', $request->user()->id) 
                     ->orderBy('fecha', 'desc') 
                     ->orderBy('hora', 'desc')  
                     ->paginate(10);
                     
        return response()->json($citas);
    }

    public function disponibilidad(Request $request, $id)
    {
        $fecha = $request->query('fecha');

        if (!$fecha) {
            return response()->json(['error' => 'Falta indicar la fecha'], 400);
        }

        $barbero = \App\Models\User::findOrFail($id);

        $citas = \App\Models\Cita::with('servicio')
            ->where('barbero_id', $id)
            ->where('fecha', $fecha)
            ->where('estado', '!=', 'cancelada')
            ->get();

        $horasOcupadas = [];

        foreach ($citas as $cita) {
            $duracion = $cita->servicio->duracion ?? 30; 
            
            $horaInicioCita = Carbon::parse($cita->hora);
            $horaFinCita = $horaInicioCita->copy()->addMinutes($duracion);

            $tiempoActual = $horaInicioCita->copy();
            
            while ($tiempoActual < $horaFinCita) {
                $horasOcupadas[] = $tiempoActual->format('H:i');
                $tiempoActual->addMinutes(30); 
            }
        }

        $hoy = \Illuminate\Support\Carbon::now('America/Santiago'); 

        if ($fecha === $hoy->toDateString()) {
            $horaInicioTurno = \Illuminate\Support\Carbon::parse($barbero->hora_inicio, 'America/Santiago');
            $horaFinTurno = \Illuminate\Support\Carbon::parse($barbero->hora_fin, 'America/Santiago');

            $horaLimite = $hoy->copy()->addMinutes(15);

            while ($horaInicioTurno < $horaFinTurno) {
                if ($horaInicioTurno->format('H:i') <= $horaLimite->format('H:i')) {
                    $horasOcupadas[] = $horaInicioTurno->format('H:i');
                }
                $horaInicioTurno->addMinutes(30);
            }
        }

        $horasOcupadas = array_values(array_unique($horasOcupadas));

        return response()->json([
            'ocupadas' => $horasOcupadas,
            'hora_inicio' => date('H:i', strtotime($barbero->hora_inicio)),
            'hora_fin' => date('H:i', strtotime($barbero->hora_fin))
        ]);
    }
    
    public function cancelarMiCita(Request $request, $id)
    {
        $cita = Cita::with('barberia')
                    ->where('id', $id)
                    ->where('cliente_id', $request->user()->id)
                    ->firstOrFail();

        if ($cita->estado === 'finalizada' || $cita->estado === 'cancelada') {
            return response()->json(['error' => 'Esta cita ya no se puede modificar.'], 400);
        }

        $fechaHoraCita = Carbon::parse($cita->fecha . ' ' . $cita->hora);
        $ahora = Carbon::now();

        $minutosRestantes = $ahora->diffInMinutes($fechaHoraCita, false); 
        
        $tiempoMinimoExigido = $cita->barberia->tiempo_cancelacion ?? 30;

        if ($minutosRestantes < $tiempoMinimoExigido) {
            
            $dias = floor($tiempoMinimoExigido / 1440);
            $horas = floor(($tiempoMinimoExigido % 1440) / 60);
            $mins = $tiempoMinimoExigido % 60;

            $textoPartes = [];
            if ($dias > 0) $textoPartes[] = $dias . ($dias == 1 ? ' día' : ' días');
            if ($horas > 0) $textoPartes[] = $horas . ($horas == 1 ? ' hora' : ' horas');
            if ($mins > 0) $textoPartes[] = $mins . ' minutos';

            $textoFinal = count($textoPartes) > 1 
                ? implode(', ', array_slice($textoPartes, 0, -1)) . ' y ' . end($textoPartes)
                : ($textoPartes[0] ?? '0 minutos');

            return response()->json([
                'error' => "No puedes cancelar. Esta barbería exige un aviso de al menos {$textoFinal} de anticipación."
            ], 403); 
        }

        $cita->estado = 'cancelada';
        $cita->save();

        $cita->load(['servicio']); 
        \Illuminate\Support\Facades\Mail::to($request->user()->email)->send(new \App\Mail\CitaCanceladaMail($cita));

        return response()->json(['mensaje' => 'Cita cancelada con éxito', 'cita' => $cita]);
    }

    public function calificar(Request $request, $id)
    {
        $request->validate([
            'calificacion' => 'required|integer|min:1|max:5',
            'comentario' => 'nullable|string|max:500'
        ]);

        $cita = \App\Models\Cita::findOrFail($id);

        if ($cita->cliente_id !== $request->user()->id) {
            return response()->json(['error' => 'No tienes permiso para calificar esta cita'], 403);
        }

        if ($cita->estado !== 'finalizada') {
            return response()->json(['error' => 'Solo puedes calificar servicios que ya finalizaron'], 400);
        }

        if ($cita->calificacion !== null) {
            return response()->json(['error' => 'Ya calificaste esta cita anteriormente'], 400);
        }

        $cita->calificacion = $request->calificacion;
        $cita->comentario = $request->comentario;
        $cita->save();

        return response()->json(['message' => '¡Gracias por tu valoración!', 'cita' => $cita], 200);
    }
}