<?php

namespace App\Http\Controllers;

use App\Models\BloqueoHorario;
use App\Models\Cita;
use App\Models\Servicio;
use App\Models\User;
use App\Mail\CitaCanceladaMail;
use App\Mail\CitaConfirmadaMail;
use App\Mail\NuevaCitaBarberoMail;
use App\Http\Requests\StoreCitaRequest;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;

class CitaController extends Controller
{
    /**
     * 🔍 FASE 4A: filtros y búsqueda en la agenda admin
     *
     * Query params soportados:
     *   ?desde=2026-05-01
     *   ?hasta=2026-05-31
     *   ?barbero_id=5
     *   ?estado=confirmada
     *   ?q=juan (busca en nombre del cliente)
     *   ?page=1
     */
    public function index(Request $request)
    {
        $query = Cita::with(['cliente', 'barbero', 'servicio'])
            ->where('barberia_id', $request->user()->barberia_id);

        if ($request->filled('desde')) {
            $query->whereDate('fecha', '>=', $request->desde);
        }
        if ($request->filled('hasta')) {
            $query->whereDate('fecha', '<=', $request->hasta);
        }
        if ($request->filled('barbero_id')) {
            $query->where('barbero_id', $request->barbero_id);
        }
        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }
        if ($request->filled('q')) {
            $q = $request->q;
            $query->whereHas('cliente', fn ($sub) =>
                $sub->where('name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%")
            );
        }

        $citas = $query->orderBy('fecha', 'desc')
            ->orderBy('hora', 'asc')
            ->paginate(10)
            ->withQueryString();

        return response()->json($citas);
    }

    public function store(StoreCitaRequest $request)
    {
        $servicioNuevo = Servicio::findOrFail($request->servicio_id);

        // 🚫 FASE 4A: verificar bloqueos del barbero en la fecha
        $tieneBloqueo = BloqueoHorario::where('barbero_id', $request->barbero_id)
            ->activoEnFecha($request->fecha)
            ->exists();

        if ($tieneBloqueo) {
            return response()->json([
                'message' => 'El barbero no está disponible en esa fecha. Por favor, elige otro día.',
            ], 409);
        }

        // 🛡️ Anti-choques
        $horaInicioSolicitada = Carbon::parse($request->hora);
        $horaFinSolicitada    = $horaInicioSolicitada->copy()->addMinutes($servicioNuevo->duracion);

        $citasDelDia = Cita::with('servicio')
            ->where('barbero_id', $request->barbero_id)
            ->where('fecha', $request->fecha)
            ->where('estado', '!=', 'cancelada')
            ->get();

        foreach ($citasDelDia as $citaExistente) {
            $duracionExistente = $citaExistente->servicio->duracion ?? 30;
            $inicioExistente   = Carbon::parse($citaExistente->hora);
            $finExistente      = $inicioExistente->copy()->addMinutes($duracionExistente);

            if ($horaInicioSolicitada < $finExistente && $horaFinSolicitada > $inicioExistente) {
                return response()->json([
                    'message' => '¡Ups! Este horario acaba de ser reservado por otro cliente.',
                ], 409);
            }
        }

        $cita = Cita::create([
            'cliente_id'  => $request->user()->id,
            'barbero_id'  => $request->barbero_id,
            'servicio_id' => $request->servicio_id,
            'fecha'       => $request->fecha,
            'hora'        => $request->hora,
            'estado'      => 'confirmada',
            'barberia_id' => $servicioNuevo->barberia_id,
        ]);

        $cita->load(['barbero', 'servicio', 'cliente']);

        try {
            Mail::to($request->user()->email)->send(new CitaConfirmadaMail($cita));
            Mail::to($cita->barbero->email)->send(new NuevaCitaBarberoMail($cita));
        } catch (\Throwable $e) {
            \Log::warning('Cita creada OK pero fallaron correos: ' . $e->getMessage());
        }

        return response()->json($cita, 201);
    }

    public function misReservas(Request $request)
    {
        $citas = Cita::with(['barbero', 'servicio.barberia'])
            ->where('cliente_id', $request->user()->id)
            ->orderBy('fecha', 'desc')
            ->orderBy('hora', 'desc')
            ->get();

        return response()->json($citas);
    }

    /**
     * 📊 FASE 4A: stats financieras por periodo (hoy, semana, mes, custom)
     */
    public function resumenFinancieroHoy(Request $request)
    {
        return $this->resumenPorPeriodo($request, 'hoy');
    }

    /**
     * 📊 FASE 4A: stats financieras por periodo
     *
     * Query params:
     *   ?periodo=hoy|semana|mes  (default: hoy)
     *   ?desde=YYYY-MM-DD & ?hasta=YYYY-MM-DD  (custom)
     */
    public function resumenPorPeriodo(Request $request, $periodoDefault = null)
    {
        $periodo = $request->query('periodo', $periodoDefault ?? 'hoy');

        // Calcular rango según el periodo
        if ($request->filled('desde') && $request->filled('hasta')) {
            $desde = Carbon::parse($request->desde)->startOfDay();
            $hasta = Carbon::parse($request->hasta)->endOfDay();
            $periodo = 'custom';
        } else {
            switch ($periodo) {
                case 'semana':
                    $desde = Carbon::now()->startOfWeek();
                    $hasta = Carbon::now()->endOfWeek();
                    break;
                case 'mes':
                    $desde = Carbon::now()->startOfMonth();
                    $hasta = Carbon::now()->endOfMonth();
                    break;
                case 'hoy':
                default:
                    $desde = Carbon::now()->startOfDay();
                    $hasta = Carbon::now()->endOfDay();
                    break;
            }
        }

        $citas = Cita::with(['servicio', 'barbero'])
            ->where('barberia_id', $request->user()->barberia_id)
            ->whereBetween('fecha', [$desde->toDateString(), $hasta->toDateString()])
            ->where('estado', 'finalizada')
            ->get();

        $totalIngresos    = 0;
        $desgloseBarberos = [];
        $desglosePorDia   = []; // para graficar

        foreach ($citas as $cita) {
            if ($cita->servicio && $cita->barbero) {
                $precio = (int) $cita->servicio->precio;
                $totalIngresos += $precio;

                $nombre = $cita->barbero->name;
                $desgloseBarberos[$nombre] = ($desgloseBarberos[$nombre] ?? 0) + $precio;

                $dia = $cita->fecha;
                $desglosePorDia[$dia] = ($desglosePorDia[$dia] ?? 0) + $precio;
            }
        }

        ksort($desglosePorDia);

        return response()->json([
            'periodo'           => $periodo,
            'desde'             => $desde->toDateString(),
            'hasta'             => $hasta->toDateString(),
            'cantidad_cortes'   => $citas->count(),
            'total_ingresos'    => $totalIngresos,
            'desglose_barberos' => $desgloseBarberos,
            'desglose_por_dia'  => $desglosePorDia,
            // Backward-compatible aliases
            'fecha'             => $desde->toDateString(),
        ]);
    }

    /**
     * 🔄 FASE 4A: reagendar cita (cambiar fecha y/o hora sin cancelar)
     */
    public function reagendar(Request $request, $id)
    {
        $request->validate([
            'fecha' => 'required|date|after_or_equal:today',
            'hora'  => 'required|date_format:H:i',
        ]);

        $user = $request->user();
        $cita = Cita::with('servicio')->findOrFail($id);

        // 🔒 Validación de propiedad según rol
        if ($user->rol === 'cliente' && $cita->cliente_id !== $user->id) {
            return response()->json(['error' => 'No puedes reagendar esta cita.'], 403);
        }
        if ($user->rol === 'admin' && $cita->barberia_id !== $user->barberia_id) {
            return response()->json(['error' => 'No tienes permiso sobre esta cita.'], 403);
        }
        if ($user->rol === 'barbero' && $cita->barbero_id !== $user->id) {
            return response()->json(['error' => 'Esta cita no te pertenece.'], 403);
        }

        if (in_array($cita->estado, ['finalizada', 'cancelada'])) {
            return response()->json(['error' => 'Esta cita ya no se puede modificar.'], 400);
        }

        // Verificar bloqueos en la nueva fecha
        $tieneBloqueo = BloqueoHorario::where('barbero_id', $cita->barbero_id)
            ->activoEnFecha($request->fecha)
            ->exists();

        if ($tieneBloqueo) {
            return response()->json([
                'error' => 'El barbero no está disponible en esa fecha. Elige otra.',
            ], 409);
        }

        // Verificar choque con OTRAS citas (excluyendo ésta misma)
        $nuevoInicio = Carbon::parse($request->hora);
        $nuevoFin    = $nuevoInicio->copy()->addMinutes($cita->servicio->duracion ?? 30);

        $otrasCitas = Cita::with('servicio')
            ->where('barbero_id', $cita->barbero_id)
            ->where('fecha', $request->fecha)
            ->where('estado', '!=', 'cancelada')
            ->where('id', '!=', $cita->id)
            ->get();

        foreach ($otrasCitas as $otra) {
            $dur    = $otra->servicio->duracion ?? 30;
            $inicio = Carbon::parse($otra->hora);
            $fin    = $inicio->copy()->addMinutes($dur);

            if ($nuevoInicio < $fin && $nuevoFin > $inicio) {
                return response()->json([
                    'error' => 'Ese horario ya está reservado para otra cita.',
                ], 409);
            }
        }

        $cita->fecha = $request->fecha;
        $cita->hora  = $request->hora;
        $cita->save();

        $cita->load(['cliente', 'barbero', 'servicio']);

        return response()->json([
            'message' => 'Cita reagendada con éxito',
            'cita'    => $cita,
        ]);
    }

    public function updateEstado(Request $request, $id)
    {
        $request->validate([
            'estado' => 'required|in:pendiente,confirmada,finalizada,cancelada',
        ]);

        $user = $request->user();
        $cita = Cita::findOrFail($id);

        if ($user->rol === 'admin' && $cita->barberia_id !== $user->barberia_id) {
            return response()->json(['error' => 'No tienes permiso sobre esta cita.'], 403);
        }
        if ($user->rol === 'barbero' && $cita->barbero_id !== $user->id) {
            return response()->json(['error' => 'Esta cita no te pertenece.'], 403);
        }

        $cita->estado = $request->estado;
        $cita->save();

        return response()->json([
            'mensaje' => 'Estado actualizado con éxito',
            'cita'    => $cita,
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

    /**
     * 🚫 FASE 4A: ahora también devuelve los días bloqueados del barbero.
     */
    public function disponibilidad(Request $request, $id)
    {
        $fecha = $request->query('fecha');
        if (!$fecha) {
            return response()->json(['error' => 'Falta indicar la fecha'], 400);
        }

        $barbero = User::findOrFail($id);

        // ¿La fecha está bloqueada por vacaciones/día libre?
        $bloqueo = BloqueoHorario::where('barbero_id', $id)
            ->activoEnFecha($fecha)
            ->first();

        if ($bloqueo) {
            return response()->json([
                'bloqueado'   => true,
                'motivo'      => $bloqueo->motivo,
                'descripcion' => $bloqueo->descripcion,
                'ocupadas'    => [],
                'pasadas'     => [],
                'hora_inicio' => date('H:i', strtotime($barbero->hora_inicio ?? '10:00')),
                'hora_fin'    => date('H:i', strtotime($barbero->hora_fin    ?? '19:00')),
            ]);
        }

        // Cálculo normal
        $citas = Cita::with('servicio')
            ->where('barbero_id', $id)
            ->where('fecha', $fecha)
            ->where('estado', '!=', 'cancelada')
            ->get();

        $ocupadas = [];
        foreach ($citas as $cita) {
            $duracion     = $cita->servicio->duracion ?? 30;
            $horaInicio   = Carbon::parse($cita->hora);
            $horaFin      = $horaInicio->copy()->addMinutes($duracion);
            $tiempoActual = $horaInicio->copy();

            while ($tiempoActual < $horaFin) {
                $ocupadas[] = $tiempoActual->format('H:i');
                $tiempoActual->addMinutes(30);
            }
        }

        $pasadas = [];
        $hoy = Carbon::now('America/Santiago');

        if ($fecha === $hoy->toDateString()) {
            $horaInicioTurno = Carbon::parse($barbero->hora_inicio ?? '10:00', 'America/Santiago');
            $horaFinTurno    = Carbon::parse($barbero->hora_fin    ?? '19:00', 'America/Santiago');
            $horaLimite      = $hoy->copy()->addMinutes(15);

            while ($horaInicioTurno < $horaFinTurno) {
                if ($horaInicioTurno <= $horaLimite) {
                    $pasadas[] = $horaInicioTurno->format('H:i');
                }
                $horaInicioTurno->addMinutes(30);
            }
        }

        return response()->json([
            'bloqueado'   => false,
            'ocupadas'    => array_values(array_unique($ocupadas)),
            'pasadas'     => array_values(array_unique($pasadas)),
            'hora_inicio' => date('H:i', strtotime($barbero->hora_inicio ?? '10:00')),
            'hora_fin'    => date('H:i', strtotime($barbero->hora_fin    ?? '19:00')),
        ]);
    }

    public function cancelarMiCita(Request $request, $id)
    {
        $cita = Cita::with('barberia')
            ->where('id', $id)
            ->where('cliente_id', $request->user()->id)
            ->firstOrFail();

        if (in_array($cita->estado, ['finalizada', 'cancelada'])) {
            return response()->json(['error' => 'Esta cita ya no se puede modificar.'], 400);
        }

        $fechaHoraCita    = Carbon::parse($cita->fecha . ' ' . $cita->hora);
        $minutosRestantes = Carbon::now()->diffInMinutes($fechaHoraCita, false);
        $tiempoMinimo     = $cita->barberia->tiempo_cancelacion ?? 30;

        if ($minutosRestantes < $tiempoMinimo) {
            $textoFinal = $this->formatearTiempo($tiempoMinimo);
            return response()->json([
                'error' => "No puedes cancelar. Esta barbería exige un aviso de al menos {$textoFinal} de anticipación.",
            ], 403);
        }

        $cita->estado = 'cancelada';
        $cita->save();
        $cita->load('servicio');

        try {
            Mail::to($request->user()->email)->send(new CitaCanceladaMail($cita));
        } catch (\Throwable $e) {
            \Log::warning('Cita cancelada OK pero falló correo: ' . $e->getMessage());
        }

        return response()->json(['mensaje' => 'Cita cancelada con éxito', 'cita' => $cita]);
    }

    /**
     * ⭐ FASE 4A: calificar Y actualizar el promedio cacheado del barbero.
     */
    public function calificar(Request $request, $id)
    {
        $request->validate([
            'calificacion' => 'required|integer|min:1|max:5',
            'comentario'   => 'nullable|string|max:500',
        ]);

        $cita = Cita::findOrFail($id);

        if ($cita->cliente_id !== $request->user()->id) {
            return response()->json(['error' => 'No tienes permiso para calificar esta cita.'], 403);
        }
        if ($cita->estado !== 'finalizada') {
            return response()->json(['error' => 'Solo puedes calificar servicios finalizados.'], 400);
        }
        if ($cita->calificacion !== null) {
            return response()->json(['error' => 'Ya calificaste esta cita.'], 400);
        }

        DB::transaction(function () use ($cita, $request) {
            $cita->calificacion = $request->calificacion;
            $cita->comentario   = $request->comentario;
            $cita->save();

            // Recalcular promedio del barbero
            $stats = Cita::where('barbero_id', $cita->barbero_id)
                ->whereNotNull('calificacion')
                ->selectRaw('AVG(calificacion) as promedio, COUNT(*) as total')
                ->first();

            User::where('id', $cita->barbero_id)->update([
                'promedio_calificacion' => round($stats->promedio, 2),
                'total_resenas'         => $stats->total,
            ]);
        });

        return response()->json(['message' => '¡Gracias por tu valoración!', 'cita' => $cita], 200);
    }

    private function formatearTiempo(int $minutosTotal): string
    {
        $dias  = (int) floor($minutosTotal / 1440);
        $horas = (int) floor(($minutosTotal % 1440) / 60);
        $mins  = $minutosTotal % 60;

        $partes = [];
        if ($dias > 0)  $partes[] = $dias  . ($dias === 1  ? ' día'  : ' días');
        if ($horas > 0) $partes[] = $horas . ($horas === 1 ? ' hora' : ' horas');
        if ($mins > 0)  $partes[] = $mins  . ' minutos';

        if (empty($partes)) return '0 minutos';
        if (count($partes) === 1) return $partes[0];

        $ultimo = array_pop($partes);
        return implode(', ', $partes) . ' y ' . $ultimo;
    }
}
