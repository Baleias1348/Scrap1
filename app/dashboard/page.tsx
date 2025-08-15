"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const { user, loading, org, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [loading, user, router]);

  if (loading) {
    return (<div className="flex items-center justify-center h-screen">Cargando...</div>);
  }
  if (!user) {
    return null;
  }

  if (!org) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-lg font-semibold mb-2">¡Bienvenido/a, {user.email}!</div>
        <div className="mb-4">Aún no tienes una organización. Por favor créala para continuar.</div>
        <button onClick={logout} className="px-4 py-2 bg-fuchsia-700 text-white rounded">Cerrar sesión</button>
      </div>
    );
  }

  const [chatOpen, setChatOpen] = React.useState(false);

  return (
    <div className="relative min-h-screen bg-black bg-cover bg-center bg-no-repeat" style={{backgroundImage: "url('https://images.unsplash.com/photo-1634655377962-e6e7b446e7e9?w=2160&q=80')", fontFamily: 'Inter, Montserrat, Arial, sans-serif'}}>
      {/* Header */}
      <header className="fixed w-full z-50 glass-border fade-in pl-56">
        <div className="max-w-6xl mx-auto px-0 py-4 flex items-center justify-between relative">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-6 h-6 bg-violet-500 bg-[url(https://images.unsplash.com/photo-1636690581110-a512fed05fd3?w=1080&q=80)] bg-cover rounded-md"></div>
            <span className="text-xl font-bold tracking-tight text-white drop-shadow">Preventi Flow</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300">Org: <span className="font-semibold">{org.nombre_organizacion || '(Sin nombre)'}</span></span>
            <button onClick={logout} className="px-3 py-1 bg-fuchsia-700 text-white rounded">Cerrar sesión</button>
          </div>
        </div>
      </header>

      {/* Sidebar (placeholder, puedes migrar el real luego) */}
      <aside className="fixed left-0 top-0 h-full w-56 bg-black/60 glass-border pt-20 z-40 hidden md:block">
        <nav className="flex flex-col gap-2 p-6 text-white/80">
          <a href="#" className="hover:text-white transition-colors">Inicio</a>
          <a href="#" className="hover:text-white transition-colors">Documentos</a>
          <a href="#" className="hover:text-white transition-colors">Estadísticas</a>
          <a href="#" className="hover:text-white transition-colors">Configuración</a>
        </nav>
      </aside>

      {/* Main content */}
      <main className="main-content min-h-screen pt-24 md:pl-56 flex flex-col items-center justify-start relative">
        {/* Botón para invocar el agente AI */}
        <button
          className="fixed bottom-10 right-10 z-50 bg-gradient-to-r from-teal-400 to-blue-400 text-black font-bold px-6 py-3 rounded-full shadow-lg text-lg hover:scale-105 transition"
          style={{display: chatOpen ? 'none' : 'block'}}
          onClick={() => setChatOpen(true)}
        >
          Invocar agente AI
        </button>
        {/* Tarjetas inteligentes */}
        {!chatOpen && (
          <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8 fade-in">
            {/* Card 1 */}
            <div className="glass-card rounded-2xl p-8 flex flex-col items-start shadow-lg animate-slide-up delay-200">
              <h2 className="text-2xl font-semibold mb-2 text-[#5eead4]">Resumen de Actividad</h2>
              <p className="text-gray-200 mb-4">Visualiza la actividad reciente de tu organización y los principales KPIs.</p>
              <button className="mt-auto px-4 py-2 bg-[#5eead4] text-black rounded font-semibold hover:bg-[#60a5fa] transition">Ver detalles</button>
            </div>
            {/* Card 2 */}
            <div className="glass-card rounded-2xl p-8 flex flex-col items-start shadow-lg animate-slide-up delay-400">
              <h2 className="text-2xl font-semibold mb-2 text-[#60a5fa]">Documentos Clave</h2>
              <p className="text-gray-200 mb-4">Accede rápidamente a documentos, informes y certificados importantes.</p>
              <button className="mt-auto px-4 py-2 bg-[#60a5fa] text-black rounded font-semibold hover:bg-[#5eead4] transition">Ir a documentos</button>
            </div>
            {/* Card 3 */}
            <div className="glass-card rounded-2xl p-8 flex flex-col items-start shadow-lg animate-slide-up delay-600">
              <h2 className="text-2xl font-semibold mb-2 text-[#a78bfa]">Estadísticas</h2>
              <p className="text-gray-200 mb-4">Consulta estadísticas y gráficos sobre cumplimiento y gestión de riesgos.</p>
              <button className="mt-auto px-4 py-2 bg-[#a78bfa] text-black rounded font-semibold hover:bg-[#5eead4] transition">Ver estadísticas</button>
            </div>
          </div>
        )}
        {/* ChatWidget AI */}
        <React.Suspense fallback={null}>
          {chatOpen && (
            <>
              <div className="fixed inset-0 bg-black/60 z-40" onClick={()=>setChatOpen(false)} />
              <div className="fixed z-50 left-1/2 top-1/2" style={{transform: 'translate(-50%, -50%)'}}>
                {/* Import dinámico para evitar SSR issues */}
                {typeof window !== 'undefined' && (
                  require('../components/ChatWidget').default({ visible: true, onClose: () => setChatOpen(false) })
                )}
              </div>
            </>
          )}
        </React.Suspense>
      </main>
      {/* Animaciones y glassmorphism */}
      <style jsx global>{`
        .glass-border {
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          background: rgba(255, 255, 255, 0.02);
        }
        .glass-card {
          border: 1px solid rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(16px);
          background: rgba(255, 255, 255, 0.03);
        }
        @keyframes fadeIn { to { opacity: 1; } }
        .fade-in { animation: fadeIn 0.8s ease-out forwards; opacity: 0; }
        @keyframes slideUp { to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slideUp 0.8s ease-out forwards; opacity: 0; transform: translateY(30px); }
        .delay-200 { animation-delay: 0.2s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-600 { animation-delay: 0.6s; }
      `}</style>
    </div>
  );
}