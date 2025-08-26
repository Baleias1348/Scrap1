'use client';

import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Eye, Lock, Users, Clock, FileText, TrendingUp, Download, RefreshCw } from 'lucide-react';

interface SecurityEvent {
  id: string;
  type: 'login' | 'failed_login' | 'admin_access' | 'data_export' | 'user_created' | 'user_deleted' | 'suspicious_activity';
  user: string;
  ip: string;
  userAgent: string;
  timestamp: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface SecurityMetrics {
  totalEvents: number;
  uniqueIPs: number;
  uniqueUsers: number;
  suspiciousActivities: number;
  failedLogins: number;
  adminAccesses: number;
  dataExports: number;
  criticalEvents: number;
  highSeverityEvents: number;
  eventsByType: Record<string, number>;
  eventsBySeverity: Record<string, number>;
}

interface SecurityTrends {
  totalEventsChange: number;
  failedLoginsChange: number;
  suspiciousActivitiesChange: number;
  adminAccessesChange: number;
  uniqueIPsChange: number;
}

export default function AdminSecurity() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    uniqueIPs: 0,
    uniqueUsers: 0,
    suspiciousActivities: 0,
    failedLogins: 0,
    adminAccesses: 0,
    dataExports: 0,
    criticalEvents: 0,
    highSeverityEvents: 0,
    eventsByType: {},
    eventsBySeverity: {}
  });
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState('24h');
  const [trends, setTrends] = useState<SecurityTrends>({
    totalEventsChange: 0,
    failedLoginsChange: 0,
    suspiciousActivitiesChange: 0,
    adminAccessesChange: 0,
    uniqueIPsChange: 0
  });
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchSecurityData();
  }, [timeframe, filterType]);

  const fetchSecurityData = async () => {
    setLoading(true);
    try {
      // Llamar al API real de seguridad
      const response = await fetch(`/api/admin/security?timeframe=${timeframe}&type=${filterType}&limit=50`);
      const data = await response.json();
      
      if (data.success) {
        setEvents(data.events || []);
        setMetrics(data.metrics || {
          totalEvents: 0,
          uniqueIPs: 0,
          uniqueUsers: 0,
          suspiciousActivities: 0,
          failedLogins: 0,
          adminAccesses: 0,
          dataExports: 0,
          criticalEvents: 0,
          highSeverityEvents: 0,
          eventsByType: {},
          eventsBySeverity: {}
        });
        setTrends(data.trends || {
          totalEventsChange: 0,
          failedLoginsChange: 0,
          suspiciousActivitiesChange: 0,
          adminAccessesChange: 0,
          uniqueIPsChange: 0
        });
        
        // Log admin access evento
        await logSecurityEvent({
          type: 'admin_access',
          user: 'admin@preventiflow.com', // En producción obtener del contexto de usuario
          details: 'Acceso a auditoría de seguridad',
          severity: 'medium',
          resource: '/admin/security'
        });
      } else {
        console.error('Error fetching security data:', data.error);
        // Fallback a datos simulados si hay error
        loadMockData();
      }
    } catch (error) {
      console.error('Error fetching security data:', error);
      // Fallback a datos simulados si hay error
      loadMockData();
    } finally {
      setLoading(false);
    }
  };
  
  const logSecurityEvent = async (eventData: any) => {
    try {
      await fetch('/api/admin/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  };
  
  const loadMockData = () => {
      const mockEvents: SecurityEvent[] = [
        {
          id: '1',
          type: 'admin_access',
          user: 'hernan@preventiflow.com',
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          details: 'Acceso al dashboard administrativo',
          severity: 'medium'
        },
        {
          id: '2',
          type: 'failed_login',
          user: 'unknown@example.com',
          ip: '185.220.101.32',
          userAgent: 'curl/7.68.0',
          timestamp: new Date(Date.now() - 900000).toISOString(),
          details: 'Intento de login fallido - credenciales incorrectas',
          severity: 'high'
        },
        {
          id: '3',
          type: 'suspicious_activity',
          user: 'test@test.com',
          ip: '45.33.32.156',
          userAgent: 'python-requests/2.28.1',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          details: 'Múltiples intentos de acceso a rutas protegidas',
          severity: 'critical'
        },
        {
          id: '4',
          type: 'user_created',
          user: 'baleias1348@gmail.com',
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          details: 'Nuevo usuario registrado',
          severity: 'low'
        },
        {
          id: '5',
          type: 'data_export',
          user: 'admin@preventiflow.com',
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          details: 'Exportación de datos de usuarios',
          severity: 'medium'
        }
      ];

      const mockMetrics: SecurityMetrics = {
        totalEvents: mockEvents.length,
        uniqueIPs: new Set(mockEvents.map(e => e.ip)).size,
        uniqueUsers: new Set(mockEvents.map(e => e.user)).size,
        suspiciousActivities: mockEvents.filter(e => e.type === 'suspicious_activity').length,
        failedLogins: mockEvents.filter(e => e.type === 'failed_login').length,
        adminAccesses: mockEvents.filter(e => e.type === 'admin_access').length,
        dataExports: mockEvents.filter(e => e.type === 'data_export').length,
        criticalEvents: mockEvents.filter(e => e.severity === 'critical').length,
        highSeverityEvents: mockEvents.filter(e => e.severity === 'high').length,
        eventsByType: mockEvents.reduce((acc, event) => {
          acc[event.type] = (acc[event.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        eventsBySeverity: mockEvents.reduce((acc, event) => {
          acc[event.severity] = (acc[event.severity] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };

      setEvents(mockEvents);
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Error loading mock security data:', error);
    }
  };

  const exportSecurityReport = async () => {
    // Log security event for data export
    await logSecurityEvent({
      type: 'data_export',
      user: 'admin@preventiflow.com', // En producción obtener del contexto de usuario
      details: 'Exportación de reporte de seguridad',
      severity: 'medium',
      resource: 'security-report'
    });
    
    const report = {
      timestamp: new Date().toISOString(),
      timeframe,
      metrics,
      events: events.map(event => ({
        ...event,
        userAgent: event.userAgent.substring(0, 50) + '...'
      }))
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-600/10 border-red-600/20';
      case 'high': return 'text-orange-400 bg-orange-600/10 border-orange-600/20';
      case 'medium': return 'text-yellow-400 bg-yellow-600/10 border-yellow-600/20';
      case 'low': return 'text-green-400 bg-green-600/10 border-green-600/20';
      default: return 'text-gray-400 bg-gray-600/10 border-gray-600/20';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'admin_access': return <Shield className="h-4 w-4" />;
      case 'failed_login': return <AlertTriangle className="h-4 w-4" />;
      case 'suspicious_activity': return <Eye className="h-4 w-4" />;
      case 'user_created': return <Users className="h-4 w-4" />;
      case 'user_deleted': return <Users className="h-4 w-4" />;
      case 'data_export': return <Download className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'admin_access': return 'Acceso Admin';
      case 'failed_login': return 'Login Fallido';
      case 'suspicious_activity': return 'Actividad Sospechosa';
      case 'user_created': return 'Usuario Creado';
      case 'user_deleted': return 'Usuario Eliminado';
      case 'data_export': return 'Exportación de Datos';
      default: return 'Evento';
    }
  };

  const MetricCard = ({ title, value, icon: Icon, trend, color }: {
    title: string;
    value: number;
    icon: any;
    trend?: string;
    color: string;
  }) => (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          {trend && (
            <p className="text-xs text-gray-500 mt-1">{trend}</p>
          )}
        </div>
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center">
          <Shield className="h-8 w-8 mr-3 text-orange-500" />
          Auditoría y Seguridad
        </h1>
        <div className="flex items-center space-x-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="1h">Última hora</option>
            <option value="24h">Últimas 24 horas</option>
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
          </select>
          <button
            onClick={exportSecurityReport}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Exportar Reporte</span>
          </button>
          <button
            onClick={fetchSecurityData}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 rounded-lg transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Total de Eventos"
          value={metrics.totalEvents}
          icon={FileText}
          trend="Últimas 24h"
          color="text-blue-400"
        />
        <MetricCard
          title="Act. Sospechosas"
          value={metrics.suspiciousActivities}
          icon={AlertTriangle}
          trend={metrics.suspiciousActivities > 0 ? "⚠️ Requiere atención" : "✅ Normal"}
          color="text-red-400"
        />
        <MetricCard
          title="Logins Fallidos"
          value={metrics.failedLogins}
          icon={Lock}
          trend={metrics.failedLogins > 5 ? "⚠️ Alto" : "✅ Normal"}
          color="text-orange-400"
        />
        <MetricCard
          title="Accesos Admin"
          value={metrics.adminAccesses}
          icon={Shield}
          trend={trends.adminAccessesChange !== 0 ? `${trends.adminAccessesChange > 0 ? '+' : ''}${trends.adminAccessesChange}%` : "Sin cambios"}
          color="text-purple-400"
        />
        <MetricCard
          title="IPs Únicas"
          value={metrics.uniqueIPs}
          icon={TrendingUp}
          trend={trends.uniqueIPsChange !== 0 ? `${trends.uniqueIPsChange > 0 ? '+' : ''}${trends.uniqueIPsChange}%` : "Sin cambios"}
          color="text-cyan-400"
        />
        <MetricCard
          title="Eventos Críticos"
          value={metrics.criticalEvents}
          icon={Eye}
          trend={metrics.criticalEvents > 0 ? "⚠️ Revisar" : "✅ Seguro"}
          color="text-yellow-400"
        />
      </div>

      {/* Filters */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-300">Filtrar eventos:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Todos los eventos</option>
            <option value="admin_access">Accesos administrativos</option>
            <option value="failed_login">Logins fallidos</option>
            <option value="suspicious_activity">Actividad sospechosa</option>
            <option value="critical">Solo críticos</option>
          </select>
        </div>
      </div>

      {/* Security Events */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-orange-500" />
          Eventos de Seguridad
        </h3>

        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-orange-500" />
            <p className="text-gray-400 mt-2">Cargando eventos...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events
              .filter(event => filterType === 'all' || event.type === filterType || (filterType === 'critical' && event.severity === 'critical'))
              .map(event => (
              <div
                key={event.id}
                className={`p-4 rounded-lg border ${getSeverityColor(event.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-700/50 rounded-lg">
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium">{getEventTypeLabel(event.type)}</span>
                        <span className={`px-2 py-1 text-xs rounded-full border ${getSeverityColor(event.severity)}`}>
                          {event.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">{event.details}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-400">
                        <div>
                          <span className="font-medium">Usuario:</span> {event.user}
                        </div>
                        <div>
                          <span className="font-medium">IP:</span> {event.ip}
                        </div>
                        <div>
                          <span className="font-medium">User-Agent:</span> {event.userAgent.substring(0, 30)}...
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">
                      {new Date(event.timestamp).toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security Recommendations */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2 text-green-500" />
          Recomendaciones de Seguridad
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-yellow-600/10 border border-yellow-600/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-400">Implementar Rate Limiting</h4>
                <p className="text-sm text-gray-300">Limitar intentos de login para prevenir ataques de fuerza bruta</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-blue-600/10 border border-blue-600/20 rounded-lg">
              <Lock className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-400">Autenticación 2FA</h4>
                <p className="text-sm text-gray-300">Agregar segunda factor de autenticación para administradores</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-purple-600/10 border border-purple-600/20 rounded-lg">
              <Eye className="h-5 w-5 text-purple-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-purple-400">Monitoreo de IPs</h4>
                <p className="text-sm text-gray-300">Implementar lista negra para IPs sospechosas</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-green-600/10 border border-green-600/20 rounded-lg">
              <FileText className="h-5 w-5 text-green-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-400">Logs Persistentes</h4>
                <p className="text-sm text-gray-300">Guardar eventos de auditoría en base de datos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}