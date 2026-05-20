import React, { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import SuperAdminDashboard from "./components/SuperAdminDashboard";
import ServiceCard from "./components/ServiceCard";
import BookingModal from "./components/BookingModal";
import MisReservasModal from "./components/MisReservasModal";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import MisReservas from "./components/MisReservas";
import SkeletonCard from "./components/SkeletonCard";
import BarberoDashboard from "./components/BarberoDashboard";
// 👇 Importamos apiFetch para usar la URL centralizada y el token automático
import apiFetch from "./utils/api";

export default function App() {
  // ==========================================
  // 1. ESTADOS DE DATOS Y AUTENTICACIÓN
  // ==========================================
  const [barberias, setBarberias] = useState([]);
  
  const [barberiaSeleccionada, setBarberiaSeleccionada] = useState(null); 
  const [servicios, setServicios] = useState([]);
  
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  
  const barberiasFiltradas = barberias?.filter((b) =>
    b?.nombre?.toLowerCase().includes(busqueda?.toLowerCase() || "")
  ) || [];

  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [mostrarLogin, setMostrarLogin] = useState(false);
  
  const [usuario, setUsuario] = useState(() => {
    const userGuardado = localStorage.getItem("user");
    return userGuardado ? JSON.parse(userGuardado) : null;
  });

  const [vistaActual, setVistaActual] = useState("tienda");
  const [mostrarMisReservas, setMostrarMisReservas] = useState(false);

  // ==========================================
  // 2. LÓGICA DEL MODO LIGHT / DARK
  // ==========================================
  const [temaOscuro, setTemaOscuro] = useState(() => {
    return localStorage.getItem("theme") !== "light";
  });

  useEffect(() => {
    if (temaOscuro) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [temaOscuro]);

  // ==========================================
  // 3. CARGA DE DATOS (BARBERÍAS Y SERVICIOS)
  // ==========================================

  // A. Carga inicial: Trae todas las barberías
  useEffect(() => {
    const obtenerBarberias = async () => {
      setCargando(true);
      try {
        // 👇 Cambiado a apiFetch y corregido para Paginación
        const respuesta = await apiFetch("/barberias");
        if (respuesta.ok) {
          const datos = await respuesta.json();
          // ✅ SOLUCIÓN: Si los datos vienen paginados, usamos .data, si no, el arreglo directo
          setBarberias(datos.data || datos);
        }
      } catch (error) {
        console.error("Error al cargar barberías:", error);
      } finally {
        setCargando(false);
      }
    };

    if (vistaActual === "tienda" && !barberiaSeleccionada) {
      obtenerBarberias();
    }
  }, [vistaActual, barberiaSeleccionada]);

  // B. Cuando el usuario hace clic en una barbería, cargamos SUS servicios
  useEffect(() => {
    const obtenerServicios = async () => {
      if (!barberiaSeleccionada) return;

      setCargando(true);
      try {
        // 👇 Cambiado a apiFetch
        const respuesta = await apiFetch(`/servicios?barberia=${barberiaSeleccionada.slug}`);
        if (respuesta.ok) setServicios(await respuesta.json());
      } catch (error) {
        console.error("Error al cargar servicios:", error);
      } finally {
        setCargando(false);
      }
    };

    obtenerServicios();
  }, [barberiaSeleccionada]);

  // ==========================================
  // 4. LÓGICA DE NAVEGACIÓN Y LOGOUT
  // ==========================================
  
  const handleVolverAlDirectorio = () => {
    setBarberiaSeleccionada(null);
    setServicios([]);
    setBusqueda(""); 
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUsuario(null);
    setVistaActual("tienda");
  };

  // Íconos SVG
  const LogOutIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
  );
  const SunIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  );
  const MoonIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#060b14] dark:text-slate-200 font-sans transition-colors duration-300">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#0B1221",
            color: "#f8fafc",
            border: "1px solid rgba(30, 41, 59, 0.5)",
            fontSize: "14px",
            fontWeight: "500",
          },
          success: { iconTheme: { primary: "#10b981", secondary: "#0B1221" } },
          error: { iconTheme: { primary: "#f43f5e", secondary: "#0B1221" } },
        }}
      />

      {/* VISTAS PRIVADAS */}
      {vistaActual === "superadmin-dashboard" && (
        <SuperAdminDashboard usuario={usuario} onVolver={() => setVistaActual("tienda")} />
      )}
      {vistaActual === "dashboard" && (
        <AdminDashboard usuario={usuario} setUsuario={setUsuario} onVolver={() => setVistaActual("tienda")} />
      )}
      {vistaActual === "barbero-dashboard" && (
        <BarberoDashboard usuario={usuario} onVolver={() => setVistaActual("tienda")} />
      )}
      {vistaActual === "mis-reservas" && (
        <MisReservas usuario={usuario} onVolver={() => setVistaActual("tienda")} />
      )}

      {/* VISTA PÚBLICA */}
      {vistaActual === "tienda" && (
        <div className="animate-fade-in flex flex-col min-h-screen">
          
          <nav className="fixed top-0 w-full z-40 bg-white/80 border-b border-slate-200 dark:bg-[#03070e]/80 dark:border-slate-800/50 backdrop-blur-md transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
              
              <div
                className="font-black text-2xl tracking-widest text-slate-900 dark:text-white flex items-center gap-2 transition-colors cursor-pointer"
                onClick={handleVolverAlDirectorio}
              >
                {barberiaSeleccionada ? (
                  <>
                    <span className="text-emerald-500 mr-2">←</span>
                    {barberiaSeleccionada.nombre}
                  </>
                ) : (
                  <>
                    TENRI{" "}
                    <span className="text-emerald-500 dark:text-emerald-400">BOOKING</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-4">
                <button onClick={() => setTemaOscuro(!temaOscuro)} className="p-2 rounded-full text-slate-500 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors">
                  {temaOscuro ? <SunIcon /> : <MoonIcon />}
                </button>

                <div className="w-px h-6 bg-slate-300 dark:bg-slate-700"></div>

                {usuario ? (
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400 hidden md:block">
                      Hola, <span className="text-slate-900 dark:text-white">{usuario.name}</span>
                    </span>

                    {usuario.rol === "superadmin" && (
                      <button onClick={() => setVistaActual("superadmin-dashboard")} className="px-4 py-2 bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500/20 dark:bg-[#1a1309] dark:hover:bg-[#261c0d] text-sm font-bold rounded-lg transition-all">
                        👑 TENRI MASTER
                      </button>
                    )}
                    {usuario.rol === "admin" && (
                      <button onClick={() => setVistaActual("dashboard")} className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 dark:bg-[#0f1b29] dark:text-emerald-400 dark:border-emerald-500/20 dark:hover:bg-[#152538] text-sm font-bold rounded-lg transition-all">
                        ⚙️ Panel Admin
                      </button>
                    )}
                    {usuario.rol === "barbero" && (
                      <button onClick={() => setVistaActual("barbero-dashboard")} className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 dark:bg-[#0f1b29] dark:text-emerald-400 dark:border-emerald-500/20 dark:hover:bg-[#152538] text-sm font-bold rounded-lg transition-all">
                        📅 Mi Agenda
                      </button>
                    )}
                    {usuario.rol === "cliente" && (
                      <button onClick={() => setVistaActual("mis-reservas")} className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 dark:bg-[#0f1b29] dark:text-emerald-400 dark:border-emerald-500/20 dark:hover:bg-[#152538] text-sm font-bold rounded-lg transition-all shadow-sm">
                        👤 Mis Reservas
                      </button>
                    )}

                    <button onClick={handleLogout} className="ml-2 text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 p-2 transition-colors">
                      <LogOutIcon />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setMostrarLogin(true)} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white dark:text-[#03070e] dark:hover:bg-emerald-400 text-sm font-black rounded-xl transition-all shadow-md">
                    Iniciar Sesión
                  </button>
                )}
              </div>
            </div>
          </nav>

          {!barberiaSeleccionada ? (
            <>
              <header className="max-w-7xl mx-auto px-6 pt-40 pb-20 relative text-center w-full">
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-300/30 dark:bg-emerald-900/20 blur-[120px] pointer-events-none transition-colors duration-500"></div>
                <div className="relative z-10">
                  <span className="inline-block py-1 px-3 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 text-xs font-bold uppercase tracking-[0.2em] mb-6">Plataforma Multi-Negocio</span>
                  <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-6 leading-tight">Encuentra tu estilo, <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500 dark:from-emerald-400 dark:to-cyan-500">Reserva al instante.</span></h1>
                  <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium">Explora nuestra red de barberías y centros de estética premium.</p>
                  <div className="relative max-w-md mx-auto mt-8 z-20">
                    <input type="text" placeholder="Buscar barbería..." className="w-full px-6 py-3.5 rounded-xl bg-white/90 dark:bg-[#0B1221]/90 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm text-slate-900 dark:text-white backdrop-blur-sm" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                  </div>
                </div>
              </header>

              <main className="flex-1 max-w-7xl mx-auto px-6 pb-32 relative z-10 w-full">
                {cargando ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{[1, 2, 3, 4, 5, 6].map((n) => (<SkeletonCard key={n} />))}</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {barberiasFiltradas.map((barberia) => (
                      <div key={barberia.id} onClick={() => setBarberiaSeleccionada(barberia)} className="group bg-white dark:bg-[#0B1221] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-8 hover:border-emerald-500 dark:hover:border-emerald-500/50 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-2xl flex items-center justify-center mb-6 shadow-inner overflow-hidden border border-slate-200 dark:border-slate-800/80 transition-all" style={{ backgroundColor: barberia.logo_url ? "#ffffff" : barberia.color_principal || "#10b981" }}>
                          {barberia.logo_url ? (<img src={barberia.logo_url} alt={barberia.nombre} className="w-full h-full object-cover" />) : (<span className="text-white font-black text-3xl">{barberia.nombre.substring(0, 1).toUpperCase()}</span>)}
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{barberia.nombre}</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium group-hover:text-emerald-500 transition-colors">Ver servicios →</p>
                      </div>
                    ))}
                  </div>
                )}
              </main>
            </>
          ) : (
            <>
              <header className="max-w-7xl mx-auto px-6 pt-40 pb-16 relative text-center w-full">
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700/50" style={{ backgroundColor: barberiaSeleccionada.logo_url ? "#ffffff" : barberiaSeleccionada.color_principal || "#10b981" }}>
                    {barberiaSeleccionada.logo_url ? (<img src={barberiaSeleccionada.logo_url} alt={barberiaSeleccionada.nombre} className="w-full h-full object-cover" />) : (<span className="text-white font-black text-2xl">{barberiaSeleccionada.nombre.substring(0, 1).toUpperCase()}</span>)}
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">{barberiaSeleccionada.nombre}</h1>
                  <p className="text-slate-600 dark:text-slate-400 font-medium">Selecciona un servicio para agendar tu cita.</p>
                </div>
              </header>

              <main className="flex-1 max-w-7xl mx-auto px-6 pb-32 relative z-10 w-full">
                {cargando ? (
                  <div className="flex flex-col items-center justify-center py-20"><div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-500 dark:border-slate-800 rounded-full animate-spin mb-4"></div></div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {servicios.map((servicio) => (<ServiceCard key={servicio.id} servicio={servicio} onAgendar={setServicioSeleccionado} />))}
                  </div>
                )}
              </main>
            </>
          )}

          <footer className="border-t border-slate-200 dark:border-slate-800/50 py-10 text-center bg-white/50 dark:bg-[#03070e]/50 mt-auto transition-colors">
            <p className="text-slate-500 text-sm font-medium">© {new Date().getFullYear()} TENRI SPA. Todos los derechos reservados.</p>
          </footer>
        </div>
      )}

      {servicioSeleccionado && barberiaSeleccionada && (
        <BookingModal servicio={servicioSeleccionado} barberiaSlug={barberiaSeleccionada.slug} onClose={() => setServicioSeleccionado(null)} />
      )}
      
      {mostrarLogin && (
        <Login onClose={() => setMostrarLogin(false)} onLoginSuccess={(user) => { setUsuario(user); setMostrarLogin(false); }} />
      )}
      
      {mostrarMisReservas && (
        <MisReservasModal onClose={() => setMostrarMisReservas(false)} />
      )}
    </div>
  );
}