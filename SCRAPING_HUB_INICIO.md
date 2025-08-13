# Inicio y Ejecución del Proyecto "Scraping Hub"

## Descripción General

Este documento proporciona instrucciones detalladas para iniciar y ejecutar el proyecto "Scraping Hub" en un entorno de desarrollo local. Incluye requisitos del sistema, instalación de dependencias, configuración del entorno y comandos para ejecutar la aplicación.

## Requisitos del Sistema

### Requisitos Mínimos
- **Sistema Operativo**: Windows 10+, macOS 10.14+, Ubuntu 18.04+
- **Node.js**: v18.17.0 o superior
- **npm**: v9.0.0 o superior
- **Git**: v2.13.0 o superior
- **Memoria RAM**: 8GB mínimo (16GB recomendado)
- **Espacio en Disco**: 2GB mínimo

### Requisitos Recomendados
- **Sistema Operativo**: Ubuntu 20.04+, macOS 12+, Windows 11+
- **Node.js**: v20.0.0 o superior
- **npm**: v9.5.0 o superior
- **Memoria RAM**: 16GB
- **Espacio en Disco**: 5GB

## Configuración del Entorno de Desarrollo

### 1. Instalación de Node.js y npm

#### Usando Node Version Manager (nvm) - Recomendado
```bash
# Instalar nvm (macOS/Linux)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Instalar Node.js LTS
nvm install --lts
nvm use --lts

# Verificar instalación
node --version
npm --version
```

#### Usando instalador oficial (Windows)
1. Descargar el instalador de [nodejs.org](https://nodejs.org/)
2. Ejecutar el instalador
3. Reiniciar la terminal
4. Verificar instalación:
```bash
node --version
npm --version
```

### 2. Instalación de Git

#### macOS (con Homebrew)
```bash
brew install git
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install git
```

#### Windows
1. Descargar Git desde [git-scm.com](https://git-scm.com/)
2. Ejecutar el instalador
3. Reiniciar la terminal

#### Verificar instalación
```bash
git --version
```

### 3. Creación de Cuentas de Servicio

#### Supabase
1. Acceder a [supabase.io](https://supabase.io/)
2. Crear cuenta gratuita
3. Crear nuevo proyecto:
   - Nombre: `scraping-hub-dev`
   - Contraseña: Segura y guardada en gestor de contraseñas
   - Región: La más cercana geográficamente

#### Netlify (opcional para despliegue)
1. Acceder a [netlify.com](https://netlify.com/)
2. Crear cuenta gratuita

## Clonación del Repositorio

```bash
# Clonar el repositorio
git clone https://github.com/tu-organizacion/scraping-hub.git

# Navegar al directorio del proyecto
cd scraping-hub

# Instalar dependencias
npm install
```

## Configuración de Variables de Entorno

### 1. Crear archivo .env.local
```bash
# Crear archivo de variables de entorno
cp .env.example .env.local
```

### 2. Configurar Supabase
En el Dashboard de Supabase:
1. Ir a "Project Settings" > "API"
2. Copiar "Project URL" y "anon public key"
3. Configurar en `.env.local`:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=tu_project_url_de_supabase
NEXT_PUBLIC_SUPABASE_KEY=tu_anon_key_de_supabase
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:3001
```

### 3. Configuración Opcional de Servicios
```bash
# Para monitoreo de errores (opcional)
NEXT_PUBLIC_SENTRY_DSN=tu_sentry_dsn

# Para rate limiting (opcional)
UPSTASH_REDIS_REST_URL=tu_redis_url
UPSTASH_REDIS_REST_TOKEN=tu_redis_token
```

## Instalación de Dependencias

### 1. Dependencias del Proyecto
```bash
# Instalar dependencias principales
npm install

# Instalar shadcn/ui
npx shadcn-ui@latest init

# Instalar componentes necesarios
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add select
npx shadcn-ui@latest add card
npx shadcn-ui@latest add table
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add label
npx shadcn-ui@latest add scroll-area
```

### 2. Dependencias de Desarrollo
```bash
# Testing
npm install --save-dev @testing-library/react @testing-library/jest-dom
npm install --save-dev vitest @vitest/ui
npm install --save-dev playwright

# Linting y formateo
npm install --save-dev eslint prettier
npm install --save-dev @typescript-eslint/eslint-plugin
npm install --save-dev @typescript-eslint/parser

# Tipos
npm install --save-dev @types/node
npm install --save-dev @types/react
npm install --save-dev @types/react-dom
```

### 3. Dependencias del Backend
```bash
# Puppeteer para scraping
npm install puppeteer

# WebSocket para comunicación en tiempo real
npm install socket.io socket.io-client

# Supabase para base de datos
npm install @supabase/supabase-js

# Rate limiting (opcional)
npm install @upstash/ratelimit @upstash/redis

# Monitoreo de errores (opcional)
npm install @sentry/nextjs
```

## Configuración de la Base de Datos

### 1. Crear Tabla en Supabase
En el Dashboard de Supabase:
1. Ir a "Table Editor"
2. Crear nueva tabla con el siguiente SQL:

```sql
-- Crear tabla de resultados de scraping
CREATE TABLE resultados_scraping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  estrategia_usada TEXT,
  urls_procesadas INTEGER,
  resultado_json JSONB
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_resultados_scraping_created_at ON resultados_scraping(created_at);
CREATE INDEX idx_resultados_scraping_estrategia ON resultados_scraping(estrategia_usada);

-- Habilitar RLS (Row Level Security) si se requiere autenticación
ALTER TABLE resultados_scraping ENABLE ROW LEVEL SECURITY;
```

### 2. Configurar Políticas de Acceso
```sql
-- Políticas de ejemplo (ajustar según necesidades de autenticación)
CREATE POLICY "Usuarios pueden leer resultados" ON resultados_scraping
  FOR SELECT USING (true);

CREATE POLICY "Usuarios pueden insertar resultados" ON resultados_scraping
  FOR INSERT WITH CHECK (true);
```

## Ejecución del Proyecto

### 1. Modo de Desarrollo
```bash
# Iniciar servidor de desarrollo
npm run dev

# La aplicación estará disponible en http://localhost:3000
```

### 2. Modo de Producción
```bash
# Construir la aplicación para producción
npm run build

# Iniciar servidor de producción
npm run start

# La aplicación estará disponible en http://localhost:3000
```

### 3. Modo de Pruebas
```bash
# Ejecutar pruebas unitarias
npm run test

# Ejecutar pruebas de integración
npm run test:integration

# Ejecutar pruebas E2E
npm run test:e2e

# Ejecutar linter
npm run lint

# Formatear código
npm run format
```

## Configuración del Servidor WebSocket (Desarrollo)

### 1. Instalar Dependencias del Servidor
```bash
# Instalar servidor WebSocket para desarrollo
npm install --save-dev ws
npm install --save-dev nodemon
```

### 2. Crear Servidor de Desarrollo WebSocket
```javascript
// scripts/ws-server.js
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3001 });

wss.on('connection', (ws) => {
  console.log('Cliente conectado al WebSocket');

  ws.on('message', (message) => {
    console.log('Mensaje recibido:', message);
    
    // Echo del mensaje
    ws.send(message);
  });

  ws.on('close', () => {
    console.log('Cliente desconectado del WebSocket');
  });

  // Enviar mensaje de bienvenida
  ws.send(JSON.stringify({
    type: 'welcome',
    data: 'Conectado al servidor WebSocket de desarrollo'
  }));
});

console.log('Servidor WebSocket escuchando en ws://localhost:3001');
```

### 3. Agregar Script al package.json
```json
{
  "scripts": {
    "dev:ws": "node scripts/ws-server.js",
    "dev:all": "concurrently \"npm run dev\" \"npm run dev:ws\""
  }
}
```

### 4. Instalar concurrently
```bash
npm install --save-dev concurrently
```

## Estructura del Proyecto

```
scraping-hub/
├── app/                    # Páginas de Next.js App Router
│   ├── layout.tsx          # Layout raíz
│   ├── page.tsx            # Página Dashboard
│   ├── dashboard/          # Página Dashboard
│   ├── scraper/            # Página Scraper
│   └── resultados/         # Página Resultados
├── components/             # Componentes React
│   ├── ui/                 # Componentes shadcn/ui
│   ├── layout/             # Componentes de layout
│   ├── scraper/            # Componentes del scraper
│   └── results/            # Componentes de resultados
├── lib/                    # Librerías y utilidades
│   ├── supabase.ts         # Cliente Supabase
│   ├── websocket.ts        # Cliente WebSocket
│   └── scraper.ts          # Lógica de scraping
├── functions/              # Funciones Netlify
│   └── scrape.ts           # Función de scraping
├── public/                 # Archivos estáticos
├── styles/                 # Estilos globales
├── types/                  # Tipos TypeScript
├── hooks/                  # Hooks personalizados
├── utils/                  # Funciones de utilidad
├── tests/                  # Pruebas
│   ├── unit/               # Pruebas unitarias
│   ├── integration/        # Pruebas de integración
│   └── e2e/                # Pruebas E2E
├── scripts/                # Scripts de desarrollo
├── .env.local              # Variables de entorno
├── next.config.js          # Configuración de Next.js
├── tailwind.config.js      # Configuración de Tailwind
└── package.json            # Dependencias y scripts
```

## Solución de Problemas Comunes

### 1. Errores de Instalación
```bash
# Limpiar caché de npm
npm cache clean --force

# Eliminar node_modules y package-lock.json
rm -rf node_modules package-lock.json

# Reinstalar dependencias
npm install
```

### 2. Errores de Puppeteer
```bash
# Instalar Chromium manualmente (si es necesario)
npx puppeteer browsers install chrome

# O instalar dependencias del sistema (Ubuntu/Debian)
sudo apt-get install -y libgtk-3-0 libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2
```

### 3. Errores de WebSocket
```bash
# Verificar que el puerto 3001 no esté en uso
lsof -i :3001

# Matar proceso si es necesario
kill -9 <PID>
```

### 4. Errores de Supabase
```bash
# Verificar variables de entorno
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_KEY

# Verificar conectividad
curl -I $NEXT_PUBLIC_SUPABASE_URL
```

## Comandos Útiles

### 1. Desarrollo
```bash
# Iniciar servidor de desarrollo
npm run dev

# Iniciar servidor de desarrollo con WebSocket
npm run dev:all

# Construir para producción
npm run build

# Iniciar servidor de producción
npm run start
```

### 2. Pruebas
```bash
# Ejecutar pruebas unitarias
npm run test

# Ejecutar pruebas en modo watch
npm run test:watch

# Ejecutar pruebas con cobertura
npm run test:coverage

# Ejecutar pruebas E2E
npm run test:e2e
```

### 3. Linting y Formateo
```bash
# Ejecutar linter
npm run lint

# Arreglar errores de linter
npm run lint:fix

# Formatear código
npm run format

# Formatear código específico
npm run format:write
```

### 4. Despliegue
```bash
# Construir para producción
npm run build

# Exportar aplicación estática
npm run export

# Desplegar en Netlify (requiere CLI de Netlify)
netlify deploy

# Desplegar en producción
netlify deploy --prod
```

## Monitoreo y Logging

### 1. Logs del Servidor de Desarrollo
```bash
# Ver logs en tiempo real
tail -f .next/standalone.log

# Ver logs de Puppeteer
DEBUG=puppeteer:* npm run dev
```

### 2. Monitoreo de Rendimiento
```bash
# Instalar herramientas de monitoreo
npm install --save-dev clinic
npm install --save-dev 0x

# Analizar rendimiento
npx clinic doctor -- node server.js
```

## Actualización del Proyecto

### 1. Actualizar Dependencias
```bash
# Verificar dependencias desactualizadas
npm outdated

# Actualizar todas las dependencias
npm update

# Actualizar a versiones mayores (con cuidado)
npm install package@latest
```

### 2. Actualizar Next.js
```bash
# Actualizar Next.js
npm install next@latest react@latest react-dom@latest

# Actualizar tipos
npm install @types/react@latest @types/react-dom@latest
```

### 3. Actualizar shadcn/ui
```bash
# Actualizar shadcn/ui
npx shadcn-ui@latest update
```

Este documento proporciona una guía completa para iniciar y ejecutar el proyecto "Scraping Hub" en un entorno de desarrollo local.