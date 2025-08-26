import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Función para log de eventos de seguridad
async function logSecurityEvent(eventData: {
  type: string;
  user: string;
  details: string;
  severity: string;
  ip: string;
  userAgent: string;
  resource?: string;
}) {
  try {
    // En producción, esto debería ser una llamada interna o una cola de mensajes
    // Por ahora, log en consola
    console.log(`[SECURITY] ${eventData.severity.toUpperCase()}: ${eventData.type} - ${eventData.user} from ${eventData.ip}`);
    
    // Aquí podrías integrar con sistemas de logging externos o base de datos
    // await fetch('/api/admin/security', { ... })
  } catch (error) {
    console.error('Error logging security event:', error);
  }
}

// Rutas que requieren autenticación de admin
const PROTECTED_ADMIN_ROUTES = [
  '/admin',
  '/api/admin'
];

// Rutas excluidas de la protección
const EXCLUDED_ROUTES = [
  '/admin/login',
  '/api/admin/auth'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.ip || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
  const userAgent = request.headers.get('user-agent') || 'Unknown';
  
  // Verificar si es una ruta administrativa protegida
  const isAdminRoute = PROTECTED_ADMIN_ROUTES.some(route => 
    pathname.startsWith(route)
  );
  
  // Verificar si es una ruta excluida
  const isExcludedRoute = EXCLUDED_ROUTES.some(route =>
    pathname.startsWith(route)
  );
  
  if (!isAdminRoute || isExcludedRoute) {
    return NextResponse.next();
  }
  
  // Verificar autenticación de administrador
  const adminAuth = request.cookies.get('admin_auth');
  
  if (!adminAuth) {
    // Log intento de acceso no autorizado
    logSecurityEvent({
      type: 'unauthorized_access',
      user: 'anonymous',
      details: `Intento de acceso no autorizado a ${pathname}`,
      severity: 'medium',
      ip: ip,
      userAgent: userAgent,
      resource: pathname
    });
    
    // Redirigir a login de admin
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  
  try {
    // Verificar token de admin
    const authData = JSON.parse(adminAuth.value);
    
    // Verificar estructura básica del token
    if (!authData.email || !authData.authenticated || !authData.expires) {
      throw new Error('Token structure invalid');
    }
    
    // Verificar si el token ha expirado
    if (authData.expires < Date.now()) {
      // Log sesión expirada
      logSecurityEvent({
        type: 'session_expired',
        user: authData.email || 'unknown',
        details: 'Sesión de administrador expirada',
        severity: 'low',
        ip: ip,
        userAgent: userAgent,
        resource: pathname
      });
      
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('admin_auth');
      return response;
    }
    
    // Log acceso administrativo exitoso
    if (pathname.startsWith('/admin') && !pathname.includes('/api/')) {
      logSecurityEvent({
        type: 'admin_access',
        user: authData.email,
        details: `Acceso a panel administrativo: ${pathname}`,
        severity: 'medium',
        ip: ip,
        userAgent: userAgent,
        resource: pathname
      });
    }
    
    // Agregar información del admin a los headers para las APIs
    const response = NextResponse.next();
    response.headers.set('X-Admin-User', authData.email);
    response.headers.set('X-Admin-Role', authData.role || 'admin');
    
    return response;
    
  } catch (error) {
    // Log token inválido o corrupto
    logSecurityEvent({
      type: 'invalid_token',
      user: 'unknown',
      details: 'Token de administrador inválido o corrupto',
      severity: 'high',
      ip: ip,
      userAgent: userAgent,
      resource: pathname
    });
    
    // Token corrupto o inválido
    const response = NextResponse.redirect(new URL('/admin/login', request.url));
    response.cookies.delete('admin_auth');
    return response;
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ]
};