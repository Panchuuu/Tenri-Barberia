import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import useApi from "../hooks/useApi";
import SkeletonCard from "../components/SkeletonCard";
import { SearchIcon } from "../components/Icons";
import heroImage from "../assets/hero.png";

// ============================================================
// 📄 LANDING — Fase 3 visual completa
// ============================================================
// Estructura editorial:
//   1. HERO con imagen + tipografía display + buscador
//   2. Stats / Trust signals
//   3. Grid de barberías
//   4. CTA final
// ============================================================

function BarberiaCard({ barberia, index }) {
  return (
    <Link
      to={`/barberia/${barberia.slug}`}
      className="group relative bg-white dark:bg-[#0B1221] border border-slate-200 dark:border-slate-800/60 rounded-3xl p-8 card-lift flex flex-col items-center text-center animate-fade-in-up overflow-hidden"
      style={{ animationDelay: `${100 + index * 60}ms` }}
    >
      {/* Glow al hacer hover */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-emerald-500/0 group-hover:bg-emerald-500/20 blur-3xl transition-all duration-700 pointer-events-none" />

      {/* Logo / Avatar */}
      <div
        className="relative w-24 h-24 rounded-2xl flex items-center justify-center mb-6 shadow-sm overflow-hidden border border-slate-200 dark:border-slate-800/80 transition-all group-hover:scale-105 group-hover:shadow-lg"
        style={{ backgroundColor: barberia.logo_url ? "#ffffff" : (barberia.color_principal || "#10b981") }}
      >
        {barberia.logo_url ? (
          <img src={barberia.logo_url} alt={barberia.nombre} className="w-full h-full object-cover" />
        ) : (
          <span className="font-display text-white font-bold text-4xl">
            {barberia.nombre.substring(0, 1).toUpperCase()}
          </span>
        )}
      </div>

      <h3 className="font-display text-2xl font-semibold text-slate-900 dark:text-white mb-2 leading-tight">
        {barberia.nombre}
      </h3>

      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
        Ver servicios
        <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M5 12h13" />
        </svg>
      </p>
    </Link>
  );
}

export default function LandingPage() {
  const [busqueda, setBusqueda] = useState("");

  const { data, cargando } = useApi("/barberias", {
    transformar: (json) => json.data || json,
  });
  const barberias = data || [];

  const barberiasFiltradas = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return barberias;
    return barberias.filter((b) => b?.nombre?.toLowerCase().includes(q));
  }, [barberias, busqueda]);

  return (
    <div className="page-transition flex flex-col flex-1 overflow-x-hidden">

      {/* ============= HERO ============= */}
      <section className="relative overflow-hidden mesh-bg noise">
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-24 lg:pt-24 lg:pb-32 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Texto */}
          <div className="relative z-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 animate-fade-in-down">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-glow-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
                Plataforma multi-negocio
              </span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white leading-[1.05] tracking-tight mb-6 animate-fade-in-up">
              Encuentra tu estilo,
              <br />
              <span className="italic text-gradient-brand">
                reserva al instante.
              </span>
            </h1>

            <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0 animate-fade-in-up delay-200">
              Explora nuestra red curada de barberías y centros de estética premium. Tu próxima cita está a un click.
            </p>

            {/* Búsqueda */}
            <div className="relative max-w-md mx-auto lg:mx-0 animate-fade-in-up delay-300">
              <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por nombre…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/90 dark:bg-[#0B1221]/80 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all shadow-sm text-base text-slate-900 dark:text-white placeholder:text-slate-400 backdrop-blur-sm"
              />
            </div>

            {/* Trust metrics */}
            <div className="flex justify-center lg:justify-start gap-8 mt-12 animate-fade-in-up delay-500">
              {[
                { num: barberias.length || "—", lbl: "Barberías" },
                { num: "24/7",                  lbl: "Disponible" },
                { num: "★",                     lbl: "Calidad premium" },
              ].map((s) => (
                <div key={s.lbl} className="text-center lg:text-left">
                  <p className="font-display text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tabular">{s.num}</p>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">{s.lbl}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Imagen Hero — solo desktop */}
          <div className="hidden lg:block relative animate-fade-in-up delay-300">
            <div className="relative">
              {/* Blobs decorativos detrás */}
              <div className="absolute -top-10 -right-10 w-72 h-72 bg-emerald-300/30 dark:bg-emerald-500/20 blur-3xl animate-blob" />
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-cyan-300/20 dark:bg-cyan-500/15 blur-3xl animate-blob" style={{animationDelay: '4s'}} />

              {/* Imagen principal */}
              <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800/60 shadow-2xl shadow-emerald-500/10 aspect-[4/5]">
                <img
                  src={heroImage}
                  alt="Tenri Barber"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent" />
              </div>

              {/* Card flotante decorativo */}
              <div className="absolute -bottom-6 -left-6 bg-white/90 dark:bg-[#0B1221]/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800/60 rounded-2xl p-4 shadow-xl animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Cita confirmada</p>
                    <p className="text-[10px] text-slate-500">Hoy · 18:30</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============= DIRECTORIO ============= */}
      <section className="relative max-w-7xl mx-auto px-6 pb-24 w-full">
        {/* Header sección */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="tag-pill text-emerald-600 dark:text-emerald-400 mb-3">
              Directorio
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
              {busqueda ? `Resultados para "${busqueda}"` : "Barberías destacadas"}
            </h2>
          </div>
          {!cargando && (
            <p className="text-sm text-slate-500 font-medium">
              {barberiasFiltradas.length} {barberiasFiltradas.length === 1 ? "establecimiento" : "establecimientos"}
            </p>
          )}
        </div>

        {cargando ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[1,2,3,4,5,6].map((n) => <SkeletonCard key={n} />)}
          </div>
        ) : barberiasFiltradas.length === 0 ? (
          <div className="text-center py-24 animate-fade-in-up">
            <div className="w-20 h-20 mx-auto bg-slate-100 dark:bg-[#0B1221] rounded-2xl flex items-center justify-center mb-6 border border-slate-200 dark:border-slate-800">
              <SearchIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-display text-2xl font-semibold text-slate-900 dark:text-white mb-2">
              No encontramos barberías
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {busqueda
                ? `No hay resultados para "${busqueda}". Prueba con otro término.`
                : "Aún no hay barberías registradas en la plataforma."}
            </p>
            {busqueda && (
              <button
                onClick={() => setBusqueda("")}
                className="mt-6 px-5 py-2.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {barberiasFiltradas.map((barberia, idx) => (
              <BarberiaCard key={barberia.id} barberia={barberia} index={idx} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
