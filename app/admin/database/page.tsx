'use client';

import { useState } from 'react';
import { Database, Play, Download, Upload, AlertTriangle, CheckCircle, TrendingUp, HardDrive } from 'lucide-react';

interface DatabaseStats {
  totalTables: number;
  totalRecords: number;
  databaseSize: string;
  lastBackup: string | null;
  activeConnections: number;
}

export default function AdminDatabase() {
  const [stats, setStats] = useState<DatabaseStats>({
    totalTables: 8,
    totalRecords: 1247,
    databaseSize: '45.2 MB',
    lastBackup: new Date().toISOString(),
    activeConnections: 3
  });
  const [loading, setLoading] = useState(false);
  const [scriptOutput, setScriptOutput] = useState<string[]>([]);
  const [runningScript, setRunningScript] = useState<string | null>(null);

  const runScript = async (scriptName: string, description: string) => {
    setRunningScript(scriptName);
    setScriptOutput([]);
    
    try {
      // Simular ejecución de script
      const steps = [
        'Conectando a la base de datos...',
        'Verificando estructura de tablas...',
        'Ejecutando consultas de mantenimiento...',
        'Optimizando índices...',
        'Limpiando registros obsoletos...',
        'Actualizando estadísticas...',
        'Operación completada exitosamente'
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setScriptOutput(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${steps[i]}`]);
      }
      
    } catch (error) {
      setScriptOutput(prev => [...prev, `[ERROR] ${error}`]);
    } finally {
      setRunningScript(null);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = 'text-white' }: {
    title: string;
    value: string | number;
    icon: any;
    color?: string;
  }) => (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
        </div>
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center">
          <Database className="h-8 w-8 mr-3 text-orange-500" />
          Gestión de Base de Datos
        </h1>
        <button
          onClick={() => setStats({...stats})} // Simular refresh
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
        >
          Actualizar Estadísticas
        </button>
      </div>

      {/* Database Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total de Tablas"
          value={stats.totalTables}
          icon={HardDrive}
          color="text-blue-400"
        />
        
        <StatCard
          title="Total de Registros"
          value={stats.totalRecords.toLocaleString()}
          icon={TrendingUp}
          color="text-green-400"
        />
        
        <StatCard
          title="Tamaño de BD"
          value={stats.databaseSize}
          icon={Database}
          color="text-purple-400"
        />
        
        <StatCard
          title="Conexiones Activas"
          value={stats.activeConnections}
          icon={CheckCircle}
          color="text-orange-400"
        />
        
        <StatCard
          title="Estado"
          value="Saludable"
          icon={CheckCircle}
          color="text-green-400"
        />
      </div>

      {/* Maintenance Scripts */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Play className="h-5 w-5 mr-2 text-orange-500" />
          Scripts de Mantenimiento
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => runScript('cleanup-users', 'Limpieza de usuarios problemáticos')}
            disabled={!!runningScript}
            className="p-4 bg-blue-600/10 border border-blue-600/20 rounded-lg hover:bg-blue-600/20 transition-colors text-left disabled:opacity-50"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-blue-400">Limpieza de Usuarios</h4>
              {runningScript === 'cleanup-users' && (
                <div className="animate-spin h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
              )}
            </div>
            <p className="text-sm text-gray-400">Detectar y limpiar usuarios problemáticos</p>
          </button>
          
          <button
            onClick={() => runScript('optimize-db', 'Optimización de base de datos')}
            disabled={!!runningScript}
            className="p-4 bg-green-600/10 border border-green-600/20 rounded-lg hover:bg-green-600/20 transition-colors text-left disabled:opacity-50"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-green-400">Optimizar BD</h4>
              {runningScript === 'optimize-db' && (
                <div className="animate-spin h-4 w-4 border-2 border-green-400 border-t-transparent rounded-full"></div>
              )}
            </div>
            <p className="text-sm text-gray-400">Optimizar índices y rendimiento</p>
          </button>
          
          <button
            onClick={() => runScript('backup-db', 'Respaldo de base de datos')}
            disabled={!!runningScript}
            className="p-4 bg-purple-600/10 border border-purple-600/20 rounded-lg hover:bg-purple-600/20 transition-colors text-left disabled:opacity-50"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-purple-400">Crear Respaldo</h4>
              {runningScript === 'backup-db' && (
                <div className="animate-spin h-4 w-4 border-2 border-purple-400 border-t-transparent rounded-full"></div>
              )}
            </div>
            <p className="text-sm text-gray-400">Generar respaldo completo</p>
          </button>
          
          <button
            onClick={() => runScript('analyze-tables', 'Análisis de tablas')}
            disabled={!!runningScript}
            className="p-4 bg-orange-600/10 border border-orange-600/20 rounded-lg hover:bg-orange-600/20 transition-colors text-left disabled:opacity-50"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-orange-400">Analizar Tablas</h4>
              {runningScript === 'analyze-tables' && (
                <div className="animate-spin h-4 w-4 border-2 border-orange-400 border-t-transparent rounded-full"></div>
              )}
            </div>
            <p className="text-sm text-gray-400">Análisis detallado de estructura</p>
          </button>
          
          <button
            onClick={() => runScript('vacuum-db', 'Limpieza de espacio')}
            disabled={!!runningScript}
            className="p-4 bg-red-600/10 border border-red-600/20 rounded-lg hover:bg-red-600/20 transition-colors text-left disabled:opacity-50"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-red-400">Vacuum Database</h4>
              {runningScript === 'vacuum-db' && (
                <div className="animate-spin h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full"></div>
              )}
            </div>
            <p className="text-sm text-gray-400">Recuperar espacio en disco</p>
          </button>
          
          <button
            onClick={() => runScript('update-stats', 'Actualizar estadísticas')}
            disabled={!!runningScript}
            className="p-4 bg-yellow-600/10 border border-yellow-600/20 rounded-lg hover:bg-yellow-600/20 transition-colors text-left disabled:opacity-50"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-yellow-400">Actualizar Stats</h4>
              {runningScript === 'update-stats' && (
                <div className="animate-spin h-4 w-4 border-2 border-yellow-400 border-t-transparent rounded-full"></div>
              )}
            </div>
            <p className="text-sm text-gray-400">Actualizar estadísticas de consultas</p>
          </button>
        </div>

        {/* Script Output */}
        {scriptOutput.length > 0 && (
          <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4">
            <h4 className="font-medium mb-3 flex items-center">
              <Play className="h-4 w-4 mr-2 text-green-400" />
              Salida del Script
            </h4>
            <div className="space-y-1 max-h-64 overflow-y-auto font-mono text-sm">
              {scriptOutput.map((line, index) => (
                <div key={index} className="text-gray-300">
                  {line}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Database Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backup & Restore */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Download className="h-5 w-5 mr-2 text-blue-500" />
            Respaldo y Restauración
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
              <div>
                <p className="font-medium">Último respaldo</p>
                <p className="text-sm text-gray-400">
                  {stats.lastBackup 
                    ? new Date(stats.lastBackup).toLocaleString('es-ES')
                    : 'Nunca'
                  }
                </p>
              </div>
              <Download className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => runScript('backup-full', 'Respaldo completo')}
                disabled={!!runningScript}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Crear Respaldo</span>
              </button>
              
              <button
                onClick={() => alert('Funcionalidad próximamente')}
                className="flex items-center justify-center px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Upload className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Health Check */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
            Estado de Salud
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Conexión a Supabase</span>
              <span className="flex items-center text-green-400">
                <CheckCircle className="h-4 w-4 mr-1" />
                Conectado
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Autenticación</span>
              <span className="flex items-center text-green-400">
                <CheckCircle className="h-4 w-4 mr-1" />
                Funcionando
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Tablas principales</span>
              <span className="flex items-center text-green-400">
                <CheckCircle className="h-4 w-4 mr-1" />
                Disponibles
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Índices</span>
              <span className="flex items-center text-green-400">
                <CheckCircle className="h-4 w-4 mr-1" />
                Optimizados
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Rendimiento</span>
              <span className="flex items-center text-green-400">
                <CheckCircle className="h-4 w-4 mr-1" />
                Excelente
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Warnings */}
      <div className="bg-yellow-600/10 border border-yellow-600/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-400">Advertencias Importantes</h4>
            <ul className="text-sm text-yellow-300 mt-2 space-y-1">
              <li>• Los scripts de mantenimiento pueden afectar el rendimiento temporalmente</li>
              <li>• Siempre crear un respaldo antes de ejecutar operaciones de limpieza</li>
              <li>• Las operaciones VACUUM pueden tomar tiempo en bases de datos grandes</li>
              <li>• Se recomienda ejecutar mantenimiento durante horas de baja actividad</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}