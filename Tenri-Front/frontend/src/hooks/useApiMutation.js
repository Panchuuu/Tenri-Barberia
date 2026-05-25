import { useState, useCallback } from "react";
import apiFetch from "../utils/api";

// ============================================================
// 🪝 useApiMutation — Hook para POST/PUT/PATCH/DELETE
// ============================================================
// Uso:
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
// ============================================================

export default function useApiMutation() {
  const [cargando, setCargando] = useState(false);
  const [error, setError]       = useState(null);

  const ejecutar = useCallback(async (endpoint, opciones = {}) => {
    const { method = "POST", body = null, ...rest } = opciones;

    setCargando(true);
    setError(null);

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
      return null;
    } finally {
      setCargando(false);
    }
  }, []);

  return { ejecutar, cargando, error, resetError: () => setError(null) };
}
