"use client";
import React, { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [view, setView] = useState<'initial'|'login'|'register'>('initial');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ nombres: '', apellidos: '', email: '', password: '', cargo: '', telefono: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const { loginWithGoogle, signUp, loginWithPassword } = useAuth();
  const router = useRouter();

  // Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    const { email, password } = loginData;
    const res = await loginWithPassword(email, password);
    setLoading(false);
    if (res && 'error' in res && res.error) {
      setError('Credenciales incorrectas');
    } else {
      router.replace('/dashboard');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    const { nombres, apellidos, email, password, cargo, telefono } = registerData;
    const res = await signUp(email, password, { nombres, apellidos, cargo, telefono });
    setLoading(false);
    if (res && 'error' in res && res.error) {
      setError('No se pudo registrar.');
    } else {
      // Intentar login automático tras registro
      const loginRes = await loginWithPassword(email, password);
      if (loginRes && 'error' in loginRes && loginRes.error) {
        setError('Usuario registrado, pero error al iniciar sesión. Intenta ingresar manualmente.');
        setView('login');
      } else {
        router.replace('/dashboard');
      }
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true); setError(null);
    try {
      await loginWithGoogle('/dashboard');
    } catch (err) {
      setError('Error con Google OAuth.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="antialiased selection:bg-white/10 selection:text-white text-white bg-neutral-950 min-h-screen flex flex-col" style={{fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, \'Segoe UI\', Roboto'}}>
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-neutral-950/70 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex h-16 text-2xl font-semibold text-[#ff6a00] items-center justify-between">
            Preventi Flow
            <nav className="hidden md:flex items-center gap-6 text-sm text-white/70">
              <a href="#" className="hover:text-white transition-colors">Conoce</a>
              <a href="#" className="hover:text-white transition-colors">Documentación</a>
              <a href="#" className="hover:text-white transition-colors">Asistencia</a>
            </nav>
            <div className="flex items-center gap-2">
              <button onClick={()=>setView('login')} className="hidden sm:inline-flex items-center h-9 hover:text-white hover:border-white/20 transition-colors text-sm text-white/80 border-white/10 border rounded-lg px-3">Iniciar sesión</button>
              <button onClick={()=>setView('register')} className="inline-flex items-center h-9 hover:bg-[#ff8129] transition-colors text-sm font-medium text-slate-50 bg-[#ff6a00] border-[#ff6a00] rounded-lg px-3">Registrarse<span className="ml-1">→</span></button>
            </div>
          </div>
        </div>
      </header>
      {/* Hero + Formulario */}
      <section className="relative flex-1 overflow-hidden bg-[url(https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/af0a80bd-7501-40ee-990b-69ed1cfcde25_3840w.jpg)] bg-cover">
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] bg-fuchsia-500/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-48 -right-40 w-[520px] h-[520px] bg-indigo-500/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="max-w-7xl md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 mx-auto pt-16 px-6 pb-16">
          <div className="lg:col-span-6 flex flex-col justify-center">
            <div className="inline-flex gap-2 w-max text-xs text-white/80 bg-white/5 border-white/10 border rounded-full mb-4 py-1 px-2.5 backdrop-blur-lg items-center">Conoce más<span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400"></span></div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight font-semibold text-[#ff6a00] tracking-tight">Preventi Flow</h1>
            <p className="text-base sm:text-lg leading-relaxed text-slate-50 mt-4">Automatiza todos tus procesos de gestión en la Prevención de Riesgos Laborales</p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button onClick={()=>setView('register')} className="inline-flex items-center justify-center h-11 hover:bg-white/90 transition shadow text-sm font-bold text-slate-50 bg-slate-950 border-[#ff6a00] border-0 rounded-xl px-4">Crea una cuenta<span className="ml-1.5">+</span></button>
              <button onClick={()=>setView('login')} className="inline-flex items-center justify-center h-11 hover:text-white hover:border-white/20 transition shadow text-sm text-white/90 border-white/10 border rounded-xl px-4 backdrop-blur-lg">Ingresa a tu dashboard<span className="ml-1.5">⏰</span></button>
            </div>
          </div>
          <div className="lg:col-span-6">
            {/* Contenido dinámico: inicial, login, registro */}
            {view === 'initial' && (
              <div className="relative sm:p-6 shadow bg-gradient-to-b from-white/[0.03] to-transparent border-white/10 border rounded-3xl p-4 backdrop-blur-lg">
                {/* Cards/Mockup visuales aquí si quieres replicar el grid del mockup */}
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-12 md:col-span-6 space-y-3">
                    <div className="group relative h-48 sm:h-56 rounded-2xl overflow-hidden border border-white/10 bg-neutral-900 flex items-end p-4"><span>Asistente AI</span></div>
                    <div className="relative h-28 rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02] flex items-center p-4">Capacitaciones</div>
                  </div>
                  <div className="col-span-12 md:col-span-6 space-y-3">
                    <div className="relative h-28 rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02] flex items-center p-4">Informes y estadísticas</div>
                    <div className="group relative h-48 sm:h-56 rounded-2xl overflow-hidden border border-white/10 bg-neutral-900 flex items-end p-4"><span>Centro de documentos</span></div>
                  </div>
                </div>
              </div>
            )}
            {view === 'login' && (
              <div className="glass-form rounded-2xl p-8 space-y-4 mt-4">
                <h2 className="text-2xl font-bold text-center text-white">Iniciar sesión</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="text-sm text-white/70">Email</label>
                    <input type="email" required className="form-input w-full mt-1 rounded-md p-2" value={loginData.email} onChange={e=>setLoginData({...loginData, email: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm text-white/70">Contraseña</label>
                    <input type="password" required className="form-input w-full mt-1 rounded-md p-2" value={loginData.password} onChange={e=>setLoginData({...loginData, password: e.target.value})} />
                  </div>
                  {error && <div className="text-red-400 text-center">{error}</div>}
                  <button type="submit" className="w-full bg-[#ff6a00] hover:bg-[#ff8129] text-white font-bold py-2 rounded-lg transition">{loading ? 'Cargando...' : 'Ingresar'}</button>
                </form>
                <button onClick={handleGoogleLogin} className="w-full mt-2 bg-white/90 hover:bg-white text-neutral-900 font-medium py-2 rounded-lg transition flex items-center justify-center"><span className="mr-2">G</span> Iniciar sesión con Google</button>
                <div className="text-center mt-2">
                  ¿No tienes cuenta? <button className="text-[#ff6a00] underline" onClick={()=>{setView('register');setError(null);}}>Regístrate</button>
                </div>
              </div>
            )}
            {view === 'register' && (
              <div className="glass-form rounded-2xl p-8 space-y-4 mt-4">
                <h2 className="text-2xl font-bold text-center text-white">Registrarse</h2>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-white/70">Nombres*</label>
                      <input type="text" required className="form-input w-full mt-1 rounded-md p-2" value={registerData.nombres} onChange={e=>setRegisterData({...registerData, nombres: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-sm text-white/70">Apellidos*</label>
                      <input type="text" required className="form-input w-full mt-1 rounded-md p-2" value={registerData.apellidos} onChange={e=>setRegisterData({...registerData, apellidos: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-white/70">Email*</label>
                    <input type="email" required className="form-input w-full mt-1 rounded-md p-2" value={registerData.email} onChange={e=>setRegisterData({...registerData, email: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-white/70">Cargo</label>
                      <input type="text" className="form-input w-full mt-1 rounded-md p-2" value={registerData.cargo} onChange={e=>setRegisterData({...registerData, cargo: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-sm text-white/70">Teléfono</label>
                      <input type="text" className="form-input w-full mt-1 rounded-md p-2" value={registerData.telefono} onChange={e=>setRegisterData({...registerData, telefono: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-white/70">Contraseña*</label>
                    <input type="password" required className="form-input w-full mt-1 rounded-md p-2" value={registerData.password} onChange={e=>setRegisterData({...registerData, password: e.target.value})} />
                  </div>
                  {error && <div className="text-red-400 text-center">{error}</div>}
                  <button type="submit" className="w-full bg-[#ff6a00] hover:bg-[#ff8129] text-white font-bold py-2 rounded-lg transition">{loading ? 'Cargando...' : 'Registrarse'}</button>
                </form>
                <button onClick={()=>loginWithGoogle('/dashboard')} className="w-full mt-2 bg-white/90 hover:bg-white text-neutral-900 font-medium py-2 rounded-lg transition flex items-center justify-center"><span className="mr-2">G</span> Registrarse con Google</button>
                <div className="text-center mt-2">
                  ¿Ya tienes cuenta? <button className="text-[#ff6a00] underline" onClick={()=>{setView('login');setError(null);}}>Inicia sesión</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2"><span className="text-sm text-white/70">© 2025 Preventi Flow</span></div>
        </div>
      </footer>
      <style jsx global>{`
        .glass-form {
          background: rgba(10, 10, 10, 0.4);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 106, 0, 0.2);
        }
        .form-input {
          background-color: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .form-input:focus {
          outline: none;
          border-color: #ff6a00;
          box-shadow: 0 0 0 2px rgba(255, 106, 0, 0.3);
        }
      `}</style>
    </div>
  );
}