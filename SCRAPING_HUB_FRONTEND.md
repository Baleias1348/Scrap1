# Implementación del Frontend para "Scraping Hub"

## Descripción General

El frontend de "Scraping Hub" se implementará utilizando Next.js 14 con App Router, TypeScript y Tailwind CSS. Esta arquitectura proporciona una base sólida para una aplicación web moderna, rápida y escalable.

## Arquitectura del Frontend

### Next.js 14 con App Router
- **Routing**: Sistema de rutas basado en estructura de directorios
- **Server Components**: Componentes que se renderizan en el servidor por defecto
- **Client Components**: Componentes que se ejecutan en el cliente cuando es necesario
- **Data Fetching**: Métodos optimizados para obtener datos

### TypeScript
- **Tipado estático**: Prevención de errores en tiempo de desarrollo
- **IntelliSense**: Mejor experiencia de desarrollo
- **Mantenibilidad**: Código más claro y documentado

### Tailwind CSS
- **Utility-first**: Estilos mediante clases de utilidad
- **Personalización**: Configuración personalizable
- **Responsive**: Diseño adaptable por defecto

## Estructura de Directorios

```
app/
├── layout.tsx              # Layout raíz con navbar y sidebar
├── page.tsx                # Página Dashboard
├── dashboard/
│   └── page.tsx            # Página Dashboard (alternativa)
├── scraper/
│   └── page.tsx            # Página Scraper
└── resultados/
    └── page.tsx            # Página Resultados Guardados

components/
├── ui/                     # Componentes UI de shadcn/ui
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

lib/
├── supabase.ts             # Cliente de Supabase
├── websocket.ts            # Cliente WebSocket
└── scraper.ts              # Lógica de scraping del frontend

types/
├── index.ts                # Tipos compartidos
└── scraper.ts              # Tipos relacionados con scraping

hooks/
├── use-websocket.ts        # Hook personalizado para WebSocket
└── use-scraper.ts          # Hook personalizado para scraping

utils/
├── format.ts               # Funciones de formateo
└── validation.ts           # Funciones de validación

public/
styles/
```

## Componentes Principales

### 1. Layout Raíz (app/layout.tsx)
```typescript
import './globals.css';
import { Sidebar } from '@/components/layout/sidebar';
import { Navbar } from '@/components/layout/navbar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <Navbar />
            <main className="flex-1 overflow-y-auto p-4">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
```

### 2. Barra de Navegación Lateral (components/layout/sidebar.tsx)
```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  PlayIcon, 
  DatabaseIcon 
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Scraper', href: '/scraper', icon: PlayIcon },
  { name: 'Resultados', href: '/resultados', icon: DatabaseIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow border-r border-gray-200 pt-5 bg-white overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-xl font-bold text-gray-800">Scraping Hub</h1>
        </div>
        <div className="mt-5 flex-grow flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                >
                  <item.icon
                    className={`${
                      isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                    } mr-3 flex-shrink-0 h-6 w-6`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
```

### 3. Página Dashboard (app/page.tsx)
```typescript
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface DashboardStats {
  totalJobs: number;
  lastJobDate: string | null;
  recentJobs: any[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    lastJobDate: null,
    recentJobs: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      // Obtener total de trabajos
      const { count: totalJobs, error: countError } = await supabase
        .from('resultados_scraping')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      // Obtener último trabajo
      const { data: lastJob, error: lastJobError } = await supabase
        .from('resultados_scraping')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (lastJobError && lastJobError.code !== 'PGRST116') throw lastJobError;

      // Obtener trabajos recientes
      const { data: recentJobs, error: recentJobsError } = await supabase
        .from('resultados_scraping')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentJobsError) throw recentJobsError;

      setStats({
        totalJobs: totalJobs || 0,
        lastJobDate: lastJob?.created_at || null,
        recentJobs: recentJobs || []
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Resumen de actividades de scraping
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <DatabaseIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total de Trabajos
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.totalJobs}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <ClockIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Último Trabajo
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.lastJobDate 
                        ? new Date(stats.lastJobDate).toLocaleDateString() 
                        : 'Ninguno'}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <PlayIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Acceso Rápido
                  </dt>
                  <dd className="flex items-baseline">
                    <Link href="/scraper" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                      Iniciar nuevo scraping
                    </Link>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Trabajos Recientes</h2>
        <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {stats.recentJobs.length > 0 ? (
              stats.recentJobs.map((job) => (
                <li key={job.id}>
                  <Link href={`/resultados/${job.id}`} className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          Trabajo #{job.id.substring(0, 8)}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Completado
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {job.estrategia_usada}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          <p>
                            {new Date(job.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))
            ) : (
              <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                No hay trabajos recientes
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Iconos (en una implementación real, se importarían desde @heroicons/react)
function DatabaseIcon(props: any) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
  );
}

function ClockIcon(props: any) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function PlayIcon(props: any) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CalendarIcon(props: any) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
```

### 4. Página Scraper (app/scraper/page.tsx)
```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import { UrlInput } from '@/components/scraper/url-input';
import { StrategySelector } from '@/components/scraper/strategy-selector';
import { ProgressBar } from '@/components/scraper/progress-bar';
import { LogWindow } from '@/components/scraper/log-window';
import { SaveButton } from '@/components/scraper/save-button';
import { useWebSocket } from '@/hooks/use-websocket';
import { validateUrls } from '@/utils/validation';

interface ScrapingResult {
  url: string;
  content: string;
}

export default function ScraperPage() {
  const [urls, setUrls] = useState<string>('');
  const [strategy, setStrategy] = useState<string>('universal');
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [logs, setLogs] = useState<Array<{level: string, message: string, timestamp: Date}>>([]);
  const [results, setResults] = useState<ScrapingResult[]>([]);
  const [canSave, setCanSave] = useState<boolean>(false);
  
  const ws = useWebSocket();

  // Conectar WebSocket al montar el componente
  useEffect(() => {
    if (ws) {
      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleMessage(message);
      };
    }
    
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [ws]);

  function handleMessage(message: any) {
    switch (message.type) {
      case 'progress':
        setProgress((message.data.current / message.data.total) * 100);
        addLog('INFO', `Procesando ${message.data.current}/${message.data.total}: ${message.data.url}`);
        break;
      case 'log':
        addLog(message.data.level, message.data.message);
        break;
      case 'result':
        setResults(message.data);
        setCanSave(true);
        setIsScraping(false);
        addLog('SUCCESS', 'Scraping completado exitosamente');
        break;
      case 'error':
        addLog('ERROR', message.data.message);
        setIsScraping(false);
        break;
    }
  }

  function addLog(level: string, message: string) {
    setLogs(prev => [...prev, {
      level,
      message,
      timestamp: new Date()
    }]);
  }

  async function startScraping() {
    // Validar URLs
    const urlList = urls.split('\n').filter(url => url.trim() !== '');
    const validation = validateUrls(urlList);
    
    if (!validation.valid) {
      addLog('ERROR', validation.error);
      return;
    }
    
    // Limpiar estado anterior
    setProgress(0);
    setLogs([]);
    setResults([]);
    setCanSave(false);
    setIsScraping(true);
    
    addLog('INFO', 'Iniciando proceso de scraping...');
    
    // Enviar configuración al backend
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'start_scraping',
        data: {
          urls: urlList,
          strategy: strategy
        }
      }));
    } else {
      addLog('ERROR', 'No se pudo establecer conexión con el servidor');
      setIsScraping(false);
    }
  }

  async function saveResults() {
    if (!canSave || results.length === 0) return;
    
    addLog('INFO', 'Guardando resultados en la base de datos...');
    
    try {
      // Enviar solicitud para guardar resultados
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'save_results',
          data: {
            results: results,
            strategy: strategy
          }
        }));
      }
      
      addLog('SUCCESS', 'Resultados guardados exitosamente');
      setCanSave(false);
    } catch (error) {
      addLog('ERROR', `Error al guardar resultados: ${error.message}`);
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Scraper</h1>
        <p className="mt-1 text-sm text-gray-500">
          Inicia y gestiona trabajos de web scraping
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Panel de configuración */}
            <div className="space-y-4">
              <UrlInput 
                value={urls} 
                onChange={setUrls} 
                disabled={isScraping}
              />
              
              <StrategySelector 
                value={strategy} 
                onChange={setStrategy} 
                disabled={isScraping}
              />
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={startScraping}
                  disabled={isScraping || urls.trim() === ''}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                    isScraping || urls.trim() === ''
                      ? 'bg-indigo-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  }`}
                >
                  {isScraping ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Procesando...
                    </>
                  ) : (
                    'Iniciar Scraping'
                  )}
                </button>
              </div>
            </div>

            {/* Barra de progreso */}
            <ProgressBar progress={progress} />

            {/* Ventana de logs */}
            <LogWindow logs={logs} />

            {/* Botón de guardado */}
            <SaveButton 
              onClick={saveResults} 
              disabled={!canSave || isScraping}
              visible={results.length > 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 5. Componente de Entrada de URLs (components/scraper/url-input.tsx)
```typescript
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface UrlInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function UrlInput({ value, onChange, disabled }: UrlInputProps) {
  return (
    <div>
      <Label htmlFor="urls" className="block text-sm font-medium text-gray-700">
        URLs para procesar
      </Label>
      <div className="mt-1">
        <Textarea
          id="urls"
          rows={6}
          placeholder="Ingrese una URL por línea&#10;https://ejemplo.com/pagina1&#10;https://ejemplo.com/pagina2"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        <p className="mt-2 text-sm text-gray-500">
          Ingrese una URL por línea. Se procesarán en orden.
        </p>
      </div>
    </div>
  );
}
```

### 6. Hook de WebSocket (hooks/use-websocket.ts)
```typescript
import { useState, useEffect, useRef } from 'react';

export function useWebSocket() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Conectar al WebSocket del backend
    const websocket = new WebSocket(
      process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001'
    );
    
    websocket.onopen = () => {
      console.log('Conexión WebSocket establecida');
    };
    
    websocket.onclose = () => {
      console.log('Conexión WebSocket cerrada');
    };
    
    websocket.onerror = (error) => {
      console.error('Error en WebSocket:', error);
    };
    
    setWs(websocket);
    wsRef.current = websocket;
    
    return () => {
      websocket.close();
    };
  }, []);

  return wsRef.current;
}
```

## Estilos con Tailwind CSS

### Configuración (tailwind.config.js)
```javascript
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './utils/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

## Tipos TypeScript

### Tipos Compartidos (types/index.ts)
```typescript
export interface ScrapingResult {
  url: string;
  content: string;
}

export interface ScrapingJob {
  id: string;
  created_at: string;
  estrategia_usada: string;
  urls_procesadas: number;
  resultado_json: ScrapingResult[];
}

export interface WebSocketMessage {
  type: 'progress' | 'log' | 'result' | 'error' | 'start_scraping' | 'save_results';
  data: any;
}

export interface LogEntry {
  level: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  message: string;
  timestamp: Date;
}
```

## Consideraciones de Rendimiento

### 1. Optimización de Componentes
- Uso de `React.memo` para componentes pesados
- Implementación de virtualización para listas largas
- Carga diferida de componentes no críticos

### 2. Manejo de Estado
- Uso de Context API para estado global
- Optimización de actualizaciones de estado
- Uso de `useMemo` y `useCallback` cuando sea apropiado

### 3. Carga de Datos
- Implementación de paginación en tablas
- Uso de caching para datos repetidos
- Carga progresiva de contenido

## Accesibilidad

### 1. Navegación por Teclado
- Soporte completo para navegación por teclado
- Indicadores visuales de foco
- Atajos de teclado para acciones comunes

### 2. Lectores de Pantalla
- Etiquetas apropiadas para elementos interactivos
- ARIA attributes para componentes complejos
- Estructura semántica correcta

### 3. Contraste de Colores
- Cumplimiento con estándares WCAG 2.1
- Modo oscuro opcional
- Personalización de temas

## Pruebas del Frontend

### 1. Pruebas Unitarias
- Componentes individuales con Jest y React Testing Library
- Hooks personalizados
- Funciones de utilidad

### 2. Pruebas de Integración
- Flujos completos de usuario
- Interacción con WebSocket
- Integración con Supabase

### 3. Pruebas de UI
- Pruebas visuales con Storybook
- Pruebas de regresión visual
- Pruebas de responsividad

## Despliegue

### 1. Variables de Entorno
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_KEY=your_supabase_key
NEXT_PUBLIC_WEBSOCKET_URL=your_websocket_url
```

### 2. Optimización para Producción
- Minificación de CSS y JavaScript
- Compresión de imágenes
- Caching de recursos estáticos
- Optimización de fuentes

Este documento proporciona una guía detallada para la implementación del frontend de "Scraping Hub" utilizando Next.js, TypeScript y Tailwind CSS.