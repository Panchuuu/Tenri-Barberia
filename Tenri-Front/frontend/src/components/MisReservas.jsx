import React, { useState, useEffect } from 'react';

export default function MisReservas({ usuario, onVolver }) {
  const [misCitas, setMisCitas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarMisCitas = async () => {
      const token = localStorage.getItem('token');
      try {
        const respuesta = await fetch('http://127.0.0.1:8000/api/citas', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (respuesta.ok) {
          // Filtrar solo las citas que le pertenecen al cliente logueado
          const todasCitas = await respuesta.json();
          const citasDelCliente = todasCitas.filter(c => c.cliente_id === usuario.id);
          setMisCitas(citasDelCliente);
        }
      } catch (error) {
        console.error("Error al cargar historial:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarMisCitas();
  }, [usuario.id]);

  const getBadgeStyle = (estado) => {
    const estados = {
      pendiente: "bg-amber-100 text-amber-700 border-amber-200 dark:text-amber-400 dark:bg-amber-400/10 dark:border-transparent",
      confirmada: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-400/10 dark:border-transparent",
      cancelada: "bg-rose-100 text-rose-700 border-rose-200 dark:text-rose-400 dark:bg-rose-400/10 dark:border-transparent"
    };
    return estados[estado?.toLowerCase()] || "bg-slate-100 text-slate-700 border-slate-200 dark:text-slate-400 dark:bg-slate-800 dark:border-transparent";
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-50 dark:bg-[#060b14] text-slate-900 dark:text-slate-300 overflow-y-auto animate-fade-in transition-colors duration-300">
      
      {/* HEADER CLIENTE */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-[#03070e]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/50 shadow-sm transition-colors">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500 dark:text-[#03070e] flex items-center justify-center font-black text-lg transition-colors">
              {usuario?.name?.substring(0,1).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Mis Reservas</h2>
              <p className="text-xs text-slate-500 font-medium">Historial de {usuario?.name}</p>
            </div>
          </div>
          
          <button onClick={onVolver} className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:text-slate-300 rounded-lg text-sm font-semibold transition-all">
            Volver a la Tienda
          </button>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-5xl mx-auto px-6 py-10 w-full flex-1">
        {cargando ? (
          <div className="text-center py-20 text-slate-500">Cargando tu historial...</div>
        ) : misCitas.length === 0 ? (
          <div className="bg-white dark:bg-[#0B1221] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-12 text-center shadow-sm transition-colors">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Aún no tienes citas</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Explora nuestro catálogo y reserva tu primer servicio.</p>
            <button onClick={onVolver} className="bg-emerald-500 hover:bg-emerald-600 text-white dark:text-[#03070e] dark:hover:bg-emerald-400 font-bold px-6 py-3 rounded-lg transition-all shadow-md">
              Ver Catálogo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {misCitas.map(cita => (
              <div key={cita.id} className="bg-white dark:bg-[#0B1221] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-6 shadow-sm hover:shadow-md dark:shadow-none transition-all flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-emerald-600 dark:text-emerald-500 text-[10px] font-bold uppercase tracking-widest block mb-1">
                      {cita.fecha} • {cita.hora}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{cita.servicio?.nombre || 'Servicio Barbería'}</h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getBadgeStyle(cita.estado)}`}>
                    {cita.estado}
                  </span>
                </div>
                
                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center text-[10px] font-bold">
                      {cita.barbero?.name?.substring(0,1).toUpperCase() || '?'}
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      {cita.barbero?.name || 'Por asignar'}
                    </span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    ${cita.servicio?.precio?.toLocaleString('es-CL')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}