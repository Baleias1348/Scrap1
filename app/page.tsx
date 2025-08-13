"use client";
import React, { useEffect, useRef } from "react";
import ChatComponent from "./components/ChatComponent";

export default function HomePage() {
  // Referencia para el fondo animado
  const vantaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let vantaEffect: any;
    if (typeof window !== "undefined" && window.VANTA && vantaRef.current) {
      vantaEffect = window.VANTA.NET({
        el: vantaRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        color: 0x5E6AD2,
        backgroundColor: 0x101014,
        points: 8.0,
        maxDistance: 25.0,
        spacing: 20.0
      });
    }
    return () => {
      if (vantaEffect && vantaEffect.destroy) vantaEffect.destroy();
    };
  }, []);

  return (
    <div className="relative min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Fondo animado y blur azul SIEMPRE detrás */}
      <div ref={vantaRef} id="vanta-bg" className="absolute inset-0 z-0" />
      <div id="blur-bg" className="absolute top-1/2 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 bg-[#5E6AD2] opacity-10 blur-[100px] rounded-full pointer-events-none z-0"></div>
      {/* Sidebar avanzada */}
      <div className="fixed top-0 left-0 h-screen w-64 z-20 overflow-auto flex flex-col bg-[#15151B] border-[rgba(255,255,255,0.1)] border-r">
        <div className="p-5 flex items-center border-b border-[rgba(255,255,255,0.1)]">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[28px] h-[28px]" style={{ color: 'rgb(252, 211, 77)' }}><circle cx="12" cy="12" r="3"></circle><path d="M12 16.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 1 1 4.5 4.5 4.5 4.5 0 1 1-4.5 4.5"></path><path d="M12 7.5V9"></path><path d="M7.5 12H9"></path><path d="M16.5 12H15"></path><path d="M12 16.5V15"></path><path d="m8 8 1.88 1.88"></path><path d="M14.12 9.88 16 8"></path><path d="m8 16 1.88-1.88"></path><path d="M14.12 14.12 16 16"></path></svg>
          <span className="text-xl font-normal text-cyan-400 font-playfair ml-3">Preventi Flow</span>
        </div>
        <div className="p-5">
          <button className="w-full hover:bg-[#7b85e2] transition-all duration-150 flex hover:scale-[1.03] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E6AD2]/70 group text-sm text-white bg-[#5E6AD2] rounded-md pt-2 pr-4 pb-2 pl-4 shadow-sm items-center justify-center">
            <svg className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Nuevo chat
          </button>
        </div>
        <div className="uppercase text-xs font-medium text-gray-400 pt-2 pr-3 pb-2 pl-3">Consultas recientes</div>
        <div className="space-y-1 px-3">
          <a href="#" className="flex items-center py-2 px-3 rounded-md bg-[#232337] transition-all duration-150 hover:bg-[#353559] group ring-1 ring-[#5E6AD2]/30 shadow-sm relative">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#5E6AD2] rounded-r-full"></span>
            <svg className="w-4 h-4 mr-3 text-[#5E6AD2] group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
            </svg>
            <span>Plan de emergencia</span>
          </a>
          <a href="#" className="flex items-center py-2 px-3 rounded-md hover:bg-[#232337] transition-all duration-150 group">
            <svg className="w-4 h-4 mr-3 text-gray-400 group-hover:scale-110 group-hover:text-[#5E6AD2] transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
            </svg>
            <span>Documentos firmados</span>
          </a>
          <a href="#" className="flex items-center py-2 px-3 rounded-md hover:bg-[#232337] transition-all duration-150 group">
            <svg className="w-4 h-4 mr-3 text-gray-400 group-hover:scale-110 group-hover:text-[#5E6AD2] transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
            </svg>
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