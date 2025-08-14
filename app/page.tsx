"use client";
import React from "react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative font-sans">
      <div className="bg-animated absolute inset-0 z-0"></div>
      <main className="relative z-10 flex flex-col items-center justify-center w-full px-4">
        <h1 className="text-white text-4xl md:text-5xl font-semibold tracking-tight mb-6 text-center drop-shadow-lg">
          ¡Bienvenido a Preventi Flow!
        </h1>
        <p className="text-slate-300 text-lg md:text-xl font-normal mb-8 text-center max-w-xl drop-shadow">
          Plataforma de prevención, gestión y automatización.
        </p>
        <div className="flex gap-4">
          <a href="/login?next=/dashboard" className="bg-white/90 hover:bg-white text-neutral-900 font-medium px-8 py-3 rounded-xl text-base shadow transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">Iniciar sesión</a>
          <a href="/register" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-xl text-base shadow transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">Registrarse</a>
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
          background: linear-gradient(100deg, #222 0%, #222 7%, transparent 10%, transparent 12%, #222 16%),
            repeating-linear-gradient(100deg, #60a5fa 10%, #e879f9 15%, #60a5fa 20%, #5eead4 25%, #60a5fa 30%);
          background-size: 300%, 200%;
          background-position: 50% 50%, 50% 50%;
          filter: blur(10px) brightness(0.9) invert(0%);
          mask-image: radial-gradient(ellipse at 100% 0%, black 40%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse at 100% 0%, black 40%, transparent 70%);
          overflow: hidden;
          transition: background 0.2s;
        }
      `}</style>
    </div>
  );
}