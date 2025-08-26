import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

interface SecurityEvent {
  id: string;
  type: 'login' | 'failed_login' | 'admin_access' | 'data_export' | 'user_created' | 'user_deleted' | 'suspicious_activity' | 'api_access' | 'password_change';
  user: string;
  ip: string;
  userAgent: string;
  timestamp: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resource?: string;
  metadata?: Record<string, any>;
}

// Store temporal para eventos (en producción usar base de datos)
const securityEvents: SecurityEvent[] = [];

export async function POST(req: Request) {
  try {
    const eventData = await req.json();
    const headersList = headers();
    
    // Obtener información del request
    const forwarded = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const userAgent = headersList.get('user-agent') || 'Unknown';
    
    // Determinar IP real
    const clientIp = forwarded?.split(',')[0] || realIp || '127.0.0.1';
    
    // Crear evento de seguridad
    const securityEvent: SecurityEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: eventData.type,
      user: eventData.user || 'anonymous',
      ip: clientIp,
      userAgent: userAgent,
      timestamp: new Date().toISOString(),
      details: eventData.details || '',
      severity: eventData.severity || 'medium',
      resource: eventData.resource,
      metadata: eventData.metadata || {}
    };

    // Agregar al store (en producción, guardar en BD)
    securityEvents.unshift(securityEvent);
    
    // Mantener solo los últimos 1000 eventos en memoria
    if (securityEvents.length > 1000) {
      securityEvents.splice(1000);
    }

    // Análisis de riesgo automático
    const riskLevel = analyzeRiskLevel(securityEvent, securityEvents);
    
    // Log en consola para debugging
    console.log(`[SECURITY] ${securityEvent.severity.toUpperCase()}: ${securityEvent.type} - ${securityEvent.user} from ${securityEvent.ip}`);
    
    // Si es crítico, podríamos enviar alertas
    if (riskLevel === 'critical' || securityEvent.severity === 'critical') {
      console.warn(`[CRITICAL SECURITY EVENT] ${JSON.stringify(securityEvent)}`);
      // Aquí podrías integrar con sistemas de alertas (email, Slack, etc.)
    }

    return NextResponse.json({ 
      success: true,
      eventId: securityEvent.id,
      riskLevel,
      message: 'Evento de seguridad registrado'
    });

  } catch (error: any) {
    console.error('[Security Audit] Error:', error);
    return NextResponse.json({ 
      error: error?.message || 'Error interno' 
    }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get('timeframe') || '24h';
    const filterType = searchParams.get('type') || 'all';
    const severity = searchParams.get('severity');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Filtrar eventos por timeframe
    const timeframeMs = parseTimeframe(timeframe);
    const cutoffTime = Date.now() - timeframeMs;
    
    let filteredEvents = securityEvents.filter(event => 
      new Date(event.timestamp).getTime() > cutoffTime
    );

    // Filtrar por tipo
    if (filterType !== 'all') {
      filteredEvents = filteredEvents.filter(event => event.type === filterType);
    }

    // Filtrar por severidad
    if (severity) {
      filteredEvents = filteredEvents.filter(event => event.severity === severity);
    }

    // Limitar resultados
    filteredEvents = filteredEvents.slice(0, limit);

    // Calcular métricas
    const metrics = calculateSecurityMetrics(filteredEvents);

    // Análisis de tendencias
    const trends = analyzeTrends(securityEvents, timeframeMs);

    return NextResponse.json({
      success: true,
      events: filteredEvents,
      metrics,
      trends,
      timeframe,
      totalEvents: securityEvents.length
    });

  } catch (error: any) {
    console.error('[Security Audit] Get error:', error);
    return NextResponse.json({ 
      error: error?.message || 'Error interno' 
    }, { status: 500 });
  }
}

// Función para analizar nivel de riesgo
function analyzeRiskLevel(event: SecurityEvent, allEvents: SecurityEvent[]): string {
  // Análisis de patrones sospechosos
  const recentEvents = allEvents.filter(e => 
    new Date(e.timestamp).getTime() > Date.now() - (60 * 60 * 1000) // Última hora
  );

  // Múltiples fallos de login desde la misma IP
  const failedLoginsFromIP = recentEvents.filter(e => 
    e.type === 'failed_login' && e.ip === event.ip
  ).length;

  // Accesos administrativos inusuales
  const adminAccessesFromIP = recentEvents.filter(e => 
    e.type === 'admin_access' && e.ip === event.ip
  ).length;

  // Determinar nivel de riesgo
  if (failedLoginsFromIP >= 5 || event.severity === 'critical') {
    return 'critical';
  } else if (failedLoginsFromIP >= 3 || adminAccessesFromIP >= 3 || event.severity === 'high') {
    return 'high';
  } else if (event.severity === 'medium') {
    return 'medium';
  } else {
    return 'low';
  }
}

// Función para parsear timeframe
function parseTimeframe(timeframe: string): number {
  switch (timeframe) {
    case '1h': return 60 * 60 * 1000;
    case '24h': return 24 * 60 * 60 * 1000;
    case '7d': return 7 * 24 * 60 * 60 * 1000;
    case '30d': return 30 * 24 * 60 * 60 * 1000;
    default: return 24 * 60 * 60 * 1000;
  }
}

// Función para calcular métricas de seguridad
function calculateSecurityMetrics(events: SecurityEvent[]) {
  const uniqueIPs = new Set(events.map(e => e.ip));
  const uniqueUsers = new Set(events.map(e => e.user));

  return {
    totalEvents: events.length,
    uniqueIPs: uniqueIPs.size,
    uniqueUsers: uniqueUsers.size,
    suspiciousActivities: events.filter(e => e.type === 'suspicious_activity').length,
    failedLogins: events.filter(e => e.type === 'failed_login').length,
    adminAccesses: events.filter(e => e.type === 'admin_access').length,
    dataExports: events.filter(e => e.type === 'data_export').length,
    criticalEvents: events.filter(e => e.severity === 'critical').length,
    highSeverityEvents: events.filter(e => e.severity === 'high').length,
    eventsByType: events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    eventsBySeverity: events.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
}

// Función para analizar tendencias
function analyzeTrends(allEvents: SecurityEvent[], timeframeMs: number) {
  const now = Date.now();
  const currentPeriod = allEvents.filter(e => 
    new Date(e.timestamp).getTime() > now - timeframeMs
  );
  const previousPeriod = allEvents.filter(e => {
    const eventTime = new Date(e.timestamp).getTime();
    return eventTime > now - (timeframeMs * 2) && eventTime <= now - timeframeMs;
  });

  const currentMetrics = calculateSecurityMetrics(currentPeriod);
  const previousMetrics = calculateSecurityMetrics(previousPeriod);

  return {
    totalEventsChange: calculatePercentageChange(previousMetrics.totalEvents, currentMetrics.totalEvents),
    failedLoginsChange: calculatePercentageChange(previousMetrics.failedLogins, currentMetrics.failedLogins),
    suspiciousActivitiesChange: calculatePercentageChange(previousMetrics.suspiciousActivities, currentMetrics.suspiciousActivities),
    adminAccessesChange: calculatePercentageChange(previousMetrics.adminAccesses, currentMetrics.adminAccesses),
    uniqueIPsChange: calculatePercentageChange(previousMetrics.uniqueIPs, currentMetrics.uniqueIPs)
  };
}

// Función para calcular cambio porcentual
function calculatePercentageChange(previous: number, current: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}