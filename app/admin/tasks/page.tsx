'use client';

import { useState, useEffect } from 'react';
import { Play, Clock, CheckCircle, AlertTriangle, RefreshCw, Eye, Zap, Database, Users, Shield, Activity } from 'lucide-react';

interface Task {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  estimatedTime: string;
  category: 'users' | 'database' | 'system';
}

interface TaskResult {
  taskId: string;
  status: 'running' | 'completed' | 'failed';
  progress: number;
  message: string;
  details?: any;
  startTime: string;
  endTime?: string;
  logs: string[];
}

const AVAILABLE_TASKS: Task[] = [
  {
    id: 'cleanup-problematic-users',
    name: 'Limpiar Usuarios Problemáticos',
    description: 'Detecta y elimina usuarios con estados inconsistentes',
    icon: Users,
    color: 'blue',
    estimatedTime: '2-3 min',
    category: 'users'
  },
  {
    id: 'optimize-database',
    name: 'Optimizar Base de Datos',
    description: 'Optimiza índices y limpia registros obsoletos',
    icon: Database,
    color: 'green',
    estimatedTime: '3-5 min',
    category: 'database'
  },
  {
    id: 'cleanup-old-sessions',
    name: 'Limpiar Sesiones Antiguas',
    description: 'Elimina sesiones expiradas y tokens inválidos',
    icon: Shield,
    color: 'orange',
    estimatedTime: '1-2 min',
    category: 'system'
  },
  {
    id: 'analyze-user-activity',
    name: 'Analizar Actividad de Usuarios',
    description: 'Genera estadísticas de uso y actividad',
    icon: Activity,
    color: 'purple',
    estimatedTime: '2-3 min',
    category: 'users'
  },
  {
    id: 'system-health-check',
    name: 'Verificación de Salud del Sistema',
    description: 'Comprueba el estado de todos los servicios',
    icon: CheckCircle,
    color: 'cyan',
    estimatedTime: '1-2 min',
    category: 'system'
  }
];

export default function AdminTasks() {
  const [runningTasks, setRunningTasks] = useState<Map<string, TaskResult>>(new Map());
  const [completedTasks, setCompletedTasks] = useState<TaskResult[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    // Polling para actualizar el estado de las tareas
    const interval = setInterval(checkTaskStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const checkTaskStatus = async () => {
    if (runningTasks.size === 0) return;

    for (const [taskId] of runningTasks) {
      try {
        const response = await fetch(`/api/admin/tasks?taskId=${taskId}`);
        const result = await response.json();
        
        if (result.success && result.task) {
          const task = result.task;
          setRunningTasks(prev => {
            const newMap = new Map(prev);
            newMap.set(taskId, task);
            return newMap;
          });

          // Si la tarea se completó o falló, moverla a completadas
          if (task.status === 'completed' || task.status === 'failed') {
            setRunningTasks(prev => {
              const newMap = new Map(prev);
              newMap.delete(taskId);
              return newMap;
            });
            
            setCompletedTasks(prev => [task, ...prev.slice(0, 9)]); // Mantener últimas 10
          }
        }
      } catch (error) {
        console.error('Error checking task status:', error);
      }
    }
  };

  const executeTask = async (taskType: string) => {
    const taskId = `${taskType}_${Date.now()}`;
    
    try {
      const response = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskType, taskId })
      });

      const result = await response.json();
      
      if (result.success) {
        // Agregar tarea inicial a running tasks
        setRunningTasks(prev => {
          const newMap = new Map(prev);
          newMap.set(taskId, {
            taskId,
            status: 'running',
            progress: 0,
            message: 'Iniciando...',
            startTime: new Date().toISOString(),
            logs: []
          });
          return newMap;
        });
      }
    } catch (error) {
      console.error('Error executing task:', error);
    }
  };

  const getTaskColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-600/10 border-blue-600/20 text-blue-400',
      green: 'bg-green-600/10 border-green-600/20 text-green-400',
      orange: 'bg-orange-600/10 border-orange-600/20 text-orange-400',
      purple: 'bg-purple-600/10 border-purple-600/20 text-purple-400',
      cyan: 'bg-cyan-600/10 border-cyan-600/20 text-cyan-400'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <RefreshCw className="h-4 w-4 animate-spin text-orange-400" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      default: return null;
    }
  };

  const filteredTasks = selectedCategory === 'all' 
    ? AVAILABLE_TASKS 
    : AVAILABLE_TASKS.filter(task => task.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center">
          <Zap className="h-8 w-8 mr-3 text-orange-500" />
          Tareas Automatizadas
        </h1>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-400">
            {runningTasks.size > 0 ? `${runningTasks.size} tarea(s) ejecutándose` : 'Sin tareas activas'}
          </span>
          {runningTasks.size > 0 && (
            <RefreshCw className="h-4 w-4 animate-spin text-orange-400" />
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex space-x-2">
        {[
          { id: 'all', name: 'Todas', icon: Activity },
          { id: 'users', name: 'Usuarios', icon: Users },
          { id: 'database', name: 'Base de Datos', icon: Database },
          { id: 'system', name: 'Sistema', icon: Shield }
        ].map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === category.id
                ? 'bg-orange-600/20 text-orange-400 border border-orange-600/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <category.icon className="h-4 w-4" />
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {/* Running Tasks */}
      {runningTasks.size > 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <RefreshCw className="h-5 w-5 mr-2 text-orange-500 animate-spin" />
            Tareas en Ejecución
          </h3>
          
          <div className="space-y-4">
            {Array.from(runningTasks.values()).map(task => {
              const taskDef = AVAILABLE_TASKS.find(t => t.id === task.taskId.split('_')[0]);
              return (
                <div key={task.taskId} className="bg-gray-700/30 border border-gray-600/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {taskDef?.icon && <taskDef.icon className="h-5 w-5 text-orange-400" />}
                      <span className="font-medium">{taskDef?.name || 'Tarea Desconocida'}</span>
                    </div>
                    <span className="text-sm text-gray-400">{task.progress}%</span>
                  </div>
                  
                  <div className="mb-2">
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-300">{task.message}</p>
                  
                  {task.logs.length > 0 && (
                    <details className="mt-3">
                      <summary className="text-sm text-gray-400 cursor-pointer hover:text-white">
                        Ver logs ({task.logs.length})
                      </summary>
                      <div className="mt-2 bg-gray-900/50 rounded-lg p-3 max-h-32 overflow-y-auto">
                        {task.logs.slice(-5).map((log, index) => (
                          <div key={index} className="text-xs text-gray-300 font-mono">
                            {log}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Tasks */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Tareas Disponibles</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map(task => {
            const isRunning = Array.from(runningTasks.keys()).some(id => id.startsWith(task.id));
            const Icon = task.icon;
            
            return (
              <div
                key={task.id}
                className={`p-6 rounded-lg border transition-all ${getTaskColor(task.color)} ${
                  isRunning ? 'opacity-50' : 'hover:bg-opacity-20'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <Icon className="h-8 w-8" />
                  <div className="text-right">
                    <span className="text-xs bg-gray-700 px-2 py-1 rounded-full">
                      {task.estimatedTime}
                    </span>
                  </div>
                </div>
                
                <h4 className="font-semibold mb-2">{task.name}</h4>
                <p className="text-sm opacity-80 mb-4">{task.description}</p>
                
                <button
                  onClick={() => executeTask(task.id)}
                  disabled={isRunning}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isRunning
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  {isRunning ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Ejecutándose...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      <span>Ejecutar</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-gray-400" />
            Tareas Recientes
          </h3>
          
          <div className="space-y-3">
            {completedTasks.slice(0, 5).map(task => {
              const taskDef = AVAILABLE_TASKS.find(t => t.id === task.taskId.split('_')[0]);
              return (
                <div key={task.taskId} className="flex items-center justify-between p-3 bg-gray-700/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(task.status)}
                    <div>
                      <span className="font-medium">{taskDef?.name || 'Tarea'}</span>
                      <p className="text-sm text-gray-400">{task.message}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-400">
                      {new Date(task.endTime || task.startTime).toLocaleTimeString()}
                    </p>
                    {task.details && (
                      <details className="mt-1">
                        <summary className="text-xs text-gray-500 cursor-pointer">
                          Detalles
                        </summary>
                        <div className="text-xs text-gray-400 mt-1">
                          <pre>{JSON.stringify(task.details, null, 2)}</pre>
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}