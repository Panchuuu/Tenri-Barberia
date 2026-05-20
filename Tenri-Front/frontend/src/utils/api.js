export const BASE_URL = 'http://127.0.0.1:8000/api';

const apiFetch = async (endpoint, options = {}) => {
  // 2. BUSCAMOS EL TOKEN
  const token = localStorage.getItem('token');
  
  // 3. CONFIGURAMOS LOS HEADERS AUTOMÁTICOS
  const headers = {
    'Accept': 'application/json',
    ...options.headers, // Respetamos si el componente manda headers extra
  };

  // Si el usuario tiene sesión iniciada, inyectamos el token SIEMPRE
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Si estamos mandando datos (body) y NO es un FormData (imágenes), avisamos que es JSON
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Armamos la configuración final
  const config = {
    ...options,
    headers,
  };

  try {
    // 4. HACEMOS LA PETICIÓN REAL UNIENDO LA URL BASE + EL ENDPOINT
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    // ==========================================
    // 🛡️ SOLUCIÓN AL PUNTO 3: SESIÓN EXPIRADA
    // ==========================================
    // Si Laravel nos responde con un 401 (Unauthorized), significa que el 
    // token venció o es inválido.
    if (response.status === 401) {
      console.warn("Sesión inválida o expirada. Cerrando sesión...");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Recargamos la página para que la app expulse al usuario a la pantalla de Login
      window.location.reload(); 
      
      // Cortamos la ejecución para que no lance otros errores
      return Promise.reject("Sesión expirada");
    }

    return response;
  } catch (error) {
    console.error("Error de conexión al servidor:", error);
    throw error;
  }
};

export default apiFetch;