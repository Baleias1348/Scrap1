"use client";
import React, { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { useRouter } from "next/navigation";
import './standalone-dashboard.css';

export default function HomePage() {
  const [view, setView] = useState<'initial'|'login'|'register'>('initial');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ nombres: '', apellidos: '', email: '', password: '', cargo: '', telefono: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetMsg, setResetMsg] = useState<string|null>(null);
  const { signUp, loginWithPassword } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    console.log('[UI] HomePage hydrated');
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      console.log('[UI] click event', { tag: t?.tagName, id: t?.id, cls: t?.className });
    };
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, []);

  // Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[UI] login:start');
    setLoading(true); setError(null);
    const { email, password } = loginData;
    // Watchdog para evitar quedarse colgado
    const watchdog = setTimeout(() => {
      console.error('[UI] login:timeout 15000ms');
      setLoading(false);
      setError('La solicitud está tardando más de lo esperado. Intenta nuevamente.');
    }, 15000);
    try {
      const res = await loginWithPassword(email, password);
      if (res && 'error' in res && res.error) {
        const msg = (res.error?.message || '').toString();
        console.error('[UI] login:error', { message: msg, code: (res.error as any)?.code });
        setError(msg || 'Credenciales incorrectas');
      } else {
        console.log('[UI] login:success -> redirect /dashboard');
        router.replace('/dashboard');
      }
    } catch (err: any) {
      console.error('[UI] login:exception', err);
      setError(err?.message || 'Error al iniciar sesión');
    } finally {
      clearTimeout(watchdog);
      setLoading(false);
      console.log('[UI] login:end');
    }
  };

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResetMsg(null);
    try {
      const { getSupabaseClient } = await import("../src/lib/supabase");
      const supabase = getSupabaseClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`;
      const { error: rerr } = await supabase.auth.resetPasswordForEmail(loginData.email, { redirectTo });
      if (rerr) {
        setError(rerr.message || 'No se pudo enviar el correo.');
      } else {
        setResetMsg('Hemos enviado un correo con instrucciones para restablecer tu contraseña.');
      }
    } catch (e: any) {
      setError(e?.message || 'Error enviando el correo.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    const { nombres, apellidos, email, password, cargo, telefono } = registerData;
    console.log('[UI] register:start', { email });
    // Watchdog para garantizar salida de estado de carga
    const watchdog = setTimeout(() => {
      console.error('[UI] register:timeout 20000ms');
      setLoading(false);
      setError('La solicitud está tardando más de lo esperado. Revisa tu conexión y vuelve a intentar.');
    }, 20000);
    try {
      const res = await signUp(email, password, { nombres, apellidos, cargo, telefono });
      if (res && 'error' in res && res.error) {
        const msg = (res.error?.message || '').toString();
        console.error('[UI] register:error', msg);
        setError(msg || 'No se pudo registrar.');
      } else {
        console.log('[UI] register:success');
        // Registro exitoso: exigir inicio de sesión manual
        setView('login');
        setError(null);
      }
    } catch (err: any) {
      console.error('[UI] register:exception', err);
      setError(err?.message || 'Error durante el registro.');
    } finally {
      clearTimeout(watchdog);
      setLoading(false);
      console.log('[UI] register:end');
    }
  };



  return (
    <div onClick={()=>console.log('[UI] root:onClick')}
      className="antialiased selection:bg-white/10 selection:text-white text-white min-h-screen flex flex-col" style={{fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto"}}>
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-neutral-950/70 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex h-16 text-2xl font-semibold text-[#ff6a00] items-center justify-between">
            <span>Preventi Flow</span>
            <nav className="hidden md:flex items-center gap-6 text-sm text-white/70">
              <a href="#features" className="hover:text-white transition-colors" onClick={()=>console.log('[UI] click:nav-features')}>Conoce</a>
              <a href="#cards" className="hover:text-white transition-colors" onClick={()=>console.log('[UI] click:nav-documentacion')}>Documentación</a>
              <a href="#insights" className="hover:text-white transition-colors" onClick={()=>console.log('[UI] click:nav-asistencia')}>Asistencia</a>
            </nav>
            <div className="flex items-center gap-2">
              <a href="/admin" className="hidden md:inline-flex items-center h-9 hover:text-white hover:border-orange-400/50 transition-colors text-sm text-orange-400/80 border-orange-400/20 border rounded-lg pr-3 pl-3">Admin</a>
              <button onClick={()=>{ console.log('[UI] click:header-login'); setView('login'); setLoading(false); setError(null); setResetOpen(false); }} className="hidden sm:inline-flex items-center h-9 hover:text-white hover:border-white/20 transition-colors text-sm text-white/80 border-white/10 border rounded-lg pr-3 pl-3">Iniciar sesión</button>
              <button onClick={()=>{ console.log('[UI] click:header-register'); setView('register'); setLoading(false); setError(null); setResetOpen(false); }} className="inline-flex items-center h-9 hover:bg-white/90 transition-colors text-sm font-medium text-slate-50 bg-[#ff6a00] border-[#ff6a00] rounded-lg pr-3 pl-3">Registrarse<span className="ml-1">→</span></button>
            </div>
          </div>
        </div>
      </header>
      {/* Hero + Formulario */}
      <section className="relative overflow-hidden flex-1">
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] bg-fuchsia-500/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-48 -right-40 w-[520px] h-[520px] bg-indigo-500/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="max-w-7xl md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 mx-auto pt-16 px-6 pb-16">
          <div className="lg:col-span-6 flex flex-col -translate-y-12 pr-4 pl-1 translate-x-2 translate-y-2 justify-center">
            <div className="inline-flex gap-2 w-max text-xs text-white/80 bg-white/5 border-white/10 border rounded-full mb-4 pt-1 pr-2.5 pb-1 pl-2.5 backdrop-blur-lg items-center">Conoce más<span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400"></span></div>
            <h1 className="sm:text-5xl md:text-6xl lg:text-7xl leading-tight text-4xl font-semibold text-[#ff6a00] tracking-tight">Preventi Flow<br className="hidden md:block" /></h1>
            <p className="sm:text-lg leading-relaxed -translate-x-16 text-base text-slate-50 mt-4 mr-20 ml-20">Automatiza todos tus procesos de gestión en la Prevención de Riesgos Laborales</p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button onClick={()=>{ console.log('[UI] click:hero-register'); setView('register'); setLoading(false); setError(null); setResetOpen(false); }} className="inline-flex items-center justify-center h-11 hover:bg-white/90 transition shadow-[0_2.8px_2.2px_rgba(0,_0,_0,_0.034),_0_6.7px_5.3px_rgba(0,_0,_0,_0.048),_0_12.5px_10px_rgba(0,_0,_0,_0.06),_0_22.3px_17.9px_rgba(0,_0,_0,_0.072),_0_41.8px_33.4px_rgba(0,_0,_0,_0.086),_0_100px_80px_rgba(0,_0,_0,_0.12)] text-sm font-bold text-slate-50 bg-slate-950 border-[#ff6a00] border-0 rounded-xl pr-4 pl-4">Crea una cuenta<svg width="18" height="18" viewBox="0 0 24 24" className="ml-1.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg></button>
              <button onClick={()=>{ console.log('[UI] click:hero-login'); setView('login'); setLoading(false); setError(null); setResetOpen(false); }} className="inline-flex items-center justify-center h-11 hover:text-white hover:border-white/20 transition shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_3px_3px_-1.5px_rgba(0,0,0,0.06),_0px_6px_6px_-3px_rgba(0,0,0,0.06),0px_12px_12px_-6px_rgba(0,0,0,0.06),0px_24px_24px_-12px_rgba(0,0,0,0.06)] text-sm text-white/90 border-white/10 border rounded-xl pr-4 pl-4 backdrop-blur-lg">Ingresa a tu dashboard<svg width="18" height="18" viewBox="0 0 24 24" className="ml-1.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg></button>
            </div>
            <div className="mt-6 flex items-center gap-4 text-xs text-white/60">
              <div className="flex -space-x-2"></div>
            </div>
          </div>
          <div className="lg:col-span-6">
            {/* Aquí insertamos el bloque de tarjetas visuales y el formulario dinámico React como en el HTML legacy */}
            {view === 'initial' && (
              <div className="relative sm:p-6 shadow-[0_2.8px_2.2px_rgba(0,_0,_0,_0.034),_0_6.7px_5.3px_rgba(0,_0,_0,_0.048),_0_12.5px_10px_rgba(0,_0,_0,_0.06),_0_22.3px_17.9px_rgba(0,_0,_0,_0.072),_0_41.8px_33.4px_rgba(0,_0,_0,_0.086),_0_100px_80px_rgba(0,_0,_0,_0.12)] bg-gradient-to-b from-white/[0.03] to-transparent border-white/10 border rounded-3xl pt-4 pr-4 pb-4 pl-4 backdrop-blur-lg">
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-12 md:col-span-6 space-y-3">
                    <div className="group relative h-48 sm:h-56 rounded-2xl overflow-hidden border border-white/10 bg-neutral-900">
                      <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/8d57793a-634a-4c7d-9968-fced612582e1_800w.jpg" alt="Product board" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-neutral-950/20 to-transparent"></div>
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-white/60">Asistente AI</p>
                          <p className="text-lg font-semibold tracking-tight">Optimización de flujos de trabajo</p>
                        </div>
                        <span className="inline-flex items-center h-8 text-xs text-white/80 bg-white/5 border-white/10 border rounded-lg pr-2 pl-2">
                          <svg width="18" height="18" viewBox="0 0 24 24" className="mr-1" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 3v18h18"></path><path d="M19 9l-6 6-4-4-4 4"></path></svg>
                          Trend
                        </span>
                      </div>
                    </div>
                    <div className="relative h-28 rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02]">
                      <div className="absolute inset-0 flex items-center justify-between px-4">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 7h18"></path><path d="M6 4h12v16H6z"></path><path d="M8 11h8"></path><path d="M8 15h5"></path></svg>
                          </span>
                          <div>
                            <p className="text-sm font-medium tracking-tight">Capacitaciones</p>
                            <p className="text-xs text-white/60">Recursos de apoyo</p>
                          </div>
                        </div>
                        <button className="inline-flex h-8 hover:bg-white/90 transition text-xs font-medium text-neutral-900 bg-white rounded-lg pr-2 pl-2 items-center">Abrir<svg width="16" height="16" viewBox="0 0 24 24" className="ml-1" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg></button>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-6 space-y-3">
                    <div className="relative h-28 rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02]">
                      <div className="absolute inset-0 flex items-center justify-between px-4">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]" style={{width: 18, height: 18, color: '#fff'}}><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"></path></svg>
                          </span>
                          <div>
                            <p className="text-sm font-medium tracking-tight">Informes y estadísticas</p>
                            <p className="text-xs text-white/60">Auto-link PRs to issues</p>
                          </div>
                        </div>
                        <span className="text-xs text-emerald-400">Sincornizado</span>
                      </div>
                    </div>
                    <div className="group relative h-48 sm:h-56 rounded-2xl overflow-hidden border border-white/10 bg-neutral-900">
                      <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/89eb3a29-9852-4008-8865-22926b2c8cb0_800w.jpg" alt="Deployment" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-neutral-950/20 to-transparent"></div>
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-white/60">Todo en un solo lugar</p>
                          <p className="text-lg font-semibold tracking-tight">Centro de documentos</p>
                        </div>
                        <span className="inline-flex items-center h-8 text-xs text-white/80 bg-white/5 border-white/10 border rounded-lg pr-2 pl-2">Mi Bucket</span>
                      </div>
                    </div>
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
                <div className="text-center text-sm text-white/80">
                  <button className="underline hover:text-white" onClick={() => { setResetOpen(v=>!v); setResetMsg(null); setError(null); }}>
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                {resetOpen && (
                  <form onSubmit={handleSendReset} className="space-y-3 mt-2">
                    <div>
                      <label className="text-sm text-white/70">Email</label>
                      <input type="email" required className="form-input w-full mt-1 rounded-md p-2" value={loginData.email} onChange={e=>setLoginData({...loginData, email: e.target.value})} />
                    </div>
                    {resetMsg && <div className="text-emerald-400 text-center">{resetMsg}</div>}
                    <button type="submit" className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-2 rounded-lg transition">{loading ? 'Enviando...' : 'Enviar correo de restablecimiento'}</button>
                  </form>
                )}
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
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/70"> 2025 Preventi Flow</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-white/60">
            <a href="#" className="hover:text-white">Contacto</a>
            <a href="#" className="hover:text-white">Terminos</a>
            <a href="#" className="hover:text-white">Privacidad</a>
          </div>
        </div>
      </footer>
    </div>
);
}