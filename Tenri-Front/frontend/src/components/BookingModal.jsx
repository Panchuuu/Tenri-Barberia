import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function BookingModal({ servicio, barberiaSlug, onClose }) {
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [barberoId, setBarberoId] = useState('');
  const [barberos, setBarberos] = useState([]);
  
  // La malla de horarios oficiales de Tenri Barber
  const [horariosBase, setHorariosBase] = useState([]);
  
  // Guardaremos las horas que ya tomó otro cliente
  const [horasOcupadas, setHorasOcupadas] = useState([]);
  const [cargandoHoras, setCargandoHoras] = useState(false);
  const [cargandoReserva, setCargandoReserva] = useState(false);

  useEffect(() => {
    const obtenerBarberos = async () => {
      try {
        const respuesta = await fetch(`http://127.0.0.1:8000/api/barberos?barberia=${barberiaSlug}`);
        if (respuesta.ok) setBarberos(await respuesta.json());
      } catch (error) { console.error(error); }
    };
    obtenerBarberos();
  }, []);

  // MOTOR ANTI-CHOQUES Y HORARIOS DINÁMICOS
  useEffect(() => {
    const obtenerHorasOcupadas = async () => {
      // Si falta elegir especialista o fecha, limpiamos todo y salimos
      if (!barberoId || !fecha) {
        setHorasOcupadas([]);
        setHorariosBase([]);
        return;
      }

      setCargandoHoras(true);
      setHora(''); // Reseteamos la hora si el cliente cambia de día

      try {
        const res = await fetch(`http://127.0.0.1:8000/api/barberos/${barberoId}/disponibilidad?fecha=${fecha}`);
        
        if (res.ok) {
          const datos = await res.json();
          
          // 1. Guardamos las horas que el sistema dice que están tomadas
          setHorasOcupadas(datos.ocupadas);

          // 2. Extraemos el número de la hora de inicio y fin (Ej: de "10:00" sacamos el 10)
          const inicioNum = parseInt(datos.hora_inicio.split(':')[0]);
          const finNum = parseInt(datos.hora_fin.split(':')[0]);

          // 3. Construimos la malla horaria bloque por bloque
          const mallaDinamica = [];
          
          for (let i = inicioNum; i <= finNum; i++) {
            // Regla de negocio: Mantenemos el bloqueo de las 14:00 por colación general
            if (i === 14) continue; 

            // Formateamos el número para que siempre tenga dos dígitos (Ej: 9 se vuelve "09:00")
            const horaString = `${i.toString().padStart(2, '0')}:00`;
            mallaDinamica.push(horaString);
          }

          // 4. Se la enviamos a la interfaz para que dibuje los cuadritos
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
    const token = localStorage.getItem('token');
    
    if (!token) return toast.error("Por favor, inicia sesión para poder agendar tu cita.");
    if (!fecha || !hora || !barberoId) return toast.error("Por favor, completa todos los campos.");
    
    setCargandoReserva(true);
    try {
      const respuesta = await fetch('http://127.0.0.1:8000/api/citas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ servicio_id: servicio.id, barbero_id: barberoId, fecha, hora })
      });
      if (respuesta.ok) { 
        toast.success("¡Cita agendada con éxito!"); 
        onClose(); 
      } else { 
        const err = await respuesta.json(); 
        toast.error(err.message || "Hubo un problema al agendar."); 
      }
    } catch (error) { 
      toast.error("Error de conexión con el servidor."); 
    } finally { 
      setCargandoReserva(false); 
    }
  };

  const precioFormateado = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(servicio.precio);
  const XIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 dark:bg-[#03070e]/80 backdrop-blur-sm p-4 animate-fade-in transition-colors">
      <div className="bg-white dark:bg-[#0B1221] border border-slate-200 dark:border-slate-800/60 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        
        {/* ============================================== */}
        {/* CABECERA DEL MODAL (CON FOTO DEL SERVICIO)     */}
        {/* ============================================== */}
        <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-800/60 flex justify-between items-start bg-slate-50 dark:bg-[#080d18] transition-colors">
          <div className="flex gap-5 items-center">
            
            {/* IMAGEN O ÍCONO POR DEFECTO */}
            {servicio.imagen_url ? (
              <img 
                src={servicio.imagen_url} 
                alt={servicio.nombre} 
                className="w-20 h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-700/50 shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-slate-200 dark:bg-[#03070e] flex items-center justify-center border border-slate-300 dark:border-slate-700/50 text-slate-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"></path></svg>
              </div>
            )}

            {/* TEXTOS DEL SERVICIO */}
            <div>
              <span className="text-emerald-600 dark:text-emerald-500 text-[10px] font-bold uppercase tracking-widest mb-1 block">Reservar Servicio</span>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">{servicio.nombre}</h2>
              <div className="flex items-center gap-3 mt-2 text-sm font-medium">
                <span className="text-slate-500 dark:text-slate-400">{servicio.duracion} min</span>
                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                <span className="text-emerald-600 dark:text-emerald-400">{precioFormateado}</span>
              </div>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:text-slate-500 dark:hover:text-rose-400 dark:hover:bg-slate-800/50 rounded-lg transition-colors shrink-0 mt-1">
            <XIcon />
          </button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
          <form id="form-reserva" onSubmit={handleReservar} className="space-y-8">
            
            {/* 1. SELECCIÓN DE ESPECIALISTA */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 block">1. Elige a tu Especialista</label>
              <div className="grid grid-cols-2 gap-3">
                {barberos.map(barbero => (
                  <div key={barbero.id} onClick={() => setBarberoId(barbero.id)} className={`cursor-pointer border rounded-xl p-4 flex items-center gap-3 transition-all ${ barberoId === barbero.id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'border-slate-200 dark:border-slate-700/50 bg-white dark:bg-[#03070e] hover:border-slate-300 dark:hover:border-slate-500' }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${barberoId === barbero.id ? 'bg-emerald-500 text-white dark:text-[#03070e]' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                      {barbero.name.substring(0,1).toUpperCase()}
                    </div>
                    <span className={`text-sm font-medium transition-colors ${barberoId === barbero.id ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>{barbero.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. SELECCIÓN DE FECHA */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 block">2. Selecciona la Fecha</label>
              <input type="date" required value={fecha} onChange={(e) => setFecha(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full bg-slate-50 dark:bg-[#03070e] border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 text-sm text-slate-900 dark:text-slate-200 outline-none focus:border-emerald-500 focus:ring-1 transition-all cursor-pointer dark:[color-scheme:dark]" />
            </div>

            {/* 3. SELECCIÓN DE HORA INTELIGENTE */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 block">3. Selecciona la Hora</label>
              
              {!barberoId || !fecha ? (
                <div className="text-center p-5 border border-dashed border-slate-300 dark:border-slate-700/80 rounded-xl text-slate-500 text-sm font-medium">
                  Selecciona tu Especialista y la Fecha para ver los horarios.
                </div>
              ) : cargandoHoras ? (
                <div className="text-center p-5 text-emerald-600 dark:text-emerald-400 text-sm font-bold animate-pulse">
                  Verificando agenda...
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 animate-fade-in">
                  {horariosBase.map(h => {
                    const estaOcupado = horasOcupadas.includes(h);

                    return (
                      <div 
                        key={h} 
                        // Si está ocupado, no hacemos nada al hacer clic
                        onClick={() => !estaOcupado && setHora(h)} 
                        className={`border rounded-lg py-2 flex flex-col items-center justify-center transition-all ${ 
                          estaOcupado 
                            ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed dark:border-slate-800/80 dark:bg-[#03070e]/40 dark:text-slate-600 opacity-60' 
                            : hora === h 
                              ? 'border-emerald-500 bg-emerald-500 text-white dark:text-[#03070e] shadow-[0_0_10px_rgba(16,185,129,0.3)] scale-[1.02] cursor-pointer' 
                              : 'border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-[#03070e] text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500 cursor-pointer' 
                        }`}
                      >
                        <span className={`font-medium ${estaOcupado ? 'line-through decoration-rose-400/50' : ''}`}>
                          {h}
                        </span>
                        {/* Etiqueta visual para horas ocupadas */}
                        {estaOcupado && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400/80 mt-0.5">
                            Reservado
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

        <div className="p-6 border-t border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-[#080d18] flex gap-4 transition-colors">
          <button type="button" onClick={onClose} className="px-6 py-3.5 rounded-xl font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50 transition-colors">Cancelar</button>
          <button form="form-reserva" type="submit" disabled={cargandoReserva || !hora} className={`flex-1 py-3.5 rounded-xl font-bold text-white dark:text-[#03070e] transition-all shadow-md ${cargandoReserva || !hora ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed shadow-none' : 'bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-400 dark:shadow-emerald-900/20 hover:-translate-y-0.5'}`}>
            {cargandoReserva ? 'Procesando...' : 'Confirmar Reserva'}
          </button>
        </div>
      </div>
    </div>
  );
}