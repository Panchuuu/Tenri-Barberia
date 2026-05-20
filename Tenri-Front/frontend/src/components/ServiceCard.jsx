import React from 'react';

export default function ServiceCard({ servicio, onAgendar }) {
  const precioFormateado = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(servicio.precio);

  return (
    <div className="bg-white border border-slate-200 dark:bg-[#0B1221] dark:border-slate-800/60 rounded-2xl p-6 flex flex-col justify-between shadow-lg hover:shadow-xl dark:shadow-none hover:border-emerald-500/50 dark:hover:border-emerald-500/30 transition-all group">
      
      <div>
        <div className="flex justify-between items-start mb-4">
          
          {/* 👇 MEJORA VISUAL: Si hay foto la mostramos, sino usamos el emoji */}
          {servicio.imagen_url ? (
            <img 
              src={servicio.imagen_url} 
              alt={servicio.nombre} 
              className="w-12 h-12 object-cover border border-slate-200 dark:border-slate-700/50 rounded-xl shadow-sm group-hover:scale-110 transition-transform"
            />
          ) : (
            <div className="w-12 h-12 bg-slate-50 border border-slate-100 dark:bg-[#03070e] dark:border-slate-700/50 rounded-xl flex items-center justify-center text-2xl shadow-sm dark:shadow-inner group-hover:scale-110 transition-transform">
              ✂️
            </div>
          )}

          <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 font-bold px-3 py-1 rounded-md text-xs uppercase tracking-wider transition-colors">
            {servicio.duracion} min
          </span>
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">{servicio.nombre}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 transition-colors">
          {servicio.descripcion || 'Servicio profesional de barbería con atención personalizada y productos de primera calidad.'}
        </p>
      </div>

      <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between transition-colors">
        <div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-1 transition-colors">Valor Final</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white transition-colors">{precioFormateado}</p>
        </div>
        
        <button 
          onClick={() => onAgendar(servicio)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white dark:text-[#03070e] dark:hover:bg-emerald-400 font-bold px-6 py-3 rounded-lg transition-all shadow-md dark:shadow-lg dark:shadow-emerald-900/20 active:scale-95"
        >
          Agendar
        </button>
      </div>
      
    </div>
  );
}