"use client";
import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";
import ChatComponent from "../components/ChatComponent";

export default function Dashboard() {
  // Referencias para VANTA y blur
  const vantaRef = useRef<HTMLDivElement>(null);
  const blurRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [submenu, setSubmenu] = useState<string | null>(null);
  const [bgVisible, setBgVisible] = useState(true);
  const [lightMode, setLightMode] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownMobileOpen, setDropdownMobileOpen] = useState(false);
  // --- Eliminado el chat simulado, ahora se usará el componente real de la agente AI ---
  useEffect(() => {
    let vantaEffect: any = null;
    if (typeof window !== "undefined" && window.VANTA && vantaRef.current) {
      vantaEffect = window.VANTA.NET({
        el: vantaRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0x5E6AD2,
        backgroundColor: 0x101014,
        points: 8.00,
        maxDistance: 25.00,
        spacing: 20.00
      });
    }
    return () => { if (vantaEffect && vantaEffect.destroy) vantaEffect.destroy(); };
  }, [bgVisible]);

  // Manejo de submenús sidebar
  const handleSidebarMenu = (name: string) => {
    setSubmenu(submenu === name ? null : name);
  };

  // Toggle fondo animado
  const handleToggleBg = () => {
    setBgVisible((v) => !v);
  };

  // Toggle tema claro/oscuro
  const handleToggleTheme = () => {
    setLightMode((m) => !m);
    document.body.classList.toggle("lightmode");
  };

  // Dropdown usuario
  const handleDropdown = () => setDropdownOpen((o) => !o);
  const handleDropdownMobile = () => setDropdownMobileOpen((o) => !o);

  return (
    <>
      {/* Fuentes y CSS externos */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://unpkg.com/lucide@latest/dist/lucide.css" />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js" strategy="beforeInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js" strategy="beforeInteractive" />
      {/* Fondo animado y blur */}
      <div className="relative min-h-screen font-sans" style={{ fontFamily: "Inter, sans-serif" }}>
        {/* Fondo animado VANTA */}
        {bgVisible && <div ref={vantaRef} id="vanta-bg" className="absolute inset-0 z-0" />}
        {bgVisible && <div ref={blurRef} id="blur-bg" className="absolute top-1/2 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 bg-[#5E6AD2] opacity-10 blur-[100px] rounded-full pointer-events-none" />}
        {/* Sidebar y contenido principal */}
        <div className="flex">
          {/* Sidebar */}
          <div className={`fixed top-0 left-0 h-screen w-64 z-20 overflow-auto flex flex-col bg-[#15151B] border-[rgba(255,255,255,0.1)] border-r transition-transform duration-200 sidebar-mobile sm:translate-x-0 sm:relative sm:z-20 flex-shrink-0 ${sidebarOpen ? 'show' : ''}`}
            style={{ transform: sidebarOpen ? 'translateX(0)' : '', zIndex: 20 }}>
            <div className="p-5 flex items-center border-b border-[rgba(255,255,255,0.1)] hidden sm:flex">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[28px] h-[28px]" style={{ color: 'rgb(252, 211, 77)' }}><circle cx="12" cy="12" r="3"></circle><path d="M12 16.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 1 1 4.5 4.5 4.5 4.5 0 1 1-4.5 4.5"></path><path d="M12 7.5V9"></path><path d="M7.5 12H9"></path><path d="M16.5 12H15"></path><path d="M12 16.5V15"></path><path d="m8 8 1.88 1.88"></path><path d="M14.12 9.88 16 8"></path><path d="m8 16 1.88-1.88"></path><path d="M14.12 14.12 16 16"></path></svg>
              <span className="text-xl font-normal text-cyan-400 font-playfair ml-3">Preventi Flow</span>
            </div>
            <div className="p-5">
              <button className="w-full hover:bg-[#7b85e2] transition-all duration-150 flex hover:scale-[1.03] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E6AD2]/70 group text-sm text-white bg-[#5E6AD2] rounded-md pt-2 pr-4 pb-2 pl-4 shadow-sm items-center justify-center">
                <svg className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <line x1="4" y1="7" x2="20" y2="7"></line>
                  <line x1="4" y1="12" x2="20" y2="12"></line>
                  <line x1="4" y1="17" x2="20" y2="17"></line>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Nuevo chat
              </button>
            </div>
            <div className="uppercase text-xs font-medium text-gray-400 pt-2 pr-3 pb-2 pl-3 consultas-label">Consultas recientes</div>
            <div className="space-y-1 px-3">
              <a href="#" className="flex items-center py-2 px-3 rounded-md bg-[#232337] transition-all duration-150 hover:bg-[#353559] group ring-1 ring-[#5E6AD2]/30 shadow-sm relative consultas-link">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#5E6AD2] rounded-r-full"></span>
                <svg className="w-4 h-4 mr-3 text-[#5E6AD2] group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                </svg>
                <span>Plan de emergencia</span>
              </a>
              <a href="#" className="flex items-center py-2 px-3 rounded-md hover:bg-[#232337] transition-all duration-150 group consultas-link">
                <svg className="w-4 h-4 mr-3 text-gray-400 group-hover:scale-110 group-hover:text-[#5E6AD2] transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                </svg>
                <span>Documentos firmados</span>
              </a>
              <a href="#" className="flex items-center py-2 px-3 rounded-md hover:bg-[#232337] transition-all duration-150 group consultas-link">
                <svg className="w-4 h-4 mr-3 text-gray-400 group-hover:scale-110 group-hover:text-[#5E6AD2] transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                </svg>
                <span>Biblioteca legal</span>
              </a>
            </div>
            <div className="px-3 py-2 mt-6 text-xs font-medium text-gray-400 uppercase">Herramientas</div>
            <div className="space-y-1 px-3 mb-8">
              <div className="relative group sidebar-menu-item" onMouseEnter={() => handleSidebarMenu('inspecciones')} onMouseLeave={() => handleSidebarMenu('inspecciones')}>
                <a href="#" className="flex items-center py-2 px-3 rounded-md hover:bg-[#232337] transition-all duration-150 group">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 group-hover:scale-110 group-hover:text-[#5E6AD2] transition-all duration-200 w-[16px] h-[16px]" style={{ color: 'rgb(94, 106, 210)' }}><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                  <span className="text-sm text-cyan-400">Inspecciones</span>
                  <svg className="w-4 h-4 ml-auto text-gray-400 group-hover:text-[#5E6AD2] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </a>
                {submenu === 'inspecciones' && (
                  <div className="absolute left-full top-0 ml-1 w-36 bg-[#232337] border border-[#5E6AD2]/20 rounded-md shadow-lg opacity-100 pointer-events-auto transition-all duration-200 z-30 sidebar-submenu visible">
                    <a href="#" className="block px-4 py-2 text-gray-200 hover:bg-[#353559] transition-colors duration-100">sub1</a>
                    <a href="#" className="block px-4 py-2 text-gray-200 hover:bg-[#353559] transition-colors duration-100">sub2</a>
                    <a href="#" className="block px-4 py-2 text-gray-200 hover:bg-[#353559] transition-colors duration-100">sub3</a>
                  </div>
                )}
              </div>
              <div className="relative group sidebar-menu-item" onMouseEnter={() => handleSidebarMenu('capacitaciones')} onMouseLeave={() => handleSidebarMenu('capacitaciones')}>
                <a href="#" className="flex items-center py-2 px-3 rounded-md hover:bg-[#232337] transition-all duration-150 group">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 group-hover:scale-110 group-hover:text-[#5E6AD2] transition-all duration-200 w-[16px] h-[16px]" style={{ color: 'rgb(94, 106, 210)' }}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  <span className="text-sm text-cyan-400">Capacitaciones</span>
                  <svg className="w-4 h-4 ml-auto text-gray-400 group-hover:text-[#5E6AD2] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </a>
                {submenu === 'capacitaciones' && (
                  <div className="absolute left-full top-0 ml-1 w-36 bg-[#232337] border border-[#5E6AD2]/20 rounded-md shadow-lg opacity-100 pointer-events-auto transition-all duration-200 z-30 sidebar-submenu visible">
                    <a href="#" className="block px-4 py-2 text-gray-200 hover:bg-[#353559] transition-colors duration-100">sub1</a>
                    <a href="#" className="block px-4 py-2 text-gray-200 hover:bg-[#353559] transition-colors duration-100">sub2</a>
                    <a href="#" className="block px-4 py-2 text-gray-200 hover:bg-[#353559] transition-colors duration-100">sub3</a>
                  </div>
                )}
              </div>
              <div className="relative group sidebar-menu-item" onMouseEnter={() => handleSidebarMenu('estadisticas')} onMouseLeave={() => handleSidebarMenu('estadisticas')}>
                <a href="#" className="flex items-center py-2 px-3 rounded-md hover:bg-[#232337] transition-all duration-150 group">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 group-hover:scale-110 group-hover:text-[#5E6AD2] transition-all duration-200 w-[16px] h-[16px]" style={{ color: 'rgb(94, 106, 210)' }}><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"></path></svg>
                  <span className="text-sm text-cyan-400">Estadísticas</span>
                  <svg className="w-4 h-4 ml-auto text-gray-400 group-hover:text-[#5E6AD2] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </a>
                {submenu === 'estadisticas' && (
                  <div className="absolute left-full top-0 ml-1 w-36 bg-[#232337] border border-[#5E6AD2]/20 rounded-md shadow-lg opacity-100 pointer-events-auto transition-all duration-200 z-30 sidebar-submenu visible">
                    <a href="#" className="block px-4 py-2 text-gray-200 hover:bg-[#353559] transition-colors duration-100">sub1</a>
                    <a href="#" className="block px-4 py-2 text-gray-200 hover:bg-[#353559] transition-colors duration-100">sub2</a>
                    <a href="#" className="block px-4 py-2 text-gray-200 hover:bg-[#353559] transition-colors duration-100">sub3</a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content (chat y topbar) */}
          <div className="ml-64 relative z-10 flex flex-col min-h-screen flex-1">
            {/* Topbar */}
            <div className="h-16 flex fixed top-0 left-0 sm:left-64 right-0 z-30 bg-[#101014] border-[rgba(255,255,255,0.1)] border-b pr-6 pl-6 items-center justify-between" style={{ position: 'fixed', right: 0, top: 0, zIndex: 30 }}>
              <div className="flex items-center sm:hidden">
                <button className="mr-2 p-2 rounded-md hover:bg-[#232337] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E6AD2]/70" aria-label="Abrir menú" type="button" onClick={() => setSidebarOpen(true)}>
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <line x1="4" y1="7" x2="20" y2="7"></line>
                    <line x1="4" y1="12" x2="20" y2="12"></line>
                    <line x1="4" y1="17" x2="20" y2="17"></line>
                  </svg>
                </button>
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[28px] h-[28px] flex-shrink-0" style={{ color: 'rgb(252, 211, 77)' }}><circle cx="12" cy="12" r="3"></circle><path d="M12 16.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 1 1 4.5 4.5 4.5 4.5 0 1 1-4.5 4.5"></path><path d="M12 7.5V9"></path><path d="M7.5 12H9"></path><path d="M16.5 12H15"></path><path d="M12 16.5V15"></path><path d="m8 8 1.88 1.88"></path><path d="M14.12 9.88 16 8"></path><path d="m8 16 1.88-1.88"></path><path d="M14.12 14.12 16 16"></path></svg>
                  <span className="text-xl font-normal text-cyan-400 font-playfair ml-2">Preventi Flow</span>
                </span>
              </div>
              {/* ...topbar desktop... */}
              <div className="hidden sm:flex items-center space-x-1 relative ml-auto">
                {/* ...botones de topbar desktop... */}
              </div>
            </div>
            {/* Chat Preventi Flow AI */}
            <ChatComponent />
          </div>
        </div>
      </div>
    </>
  );
}
