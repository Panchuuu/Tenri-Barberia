import React, { useState, useEffect } from 'react';
import toast from "react-hot-toast";
import ReviewModal from "./ReviewModal";
import apiFetch from '../utils/api';

export default function MisReservas({ usuario, onVolver }) {
  const [misCitas, setMisCitas] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [citaACalificar, setCitaACalificar] = useState(null);
  const [modalConfirm, setModalConfirm] = useState({ abierto: false, idCita: null });

  // 🔧 FIX FASE 1: usar optional chaining para evitar TypeError si usuario es null
  useEffect(() => {
    cargarMisCitas();
  }, [usuario?.id]);

  const cargarMisCitas = async () => {
    try {
      const respuesta = await apiFetch('/mis-reservas');

      if (respuesta.ok) {
        const citasDelCliente = await respuesta.json();
        setMisCitas(citasDelCliente);
      }
    } catch (error) {
      console.error("Error al cargar historial:", error);
      toast.error("Error al cargar tu historial");
    } finally {
      setCargando(false);
    }
  };

  const abrirModalCancelacion = (id) => {
    setModalConfirm({ abierto: true, idCita: id });
  };

  const confirmarCancelacion = async () => {
    const id = modalConfirm.idCita;
    setModalConfirm({ abierto: false, idCita: null });

    try {
      const resp = await apiFetch(`/mis-citas/${id}/cancelar`, {
        method: "PATCH",
      });

      if (resp.ok) {
        toast.success("Cita cancelada correctamente");
        await cargarMisCitas();
      } else {
        const errorData = await resp.json();
        toast.error(errorData.error || "No se pudo cancelar la cita");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error de conexión");
    }
  };

  const getBadgeStyle = (estado) => {
    const estados = {
      pendiente:  "bg-amber-100 text-amber-700 border-amber-200 dark:text-amber-400 dark:bg-amber-400/10 dark:border-amber-400/20",
      confirmada: "bg-cyan-100 text-cyan-700 border-cyan-200 dark:text-cyan-400 dark:bg-cyan-400/10 dark:border-cyan-400/20",
      finalizada: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-400/10 dark:border-emerald-400/20",
      cancelada:  "bg-rose-100 text-rose-700 border-rose-200 dark:text-rose-400 dark:bg-rose-400/10 dark:border-rose-400/20"
    };
    return estados[estado?.toLowerCase()] || "bg-slate-100 text-slate-700 border-slate-200 dark:text-slate-400 dark:bg-slate-800 dark:border-transparent";
  };

  const XIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-50 dark:bg-[#060b14] text-slate-900 dark:text-slate-300 overflow-y-auto animate-fade-in transition-colors duration-300">

      <header className="sticky top-0 z-10 bg-white/80 dark:bg-[#03070e]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/50 shadow-sm transition-colors">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500 dark:text-[#03070e] flex items-center justify-center font-black text-lg transition-colors">
              {usuario?.name?.substring(0, 1).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Mis Reservas</h2>
              <p className="text-xs text-slate-500 font-medium">Historial de {usuario?.name}</p>
            </div>
          </div>

          <button onClick={onVolver} className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:text-slate-300 rounded-lg text-sm font-semibold transition-all shadow-sm border border-slate-200 dark:border-slate-700">
            Volver a la Tienda
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 w-full flex-1">
        {cargando ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-500 dark:border-slate-800 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">Cargando tu historial...</p>
          </div>
        ) : misCitas.length === 0 ? (
          <div className="bg-white dark:bg-[#0B1221] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-12 text-center shadow-sm transition-colors">
            <div className="w-16 h-16 bg-slate-100 dark:bg-[#03070e] rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-slate-800">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Aún no tienes citas</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Explora nuestro catálogo y reserva tu primer servicio.</p>
            <button onClick={onVolver} className="bg-emerald-500 hover:bg-emerald-600 text-white dark:text-[#03070e] dark:hover:bg-emerald-400 font-bold px-6 py-3 rounded-lg transition-all shadow-md">
              Ver Catálogo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {misCitas.map(cita => (
              <div key={cita.id} className="bg-white dark:bg-[#0B1221] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-6 shadow-sm hover:shadow-md dark:shadow-none hover:border-emerald-500/50 transition-all flex flex-col">

                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-500 text-[10px] font-bold uppercase tracking-widest mb-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      {cita.fecha} • {cita.hora?.substring(0, 5)}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{cita.servicio?.nombre || 'Servicio de Barbería'}</h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getBadgeStyle(cita.estado)}`}>
                    {cita.estado}
                  </span>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center text-[10px] font-bold border border-slate-200 dark:border-slate-700">
                      {cita.barbero?.name?.substring(0, 1).toUpperCase() || '?'}
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      Con: {cita.barbero?.name || 'Por asignar'}
                    </span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    ${cita.servicio?.precio?.toLocaleString('es-CL')}
                  </span>
                </div>

                <div className="mt-auto pt-2">
                  {(cita.estado === 'pendiente' || cita.estado === 'confirmada') && (
                    <button
                      onClick={() => abrirModalCancelacion(cita.id)}
                      className="mt-2 px-4 py-2.5 w-full text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 dark:text-rose-400 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:border-rose-500/20 font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <XIcon /> Cancelar Reserva
                    </button>
                  )}

                  {cita.estado === 'finalizada' && cita.calificacion == null && (
                    <button
                      onClick={() => setCitaACalificar(cita)}
                      className="mt-2 px-4 py-2.5 w-full bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 font-bold text-sm rounded-lg hover:bg-amber-200 dark:hover:bg-amber-500/20 transition-colors flex items-center justify-center gap-2"
                    >
                      ⭐ Calificar Servicio
                    </button>
                  )}

                  {cita.calificacion != null && (
                    <div className="mt-2 flex flex-col items-center justify-center gap-1 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/50">
                      <span className="text-xs font-bold text-slate-500 mb-1">Tu calificación:</span>
                      <div className="flex gap-1 text-amber-400 text-sm drop-shadow-sm">
                        {[...Array(cita.calificacion)].map((_, i) => <span key={i}>⭐</span>)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {citaACalificar && (
        <ReviewModal
          cita={citaACalificar}
          onClose={() => setCitaACalificar(null)}
          onReviewSuccess={() => cargarMisCitas()}
        />
      )}

      {modalConfirm.abierto && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/50 dark:bg-[#03070e]/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#0B1221] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-[400px] shadow-2xl transform transition-all scale-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-500/10 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-rose-600 dark:text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Cancelar Reserva</h3>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 pl-14">
              ¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setModalConfirm({ abierto: false, idCita: null })}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Mantener Cita
              </button>
              <button
                onClick={confirmarCancelacion}
                className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 dark:hover:bg-rose-400 text-white dark:text-[#03070e] font-bold rounded-lg transition-colors shadow-sm"
              >
                Sí, Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
