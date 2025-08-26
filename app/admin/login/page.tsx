'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, User, Eye, EyeOff } from 'lucide-react';

interface AdminUser {
  email: string;
  password: string;
  role: string;
}

const ADMIN_USERS: AdminUser[] = [
  {
    email: 'admin@preventiflow.com',
    password: 'AdminPreventi2025!',
    role: 'super_admin'
  },
  {
    email: 'hernan@preventiflow.com',
    password: 'HernanAdmin2025!',
    role: 'admin'
  }
];

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Verificar credenciales
      const adminUser = ADMIN_USERS.find(
        user => user.email === credentials.email && user.password === credentials.password
      );

      if (!adminUser) {
        setError('Credenciales de administrador inválidas');
        setLoading(false);
        return;
      }

      // Crear token de sesión (en producción usar JWT)
      const authData = {
        email: adminUser.email,
        role: adminUser.role,
        authenticated: true,
        expires: Date.now() + (24 * 60 * 60 * 1000), // 24 horas
        loginTime: new Date().toISOString()
      };

      // Guardar en cookie
      document.cookie = `admin_auth=${JSON.stringify(authData)}; path=/; max-age=86400; SameSite=Strict`;

      // Redirigir al dashboard
      router.push('/admin');
      
    } catch (error) {
      setError('Error durante la autenticación');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#101014] text-white flex items-center justify-center">
      <div className="absolute inset-0">
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] bg-fuchsia-500/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-48 -right-40 w-[520px] h-[520px] bg-indigo-500/10 blur-3xl rounded-full pointer-events-none"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 backdrop-blur-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-orange-600/20 rounded-full">
                <Shield className="h-8 w-8 text-orange-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Dashboard Administrativo</h1>
            <p className="text-gray-400">Acceso restringido para administradores</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-600/10 border border-red-600/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email de Administrador
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
                  placeholder="admin@preventiflow.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  className="w-full pl-10 pr-12 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
                  placeholder="••••••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  <span>Acceder al Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Credentials Info */}
          <div className="mt-8 p-4 bg-blue-600/10 border border-blue-600/20 rounded-lg">
            <h4 className="text-sm font-medium text-blue-400 mb-2">Credenciales de Acceso:</h4>
            <div className="space-y-2 text-xs text-gray-300">
              <div>
                <strong>Super Admin:</strong>
                <br />Email: admin@preventiflow.com
                <br />Password: AdminPreventi2025!
              </div>
              <div>
                <strong>Admin:</strong>
                <br />Email: hernan@preventiflow.com
                <br />Password: HernanAdmin2025!
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
              ← Volver al inicio
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}