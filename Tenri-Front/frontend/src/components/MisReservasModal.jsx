import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function MisReservasModal({ onClose }) {
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarMisReservas();
  }, []);

  const cargarMisReservas = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const resp = await fetch("http://127.0.0.1:8000/api/mis-reservas", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.ok) {
        setCitas(await resp.json());
      }
    } catch (e) {
      console.error(e);
      toast.error("Error al cargar tu historial");
    } finally {
      setCargando(false);
    }
  };

  // Función para que el cliente cancele una cita que aún no pasa
  const handleCancelarCita = async (id) => {
    // Usamos el confirm nativo temporalmente, o puedes hacer tu modal custom aquí también
    if (!window.confirm("¿Estás seguro de que deseas cancelar esta cita?")) return;

    const token = localStorage.getItem("token");
    try {
      const resp = await fetch(`http://127.0.0.1:8000/api/citas/${id}/estado`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estado: "cancelada" }),
      });

      if (resp.ok) {
        toast.success("Cita cancelada correctamente");
        await cargarMisReservas(); // Recargamos la lista
      } else {
        toast.error("No se pudo cancelar la cita");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error de conexión");
    }
  };

  // Estilos visuales para el estado de la cita
  const getBadgeStyle = (estado) => {
    const estados = {
      pendiente: "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-400/10 border-amber-200 dark:border-amber-400/20",
      confirmada: "text-cyan-600 bg-cyan-100 dark:text-cyan-400 dark:bg-cyan-400/10 border-cyan-200 dark:border-cyan-400/20",
      finalizada: "text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-400/10 border-emerald-200 dark:border-emerald-400/20",
      cancelada: "text-rose-600 bg-rose-100 dark:text-rose-400 dark:bg-rose-400/10 border-rose-200 dark:border-rose-400/20",
    };
    return estados[estado?.toLowerCase()] || "text-slate-500 bg-slate-100 border-slate-200";
  };

  // Ícono X para cerrar
  const XIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );

  return (
    <div className="fixed inset-0 z-[150] flex justify-end bg-slate-900/40 dark:bg-[#03070e]/80 backdrop-blur-sm animate-fade-in transition-colors">
      
      {/* PANEL DESLIZABLE (SLIDE-OVER) */}
      <div className="bg-white dark:bg-[#0B1221] w-full max-w-md h-full flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.2)] animate-slide-in-right border-l border-slate-200 dark:border-slate-800/60 transition-colors">
        
        {/* CABECERA */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800/60 flex justify-between items-center bg-slate-50 dark:bg-[#080d18]">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Mis Reservas</h2>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Historial de tus citas en la red TENRI</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:hover:text-rose-400 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
            <XIcon />
          </button>
        </div>

        {/* CONTENIDO (LISTA DE CITAS) */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/50 dark:bg-transparent">
          {cargando ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
          ) : citas.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-slate-100 dark:bg-[#03070e] rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-slate-800">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <h3 className="text-slate-700 dark:text-slate-300 font-bold mb-1">No tienes reservas</h3>
              <p className="text-sm text-slate-500">Explora el catálogo y agenda tu primer servicio.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {citas.map((cita) => (
                <div key={cita.id} className="bg-white dark:bg-[#03070e] border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 shadow-sm hover:border-emerald-500/50 transition-colors">
                  
                  {/* Encabezado de la Tarjeta (Barbería y Estado) */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                        {cita.servicio?.barberia?.nombre?.substring(0, 1).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        {cita.servicio?.barberia?.nombre}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${getBadgeStyle(cita.estado)}`}>
                      {cita.estado}
                    </span>
                  </div>

                  {/* Cuerpo de la Tarjeta (Servicio, Fecha, Especialista) */}
                  <h4 className="text-lg font-bold text-slate-900 dark:text-slate-200 mb-1">{cita.servicio?.nombre}</h4>
                  
                  <div className="text-sm text-slate-500 dark:text-slate-400 space-y-1 mb-4 font-medium">
                    <p className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      {cita.fecha} a las <span className="font-mono">{cita.hora?.substring(0, 5)}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                      Con: {cita.barbero?.name}
                    </p>
                  </div>

                  {/* Botón de Cancelar (Solo si la cita está pendiente) */}
                  {cita.estado === "pendiente" && (
                    <button 
                      onClick={() => handleCancelarCita(cita.id)}
                      className="w-full py-2 rounded-lg text-xs font-bold text-rose-500 bg-rose-50 hover:bg-rose-100 border border-rose-200 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:border-rose-500/20 transition-colors"
                    >
                      Cancelar Cita
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}