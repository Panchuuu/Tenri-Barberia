import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import apiFetch from "../utils/api";

const formatearCLP = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
});

export default function SuperAdminDashboard({ usuario, onVolver }) {
  // ==========================================
  // ESTADOS GENERALES Y NAVEGACIÓN
  // ==========================================
  const [barberias, setBarberias] = useState([]);
  
  // 👇 NUEVO: Estado para guardar las matemáticas del backend
  const [metricas, setMetricas] = useState(null); 

  const [cargandoLista, setCargandoLista] = useState(true);
  const [cargandoForm, setCargandoForm] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  
  const [tabActiva, setTabActiva] = useState("directorio"); 
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Estados del Formulario
  const [previewLogo, setPreviewLogo] = useState(null);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    nombre_barberia: "",
    color_principal: "#10b981",
    logo_archivo: null,
    admin_nombre: "",
    admin_email: "",
    admin_password: "",
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  // 👇 MEJORA: Función de carga con mejor manejo de errores de servidor
  const cargarDatos = async () => {
    setCargandoLista(true); // Mostramos el estado de carga
    try {
      // Hacemos ambas peticiones al mismo tiempo para que sea más rápido
      const [resBarberias, resMetricas] = await Promise.all([
        apiFetch("/barberias"),
        apiFetch("/superadmin/metricas") // Endpoint que creamos en el backend
      ]);

      // Si las barberías cargaron bien, las guardamos
      if (resBarberias.ok) { 
        const datos = await resBarberias.json();
        setBarberias(datos.data || datos);
      } else {
        // 👇 MEJORA: Si hay error 500, intentamos leer qué dice el backend
        const errorText = await resBarberias.text();
        console.error("Error del backend en /barberias:", errorText);
      }

      // Si las métricas cargaron bien, las guardamos
      if (resMetricas.ok) {
        setMetricas(await resMetricas.json());
      } else {
        // 👇 MEJORA: Imprimimos en consola el error exacto del servidor para poder debuggear
        const errorText = await resMetricas.text();
        console.error("Error del backend en /metricas:", errorText);
        toast.error("El backend falló al cargar las métricas (Error 500)");
      }
    } catch (e) {
      console.error("Error de red o caída del servidor:", e);
      toast.error("Error crítico al contactar al servidor");
    } finally {
      setCargandoLista(false); // Apagamos el estado de carga
    }
  };

  // 👇 MEJORA: Manejo de errores detallado al cambiar de estado
  const handleToggleSuscripcion = async (id, estadoActual) => {
    // Si estaba activa, la suspendemos. Si estaba suspendida, la activamos.
    const nuevoEstado = estadoActual === 'activa' ? 'suspendida' : 'activa';
    
    try {
      // Hacemos la petición PATCH a nuestro backend
      const res = await apiFetch(`/barberias/${id}/estado`, {
        method: 'PATCH',
        body: JSON.stringify({ estado_suscripcion: nuevoEstado })
      });
      
      if (res.ok) {
        toast.success(`Empresa marcada como ${nuevoEstado} exitosamente.`);
        // Recargamos todo para que los gráficos y tablas se actualicen
        await cargarDatos(); 
      } else {
        // 👇 MEJORA: Si el backend responde con error (como un 500), leemos el mensaje de la falla
        const errorText = await res.text();
        console.error(`Error 500 al cambiar estado de barbería ${id}:`, errorText);
        toast.error("Error en el servidor al cambiar el estado. Revisa la consola.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error de conexión al intentar suspender.");
    }
  };

  const handleImagenChange = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      setForm({ ...form, logo_archivo: archivo });
      setPreviewLogo(URL.createObjectURL(archivo));
    }
  };

  const handleCrearNegocio = async (e) => {
    e.preventDefault();
    setCargandoForm(true);

    const formData = new FormData();
    formData.append("nombre_barberia", form.nombre_barberia);
    formData.append("color_principal", form.color_principal);
    if (form.logo_archivo) formData.append("logo", form.logo_archivo);
    formData.append("admin_nombre", form.admin_nombre);
    formData.append("admin_email", form.admin_email);
    formData.append("admin_password", form.admin_password);

    try {
      const resp = await apiFetch("/barberias", {
        method: "POST",
        body: formData,
      });

      if (resp.ok) {
        toast.success("¡Negocio creado con éxito!");
        setForm({
          nombre_barberia: "", color_principal: "#10b981", logo_archivo: null,
          admin_nombre: "", admin_email: "", admin_password: "",
        });
        setPreviewLogo(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        
        await cargarDatos(); // Recargamos la data
      } else {
        const errorData = await resp.json();
        toast.error(errorData.message || "Error al crear el negocio.");
      }
    } catch (e) {
      toast.error("Error de conexión con el servidor");
    } finally {
      setCargandoForm(false);
    }
  };

  const barberiasFiltradas = barberias.filter(b => 
    b.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || 
    b.slug?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex bg-[#060b14] text-slate-300 font-sans animate-fade-in overflow-hidden h-[100dvh]">
      
      {menuAbierto && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMenuAbierto(false)}
        ></div>
      )}

      {/* ======================================= */}
      {/* SIDEBAR */}
      {/* ======================================= */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-[#03070e] flex flex-col justify-between border-r border-amber-900/30 transform transition-transform duration-300 ease-in-out ${menuAbierto ? "translate-x-0 shadow-2xl" : "-translate-x-full"} lg:relative lg:translate-x-0`}>
        <div>
          <div className="h-20 lg:h-24 flex items-center justify-center border-b border-amber-900/30 font-black text-xl text-white tracking-widest relative">
            TENRI <span className="text-amber-500 ml-2">MASTER</span>
            <button onClick={() => setMenuAbierto(false)} className="absolute right-4 text-slate-500 hover:text-white lg:hidden">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <nav className="p-4 mt-4 text-sm font-medium space-y-2">
            <button onClick={() => { setTabActiva("directorio"); setMenuAbierto(false); }} className={`w-full text-left px-5 py-3 rounded-lg transition-all ${tabActiva === "directorio" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm shadow-amber-500/5" : "text-slate-400 hover:bg-slate-800/50"}`}>🏢 Directorio SaaS</button>
            <button onClick={() => { setTabActiva("metricas"); setMenuAbierto(false); }} className={`w-full text-left px-5 py-3 rounded-lg transition-all ${tabActiva === "metricas" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm shadow-amber-500/5" : "text-slate-400 hover:bg-slate-800/50"}`}>📊 Métricas Globales</button>
            <button onClick={() => { setTabActiva("suscripciones"); setMenuAbierto(false); }} className={`w-full text-left px-5 py-3 rounded-lg transition-all ${tabActiva === "suscripciones" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm shadow-amber-500/5" : "text-slate-400 hover:bg-slate-800/50"}`}>💳 Suscripciones</button>
          </nav>
        </div>

        <div className="p-5 border-t border-amber-900/30 flex items-center justify-between bg-[#050a12]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-[#03070e] font-black text-xs shadow-[0_0_15px_rgba(245,158,11,0.3)] shrink-0">
              {usuario?.name?.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-white leading-tight truncate">{usuario?.name}</span>
              <span className="text-[10px] text-amber-500 uppercase tracking-wider font-bold">Dueño del Sistema</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ======================================= */}
      {/* CONTENIDO PRINCIPAL */}
      {/* ======================================= */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-900/10 via-[#060b14] to-[#060b14]">
        <header className="h-20 lg:h-24 px-4 lg:px-10 flex items-center justify-between shrink-0 border-b border-amber-900/10 lg:border-none">
          <div className="flex items-center gap-4">
            <button onClick={() => setMenuAbierto(true)} className="p-2 text-slate-300 hover:text-white lg:hidden bg-slate-800/50 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div>
              <h2 className="text-xl lg:text-3xl font-black text-white tracking-tight">
                {tabActiva === "directorio" && "Directorio SaaS"}
                {tabActiva === "metricas" && "Dashboard Global"}
                {tabActiva === "suscripciones" && "Control de Pagos"}
              </h2>
              <p className="hidden md:block text-slate-500 text-sm mt-1">Administración central de TENRI SPA</p>
            </div>
          </div>
          <button onClick={onVolver} className="px-4 py-2 lg:px-5 lg:py-2.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 rounded-lg text-xs lg:text-sm font-semibold transition-all shadow-sm shrink-0">
            <span className="hidden sm:inline">Volver a la Tienda</span>
            <span className="sm:hidden">Volver</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:px-10 lg:pb-10 custom-scrollbar">
          
          {/* ======================================= */}
          {/* MÓDULO 1: DIRECTORIO Y CREACIÓN */}
          {/* ======================================= */}
          {tabActiva === "directorio" && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 animate-fade-in">
              {/* Formulario de Creación */}
              <div className="xl:col-span-4 bg-[#0B1221] border border-amber-900/30 rounded-2xl p-6 lg:p-8 h-fit shadow-2xl relative overflow-hidden order-2 xl:order-1">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-400"></div>
                <h3 className="text-lg lg:text-xl font-bold text-white mb-6">Nuevo Negocio</h3>
                
                <form onSubmit={handleCrearNegocio} className="space-y-6">
                  <div className="space-y-4 p-4 lg:p-5 bg-[#080d18] rounded-xl border border-slate-800/60">
                    <h4 className="text-[10px] lg:text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">Datos de la Empresa</h4>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 mb-1 block">Nombre Comercial</label>
                      <input type="text" value={form.nombre_barberia} onChange={(e) => setForm({ ...form, nombre_barberia: e.target.value })} className="w-full bg-[#03070e] border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 outline-none focus:border-amber-500/50" required />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 mb-1 block">Color de Marca</label>
                      <div className="flex gap-3 items-center">
                        <input type="color" value={form.color_principal} onChange={(e) => setForm({ ...form, color_principal: e.target.value })} className="w-10 h-10 rounded cursor-pointer bg-[#03070e] border border-slate-800 p-0.5 shrink-0" />
                        <input type="text" value={form.color_principal} onChange={(e) => setForm({ ...form, color_principal: e.target.value })} className="flex-1 min-w-0 bg-[#03070e] border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 outline-none uppercase font-mono" required />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 mb-1 block">Logo (Opcional)</label>
                      <div className="flex items-center gap-4 mt-2">
                        {previewLogo ? (
                          <img src={previewLogo} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-amber-500/50 shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-[#03070e] border border-slate-800 flex items-center justify-center text-slate-600 text-[10px] shrink-0">IMG</div>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImagenChange} className="flex-1 w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:font-bold file:bg-amber-500/10 file:text-amber-500" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 p-4 lg:p-5 bg-[#080d18] rounded-xl border border-slate-800/60">
                    <h4 className="text-[10px] lg:text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">Administrador</h4>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 mb-1 block">Nombre</label>
                      <input type="text" value={form.admin_nombre} onChange={(e) => setForm({ ...form, admin_nombre: e.target.value })} className="w-full bg-[#03070e] border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 outline-none focus:border-amber-500/50" required />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 mb-1 block">Correo</label>
                      <input type="email" value={form.admin_email} onChange={(e) => setForm({ ...form, admin_email: e.target.value })} className="w-full bg-[#03070e] border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 outline-none focus:border-amber-500/50" required />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 mb-1 block">Clave (Min 6)</label>
                      <input type="text" value={form.admin_password} onChange={(e) => setForm({ ...form, admin_password: e.target.value })} className="w-full bg-[#03070e] border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 outline-none focus:border-amber-500/50" required minLength={6} />
                    </div>
                  </div>

                  <button type="submit" disabled={cargandoForm} className={`w-full py-3.5 rounded-xl font-bold text-[#03070e] shadow-lg text-sm lg:text-base ${cargandoForm ? "bg-amber-600/50 cursor-not-allowed text-amber-900" : "bg-gradient-to-r from-amber-500 to-orange-400 hover:-translate-y-0.5"}`}>
                    {cargandoForm ? "Creando..." : "Crear Empresa"}
                  </button>
                </form>
              </div>

              {/* Lista de Barberías */}
              <div className="xl:col-span-8 bg-[#0B1221] border border-slate-800/60 rounded-2xl shadow-xl overflow-hidden h-fit flex flex-col order-1 xl:order-2">
                <div className="bg-[#080d18] border-b border-slate-800/60 p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shrink-0">
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider pl-2 border-l-2 border-amber-500">Empresas</h3>
                  <input type="text" placeholder="Buscar por nombre o slug..." className="bg-[#03070e] border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200 outline-none focus:border-amber-500/50 w-full sm:w-64" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm min-w-[600px]">
                    <thead className="bg-[#080d18]/50 border-b border-slate-800/60 text-slate-400 font-semibold uppercase text-[10px] tracking-widest">
                      <tr>
                        <th className="px-6 py-4">Empresa</th>
                        <th className="px-6 py-4">Slug</th>
                        <th className="px-6 py-4 text-right">Marca</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {cargandoLista ? (
                        <tr><td colSpan="3" className="px-6 py-12 text-center text-amber-500 animate-pulse">Cargando...</td></tr>
                      ) : barberiasFiltradas.length === 0 ? (
                        <tr><td colSpan="3" className="px-6 py-12 text-center text-slate-500">No hay empresas.</td></tr>
                      ) : (
                        barberiasFiltradas.map((b) => (
                          <tr key={b.id} className="hover:bg-slate-800/20">
                            <td className="px-6 py-4 flex items-center gap-3">
                              {b.logo_url ? (
                                <img src={b.logo_url} alt="Logo" className="w-8 h-8 rounded-lg object-cover border border-slate-700/50 shrink-0" />
                              ) : (
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs border border-slate-700/50 shrink-0" style={{ backgroundColor: b.color_principal || '#10b981' }}>{b.nombre.substring(0, 1).toUpperCase()}</div>
                              )}
                              <div className="flex flex-col">
                                <span className="text-slate-200 font-bold">{b.nombre}</span>
                                <span className="text-slate-500 font-mono text-[10px]">ID: #{b.id}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-slate-400 font-mono text-xs bg-[#03070e] px-2 py-1 rounded border border-slate-800/50">/{b.slug}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="inline-block px-2 py-1 rounded text-[10px] font-mono font-bold" style={{ backgroundColor: `${b.color_principal}15`, color: b.color_principal }}>
                                {b.color_principal}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* MÓDULO 2: MÉTRICAS GLOBALES (CONECTADAS) */}
          {/* ======================================= */}
          {tabActiva === "metricas" && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Tarjeta 1: Total Empresas */}
                <div className="bg-[#0B1221] border border-slate-800/60 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 text-amber-500">
                    <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2zm0 3.8L18.2 19H5.8L12 5.8z"/></svg>
                  </div>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Total Inquilinos</p>
                  {/* Datos reales desde el backend 👇 */}
                  <h3 className="text-4xl font-black text-white">{metricas?.total_inquilinos || 0}</h3>
                  <p className="text-emerald-500 text-xs mt-2 font-medium">↑ +{metricas?.nuevas_este_mes || 0} este mes</p>
                </div>
                
                {/* Tarjeta 2: Ingresos Estimados */}
                <div className="bg-[#0B1221] border border-slate-800/60 rounded-2xl p-6 shadow-xl">
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Ingresos Estimados (SaaS)</p>
                  {/* Dinero real formateado 👇 */}
                  <h3 className="text-4xl font-black text-emerald-400">{formatearCLP.format(metricas?.ingresos_estimados || 0)}</h3>
                  <p className="text-slate-400 text-xs mt-2 font-medium">Empresas activas: {metricas?.inquilinos_activos || 0}</p>
                </div>
                
                {/* Tarjeta 3: Salud de la Red */}
                <div className="bg-[#0B1221] border border-slate-800/60 rounded-2xl p-6 shadow-xl sm:col-span-2 lg:col-span-1">
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Estado de Red</p>
                  <div className="flex items-center gap-3 mt-4">
                    {/* Condicional para el color del pulso: Verde si es 100%, Amarillo si hay suspendidos */}
                    <div className={`w-3 h-3 rounded-full animate-pulse ${metricas?.porcentaje_operativo === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                    <span className={`${metricas?.porcentaje_operativo === 100 ? 'text-emerald-400' : 'text-amber-400'} font-bold text-sm`}>
                      Sistemas Operativos ({metricas?.porcentaje_operativo || 0}%)
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[#0B1221] border border-slate-800/60 rounded-2xl p-8 shadow-xl text-center">
                 <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800/50 mb-4 text-amber-500">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                 </div>
                 <h3 className="text-xl font-bold text-white mb-2">Módulo de Gráficos en Construcción</h3>
                 <p className="text-slate-400 text-sm max-w-md mx-auto">Próximamente podrás ver un gráfico detallado del crecimiento de citas y registros en toda la plataforma TENRI SPA.</p>
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* MÓDULO 3: SUSCRIPCIONES (CONECTADAS) */}
          {/* ======================================= */}
          {tabActiva === "suscripciones" && (
            <div className="bg-[#0B1221] border border-slate-800/60 rounded-2xl shadow-xl overflow-hidden animate-fade-in">
              <div className="p-6 border-b border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Estado de Cuenta de Inquilinos</h3>
                  <p className="text-sm text-slate-500">Administra quién puede acceder al sistema y quién tiene pagos pendientes.</p>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[700px]">
                  <thead className="bg-[#080d18]/50 border-b border-slate-800/60 text-slate-400 font-semibold uppercase text-[10px] tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Empresa</th>
                      <th className="px-6 py-4">Plan Actual</th>
                      <th className="px-6 py-4 text-center">Estado</th>
                      <th className="px-6 py-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {barberias.map((b) => {
                      // Comprobamos el estado que viene de la base de datos (por defecto 'activa')
                      const estaActiva = (b.estado_suscripcion || 'activa') === 'activa';
                      
                      return (
                        <tr key={b.id} className="hover:bg-slate-800/20">
                          <td className="px-6 py-4 font-bold text-slate-200">{b.nombre}</td>
                          <td className="px-6 py-4">
                            {/* Ahora mostramos el plan real de la DB 👇 */}
                            <span className="text-amber-500 font-mono text-xs font-bold bg-amber-500/10 px-2 py-1 rounded uppercase">
                              {b.plan || 'PRO'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {/* Diseño dinámico del Badge de Estado 👇 */}
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${
                              estaActiva 
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                            }`}>
                              {b.estado_suscripcion || 'activa'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {/* Botón dinámico conectado al backend 👇 */}
                            <button 
                              onClick={() => handleToggleSuscripcion(b.id, b.estado_suscripcion || 'activa')}
                              className={`font-bold text-[10px] uppercase transition-colors border px-3 py-1.5 rounded ${
                                estaActiva 
                                  ? 'text-rose-500 hover:text-rose-400 border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10' 
                                  : 'text-emerald-500 hover:text-emerald-400 border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10'
                              }`}
                            >
                              {estaActiva ? 'Suspender Servicio' : 'Reactivar Servicio'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {barberias.length === 0 && (
                      <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-500">No hay empresas para administrar suscripciones.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}