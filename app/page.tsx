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
          <a href="/login" className="bg-white/90 hover:bg-white text-neutral-900 font-medium px-8 py-3 rounded-xl text-base shadow transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">Iniciar sesión</a>
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

import React, { useEffect, useRef } from "react";
import ChatComponent from "./components/ChatComponent";

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
          <a href="/login" className="bg-white/90 hover:bg-white text-neutral-900 font-medium px-8 py-3 rounded-xl text-base shadow transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">Iniciar sesión</a>
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
            <span>Biblioteca legal</span>
          </a>
        </div>
        <div className="px-3 py-2 mt-6 text-xs font-medium text-gray-400 uppercase">Herramientas</div>
        <div className="space-y-1 px-3 mb-8">
          {/* Inspecciones submenu */}
          <div className="relative group">
            <a href="#" className="flex items-center py-2 px-3 rounded-md hover:bg-[#232337] transition-all duration-150 group">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 group-hover:scale-110 group-hover:text-[#5E6AD2] transition-all duration-200 w-[16px] h-[16px]" style={{ color: 'rgb(94, 106, 210)' }}><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
              <span className="text-sm text-cyan-400">Inspecciones</span>
              <svg className="w-4 h-4 ml-auto text-gray-400 group-hover:text-[#5E6AD2] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </a>
            <div className="absolute left-full top-0 ml-1 w-36 bg-[#232337] border border-[#5E6AD2]/20 rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-30">
              <a href="#" className="block px-4 py-2 text-gray-200 hover:bg-[#353559] transition-colors duration-100">sub1</a>
              <a href="#" className="block px-4 py-2 text-gray-200 hover:bg-[#353559] transition-colors duration-100">sub2</a>
              <a href="#" className="block px-4 py-2 text-gray-200 hover:bg-[#353559] transition-colors duration-100">sub3</a>
            </div>
          </div>
          {/* Capacitaciones submenu */}
          <div className="relative group">
            <a href="#" className="flex items-center py-2 px-3 rounded-md hover:bg-[#232337] transition-all duration-150 group">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 group-hover:scale-110 group-hover:text-[#5E6AD2] transition-all duration-200 w-[16px] h-[16px]" style={{ color: 'rgb(94, 106, 210)' }}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <span className="text-sm text-cyan-400">Capacitaciones</span>
              <svg className="w-4 h-4 ml-auto text-gray-400 group-hover:text-[#5E6AD2] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </a>
            <div className="absolute left-full top-0 ml-1 w-36 bg-[#232337] border border-[#5E6AD2]/20 rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-30">
              <a href="#" className="block px-4 py-2 text-gray-200 hover:bg-[#353559] transition-colors duration-100">sub1</a>
              <a href="#" className="block px-4 py-2 text-gray-200 hover:bg-[#353559] transition-colors duration-100">sub2</a>
              <a href="#" className="block px-4 py-2 text-gray-200 hover:bg-[#353559] transition-colors duration-100">sub3</a>
            </div>
          </div>
          {/* Estadísticas submenu */}
          <div className="relative group">
            <a href="#" className="flex items-center py-2 px-3 rounded-md hover:bg-[#232337] transition-all duration-150 group">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 group-hover:scale-110 group-hover:text-[#5E6AD2] transition-all duration-200 w-[16px] h-[16px]" style={{ color: 'rgb(94, 106, 210)' }}><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"></path></svg>
              <span className="text-sm text-cyan-400">Estadísticas</span>
              <svg className="w-4 h-4 ml-auto text-gray-400 group-hover:text-[#5E6AD2] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </a>
            <div className="absolute left-full top-0 ml-1 w-36 bg-[#232337] border border-[#5E6AD2]/20 rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-30">
              <a href="#" className="block px-4 py-2 text-gray-200 hover:bg-[#353559] transition-colors duration-100">sub1</a>
              <a href="#" className="block px-4 py-2 text-gray-200 hover:bg-[#353559] transition-colors duration-100">sub2</a>
              <a href="#" className="block px-4 py-2 text-gray-200 hover:bg-[#353559] transition-colors duration-100">sub3</a>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content (con Chat y Topbar) */}
      <div className="ml-64 relative z-10 flex flex-col min-h-screen">
        {/* Topbar */}
        <div className="h-16 flex sticky top-0 z-30 bg-[#101014] border-[rgba(255,255,255,0.1)] border-b pr-6 pl-6 items-center justify-between">
          <div className="flex text-slate-100 bg-slate-600 hue-rotate-15 space-x-4 items-center">
            <button className="p-2 rounded-md hover:bg-[#232337] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E6AD2]/70" title="Buscar">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </button>
            <span className="hover:text-[#5E6AD2] cursor-pointer transition-colors duration-150 text-sm text-slate-400 font-roboto -translate-x-4">Buscar dentro de Preventi Flow</span>
          </div>
          <div className="flex items-center space-x-3 relative">
            <button className="p-2 rounded-md hover:bg-[#232337] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E6AD2]/70" title="Notificaciones">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
            </button>
            <button className="p-2 rounded-md hover:bg-[#232337] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E6AD2]/70" title="Configuración">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            </button>
            <div className="relative">
              <button id="user-menu" className="w-8 h-8 rounded-full bg-[#5E6AD2] flex items-center justify-center hover:ring-2 hover:ring-[#7b85e2] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#5E6AD2]/70" aria-haspopup="true">
                <span className="text-sm font-semibold">JD</span>
              </button>
              {/* Aquí iría el dropdown funcional de usuario */}
            </div>
          </div>
        </div>
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto pt-8 pr-6 pb-8 pl-6">
          <ChatComponent />
        </div>
        {/* Input Area */}
        {/* El input ya está integrado en ChatComponent */}
      </div>
    </div>
  );
}