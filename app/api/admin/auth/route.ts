import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Rate limiting simple (en producción usar Redis)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutos

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
    // En desarrollo, log en consola. En producción, enviar al endpoint de seguridad
    console.log(`[AUTH-SECURITY] ${eventData.severity.toUpperCase()}: ${eventData.type} - ${eventData.user} from ${eventData.ip}`);
    
    // Llamar al API de seguridad para persistir el evento
    await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/admin/security`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    }).catch(err => console.error('Error sending to security API:', err));
  } catch (error) {
    console.error('Error logging security event:', error);
  }
}

// Función para verificar rate limiting
function checkRateLimit(ip: string): { allowed: boolean; remainingAttempts: number } {
  const now = Date.now();
  const ipAttempts = loginAttempts.get(ip);
  
  if (!ipAttempts) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS - 1 };
  }
  
  // Reset counter si ha pasado el tiempo de lockout
  if (now - ipAttempts.lastAttempt > LOCKOUT_TIME) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS - 1 };
  }
  
  // Incrementar contador
  ipAttempts.count++;
  ipAttempts.lastAttempt = now;
  
  const remainingAttempts = Math.max(0, MAX_LOGIN_ATTEMPTS - ipAttempts.count);
  const allowed = ipAttempts.count <= MAX_LOGIN_ATTEMPTS;
  
  return { allowed, remainingAttempts };
}

interface AdminUser {
  email: string;
  password: string;
  role: string;
  name: string;
}

// Usuarios administradores autorizados
const ADMIN_USERS: AdminUser[] = [
  {
    email: 'admin@preventiflow.com',
    password: 'AdminPreventi2025!',
    role: 'super_admin',
    name: 'Administrador Principal'
  },
  {
    email: 'hernan@preventiflow.com',
    password: 'HernanAdmin2025!',
    role: 'admin', 
    name: 'Hernán Herrera'
  }
];

export async function POST(req: Request) {
  try {
    const { email, password, action } = await req.json();
    const headersList = headers();
    
    // Obtener información del request para logging
    const forwarded = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const userAgent = headersList.get('user-agent') || 'Unknown';
    const clientIp = forwarded?.split(',')[0] || realIp || '127.0.0.1';

    if (action === 'login') {
      // Verificar rate limiting
      const rateLimitCheck = checkRateLimit(clientIp);
      
      if (!rateLimitCheck.allowed) {
        // Log intento de login bloqueado por rate limiting
        await logSecurityEvent({
          type: 'blocked_login_attempt',
          user: email || 'unknown',
          details: `Intento de login bloqueado por exceso de intentos fallidos (IP: ${clientIp})`,
          severity: 'high',
          ip: clientIp,
          userAgent: userAgent,
          resource: '/api/admin/auth'
        });
        
        return NextResponse.json({ 
          error: 'Demasiados intentos de login. Intenta nuevamente en 15 minutos.',
          remainingAttempts: 0,
          lockoutTime: LOCKOUT_TIME / 1000 / 60 // en minutos
        }, { status: 429 });
      }
      // Verificar credenciales
      const adminUser = ADMIN_USERS.find(
        user => user.email === email && user.password === password
      );

      if (!adminUser) {
        // Log intento de login fallido
        await logSecurityEvent({
          type: 'failed_login',
          user: email || 'unknown',
          details: `Intento de login fallido con credenciales incorrectas`,
          severity: 'medium',
          ip: clientIp,
          userAgent: userAgent,
          resource: '/api/admin/auth'
        });
        
        return NextResponse.json({ 
          error: 'Credenciales de administrador inválidas',
          remainingAttempts: rateLimitCheck.remainingAttempts
        }, { status: 401 });
      }
      
      // Reset contador de intentos en login exitoso
      loginAttempts.delete(clientIp);
      
      // Log login exitoso
      await logSecurityEvent({
        type: 'successful_login',
        user: adminUser.email,
        details: `Login administrativo exitoso`,
        severity: 'low',
        ip: clientIp,
        userAgent: userAgent,
        resource: '/api/admin/auth'
      });

      // Crear token de sesión
      const authData = {
        email: adminUser.email,
        role: adminUser.role,
        name: adminUser.name,
        authenticated: true,
        expires: Date.now() + (24 * 60 * 60 * 1000), // 24 horas
        loginTime: new Date().toISOString()
      };

      // Configurar cookie de autenticación
      const response = NextResponse.json({ 
        success: true,
        user: {
          email: adminUser.email,
          role: adminUser.role,
          name: adminUser.name
        },
        message: 'Autenticación exitosa'
      });

      response.cookies.set('admin_auth', JSON.stringify(authData), {
        httpOnly: false, // Necesario para acceso desde cliente
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60, // 24 horas
        path: '/'
      });

      return response;
    }

    if (action === 'logout') {
      // Log logout
      await logSecurityEvent({
        type: 'logout',
        user: email || 'unknown',
        details: 'Cierre de sesión administrativo',
        severity: 'low',
        ip: clientIp,
        userAgent: userAgent,
        resource: '/api/admin/auth'
      });
      
      const response = NextResponse.json({ 
        success: true,
        message: 'Sesión cerrada exitosamente' 
      });

      // Limpiar cookie
      response.cookies.delete('admin_auth');

      return response;
    }

    if (action === 'verify') {
      // Verificar token desde header o cookie
      const authHeader = req.headers.get('authorization');
      const cookieHeader = req.headers.get('cookie');
      
      let authData = null;

      if (authHeader?.startsWith('Bearer ')) {
        try {
          authData = JSON.parse(authHeader.substring(7));
        } catch (error) {
          return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
        }
      } else if (cookieHeader) {
        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        }, {} as Record<string, string>);

        if (cookies.admin_auth) {
          try {
            authData = JSON.parse(decodeURIComponent(cookies.admin_auth));
          } catch (error) {
            return NextResponse.json({ error: 'Cookie inválida' }, { status: 401 });
          }
        }
      }

      if (!authData) {
        return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
      }

      // Verificar si el token ha expirado
      if (authData.expires < Date.now()) {
        return NextResponse.json({ error: 'Sesión expirada' }, { status: 401 });
      }

      // Verificar que el usuario aún existe
      const adminUser = ADMIN_USERS.find(user => user.email === authData.email);
      if (!adminUser) {
        return NextResponse.json({ error: 'Usuario no autorizado' }, { status: 401 });
      }

      return NextResponse.json({ 
        success: true,
        user: {
          email: adminUser.email,
          role: adminUser.role,
          name: adminUser.name,
          loginTime: authData.loginTime
        }
      });
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });

  } catch (error: any) {
    console.error('[Admin Auth] Error:', error);
    return NextResponse.json({ 
      error: error?.message || 'Error interno del servidor' 
    }, { status: 500 });
  }
}

export async function GET(req: Request) {
  // Endpoint para verificar estado de autenticación
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  if (action === 'users') {
    // Retornar lista de usuarios autorizados (sin contraseñas)
    const userList = ADMIN_USERS.map(user => ({
      email: user.email,
      role: user.role,
      name: user.name
    }));

    return NextResponse.json({ 
      success: true,
      users: userList
    });
  }

  return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
}