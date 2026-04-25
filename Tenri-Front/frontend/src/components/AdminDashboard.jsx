import React, { useState, useEffect } from 'react';

// Recibimos los datos del usuario logueado y una función para volver al inicio
export default function AdminDashboard({ usuario, onVolver }) {
  // Estados para capturar los datos del nuevo barbero
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Estado para guardar la lista de barberos públicos
  const [barberos, setBarberos] = useState([]);
  
  // Estado para guardar la lista de citas (protegido)
  const [citas, setCitas] = useState([]);

  // Carga inicial de datos al abrir el panel
  useEffect(() => {
    // A. Función para pedir barberos (Pública)
    const obtenerBarberos = async () => {
      try {
        const respuesta = await fetch('http://127.0.0.1:8000/api/barberos');
        if (respuesta.ok) {
          const datos = await respuesta.json();
          setBarberos(datos);
        }
      } catch (error) {
        console.error("Error cargando barberos:", error);
      }
    };

    // B. Función para pedir citas (Protegida, requiere Token)
    const obtenerCitas = async () => {
      // Recuperamos tu "llave" del administrador
      const token = localStorage.getItem('token');
      
      try {
        const respuesta = await fetch('http://127.0.0.1:8000/api/citas', {
          headers: {
            // Adjuntamos el Token para demostrar que somos Admin
            'Authorization': `Bearer ${token}`
          }
        });
        if (respuesta.ok) {
          const datos = await respuesta.json();
          setCitas(datos);
        }
      } catch (error) {
        console.error("Error cargando citas:", error);
      }
    };

    // Ejecutamos ambas peticiones
    obtenerBarberos();
    obtenerCitas();
  }, []); // Se ejecuta una sola vez al cargar el componente

  // Función para registrar a un nuevo integrante (Protegido por Token)
  const handleCrearBarbero = async (e) => {
    e.preventDefault(); // Evita recargar la página

    const token = localStorage.getItem('token');
    
    try {
      const respuesta = await fetch('http://127.0.0.1:8000/api/barberos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}` // Autorización obligatoria
        },
        body: JSON.stringify({
          name: nombre,
          email: email,
          password: password // Laravel lo encriptará
        })
      });

      if (respuesta.ok) {
        alert("¡Barbero registrado con éxito en Atlas Barbería!");
        
        // Limpiamos los campos
        setNombre('');
        setEmail('');
        setPassword('');
        
        // NUEVO: Recargamos la lista de barberos para que aparezca el nuevo
        const resBarberos = await fetch('http://127.0.0.1:8000/api/barberos');
        const datosActualizados = await resBarberos.json();
        setBarberos(datosActualizados);

      } else {
        const errorDatos = await respuesta.json();
        alert(errorDatos.message || "Error al crear barbero. Verifica los datos.");
      }
    } catch (error) {
      console.error("Error conectando con el servidor:", error);
    }
  };

  // 🎨 FUNCIÓN UI: Para asignar colores a los badges de estado
  const getBadgeStyle = (estado) => {
    const estados = {
      pendiente: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      confirmada: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      cancelada: "bg-rose-500/10 text-rose-400 border-rose-500/20"
    };
    return estados[estado?.toLowerCase()] || "bg-slate-500/10 text-slate-400 border-slate-500/20";
  };

  return (
    // CONTENEDOR PRINCIPAL: Usamos max-w-6xl y jerarquía visual de Atlas
    <div className="max-w-6xl mx-auto space-y-10 text-slate-200 animate-fade-in py-8">
      
      {/* ===========================================
          🌟 CABECERA CORPORATIVA DE ATLAS
          Inspirada en el header de atlasdigitaltech.cl
          =========================================== */}
      <div className="bg-slate-900 p-10 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        {/* Sutil resplandor de fondo corporativo */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10">
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Atlas Digital Tech
          </h2>
          <p className="text-white text-xl font-bold mt-2">Panel de Administración - Barbería</p>
          <p className="text-slate-400 mt-1 font-medium">Gestiona tu equipo y citas, <span className="text-white font-semibold">{usuario.name}</span></p>
        </div>
        
        {/* BOTÓN VOLVER: Estilo "Cotizar Ahora" o "Ver Proyectos" */}
        <button 
          onClick={onVolver} 
          className="relative z-10 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-cyan-900/30 flex items-center gap-2 group transform active:scale-95"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span> Volver a la Tienda
        </button>
      </div>

      {/* SECCIÓN SUPERIOR: GESTIÓN DE EQUIPO (GRID DE 2 COLUMNAS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* ➖ FORMULARIO (Mantenemos tu lógica funcional) */}
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-lg">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-cyan-400">➕</span> Registrar Nuevo Barbero
          </h3>
          <form onSubmit={handleCrearBarbero} className="space-y-5">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5 font-medium">Nombre Completo</label>
              <input 
                type="text" 
                placeholder="Ej: Nicolás Cisternas"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5 font-medium">Correo Electrónico</label>
              <input 
                type="email" 
                placeholder="admin@atlas.cl"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5 font-medium">Contraseña (Mín. 6 caracteres)</label>
              <input 
                type="password" 
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-cyan-900/30 transform active:scale-95 mt-2"
            >
              Guardar Barbero
            </button>
          </form>
        </div>

        {/* 👥 EQUIPO ACTUAL (Inspirado en tu captura) */}
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-lg flex flex-col">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-cyan-400">👥</span> Equipo Actual
          </h3>
          
          <div className="flex-1 overflow-y-auto space-y-3 h-[300px] pr-2 custom-scrollbar">
            {barberos.length === 0 ? (
              <div className="text-slate-500 italic text-sm text-center py-10 bg-slate-950/70 rounded-xl border border-dashed border-slate-700 h-full flex items-center justify-center">
                Aún no hay barberos registrados.
              </div>
            ) : (
              barberos.map((barbero) => (
                <div key={barbero.id} className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800 transition-colors">
                  <div className="flex items-center gap-3">
                    {/* Ícono circular con degradado cian Atlas */}
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-cyan-500 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-inner">
                      {barbero.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg">{barbero.name}</p>
                      <p className="text-sm text-slate-400">{barbero.email}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-full font-mono border border-slate-700">
                    ID: {barbero.id}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ===========================================
          📅 AGENDA GENERAL: DATA GRID DE LUJO
          Inspirada en los listados corporativos
          =========================================== */}
      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="text-cyan-400">📅</span> Agenda General
        </h3>
        
        {citas.length === 0 ? (
          <div className="text-slate-500 italic text-sm text-center py-12 bg-slate-950 rounded-2xl border border-dashed border-slate-700">
            Aún no hay citas agendadas en el sistema.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-slate-950 text-slate-400 uppercase text-xs font-semibold tracking-wider">
                <tr>
                  <th className="py-4 px-6 border-b border-slate-800">Fecha y Hora</th>
                  <th className="py-4 px-6 border-b border-slate-800">Cliente</th>
                  <th className="py-4 px-6 border-b border-slate-800">Servicio</th>
                  <th className="py-4 px-6 border-b border-slate-800 whitespace-nowrap">Barbero Asignado</th>
                  <th className="py-4 px-6 border-b border-slate-800 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {citas.map((cita) => (
                  <tr key={cita.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-semibold text-white">{cita.fecha}</p>
                      <p className="text-cyan-400 text-xs font-mono">{cita.hora}</p>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-100">
                      {cita.cliente?.name || <span className="text-rose-400 italic text-xs">Usuario Eliminado</span>}
                    </td>
                    <td className="py-4 px-6">{cita.servicio?.nombre || 'N/A'}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-slate-800 text-slate-300 rounded-full flex items-center justify-center text-xs font-bold">
                          {cita.barbero?.name?.charAt(0) || '?'}
                        </div>
                        <span className="text-slate-400">{cita.barbero?.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getBadgeStyle(cita.estado)}`}>
                        {cita.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}