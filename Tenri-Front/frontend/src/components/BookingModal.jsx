import React, { useState, useEffect } from 'react';

export default function BookingModal({ servicio, onClose }) {
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [barberoId, setBarberoId] = useState('');
  const [barberos, setBarberos] = useState([]);
  const [cargando, setCargando] = useState(false);

  const horariosDisponibles = ['10:00', '11:00', '12:00', '13:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

  useEffect(() => {
    const obtenerBarberos = async () => {
      try {
        const respuesta = await fetch('http://127.0.0.1:8000/api/barberos');
        if (respuesta.ok) setBarberos(await respuesta.json());
      } catch (error) { console.error(error); }
    };
    obtenerBarberos();
  }, []);

  const handleReservar = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return alert("Por favor, inicia sesión para poder agendar tu cita.");
    if (!fecha || !hora || !barberoId) return alert("Completa todos los campos.");
    setCargando(true);
    try {
      const respuesta = await fetch('http://127.0.0.1:8000/api/citas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ servicio_id: servicio.id, barbero_id: barberoId, fecha, hora })
      });
      if (respuesta.ok) { alert("¡Cita agendada con éxito!"); onClose(); } 
      else { const err = await respuesta.json(); alert(err.message || "Problema al agendar."); }
    } catch (error) { alert("Error de conexión."); } 
    finally { setCargando(false); }
  };

  const precioFormateado = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(servicio.precio);
  const XIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 dark:bg-[#03070e]/80 backdrop-blur-sm p-4 animate-fade-in transition-colors">
      <div className="bg-white dark:bg-[#0B1221] border border-slate-200 dark:border-slate-800/60 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        
        <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-800/60 flex justify-between items-start bg-slate-50 dark:bg-[#080d18] transition-colors">
          <div>
            <span className="text-emerald-600 dark:text-emerald-500 text-[10px] font-bold uppercase tracking-widest mb-1 block">Reservar Servicio</span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{servicio.nombre}</h2>
            <div className="flex items-center gap-3 mt-2 text-sm font-medium">
              <span className="text-slate-500 dark:text-slate-400">{servicio.duracion} min</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
              <span className="text-emerald-600 dark:text-emerald-400">{precioFormateado}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:text-slate-500 dark:hover:text-rose-400 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
            <XIcon />
          </button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
          <form id="form-reserva" onSubmit={handleReservar} className="space-y-8">
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

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 block">2. Selecciona la Fecha</label>
              <input type="date" required value={fecha} onChange={(e) => setFecha(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full bg-slate-50 dark:bg-[#03070e] border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 text-sm text-slate-900 dark:text-slate-200 outline-none focus:border-emerald-500 focus:ring-1 transition-all cursor-pointer dark:[color-scheme:dark]" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 block">3. Selecciona la Hora</label>
              <div className="grid grid-cols-3 gap-3">
                {horariosDisponibles.map(h => (
                  <div key={h} onClick={() => setHora(h)} className={`cursor-pointer border rounded-lg py-2.5 text-center transition-all ${ hora === h ? 'border-emerald-500 bg-emerald-500 text-white dark:text-[#03070e] font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-[#03070e] text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500 font-medium' }`}>{h}</div>
                ))}
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-[#080d18] flex gap-4 transition-colors">
          <button type="button" onClick={onClose} className="px-6 py-3.5 rounded-xl font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50 transition-colors">Cancelar</button>
          <button form="form-reserva" type="submit" disabled={cargando} className={`flex-1 py-3.5 rounded-xl font-bold text-white dark:text-[#03070e] transition-all shadow-md ${cargando ? 'bg-emerald-400 dark:bg-emerald-600/50 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-400 dark:shadow-emerald-900/20 hover:-translate-y-0.5'}`}>
            {cargando ? 'Procesando...' : 'Confirmar Reserva'}
          </button>
        </div>
      </div>
    </div>
  );
}