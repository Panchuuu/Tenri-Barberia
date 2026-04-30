import React, { useState } from 'react';

export default function Login({ onClose, onLoginSuccess }) {
  const [esRegistro, setEsRegistro] = useState(false);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);

    const endpoint = esRegistro ? 'register' : 'login';
    const url = `http://127.0.0.1:8000/api/${endpoint}`;
    const cuerpoPeticion = esRegistro 
      ? { name: nombre, email: email, password: password } 
      : { email: email, password: password };

    try {
      const respuesta = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(cuerpoPeticion)
      });
      const datos = await respuesta.json();

      if (respuesta.ok) {
        localStorage.setItem('token', datos.access_token);
        localStorage.setItem('user', JSON.stringify(datos.user));
        onLoginSuccess(datos.user);
      } else {
        alert(datos.message || "Error al procesar la solicitud.");
      }
    } catch (error) {
      console.error("Error conectando:", error);
      alert("Error de conexión con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  const XIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 dark:bg-[#03070e]/80 backdrop-blur-sm p-4 animate-fade-in transition-colors">
      <div className="bg-white dark:bg-[#0B1221] border border-slate-200 dark:border-slate-800/60 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative transition-colors">
        
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-emerald-400/20 dark:bg-emerald-600/10 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="px-8 pt-8 pb-4 flex justify-between items-center relative z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors">
              {esRegistro ? 'Crear Cuenta' : 'Bienvenido de vuelta'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">
              {esRegistro ? 'Únete a TENRI Barber' : 'Ingresa a tu cuenta para continuar'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-500 dark:hover:text-rose-400 dark:bg-transparent dark:hover:bg-slate-800/50 rounded-lg transition-colors -mt-6 -mr-2">
            <XIcon />
          </button>
        </div>

        <div className="p-8 relative z-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            {esRegistro && (
              <div className="animate-fade-in">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wide mb-2 block">Nombre Completo</label>
                <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Nicolás Cisternas" className="w-full bg-slate-50 dark:bg-[#03070e] border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 text-sm text-slate-900 dark:text-slate-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" />
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Correo Electrónico</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="usuario@correo.com" className="w-full bg-slate-50 dark:bg-[#03070e] border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 text-sm text-slate-900 dark:text-slate-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex justify-between">
                Contraseña
              </label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" minLength={6} className="w-full bg-slate-50 dark:bg-[#03070e] border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 text-sm text-slate-900 dark:text-slate-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" />
            </div>
            <div className="pt-4">
              <button type="submit" disabled={cargando} className={`w-full py-3.5 rounded-lg font-bold text-white dark:text-[#03070e] transition-all shadow-md ${cargando ? 'bg-emerald-400 dark:bg-emerald-600/50 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-400 dark:shadow-emerald-900/20 hover:-translate-y-0.5'}`}>
                {cargando ? 'Cargando...' : (esRegistro ? 'Completar Registro' : 'Iniciar Sesión')}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400 transition-colors">
            {esRegistro ? '¿Ya tienes una cuenta?' : '¿No tienes cuenta en Tenri?'} {' '}
            <button type="button" onClick={() => { setEsRegistro(!esRegistro); setNombre(''); setPassword(''); }} className="text-emerald-600 dark:text-emerald-500 font-bold hover:text-emerald-500 dark:hover:text-emerald-400 hover:underline transition-all">
              {esRegistro ? 'Inicia sesión aquí' : 'Regístrate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 