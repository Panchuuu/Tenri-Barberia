<?php

namespace App\Http\Controllers;

use App\Models\Cita;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;
use App\Mail\CitaConfirmadaMail;
use App\Mail\CitaCanceladaMail;

class CitaController extends Controller
{   
    public function index(Request $request)
    {
        // El Admin solo ve las citas de SU barbería
        $citas = \App\Models\Cita::with(['cliente', 'barbero', 'servicio'])
            ->where('barberia_id', $request->user()->barberia_id)
            ->orderBy('fecha', 'desc')
            ->orderBy('hora', 'asc')
            ->get();
            
        return response()->json($citas);
    }
    
    public function store(Request $request)
    {
        $request->validate([
            'servicio_id' => 'required|exists:servicios,id',
            'barbero_id' => 'required|exists:users,id',
            'fecha' => 'required|date',
            'hora' => 'required'
        ]);

        // Buscamos el servicio para saber a qué barbería pertenece
        $servicio = \App\Models\Servicio::findOrFail($request->servicio_id);

        $cita = new \App\Models\Cita();
        $cita->cliente_id = $request->user()->id;
        $cita->barbero_id = $request->barbero_id;
        $cita->servicio_id = $request->servicio_id;
        $cita->fecha = $request->fecha;
        $cita->hora = $request->hora;
        $cita->estado = 'confirmada';
        
        // 👇 MAGIA SAAS: Guardamos el ID de la barbería
        $cita->barberia_id = $servicio->barberia_id; 
        
        $cita->save();

 
        $cita->load(['barbero', 'servicio', 'cliente']);

        \Illuminate\Support\Facades\Mail::to($request->user()->email)->send(new \App\Mail\CitaConfirmadaMail($cita));

        \Illuminate\Support\Facades\Mail::to($cita->barbero->email)->send(new \App\Mail\NuevaCitaBarberoMail($cita));

        return response()->json($cita, 201);
    }

    // 👤 MIS RESERVAS (CLIENTE): Trae el historial de citas del usuario actual
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

        // Solo calcula el dinero de SU barbería
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

    public function disponibilidad(Request $request, $id)
    {
        $fecha = $request->query('fecha');

        if (!$fecha) {
            return response()->json(['error' => 'Falta indicar la fecha'], 400);
        }

        // 1. Buscamos los datos del barbero
        $barbero = \App\Models\User::findOrFail($id);

        // 2. Traemos TODAS las citas del día INCLUYENDO la información de su servicio
        $citas = \App\Models\Cita::with('servicio')
            ->where('barbero_id', $id)
            ->where('fecha', $fecha)
            ->where('estado', '!=', 'cancelada')
            ->get();

        $horasOcupadas = [];

        // 3. LA MAGIA DE LA DURACIÓN: Calculamos los bloques reales que ocupa cada cita
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

        // 👇 NUEVO: ELIMINAR HORAS QUE YA PASARON SI EL DÍA ES HOY 👇
        $hoy = \Illuminate\Support\Carbon::now('America/Santiago'); 

        if ($fecha === $hoy->toDateString()) {
            $horaInicioTurno = \Illuminate\Support\Carbon::parse($barbero->hora_inicio, 'America/Santiago');
            $horaFinTurno = \Illuminate\Support\Carbon::parse($barbero->hora_fin, 'America/Santiago');

            // Margen de 15 min para no agendar algo que empieza "ya"
            $horaLimite = $hoy->copy()->addMinutes(15);

            while ($horaInicioTurno < $horaFinTurno) {
                // Debug: Comparamos formatos H:i
                if ($horaInicioTurno->format('H:i') <= $horaLimite->format('H:i')) {
                    $horasOcupadas[] = $horaInicioTurno->format('H:i');
                }
                $horaInicioTurno->addMinutes(30);
            }
        }

        // 4. Limpiamos posibles horas duplicadas y reindexamos el arreglo
        $horasOcupadas = array_values(array_unique($horasOcupadas));

        // 5. Empaquetamos todo y se lo mandamos a React
        return response()->json([
            'ocupadas' => $horasOcupadas,
            'hora_inicio' => date('H:i', strtotime($barbero->hora_inicio)),
            'hora_fin' => date('H:i', strtotime($barbero->hora_fin))
        ]);
    }
    
    // Función exclusiva para que el CLIENTE cancele su propia cita
    public function cancelarMiCita(Request $request, $id)
    {
        // 1. Buscamos la cita asegurándonos de que PERTENEZCA al usuario
        // Y cargamos la barbería para saber sus reglas de cancelación
        $cita = Cita::with('barberia')
                    ->where('id', $id)
                    ->where('cliente_id', $request->user()->id)
                    ->firstOrFail();

        // 2. Verificamos que no esté ya finalizada o cancelada
        if ($cita->estado === 'finalizada' || $cita->estado === 'cancelada') {
            return response()->json(['error' => 'Esta cita ya no se puede modificar.'], 400);
        }

        // 3. ⏱️ EL ESCUDO DINÁMICO DE CANCELACIÓN
        $fechaHoraCita = Carbon::parse($cita->fecha . ' ' . $cita->hora);
        $ahora = Carbon::now();

        // Calculamos cuántos minutos faltan para la cita
        $minutosRestantes = $ahora->diffInMinutes($fechaHoraCita, false); 
        
        // Obtenemos la regla de la barbería (si por algún error no tiene, usamos 30 por defecto)
        $tiempoMinimoExigido = $cita->barberia->tiempo_cancelacion ?? 30;

        if ($minutosRestantes < $tiempoMinimoExigido) {
            
            // MAGIA DE FORMATO: Convertimos los minutos en un texto legible y profesional
            $dias = floor($tiempoMinimoExigido / 1440);
            $horas = floor(($tiempoMinimoExigido % 1440) / 60);
            $mins = $tiempoMinimoExigido % 60;

            $textoPartes = [];
            if ($dias > 0) $textoPartes[] = $dias . ($dias == 1 ? ' día' : ' días');
            if ($horas > 0) $textoPartes[] = $horas . ($horas == 1 ? ' hora' : ' horas');
            if ($mins > 0) $textoPartes[] = $mins . ' minutos';

            // Unimos el array (Ej: "1 día y 2 horas" o "2 horas y 30 minutos")
            $textoFinal = count($textoPartes) > 1 
                ? implode(', ', array_slice($textoPartes, 0, -1)) . ' y ' . end($textoPartes)
                : ($textoPartes[0] ?? '0 minutos');

            return response()->json([
                'error' => "No puedes cancelar. Esta barbería exige un aviso de al menos {$textoFinal} de anticipación."
            ], 403); 
        }

        // 4. Si pasó el escudo de tiempo, cambiamos el estado
        $cita->estado = 'cancelada';
        $cita->save();

        // 5. 💌 Disparamos el correo de cancelación al cliente
        $cita->load(['servicio']); 
        \Illuminate\Support\Facades\Mail::to($request->user()->email)->send(new \App\Mail\CitaCanceladaMail($cita));

        return response()->json(['mensaje' => 'Cita cancelada con éxito', 'cita' => $cita]);
    }

    public function calificar(Request $request, $id)
    {
        // Validamos que envíen las estrellas (1-5)
        $request->validate([
            'calificacion' => 'required|integer|min:1|max:5',
            'comentario' => 'nullable|string|max:500'
        ]);

        $cita = \App\Models\Cita::findOrFail($id);

        // 1. Seguridad: Solo el dueño de la cita puede calificarla
        if ($cita->cliente_id !== $request->user()->id) {
            return response()->json(['error' => 'No tienes permiso para calificar esta cita'], 403);
        }

        // 2. Lógica de negocio: Solo se califican citas finalizadas
        if ($cita->estado !== 'finalizada') {
            return response()->json(['error' => 'Solo puedes calificar servicios que ya finalizaron'], 400);
        }

        // 3. Evitar reseñas duplicadas
        if ($cita->calificacion !== null) {
            return response()->json(['error' => 'Ya calificaste esta cita anteriormente'], 400);
        }

        // Guardamos la reseña
        $cita->calificacion = $request->calificacion;
        $cita->comentario = $request->comentario;
        $cita->save();

        return response()->json(['message' => '¡Gracias por tu valoración!', 'cita' => $cita], 200);
    }
}