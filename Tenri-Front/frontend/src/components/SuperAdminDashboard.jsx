import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function SuperAdminDashboard({ usuario, onVolver }) {
  const [barberias, setBarberias] = useState([]);
  const [cargandoForm, setCargandoForm] = useState(false);

  // Estado para el formulario de creación (Ahora incluye logo_archivo)
  const [form, setForm] = useState({
    nombre_barberia: "",
    color_principal: "#10b981",
    logo_archivo: null,
    admin_nombre: "",
    admin_email: "",
    admin_password: "",
  });

  useEffect(() => {
    cargarBarberias();
  }, []);

  const cargarBarberias = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/barberias");
      if (res.ok) setBarberias(await res.json());
    } catch (e) {
      console.error(e);
      toast.error("Error al cargar la lista de negocios");
    }
  };

  const handleCrearNegocio = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    setCargandoForm(true);

    // Como enviamos una imagen, usamos FormData en lugar de JSON
    const formData = new FormData();
    formData.append("nombre_barberia", form.nombre_barberia);
    formData.append("color_principal", form.color_principal);
    
    if (form.logo_archivo) {
      formData.append("logo", form.logo_archivo);
    }

    formData.append("admin_nombre", form.admin_nombre);
    formData.append("admin_email", form.admin_email);
    formData.append("admin_password", form.admin_password);

    try {
      const resp = await fetch("http://127.0.0.1:8000/api/barberias", {
        method: "POST",
        headers: {
          // OJO: No enviamos 'Content-Type' aquí, el navegador lo pone solo al usar FormData
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (resp.ok) {
        toast.success("¡Negocio y administrador creados con éxito!");
        // Limpiamos el formulario
        setForm({
          nombre_barberia: "",
          color_principal: "#10b981",
          logo_archivo: null,
          admin_nombre: "",
          admin_email: "",
          admin_password: "",
        });
        // IMPORTANTE: Resetear el input file manualmente
        document.getElementById("input-logo").value = ""; 
        
        await cargarBarberias();
      } else {
        const errorData = await resp.json();
        console.error(errorData);
        toast.error(errorData.message || "Error al crear el negocio. Revisa los datos.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error de conexión con el servidor");
    } finally {
      setCargandoForm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex bg-[#060b14] text-slate-300 font-sans animate-fade-in overflow-hidden">
      
      {/* SIDEBAR EXCLUSIVO SUPER ADMIN */}
      <aside className="w-[280px] bg-[#03070e] flex flex-col justify-between border-r border-amber-900/30">
        <div>
          <div className="h-24 flex items-center justify-center border-b border-amber-900/30 font-black text-xl text-white tracking-widest">
            TENRI <span className="text-amber-500 ml-2">MASTER</span>
          </div>
          <nav className="p-4 mt-4 text-sm font-medium">
            <button className="w-full text-left px-5 py-3 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
              👑 Red de Negocios
            </button>
          </nav>
        </div>

        <div className="p-5 border-t border-amber-900/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-[#03070e] font-black text-xs shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              {usuario?.name?.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white leading-tight">
                {usuario?.name}
              </span>
              <span className="text-[10px] text-amber-500 uppercase tracking-wider font-bold">Dueño del Sistema</span>
            </div>
          </div>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-900/10 via-[#060b14] to-[#060b14]">
        <header className="h-24 px-10 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Gestión de Inquilinos (SaaS)</h2>
            <p className="text-slate-500 text-sm mt-1">Administra los negocios suscritos a TENRI SPA</p>
          </div>
          <button
            onClick={onVolver}
            className="px-5 py-2.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg text-sm font-semibold transition-all"
          >
            Volver a la Tienda
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* FORMULARIO DE CREACIÓN */}
            <div className="lg:col-span-4 bg-[#0B1221] border border-amber-900/30 rounded-2xl p-8 h-fit shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-400"></div>
              
              <h3 className="text-xl font-bold text-white mb-6">Nuevo Negocio</h3>
              
              <form onSubmit={handleCrearNegocio} className="space-y-6">
                
                {/* DATOS DE LA EMPRESA */}
                <div className="space-y-4 p-5 bg-[#080d18] rounded-xl border border-slate-800/60">
                  <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                    Datos de la Empresa
                  </h4>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Nombre Comercial</label>
                    <input
                      type="text"
                      value={form.nombre_barberia}
                      onChange={(e) => setForm({ ...form, nombre_barberia: e.target.value })}
                      className="w-full bg-[#03070e] border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 outline-none focus:border-amber-500/50"
                      placeholder="Ej: Barbería VIP"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Color de Marca (HEX)</label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        value={form.color_principal}
                        onChange={(e) => setForm({ ...form, color_principal: e.target.value })}
                        className="w-10 h-10 rounded cursor-pointer bg-[#03070e] border border-slate-800 p-0.5"
                      />
                      <input
                        type="text"
                        value={form.color_principal}
                        onChange={(e) => setForm({ ...form, color_principal: e.target.value })}
                        className="flex-1 bg-[#03070e] border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 outline-none uppercase font-mono"
                        required
                      />
                    </div>
                  </div>
                  {/* NUEVO INPUT DE LOGO */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Logo de la Barbería (Opcional)</label>
                    <input
                      id="input-logo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setForm({ ...form, logo_archivo: e.target.files[0] })}
                      className="w-full bg-[#03070e] border border-slate-800 rounded-lg p-2 text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-amber-500/10 file:text-amber-500 hover:file:bg-amber-500/20 cursor-pointer"
                    />
                  </div>
                </div>

                {/* DATOS DEL ADMINISTRADOR */}
                <div className="space-y-4 p-5 bg-[#080d18] rounded-xl border border-slate-800/60">
                  <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    Dueño / Administrador
                  </h4>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Nombre Completo</label>
                    <input
                      type="text"
                      value={form.admin_nombre}
                      onChange={(e) => setForm({ ...form, admin_nombre: e.target.value })}
                      className="w-full bg-[#03070e] border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 outline-none focus:border-amber-500/50"
                      placeholder="Ej: Juan Pérez"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Correo Electrónico (Login)</label>
                    <input
                      type="email"
                      value={form.admin_email}
                      onChange={(e) => setForm({ ...form, admin_email: e.target.value })}
                      className="w-full bg-[#03070e] border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 outline-none focus:border-amber-500/50"
                      placeholder="juan@negocio.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Contraseña Temporal</label>
                    <input
                      type="text"
                      value={form.admin_password}
                      onChange={(e) => setForm({ ...form, admin_password: e.target.value })}
                      className="w-full bg-[#03070e] border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 outline-none focus:border-amber-500/50"
                      placeholder="Min. 6 caracteres"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={cargandoForm}
                  className={`w-full py-3.5 rounded-xl font-bold text-[#03070e] transition-all shadow-lg ${
                    cargandoForm ? "bg-amber-600/50 cursor-not-allowed" : "bg-gradient-to-r from-amber-500 to-orange-400 hover:from-amber-400 hover:to-orange-300 shadow-amber-500/20 hover:-translate-y-0.5"
                  }`}
                >
                  {cargandoForm ? "Creando Infraestructura..." : "Crear Empresa y Administrador"}
                </button>
              </form>
            </div>

            {/* LISTA DE BARBERÍAS */}
            <div className="lg:col-span-8 bg-[#0B1221] border border-slate-800/60 rounded-2xl shadow-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#080d18] border-b border-slate-800/60 text-slate-400 font-semibold uppercase text-[10px] tracking-widest">
                  <tr>
                    <th className="px-8 py-5">ID</th>
                    <th className="px-8 py-5">Empresa</th>
                    <th className="px-8 py-5">Identificador (Slug)</th>
                    <th className="px-8 py-5 text-right">Color</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {barberias.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-8 py-5 text-slate-500 font-mono text-xs">
                        #{b.id}
                      </td>
                      <td className="px-8 py-5 flex items-center gap-4">
                        {/* CONDICIONAL: SI TIENE LOGO LO MUESTRA, SINO LA INICIAL */}
                        {b.logo_url ? (
                          <img 
                            src={b.logo_url} 
                            alt={`Logo ${b.nombre}`} 
                            className="w-10 h-10 rounded-lg object-cover border border-slate-700/50 bg-[#03070e]" 
                          />
                        ) : (
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs border border-slate-700/50"
                            style={{ backgroundColor: b.color_principal || '#10b981' }}
                          >
                            {b.nombre.substring(0, 1).toUpperCase()}
                          </div>
                        )}
                        <span className="text-slate-200 font-bold">{b.nombre}</span>
                      </td>
                      <td className="px-8 py-5 text-slate-400 font-mono text-xs">
                        /{b.slug}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span 
                          className="inline-block px-2 py-1 rounded text-xs font-mono"
                          style={{ backgroundColor: `${b.color_principal}20`, color: b.color_principal }}
                        >
                          {b.color_principal}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {barberias.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-8 py-10 text-center text-slate-500">
                        No hay empresas registradas aún.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}