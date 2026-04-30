import React, { useState, useEffect } from 'react';

export default function BarberoDashboard({ usuario, onVolver }) {
  // ==========================================
  // 1. ESTADOS DE LA BASE DE DATOS
  // ==========================================
  // Aquí guardaremos solo las citas que le pertenecen al barbero que inició sesión
  const [misCitas, setMisCitas] = useState([]);
  const [cargando, setCargando] = useState(true);

  // ==========================================
  // 2. CARGA DE DATOS (EFECTO INICIAL)
  // ==========================================
  useEffect(() => {
    cargarMisCitas();
  }, []);

  const cargarMisCitas = async () => {
    const token = localStorage.getItem('token');
    try {
      // Pedimos TODAS las citas al backend
      const respuesta = await fetch('http://127.0.0.1:8000/api/citas', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (respuesta.ok) {
        const todasCitas = await respuesta.json();
        // FILTRO MAGNÉTICO: De todas las citas, nos quedamos solo con las que
        // coincidan con el ID del barbero que tiene la sesión abierta (usuario.id)
        const citasDelBarbero = todasCitas.filter(cita => cita.barbero_id === usuario.id);
        
        // Guardamos el resultado limpio en el estado
        setMisCitas(citasDelBarbero);
      }
    } catch (error) {
      console.error("Error al cargar agenda:", error);
    } finally {
      setCargando(false);
    }
  };

  // ==========================================
  // 3. ACCIONES DEL BARBERO (CERRAR TURNOS)
  // ==========================================
  // Esta función cambia el estado de la cita en Laravel
  const handleActualizarEstado = async (id, nuevoEstado) => {
    // Agregamos una confirmación para evitar que el barbero cierre un turno por error
    if (!confirm(`¿Estás seguro de marcar esta cita como "${nuevoEstado}"?`)) return;

    const token = localStorage.getItem('token');
    try {
      const respuesta = await fetch(`http://127.0.0.1:8000/api/citas/${id}/estado`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      
      // Si Laravel responde OK, recargamos la lista para ver el cambio instantáneo
      if (respuesta.ok) { 
        await cargarMisCitas();
    } else {
         // Ahora sí podremos ver el error real que nos manda Laravel
         const errorInfo = await respuesta.json();
         console.error("Error de Laravel:", errorInfo);
         alert(errorInfo.message || "Error al actualizar el estado");
      }
    } catch (error) {
      console.error("Error de red:", error);
    }
  };

  // Función para cerrar la sesión actual
  const handleCerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  // ==========================================
  // 4. DISEÑO Y ESTÉTICA (HELPERS)
  // ==========================================
  // Dependiendo del estado, pintamos la etiqueta de un color distinto
  const getBadgeStyle = (estado) => {
    const estados = {
      pendiente: "text-amber-400 bg-amber-400/10 border-amber-500/20",
      confirmada: "text-cyan-400 bg-cyan-400/10 border-cyan-500/20", // Confirmada es "en espera en el local"
      finalizada: "text-emerald-400 bg-emerald-400/10 border-emerald-500/20", // ¡Cobrado y listo!
      cancelada: "text-rose-400 bg-rose-400/10 border-rose-500/20" // No asistió
    };
    return estados[estado?.toLowerCase()] || "text-slate-400 bg-slate-800 border-transparent";
  };

  // Íconos limpios
  const LogOutIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
  const CheckIcon = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
  const XIcon = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

  // Separamos las citas: Las que tiene que atender (pendientes/confirmadas) y el historial
  const citasPendientes = misCitas.filter(c => c.estado === 'pendiente' || c.estado === 'confirmada');
  const historialCitas = misCitas.filter(c => c.estado === 'finalizada' || c.estado === 'cancelada');

  return (
    // Fondo general 100% oscuro (Modo Backoffice)
    <div className="fixed inset-0 z-[100] flex bg-[#060b14] text-slate-300 font-sans animate-fade-in">
      
      {/* ================= BARRA LATERAL (SIDEBAR) ================= */}
      <aside className="w-[280px] bg-[#03070e] flex flex-col justify-between border-r border-slate-800/50">
        <div>
          {/* Logo Brand */}
          <div className="h-24 flex items-center justify-center border-b border-slate-800/30">
            <h1 className="text-xl font-black tracking-widest text-white">
              TENRI <span className="text-emerald-400">BARBER</span>
            </h1>
          </div>

          <nav className="p-4 mt-4">
            <div>
              <div className="w-full text-left px-5 py-3 rounded-lg text-sm font-medium bg-[#0f1b29] text-emerald-400 flex items-center gap-3 border border-emerald-500/10">
                📅 Mi Agenda
              </div>
              <div className="ml-8 border-l border-slate-700/50 pl-4 py-3 mt-1 space-y-3">
                <p className="text-sm font-medium text-emerald-400 cursor-default">Turnos de Hoy</p>
                <p className="text-sm font-medium text-slate-500 cursor-default">Historial Personal</p>
              </div>
            </div>
          </nav>
        </div>

        {/* Perfil Inferior */}
        <div className="p-5 border-t border-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-[#03070e] font-black text-sm">
              {usuario?.name?.substring(0,1).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white leading-tight truncate w-24">{usuario?.name}</span>
              <span className="text-[11px] text-slate-500 font-medium">Especialista</span>
            </div>
          </div>
          <button onClick={handleCerrarSesion} className="text-slate-500 hover:text-rose-400 transition-colors p-2" title="Cerrar Sesión">
            <LogOutIcon />
          </button>
        </div>
      </aside>

      {/* ================= CONTENIDO PRINCIPAL ================= */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Cabecera superior interna */}
        <header className="h-24 px-10 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Estación de Trabajo</h2>
            <p className="text-sm text-slate-500 mt-1">Gestiona tus turnos operativos.</p>
          </div>
          <button onClick={onVolver} className="px-5 py-2.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg text-sm font-semibold text-slate-300 hover:text-white transition-all shadow-sm">
            Volver a la Tienda
          </button>
        </header>

        {/* Área de trabajo con scroll */}
        <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar space-y-8">
          
          {/* TABLA 1: TURNOS POR ATENDER */}
          <div className="bg-[#0B1221] border border-slate-800/60 rounded-2xl overflow-hidden shadow-xl animate-fade-in">
            <div className="px-8 py-5 border-b border-slate-800/60 flex justify-between items-center bg-[#080d18]">
              <h3 className="text-slate-300 font-semibold text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                Turnos Activos (En Espera)
              </h3>
            </div>
            
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#080d18] border-b border-slate-800/60">
                <tr>
                  <th className="px-8 py-4 text-slate-400 font-semibold tracking-wide">Fecha / Hora</th>
                  <th className="px-8 py-4 text-slate-400 font-semibold tracking-wide">Cliente</th>
                  <th className="px-8 py-4 text-slate-400 font-semibold tracking-wide">Servicio</th>
                  <th className="px-8 py-4 text-slate-400 font-semibold tracking-wide text-center">Estado</th>
                  <th className="px-8 py-4 text-slate-400 font-semibold tracking-wide text-right">Finalizar Turno</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {citasPendientes.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-12 text-slate-500 italic">No tienes clientes en espera actualmente.</td></tr>
                ) : citasPendientes.map(cita => (
                  <tr key={cita.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-8 py-5">
                      <span className="font-bold text-slate-200">{cita.fecha}</span>
                      <span className="text-slate-500 ml-4 font-mono text-xs bg-slate-800 px-2 py-1 rounded">{cita.hora}</span>
                    </td>
                    <td className="px-8 py-5 text-slate-300 font-medium">{cita.cliente?.name || 'Cliente sin nombre'}</td>
                    <td className="px-8 py-5 text-slate-400">{cita.servicio?.nombre || 'Corte Clásico'}</td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-2.5 py-1 rounded border text-[10px] font-bold uppercase tracking-wider ${getBadgeStyle(cita.estado)}`}>
                        {cita.estado}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex gap-2 justify-end">
                        {/* Botón Verde: El cliente se cortó el pelo y todo salió bien */}
                        <button 
                          onClick={() => handleActualizarEstado(cita.id, 'finalizada')} 
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/50 rounded transition-all text-xs font-bold"
                        >
                          <CheckIcon /> Completado
                        </button>
                        {/* Botón Rojo: El cliente nunca llegó */}
                        <button 
                          onClick={() => handleActualizarEstado(cita.id, 'cancelada')} 
                          className="flex items-center gap-1 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/50 rounded transition-all text-xs font-bold"
                        >
                          <XIcon /> No Asistió
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TABLA 2: HISTORIAL DEL BARBERO */}
          <div className="bg-[#0B1221] border border-slate-800/60 rounded-2xl overflow-hidden shadow-xl animate-fade-in opacity-80 hover:opacity-100 transition-opacity">
            <div className="px-8 py-5 border-b border-slate-800/60 flex justify-between items-center bg-[#080d18]">
              <h3 className="text-slate-400 font-semibold text-sm">Historial de Trabajos</h3>
            </div>
            
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#080d18] border-b border-slate-800/60">
                <tr>
                  <th className="px-8 py-3 text-slate-500 font-semibold tracking-wide">ID</th>
                  <th className="px-8 py-3 text-slate-500 font-semibold tracking-wide">Fecha</th>
                  <th className="px-8 py-3 text-slate-500 font-semibold tracking-wide">Cliente</th>
                  <th className="px-8 py-3 text-slate-500 font-semibold tracking-wide text-right">Resolución</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {historialCitas.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-8 text-slate-500 italic">No hay registros históricos.</td></tr>
                ) : historialCitas.map(cita => (
                  <tr key={cita.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-8 py-4 text-slate-600 font-mono text-xs">#{cita.id}</td>
                    <td className="px-8 py-4 text-slate-500">{cita.fecha} <span className="ml-2 text-xs">{cita.hora}</span></td>
                    <td className="px-8 py-4 text-slate-400">{cita.cliente?.name}</td>
                    <td className="px-8 py-4 text-right">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${getBadgeStyle(cita.estado)}`}>
                        {cita.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
}