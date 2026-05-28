/**
 * Helper para extraer mensajes de error legibles de respuestas API.
 *
 * Resuelve FIX #2 del PDF de errores: "Mensaje de error ensucia la consola
 * y muestra que no se puede ingresar información duplicada sin avisarle al
 * usuario."
 *
 * Acepta múltiples formatos de error y devuelve siempre un string en español:
 *  - { message: "..." }                        → Laravel estándar
 *  - { errors: { campo: ["mensaje"] } }        → Laravel ValidationException
 *  - { error: "..." }                          → respuestas custom
 *  - Error de red / parsing                    → fallback genérico
 *
 * @param {Response|object|Error} err - Respuesta del API, objeto JSON o Error
 * @param {string} [fallback] - Mensaje a usar si no se puede extraer nada
 * @returns {Promise<string>} - Mensaje legible en español
 *
 * Ejemplos de uso:
 *
 *   import { parseApiError } from "../utils/parseApiError";
 *
 *   // Con Response de fetch:
 *   if (!r.ok) {
 *     toast.error(await parseApiError(r));
 *   }
 *
 *   // Con objeto ya parseado (cuando useApiMutation devuelve null):
 *   const r = await ejecutar(endpoint, opts);
 *   if (!r) toast.error("No se pudo guardar");
 */
export async function parseApiError(err, fallback = "Ocurrió un error inesperado") {
  // Caso 1: Error nativo de JavaScript (red, parsing)
  if (err instanceof Error) {
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      return "Error de conexión. Verifica tu internet o que el servidor esté activo.";
    }
    return err.message || fallback;
  }

  // Caso 2: Response de fetch (necesita parsearse)
  let data = err;
  if (err instanceof Response) {
    try {
      data = await err.clone().json();
    } catch {
      // Body no es JSON (ej: HTML de error 500 sin debug)
      const status = err.status;
      if (status === 401) return "Necesitas iniciar sesión.";
      if (status === 403) return "No tienes permiso para hacer esto.";
      if (status === 404) return "No encontramos lo que buscabas.";
      if (status === 419) return "Tu sesión expiró. Vuelve a iniciar sesión.";
      if (status === 429) return "Demasiados intentos. Espera un momento.";
      if (status >= 500) return "Error del servidor. Intenta más tarde.";
      return fallback;
    }
  }

  if (!data || typeof data !== "object") return fallback;

  // Caso 3: Laravel ValidationException → { errors: { campo: ["msg"] } }
  if (data.errors && typeof data.errors === "object") {
    const primer = Object.values(data.errors)[0];
    if (Array.isArray(primer) && primer.length > 0) {
      return String(primer[0]);
    }
  }

  // Caso 4: { message: "..." } (Laravel estándar)
  if (typeof data.message === "string" && data.message.length > 0) {
    return data.message;
  }

  // Caso 5: { error: "..." } (respuestas custom del proyecto)
  if (typeof data.error === "string" && data.error.length > 0) {
    return data.error;
  }

  return fallback;
}

/**
 * Variante síncrona para cuando ya tienes el objeto parseado.
 * Útil cuando useApiMutation ya hizo el .json() por ti.
 */
export function parseApiErrorSync(data, fallback = "Ocurrió un error inesperado") {
  if (!data || typeof data !== "object") return fallback;

  if (data.errors && typeof data.errors === "object") {
    const primer = Object.values(data.errors)[0];
    if (Array.isArray(primer) && primer.length > 0) return String(primer[0]);
  }

  if (typeof data.message === "string" && data.message.length > 0) return data.message;
  if (typeof data.error === "string" && data.error.length > 0) return data.error;

  return fallback;
}
