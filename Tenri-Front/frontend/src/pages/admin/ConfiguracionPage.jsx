import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import useApi from "../../hooks/useApi";
import useApiMutation from "../../hooks/useApiMutation";
import PageHeader from "../../components/PageHeader";

// ============================================================
// 📄 ADMIN / CONFIGURACIÓN
// ============================================================
// Política de tiempo mínimo de cancelación.
// ============================================================

function Counter({ titulo, valor, onChange, step = 1 }) {
  return (
    <div className="bg-slate-50 dark:bg-[#03070e] border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 flex flex-col items-center shadow-inner">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">{titulo}</span>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, valor - step))}
          className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-emerald-500 hover:text-[#03070e] text-slate-700 dark:text-white flex items-center justify-center font-bold transition-colors"
        >
          −
        </button>
        <input
          type="number"
          value={valor}
          onChange={(e) => onChange(Math.max(0, parseInt(e.target.value) || 0))}
          className="w-14 text-center bg-transparent text-2xl font-black text-slate-900 dark:text-white outline-none appearance-none"
        />
        <button
          type="button"
          onClick={() => onChange(valor + step)}
          className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-emerald-500 hover:text-[#03070e] text-slate-700 dark:text-white flex items-center justify-center font-bold transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function ConfiguracionPage() {
  const { data: barberia, refetch } = useApi("/mi-barberia");
  const { ejecutar, cargando: guardando } = useApiMutation();

  const [tiempoTotal, setTiempoTotal] = useState(60); // minutos

  useEffect(() => {
    if (barberia?.tiempo_cancelacion !== undefined) {
      setTiempoTotal(barberia.tiempo_cancelacion);
    }
  }, [barberia]);

  const dias    = Math.floor(tiempoTotal / 1440);
  const horas   = Math.floor((tiempoTotal % 1440) / 60);
  const minutos = tiempoTotal % 60;

  const setComponentes = (d, h, m) => {
    setTiempoTotal(Math.max(0, d * 1440 + h * 60 + m));
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    const r = await ejecutar("/mi-barberia", {
      method: "PUT",
      body: { tiempo_cancelacion: tiempoTotal },
    });
    if (r) {
      toast.success("Configuración actualizada");
      refetch();
    } else {
      toast.error("Error al guardar");
    }
  };

  return (
    <div>
      <PageHeader
        titulo="Ajustes de Negocio"
        subtitulo="Define las reglas bajo las cuales los clientes interactúan con tu barbería"
      />

      <div className="bg-white dark:bg-[#0B1221] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-8 max-w-3xl shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Política de Cancelación
        </h3>
        <p className="text-slate-500 text-sm mb-8">
          Anticipación mínima requerida para que un cliente pueda cancelar sin penalización.
        </p>

        <form onSubmit={handleGuardar} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Counter titulo="Días"    valor={dias}    onChange={(v) => setComponentes(v, horas, minutos)} />
            <Counter titulo="Horas"   valor={horas}   onChange={(v) => setComponentes(dias, v, minutos)} />
            <Counter titulo="Minutos" valor={minutos} onChange={(v) => setComponentes(dias, horas, v)} step={15} />
          </div>

          <div className="text-center bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl text-sm font-medium">
            Total guardado: <span className="font-black text-lg ml-1">{tiempoTotal}</span> minutos
            {tiempoTotal === 0 && (
              <p className="text-rose-500 mt-1 text-xs">
                ⚠️ Tus clientes podrán cancelar hasta el último minuto.
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800/60">
            <button
              type="submit"
              disabled={guardando}
              className="w-full md:w-auto px-8 py-3 bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-400 text-white dark:text-[#03070e] font-bold rounded-lg transition-colors shadow-md disabled:opacity-50"
            >
              {guardando ? "Guardando..." : "Guardar Configuración"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
