// Página de bienvenida con login semi-manual y lógica de token
// Cambio menor para forzar commit y build - 2025-08-13 20:57
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginManual() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hash) {
        const params = new URLSearchParams(window.location.hash.substring(1));
        const token = params.get('access_token');
        setAccessToken(token);
        // Limpia el hash visualmente
        window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
      }
    }
  }, []);

  const handleContinue = () => {
    if (accessToken) {
      localStorage.setItem('access_token', accessToken);
      const from = searchParams.get('from') || '/dashboard-index';
      router.replace(from);
    }
  };

  return (
    <body className="min-h-screen flex items-center justify-center relative font-sans">
      <div className="bg-animated"></div>
      <main className="relative z-10 flex flex-col items-center justify-center w-full px-4">
        <h1 className="text-white text-4xl md:text-5xl font-semibold tracking-tight mb-6 text-center drop-shadow-lg">
          ¡Bienvenido!
        </h1>
        <p className="text-slate-300 text-lg md:text-xl font-normal mb-8 text-center max-w-xl drop-shadow">
          Nos alegra tenerte aquí. Explora nuevas posibilidades y comienza tu experiencia ahora mismo.
        </p>
        <button
          className="bg-white/90 hover:bg-white text-neutral-900 font-medium px-8 py-3 rounded-xl text-base shadow transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          onClick={handleContinue}
          disabled={!accessToken}
        >
          Entrar
        </button>
        {!accessToken && (
          <p className="text-red-400 mt-4">No se detectó token de sesión. Por favor, inicia sesión nuevamente.</p>
        )}
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
    </body>
  );
}

          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Por favor inicia sesión para continuar
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div>
            <button
              onClick={() => loginWithGoogle(from)}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </>
              ) : (
                <>
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <svg className="h-5 w-5 text-blue-500 group-hover:text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.166 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0110 4.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.7 1.028 1.592 1.028 2.683 0 3.842-2.34 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.14 18.16 20 14.42 20 10c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                    </svg>
                  </span>
                  Continuar con Google
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
