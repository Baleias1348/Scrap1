# Seguridad Implementada en "Scraping Hub"

## Descripción General

Este documento detalla las consideraciones de seguridad implementadas en el proyecto "Scraping Hub". La aplicación sigue las mejores prácticas de seguridad para aplicaciones web modernas, protegiendo tanto los datos del usuario como la infraestructura subyacente.

## Principios de Seguridad Aplicados

### 1. Defensa en Profundidad
Implementación de múltiples capas de seguridad:
- Validación de entrada en frontend y backend
- Protección contra XSS, CSRF y SQL Injection
- Control de acceso y autenticación
- Monitoreo y logging de seguridad

### 2. Principio de Menor Privilegio
- Usuarios con permisos mínimos necesarios
- Funciones serverless con acceso restringido
- Base de datos con políticas RLS (Row Level Security)

### 3. Seguridad por Diseño
- Consideraciones de seguridad desde la fase de diseño
- Revisión de código enfocada en seguridad
- Pruebas de seguridad automatizadas

## Validación de Entrada

### 1. Validación en el Frontend
```typescript
// utils/validation.ts
export function validateUrls(urls: string[]): ValidationResult {
  const errors: string[] = [];
  
  // Verificar cantidad mínima y máxima
  if (urls.length === 0) {
    errors.push('Debe ingresar al menos una URL');
  }
  
  if (urls.length > 100) {
    errors.push('No se pueden procesar más de 100 URLs a la vez');
  }
  
  // Validar formato de URLs
  const invalidUrls: string[] = [];
  urls.forEach(url => {
    try {
      const parsedUrl = new URL(url);
      
      // Verificar protocolo permitido
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        invalidUrls.push(url);
        return;
      }
      
      // Verificar longitud máxima
      if (url.length > 2048) {
        invalidUrls.push(url);
        return;
      }
      
      // Verificar caracteres peligrosos
      if (/[<>'"\\]/.test(url)) {
        invalidUrls.push(url);
        return;
      }
    } catch {
      invalidUrls.push(url);
    }
  });
  
  if (invalidUrls.length > 0) {
    errors.push(`URLs inválidas: ${invalidUrls.join(', ')}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Validación de estrategias
export function validateStrategy(strategy: string): boolean {
  const allowedStrategies: string[] = ['universal', 'leychile'];
  return allowedStrategies.includes(strategy);
}
```

### 2. Sanitización de Datos
```typescript
// utils/sanitization.ts
export function sanitizeInput(input: string): string {
  // Eliminar caracteres de control
  let sanitized = input.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Eliminar etiquetas HTML peligrosas
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  
  // Sanitizar atributos peligrosos
  sanitized = sanitized.replace(/on\w+="[^"]*"/gi, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  return sanitized;
}

// Sanitización de URLs
export function sanitizeUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    
    // Solo permitir protocolos seguros
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Protocolo no permitido');
    }
    
    // Reconstruir URL limpia
    return `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}${parsedUrl.search}`;
  } catch {
    throw new Error('URL inválida');
  }
}
```

### 3. Validación en el Backend
```typescript
// functions/scrape.ts
import { validateUrls, sanitizeUrl } from '../utils/validation';

export const handler: Handler = async (event, context) => {
  try {
    // Parsear body
    const body = JSON.parse(event.body || '{}');
    
    // Validar estructura del request
    if (!body.urls || !Array.isArray(body.urls)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Formato de URLs inválido' })
      };
    }
    
    if (!body.strategy || typeof body.strategy !== 'string') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Estrategia requerida' })
      };
    }
    
    // Validar URLs
    const validation = validateUrls(body.urls);
    if (!validation.valid) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: validation.errors.join(', ') })
      };
    }
    
    // Sanitizar URLs
    const sanitizedUrls = body.urls.map(url => sanitizeUrl(url));
    
    // Validar estrategia
    if (!validateStrategy(body.strategy)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Estrategia no válida' })
      };
    }
    
    // Continuar con el procesamiento...
    
  } catch (error) {
    console.error('Error de validación:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Datos de entrada inválidos' })
    };
  }
};
```

## Protección contra Ataques Comunes

### 1. Cross-Site Scripting (XSS)
```typescript
// next.config.js
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' wss:;"
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
```

### 2. Cross-Site Request Forgery (CSRF)
```typescript
// lib/csrf.ts
import { randomBytes } from 'crypto';

export class CSRFProtection {
  static generateToken(): string {
    return randomBytes(32).toString('hex');
  }
  
  static validateToken(token: string, sessionToken: string): boolean {
    return token === sessionToken;
  }
  
  static setTokenCookie(res: any, token: string): void {
    res.cookie('csrf-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000 // 1 hora
    });
  }
}
```

### 3. SQL Injection
```typescript
// lib/supabase.ts
export class SupabaseFacade {
  // Uso de parámetros parametrizados en lugar de concatenación
  static async getScrapingResults(limit: number = 10, offset: number = 0) {
    // Supabase usa parámetros parametrizados automáticamente
    const { data, error } = await supabase
      .from('resultados_scraping')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw new Error(error.message);
    return data;
  }
  
  static async saveScrapingResult(result: any) {
    // Validación de datos antes de insertar
    if (!result.estrategia_usada || typeof result.estrategia_usada !== 'string') {
      throw new Error('Estrategia inválida');
    }
    
    if (!result.urls_procesadas || typeof result.urls_procesadas !== 'number') {
      throw new Error('Número de URLs inválido');
    }
    
    // Supabase maneja la sanitización automáticamente
    const { data, error } = await supabase
      .from('resultados_scraping')
      .insert([{
        estrategia_usada: result.estrategia_usada,
        urls_procesadas: result.urls_procesadas,
        resultado_json: result.resultado_json
      }])
      .select();
    
    if (error) throw new Error(error.message);
    return data[0];
  }
}
```

## Autenticación y Autorización

### 1. Protección de Rutas
```typescript
// app/scraper/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function ScraperPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    // Redirigir si no hay usuario autenticado
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  if (loading) {
    return <div>Cargando...</div>;
  }
  
  if (!user) {
    return null;
  }
  
  return (
    // Contenido de la página
    <div>...</div>
  );
}
```

### 2. Control de Acceso Basado en Roles
```typescript
// lib/auth.ts
export class AuthManager {
  static async checkPermission(user: any, resource: string, action: string): Promise<boolean> {
    // Implementación de control de acceso basado en roles
    const permissions = await this.getUserPermissions(user.id);
    
    return permissions.some(permission => 
      permission.resource === resource && 
      (permission.action === '*' || permission.action === action)
    );
  }
  
  static async getUserPermissions(userId: string): Promise<Permission[]> {
    const { data, error } = await supabase
      .from('user_permissions')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw new Error(error.message);
    return data || [];
  }
}
```

## Rate Limiting y Protección contra Abusos

### 1. Rate Limiting con Upstash Redis
```typescript
// middleware/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
});

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, '60 s'), // 10 requests por minuto
  analytics: true
});

export async function checkRateLimit(identifier: string) {
  const { success, limit, remaining, reset } = await ratelimit.limit(identifier);
  
  return {
    success,
    limit,
    remaining,
    reset
  };
}
```

### 2. Middleware de Rate Limiting
```typescript
// middleware/rate-limit-middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from './rate-limit';

export async function rateLimitMiddleware(request: NextRequest) {
  // Obtener identificador único (IP + User Agent)
  const identifier = `${request.ip || '127.0.0.1'}_${request.headers.get('user-agent') || ''}`;
  
  const { success, limit, remaining, reset } = await checkRateLimit(identifier);
  
  if (!success) {
    return new NextResponse(
      JSON.stringify({ error: 'Demasiadas solicitudes' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString()
        }
      }
    );
  }
  
  // Continuar con la solicitud
  return NextResponse.next();
}
```

## Protección de Datos

### 1. Encriptación de Datos Sensibles
```typescript
// lib/encryption.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || randomBytes(32);
const IV_LENGTH = 16;

export class DataEncryption {
  static encrypt(text: string): string {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }
  
  static decrypt(encryptedText: string): string {
    const textParts = encryptedText.split(':');
    const iv = Buffer.from(textParts.shift() || '', 'hex');
    const encrypted = Buffer.from(textParts.join(':'), 'hex');
    const decipher = createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString();
  }
}
```

### 2. Protección de Variables de Entorno
```bash
# .env.local (gitignoreado)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_KEY=your_supabase_key
ENCRYPTION_KEY=your_32_byte_encryption_key
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# .env.example (compartido)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_KEY=
ENCRYPTION_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

## Monitoreo y Logging de Seguridad

### 1. Logging de Eventos de Seguridad
```typescript
// lib/security-logger.ts
import { createLogger, format, transports } from 'winston';

const securityLogger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.File({ filename: 'security.log' })
  ]
});

export class SecurityLogger {
  static logEvent(event: string, details: any, severity: 'low' | 'medium' | 'high' = 'low') {
    securityLogger.info({
      event,
      severity,
      details,
      timestamp: new Date().toISOString()
    });
  }
  
  static logSuspiciousActivity(activity: string, userId?: string, ip?: string) {
    this.logEvent('suspicious_activity', {
      activity,
      userId,
      ip,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server'
    }, 'high');
  }
  
  static logFailedLogin(attempt: any) {
    this.logEvent('failed_login', attempt, 'medium');
  }
}
```

### 2. Detección de Actividad Anómala
```typescript
// lib/anomaly-detection.ts
export class AnomalyDetection {
  static async detectUnusualActivity(userId: string, activity: string): Promise<boolean> {
    // Obtener historial de actividades del usuario
    const userActivities = await this.getUserActivities(userId, 24); // Últimas 24 horas
    
    // Verificar patrones inusuales
    const isUnusual = this.isActivityUnusual(activity, userActivities);
    
    if (isUnusual) {
      SecurityLogger.logSuspiciousActivity(
        `Actividad inusual detectada: ${activity}`,
        userId
      );
    }
    
    return isUnusual;
  }
  
  private static isActivityUnusual(activity: string, userActivities: any[]): boolean {
    // Implementar lógica de detección de anomalías
    // Por ejemplo: frecuencia inusual, horarios extraños, etc.
    return false; // Implementación simplificada
  }
}
```

## Seguridad en el Scraping

### 1. Protección contra Scraping Malicioso
```typescript
// functions/scrape.ts
export const handler: Handler = async (event, context) => {
  // Verificar que las URLs sean de dominios permitidos
  const allowedDomains = [
    'bcn.cl',
    'leychile.cl',
    'dt.gob.cl'
  ];
  
  const urls = JSON.parse(event.body || '{}').urls;
  
  const unauthorizedUrls = urls.filter((url: string) => {
    try {
      const domain = new URL(url).hostname;
      return !allowedDomains.some(allowed => domain.includes(allowed));
    } catch {
      return true; // URL inválida
    }
  });
  
  if (unauthorizedUrls.length > 0) {
    return {
      statusCode: 403,
      body: JSON.stringify({ 
        error: 'Acceso denegado a dominios no autorizados',
        unauthorizedUrls
      })
    };
  }
  
  // Continuar con el scraping...
};
```

### 2. Manejo Seguro de Cookies y Sesiones
```typescript
// lib/puppeteer-config.ts
export async function createSecureBrowser() {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-web-security', // Solo si es necesario
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  });
  
  return browser;
}

// Configuración de contexto seguro
export async function createSecurePage(browser: puppeteer.Browser) {
  const page = await browser.newPage();
  
  // Configurar user agent
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  
  // Deshabilitar imágenes para mejorar rendimiento y seguridad
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (req.resourceType() === 'image') {
      req.abort();
    } else {
      req.continue();
    }
  });
  
  return page;
}
```

## Consideraciones de Infraestructura

### 1. Seguridad en Netlify
```toml
# netlify.toml
[build]
  command = "next build"
  publish = ".next"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(), microphone=(), camera=()"

[[headers]]
  for = "/_next/static/*"
  [headers.values]
    cache-control = "public, max-age=31536000, immutable"
```

### 2. Seguridad en Supabase
```sql
-- Configuración de RLS (Row Level Security)
ALTER TABLE resultados_scraping ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
CREATE POLICY "Usuarios pueden leer sus propios resultados" 
ON resultados_scraping
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden insertar resultados" 
ON resultados_scraping
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Funciones de seguridad
CREATE OR REPLACE FUNCTION check_user_ownership()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() != NEW.user_id THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Pruebas de Seguridad

### 1. Escaneo de Vulnerabilidades
```json
// package.json
{
  "scripts": {
    "security:audit": "npm audit",
    "security:audit-fix": "npm audit fix",
    "security:scan": "npx audit-ci --high"
  }
}
```

### 2. Pruebas de Penetración
```typescript
// tests/security/penetration.test.ts
import { test, expect } from '@playwright/test';

test.describe('Pruebas de seguridad', () => {
  test('debe prevenir XSS en formularios', async ({ page }) => {
    await page.goto('/scraper');
    
    // Intentar inyectar script
    await page.getByLabel('URLs para procesar').fill(
      '<script>alert("xss")</script>https://example.com'
    );
    
    await page.getByRole('button', { name: 'Iniciar Scraping' }).click();
    
    // Verificar que se muestre error de validación
    await expect(page.getByText('URL inválida')).toBeVisible();
  });
  
  test('debe prevenir acceso a dominios no autorizados', async ({ request }) => {
    const response = await request.post('/api/scrape', {
      data: {
        urls: ['https://malicious-site.com'],
        strategy: 'universal'
      }
    });
    
    expect(response.status()).toBe(403);
  });
});
```

## Mejores Prácticas de Seguridad

### 1. Actualización Regular
- Monitoreo de vulnerabilidades en dependencias
- Actualización automática de paquetes críticos
- Revisión de seguridad trimestral

### 2. Principio de Mínimo Privilegio
- Funciones serverless con permisos mínimos
- Usuarios de base de datos con acceso restringido
- Variables de entorno con permisos adecuados

### 3. Logging y Monitoreo
- Registro de eventos de seguridad
- Alertas para actividad sospechosa
- Auditoría de acceso y cambios

### 4. Respuesta a Incidentes
- Plan de respuesta a incidentes de seguridad
- Procedimientos de notificación
- Recuperación de sistemas comprometidos

Este enfoque integral de seguridad garantiza que "Scraping Hub" sea una aplicación segura y confiable para el procesamiento de datos web.