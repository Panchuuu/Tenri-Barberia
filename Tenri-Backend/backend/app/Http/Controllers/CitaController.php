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

        // Enviamos el correo (lo dejamos intacto)
        $cita->load(['barbero', 'servicio', 'cliente']);
        \Illuminate\Support\Facades\Mail::to($request->user()->email)->send(new \App\Mail\CitaConfirmadaMail($cita));

        return response()->json($cita, 201);
    }

    // 👤 MIS RESERVAS (CLIENTE): Trae el historial de citas del usuario actual
    public function misReservas(Request $request) {
        // Obtenemos al usuario que está logueado
        $usuario = $request->user();

        // Buscamos todas sus citas, trayendo toda la información conectada
        $citas = \App\Models\Cita::where('cliente_id', $usuario->id)
            ->with(['servicio', 'barbero', 'servicio.barberia']) // Traemos las relaciones
            ->orderBy('fecha', 'desc') // Las más recientes primero
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

        // 1. Buscamos los datos del barbero seleccionado para saber su turno
        $barbero = \App\Models\User::findOrFail($id);

        // 2. Buscamos solo las horas que YA ESTÁN OCUPADAS para él en esa fecha
        $horasOcupadas = \App\Models\Cita::where('barbero_id', $id)
            ->where('fecha', $fecha)
            ->where('estado', '!=', 'cancelada')
            ->pluck('hora')
            ->map(function ($hora) {
                // Formateamos para quitarle los segundos y que quede "10:00"
                return date('H:i', strtotime($hora));
            })
            ->toArray();

        // 3. Empaquetamos todo y se lo mandamos a React
        return response()->json([
            'ocupadas' => $horasOcupadas,
            // Extraemos solo la hora y minuto de su turno (ej. "10:00")
            'hora_inicio' => date('H:i', strtotime($barbero->hora_inicio)),
            'hora_fin' => date('H:i', strtotime($barbero->hora_fin))
        ]);
    }
    
    // Función exclusiva para que el CLIENTE cancele su propia cita
    public function cancelarMiCita(Request $request, $id)
    {
        // 1. Buscamos la cita asegurándonos de que PERTENEZCA al usuario
        $cita = Cita::where('id', $id)
                    ->where('cliente_id', $request->user()->id)
                    ->firstOrFail();

        // 2. Verificamos que no esté ya finalizada o cancelada
        if ($cita->estado === 'finalizada' || $cita->estado === 'cancelada') {
            return response()->json(['error' => 'Esta cita ya no se puede modificar.'], 400);
        }

        // 3. ⏱️ EL ESCUDO DE LOS 30 MINUTOS
        // Unimos la fecha y la hora de la cita en un solo objeto de tiempo
        $fechaHoraCita = Carbon::parse($cita->fecha . ' ' . $cita->hora);
        $ahora = Carbon::now();

        // Calculamos cuántos minutos faltan para la cita
        $minutosRestantes = $ahora->diffInMinutes($fechaHoraCita, false); 
        // (El 'false' sirve para que, si ya pasó la hora de la cita, nos dé un número negativo)

        if ($minutosRestantes < 30) {
            return response()->json([
                'error' => 'No puedes cancelar. Faltan menos de 30 minutos para tu reserva.'
            ], 403); // 403 = Prohibido
        }

        // 4. Si pasó el escudo de tiempo, cambiamos el estado
        $cita->estado = 'cancelada';
        $cita->save();

        // 5. 💌 Disparamos el correo de cancelación al cliente
        $cita->load(['servicio']); 
        \Illuminate\Support\Facades\Mail::to($request->user()->email)->send(new CitaCanceladaMail($cita));

        return response()->json(['mensaje' => 'Cita cancelada con éxito', 'cita' => $cita]);
    }
}