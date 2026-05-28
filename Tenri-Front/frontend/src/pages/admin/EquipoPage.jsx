import React, { useState } from "react";
import toast from "react-hot-toast";
import useApi from "../../hooks/useApi";
import useApiMutation from "../../hooks/useApiMutation";
import PageHeader from "../../components/PageHeader";
import ConfirmModal from "../../components/ConfirmModal";
import { StarRating } from "../../components/BarberoCard";
import ImageUploader from "../../components/ImageUploader";

const FORM_VACIO = {
  nombre: "",
  email: "",
  horaInicio: "10:00",
  horaFin: "19:00",
  bio: "",
  especialidad: "",
  avatar_archivo: null,
};

export default function EquipoPage() {
  const [form, setForm] = useState(FORM_VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [confirmar, setConfirmar] = useState(null);

  const { data: barberos, cargando, refetch } = useApi("/mi-equipo");
  const { ejecutar, cargando: guardando } = useApiMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editandoId) {
      // Edición usa FormData para soportar avatar
      const fd = new FormData();
      fd.append("name", form.nombre);
      fd.append("hora_inicio", form.horaInicio);
      fd.append("hora_fin", form.horaFin);
      fd.append("bio", form.bio || "");
      fd.append("especialidad", form.especialidad || "");
      if (form.avatar_archivo) fd.append("avatar", form.avatar_archivo);
      fd.append("_method", "PUT");

      const r = await ejecutar(`/barberos/${editandoId}`, { method: "POST", body: fd });
      if (r) {
        toast.success("Barbero actualizado");
        setForm(FORM_VACIO);
        setEditandoId(null);
        refetch();
      } else toast.error("Error al guardar");
    } else {
      // Crear/asignar usa JSON
      const r = await ejecutar("/barberos/asignar", {
        method: "POST",
        body: {
          email: form.email,
          name: form.nombre,
          hora_inicio: form.horaInicio,
          hora_fin: form.horaFin,
        },
      });

      if (r) {
        toast.success("Barbero asignado. Edítalo para agregar bio y foto.");
        setForm(FORM_VACIO);
        refetch();
      } else toast.error("Error al asignar");
    }
  };

  const handleEditar = (b) => {
    setEditandoId(b.id);
    setForm({
      nombre: b.name,
      email: b.email,
      horaInicio: b.hora_inicio ? b.hora_inicio.substring(0,5) : "10:00",
      horaFin:    b.hora_fin    ? b.hora_fin.substring(0,5)    : "19:00",
      bio: b.bio || "",
      especialidad: b.especialidad || "",
      avatar_archivo: null,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEliminar = async () => {
    if (!confirmar) return;
    const r = await ejecutar(`/barberos/${confirmar}`, { method: "DELETE" });
    if (r) { toast.success("Barbero removido"); refetch(); }
    else toast.error("No se pudo remover");
    setConfirmar(null);
  };

  const barberoEditando = editandoId ? (barberos || []).find(b => b.id === editandoId) : null;

  return (
    <div>
      <PageHeader tag="Equipo" titulo="Gestión de equipo"
                  subtitulo="Asigna barberos, define horarios, agrega fotos y biografías" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* FORMULARIO */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0B1221] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-6 h-fit shadow-sm">
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-6">
            {editandoId ? "Editar barbero" : "Nuevo barbero"}
          </h3>

          {/* Avatar preview cuando editas */}
          {editandoId && barberoEditando && (
            <div className="flex justify-center mb-5">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-100 dark:border-emerald-500/20 shadow-md">
                {barberoEditando.avatar_url ? (
                  <img src={barberoEditando.avatar_url} alt={barberoEditando.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-emerald-500 text-white font-bold text-2xl">
                    {barberoEditando.name?.substring(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {editandoId && (
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Nombre</label>
                <input type="text" value={form.nombre}
                       onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                       className="w-full bg-slate-50 dark:bg-[#03070e] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-900 dark:text-slate-200 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                       required />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Correo</label>
              <input type="email" value={form.email}
                     onChange={(e) => setForm({ ...form, email: e.target.value })}
                     disabled={editandoId !== null}
                     className={`w-full bg-slate-50 dark:bg-[#03070e] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-900 dark:text-slate-200 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all ${editandoId ? "opacity-50 cursor-not-allowed" : ""}`}
                     required />
              {!editandoId && (
                <p className="text-[11px] text-slate-500 mt-1.5">
                  El usuario debe estar registrado previamente.
                </p>
              )}
            </div>

            {/* 🎨 FASE 4A: campos avanzados solo al editar */}
            {editandoId && (
              <>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                    Especialidad
                  </label>
                  <input type="text" value={form.especialidad}
                         onChange={(e) => setForm({ ...form, especialidad: e.target.value })}
                         placeholder="Ej: Cortes clásicos · Fade · Barba"
                         maxLength={100}
                         className="w-full bg-slate-50 dark:bg-[#03070e] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-900 dark:text-slate-200 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                    Biografía
                  </label>
                  <textarea value={form.bio}
                            onChange={(e) => setForm({ ...form, bio: e.target.value })}
                            placeholder="Cuéntale a tus clientes sobre este barbero..."
                            maxLength={500}
                            className="w-full bg-slate-50 dark:bg-[#03070e] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-900 dark:text-slate-200 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all h-24 resize-none" />
                  <p className="text-[11px] text-slate-500 mt-1 text-right">{form.bio.length}/500</p>
                </div>

                <ImageUploader
                  label="Foto del barbero"
                  shape="circle"
                  previewActual={barberoEditando?.avatar_url || null}
                  onChange={(file) => setForm({ ...form, avatar_archivo: file })}
                />
              </>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Entrada</label>
                <input type="time" value={form.horaInicio}
                       onChange={(e) => setForm({ ...form, horaInicio: e.target.value })}
                       className="w-full bg-slate-50 dark:bg-[#03070e] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-900 dark:text-slate-200 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                       required />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Salida</label>
                <input type="time" value={form.horaFin}
                       onChange={(e) => setForm({ ...form, horaFin: e.target.value })}
                       className="w-full bg-slate-50 dark:bg-[#03070e] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-900 dark:text-slate-200 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                       required />
              </div>
            </div>

            <button type="submit" disabled={guardando}
                    className="w-full bg-slate-900 dark:bg-emerald-500 hover:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-[#03070e] font-bold py-3 rounded-xl transition-all shadow-sm hover:shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50">
              {guardando ? "Guardando..." : editandoId ? "Guardar cambios" : "Asignar rol"}
            </button>

            {editandoId && (
              <button type="button"
                      onClick={() => { setEditandoId(null); setForm(FORM_VACIO); }}
                      className="w-full text-slate-500 text-xs hover:text-slate-700 dark:hover:text-slate-300">
                Cancelar edición
              </button>
            )}
          </form>
        </div>

        {/* LISTA */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0B1221] border border-slate-200 dark:border-slate-800/60 rounded-2xl shadow-sm overflow-hidden">
          {cargando ? (
            <div className="p-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
            </div>
          ) : (barberos || []).length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              Aún no tienes barberos en tu equipo.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {barberos.map((b) => (
                <div key={b.id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 shrink-0">
                      {b.avatar_url ? (
                        <img src={b.avatar_url} alt={b.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-emerald-500 text-white font-bold text-lg">
                          {b.name.substring(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <p className="text-slate-900 dark:text-slate-200 font-bold truncate">{b.name}</p>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{b.email}</p>

                      {b.especialidad && (
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium uppercase tracking-wider mt-1">
                          {b.especialidad}
                        </p>
                      )}

                      <div className="mt-2 flex items-center gap-3 flex-wrap">
                        <div className="inline-flex px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded text-emerald-700 dark:text-emerald-400 text-[10px] font-mono font-bold tabular">
                          {b.hora_inicio ? b.hora_inicio.substring(0,5) : "10:00"} – {b.hora_fin ? b.hora_fin.substring(0,5) : "19:00"}
                        </div>
                        <StarRating valor={b.promedio_calificacion} total={b.total_resenas} size="xs" />
                      </div>

                      {b.bio && (
                        <p className="text-xs text-slate-500 leading-relaxed mt-2 line-clamp-2">
                          {b.bio}
                        </p>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-col gap-2 shrink-0">
                      <button onClick={() => handleEditar(b)}
                              className="text-emerald-600 dark:text-emerald-500 text-[10px] font-bold uppercase tracking-wider hover:underline">
                        Editar
                      </button>
                      <button onClick={() => setConfirmar(b.id)}
                              className="text-rose-600 dark:text-rose-500 text-[10px] font-bold uppercase tracking-wider hover:underline">
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        abierto={confirmar !== null}
        titulo="Remover barbero"
        mensaje="¿Seguro que deseas remover a este barbero? Sus citas pasadas se mantienen pero ya no recibirá nuevas."
        textoConfirmar="Sí, remover"
        variante="danger"
        onConfirmar={handleEliminar}
        onCancelar={() => setConfirmar(null)}
      />
    </div>
  );
}
