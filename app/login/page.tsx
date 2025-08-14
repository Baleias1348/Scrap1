// Página de bienvenida con login seguro
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Extraer token de la URL hash
    const hash = window.location.hash.substring(1);
    if (hash) {
      try {
        const params = new URLSearchParams(hash);
        const token = params.get('access_token');
        setAccessToken(token);
        
        // Limpiar hash de la URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (err) {
        setError('Error al procesar el token de acceso');
      }
    }
  }, []);

  const handleLoginRedirect = () => {
    // Redirigir al proveedor de autenticación
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = encodeURIComponent(window.location.origin + '/login');
    const scope = encodeURIComponent('openid profile email');
    
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirectUri}&` +
      `response_type=token&` +
      `scope=${scope}`;
  };

  useEffect(() => {
    // Redirigir al dashboard si hay token válido
    if (accessToken) {
      const from = searchParams.get('from') || '/dashboard';
      router.replace(from);
    }
  }, [accessToken, router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center relative font-sans">
      <div className="bg-animated"></div>
      <main className="relative z-10 flex flex-col items-center justify-center w-full px-4">
        <h1 className="text-white text-4xl md:text-5xl font-semibold tracking-tight mb-6 text-center drop-shadow-lg">
          ¡Bienvenido!
        </h1>
        <p className="text-slate-300 text-lg md:text-xl font-normal mb-8 text-center max-w-xl drop-shadow">
          Nos alegra tenerte aquí. Por favor inicia sesión para continuar.
        </p>
        
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg text-base shadow transition-colors"
            onClick={handleLoginRedirect}
          >
            Iniciar sesión con Google
          </button>
          
          {error && (
            <p className="text-red-400 text-center mt-4">{error}</p>
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

