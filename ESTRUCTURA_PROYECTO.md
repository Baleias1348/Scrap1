# Estructura Completa del Proyecto "Scraping Hub"

## Descripción General

Este documento detalla la estructura completa del proyecto "Scraping Hub", incluyendo todos los archivos, directorios y su organización lógica. La estructura sigue las mejores prácticas de desarrollo moderno con Next.js App Router.

## Estructura del Directorio Raíz

```
scraping-hub/
├── app/                    # Páginas y layout de Next.js App Router
├── components/             # Componentes React reutilizables
├── lib/                    # Librerías y utilidades compartidas
├── functions/              # Funciones serverless de Netlify
├── public/                 # Archivos estáticos
├── styles/                 # Estilos globales y personalizados
├── types/                  # Tipos TypeScript
├── hooks/                  # Hooks personalizados de React
├── utils/                  # Funciones de utilidad
├── tests/                  # Pruebas unitarias, integración y E2E
├── scripts/                # Scripts de desarrollo y utilidad
├── docs/                   # Documentación adicional
├── .github/                # Configuración de GitHub (workflows, etc.)
├── .vscode/                # Configuración de VS Code
├── node_modules/           # Dependencias de Node.js (gitignoreado)
├── .next/                  # Salida de compilación de Next.js (gitignoreado)
├── .git/                   # Directorio Git (gitignoreado)
├── .env.local              # Variables de entorno locales (gitignoreado)
├── .env.example            # Ejemplo de variables de entorno
├── .gitignore              # Archivos y directorios ignorados por Git
├── .eslintrc.json          # Configuración de ESLint
├── .prettierrc             # Configuración de Prettier
├── next.config.js          # Configuración de Next.js
├── tailwind.config.js      # Configuración de Tailwind CSS
├── postcss.config.js       # Configuración de PostCSS
├── tsconfig.json           # Configuración de TypeScript
├── package.json            # Dependencias y scripts del proyecto
├── package-lock.json       # Bloqueo de versiones de dependencias
├── netlify.toml            # Configuración de Netlify
├── README.md               # Documento principal del proyecto
├── LICENSE                 # Licencia del proyecto
└── CHANGELOG.md            # Registro de cambios (opcional)
```

## Directorio `app/` - Next.js App Router

```
app/
├── layout.tsx              # Layout raíz con navbar y sidebar
├── page.tsx                # Página Dashboard principal
├── globals.css             # Estilos globales
├── dashboard/
│   └── page.tsx            # Página Dashboard
├── scraper/
│   └── page.tsx            # Página Scraper
└── resultados/
    └── page.tsx            # Página Resultados Guardados
```

### Archivos Principales

#### `app/layout.tsx`
```typescript
// Layout raíz que envuelve toda la aplicación
// Incluye navbar, sidebar y estructura base
```

#### `app/page.tsx`
```typescript
// Página Dashboard principal
// Redirige a /dashboard o muestra contenido principal
```

#### `app/dashboard/page.tsx`
```typescript
// Página Dashboard
// Muestra estadísticas y resumen de actividades
```

#### `app/scraper/page.tsx`
```typescript
// Página Scraper
// Interfaz principal para configurar y ejecutar scraping
```

#### `app/resultados/page.tsx`
```typescript
// Página Resultados Guardados
// Muestra tabla con trabajos de scraping completados
```

## Directorio `components/` - Componentes React

```
components/
├── ui/                     # Componentes shadcn/ui
│   ├── button.tsx
│   ├── input.tsx
│   ├── textarea.tsx
│   ├── select.tsx
│   ├── card.tsx
│   ├── table.tsx
│   ├── badge.tsx
│   ├── dialog.tsx
│   ├── progress.tsx
│   ├── label.tsx
│   ├── scroll-area.tsx
│   └── ...
├── layout/
│   ├── navbar.tsx          # Barra de navegación superior
│   └── sidebar.tsx         # Barra de navegación lateral
├── scraper/
│   ├── url-input.tsx       # Componente de entrada de URLs
│   ├── strategy-selector.tsx # Selector de estrategia
│   ├── progress-bar.tsx    # Barra de progreso
│   ├── log-window.tsx      # Ventana de logs
│   └── save-button.tsx     # Botón de guardado
└── results/
    ├── results-table.tsx   # Tabla de resultados
    └── result-modal.tsx    # Modal de detalle de resultado
```

### Componentes UI Personalizados

#### `components/ui/progress-button.tsx`
```typescript
// Botón con indicador de progreso y estado de carga
```

#### `components/ui/log-entry.tsx`
```typescript
// Componente para mostrar entradas de log con colores
```

## Directorio `lib/` - Librerías y Utilidades

```
lib/
├── supabase.ts             # Cliente de Supabase
├── websocket.ts            # Cliente WebSocket
├── scraper.ts              # Lógica de scraping del frontend
├── error-handler.ts        # Manejo centralizado de errores
├── monitoring.ts           # Monitoreo y métricas
└── metrics.ts              # Cálculo de métricas de rendimiento
```

### Archivos Principales

#### `lib/supabase.ts`
```typescript
// Configuración y cliente de Supabase
// Tipos para las tablas de la base de datos
```

#### `lib/websocket.ts`
```typescript
// Cliente WebSocket para comunicación en tiempo real
// Manejo de reconexiones y eventos
```

#### `lib/scraper.ts`
```typescript
// Lógica de scraping del frontend
// Validación de URLs y configuración
```

## Directorio `functions/` - Funciones Serverless

```
functions/
├── scrape.ts               # Función principal de scraping
├── websocket.ts            # Manejo de conexiones WebSocket
├── supabase.ts             # Integración con Supabase
└── utils/
    ├── puppeteer-config.ts # Configuración de Puppeteer
    └── scraping-strategies.ts # Estrategias de scraping
```

### Archivos Principales

#### `functions/scrape.ts`
```typescript
// Función serverless principal para scraping
// Usa Puppeteer para controlar navegador
// Implementa estrategias de scraping
```

#### `functions/websocket.ts`
```typescript
// Manejo de conexiones WebSocket en backend
// Comunicación con frontend en tiempo real
```

## Directorio `public/` - Archivos Estáticos

```
public/
├── favicon.ico             # Favicon del sitio
├── logo.png                # Logo principal
├── assets/
│   ├── icons/              # Iconos de la aplicación
│   ├── images/             # Imágenes estáticas
│   └── documents/          # Documentos descargables
└── robots.txt              # Directivas para robots de búsqueda
```

## Directorio `styles/` - Estilos Personalizados

```
styles/
├── globals.css             # Estilos globales (importado en layout)
├── components.css          # Estilos específicos de componentes
└── utilities.css           # Clases de utilidad personalizadas
```

## Directorio `types/` - Tipos TypeScript

```
types/
├── index.ts                # Tipos compartidos principales
├── scraper.ts              # Tipos relacionados con scraping
├── supabase.ts             # Tipos de tablas de Supabase
└── websocket.ts            # Tipos para mensajes WebSocket
```

### Archivos Principales

#### `types/index.ts`
```typescript
// Tipos compartidos en toda la aplicación
export interface ScrapingResult { ... }
export interface ScrapingJob { ... }
```

#### `types/scraper.ts`
```typescript
// Tipos específicos para scraping
export type ScrapingStrategy = 'universal' | 'leychile';
export interface ScrapingConfig { ... }
```

## Directorio `hooks/` - Hooks Personalizados

```
hooks/
├── use-websocket.ts        # Hook para manejo de WebSocket
├── use-scraper.ts          # Hook para lógica de scraping
├── use-supabase.ts         # Hook para interacción con Supabase
└── use-toast.ts            # Hook para notificaciones toast
```

### Archivos Principales

#### `hooks/use-websocket.ts`
```typescript
// Hook personalizado para manejo de WebSocket
// Conexión, desconexión y manejo de mensajes
```

#### `hooks/use-scraper.ts`
```typescript
// Hook para lógica de scraping
// Estado, efectos y funciones auxiliares
```

## Directorio `utils/` - Funciones de Utilidad

```
utils/
├── format.ts               # Funciones de formateo
├── validation.ts           # Funciones de validación
├── date.ts                 # Funciones de manejo de fechas
├── string.ts               # Funciones de manejo de strings
└── array.ts                # Funciones de manejo de arrays
```

### Archivos Principales

#### `utils/format.ts`
```typescript
// Funciones para formatear datos
export function formatBytes(bytes: number): string { ... }
export function formatDuration(ms: number): string { ... }
```

#### `utils/validation.ts`
```typescript
// Funciones para validar datos de entrada
export function validateUrls(urls: string[]): ValidationResult { ... }
export function validateStrategy(strategy: string): boolean { ... }
```

## Directorio `tests/` - Pruebas

```
tests/
├── unit/                   # Pruebas unitarias
│   ├── components/         # Pruebas de componentes
│   ├── lib/                # Pruebas de librerías
│   └── utils/              # Pruebas de utilidades
├── integration/            # Pruebas de integración
│   ├── api/                # Pruebas de API
│   └── database/           # Pruebas de base de datos
├── e2e/                    # Pruebas end-to-end
│   ├── pages/              # Pruebas de páginas
│   └── flows/              # Pruebas de flujos completos
└── fixtures/               # Datos de prueba
```

## Directorio `scripts/` - Scripts de Desarrollo

```
scripts/
├── ws-server.js            # Servidor WebSocket para desarrollo
├── generate-types.ts       # Generación de tipos desde Supabase
├── seed-database.ts        # Inicialización de datos de prueba
└── cleanup.ts              # Limpieza de datos temporales
```

## Directorio `docs/` - Documentación

```
docs/
├── architecture/           # Documentación de arquitectura
├── api/                    # Documentación de API
├── deployment/             # Guías de despliegue
└── troubleshooting/        # Guías de solución de problemas
```

## Archivos de Configuración Raíz

### `next.config.js`
```javascript
// Configuración de Next.js
module.exports = {
  // Configuración de imágenes, fuentes, etc.
}
```

### `tailwind.config.js`
```javascript
// Configuración de Tailwind CSS
module.exports = {
  content: [ ... ],
  theme: { ... },
  plugins: [ ... ]
}
```

### `tsconfig.json`
```json
// Configuración de TypeScript
{
  "compilerOptions": { ... }
}
```

### `package.json`
```json
// Dependencias y scripts del proyecto
{
  "name": "scraping-hub",
  "scripts": { ... },
  "dependencies": { ... },
  "devDependencies": { ... }
}
```

## Archivos de Configuración de Herramientas

### `.eslintrc.json`
```json
// Configuración de ESLint
{
  "extends": [ ... ],
  "rules": { ... }
}
```

### `.prettierrc`
```json
// Configuración de Prettier
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true
}
```

### `.gitignore`
```gitignore
# Archivos y directorios ignorados por Git
node_modules/
.next/
.env.local
.env*.local
```

## Consideraciones de Organización

### 1. Principio de Colocación Cercana
- Los archivos relacionados se mantienen juntos
- Componentes y sus estilos/test se agrupan
- Lógica de negocio y presentación se separan

### 2. Escalabilidad
- Estructura que crece con el proyecto
- Convenciones claras para nuevos archivos
- Separación de concerns bien definida

### 3. Mantenibilidad
- Nombres de archivos descriptivos
- Estructura intuitiva para nuevos desarrolladores
- Documentación en línea en archivos complejos

### 4. Rendimiento
- Código dividido automáticamente por rutas
- Carga diferida de componentes no críticos
- Optimización de bundles

Esta estructura proporciona una base sólida para el desarrollo, mantenimiento y escalabilidad del proyecto "Scraping Hub".