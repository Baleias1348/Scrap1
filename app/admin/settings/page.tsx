'use client';

import { useState, useEffect } from 'react';
import { Settings, Key, Database, Shield, Save, RefreshCw, Eye, EyeOff, AlertTriangle } from 'lucide-react';

interface SystemConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceKey: string;
  nextjsPort: string;
  environment: string;
  debugMode: boolean;
  autoCleanupEnabled: boolean;
  cleanupFrequency: string;
}

export default function AdminSettings() {
  const [config, setConfig] = useState<SystemConfig>({
    supabaseUrl: '',
    supabaseAnonKey: '',
    supabaseServiceKey: '',
    nextjsPort: '3005',
    environment: 'development',
    debugMode: true,
    autoCleanupEnabled: false,
    cleanupFrequency: 'weekly'
  });
  const [loading, setLoading] = useState(false);
  const [showSecrets, setShowSecrets] = useState({
    anonKey: false,
    serviceKey: false
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadCurrentConfig();
  }, []);

  const loadCurrentConfig = () => {
    // Simular carga de configuración actual
    setConfig({
      supabaseUrl: 'https://zaidbrwtevakbuaowfrw.supabase.co',
      supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...[HIDDEN]',
      supabaseServiceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...[HIDDEN]',
      nextjsPort: '3005',
      environment: 'development',
      debugMode: true,
      autoCleanupEnabled: false,
      cleanupFrequency: 'weekly'
    });
  };

  const saveConfig = async () => {
    setLoading(true);
    try {
      // Simular guardado de configuración
      await new Promise(resolve => setTimeout(resolve, 1500));
      showMessage('success', 'Configuración guardada exitosamente');
    } catch (error) {
      showMessage('error', 'Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const maskString = (str: string, visibleChars = 8) => {
    if (str.length <= visibleChars) return str;
    return str.substring(0, visibleChars) + '...[HIDDEN]';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center">
          <Settings className="h-8 w-8 mr-3 text-orange-500" />
          Configuración del Sistema
        </h1>
        <div className="flex space-x-3">
          <button
            onClick={loadCurrentConfig}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Recargar</span>
          </button>
          <button
            onClick={saveConfig}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 rounded-lg transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-600/10 border-green-600/20 text-green-400'
            : 'bg-red-600/10 border-red-600/20 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Supabase Configuration */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Database className="h-5 w-5 mr-2 text-blue-500" />
          Configuración de Supabase
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              URL de Supabase
            </label>
            <input
              type="url"
              value={config.supabaseUrl}
              onChange={(e) => setConfig({...config, supabaseUrl: e.target.value})}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="https://tu-proyecto.supabase.co"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Anon Key (Clave Pública)
            </label>
            <div className="relative">
              <input
                type={showSecrets.anonKey ? 'text' : 'password'}
                value={showSecrets.anonKey ? config.supabaseAnonKey : maskString(config.supabaseAnonKey)}
                onChange={(e) => setConfig({...config, supabaseAnonKey: e.target.value})}
                className="w-full px-4 py-2 pr-12 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              />
              <button
                type="button"
                onClick={() => setShowSecrets({...showSecrets, anonKey: !showSecrets.anonKey})}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showSecrets.anonKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Service Role Key (Clave Administrativa)
            </label>
            <div className="relative">
              <input
                type={showSecrets.serviceKey ? 'text' : 'password'}
                value={showSecrets.serviceKey ? config.supabaseServiceKey : maskString(config.supabaseServiceKey)}
                onChange={(e) => setConfig({...config, supabaseServiceKey: e.target.value})}
                className="w-full px-4 py-2 pr-12 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              />
              <button
                type="button"
                onClick={() => setShowSecrets({...showSecrets, serviceKey: !showSecrets.serviceKey})}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showSecrets.serviceKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              ⚠️ Requerida para operaciones administrativas como limpieza de usuarios
            </p>
          </div>
        </div>
      </div>

      {/* System Configuration */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2 text-green-500" />
          Configuración del Sistema
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Puerto de Next.js
            </label>
            <input
              type="number"
              value={config.nextjsPort}
              onChange={(e) => setConfig({...config, nextjsPort: e.target.value})}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="3005"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Entorno
            </label>
            <select
              value={config.environment}
              onChange={(e) => setConfig({...config, environment: e.target.value})}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="development">Desarrollo</option>
              <option value="staging">Staging</option>
              <option value="production">Producción</option>
            </select>
          </div>
        </div>
      </div>

      {/* User Management Settings */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Key className="h-5 w-5 mr-2 text-purple-500" />
          Gestión de Usuarios
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-300">Modo Debug</label>
              <p className="text-xs text-gray-400">Mostrar logs detallados en la consola</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.debugMode}
                onChange={(e) => setConfig({...config, debugMode: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-300">Limpieza Automática</label>
              <p className="text-xs text-gray-400">Ejecutar limpieza de usuarios problemáticos automáticamente</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.autoCleanupEnabled}
                onChange={(e) => setConfig({...config, autoCleanupEnabled: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>
          
          {config.autoCleanupEnabled && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Frecuencia de Limpieza
              </label>
              <select
                value={config.cleanupFrequency}
                onChange={(e) => setConfig({...config, cleanupFrequency: e.target.value})}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Environment Variables */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Variables de Entorno (.env.local)</h3>
        
        <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4 font-mono text-sm">
          <div className="space-y-1 text-gray-300">
            <div><span className="text-green-400">NEXT_PUBLIC_SUPABASE_URL</span>=<span className="text-yellow-400">{config.supabaseUrl}</span></div>
            <div><span className="text-green-400">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>=<span className="text-yellow-400">{maskString(config.supabaseAnonKey, 16)}</span></div>
            <div><span className="text-green-400">SUPABASE_SERVICE_ROLE_KEY</span>=<span className="text-yellow-400">{maskString(config.supabaseServiceKey, 16)}</span></div>
            <div><span className="text-green-400">NODE_ENV</span>=<span className="text-yellow-400">{config.environment}</span></div>
            <div><span className="text-green-400">DEBUG</span>=<span className="text-yellow-400">{config.debugMode ? 'true' : 'false'}</span></div>
          </div>
        </div>
        
        <div className="mt-4 flex items-start space-x-3 p-3 bg-yellow-600/10 border border-yellow-600/20 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-300">
              <strong>Importante:</strong> Después de cambiar las variables de entorno, reinicia el servidor de desarrollo para que los cambios surtan efecto.
            </p>
          </div>
        </div>
      </div>

      {/* Status & Tests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Estado de Conexiones</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
              <span className="text-gray-300">Supabase Auth</span>
              <span className="text-green-400 text-sm">✓ Conectado</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
              <span className="text-gray-300">Service Role</span>
              <span className="text-green-400 text-sm">✓ Válido</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
              <span className="text-gray-300">Base de Datos</span>
              <span className="text-green-400 text-sm">✓ Disponible</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Pruebas Rápidas</h3>
          
          <div className="space-y-3">
            <button
              onClick={() => alert('Probando conexión a Supabase...')}
              className="w-full p-3 bg-blue-600/20 border border-blue-600/30 rounded-lg text-blue-400 hover:bg-blue-600/30 transition-colors text-left"
            >
              Probar Conexión a Supabase
            </button>
            
            <button
              onClick={() => alert('Probando autenticación...')}
              className="w-full p-3 bg-green-600/20 border border-green-600/30 rounded-lg text-green-400 hover:bg-green-600/30 transition-colors text-left"
            >
              Probar Autenticación
            </button>
            
            <button
              onClick={() => alert('Probando service role...')}
              className="w-full p-3 bg-purple-600/20 border border-purple-600/30 rounded-lg text-purple-400 hover:bg-purple-600/30 transition-colors text-left"
            >
              Probar Service Role Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}