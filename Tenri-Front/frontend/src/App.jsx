import React, { useState, useEffect } from 'react';
import ServiceCard from './components/ServiceCard';
import BookingModal from './components/BookingModal';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import MisReservas from './components/MisReservas';
import BarberoDashboard from './components/BarberoDashboard';

export default function App() {
  // ==========================================
  // 1. ESTADOS DE DATOS Y AUTENTICACIÓN
  // ==========================================
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [usuario, setUsuario] = useState(() => {
    const userGuardado = localStorage.getItem('user');
    return userGuardado ? JSON.parse(userGuardado) : null;
  });
  const [vistaActual, setVistaActual] = useState('tienda');

  // ==========================================
  // 2. LÓGICA DEL MODO LIGHT / DARK
  // ==========================================
  // Iniciamos leyendo el localStorage. Si dice 'light', es falso. Si no hay nada, por defecto es true (oscuro).
  const [temaOscuro, setTemaOscuro] = useState(() => {
    return localStorage.getItem('theme') !== 'light';
  });

  // Este useEffect "escucha" cada vez que le das clic al botón de tema.
  // Si temaOscuro es true, le inyecta la clase "dark" a toda la página (al tag <html>).
  useEffect(() => {
    if (temaOscuro) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [temaOscuro]);

  // ==========================================
  // CARGA DE DATOS Y LOGOUT
  // ==========================================
  useEffect(() => {
    const obtenerServicios = async () => {
      try {
        const respuesta = await fetch('http://127.0.0.1:8000/api/servicios');
        if (respuesta.ok) setServicios(await respuesta.json());
      } catch (error) { console.error("Error:", error); } 
      finally { setCargando(false); }
    };
    obtenerServicios();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUsuario(null);
    setVistaActual('tienda');
  };

  // Íconos SVG
  const LogOutIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
  const SunIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>;
  const MoonIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>;

  return (
    // Fíjate aquí: bg-slate-50 es para el modo claro, y dark:bg-[#060b14] se activa solo si está el modo oscuro
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#060b14] dark:text-slate-200 font-sans transition-colors duration-300">
      
      {/* VISTAS PRIVADAS */}
      {vistaActual === 'dashboard' && <AdminDashboard usuario={usuario} onVolver={() => setVistaActual('tienda')} />}
      {vistaActual === 'barbero-dashboard' && <BarberoDashboard usuario={usuario} onVolver={() => setVistaActual('tienda')} />}
      {vistaActual === 'mis-reservas' && <MisReservas usuario={usuario} onVolver={() => setVistaActual('tienda')} />}

      {/* VISTA PÚBLICA (TIENDA) */}
      {vistaActual === 'tienda' && (
        <div className="animate-fade-in flex flex-col min-h-screen">
          
          {/* NAVBAR */}
          <nav className="fixed top-0 w-full z-40 bg-white/80 border-b border-slate-200 dark:bg-[#03070e]/80 dark:border-slate-800/50 backdrop-blur-md transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
              
              <div className="font-black text-2xl tracking-widest text-slate-900 dark:text-white flex items-center gap-2 transition-colors">
                TENRI <span className="text-emerald-500 dark:text-emerald-400">BARBER</span>
              </div>

              <div className="flex items-center gap-4">
                {/* BOTÓN TOGGLE LIGHT/DARK MODE */}
                <button 
                  onClick={() => setTemaOscuro(!temaOscuro)} 
                  className="p-2 rounded-full text-slate-500 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
                  title="Cambiar Tema"
                >
                  {temaOscuro ? <SunIcon /> : <MoonIcon />}
                </button>

                {/* Separador visual */}
                <div className="w-px h-6 bg-slate-300 dark:bg-slate-700"></div>

                {usuario ? (
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400 hidden md:block">
                      Hola, <span className="text-slate-900 dark:text-white">{usuario.name}</span>
                    </span>
                    
                    {usuario.rol === 'admin' && (
                      <button onClick={() => setVistaActual('dashboard')} className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 dark:bg-[#0f1b29] dark:text-emerald-400 dark:border-emerald-500/20 dark:hover:bg-[#152538] text-sm font-bold rounded-lg transition-all">
                        ⚙️ Panel Admin
                      </button>
                    )}
                    {usuario.rol === 'barbero' && (
                      <button onClick={() => setVistaActual('barbero-dashboard')} className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 dark:bg-[#0f1b29] dark:text-emerald-400 dark:border-emerald-500/20 dark:hover:bg-[#152538] text-sm font-bold rounded-lg transition-all">
                        📅 Mi Agenda
                      </button>
                    )}
                    {usuario.rol === 'cliente' && (
                      <button onClick={() => setVistaActual('mis-reservas')} className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 dark:bg-[#0f1b29] dark:text-emerald-400 dark:border-emerald-500/20 dark:hover:bg-[#152538] text-sm font-bold rounded-lg transition-all">
                        👤 Mis Reservas
                      </button>
                    )}

                    <button onClick={handleLogout} className="ml-2 text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 p-2 transition-colors" title="Cerrar Sesión">
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

          {/* CABECERA (HERO SECTION) */}
          <header className="max-w-7xl mx-auto px-6 pt-40 pb-20 relative text-center w-full">
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-300/30 dark:bg-emerald-900/20 blur-[120px] pointer-events-none transition-colors duration-500"></div>
            
            <div className="relative z-10">
              <span className="inline-block py-1 px-3 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 text-xs font-bold uppercase tracking-[0.2em] mb-6 transition-colors">
                Reserva Online 24/7
              </span>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-6 leading-tight transition-colors">
                Eleva tu estilo con <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500 dark:from-emerald-400 dark:to-cyan-500">
                  Profesionales
                </span>
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium transition-colors">
                Elige tu servicio, selecciona a tu especialista de confianza y reserva tu hora en segundos a través de nuestra plataforma.
              </p>
            </div>
          </header>

          {/* CATÁLOGO DE SERVICIOS */}
          <main className="flex-1 max-w-7xl mx-auto px-6 pb-32 relative z-10 w-full">
            {cargando ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-500 dark:border-slate-800 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium tracking-wide">Preparando catálogo...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {servicios.map((servicio) => (
                  <ServiceCard 
                    key={servicio.id} 
                    servicio={servicio} 
                    onAgendar={setServicioSeleccionado} 
                  />
                ))}
              </div>
            )}
          </main>

          {/* FOOTER */}
          <footer className="border-t border-slate-200 dark:border-slate-800/50 py-10 text-center bg-white/50 dark:bg-[#03070e]/50 mt-auto transition-colors">
             <p className="text-slate-500 text-sm font-medium">© {new Date().getFullYear()} TENRI Barber. Desarrollado por Tenri Software.</p>
          </footer>

        </div>
      )}

      {/* MODALES */}
      {servicioSeleccionado && <BookingModal servicio={servicioSeleccionado} onClose={() => setServicioSeleccionado(null)} />}
      {mostrarLogin && <Login onClose={() => setMostrarLogin(false)} onLoginSuccess={(user) => { setUsuario(user); setMostrarLogin(false); }} />}
    </div>
  );
}