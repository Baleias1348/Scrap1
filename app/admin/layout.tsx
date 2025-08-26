'use client';

import Link from 'next/link';
import { Shield, Users, Database, BarChart3, Settings, Home, Zap, LogOut, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AdminUser {
  email: string;
  role: string;
  authenticated: boolean;
  loginTime: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Obtener información del usuario admin desde la cookie
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
    };

    const adminAuth = getCookie('admin_auth');
    if (adminAuth) {
      try {
        const userData = JSON.parse(adminAuth);
        setAdminUser(userData);
      } catch (error) {
        console.error('Error parsing admin auth:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    // Limpiar cookie
    document.cookie = 'admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    // Redirigir al login
    router.push('/admin/login');
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Administrador';
      case 'admin': return 'Administrador';
      default: return 'Usuario';
    }
  };
  return (
    <div className="min-h-screen bg-[#101014] text-white">
      {/* Header */}
      <header className="bg-[#1a1a1f] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-orange-500" />
              <h1 className="text-xl font-bold">Dashboard Administrativo</h1>
            </div>
            <div className="flex items-center space-x-4">
              {adminUser && (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 px-3 py-1 bg-gray-700 rounded-lg">
                    <User className="h-4 w-4 text-orange-400" />
                    <div className="text-sm">
                      <div className="text-white font-medium">{adminUser.email}</div>
                      <div className="text-gray-400 text-xs">{getRoleDisplayName(adminUser.role)}</div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    title="Cerrar sesión"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              )}
              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <Home className="h-5 w-5" />
                <span>Volver al inicio</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-[#1a1a1f] min-h-screen border-r border-gray-800">
          <nav className="p-4 space-y-2">
            <Link
              href="/admin"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-orange-600/10 text-orange-400 border border-orange-600/20"
            >
              <BarChart3 className="h-5 w-5" />
              <span>Resumen General</span>
            </Link>
            
            <Link
              href="/admin/users"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <Users className="h-5 w-5" />
              <span>Gestión de Usuarios</span>
            </Link>
            
            <Link
              href="/admin/tasks"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <Zap className="h-5 w-5" />
              <span>Tareas Automatizadas</span>
            </Link>
            
            <Link
              href="/admin/security"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <Shield className="h-5 w-5" />
              <span>Auditoría y Seguridad</span>
            </Link>
            
            <Link
              href="/admin/database"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <Database className="h-5 w-5" />
              <span>Base de Datos</span>
            </Link>
            
            <Link
              href="/admin/settings"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <Settings className="h-5 w-5" />
              <span>Configuración</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}