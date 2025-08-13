# Plan de Desarrollo para la Aplicación "Scraping Hub"

## Descripción General

"Scraping Hub" es una aplicación web interna que permite a un equipo gestionar, ejecutar y almacenar los resultados de tareas de web scraping de forma centralizada. La aplicación utiliza Next.js, TypeScript, Tailwind CSS, Supabase y Netlify Functions.

## Arquitectura Técnica

### Frontend (Next.js)
- **Framework**: Next.js 14 con App Router
- **Lenguaje**: TypeScript
- **Estilizado**: Tailwind CSS
- **Componentes UI**: shadcn/ui
- **Comunicación**: WebSockets para tiempo real

### Backend (Netlify Functions & Node.js)
- **Funciones**: Netlify Functions con Node.js
- **Scraping**: Puppeteer (equivalente a Selenium)
- **Comunicación**: WebSockets para mensajes de progreso

### Base de Datos (Supabase)
- **Tipo**: PostgreSQL
- **Tabla**: resultados_scraping

## Estructura del Proyecto

```
scraping-hub/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── scraper/
│   │   └── page.tsx
│   └── resultados/
│       └── page.tsx
├── components/
│   ├── ui/
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   └── navbar.tsx
│   ├── scraper/
│   │   ├── url-input.tsx
│   │   ├── strategy-selector.tsx
│   │   ├── progress-bar.tsx
│   │   ├── log-window.tsx
│   │   └── save-button.tsx
│   └── results/
│       ├── results-table.tsx
│       └── result-modal.tsx
├── lib/
│   ├── supabase.ts
│   ├── websocket.ts
│   └── scraper.ts
├── functions/
│   └── scrape.ts
├── public/
├── styles/
├── types/
└── utils/
```

## Funcionalidades por Página

### 1. Página Dashboard (/)
- Estadísticas básicas:
  - Total de Trabajos Guardados
  - Último Trabajo Realizado
  - Trabajos en Progreso
- Accesos directos a otras secciones

### 2. Página Scraper (/scraper)
- Campo de Entrada de URLs (textarea)
- Selector de Estrategia (select)
- Botón "Iniciar Scraping"
- Barra de Progreso (actualización en tiempo real)
- Ventana de Log en Tiempo Real
- Botón "Guardar en Supabase" (activado al finalizar)

### 3. Página Resultados Guardados (/resultados)
- Tabla con trabajos de scraping guardados
- Columnas:
  - ID del Trabajo
  - Fecha de Creación
  - Estrategia Usada
  - Nº de URLs Procesadas
- Botón "Ver Detalle" por fila

## Estructura de la Base de Datos (Supabase)

### Tabla: resultados_scraping
```sql
CREATE TABLE resultados_scraping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  estrategia_usada TEXT,
  urls_procesadas INTEGER,
  resultado_json JSONB
);
```

## Componentes Clave

### 1. Componente de WebSocket
- Establecer conexión con backend
- Enviar configuración de trabajo
- Recibir mensajes de progreso
- Manejar reconexiones

### 2. Componente de Scraping
- Traducción de lógica Python a Node.js
- Uso de Puppeteer para control de navegador
- Implementación de estrategias de scraping
- Manejo de banners de cookies
- Acceso a iframes

### 3. Componentes UI con shadcn/ui
- Botones personalizados
- Tablas con paginación
- Inputs y textareas
- Selectores desplegables
- Barras de progreso
- Modales para detalles

## Flujo de Trabajo

### 1. Inicio del Scraping
1. Usuario ingresa URLs y selecciona estrategia
2. Usuario hace clic en "Iniciar Scraping"
3. Frontend establece conexión WebSocket
4. Frontend envía configuración al backend
5. Backend inicia proceso de scraping con Puppeteer

### 2. Comunicación en Tiempo Real
1. Backend envía mensajes de progreso por WebSocket
2. Frontend actualiza barra de progreso
3. Frontend muestra logs en ventana de tiempo real
4. Backend notifica finalización del proceso

### 3. Guardado de Resultados
1. Botón "Guardar en Supabase" se activa al finalizar
2. Usuario hace clic en el botón
3. Frontend envía señal al backend
4. Backend inserta resultado en Supabase

## Consideraciones Técnicas

### 1. Manejo de Errores
- Reintentos de conexión WebSocket
- Manejo de errores de scraping
- Validación de datos de entrada
- Mensajes de error claros para el usuario

### 2. Seguridad
- Variables de entorno para credenciales
- Validación de entrada en el backend
- Protección contra scraping malicioso
- Autenticación de usuarios (opcional)

### 3. Rendimiento
- Optimización de consultas a Supabase
- Manejo eficiente de memoria en Puppeteer
- Paginación en tablas de resultados
- Caching de datos cuando sea apropiado

### 4. Escalabilidad
- Funciones serverless para manejar carga
- Base de datos PostgreSQL escalable
- Arquitectura modular para añadir estrategias
- Soporte para múltiples usuarios

## Pruebas

### 1. Pruebas Unitarias
- Componentes de UI
- Funciones de utilidad
- Lógica de WebSocket
- Validaciones de datos

### 2. Pruebas de Integración
- Comunicación Frontend-Backend
- Guardado en Supabase
- Proceso completo de scraping
- Manejo de errores

### 3. Pruebas de Usuario
- Usabilidad de la interfaz
- Flujo de trabajo completo
- Respuesta en tiempo real
- Accesibilidad

## Despliegue

### 1. Desarrollo Local
- `npm install` para dependencias
- `npm run dev` para servidor de desarrollo
- Variables de entorno en `.env.local`

### 2. Despliegue en Netlify
- Configuración automática con `netlify.toml`
- Variables de entorno en Netlify
- Funciones serverless desplegadas automáticamente

### 3. Configuración de Supabase
- Creación de proyecto en Supabase
- Configuración de tabla de resultados
- Credenciales en variables de entorno

## Dependencias Principales

### Frontend
- next: Framework React
- react: Biblioteca UI
- react-dom: Renderizado DOM
- typescript: Tipado estático
- tailwindcss: Framework CSS
- shadcn/ui: Componentes UI
- socket.io-client: Cliente WebSocket

### Backend
- @netlify/functions: Runtime de funciones
- puppeteer: Control de navegador
- socket.io: Servidor WebSocket
- @supabase/supabase-js: Cliente Supabase

### Desarrollo
- @types/node: Tipos para Node.js
- @types/react: Tipos para React
- @types/react-dom: Tipos para React DOM
- eslint: Linter
- prettier: Formateador de código

## Cronograma de Desarrollo

### Fase 1: Configuración Inicial (2 días)
- Estructura del proyecto
- Configuración de Next.js, TypeScript, Tailwind
- Configuración de Supabase
- Componentes básicos de layout

### Fase 2: Páginas Principales (3 días)
- Página Dashboard
- Página Scraper (UI básica)
- Página Resultados Guardados

### Fase 3: Funcionalidad de Scraping (4 días)
- Implementación de WebSockets
- Función Netlify con Puppeteer
- Lógica de scraping
- Comunicación en tiempo real

### Fase 4: Integración y Pruebas (3 días)
- Integración con Supabase
- Pruebas unitarias
- Pruebas de integración
- Optimización

### Fase 5: Refinamiento y Documentación (2 días)
- Mejoras de UI/UX
- Documentación
- Pruebas finales
- Preparación para despliegue

## Recursos Adicionales

### Documentación
- Documentación de Next.js App Router
- Documentación de Supabase
- Documentación de Puppeteer
- Documentación de shadcn/ui

### Ejemplos
- Ejemplos de WebSockets en Next.js
- Ejemplos de funciones Netlify
- Ejemplos de scraping con Puppeteer
- Ejemplos de componentes shadcn/ui

Este plan proporciona una guía completa para el desarrollo de la aplicación "Scraping Hub" con todas las funcionalidades requeridas.