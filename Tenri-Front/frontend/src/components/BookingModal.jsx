import React, { useState, useEffect } from 'react';

export default function BookingModal({ servicio, onClose }) {
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('10:00:00');
  const [guardando, setGuardando] = useState(false);
  
  const [barberos, setBarberos] = useState([]);
  const [barberoId, setBarberoId] = useState('');

  useEffect(() => {
    if (servicio) {
      const obtenerBarberos = async () => {
        try {
          const respuesta = await fetch('http://127.0.0.1:8000/api/barberos');
          const datos = await respuesta.json();
          setBarberos(datos);
          if (datos.length > 0) {
            setBarberoId(datos[0].id);
          }
        } catch (error) {
          console.error("Error al cargar barberos:", error);
        }
      };
      obtenerBarberos();
    }
  }, [servicio]);

  if (!servicio) return null;

  const handleConfirmar = async () => {
    if (!fecha) {
      alert("¡Por favor selecciona una fecha!");
      return;
    }
    if (!barberoId) {
      alert("¡Por favor selecciona un barbero!");
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert("Debes iniciar sesión para agendar una cita.");
      return;
    }

    setGuardando(true);

    try {
      const respuesta = await fetch('http://127.0.0.1:8000/api/citas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          servicio_id: servicio.id,
          barbero_id: barberoId,
          fecha: fecha,
          hora: hora
        })
      });

      if (respuesta.ok) {
        alert("¡Cita agendada con éxito!");
        onClose();
      } else {
        alert("Hubo un error al agendar. Intenta nuevamente.");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setGuardando(false);
    }
  };

  return (
    // CONTENEDOR PRINCIPAL: Ahora usa backdrop-blur-md para un efecto de vidrio esmerilado más premium
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md cursor-pointer transition-opacity" onClick={onClose}></div>

      {/* CAJA DEL MODAL CORPORATIVO */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg p-8 overflow-hidden">
        
        {/* Brillo decorativo de fondo */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors bg-slate-800/50 hover:bg-slate-800 p-2 rounded-full">
          ✕
        </button>

        {/* CABECERA DEL MODAL */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
            Reserva de Servicio
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            Confirmar <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Cita</span>
          </h2>
          <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-2xl flex justify-between items-center mt-4">
            <div>
              <p className="text-slate-300 font-semibold">{servicio.nombre}</p>
              <p className="text-xs text-slate-500">Duración est. 45 min</p>
            </div>
            <span className="text-cyan-400 font-mono text-xl font-bold">
              ${Number(servicio.precio).toLocaleString('es-CL')}
            </span>
          </div>
        </div>

        {/* FORMULARIO */}
        <div className="space-y-5 relative z-10">
          
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Especialista Asignado</label>
            <select 
              value={barberoId}
              onChange={(e) => setBarberoId(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all cursor-pointer outline-none appearance-none"
            >
              {barberos.length === 0 ? (
                <option value="">Cargando especialistas...</option>
              ) : (
                barberos.map(barbero => (
                  <option key={barbero.id} value={barbero.id}>
                    {barbero.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Fecha</label>
              <input 
                type="date" 
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Hora</label>
              <select 
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all cursor-pointer outline-none appearance-none"
              >
                <option value="10:00:00">10:00 AM</option>
                <option value="11:30:00">11:30 AM</option>
                <option value="15:00:00">15:00 PM</option>
                <option value="17:30:00">17:30 PM</option>
              </select>
            </div>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="mt-10 flex gap-4 relative z-10">
          <button 
            onClick={onClose} 
            className="flex-1 px-4 py-4 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleConfirmar}
            disabled={guardando}
            className="flex-[2] px-4 py-4 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold rounded-xl shadow-lg hover:shadow-cyan-900/30 transition-all transform active:scale-95"
          >
            {guardando ? 'Procesando...' : 'Confirmar Reserva'}
          </button>
        </div>

      </div>
    </div>
  );
}