import { useState, useCallback, useRef } from "react";
import apiFetch from "../utils/api";

// ============================================================
// 🪝 useApiMutation — Hook para POST/PUT/PATCH/DELETE
// ============================================================
// Uso clásico (compatible con consumidores existentes):
//
//   const { ejecutar, cargando, error } = useApiMutation();
//
//   const handleGuardar = async () => {
//     const data = await ejecutar("/servicios", {
//       method: "POST",
//       body: { nombre, precio }
//     });
//     if (data) toast.success("Listo!");
//   };
//
// Uso nuevo con mensajes claros del backend (Pack 2/D):
//
//   import { parseApiErrorSync } from "../utils/parseApiError";
//
//   const { ejecutar, cargando, getLastError } = useApiMutation();
//
//   const r = await ejecutar(...);
//   if (r) {
//     toast.success("¡Listo!");
//   } else {
//     toast.error(parseApiErrorSync(
//       getLastError()?.body,
//       "Algo salió mal."
//     ));
//   }
//
// 🎯 Pack 2/D: agregamos lastErrorRef (síncrono, vía useRef) para que
//   el consumidor pueda leer el error inmediatamente después del await.
//   El state `error` queda como estaba (asíncrono, útil para mostrar
//   en UI declarativa). Backwards-compatible: consumidores antiguos
//   siguen funcionando sin cambios (return null en fallo, return data
//   en éxito).
// ============================================================

export default function useApiMutation() {
  const [cargando, setCargando] = useState(false);
  const [error, setError]       = useState(null);

  // 🎯 Pack 2/D: ref síncrono para que el consumidor pueda leer el
  // último error inmediatamente después de `await ejecutar(...)`.
  // useState es asíncrono y NO está actualizado todavía en el await.
  const lastErrorRef = useRef(null);

  const ejecutar = useCallback(async (endpoint, opciones = {}) => {
    const { method = "POST", body = null, ...rest } = opciones;

    setCargando(true);
    setError(null);
    // Reset síncrono del ref al INICIO para evitar leer un error
    // "viejo" de una invocación anterior si el consumidor llama dos
    // veces seguidas el mismo handler.
    lastErrorRef.current = null;

    try {
      const config = { method, ...rest };
      if (body) {
        config.body = body instanceof FormData ? body : JSON.stringify(body);
      }

      const resp = await apiFetch(endpoint, config);

      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        const err = new Error(errJson.message || errJson.error || `Error HTTP ${resp.status}`);
        err.status   = resp.status;
        err.errores  = errJson.errors;
        err.body     = errJson;
        throw err;
      }

      // Algunas respuestas (204 No Content) no traen body
      if (resp.status === 204) return true;

      const json = await resp.json();
      return json;

    } catch (err) {
      setError(err);
      // 🎯 Pack 2/D: guardamos también en el ref síncrono.
      // err viene enriquecido con err.status, err.errores y err.body
      // cuando el throw fue por !resp.ok. Para errores de red
      // (apiFetch lanza), err.body queda undefined y el consumidor
      // recibirá el fallback de parseApiErrorSync. Comportamiento
      // intencional.
      lastErrorRef.current = err;
      return null;
    } finally {
      setCargando(false);
    }
  }, []);

  // Getter síncrono del último error. Se devuelve como función para
  // dejar claro al consumidor que NO es un valor reactivo de React
  // (es un ref, leerlo no causa re-render).
  const getLastError = useCallback(() => lastErrorRef.current, []);

  // resetError limpia ambos: el state asíncrono y el ref síncrono.
  const resetError = useCallback(() => {
    setError(null);
    lastErrorRef.current = null;
  }, []);

  return { ejecutar, cargando, error, resetError, getLastError };
}
