import React, { useState, useEffect } from 'react';

export default function AdminDashboard({ usuario, onVolver }) {
  const [tabActiva, setTabActiva] = useState('agenda');

  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [editandoId, setEditandoId] = useState(null);

  const [barberos, setBarberos] = useState([]);
  const [citas, setCitas] = useState([]);
  const [finanzas, setFinanzas] = useState(null); // <--- Nuevo estado para el dinero

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const token = localStorage.getItem('token');
    try {
      // 1. Cargar Barberos
      const resB = await fetch('http://127.0.0.1:8000/api/barberos');
      if (resB.ok) setBarberos(await resB.json());
      
      // 2. Cargar Citas
      const resC = await fetch('http://127.0.0.1:8000/api/citas', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resC.ok) setCitas(await resC.json());

      // 3. Cargar Finanzas de Hoy
      const resF = await fetch('http://127.0.0.1:8000/api/finanzas/hoy', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resF.ok) setFinanzas(await resF.json());

    } catch (e) { console.error(e); }
  };

  const handleGuardarBarbero = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const url = editandoId ? `http://127.0.0.1:8000/api/barberos/${editandoId}` : 'http://127.0.0.1:8000/api/barberos/asignar';
    const metodo = editandoId ? 'PUT' : 'POST';

    try {
      const respuesta = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ email: email, name: nombre })
      });
      if (respuesta.ok) {
        cancelarEdicion();
        await cargarDatos();
      } else {
        const err = await respuesta.json();
        alert(err.message || "Error en la operación");
      }
    } catch (e) { console.error(e); }
  };

  const prepararEdicion = (barbero) => {
    setEditandoId(barbero.id);
    setNombre(barbero.name);
    setEmail(barbero.email);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setNombre('');
    setEmail('');
  };

  const handleEliminarBarbero = async (id) => {
    if (!confirm("¿Revocar acceso de este especialista?")) return;
    const token = localStorage.getItem('token');
    try {
      const resp = await fetch(`http://127.0.0.1:8000/api/barberos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) await cargarDatos();
    } catch (e) { console.error(e); }
  };

  const handleActualizarEstado = async (id, nuevoEstado) => {
    const token = localStorage.getItem('token');
    try {
      const respuesta = await fetch(`http://127.0.0.1:8000/api/citas/${id}/estado`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json', 
          'Accept': 'application/json', // Anti-redirecciones
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (respuesta.ok) await cargarDatos(); // Recarga TODO (incluyendo métricas) si hay éxito
    } catch (e) { console.error(e); }
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  const getBadgeStyle = (estado) => {
    const estados = {
      pendiente: "text-amber-400 bg-amber-400/10",
      confirmada: "text-cyan-400 bg-cyan-400/10",
      finalizada: "text-emerald-400 bg-emerald-400/10",
      cancelada: "text-rose-400 bg-rose-400/10"
    };
    return estados[estado?.toLowerCase()] || "text-slate-400 bg-slate-800";
  };

  const LogOutIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
  );

  const isOperacionesActivo = tabActiva === 'agenda' || tabActiva === 'historial';
  const citasOperativas = citas.filter(c => c.estado === 'pendiente' || c.estado === 'confirmada');
  const citasHistorial = citas.filter(c => c.estado === 'finalizada' || c.estado === 'cancelada');

  return (
    <div className="fixed inset-0 z-[100] flex bg-[#060b14] text-slate-300 font-sans animate-fade-in">
      
      {/* ================= BARRA LATERAL ================= */}
      <aside className="w-[280px] bg-[#03070e] flex flex-col justify-between border-r border-slate-800/50">
        <div>
          <div className="h-24 flex items-center justify-center border-b border-slate-800/30">
            <h1 className="text-xl font-black tracking-widest text-white">
              TENRI <span className="text-emerald-400">BARBER</span>
            </h1>
          </div>

          <nav className="p-4 space-y-2 mt-4">
            <div>
              <button onClick={() => setTabActiva('agenda')} className={`w-full text-left px-5 py-3 rounded-lg text-sm font-medium transition-colors ${isOperacionesActivo ? 'bg-[#0f1b29] text-emerald-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'}`}>
                Operaciones
              </button>
              {isOperacionesActivo && (
                <div className="ml-8 border-l border-slate-700/50 pl-4 py-3 mt-1 space-y-3">
                  <p onClick={() => setTabActiva('agenda')} className={`text-sm font-medium cursor-pointer transition-colors ${tabActiva === 'agenda' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}>Agenda General</p>
                  <p onClick={() => setTabActiva('historial')} className={`text-sm font-medium cursor-pointer transition-colors ${tabActiva === 'historial' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}>Historial</p>
                </div>
              )}
            </div>

            <div>
              <button onClick={() => setTabActiva('roles')} className={`w-full text-left px-5 py-3 rounded-lg text-sm font-medium transition-colors ${tabActiva === 'roles' ? 'bg-[#0f1b29] text-emerald-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'}`}>
                Administración
              </button>
              {tabActiva === 'roles' && (
                <div className="ml-8 border-l border-slate-700/50 pl-4 py-3 mt-1 space-y-4">
                  <p className="text-sm font-medium text-slate-400">Gestión de Equipo</p>
                  <p className="text-sm font-medium text-emerald-400 cursor-default">Roles y Permisos</p>
                </div>
              )}
            </div>
          </nav>
        </div>

        <div className="p-5 border-t border-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-[#03070e] font-black text-sm">
              {usuario?.name?.substring(0,2).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white leading-tight">{usuario?.name}</span>
              <span className="text-[11px] text-slate-500 font-medium">Configuración Empresa</span>
            </div>
          </div>
          <button onClick={handleCerrarSesion} className="text-slate-500 hover:text-emerald-400 transition-colors p-2" title="Cerrar Sesión">
            <LogOutIcon />
          </button>
        </div>
      </aside>

      {/* ================= CONTENIDO PRINCIPAL ================= */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        <header className="h-24 px-10 flex items-center justify-between shrink-0">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            {tabActiva === 'agenda' && 'Panel de Control Principal'}
            {tabActiva === 'historial' && 'Registro Histórico'}
            {tabActiva === 'roles' && 'Gestión de Equipo'}
          </h2>
          <button onClick={onVolver} className="px-5 py-2.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg text-sm font-semibold text-slate-300 hover:text-white transition-all shadow-sm">
            Volver al Inicio
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar">
          
          {/* ---------------- VISTA AGENDA Y FINANZAS ---------------- */}
          {tabActiva === 'agenda' && (
            <div className="space-y-8">
              
              {/* === TARJETAS DE MÉTRICAS (NUEVO) === */}
              {finanzas && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                  
                  {/* Tarjeta 1: Total Ingresos */}
                  <div className="bg-[#0B1221] border border-slate-800/60 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors"></div>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Ingresos de Hoy</p>
                    <h3 className="text-3xl font-black text-white relative z-10">
                      ${finanzas.total_ingresos?.toLocaleString('es-CL')}
                    </h3>
                  </div>

                  {/* Tarjeta 2: Cortes Completados */}
                  <div className="bg-[#0B1221] border border-slate-800/60 rounded-2xl p-6 shadow-xl">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Servicios Completados</p>
                    <h3 className="text-3xl font-black text-white">
                      {finanzas.cantidad_cortes} <span className="text-sm font-medium text-slate-500 normal-case tracking-normal">cortes</span>
                    </h3>
                  </div>

                  {/* Tarjeta 3: Rendimiento por Barbero */}
                  <div className="bg-[#0B1221] border border-slate-800/60 rounded-2xl p-6 shadow-xl overflow-y-auto max-h-28 custom-scrollbar">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2 sticky top-0 bg-[#0B1221] z-10 pb-1">Rendimiento por Especialista</p>
                    <div className="space-y-2.5">
                      {Object.keys(finanzas.desglose_barberos || {}).length === 0 ? (
                        <p className="text-slate-500 text-xs italic">Aún no hay ingresos hoy.</p>
                      ) : (
                        Object.entries(finanzas.desglose_barberos).map(([nombre, total]) => (
                          <div key={nombre} className="flex justify-between items-center text-sm border-b border-slate-800/50 pb-2 last:border-0 last:pb-0">
                            <span className="text-slate-300 font-medium">{nombre}</span>
                            <span className="text-emerald-400 font-bold">${total.toLocaleString('es-CL')}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* === TABLA DE AGENDA === */}
              <div className="bg-[#0B1221] border border-slate-800/60 rounded-2xl overflow-hidden shadow-xl animate-fade-in">
                <div className="px-8 py-5 border-b border-slate-800/60 flex justify-between items-center bg-[#080d18]">
                  <h3 className="text-slate-300 font-semibold text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    Próximos Turnos y Solicitudes
                  </h3>
                </div>
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[#080d18] border-b border-slate-800/60">
                    <tr>
                      <th className="px-8 py-4 text-slate-400 font-semibold tracking-wide">Fecha / Hora</th>
                      <th className="px-8 py-4 text-slate-400 font-semibold tracking-wide">Cliente</th>
                      <th className="px-8 py-4 text-slate-400 font-semibold tracking-wide">Especialista</th>
                      <th className="px-8 py-4 text-slate-400 font-semibold tracking-wide text-center">Estado</th>
                      <th className="px-8 py-4 text-slate-400 font-semibold tracking-wide text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {citasOperativas.length === 0 ? (
                      <tr><td colSpan="5" className="text-center py-16 text-slate-500">No existen solicitudes pendientes ni citas confirmadas próximas.</td></tr>
                    ) : citasOperativas.map(cita => (
                      <tr key={cita.id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="px-8 py-5"><span className="font-bold text-slate-200">{cita.fecha}</span><span className="text-slate-500 ml-4 font-mono text-xs">{cita.hora}</span></td>
                        <td className="px-8 py-5 text-slate-300 font-medium">{cita.cliente?.name || 'Usuario Eliminado'}</td>
                        <td className="px-8 py-5 text-slate-400">{cita.barbero?.name || 'No asignado'}</td>
                        <td className="px-8 py-5 text-center"><span className={`px-2.5 py-1 rounded border text-[10px] font-bold uppercase tracking-wider ${getBadgeStyle(cita.estado)}`}>{cita.estado}</span></td>
                        <td className="px-8 py-5 text-right">
                          {cita.estado === 'pendiente' ? (
                            <div className="flex gap-3 justify-end">
                              <button onClick={() => handleActualizarEstado(cita.id, 'confirmada')} className="text-emerald-500 hover:text-emerald-400 font-semibold text-xs uppercase tracking-wide transition-colors">Confirmar</button>
                              <span className="text-slate-700">|</span>
                              <button onClick={() => handleActualizarEstado(cita.id, 'cancelada')} className="text-rose-500 hover:text-rose-400 font-semibold text-xs uppercase tracking-wide transition-colors">Cancelar</button>
                            </div>
                          ) : <span className="text-slate-600 text-xs">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ---------------- VISTA HISTORIAL ---------------- */}
          {tabActiva === 'historial' && (
            <div className="bg-[#0B1221] border border-slate-800/60 rounded-2xl overflow-hidden shadow-xl animate-fade-in opacity-90">
              <div className="px-8 py-5 border-b border-slate-800/60 flex justify-between items-center bg-[#080d18]">
                <h3 className="text-slate-400 font-semibold text-sm">Registro de Auditoría</h3>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest border border-slate-700/50 bg-slate-800/30 px-3 py-1 rounded-md">Solo Lectura</span>
              </div>
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#080d18] border-b border-slate-800/60">
                  <tr>
                    <th className="px-8 py-4 text-slate-500 font-semibold tracking-wide">ID Res.</th>
                    <th className="px-8 py-4 text-slate-500 font-semibold tracking-wide">Fecha / Hora</th>
                    <th className="px-8 py-4 text-slate-500 font-semibold tracking-wide">Cliente</th>
                    <th className="px-8 py-4 text-slate-500 font-semibold tracking-wide">Especialista</th>
                    <th className="px-8 py-4 text-slate-500 font-semibold tracking-wide text-right">Estado Final</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {citasHistorial.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-16 text-slate-500 italic">El historial está vacío.</td></tr>
                  ) : citasHistorial.map(cita => (
                    <tr key={cita.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-8 py-4 text-slate-600 font-mono text-xs">#{cita.id.toString().padStart(4, '0')}</td>
                      <td className="px-8 py-4"><span className="text-slate-400">{cita.fecha}</span><span className="text-slate-500 ml-3 text-xs">{cita.hora}</span></td>
                      <td className="px-8 py-4 text-slate-400">{cita.cliente?.name || '-'}</td>
                      <td className="px-8 py-4 text-slate-400">{cita.barbero?.name || '-'}</td>
                      <td className="px-8 py-4 text-right">
                        <span className={`px-2.5 py-1 rounded border text-[10px] font-bold uppercase tracking-wider ${getBadgeStyle(cita.estado)}`}>
                          {cita.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ---------------- VISTA EQUIPO ---------------- */}
          {tabActiva === 'roles' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
              <div className="lg:col-span-4 bg-[#0B1221] border border-slate-800/60 rounded-2xl p-8 h-fit shadow-xl">
                <h3 className="text-lg font-bold text-white mb-6">
                  {editandoId ? 'Editar Especialista' : 'Promover a Especialista'}
                </h3>
                <form onSubmit={handleGuardarBarbero} className="space-y-6">
                  {editandoId && (
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Nombre Completo</label>
                      <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full bg-[#03070e] border border-slate-800 rounded-lg p-3.5 text-sm text-slate-200 outline-none focus:border-emerald-500/50 transition-colors" required />
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Correo del Usuario</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#03070e] border border-slate-800 rounded-lg p-3.5 text-sm text-slate-200 outline-none focus:border-emerald-500/50 transition-colors" required />
                  </div>
                  <div className="pt-2 flex flex-col gap-3">
                    <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#03070e] font-bold py-3.5 rounded-lg transition-colors">
                      {editandoId ? 'Guardar Cambios' : 'Asignar Rol'}
                    </button>
                    {editandoId && (
                      <button type="button" onClick={cancelarEdicion} className="w-full text-slate-400 hover:text-white text-sm font-medium py-2 transition-colors">Cancelar Edición</button>
                    )}
                  </div>
                </form>
              </div>

              <div className="lg:col-span-8 bg-[#0B1221] border border-slate-800/60 rounded-2xl shadow-xl overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-800/60">
                  <h3 className="text-lg font-bold text-white">Especialistas Activos</h3>
                </div>
                <div className="divide-y divide-slate-800/40">
                  {barberos.length === 0 ? (
                    <div className="text-center py-16 text-slate-500 italic">No hay especialistas en el directorio.</div>
                  ) : barberos.map(b => (
                    <div key={b.id} className="flex items-center justify-between px-8 py-5 hover:bg-slate-800/20 transition-colors group">
                      <div className="flex items-center gap-5">
                        <div className="w-10 h-10 rounded-full bg-[#03070e] border border-slate-700/50 flex items-center justify-center font-bold text-slate-300 text-sm">
                          {b.name.substring(0,1).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-slate-200 font-semibold">{b.name}</p>
                          <p className="text-sm text-slate-500">{b.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => prepararEdicion(b)} className="text-emerald-500 hover:text-emerald-400 text-xs font-bold uppercase tracking-wider">Editar</button>
                        <span className="text-slate-700">|</span>
                        <button onClick={() => handleEliminarBarbero(b.id)} className="text-rose-500 hover:text-rose-400 text-xs font-bold uppercase tracking-wider">Remover</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}