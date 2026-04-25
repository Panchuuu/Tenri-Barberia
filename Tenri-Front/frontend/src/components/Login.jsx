import React, { useState } from 'react';

// Ahora recibimos onClose para poder cerrar la ventana
export default function Login({ onLoginSuccess, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      const resp = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await resp.json();

      if (resp.ok) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLoginSuccess(data.user); // Le avisamos a App.jsx que ya entramos
      } else {
        alert(data.message || "Credenciales incorrectas");
      }
    } catch (error) {
      console.error("Error en login:", error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Fondo oscuro para tapar la página principal */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer" onClick={onClose}></div>

      {/* Caja del formulario */}
      <div className="relative bg-slate-900 p-8 rounded-3xl border border-slate-800 w-full max-w-sm shadow-2xl">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors">✕</button>
        
        <h2 className="text-2xl font-bold text-cyan-400 mb-6 text-center">Entrar a Atlas</h2>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <input 
            type="email" 
            placeholder="Correo electrónico" 
            className="w-full bg-slate-800 p-3 rounded-xl text-white outline-none focus:ring-1 focus:ring-cyan-500 border border-slate-700"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            className="w-full bg-slate-800 p-3 rounded-xl text-white outline-none focus:ring-1 focus:ring-cyan-500 border border-slate-700"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button 
            type="submit"
            disabled={cargando}
            className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 py-3 rounded-xl font-bold text-white transition-all shadow-lg"
          >
            {cargando ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}