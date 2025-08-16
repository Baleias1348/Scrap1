// import DashboardOliviaMartin from '../DashboardOliviaMartin';

// ===========================================================
//  ¡IMPORTANTE! Dashboard principal migrado a React.
//  NO BORRAR NI SOBRESCRIBIR sin revisión y respaldo.
// ===========================================================

"use client";
import React, { useRef, useEffect } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
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
  // Sidebar móvil
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  // Efecto holo-card
  const holoRefs = React.useRef<(HTMLDivElement | null)[]>([]);
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
        <nav className="flex flex-col gap-2">
          <a href="#" className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[#ff6a00]/20 text-[#ff6a00] border border-[#ff6a00]/50 font-semibold">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect></svg>
            <span>Dashboard</span>
          </a>
          <a href="#" className="flex items-center gap-3 hover:bg-white/5 transition-colors w-full rounded-lg pt-2 pr-4 pb-2 pl-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>
            <span>Asistente AI</span>
          </a>
          <a href="#" className="flex items-center gap-3 hover:bg-white/5 transition-colors w-full rounded-lg pt-2 pr-4 pb-2 pl-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>
            <span>Reports</span>
          </a>
          <a href="#" className="flex items-center gap-3 hover:bg-white/5 transition-colors w-full rounded-lg pt-2 pr-4 pb-2 pl-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><circle cx="9" cy="7" r="4"></circle></svg>
            <span>Empleados</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/5 transition-colors w-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"></path><circle cx="12" cy="12" r="3"></circle></svg>
            <span>Settings</span>
          </a>
        </nav>
        <div className="mt-auto" />
      </aside>
      {/* Contenido principal */}
      <main className="flex-1 lg:p-10 overflow-y-auto pt-6 pr-6 pb-6 pl-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-white/80 hover:text-white"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menú"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h16"></path><path d="M4 18h16"></path><path d="M4 6h16"></path></svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white font-orbitron">Dashboard</h1>
              <p className="text-sm text-white/60">Resumen de performance</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40"><path d="m21 21-4.34-4.34"></path><circle cx="11" cy="11" r="8"></circle></svg>
              <input type="text" placeholder="Search..." className="focus:outline-none focus:ring-2 focus:ring-[#ff6a00]/50 bg-white/5 border-[#ff6a00]/95 border rounded-lg pt-2 pr-4 pb-2 pl-10" />
            </div>
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 border border-white/10 transition-colors" title="Assistente IA">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path><path d="M20 2v4"></path><path d="M22 4h-4"></path><circle cx="4" cy="20" r="2"></circle></svg>
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 border border-white/10 transition-colors" title="Notificações">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.268 21a2 2 0 0 0 3.464 0"></path><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"></path></svg>
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 border border-white/10 transition-colors" title="Logout">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v10"></path><path d="M18.4 6.6a9 9 0 1 1-12.77.04"></path></svg>
            </button>
          </div>
        </header>
        {/* Tarjetas y gráficos */}
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
      </main>
    </div>
  );
}
