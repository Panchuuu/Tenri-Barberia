import React, { useState, useEffect } from 'react';
import ServiceCard from './components/ServiceCard';
import BookingModal from './components/BookingModal';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard'; // Importamos el nuevo panel

function App() {
  // Estado para guardar los servicios que vienen de la base de datos
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estado para controlar qué servicio se seleccionó para abrir el modal de agendar
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  
  // Estados para manejar la sesión del usuario (Login)
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [usuario, setUsuario] = useState(() => {
    // Al recargar la página, buscamos si ya había un usuario guardado en la memoria local
    const userGuardado = localStorage.getItem('user');
    return userGuardado ? JSON.parse(userGuardado) : null;
  });

  // NUEVO: Estado para saber si mostramos la 'tienda' (vista normal) o el 'dashboard' (panel de admin)
  const [vistaActual, setVistaActual] = useState('tienda');

  useEffect(() => {
    // Función que pide los servicios a tu API de Laravel en PostgreSQL
    const obtenerServicios = async () => {
      try {
        const respuesta = await fetch('http://127.0.0.1:8000/api/servicios');
        const datos = await respuesta.json();
        setServicios(datos);
      } catch (error) {
        console.error("Error conectando con la API de Laravel:", error);
      } finally {
        setCargando(false);
      }
    };

    obtenerServicios();
  }, []); // Los corchetes vacíos indican que esto solo se ejecuta una vez al cargar la página

  // Función para cerrar la sesión y borrar los datos de la memoria del navegador
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUsuario(null);
    setVistaActual('tienda'); // Por seguridad, si el admin sale, lo devolvemos a la vista de tienda
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 relative">
      
      {/* ================= BARRA SUPERIOR DERECHA (LOGIN / PANEL) ================= */}
      <div className="absolute top-6 right-8 z-10">
        {usuario ? (
          <div className="flex items-center gap-4">
            <span className="text-cyan-400 font-semibold">Hola, {usuario.name}</span>
            
            {/* Si el usuario es administrador y estamos en la tienda, mostramos el botón para ir al Panel */}
            {usuario.rol === 'admin' && vistaActual === 'tienda' && (
              <button 
                onClick={() => setVistaActual('dashboard')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl transition-colors border border-slate-700"
              >
                Panel Admin
              </button>
            )}

            <button 
              onClick={handleLogout} 
              className="text-sm text-slate-400 hover:text-red-400 transition-colors"
            >
              Salir
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setMostrarLogin(true)} 
            className="px-4 py-2 border border-cyan-600 text-cyan-400 hover:bg-cyan-600 hover:text-white rounded-xl font-medium transition-all"
          >
            Iniciar Sesión
          </button>
        )}
      </div>

      {/* ================= RENDERIZADO CONDICIONAL DE LA VISTA ================= */}
      {/* Si 'vistaActual' es 'dashboard', dibujamos el panel de administración. Si no, dibujamos la tienda. */}
      
      {vistaActual === 'dashboard' ? (
        
        // Aquí se muestra el nuevo panel de administrador
        <AdminDashboard 
          usuario={usuario} 
          onVolver={() => setVistaActual('tienda')} 
        />
        
      ) : (
        
        // Aquí se muestra la tienda normal de Atlas Barbería
        <>
          <header className="max-w-6xl mx-auto py-16 px-4 relative">
            {/* Brillo de fondo sutil */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-blue-600/20 blur-[100px] pointer-events-none"></div>
            
            <div className="text-center relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-6">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                Plataforma de Reservas
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6">
                Estilo y cuidado <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  A Tu Medida
                </span>
              </h1>
              
              <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
                Selecciona tu servicio, elige a tu barbero preferido y reserva tu hora en segundos gracias a nuestra nueva infraestructura tecnológica.
              </p>
            </div>
          </header>

          <main className="max-w-6xl mx-auto">
            {cargando ? (
              <div className="text-center text-cyan-500 animate-pulse text-xl">
                Conectando con el servidor...
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
        </>
        
      )}

      {/* ================= MODALES FLOTANTES ================= */}
      {/* Modal para agendar una cita (se abre cuando servicioSeleccionado tiene datos) */}
      <BookingModal 
        servicio={servicioSeleccionado} 
        onClose={() => setServicioSeleccionado(null)} 
      />

      {/* Modal de inicio de sesión (se abre si mostrarLogin es true) */}
      {mostrarLogin && (
        <Login 
          onClose={() => setMostrarLogin(false)}
          onLoginSuccess={(userData) => {
            setUsuario(userData);
            setMostrarLogin(false); // Cerramos el modal apenas entra exitosamente
          }}
        />
      )}
      
    </div>
  );
}

export default App;