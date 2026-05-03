import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function AdminDashboard({ usuario, onVolver }) {
  // Pestañas disponibles: 'agenda', 'historial', 'roles', 'servicios'
  const [tabActiva, setTabActiva] = useState("agenda");

  // Estados para Usuarios/Barberos
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [editandoId, setEditandoId] = useState(null);

  const [horaInicio, setHoraInicio] = useState("10:00");
  const [horaFin, setHoraFin] = useState("19:00");

  // Estados para Servicios
  const [servicios, setServicios] = useState([]);
  const [formServicio, setFormServicio] = useState({
    nombre: "",
    precio: "",
    duracion: "",
    descripcion: "",
  });

  const [editandoServicioId, setEditandoServicioId] = useState(null);

  // Estados generales
  const [barberos, setBarberos] = useState([]);
  const [citas, setCitas] = useState([]);
  const [finanzas, setFinanzas] = useState(null);

  // Estado para el Modal de Confirmación personalizado
  const [modalConfirm, setModalConfirm] = useState({
    abierto: false,
    mensaje: "",
    onConfirm: null,
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const token = localStorage.getItem("token");
    try {
      const resB = await fetch(
        "http://127.0.0.1:8000/api/barberos?barberia=tenri-barber",
      );
      if (resB.ok) setBarberos(await resB.json());

      const resC = await fetch("http://127.0.0.1:8000/api/citas", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resC.ok) setCitas(await resC.json());

      const resF = await fetch("http://127.0.0.1:8000/api/finanzas/hoy", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resF.ok) setFinanzas(await resF.json());

      // Cargamos el catálogo de servicios
      const resS = await fetch(
        "http://127.0.0.1:8000/api/servicios?barberia=tenri-barber",
      );
      if (resS.ok) setServicios(await resS.json());
    } catch (e) {
      console.error(e);
    }
  };

  // ==========================================
  // GESTIÓN DE SERVICIOS (CATÁLOGO)
  // ==========================================
  const handleGuardarServicio = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const url = editandoServicioId
      ? `http://127.0.0.1:8000/api/servicios/${editandoServicioId}`
      : "http://127.0.0.1:8000/api/servicios";

    // TRUCO PRO: PHP tiene problemas leyendo archivos si el método es PUT.
    // Siempre usamos POST, pero le decimos a Laravel que lo trate como PUT.
    const metodo = "POST";

    // Creamos un "paquete" especial que soporta archivos (FormData)
    const formData = new FormData();
    formData.append("nombre", formServicio.nombre);
    formData.append("precio", formServicio.precio);
    formData.append("duracion", formServicio.duracion);
    formData.append("descripcion", formServicio.descripcion || "");

    // Si adjuntamos un archivo de imagen, lo metemos al paquete
    if (formServicio.imagen_archivo) {
      formData.append("imagen", formServicio.imagen_archivo);
    }

    // Si estamos editando, inyectamos el método PUT artificialmente para Laravel
    if (editandoServicioId) {
      formData.append("_method", "PUT");
    }

    try {
      const resp = await fetch(url, {
        method: metodo,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      if (resp.ok) {
        setFormServicio({
          nombre: "",
          precio: "",
          duracion: "",
          descripcion: "",
          imagen_archivo: null,
        });
        setEditandoServicioId(null);
        await cargarDatos();

        // 🎉 Disparamos la notificación de éxito
        toast.success(
          editandoServicioId
            ? "Servicio actualizado correctamente"
            : "Servicio creado con éxito",
        );
      } else {
        const errorData = await resp.json();
        console.error("Detalles del rechazo:", errorData);

        // 🚨 Analizamos el error para mostrar un mensaje más amigable
        let mensajeError = "Ocurrió un error al guardar";

        if (errorData.errors && errorData.errors.imagen) {
          mensajeError = "La imagen es demasiado pesada o inválida.";
        } else if (errorData.message) {
          mensajeError = "Revisa los datos ingresados.";
        }

        // Disparamos la notificación de error
        toast.error(mensajeError);
      }
    } catch (e) {
      console.error(e);
      toast.error("Error de conexión con el servidor");
    }
  };

  // 1. ELIMINAR SERVICIO (Con modal bonito)
  const confirmarEliminarServicio = (id) => {
    setModalConfirm({
      abierto: true,
      mensaje:
        "¿Seguro que deseas eliminar este servicio del catálogo? Esta acción no se puede deshacer.",
      onConfirm: async () => {
        setModalConfirm({ abierto: false, mensaje: "", onConfirm: null });
        const token = localStorage.getItem("token");
        try {
          const resp = await fetch(
            `http://127.0.0.1:8000/api/servicios/${id}`,
            {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          if (resp.ok) {
            await cargarDatos();
            toast.success("Servicio eliminado del catálogo");
          } else {
            toast.error("No se pudo eliminar el servicio");
          }
        } catch (e) {
          console.error(e);
          toast.error("Error de conexión");
        }
      },
    });
  };

  // ==========================================
  // GESTIÓN DE BARBEROS Y ESTADOS
  // ==========================================
  const handleGuardarBarbero = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const url = editandoId
      ? `http://127.0.0.1:8000/api/barberos/${editandoId}`
      : "http://127.0.0.1:8000/api/barberos/asignar";
    const metodo = editandoId ? "PUT" : "POST";

    try {
      const respuesta = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: email,
          name: nombre,
          hora_inicio: horaInicio,
          hora_fin: horaFin,
        }),
      });
      if (respuesta.ok) {
        setEditandoId(null);
        setNombre("");
        setEmail("");
        setHoraInicio("10:00");
        setHoraFin("19:00");
        await cargarDatos();
        toast.success(
          editandoId ? "Especialista actualizado" : "Especialista asignado",
        );
      } else {
        toast.error("Ocurrió un error al guardar el especialista");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error de conexión con el servidor");
    }
  };

  // 2. ELIMINAR BARBERO (Con modal bonito)
  const confirmarEliminarBarbero = (id) => {
    setModalConfirm({
      abierto: true,
      mensaje:
        "¿Seguro que deseas remover a este especialista de tu barbería? Pasará a ser un usuario normal.",
      onConfirm: async () => {
        setModalConfirm({ abierto: false, mensaje: "", onConfirm: null });
        const token = localStorage.getItem("token");
        try {
          const resp = await fetch(`http://127.0.0.1:8000/api/barberos/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (resp.ok) {
            await cargarDatos();
            toast.success("Especialista removido de la empresa");
          } else {
            toast.error("No se pudo remover al especialista");
          }
        } catch (e) {
          console.error(e);
          toast.error("Error de conexión");
        }
      },
    });
  };

  const handleActualizarEstado = async (id, nuevoEstado) => {
    const token = localStorage.getItem("token");
    try {
      const respuesta = await fetch(
        `http://127.0.0.1:8000/api/citas/${id}/estado`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ estado: nuevoEstado }),
        },
      );
      if (respuesta.ok) {
        await cargarDatos();
        toast.success(`Cita marcada como ${nuevoEstado}`);
      } else {
        toast.error("No se pudo actualizar el estado de la cita");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error de conexión con el servidor");
    }
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
  };

  // Estilos visuales
  const getBadgeStyle = (estado) => {
    const estados = {
      pendiente: "text-amber-400 bg-amber-400/10",
      confirmada: "text-cyan-400 bg-cyan-400/10",
      finalizada: "text-emerald-400 bg-emerald-400/10",
      cancelada: "text-rose-400 bg-rose-400/10",
    };
    return estados[estado?.toLowerCase()] || "text-slate-400 bg-slate-800";
  };

  const isOperacionesActivo =
    tabActiva === "agenda" || tabActiva === "historial";
  const citasOperativas = citas.filter(
    (c) => c.estado === "pendiente" || c.estado === "confirmada",
  );
  const citasHistorial = citas.filter(
    (c) => c.estado === "finalizada" || c.estado === "cancelada",
  );

  return (
    <div className="fixed inset-0 z-[100] flex bg-[#060b14] text-slate-300 font-sans animate-fade-in">
      {/* SIDEBAR */}
      <aside className="w-[280px] bg-[#03070e] flex flex-col justify-between border-r border-slate-800/50">
        <div>
          <div className="h-24 flex items-center justify-center border-b border-slate-800/30 font-black text-xl text-white">
            TENRI <span className="text-emerald-400 ml-2">BARBER</span>
          </div>

          <nav className="p-4 space-y-2 mt-4 text-sm font-medium">
            <button
              onClick={() => setTabActiva("agenda")}
              className={`w-full text-left px-5 py-3 rounded-lg ${isOperacionesActivo ? "bg-[#0f1b29] text-emerald-400" : "text-slate-400 hover:bg-slate-800/30"}`}
            >
              Operaciones
            </button>
            {isOperacionesActivo && (
              <div className="ml-8 border-l border-slate-700/50 pl-4 py-2 space-y-3">
                <p
                  onClick={() => setTabActiva("agenda")}
                  className={`cursor-pointer ${tabActiva === "agenda" ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"}`}
                >
                  Agenda General
                </p>
                <p
                  onClick={() => setTabActiva("historial")}
                  className={`cursor-pointer ${tabActiva === "historial" ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"}`}
                >
                  Historial
                </p>
              </div>
            )}

            <button
              onClick={() => setTabActiva("servicios")}
              className={`w-full text-left px-5 py-3 rounded-lg ${tabActiva === "servicios" ? "bg-[#0f1b29] text-emerald-400" : "text-slate-400 hover:bg-slate-800/30"}`}
            >
              Catálogo de Servicios
            </button>

            <button
              onClick={() => setTabActiva("roles")}
              className={`w-full text-left px-5 py-3 rounded-lg ${tabActiva === "roles" ? "bg-[#0f1b29] text-emerald-400" : "text-slate-400 hover:bg-slate-800/30"}`}
            >
              Administración Equipo
            </button>
          </nav>
        </div>

        <div className="p-5 border-t border-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-[#03070e] font-black text-xs">
              {usuario?.name?.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white leading-tight">
                {usuario?.name}
              </span>
              <span className="text-[10px] text-slate-500">Admin Tenri</span>
            </div>
          </div>
          <button
            onClick={handleCerrarSesion}
            className="text-slate-500 hover:text-rose-400 p-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-24 px-10 flex items-center justify-between shrink-0">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            {tabActiva === "agenda" && "Panel Principal"}
            {tabActiva === "servicios" && "Gestión de Servicios"}
            {tabActiva === "roles" && "Gestión de Equipo"}
          </h2>
          <button
            onClick={onVolver}
            className="px-5 py-2.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg text-sm font-semibold transition-all"
          >
            Volver al Inicio
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar">
          {/* VISTA: SERVICIOS */}
          {tabActiva === "servicios" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
              <div className="lg:col-span-4 bg-[#0B1221] border border-slate-800/60 rounded-2xl p-8 h-fit shadow-xl">
                <h3 className="text-lg font-bold text-white mb-6">
                  {editandoServicioId ? "Editar Servicio" : "Nuevo Servicio"}
                </h3>
                <form onSubmit={handleGuardarServicio} className="space-y-5">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">
                      Nombre del Servicio
                    </label>
                    <input
                      type="text"
                      value={formServicio.nombre}
                      onChange={(e) =>
                        setFormServicio({
                          ...formServicio,
                          nombre: e.target.value,
                        })
                      }
                      className="w-full bg-[#03070e] border border-slate-800 rounded-lg p-3 text-sm text-slate-200 outline-none focus:border-emerald-500/50"
                      required
                      placeholder="Ej: Corte Degradado"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">
                        Precio (CLP)
                      </label>
                      <input
                        type="number"
                        value={formServicio.precio}
                        onChange={(e) =>
                          setFormServicio({
                            ...formServicio,
                            precio: e.target.value,
                          })
                        }
                        className="w-full bg-[#03070e] border border-slate-800 rounded-lg p-3 text-sm text-slate-200 outline-none focus:border-emerald-500/50"
                        required
                        placeholder="15000"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">
                        Duración (Min)
                      </label>
                      <input
                        type="number"
                        value={formServicio.duracion}
                        onChange={(e) =>
                          setFormServicio({
                            ...formServicio,
                            duracion: e.target.value,
                          })
                        }
                        className="w-full bg-[#03070e] border border-slate-800 rounded-lg p-3 text-sm text-slate-200 outline-none focus:border-emerald-500/50"
                        required
                        placeholder="30"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">
                      Descripción (Breve)
                    </label>
                    <textarea
                      value={formServicio.descripcion}
                      onChange={(e) =>
                        setFormServicio({
                          ...formServicio,
                          descripcion: e.target.value,
                        })
                      }
                      className="w-full bg-[#03070e] border border-slate-800 rounded-lg p-3 text-sm text-slate-200 outline-none focus:border-emerald-500/50 h-24 resize-none"
                      placeholder="Corte de cabello a tijera o máquina..."
                    ></textarea>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">
                      Foto del Servicio (Opcional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      // Cuando el usuario elige un archivo, lo guardamos en el estado 'imagen_archivo'
                      onChange={(e) =>
                        setFormServicio({
                          ...formServicio,
                          imagen_archivo: e.target.files[0],
                        })
                      }
                      className="w-full bg-[#03070e] border border-slate-800 rounded-lg p-2 text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-500/10 file:text-emerald-500 hover:file:bg-emerald-500/20 cursor-pointer"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#03070e] font-bold py-3 rounded-lg transition-colors"
                  >
                    {editandoServicioId
                      ? "Actualizar Servicio"
                      : "Crear Servicio"}
                  </button>
                  {editandoServicioId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditandoServicioId(null);
                        setFormServicio({
                          nombre: "",
                          precio: "",
                          duracion: "",
                          descripcion: "",
                        });
                      }}
                      className="w-full text-slate-500 text-xs mt-2"
                    >
                      Cancelar Edición
                    </button>
                  )}
                </form>
              </div>

              <div className="lg:col-span-8 bg-[#0B1221] border border-slate-800/60 rounded-2xl shadow-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#080d18] border-b border-slate-800/60 text-slate-400 font-semibold uppercase text-[10px] tracking-widest">
                    <tr>
                      <th className="px-8 py-5">Servicio</th>
                      <th className="px-8 py-5">Duración</th>
                      <th className="px-8 py-5">Precio</th>
                      <th className="px-8 py-5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {servicios.map((s) => (
                      <tr
                        key={s.id}
                        className="hover:bg-slate-800/20 transition-colors"
                      >
                        <td className="px-8 py-5 flex items-center gap-4">
                          {s.imagen_url ? (
                            <img
                              src={s.imagen_url}
                              alt={s.nombre}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-700/50 shadow-md"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-800/50 flex items-center justify-center border border-slate-700/50 text-slate-500">
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="1.5"
                                  d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"
                                ></path>
                              </svg>
                            </div>
                          )}
                          <span className="text-slate-200 font-bold">
                            {s.nombre}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-slate-400">
                          {s.duracion} min
                        </td>
                        <td className="px-8 py-5 text-emerald-400 font-mono">
                          ${s.precio?.toLocaleString("es-CL")}
                        </td>
                        <td className="px-8 py-5 text-right space-x-4">
                          <button
                            onClick={() => {
                              setEditandoServicioId(s.id);
                              setFormServicio(s);
                            }}
                            className="text-cyan-500 text-xs font-bold uppercase"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => confirmarEliminarServicio(s.id)}
                            className="text-rose-500 text-xs font-bold uppercase"
                          >
                            Borrar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VISTA: AGENDA */}
          {tabActiva === "agenda" && (
            <div className="space-y-8">
              {finanzas && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                  <div className="bg-[#0B1221] border border-slate-800/60 rounded-2xl p-6 shadow-xl">
                    <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">
                      Ingresos de Hoy
                    </p>
                    <h3 className="text-3xl font-black text-white">
                      ${finanzas.total_ingresos?.toLocaleString("es-CL")}
                    </h3>
                  </div>
                  <div className="bg-[#0B1221] border border-slate-800/60 rounded-2xl p-6 shadow-xl">
                    <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">
                      Cortes Finalizados
                    </p>
                    <h3 className="text-3xl font-black text-white">
                      {finanzas.cantidad_cortes}
                    </h3>
                  </div>
                  <div className="bg-[#0B1221] border border-slate-800/60 rounded-2xl p-6 shadow-xl overflow-y-auto max-h-24">
                    <p className="text-slate-500 text-[10px] font-bold uppercase mb-2">
                      Por Especialista
                    </p>
                    {Object.entries(finanzas.desglose_barberos || {}).map(
                      ([n, t]) => (
                        <div
                          key={n}
                          className="flex justify-between text-xs mb-1"
                        >
                          <span>{n}</span>
                          <span className="text-emerald-400 font-bold">
                            ${t.toLocaleString("es-CL")}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

              <div className="bg-[#0B1221] border border-slate-800/60 rounded-2xl overflow-hidden shadow-xl animate-fade-in">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#080d18] border-b border-slate-800/60 text-slate-400 font-semibold uppercase text-[10px] tracking-widest">
                    <tr>
                      <th className="px-8 py-4">Fecha / Hora</th>
                      <th className="px-8 py-4">Cliente</th>
                      <th className="px-8 py-4">Especialista</th>
                      <th className="px-8 py-4 text-center">Estado</th>
                      <th className="px-8 py-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {citasOperativas.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-800/20">
                        <td className="px-8 py-5">
                          <span className="font-bold text-slate-200">
                            {c.fecha}
                          </span>{" "}
                          <span className="text-slate-500 ml-4 font-mono text-xs">
                            {c.hora}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-slate-300">
                          {c.cliente?.name}
                        </td>
                        <td className="px-8 py-5 text-slate-400">
                          {c.barbero?.name}
                        </td>
                        <td className="px-8 py-5 text-center">
                          <span
                            className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getBadgeStyle(c.estado)}`}
                          >
                            {c.estado}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          {c.estado === "pendiente" && (
                            <div className="flex gap-3 justify-end">
                              <button
                                onClick={() =>
                                  handleActualizarEstado(c.id, "confirmada")
                                }
                                className="text-emerald-500 font-bold text-xs uppercase"
                              >
                                Confirmar
                              </button>
                              <button
                                onClick={() =>
                                  handleActualizarEstado(c.id, "cancelada")
                                }
                                className="text-rose-500 font-bold text-xs uppercase"
                              >
                                Cancelar
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VISTA: HISTORIAL */}
          {tabActiva === "historial" && (
            <div className="bg-[#0B1221] border border-slate-800/60 rounded-2xl overflow-hidden shadow-xl opacity-90">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#080d18] border-b border-slate-800/60 text-slate-500 font-semibold uppercase text-[10px] tracking-widest">
                  <tr>
                    <th className="px-8 py-4">ID</th>
                    <th className="px-8 py-4">Fecha / Hora</th>
                    <th className="px-8 py-4">Cliente</th>
                    <th className="px-8 py-4 text-right">Estado Final</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {citasHistorial.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/20">
                      <td className="px-8 py-4 text-slate-600 font-mono text-xs">
                        #{c.id}
                      </td>
                      <td className="px-8 py-4 text-slate-400">
                        {c.fecha} {c.hora}
                      </td>
                      <td className="px-8 py-4 text-slate-400">
                        {c.cliente?.name}
                      </td>
                      <td className="px-8 py-4 text-right">
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getBadgeStyle(c.estado)}`}
                        >
                          {c.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* VISTA: EQUIPO */}
          {tabActiva === "roles" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
              {/* Formulario Barberos */}
              <div className="lg:col-span-4 bg-[#0B1221] border border-slate-800/60 rounded-2xl p-8 h-fit shadow-xl">
                <h3 className="text-lg font-bold text-white mb-6">
                  {editandoId ? "Editar Especialista" : "Nuevo Especialista"}
                </h3>
                <form onSubmit={handleGuardarBarbero} className="space-y-6">
                  {editandoId && (
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="w-full bg-[#03070e] border border-slate-800 rounded-lg p-3 text-sm text-slate-200 outline-none focus:border-emerald-500/50"
                        required
                      />
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">
                      Correo
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={editandoId !== null}
                      className={`w-full bg-[#03070e] border border-slate-800 rounded-lg p-3 text-sm text-slate-200 outline-none focus:border-emerald-500/50 ${editandoId ? "opacity-50 cursor-not-allowed" : ""}`}
                      required
                    />
                  </div>

                  {/* Inputs de Horario */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">
                        Hora Entrada
                      </label>
                      <input
                        type="time"
                        value={horaInicio}
                        onChange={(e) => setHoraInicio(e.target.value)}
                        className="w-full bg-[#03070e] border border-slate-800 rounded-lg p-3 text-sm text-slate-200 outline-none focus:border-emerald-500/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">
                        Hora Salida
                      </label>
                      <input
                        type="time"
                        value={horaFin}
                        onChange={(e) => setHoraFin(e.target.value)}
                        className="w-full bg-[#03070e] border border-slate-800 rounded-lg p-3 text-sm text-slate-200 outline-none focus:border-emerald-500/50"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#03070e] font-bold py-3 rounded-lg transition-colors"
                  >
                    {editandoId ? "Guardar Cambios" : "Asignar Rol"}
                  </button>

                  {editandoId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditandoId(null);
                        setNombre("");
                        setEmail("");
                        setHoraInicio("10:00");
                        setHoraFin("19:00");
                      }}
                      className="w-full text-slate-500 text-xs mt-2"
                    >
                      Cancelar Edición
                    </button>
                  )}
                </form>
              </div>

              {/* Lista de Barberos */}
              <div className="lg:col-span-8 bg-[#0B1221] border border-slate-800/60 rounded-2xl shadow-xl overflow-hidden">
                <div className="divide-y divide-slate-800/40">
                  {barberos.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between px-8 py-5 hover:bg-slate-800/20 group"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-10 h-10 rounded-full bg-[#03070e] border border-slate-700/50 flex items-center justify-center font-bold text-slate-300 text-xs">
                          {b.name.substring(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-slate-200 font-semibold">
                            {b.name}
                          </p>
                          <p className="text-xs text-slate-500">{b.email}</p>
                        </div>
                        {/* Muestra visual del turno */}
                        <div className="hidden md:flex ml-6 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400 text-xs font-mono font-bold">
                          Turno:{" "}
                          {b.hora_inicio
                            ? b.hora_inicio.substring(0, 5)
                            : "10:00"}{" "}
                          - {b.hora_fin ? b.hora_fin.substring(0, 5) : "19:00"}
                        </div>
                      </div>
                      <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditandoId(b.id);
                            setNombre(b.name);
                            setEmail(b.email);
                            setHoraInicio(
                              b.hora_inicio
                                ? b.hora_inicio.substring(0, 5)
                                : "10:00",
                            );
                            setHoraFin(
                              b.hora_fin ? b.hora_fin.substring(0, 5) : "19:00",
                            );
                          }}
                          className="text-emerald-500 text-[10px] font-bold uppercase"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => confirmarEliminarBarbero(b.id)}
                          className="text-rose-500 text-[10px] font-bold uppercase"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ========================================== */}
      {/* MODAL DE CONFIRMACIÓN CUSTOM (DISEÑO PREMIUM) */}
      {/* ========================================== */}
      {modalConfirm.abierto && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#03070e]/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0B1221] border border-slate-800 rounded-2xl p-6 w-[400px] shadow-2xl transform transition-all scale-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
                <svg
                  className="w-5 h-5 text-rose-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white">Confirmar Acción</h3>
            </div>

            <p className="text-sm text-slate-400 mb-8 pl-14">
              {modalConfirm.mensaje}
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() =>
                  setModalConfirm({
                    abierto: false,
                    mensaje: "",
                    onConfirm: null,
                  })
                }
                className="px-5 py-2.5 text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={modalConfirm.onConfirm}
                className="px-5 py-2.5 bg-rose-500 hover:bg-rose-400 text-[#03070e] font-bold rounded-lg transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
