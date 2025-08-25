// import DashboardOliviaMartin from '../DashboardOliviaMartin';

// ===========================================================
//  ¡IMPORTANTE! Dashboard principal migrado a React.
//  NO BORRAR NI SOBRESCRIBIR sin revisión y respaldo.
// ===========================================================

"use client";
import React, { useRef, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Bar, Doughnut } from "react-chartjs-2";
import ChatWindow from "../components/ChatWindow";
import Documentacion from "../components/Documentacion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";
import "../standalone-dashboard.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const barData = {
  labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago'],
  datasets: [
    {
      label: 'Vendas',
      data: [12000, 19000, 13000, 15000, 22000, 29000, 24000, 31000],
      backgroundColor: (context: import('chart.js').ScriptableContext<'bar'>) => {
        const chart = context.chart;
        const {ctx, chartArea} = chart;
        if (!chartArea) return 'rgba(255, 106, 0, 0.6)';
        const gradient = ctx.createLinearGradient(0, 0, 0, chartArea.bottom);
        gradient.addColorStop(0, 'rgba(255, 106, 0, 0.6)');
        gradient.addColorStop(1, 'rgba(255, 106, 0, 0.1)');
        return gradient;
      },
      borderColor: 'rgba(255, 106, 0, 1)',
      borderWidth: 1,
      borderRadius: 6,
      hoverBackgroundColor: 'rgba(255, 106, 0, 0.8)'
    }
  ]
};
const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, ticks: { color: 'rgba(255,255,255,0.4)' }, grid: { color: 'rgba(255,255,255,0.05)' } },
    x: { ticks: { color: 'rgba(255,255,255,0.4)' }, grid: { display: false } }
  },
  interaction: { intersect: false, mode: "nearest" as const }
};
const doughnutData = {
  labels: ['Obras', 'Adminstración', 'Ingeniería', 'Otros'],
  datasets: [
    {
      data: [38.4, 31.2, 21.4, 9.0],
      backgroundColor: ['#ff6a00', '#ff8a3b', '#ffaa73', '#ffcaa9'],
      borderWidth: 0,
      hoverOffset: 8
    }
  ]
};
const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { enabled: true, backgroundColor: '#000', titleColor: '#fff', bodyColor: '#fff' } },
  cutout: '70%'
};

export default function DashboardPage() {
  // Menú de usuario
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  // Estado para historial de conversaciones
  const [showHistory, setShowHistory] = useState(false);
  const [historyList] = useState([
    { id: 'c1', date: '2025-08-15', title: 'Resumen incidentes Empresa 2' },
    { id: 'c2', date: '2025-08-12', title: 'Reporte capacitaciones' },
    { id: 'c3', date: '2025-08-10', title: 'Consulta de empleados' },
  ]);

  // Sidebar móvil
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Chat AI
  const [showChat, setShowChat] = useState(false);
  // Documentación (vista de tarjetas)
  const [showDocumentacion, setShowDocumentacion] = useState(false);
  interface Message {
  id: string;
  sender: "user" | "assistant" | "loading";
  name?: string;
  avatarUrl?: string;
  content: string;
}

const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "assistant",
      name: "Asistente Preventi Flow",
      avatarUrl: "/assistant-avatar.png",
      content: "Hola, Olivia. Estoy listo para ayudar. Puedo analizar informes, generar resúmenes de seguridad o encontrar datos de inspección. ¿Qué necesitas hoy?",
    },
    {
      id: "2",
      sender: "user",
      name: "Olivia Martin",
      avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
      content: "Genera un resumen de los incidentes de seguridad reportados en la 'Empresa 2' en el último trimestre.",
    },
    {
      id: "3",
      sender: "assistant",
      name: "Asistente Preventi Flow",
      avatarUrl: "/assistant-avatar.png",
      content: "Claro. Analizando los datos de la 'Empresa 2' para el último trimestre... Un momento.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  // Efecto holo-card
  const holoRefs = useRef<(HTMLDivElement | null)[]>([]);
  React.useEffect(() => {
    holoRefs.current.forEach(card => {
      if (!card) return;
      const handler = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--x', `${x}px`);
        card.style.setProperty('--y', `${y}px`);
      };
      card.addEventListener('mousemove', handler);
      return () => card.removeEventListener('mousemove', handler);
    });
  }, []);

  // Medir altura del header sticky para posicionar el chat 20px debajo
  const headerRef = useRef<HTMLElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  useEffect(() => {
    const update = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.getBoundingClientRect().height || 0);
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Título y subtítulo dinámicos para el header según vista/menú activo
  const pathnameHeader = usePathname() ?? '/';
  let headerTitle = 'Dashboard';
  let headerSubtitle = 'Resumen de performance';
  if (showHistory) {
    headerTitle = 'Conversaciones anteriores';
    headerSubtitle = 'Historial del asistente';
  } else if (showChat) {
    headerTitle = 'Asistente AI';
    headerSubtitle = 'Chat de asistencia';
  } else if (showDocumentacion) {
    headerTitle = 'Documents Flow';
    headerSubtitle = 'Gestión documental';
  } else if (pathnameHeader.startsWith('/dashboard/reports')) {
    headerTitle = 'Reports';
    headerSubtitle = 'Informes y métricas';
  } else if (pathnameHeader.startsWith('/dashboard/plantillas')) {
    headerTitle = 'Plantillas y Buenas Prácticas';
    headerSubtitle = 'Recursos y guías';
  } else if (pathnameHeader.startsWith('/dashboard/gestion-documental')) {
    headerTitle = 'Documents Flow';
    headerSubtitle = 'Flujo documental';
  } else if (pathnameHeader.startsWith('/dashboard/empleados')) {
    headerTitle = 'Empleados';
    headerSubtitle = 'Gestión de personal';
  } else if (pathnameHeader.startsWith('/dashboard/settings')) {
    headerTitle = 'Settings';
    headerSubtitle = 'Preferencias y configuración';
  } else if (pathnameHeader.startsWith('/dashboard')) {
    headerTitle = 'Dashboard';
    headerSubtitle = 'Resumen de performance';
  }

  return (
    <div className="flex h-screen text-white/80 overflow-hidden">
      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 w-64 h-full flex-shrink-0 flex flex-col z-50 transform transition-transform duration-300 ease-in-out md:relative bg-black/30 border-white/10 border-r pt-6 pr-6 pb-6 pl-6 backdrop-blur-xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div className="flex items-center justify-between mb-8">
          <a href="#" className="inline-flex items-center gap-2">
            <span className="text-2xl font-bold text-[#ff6a00] tracking-normal font-jakarta">Preventi Flow</span>
          </a>
          <button
            className="md:hidden text-white/70 hover:text-white"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
          </button>
        </div>
        <div className="font-inter">
        <div className="relative group mb-8">
          <div className="p-4 rounded-lg bg-black/20 border border-white/5 text-center">
            <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User avatar" className="w-16 h-16 rounded-full mx-auto border-2 border-[#ff6a00]/50" />
            <p className="text-base font-semibold text-white mt-3">Olivia Martin</p>
            <p className="text-xs text-white/60">Prevención de Riesgos</p>
            <label htmlFor="organization-select" className="block text-xs font-semibold text-white/60 text-left mt-4">Organización</label>
            <select id="organization-select" className="w-full mt-1 text-xs form-input bg-black/20 border-white/10 p-2">
              <option>Empresa 1</option>
              <option>Empresa 2</option>
              <option>Empresa 3</option>
            </select>
          </div>
        </div>
        {/* Menú lateral */}
        {(() => {
          // Definir los ítems del menú
          const menuItems = [
            {
              label: "Dashboard",
              href: "/dashboard",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect></svg>
              ),
            },
            // El botón Asistente AI no es un link, sino un botón con submenú
            {
              label: "Asistente AI",
              isAIButton: true,
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path><path d="M20 2v4"></path><path d="M22 4h-4"></path><circle cx="4" cy="20" r="2"></circle></svg>
              ),
            },
            {
              label: "Reports",
              href: "/dashboard/reports",
              hidden: true,
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>
              ),
            },
            {
              label: "Plantillas y Buenas Prácticas",
              href: "/dashboard/plantillas",
              hidden: true,
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5V5a2 2 0 0 1 2-2h9.5a2 2 0 0 1 1.414.586l3.5 3.5A2 2 0 0 1 21 8.5V19a2 2 0 0 1-2 2H6.5a2 2 0 0 1-1.5-.5"></path><path d="M14 3v4a1 1 0 0 0 1 1h4"></path><path d="M8 13h8"></path><path d="M8 17h6"></path></svg>
              ),
            },
            {
              label: "Documents Flow",
              href: "/dashboard/gestion-documental",
              hasSubmenu: true,
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5a2 2 0 0 1 2-2h8l6 6v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"></path><path d="M13 3v5a2 2 0 0 0 2 2h5"></path></svg>
              ),
            },
            {
              label: "Empleados",
              href: "/dashboard/empleados",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><circle cx="9" cy="7" r="4"></circle></svg>
              ),
            },
            {
              label: "Reports",
              href: "/dashboard/reports",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>
              ),
            },
            {
              label: "Settings",
              href: "/dashboard/settings",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"></path><circle cx="12" cy="12" r="3"></circle></svg>
              ),
            },
          ];
          const pathname = usePathname();
          const [hovered, setHovered] = useState<number|null>(null);
          // Ocultar elementos marcados como hidden
          const itemsToRender = (menuItems as any[]).filter((i: any) => !i.hidden);
          // Determinar el activo por ruta
          const activeIdx = itemsToRender.findIndex(item => item.href && (pathname ?? '').startsWith(item.href));
          return (
            <nav className="flex flex-col gap-2 relative">
              {/* Indicador naranja translúcido animado */}
              <div
                className="absolute left-0 w-full h-11 pointer-events-none transition-all duration-300"
                style={{
                  top: `${(hovered !== null ? hovered : activeIdx) * 48}px`,
                  opacity: hovered !== null || activeIdx !== -1 ? 1 : 0,
                  zIndex: 0,
                }}
              >
                <div className="mx-0.5 h-10 rounded-lg bg-[#ff6a00]/20 border border-[#ff6a00]/50 transition-all duration-300" />
              </div>
              {itemsToRender.map((item: any, idx: number) => (
                item.isAIButton ? (
                  <div
                    key={item.label}
                    className="group relative"
                    onMouseEnter={() => setHovered(idx)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <button
                      type="button"
                      className={`flex items-center gap-3 w-full rounded-lg pt-2 pr-4 pb-2 pl-4 text-sm font-normal relative z-10 transition-colors duration-200 focus:outline-none ${
                        (hovered === idx || activeIdx === idx) ? "text-[#ff6a00]" : "text-white/80 hover:text-[#ff6a00]"
                      }`}
                      aria-current={activeIdx === idx ? "page" : undefined}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                      <svg className="w-4 h-4 ml-auto group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="6" y1="9" x2="18" y2="9"/><line x1="6" y1="15" x2="18" y2="15"/></svg>
                    </button>
                    <div className="absolute left-full top-0 ml-2 w-56 hidden group-hover:block z-10">
                      <div className="rounded-lg p-2 space-y-1 bg-[rgba(15,23,42,0.85)] backdrop-blur-lg border border-[#ff6a00]/20">
                        <button className="w-full text-left px-3 py-2 rounded-md hover:bg-white/5 transition-colors" onClick={() => { setShowChat(true); setSidebarOpen(false); setShowHistory(false); }}>Nueva conversación</button>
                        <button className="w-full text-left px-3 py-2 rounded-md hover:bg-white/5 transition-colors" onClick={() => { setShowHistory(true); setSidebarOpen(false); }}>Conversaciones anteriores</button>
                      </div>
                    </div>
                  </div>
                ) : item.hasSubmenu ? (
                  <div
                    key={item.label}
                    className="group relative"
                    onMouseEnter={() => setHovered(idx)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <button
                      type="button"
                      className={`flex items-center gap-3 w-full rounded-lg pt-2 pr-4 pb-2 pl-4 text-sm font-normal relative z-10 transition-colors duration-200 focus:outline-none ${
                        (hovered === idx || activeIdx === idx) ? "text-[#ff6a00]" : "text-white/80 hover:text-[#ff6a00]"
                      }`}
                      aria-current={activeIdx === idx ? "page" : undefined}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                      <svg className="w-4 h-4 ml-auto group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="6" y1="9" x2="18" y2="9"/><line x1="6" y1="15" x2="18" y2="15"/></svg>
                    </button>
                    <div className="absolute left-full top-0 ml-2 w-64 hidden group-hover:block z-10">
                      <div className="rounded-lg p-2 space-y-1 bg-[rgba(15,23,42,0.85)] backdrop-blur-lg border border-[#ff6a00]/20">
                        <button
                          className="w-full text-left px-3 py-2 rounded-md hover:bg-white/5 transition-colors"
                          onClick={() => { setShowDocumentacion(true); setShowChat(false); setShowHistory(false); setSidebarOpen(false); }}
                        >
                          Documentación
                        </button>
                        <a
                          href="/dashboard/plantillas"
                          className="w-full inline-block text-left px-3 py-2 rounded-md hover:bg-white/5 transition-colors"
                          onClick={() => { setShowDocumentacion(false); setSidebarOpen(false); }}
                        >
                          Plantillas y Buenas Prácticas
                        </a>
                        <a
                          href="/dashboard/gestion-documental"
                          className="w-full inline-block text-left px-3 py-2 rounded-md hover:bg-white/5 transition-colors"
                          onClick={() => { setShowDocumentacion(false); setSidebarOpen(false); }}
                        >
                          Gestión Documental
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <a
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-normal relative z-10 transition-colors duration-200 ${
                      (hovered === idx || activeIdx === idx) ? "text-[#ff6a00]" : "text-white/80 hover:text-[#ff6a00]"
                    }`}
                    onMouseEnter={() => setHovered(idx)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => { setShowDocumentacion(false); }}
                    aria-current={activeIdx === idx ? "page" : undefined}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </a>
                )
              ))}
            </nav>
          );
        })()}

        <div className="mt-auto" />
        </div>
      </aside>
      {/* Contenido principal */}
      <main className="relative flex-1 lg:p-10 overflow-y-auto pt-6 pr-6 pb-6 pl-6">
        {/* Header */}
        <header ref={headerRef} className="sticky top-0 z-40 flex items-center justify-between mb-8 bg-black/40 backdrop-blur-xl border-b border-white/10 pt-3 pr-4 pb-3 pl-4">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-white/80 hover:text-white"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menú"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h16"></path><path d="M4 18h16"></path><path d="M4 6h16"></path></svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white font-orbitron">{headerTitle}</h1>
              <p className="text-sm text-white/60">{headerSubtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40"><path d="m21 21-4.34-4.34"></path><circle cx="11" cy="11" r="8"></circle></svg>
              <input type="text" placeholder="Search..." className="focus:outline-none focus:ring-2 focus:ring-[#ff6a00]/50 bg-white/5 border-[#ff6a00]/95 border rounded-lg pt-2 pr-4 pb-2 pl-10" />
            </div>
            
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 border border-white/10 transition-colors" title="Notificações">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.268 21a2 2 0 0 0 3.464 0"></path><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"></path></svg>
            </button>
            <div className="relative">
  <button
    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 border border-white/10 transition-colors"
    title="Usuario"
    onClick={() => setUserMenuOpen((prev) => !prev)}
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"></circle><path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"></path></svg>
  </button>
  {userMenuOpen && (
    <div className="absolute right-0 mt-2 w-48 bg-black/90 border border-[#ff6a00]/30 rounded-lg shadow-lg z-50">
      <button className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-white/5 transition-colors" onClick={() => setUserMenuOpen(false)}>
  <svg className="w-4 h-4 text-[#ff6a00]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>
  Perfil
</button>
<button className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-white/5 transition-colors" onClick={() => setUserMenuOpen(false)}>
  <svg className="w-4 h-4 text-[#ffae00]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M16 3v4a4 4 0 0 1-8 0V3"/></svg>
  Cuenta
</button>
<button className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-white/5 transition-colors" onClick={() => setUserMenuOpen(false)}>
  <svg className="w-4 h-4 text-[#68d391]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 16 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 8c.13.16.24.33.33.51"/></svg>
  Configuración
</button>
<button className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-white/5 text-red-400 transition-colors" onClick={() => { setUserMenuOpen(false); /* lógica de logout aquí */ }}>
  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
  Logout
</button>
    </div>
  )}
</div>
          </div>
        </header>
        {/* Área central: Chat, documentación o dashboard */}
        {showHistory ? (
  <div className="flex flex-col items-center justify-center min-h-[600px] w-full">
    <h2 className="text-xl font-bold mb-6">Conversaciones anteriores</h2>
    <ul className="w-full max-w-md space-y-3">
      {historyList.map(conv => (
        <li key={conv.id}>
          <button
            className="w-full flex justify-between items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-[#ff6a00]/20 border border-white/10 text-left transition"
            onClick={() => {
              // Simular carga de contexto
              setMessages([
                {
                  id: '1', sender: 'assistant', name: 'Asistente Preventi Flow', avatarUrl: '/assistant-avatar.png', content: `Cargando contexto: ${conv.title}`
                }
              ]);
              setShowChat(true);
              setShowHistory(false);
            }}
          >
            <span className="font-semibold">{conv.title}</span>
            <span className="text-xs text-white/60">{conv.date}</span>
          </button>
        </li>
      ))}
    </ul>
    <button className="mt-8 px-4 py-2 bg-[#ff6a00] text-white rounded-full shadow hover:bg-[#ff8a3b] transition" onClick={() => setShowHistory(false)}>Volver</button>
  </div>
) : showChat ? (
  <div
    className="absolute left-0 right-0 z-30 flex items-center justify-center"
    style={{ top: headerHeight + 50, bottom: 30 }}
  >
    <div className="w-full h-full max-w-none">
      <div className="relative w-[95%] h-full mx-auto">
        <button
          className="absolute -top-3 -right-3 z-40 px-1 py-0.5 bg-[#ff6a00] text-white rounded-lg shadow hover:bg-[#ff8a3b] transition text-xs"
          style={{ transform: 'scale(0.75)' }}
          onClick={() => setShowChat(false)}
        >
          Cerrar chat
        </button>
        <div className="w-full h-full">
          <ChatWindow />
        </div>
      </div>
    </div>
  </div>
) : showDocumentacion ? (
          <div className="min-h-[600px] w-full">
            <Documentacion />
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Indicadores de desempeño */}
          <div ref={el => { holoRefs.current[0] = el; }} className="holo-card rounded-xl p-6">
            <div className="flex items-center justify-between"><h3 className="text-white/70">Indiicadores de desempeño</h3><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg></div>
            <p className="text-3xl font-bold text-white mt-4">31</p>
            <p className="text-sm text-emerald-400 mt-1 flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 7h6v6"></path><path d="m22 7-8.5 8.5-5-5L2 17"></path></svg> +20.1%</p>
          </div>
          {/* Capacitaciones */}
          <div ref={el => { holoRefs.current[1] = el; }} className="holo-card rounded-xl p-6">
            <div className="flex items-center justify-between"><h3 className="text-white/70">Capacitaciones</h3><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><circle cx="9" cy="7" r="4"></circle></svg></div>
            <p className="text-3xl font-bold text-white mt-4">+203</p>
            <p className="text-sm text-emerald-400 mt-1 flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 7h6v6"></path><path d="m22 7-8.5 8.5-5-5L2 17"></path></svg> +180.1%</p>
          </div>
          {/* Empleados */}
          <div ref={el => { holoRefs.current[2] = el; }} className="holo-card rounded-xl p-6">
            <div className="flex items-center justify-between"><h3 className="text-white/70">Empleados</h3><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" x2="19" y1="8" y2="14"></line><line x1="22" x2="16" y1="11" y2="11"></line></svg></div>
            <p className="text-3xl font-bold text-white mt-4">+145</p>
            <p className="text-sm text-emerald-400 mt-1 flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 7h6v6"></path><path d="m22 7-8.5 8.5-5-5L2 17"></path></svg> +12.2%</p>
          </div>
          {/* Incidentes */}
          <div ref={el => { holoRefs.current[3] = el; }} className="holo-card rounded-xl p-6">
            <div className="flex items-center justify-between"><h3 className="text-white/70">Incidentes</h3><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"></path></svg></div>
            <p className="text-3xl font-bold mt-4 text-white">5.4%</p>
            <p className="text-sm text-red-400 mt-1 flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 17h6v-6"></path><path d="m22 17-8.5-8.5-5 5L2 7"></path></svg> -1.9%</p>
          </div>
          {/* Gráfico principal */}
          <div ref={el => { holoRefs.current[4] = el; }} className="holo-card rounded-xl p-6 md:col-span-2 lg:col-span-3">
            <h3 className="text-lg font-semibold text-white">Optimización de Recursos</h3>
            <div className="h-80 mt-4">
              <Bar data={barData} options={barOptions} />
            </div>
          </div>
          {/* Doughnut chart */}
          <div ref={el => { holoRefs.current[5] = el; }} className="holo-card rounded-xl p-6 md:col-span-2 lg:col-span-1">
            <h3 className="text-lg font-semibold text-white">Areas</h3>
            <div className="h-64 mt-4 flex items-center justify-center">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
            <div className="mt-4 text-sm text-white/60 space-y-2">
              <p className="flex justify-between items-center"><span>Obras<span className="inline-block w-2 h-2 rounded-full mr-2" style={{backgroundColor:'#ff6a00'}}></span></span> <span>38.4%</span></p>
              <p className="flex justify-between items-center"><span>Adminstración<span className="inline-block w-2 h-2 rounded-full mr-2" style={{backgroundColor:'#ff8a3b'}}></span></span> <span>31.2%</span></p>
              <p className="flex justify-between items-center"><span>Ingeniería<span className="inline-block w-2 h-2 rounded-full mr-2" style={{backgroundColor:'#ffaa73'}}></span></span> <span>21.4%</span></p>
              <p className="flex justify-between items-center"><span>Otros<span className="inline-block w-2 h-2 rounded-full mr-2" style={{backgroundColor:'#ffcaa9'}}></span></span> <span>9.0%</span></p>
            </div>
          </div>
          {/* Tabla de solicitudes */}
          <div ref={el => { holoRefs.current[6] = el; }} className="holo-card rounded-xl p-6 lg:col-span-4">
            <h3 className="text-lg font-semibold text-white mb-4">Solicitudes</h3>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-sm text-white/60">
                  <th className="py-3 font-normal">Cliente</th>
                  <th className="py-3 font-normal hidden sm:table-cell">Data</th>
                  <th className="py-3 font-normal">Status</th>
                  <th className="py-3 font-normal text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="py-4">Olivia Martin</td>
                  <td className="py-4 hidden sm:table-cell">13 de Agosto, 2025</td>
                  <td className="py-4"><span className="text-xs text-emerald-400 bg-emerald-500/20 rounded-full pt-1 pr-2 pb-1 pl-2">Aprobado</span></td>
                  <td className="py-4 text-right font-medium text-white">$250.00</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4">Jackson Lee</td>
                  <td className="py-4 hidden sm:table-cell">12 de Agosto, 2025</td>
                  <td className="py-4"><span className="text-xs text-blue-400 bg-blue-500/20 rounded-full pt-1 pr-2 pb-1 pl-2">Procesando</span></td>
                  <td className="py-4 text-right font-medium text-white">$150.00</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4">Isabella Nguyen</td>
                  <td className="py-4 hidden sm:table-cell">12 de Agosto, 2025</td>
                  <td className="py-4"><span className="text-xs text-emerald-400 bg-emerald-500/20 rounded-full pt-1 pr-2 pb-1 pl-2">Aprobado</span></td>
                  <td className="py-4 text-right font-medium text-white">$350.00</td>
                </tr>
                <tr>
                  <td className="py-4">William Kim</td>
                  <td className="py-4 hidden sm:table-cell">11 de Agosto, 2025</td>
                  <td className="py-4"><span className="text-xs text-red-400 bg-red-500/20 rounded-full pt-1 pr-2 pb-1 pl-2">Recchazado</span></td>
                  <td className="py-4 text-right font-medium text-white">$450.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}
