"use client";
import React, { useState } from 'react';

export default function UserCleanupPage() {
  const [email, setEmail] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const checkUser = async () => {
    if (!email.trim()) return;
    
    setLoading(true);
    addResult(`🔍 Verificando usuario: ${email}`);
    
    try {
      const response = await fetch('/api/admin/cleanup-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action: 'check' })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        if (result.exists) {
          addResult(`✅ Usuario existe en auth.users (ID: ${result.user.id})`);
          addResult(`📧 Email confirmado: ${result.user.email_confirmed_at ? 'Sí' : 'No'}`);
        } else {
          addResult(`❌ Usuario NO existe en auth.users`);
        }
      } else {
        addResult(`💥 Error al verificar: ${result.error}`);
      }
    } catch (error) {
      addResult(`💥 Error de conexión: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const cleanupUser = async () => {
    if (!email.trim()) return;
    
    setLoading(true);
    addResult(`🧹 Limpiando usuario: ${email}`);
    
    try {
      const response = await fetch('/api/admin/cleanup-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action: 'cleanup' })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        addResult(`✅ ${result.message}`);
        if (result.deletedUserId) {
          addResult(`🗑️ ID eliminado: ${result.deletedUserId}`);
        }
      } else {
        addResult(`💥 Error en limpieza: ${result.error}`);
      }
    } catch (error) {
      addResult(`💥 Error de conexión: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testRegistration = async () => {
    if (!email.trim()) return;
    
    setLoading(true);
    addResult(`🧪 Probando registro de: ${email}`);
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password: 'TestPassword123!',
          extra: { nombres: 'Test', apellidos: 'User' }
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        addResult(`✅ Registro exitoso!`);
        addResult(`👤 Usuario creado: ${result.data?.user?.id || 'ID no disponible'}`);
      } else {
        addResult(`❌ Error en registro: ${result.error}`);
      }
    } catch (error) {
      addResult(`💥 Error de conexión: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          🔧 Herramienta de Limpieza de Usuarios
        </h1>
        
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Email del Usuario</h2>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="usuario@ejemplo.com"
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={checkUser}
            disabled={loading || !email.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            🔍 Verificar Usuario
          </button>
          
          <button
            onClick={cleanupUser}
            disabled={loading || !email.trim()}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            🧹 Limpiar Usuario
          </button>
          
          <button
            onClick={testRegistration}
            disabled={loading || !email.trim()}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            🧪 Probar Registro
          </button>
        </div>

        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Resultados</h2>
            <button
              onClick={clearResults}
              className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition"
            >
              Limpiar
            </button>
          </div>
          
          <div className="bg-slate-900 rounded-lg p-4 h-64 overflow-y-auto">
            {results.length === 0 ? (
              <p className="text-slate-400 italic">
                Los resultados aparecerán aquí...
              </p>
            ) : (
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="text-sm font-mono break-all"
                  >
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-900/50 border border-yellow-600 rounded-lg">
          <h3 className="font-semibold mb-2">⚠️ Instrucciones de Uso:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Ingresa el email del usuario problemático</li>
            <li>Haz clic en "Verificar Usuario" para ver su estado actual</li>
            <li>Si existe, haz clic en "Limpiar Usuario" para eliminarlo completamente</li>
            <li>Luego prueba "Probar Registro" para confirmar que funciona</li>
          </ol>
        </div>
      </div>
    </div>
  );
}