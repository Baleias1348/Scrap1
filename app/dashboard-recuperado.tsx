"// Archivo eliminado para evitar conflicto con el nuevo dashboard";
import React from "react";

// 1. Icon (SVG wrapper)
interface IconProps {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}
const Icon = ({ children, className = "", ...props }: IconProps) => (
  <span className={className} {...props}>{children}</span>
);

// 2. IconButton
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}
const IconButton = ({ children, ...props }: IconButtonProps) => (
  <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 border border-white/10 transition-colors" {...props}>
    {children}
  </button>
);

// 3. StatusBadge
interface StatusBadgeProps {
  status: string;
  children: React.ReactNode;
}
const StatusBadge = ({ status, children }: StatusBadgeProps) => {
  let color = "";
  switch (status) {
    case "approved": color = "bg-emerald-500/20 text-emerald-400"; break;
    case "processing": color = "bg-blue-500/20 text-blue-400"; break;
    case "declined": color = "bg-red-500/20 text-red-400"; break;
    default: color = "bg-gray-500/20 text-gray-400";
  }
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${color}`}>{children}</span>
  );
};

// 4. SearchInput
interface SearchInputProps {
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
}
const SearchInput = ({ value, onChange, placeholder = "Search..." }: SearchInputProps) => (
  <div className="relative hidden sm:block">
    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.34-4.34"/></svg>
    <input type="text" value={value} onChange={onChange} placeholder={placeholder} className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff6a00]/50" />
  </div>
);

// 5. SidebarLink
interface SidebarLinkProps {
  icon: React.ReactNode;
  label: string;
  href?: string;
  isActive?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}
const SidebarLink = ({ icon, label, href = "#", isActive, onClick, children }: SidebarLinkProps) => (
  <div className="relative group">
    <a
      href={href}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg ${isActive ? "bg-[#ff6a00]/20 text-[#ff6a00] border border-[#ff6a00]/50 font-semibold" : "hover:bg-white/5 transition-colors w-full"}`}
      onClick={e => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      style={onClick ? { cursor: "pointer" } : {}}
    >
      {icon}
      <span>{label}</span>
    </a>
    {children && (
      <div className="absolute left-full top-0 ml-2 w-56 hidden group-hover:block z-10">
        {children}
      </div>
    )}
  </div>
);

// 6. SubMenuCard
interface SubMenuCardProps {
  children: React.ReactNode;
}
const SubMenuCard = ({ children }: SubMenuCardProps) => (
  <div className="submenu-card rounded-lg p-2 space-y-1 bg-[rgba(15,23,42,0.85)] backdrop-blur-lg border border-[#ff6a00]/20">
    {children}
  </div>
);

// 7. OrganizationSelect
interface OrganizationSelectProps {
  organizations: string[];
  value: string;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
}
const OrganizationSelect = ({ organizations, value, onChange }: OrganizationSelectProps) => (
  <select className="w-full mt-1 text-xs form-input bg-black/20 border-white/10 p-2" value={value} onChange={onChange}>
    {organizations.map(org => <option key={org}>{org}</option>)}
  </select>
);

// 8. UserActionMenu
const UserActionMenu = () => (
  <SubMenuCard>
    <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-white/5 transition-colors"><Icon><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg></Icon>Perfil</a>
    <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-white/5 transition-colors"><Icon><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/></svg></Icon>Conta</a>
    <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-white/5 transition-colors text-red-400/80 hover:text-red-400"><Icon><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/></svg></Icon>Logout</a>
  </SubMenuCard>
);

// 9. UserProfileCard
interface UserProfileCardProps {
  userName: string;
  userRole: string;
  avatarUrl: string;
  organizations: string[];
  selectedOrg: string;
  onOrgChange: React.ChangeEventHandler<HTMLSelectElement>;
}
const UserProfileCard = ({ userName, userRole, avatarUrl, organizations, selectedOrg, onOrgChange }: UserProfileCardProps) => (
  <div className="relative group mb-8">
    <div className="p-4 rounded-lg bg-black/20 border border-white/5 text-center">
      <img src={avatarUrl} alt="User avatar" className="w-16 h-16 rounded-full mx-auto border-2 border-[#ff6a00]/50" />
      <p className="text-base font-semibold text-white mt-3">{userName}</p>
      <p className="text-xs text-white/60">{userRole}</p>
      <label htmlFor="organization-select" className="block text-xs font-semibold text-white/60 text-left mt-4">Organización</label>
      <OrganizationSelect organizations={organizations} value={selectedOrg} onChange={onOrgChange} />
    </div>
    <div className="absolute left-full top-0 ml-2 w-48 hidden group-hover:block z-10">
      <UserActionMenu />
    </div>
  </div>
);

// 10. Sidebar
interface SidebarProps {
  children: React.ReactNode;
}
const Sidebar = ({ children }: SidebarProps) => (
  <aside className="fixed top-0 left-0 w-64 h-full flex-shrink-0 bg-black/30 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col z-50 md:relative md:translate-x-0">
    {children}
  </aside>
);

// 11. PageTitle
interface PageTitleProps {
  title: string;
  subtitle?: string;
}
const PageTitle = ({ title, subtitle }: PageTitleProps) => (
  <div>
    <h1 className="text-2xl font-bold text-white font-orbitron">{title}</h1>
    <p className="text-sm text-white/60">{subtitle}</p>
  </div>
);

// 12. Header
interface HeaderProps {
  onMenuClick: () => void;
  title: string;
  subtitle?: string;
  searchValue: string;
  onSearchChange: React.ChangeEventHandler<HTMLInputElement>;
  onChatClick?: () => void;
}
const Header = ({ onMenuClick, title, subtitle, searchValue, onSearchChange, onChatClick }: HeaderProps) => (
  <header className="flex items-center justify-between mb-8">
    <div className="flex items-center gap-4">
      <button className="md:hidden text-white/80 hover:text-white" onClick={onMenuClick}>
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 12h16"/><path d="M4 18h16"/><path d="M4 6h16"/></svg>
      </button>
      <PageTitle title={title} subtitle={subtitle} />
    </div>
    <div className="flex items-center gap-2">
      <SearchInput value={searchValue} onChange={onSearchChange} />
      <IconButton title="Assistente IA" onClick={onChatClick}><svg width="24" height="24" fill="none" stroke="#ff6a00" strokeWidth="2" viewBox="0 0 24 24"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/></svg></IconButton>
      <IconButton title="Notificações"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/></svg></IconButton>
      <IconButton title="Logout"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2v10"/><path d="M18.4 6.6a9 9 0 1 1-12.77.04"/></svg></IconButton>
    </div>
  </header>
);

// 13. HoloCard
interface HoloCardProps {
  children: React.ReactNode;
  className?: string;
}
const HoloCard = ({ children, className = "" }: HoloCardProps) => (
  <div className={`holo-card rounded-xl p-6 ${className}`} style={{background: "rgba(15,23,42,0.85)", boxShadow: "0 2px 24px 0 rgba(255,255,255,0.06)", border: "1.5px solid #ff6a0030"}}>
    {children}
  </div>
);

// 14. StatCard (ya definida arriba)

// 15. ChartCard
interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}
const ChartCard = ({ title, children }: ChartCardProps) => (
  <HoloCard>
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <div className="h-80 mt-4">{children}</div>
  </HoloCard>
);

// 16. TrafficSourceLegendItem
interface TrafficSourceLegendItemProps {
  color: string;
  label: string;
  value: string;
}
const TrafficSourceLegendItem = ({ color, label, value }: TrafficSourceLegendItemProps) => (
  <p className="flex justify-between items-center text-sm text-white/60">
    <span><span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: color }}></span>{label}</span>
    <span>{value}</span>
  </p>
);

// 17. RecentTransactionsTable
interface TransactionRow {
  cliente: string;
  data: string;
  status: string;
  statusLabel: string;
  valor: string;
}
interface RecentTransactionsTableProps {
  rows: TransactionRow[];
}
const RecentTransactionsTable = ({ rows }: RecentTransactionsTableProps) => (
  <HoloCard>
    <h3 className="text-lg font-semibold text-white mb-4">Transacciones Recientes</h3>
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
        {rows.map((row, i) => (
          <tr key={i} className="border-b border-white/5">
            <td className="py-4">{row.cliente}</td>
            <td className="py-4 hidden sm:table-cell">{row.data}</td>
            <td className="py-4"><StatusBadge status={row.status}>{row.statusLabel}</StatusBadge></td>
            <td className="py-4 text-right font-medium text-white">{row.valor}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </HoloCard>
);

// 18. DashboardLayout
interface DashboardLayoutProps {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
}
const DashboardLayout = ({ sidebar, header, children }: DashboardLayoutProps) => (
  <div className="flex h-screen">
    {sidebar}
    <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
      {header}
      {children}
    </main>
  </div>
);

// --- Ejemplo de uso del Dashboard completo ---
import ChatWindow from "./components/ChatWindow";

interface StandaloneDashboardExampleProps {
  section?: string;
  chatProps?: any;
}

import { useState } from "react";

export default function StandaloneDashboardExample() {
  // Datos demo
  const statCards = [
    { title: "Vendas Totais", value: "$45,231.89", icon: <svg width="24" height="24" fill="none" stroke="#ff6a00" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, trendValue: "+20.1%", trendDirection: "up" },
    { title: "Assinaturas", value: "+2,350", icon: <svg width="24" height="24" fill="none" stroke="#ff6a00" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/></svg>, trendValue: "+180.1%", trendDirection: "up" },
    { title: "Novos Clientes", value: "+1,210", icon: <svg width="24" height="24" fill="none" stroke="#ff6a00" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>, trendValue: "+12.2%", trendDirection: "up" },
    { title: "Taxa de Conversão", value: "5.4%", icon: <svg width="24" height="24" fill="none" stroke="#ff6a00" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg>, trendValue: "-1.9%", trendDirection: "down" },
  ];

  const transactions = [
    { cliente: "Olivia Martin", data: "13 de Agosto, 2025", status: "approved", statusLabel: "Aprovado", valor: "$250.00" },
    { cliente: "Jackson Lee", data: "12 de Agosto, 2025", status: "processing", statusLabel: "Processando", valor: "$150.00" },
    { cliente: "Isabella Nguyen", data: "12 de Agosto, 2025", status: "approved", statusLabel: "Aprovado", valor: "$350.00" },
    { cliente: "William Kim", data: "11 de Agosto, 2025", status: "declined", statusLabel: "Recusado", valor: "$450.00" },
  ];

  return (
    <>
      <DashboardLayout
        sidebar={
          <Sidebar>
            <div className="mb-10">
              <span className="block text-xl font-bold text-[#ff6a00] font-orbitron">Preventi Flow</span>
            </div>
            <UserProfileCard
              userName="Olivia Martin"
              userRole="Product Manager"
              avatarUrl="https://i.pravatar.cc/150?u=a042581f4e29026704d"
              organizations={["Empresa 1", "Empresa 2", "Empresa 3"]}
              selectedOrg="Empresa 1"
              onOrgChange={() => {}}
            />
            <nav className="flex flex-col gap-2">
              <SidebarLink icon={<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>} label="Dashboard" href="/dashboard" />
            </nav>
          </Sidebar>
        }
        header={
          <>
            <Header
              onMenuClick={() => {}}
              title="Dashboard"
              subtitle="Resumen de performance"
              searchValue=""
              onSearchChange={() => {}}
            />
          </>
        }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <HoloCard key={i}>
            <div className="flex items-center justify-between">
              <h3 className="text-white/70">{card.title}</h3>
              {card.icon}
            </div>
            <p className="text-3xl font-bold mt-4 text-white">{card.value}</p>
            <p className={`text-sm mt-1 flex items-center gap-1 ${card.trendDirection === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
              {card.trendDirection === 'up' ? (
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/></svg>
              ) : (
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 17h6v-6"/><path d="m22 17-8.5-8.5-5 5L2 7"/></svg>
              )}
              {card.trendValue}
            </p>
          </HoloCard>
        ))}
        <ChartCard title="Visão Geral de Vendas">
          {/* Aquí iría el gráfico principal (puedes integrar Chart.js o similar) */}
          <div className="w-full h-full flex items-center justify-center text-white/40">[Gráfico Principal]</div>
        </ChartCard>
        <ChartCard title="Fontes de Tráfego">
          {/* Aquí iría el gráfico doughnut y la leyenda */}
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="mb-4 text-white/40">[Doughnut Chart]</div>
            <div className="mt-4 text-sm text-white/60 space-y-2">
              <TrafficSourceLegendItem color="#ff6a00" label="Google" value="38.4%" />
              <TrafficSourceLegendItem color="#ff8a3b" label="Instagram" value="31.2%" />
              <TrafficSourceLegendItem color="#ffaa73" label="Direto" value="21.4%" />
              <TrafficSourceLegendItem color="#ffcaa9" label="Outros" value="9.0%" />
            </div>
          </div>
        </ChartCard>
        <div className="lg:col-span-4">
          <RecentTransactionsTable rows={transactions} />
        </div>
      </div>
    </DashboardLayout>
    </>
  );
}
