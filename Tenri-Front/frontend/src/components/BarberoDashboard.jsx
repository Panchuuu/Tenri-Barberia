import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
// Importamos nuestro portero inteligente centralizado
import apiFetch from "../utils/api";

export default function BarberoDashboard({ usuario, onVolver }) {
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);

  
  // 👇 NUEVO ESTADO: Para que el barbero también pueda paginar su agenda
  const [paginacion, setPaginacion] = useState({ actual: 1, total: 1 });

  useEffect(() => {
    cargarMisCitas();
  }, []);

  // 👇 MODIFICADO: Ahora acepta el parámetro de página
  const cargarMisCitas = async (pagina = 1) => {
    setCargando(true);
    try {
      // Llamamos al endpoint de citas del barbero con soporte para paginación
      const respuesta = await apiFetch(`/barbero/citas?page=${pagina}`);
      
      if (respuesta.ok) {
        const datos = await respuesta.json();
        
        // ✅ CORRECCIÓN DEL ERROR: Extraemos el arreglo de .data
        // El listado general de citas ahora vive dentro de datos.data
        const todasCitas = datos.data || datos; 
        setCitas(todasCitas);

        // Guardamos los metadatos para la navegación
        setPaginacion({
          actual: datos.current_page || 1,
          total: datos.last_page || 1
        });
      }
    } catch (error) {
      console.error("Error al cargar agenda:", error);
      toast.error("No se pudo cargar tu agenda");
    } finally {
      setCargando(false);
    }
  };

  const handleActualizarEstado = async (id, nuevoEstado) => {
    try {
      const respuesta = await apiFetch(`/citas/${id}/estado`, {
        method: "PATCH",
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (respuesta.ok) {
        toast.success(`Cita marcada como ${nuevoEstado}`);
        // Recargamos la página actual para refrescar la lista
        await cargarMisCitas(paginacion.actual);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar el estado");
    }
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
  };

  // Lógica de filtrado local (dentro de la página actual)
  const hoy = new Date().toLocaleDateString('sv-SE');
  const citasHoy = citas.filter(c => 
    c.fecha === hoy && 
    c.estado !== 'cancelada' && 
    c.estado !== 'finalizada'
  );
  const otrasCitas = citas.filter(c => 
    c.fecha !== hoy || 
    c.estado === 'cancelada' || 
    c.estado === 'finalizada'
  );

  const getBadgeStyle = (estado) => {
    const estados = {
      pendiente: "text-amber-400 bg-amber-400/10 border-amber-400/20",
      confirmada: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
      finalizada: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
      cancelada: "text-rose-400 bg-rose-400/10 border-rose-400/20",
    };
    return estados[estado?.toLowerCase()] || "text-slate-400 bg-slate-800 border-transparent";
  };

  return (
    <div className="fixed inset-0 z-[100] flex bg-[#060b14] text-slate-300 font-sans animate-fade-in overflow-hidden">
      
      {/* SIDEBAR BARBERO */}
      <aside className="w-[280px] bg-[#03070e] flex flex-col justify-between border-r border-slate-800/50">
        <div>
          <div className="h-24 flex items-center justify-center border-b border-slate-800/30 font-black text-xl text-white">
            TENRI <span className="text-emerald-400 ml-2">STAFF</span>
          </div>
          <nav className="p-4 mt-4 text-sm font-medium">
            <div className="w-full px-5 py-3 rounded-lg bg-[#0f1b29] text-emerald-400 border border-emerald-500/20">
              📅 Mi Agenda
            </div>
          </nav>
        </div>

        <div className="p-5 border-t border-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-[#03070e] font-black text-xs">
              {usuario?.name?.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white leading-tight">{usuario?.name}</span>
              <span className="text-[10px] text-emerald-500 uppercase font-bold tracking-tighter">Barbero</span>
            </div>
          </div>
          <button onClick={handleCerrarSesion} className="text-slate-500 hover:text-rose-400 p-2 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-24 px-10 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Gestión de Citas</h2>
            <p className="text-slate-500 text-sm">Organiza tu jornada de trabajo</p>
          </div>
          <button onClick={onVolver} className="px-5 py-2.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg text-sm font-semibold transition-all">
            Volver a la Tienda
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar">
          
          {cargando ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500 font-medium">Sincronizando agenda...</p>
            </div>
          ) : (
            <div className="space-y-10">
              
              {/* SECCIÓN: CITAS DE HOY */}
              <section>
                <h3 className="text-emerald-400 text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Agenda para Hoy ({hoy})
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {citasHoy.length === 0 ? (
                    <div className="col-span-full py-10 text-center border-2 border-dashed border-slate-800 rounded-2xl text-slate-600">
                      No hay citas programadas para hoy.
                    </div>
                  ) : (
                    citasHoy.map(c => (
                      <div key={c.id} className="bg-[#0B1221] border border-slate-800/60 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                        <div className={`absolute top-0 left-0 w-1 h-full ${c.estado === 'confirmada' ? 'bg-cyan-500' : 'bg-amber-500'}`}></div>
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-2xl font-black text-white">{c.hora?.substring(0,5)}</span>
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${getBadgeStyle(c.estado)}`}>{c.estado}</span>
                        </div>
                        <h4 className="text-lg font-bold text-slate-200 mb-1">{c.cliente?.name}</h4>
                        <p className="text-xs text-slate-500 mb-6 flex items-center gap-2">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"></path></svg>
                          {c.servicio?.nombre} • {c.servicio?.duracion} min
                        </p>
                        
                        <div className="flex gap-2 pt-4 border-t border-slate-800/50">
                          <button onClick={() => handleActualizarEstado(c.id, 'finalizada')} className="flex-1 py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-[#03070e] text-xs font-bold rounded-lg transition-all border border-emerald-500/20">Finalizar</button>
                          <button onClick={() => handleActualizarEstado(c.id, 'cancelada')} className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg transition-all border border-rose-500/20">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* SECCIÓN: RESTO DE LA AGENDA / HISTORIAL */}
              <section>
                <h3 className="text-slate-500 text-xs font-black uppercase tracking-[0.2em] mb-6">Resto de la Agenda</h3>
                <div className="bg-[#0B1221] border border-slate-800/60 rounded-2xl overflow-hidden shadow-xl">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#080d18] border-b border-slate-800/60 text-slate-500 font-semibold uppercase text-[10px] tracking-widest">
                      <tr>
                        <th className="px-8 py-4">Fecha</th>
                        <th className="px-8 py-4">Hora</th>
                        <th className="px-8 py-4">Cliente</th>
                        <th className="px-8 py-4">Servicio</th>
                        <th className="px-8 py-4 text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {otrasCitas.map(c => (
                        <tr key={c.id} className="hover:bg-slate-800/20 transition-colors">
                          <td className="px-8 py-4 text-slate-400 font-medium">{c.fecha}</td>
                          <td className="px-8 py-4 text-slate-200 font-bold">{c.hora?.substring(0,5)}</td>
                          <td className="px-8 py-4 text-slate-400">{c.cliente?.name}</td>
                          <td className="px-8 py-4 text-slate-500 text-xs">{c.servicio?.nombre}</td>
                          <td className="px-8 py-4 text-center">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${getBadgeStyle(c.estado)}`}>{c.estado}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* 👇 CONTROLES DE PAGINACIÓN PARA EL BARBERO 👇 */}
                  <div className="flex items-center justify-between bg-[#080d18] px-8 py-4 border-t border-slate-800/60">
                    <p className="text-xs text-slate-500 font-medium">
                      Página <span className="text-white">{paginacion.actual}</span> de {paginacion.total}
                    </p>
                    <div className="flex gap-2">
                      <button
                        disabled={paginacion.actual === 1}
                        onClick={() => cargarMisCitas(paginacion.actual - 1)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-xs font-bold transition-colors"
                      >
                        Anterior
                      </button>
                      <button
                        disabled={paginacion.actual === paginacion.total}
                        onClick={() => cargarMisCitas(paginacion.actual + 1)}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#03070e] disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-xs font-bold transition-colors"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}