import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
// 👇 Importamos nuestro portero inteligente
import apiFetch from "../utils/api";

export default function BookingModal({ servicio, barberiaSlug, onClose }) {
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [barberoId, setBarberoId] = useState("");
  const [barberos, setBarberos] = useState([]);

  // Malla de horarios que se generan dinámicamente
  const [horariosBase, setHorariosBase] = useState([]);

  // Horas ocupadas por otros clientes
  const [horasOcupadas, setHorasOcupadas] = useState([]);
  const [cargandoHoras, setCargandoHoras] = useState(false);
  const [cargandoReserva, setCargandoReserva] = useState(false);

  // ==========================================
  // 1. CÁLCULO DE FECHA MÍNIMA (LOCAL CHILE)
  // ==========================================
  // Usamos el locale 'sv-SE' que devuelve YYYY-MM-DD exacto según la hora de tu PC
  const hoyLocal = new Date().toLocaleDateString("sv-SE");

  useEffect(() => {
    const obtenerBarberos = async () => {
      try {
        // 👇 Uso de apiFetch: URL limpia y sin headers
        const respuesta = await apiFetch(`/barberos?barberia=${barberiaSlug}`);
        if (respuesta.ok) setBarberos(await respuesta.json());
      } catch (error) {
        console.error(error);
      }
    };
    obtenerBarberos();
  }, [barberiaSlug]);

  // ==========================================
  // 2. MOTOR DE DISPONIBILIDAD INTELIGENTE
  // ==========================================
  useEffect(() => {
    const obtenerHorasOcupadas = async () => {
      if (!barberoId || !fecha) {
        setHorasOcupadas([]);
        setHorariosBase([]);
        return;
      }

      setCargandoHoras(true);
      setHora("");

      try {
        // 👇 Uso de apiFetch: URL limpia
        const res = await apiFetch(`/barberos/${barberoId}/disponibilidad?fecha=${fecha}`);

        if (res.ok) {
          const datos = await res.json();

          // Guardamos las horas ocupadas que vienen de la DB
          setHorasOcupadas(datos.ocupadas);

          // 👇👇 NUEVA LÓGICA DE MALLA DINÁMICA 👇👇

          // 1. Separamos las horas y los minutos que vienen del backend
          const [horaI, minI] = datos.hora_inicio.split(":").map(Number);
          const [horaF, minF] = datos.hora_fin.split(":").map(Number);

          // 2. Convertimos todo a "minutos transcurridos desde las 00:00"
          // Esto hace que la matemática de tiempos sea sumamente fácil
          let minutosActuales = horaI * 60 + minI;
          const minutosFin = horaF * 60 + minF;

          const mallaDinamica = [];

          // 3. Mientras no lleguemos a la hora de salida del barbero...
          while (minutosActuales < minutosFin) {
            // 4. BLOQUEO DE COLACIÓN (14:00 a 14:59)
            // 14 * 60 = 840 minutos | 15 * 60 = 900 minutos
            if (minutosActuales >= 840 && minutosActuales < 900) {
              minutosActuales += 30; // Avanzamos 30 mins y saltamos este ciclo
              continue;
            }

            // 5. Convertimos los minutos de vuelta a formato bonito de reloj (HH:mm)
            const h = Math.floor(minutosActuales / 60)
              .toString()
              .padStart(2, "0");
            const m = (minutosActuales % 60).toString().padStart(2, "0");

            // Agregamos la hora generada a nuestra malla
            mallaDinamica.push(`${h}:${m}`);

            // 6. Avanzamos el reloj. (Nuestra barbería opera con bloques base de 30 mins)
            minutosActuales += 30;
          }

          setHorariosBase(mallaDinamica);
        }
      } catch (error) {
        console.error("Error al buscar horas:", error);
      } finally {
        setCargandoHoras(false);
      }
    };

    obtenerHorasOcupadas();
  }, [barberoId, fecha]);

  const handleReservar = async (e) => {
    e.preventDefault();
    
    // Mantenemos esta validación local para no disparar peticiones al backend si no hay token
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Inicia sesión para agendar.");
    if (!fecha || !hora || !barberoId)
      return toast.error("Completa todos los campos.");

    setCargandoReserva(true);
    try {
      // 👇 Uso de apiFetch: No necesitamos mandar los headers ni el token manualmente, apiFetch lo hace por nosotros
      const respuesta = await apiFetch("/citas", {
        method: "POST",
        body: JSON.stringify({
          servicio_id: servicio.id,
          barbero_id: barberoId,
          fecha,
          hora,
        }),
      });
      
      if (respuesta.ok) {
        toast.success("¡Cita agendada con éxito!");
        onClose();
      } else {
        const err = await respuesta.json();
        toast.error(err.message || "Hubo un problema al agendar.");
      }
    } catch (error) {
      toast.error("Error de conexión.");
    } finally {
      setCargandoReserva(false);
    }
  };

  // Helpers visuales
  const precioFormateado = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(servicio.precio);
  
  const XIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 dark:bg-[#03070e]/80 backdrop-blur-sm p-4 animate-fade-in transition-colors">
      <div className="bg-white dark:bg-[#0B1221] border border-slate-200 dark:border-slate-800/60 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        {/* CABECERA */}
        <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-800/60 flex justify-between items-start bg-slate-50 dark:bg-[#080d18]">
          <div className="flex gap-5 items-center">
            {servicio.imagen_url ? (
              <img
                src={servicio.imagen_url}
                alt={servicio.nombre}
                className="w-20 h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-700/50 shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-slate-200 dark:bg-[#03070e] flex items-center justify-center border border-slate-300 dark:border-slate-700/50 text-slate-400">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"
                  ></path>
                </svg>
              </div>
            )}
            <div>
              <span className="text-emerald-600 dark:text-emerald-500 text-[10px] font-bold uppercase tracking-widest mb-1 block">
                Reservar Servicio
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                {servicio.nombre}
              </h2>
              <div className="flex items-center gap-3 mt-2 text-sm font-medium">
                <span className="text-slate-500 dark:text-slate-400">
                  {servicio.duracion} min
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {precioFormateado}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:text-slate-500 dark:hover:text-rose-400 dark:hover:bg-slate-800/50 rounded-lg transition-colors shrink-0 mt-1"
          >
            <XIcon />
          </button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
          <form
            id="form-reserva"
            onSubmit={handleReservar}
            className="space-y-8"
          >
            {/* 1. SELECCIÓN DE Barberos */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 block">
                1. Elige a tu Barbero
              </label>
              <div className="grid grid-cols-2 gap-3">
                {barberos.map((barbero) => (
                  <div
                    key={barbero.id}
                    onClick={() => setBarberoId(barbero.id)}
                    className={`cursor-pointer border rounded-xl p-4 flex items-center gap-3 transition-all ${barberoId === barbero.id ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]" : "border-slate-200 dark:border-slate-700/50 bg-white dark:bg-[#03070e] hover:border-slate-300 dark:hover:border-slate-500"}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${barberoId === barbero.id ? "bg-emerald-500 text-white dark:text-[#03070e]" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}
                    >
                      {barbero.name.substring(0, 1).toUpperCase()}
                    </div>
                    <span
                      className={`text-sm font-medium transition-colors ${barberoId === barbero.id ? "text-emerald-700 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300"}`}
                    >
                      {barbero.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. SELECCIÓN DE FECHA (CON MIN LOCAL) */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 block">
                2. Selecciona la Fecha
              </label>
              <input
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                min={hoyLocal} // ✅ Usa la fecha local de Chile, no la de Londres
                className="w-full bg-slate-50 dark:bg-[#03070e] border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 text-sm text-slate-900 dark:text-slate-200 outline-none focus:border-emerald-500 focus:ring-1 transition-all cursor-pointer dark:[color-scheme:dark]"
              />
            </div>

            {/* 3. SELECCIÓN DE HORA CON FILTRO DE "PASADO" */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 block">
                3. Selecciona la Hora
              </label>

              {!barberoId || !fecha ? (
                <div className="text-center p-5 border border-dashed border-slate-300 dark:border-slate-700/80 rounded-xl text-slate-500 text-sm font-medium">
                  Selecciona Barbero y fecha.
                </div>
              ) : cargandoHoras ? (
                <div className="text-center p-5 text-emerald-600 dark:text-emerald-400 text-sm font-bold animate-pulse">
                  Verificando agenda...
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 animate-fade-in">
                  {horariosBase.map((h) => {
                    const ahora = new Date();
                    const horaActual = ahora.getHours();
                    const minutosActuales = ahora.getMinutes();
                    const [hHora, hMin] = h.split(":").map(Number);

                    // LÓGICA DE BLOQUEO:
                    // 1. Si la hora ya está en la lista de 'ocupadas' de la DB.
                    // 2. Si la fecha seleccionada es 'hoy' y la hora del bloque ya pasó (o es la hora actual).
                    const estaOcupadoEnDB = horasOcupadas.includes(h);
                    const esHoy = fecha === hoyLocal;
                    const yaPaso =
                      esHoy &&
                      (hHora < horaActual ||
                        (hHora === horaActual && minutosActuales >= 0));

                    const bloqueado = estaOcupadoEnDB || yaPaso;

                    return (
                      <div
                        key={h}
                        onClick={() => !bloqueado && setHora(h)}
                        className={`border rounded-lg py-2 flex flex-col items-center justify-center transition-all ${
                          bloqueado
                            ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed dark:border-slate-800/80 dark:bg-[#03070e]/40 dark:text-slate-600 opacity-60"
                            : hora === h
                              ? "border-emerald-500 bg-emerald-500 text-white dark:text-[#03070e] shadow-[0_0_10px_rgba(16,185,129,0.3)] scale-[1.02] cursor-pointer"
                              : "border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-[#03070e] text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500 cursor-pointer"
                        }`}
                      >
                        <span
                          className={`font-medium ${bloqueado ? "line-through decoration-rose-400/50" : ""}`}
                        >
                          {h}
                        </span>
                        {bloqueado && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400/80 mt-0.5">
                            {estaOcupadoEnDB ? "NO DISPONIBLE" : "No disp."}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-[#080d18] flex gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3.5 rounded-xl font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50 transition-colors"
          >
            Cancelar
          </button>
          <button
            form="form-reserva"
            type="submit"
            disabled={cargandoReserva || !hora}
            className={`flex-1 py-3.5 rounded-xl font-bold text-white dark:text-[#03070e] transition-all shadow-md ${cargandoReserva || !hora ? "bg-slate-400 dark:bg-slate-700 cursor-not-allowed shadow-none" : "bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-400 dark:shadow-emerald-900/20 hover:-translate-y-0.5"}`}
          >
            {cargandoReserva ? "Procesando..." : "Confirmar Reserva"}
          </button>
        </div>
      </div>
    </div>
  );
}