import React from 'react';

export default function ServiceCard({ servicio, onAgendar }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-900/20 transition-all duration-300 flex flex-col group relative overflow-hidden">
      
      {/* Línea de acento corporativo que aparece al hacer hover */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="flex items-start justify-between mb-6">
        {/* Ícono del servicio */}
        <div className="w-14 h-14 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
          💈
        </div>
        {/* Etiqueta (Si en el futuro agregas 'duracion' a tu BD, puedes cambiar este texto) */}
        <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full font-medium border border-slate-700">
          Servicio Premium
        </span>
      </div>

      <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
        {servicio.nombre}
      </h3>
      
      <p className="text-slate-400 text-sm mb-8 flex-1">
        Atención personalizada con los mejores estándares de calidad y estilo para ti.
      </p>

      <div className="flex items-center justify-between mt-auto">
        <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
          ${Number(servicio.precio).toLocaleString('es-CL')}
        </span>
        <button 
          onClick={() => onAgendar(servicio)}
          className="bg-transparent border-2 border-cyan-600 text-cyan-400 hover:bg-cyan-600 hover:text-white px-6 py-2.5 rounded-xl font-bold active:scale-95 transition-all"
        >
          Agendar
        </button>
      </div>
    </div>
  );
}