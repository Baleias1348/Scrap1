'use client';

import { useState } from 'react';
import { Search, Trash2, AlertTriangle, CheckCircle, RefreshCw, Eye, Users, Zap } from 'lucide-react';

interface User {
  id: string;
  email: string;
  created_at: string;
  email_confirmed_at: string | null;
  status: 'active' | 'problematic' | 'unknown';
}

export default function AdminUsers() {
  const [searchEmail, setSearchEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [autoDetectionRunning, setAutoDetectionRunning] = useState(false);
  const [autoDetectionResults, setAutoDetectionResults] = useState<string[]>([]);

  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const checkUser = async (email: string) => {
    if (!email) {
      showMessage('error', 'Por favor ingresa un email');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/cleanup-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action: 'check' })
      });

      const data = await response.json();

      if (data.exists && data.user) {
        setCurrentUser({
          ...data.user,
          status: 'active'
        });
        showMessage('info', `Usuario encontrado: ${email}`);
      } else {
        setCurrentUser(null);
        showMessage('info', `Usuario no encontrado: ${email}`);
      }
    } catch (error) {
      showMessage('error', 'Error al verificar usuario');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const cleanupUser = async (email: string) => {
    if (!email) return;

    if (!confirm(`¿Estás seguro de que quieres eliminar completamente el usuario ${email}?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/cleanup-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action: 'cleanup' })
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('success', `Usuario ${email} eliminado completamente`);
        setCurrentUser(null);
        setSearchEmail('');
      } else {
        showMessage('error', data.error || 'Error al eliminar usuario');
      }
    } catch (error) {
      showMessage('error', 'Error al eliminar usuario');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const runAutoDetection = async () => {
    setAutoDetectionRunning(true);
    setAutoDetectionResults([]);
    
    try {
      // Simular detección automática con emails comunes problemáticos
      const testEmails = [
        'test@test.com',
        'admin@test.com', 
        'user@test.com',
        'demo@test.com',
        'prueba@test.com'
      ];

      const results: string[] = [];

      for (const email of testEmails) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay
        
        try {
          // Intentar registro para detectar problemas
          const signupResponse = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              password: 'TestPassword123!',
              extra: { nombres: 'Test', apellidos: 'User' }
            })
          });

          const signupData = await signupResponse.json();

          if (signupData.error && signupData.error.includes('already registered')) {
            // Verificar si puede hacer login
            const loginResponse = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password: 'TestPassword123!' })
            });

            const loginData = await loginResponse.json();

            if (loginData.error && loginData.error.includes('credentials')) {
              results.push(`🚨 PROBLEMÁTICO: ${email} - Estado inconsistente detectado`);
            } else {
              results.push(`ℹ️ OK: ${email} - Usuario válido`);
            }
          } else if (signupData.data?.user) {
            results.push(`✅ NUEVO: ${email} - Registro exitoso`);
          } else {
            results.push(`ℹ️ OK: ${email} - Sin problemas`);
          }
        } catch (error) {
          results.push(`❌ ERROR: ${email} - Error al verificar`);
        }

        setAutoDetectionResults([...results]);
      }

      const problematicCount = results.filter(r => r.includes('PROBLEMÁTICO')).length;
      
      if (problematicCount > 0) {
        showMessage('info', `Detección completada: ${problematicCount} usuario(s) problemático(s) encontrado(s)`);
      } else {
        showMessage('success', 'Detección completada: No se encontraron usuarios problemáticos');
      }
      
    } catch (error) {
      showMessage('error', 'Error durante la detección automática');
      console.error('Error:', error);
    } finally {
      setAutoDetectionRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center">
          <Users className="h-8 w-8 mr-3 text-orange-500" />
          Gestión de Usuarios
        </h1>
        <button
          onClick={runAutoDetection}
          disabled={autoDetectionRunning}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 rounded-lg transition-colors"
        >
          <Zap className="h-4 w-4" />
          <span>{autoDetectionRunning ? 'Detectando...' : 'Detección Automática'}</span>
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-600/10 border-green-600/20 text-green-400'
            : message.type === 'error'
            ? 'bg-red-600/10 border-red-600/20 text-red-400'
            : 'bg-blue-600/10 border-blue-600/20 text-blue-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Search Section */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Buscar Usuario</h3>
        <div className="flex space-x-4">
          <div className="flex-1">
            <input
              type="email"
              placeholder="Ingresa el email del usuario..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              onKeyPress={(e) => e.key === 'Enter' && checkUser(searchEmail)}
            />
          </div>
          <button
            onClick={() => checkUser(searchEmail)}
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors"
          >
            <Search className="h-4 w-4" />
            <span>{loading ? 'Buscando...' : 'Buscar'}</span>
          </button>
        </div>
      </div>

      {/* User Details */}
      {currentUser && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold flex items-center">
              <Eye className="h-5 w-5 mr-2 text-blue-400" />
              Detalles del Usuario
            </h3>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              currentUser.status === 'active' 
                ? 'bg-green-600/20 text-green-400 border border-green-600/30'
                : 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/30'
            }`}>
              {currentUser.status === 'active' ? 'Activo' : 'Problemático'}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-sm text-gray-400">Email</label>
              <p className="font-mono text-sm bg-gray-700/50 p-2 rounded border">{currentUser.email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400">ID</label>
              <p className="font-mono text-sm bg-gray-700/50 p-2 rounded border">{currentUser.id}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Fecha de Registro</label>
              <p className="text-sm bg-gray-700/50 p-2 rounded border">
                {new Date(currentUser.created_at).toLocaleString('es-ES')}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Email Confirmado</label>
              <p className="text-sm bg-gray-700/50 p-2 rounded border">
                {currentUser.email_confirmed_at 
                  ? new Date(currentUser.email_confirmed_at).toLocaleString('es-ES')
                  : 'No confirmado'
                }
              </p>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => checkUser(currentUser.email)}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Verificar de nuevo</span>
            </button>
            
            <button
              onClick={() => cleanupUser(currentUser.email)}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Eliminar Usuario</span>
            </button>
          </div>
        </div>
      )}

      {/* Auto Detection Results */}
      {(autoDetectionRunning || autoDetectionResults.length > 0) && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
            Resultados de Detección Automática
          </h3>
          
          {autoDetectionRunning && (
            <div className="flex items-center space-x-3 text-orange-400 mb-4">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Ejecutando detección automática...</span>
            </div>
          )}

          {autoDetectionResults.length > 0 && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {autoDetectionResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg font-mono text-sm ${
                    result.includes('PROBLEMÁTICO')
                      ? 'bg-red-600/10 border border-red-600/20 text-red-400'
                      : result.includes('ERROR')
                      ? 'bg-red-600/10 border border-red-600/20 text-red-400'
                      : result.includes('NUEVO')
                      ? 'bg-green-600/10 border border-green-600/20 text-green-400'
                      : 'bg-gray-700/30 border border-gray-600/20 text-gray-300'
                  }`}
                >
                  {result}
                </div>
              ))}
            </div>
          )}

          {!autoDetectionRunning && autoDetectionResults.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-400">
                ✅ Detección automática completada. {autoDetectionResults.filter(r => r.includes('PROBLEMÁTICO')).length} usuario(s) problemático(s) encontrado(s).
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => runAutoDetection()}
            disabled={autoDetectionRunning}
            className="p-4 bg-orange-600/10 border border-orange-600/20 rounded-lg hover:bg-orange-600/20 transition-colors text-left"
          >
            <Zap className="h-6 w-6 text-orange-400 mb-2" />
            <h4 className="font-medium text-orange-400">Detección Automática</h4>
            <p className="text-sm text-gray-400">Buscar usuarios problemáticos automáticamente</p>
          </button>
          
          <button
            onClick={() => window.open('/admin/user-cleanup', '_blank')}
            className="p-4 bg-blue-600/10 border border-blue-600/20 rounded-lg hover:bg-blue-600/20 transition-colors text-left"
          >
            <CheckCircle className="h-6 w-6 text-blue-400 mb-2" />
            <h4 className="font-medium text-blue-400">Herramienta Original</h4>
            <p className="text-sm text-gray-400">Acceder a la herramienta de limpieza original</p>
          </button>
          
          <div className="p-4 bg-gray-700/30 border border-gray-600/20 rounded-lg">
            <Users className="h-6 w-6 text-gray-400 mb-2" />
            <h4 className="font-medium text-gray-400">Próximamente</h4>
            <p className="text-sm text-gray-500">Gestión masiva de usuarios</p>
          </div>
        </div>
      </div>
    </div>
  );
}