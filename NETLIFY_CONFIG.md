# Configuración de Netlify para "Scraping Hub"

## Descripción General

Este documento detalla la configuración necesaria para desplegar la aplicación "Scraping Hub" en Netlify, incluyendo la configuración del sitio, variables de entorno, funciones serverless y optimizaciones de rendimiento.

## Configuración del Sitio en Netlify

### 1. Creación del Sitio
1. Acceder a [Netlify Dashboard](https://app.netlify.com/)
2. Hacer clic en "Add new site" > "Import an existing project"
3. Seleccionar el repositorio de GitHub/GitLab/Bitbucket
4. Configurar los siguientes ajustes:

### 2. Ajustes de Construcción
```
Base directory: /
Build command: next build
Publish directory: .next
Functions directory: functions
```

### 3. Configuración del Dominio
- Dominio por defecto: `scraping-hub.netlify.app`
- Dominio personalizado (opcional): `scraping.tudominio.com`
- Configuración de SSL automática

## Archivo de Configuración (netlify.toml)

```toml
[build]
  command = "next build"
  publish = ".next"
  functions = "functions"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[functions]
  # Configuración de funciones serverless
  node_bundler = "esbuild"
  
  # Límites de funciones
  [functions.scrape]
    maxDuration = 60  # segundos
    memory = 1024     # MB

[dev]
  command = "next dev"
  port = 3000
  targetPort = 3000
  publish = ".next"

# Redirecciones y reescrituras
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

# Headers para optimización
[[headers]]
  for = "/_next/static/*"
  [headers.values]
    cache-control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/assets/*"
  [headers.values]
    cache-control = "public, max-age=31536000"

# Headers de seguridad
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

## Variables de Entorno

### 1. Configuración en Netlify
En el Dashboard de Netlify:
1. Ir a "Site settings" > "Build & deploy" > "Environment"
2. Agregar las siguientes variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_KEY=your_supabase_anon_key

# WebSocket (si se usa un servicio externo)
NEXT_PUBLIC_WEBSOCKET_URL=wss://your-websocket-service.com

# Sentry (opcional para monitoreo de errores)
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn

# Upstash Redis (opcional para rate limiting)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

### 2. Entornos de Despliegue
- **Production**: Variables para entorno de producción
- **Branch Deploy**: Variables para entornos de desarrollo
- **Deploy Preview**: Variables para previews de PR

## Funciones Serverless

### 1. Estructura de Funciones
```
functions/
├── scrape.js          # Función principal de scraping
├── websocket.js       # Manejo de conexiones WebSocket
└── supabase.js        # Integración con Supabase
```

### 2. Configuración de Puppeteer en Netlify
```javascript
// functions/scrape.js
const chromium = require('chrome-aws-lambda');

exports.handler = async (event, context) => {
  let browser = null;
  
  try {
    // Iniciar navegador Chromium
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
    
    // Lógica de scraping...
    
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
```

### 3. Límites de Funciones
- **Tiempo de ejecución máximo**: 60 segundos (Netlify Pro: 900 segundos)
- **Memoria**: 1024 MB por defecto
- **Tamaño del paquete**: 50 MB comprimido
- **Concurrencia**: 1000 invocaciones simultáneas

## Optimizaciones de Rendimiento

### 1. Caching
```toml
# netlify.toml
[[headers]]
  for = "/_next/static/*"
  [headers.values]
    cache-control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/assets/*"
  [headers.values]
    cache-control = "public, max-age=31536000"
```

### 2. Compresión
- Compresión automática de assets
- Minificación de CSS y JavaScript
- Optimización de imágenes

### 3. CDN
- Distribución global de contenido
- Edge functions para procesamiento cercano al usuario
- Cache inteligente basado en headers

## Seguridad

### 1. Headers de Seguridad
```toml
# netlify.toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### 2. Protección contra Abusos
- Rate limiting mediante Upstash Redis
- Validación de entrada en funciones
- Monitoreo de errores con Sentry

### 3. HTTPS
- SSL automático con Let's Encrypt
- Redirección automática de HTTP a HTTPS
- HSTS (HTTP Strict Transport Security)

## Monitoreo y Logging

### 1. Logs de Construcción
- Acceso a logs de construcción en Netlify Dashboard
- Notificaciones de fallos de construcción
- Historial de despliegues

### 2. Logs de Funciones
- Logs en tiempo real en Netlify Dashboard
- Métricas de rendimiento
- Seguimiento de errores

### 3. Integración con Servicios Externos
```toml
# netlify.toml
[[plugins]]
  package = "@netlify/plugin-sitemap"
  
[[plugins]]
  package = "@netlify/plugin-nextjs"
```

## Despliegue Continuo

### 1. Configuración de Git
- Despliegue automático en push a `main`
- Previews de Pull Requests
- Rollback a versiones anteriores

### 2. Webhooks
```toml
# netlify.toml
[build]
  publish = ".next"
  command = "next build"
  
  [build.environment]
    NODE_VERSION = "20"
```

### 3. Notificaciones
- Slack notifications
- Email notifications
- Webhooks personalizados

## Escalabilidad

### 1. Autoescalado
- Funciones serverless que escalan automáticamente
- CDN global para distribución de contenido
- Base de datos escalable con Supabase

### 2. Límites y Cuotas
- **Build minutes**: 300 minutos/mes (gratuito)
- **Bandwidth**: 100 GB/mes (gratuito)
- **Funciones**: 125K invocaciones/mes (gratuito)

### 3. Planes de Pago
- **Pro Plan**: $19/mes por sitio
  - 1000 minutos de build
  - 1000 GB de bandwidth
  - 500K invocaciones de funciones
  - Forms y Analytics ilimitados

## Troubleshooting

### 1. Errores Comunes
```bash
# Error: Module not found
# Solución: Verificar dependencias en package.json

# Error: Function timeout
# Solución: Optimizar código o aumentar timeout

# Error: Build failed
# Solución: Revisar logs de construcción
```

### 2. Debugging
- Usar `netlify dev` para entorno local
- Logs en tiempo real en Netlify Dashboard
- Pruebas de funciones con `netlify functions:invoke`

### 3. Performance Issues
- Analizar bundle size con `@next/bundle-analyzer`
- Optimizar imágenes con `next/image`
- Usar ISR (Incremental Static Regeneration)

## Mejores Prácticas

### 1. Estructura del Proyecto
```
scraping-hub/
├── app/              # Next.js App Router
├── components/       # Componentes React
├── functions/        # Netlify Functions
├── lib/              # Librerías y utilidades
├── public/           # Archivos estáticos
└── styles/           # Estilos globales
```

### 2. Configuración de Variables de Entorno
- Usar `.env.local` para desarrollo
- Configurar variables en Netlify Dashboard
- No commitear secrets al repositorio

### 3. Optimización de Funciones
- Minimizar tamaño del paquete
- Usar `chrome-aws-lambda` para Puppeteer
- Implementar manejo de errores robusto

Este documento proporciona una guía completa para la configuración de Netlify para el proyecto "Scraping Hub".