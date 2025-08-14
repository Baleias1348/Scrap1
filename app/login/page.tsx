// Página de bienvenida con login seguro (Supabase OAuth + PKCE)
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, loginWithGoogle } = useAuth();

  // Si ya hay usuario autenticado, redirigir al dashboard
  useEffect(() => {
    if (!loading && user) {
      const from = searchParams.get('from') || '/dashboard';
      router.replace(from);
    }
  }, [user, loading, router, searchParams]);

  const handleGoogle = async () => {
    const from = searchParams.get('from') || '/dashboard';
    await loginWithGoogle(from);
  };

  const errorParam = searchParams.get('error');

  return (
    <div className="min-h-screen flex items-center justify-center relative font-sans">
      <div className="bg-animated"></div>
      <main className="relative z-10 flex flex-col items-center justify-center w-full px-4">
        <h1 className="text-white text-4xl md:text-5xl font-semibold tracking-tight mb-6 text-center drop-shadow-lg">
          ¡Bienvenido!
        </h1>
        <p className="text-slate-300 text-lg md:text-xl font-normal mb-8 text-center max-w-xl drop-shadow">
          Inicia sesión para continuar.
        </p>

        <div className="flex flex-col gap-4 w-full max-w-sm">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg text-base shadow transition-colors disabled:opacity-60"
            onClick={handleGoogle}
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Iniciar sesión con Google'}
          </button>

          {errorParam && (
            <p className="text-red-400 text-center mt-2">Error de autenticación: {errorParam}</p>
          )}
        </div>
      </main>
      <style jsx global>{`
        .bg-animated {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          z-index: 0;
          pointer-events: none;
          --stripes: repeating-linear-gradient(
            100deg,
            #222 0%,
            #222 7%,
            transparent 10%,
            transparent 12%,
            #222 16%
          );
          --rainbow: repeating-linear-gradient(
            100deg,
            #60a5fa 10%,
            #e879f9 15%,
            #60a5fa 20%,
            #5eead4 25%,
            #60a5fa 30%
          );
          background-image: var(--stripes), var(--rainbow);
          background-size: 300%, 200%;
          background-position: 50% 50%, 50% 50%;
          filter: blur(10px) brightness(0.9) invert(0%);
          mask-image: radial-gradient(ellipse at 100% 0%, black 40%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse at 100% 0%, black 40%, transparent 70%);
          overflow: hidden;
          transition: background 0.2s;
        }
        .bg-animated::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: var(--stripes), var(--rainbow);
          background-size: 200%, 100%;
          animation: smoothBg 60s linear infinite;
          background-attachment: fixed;
          mix-blend-mode: difference;
          pointer-events: none;
          z-index: 1;
        }
        @keyframes smoothBg {
          0% { background-position: 50% 50%, 50% 50%; }
          100% { background-position: 350% 50%, 350% 50%; }
        }
      `}</style>
    </div>
  );
}
