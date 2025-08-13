# Integración Completa del Sistema "Scraping Hub"

## Descripción General

Este documento detalla la integración completa del sistema "Scraping Hub", incluyendo la configuración de Supabase, la implementación de shadcn/ui, y la conexión entre todos los componentes del sistema.

## Configuración de Supabase

### 1. Creación del Proyecto
1. Acceder a [Supabase Dashboard](https://app.supabase.io/)
2. Crear un nuevo proyecto llamado "scraping-hub"
3. Seleccionar la región más cercana
4. Establecer una contraseña segura para la base de datos

### 2. Estructura de la Base de Datos
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

-- Crear políticas de seguridad (si se requiere autenticación)
ALTER TABLE resultados_scraping ENABLE ROW LEVEL SECURITY;

-- Políticas de ejemplo (ajustar según necesidades de autenticación)
CREATE POLICY "Usuarios pueden leer resultados" ON resultados_scraping
  FOR SELECT USING (true);

CREATE POLICY "Usuarios pueden insertar resultados" ON resultados_scraping
  FOR INSERT WITH CHECK (true);
```

### 3. Configuración del Cliente Supabase
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Tipos para TypeScript
export interface ResultadoScraping {
  id: string;
  created_at: string;
  estrategia_usada: string;
  urls_procesadas: number;
  resultado_json: any;
}
```

### 4. Variables de Entorno
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
```

## Implementación de shadcn/ui

### 1. Instalación y Configuración
```bash
# Instalar dependencias
npm install tailwindcss-animate class-variance-authority clsx tailwind-merge lucide-react

# Inicializar shadcn/ui
npx shadcn-ui@latest init

# Componentes necesarios
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
```

### 2. Componentes Personalizados con shadcn/ui

#### Botón de Progreso (components/ui/progress-button.tsx)
```typescript
import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProgressButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
}

const ProgressButton = React.forwardRef<HTMLButtonElement, ProgressButtonProps>(
  ({ className, loading, loadingText, children, ...props }, ref) => {
    return (
      <Button
        className={cn("relative", className)}
        ref={ref}
        disabled={loading}
        {...props}
      >
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <svg
              className="animate-spin h-5 w-5 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </span>
        )}
        <span className={loading ? "invisible" : ""}>{children}</span>
        {loading && loadingText && (
          <span className="invisible">{loadingText}</span>
        )}
      </Button>
    );
  }
);
ProgressButton.displayName = "ProgressButton";

export { ProgressButton };
```

#### Ventana de Logs con Colores (components/scraper/log-window.tsx)
```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface LogEntry {
  level: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  message: string;
  timestamp: Date;
}

interface LogWindowProps {
  logs: LogEntry[];
}

export function LogWindow({ logs }: LogWindowProps) {
  const getLogColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "INFO":
        return "text-gray-700";
      case "SUCCESS":
        return "text-green-600";
      case "WARNING":
        return "text-yellow-600";
      case "ERROR":
        return "text-red-600";
      default:
        return "text-gray-700";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registro de Actividad</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64 w-full rounded-md border p-4">
          <div className="space-y-2">
            {logs.map((log, index) => (
              <div
                key={index}
                className={cn("text-sm font-mono", getLogColor(log.level))}
              >
                <span className="text-gray-500">
                  [{log.timestamp.toLocaleTimeString()}] 
                </span>{" "}
                [{log.level}] {log.message}
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-gray-500 text-center py-4">
                No hay registros aún
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
```

#### Tabla de Resultados (components/results/results-table.tsx)
```typescript
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ResultadoScraping } from "@/lib/supabase";

interface ResultsTableProps {
  results: ResultadoScraping[];
  onViewDetail: (result: ResultadoScraping) => void;
}

export function ResultsTable({ results, onViewDetail }: ResultsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID del Trabajo</TableHead>
            <TableHead>Fecha de Creación</TableHead>
            <TableHead>Estrategia Usada</TableHead>
            <TableHead>Nº de URLs Procesadas</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result) => (
            <TableRow key={result.id}>
              <TableCell className="font-medium">
                {result.id.substring(0, 8)}
              </TableCell>
              <TableCell>
                {format(new Date(result.created_at), "dd MMM yyyy HH:mm", {
                  locale: es,
                })}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{result.estrategia_usada}</Badge>
              </TableCell>
              <TableCell>{result.urls_procesadas}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetail(result)}
                >
                  Ver Detalle
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {results.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-gray-500">
                No hay resultados guardados
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
```

## Integración WebSockets

### 1. Servidor WebSocket (functions/websocket.ts)
```typescript
import { Handler } from '@netlify/functions';
import { Server } from 'socket.io';

// Esta es una implementación simplificada
// En producción, se necesitaría un servidor WebSocket dedicado
// o usar una solución como Pusher o Ably

export const handler: Handler = async (event, context) => {
  // Implementación de servidor WebSocket
  // Esta parte requiere una solución más compleja en Netlify
  // ya que las funciones serverless no mantienen conexiones persistentes
  
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'WebSocket endpoint' })
  };
};
```

### 2. Cliente WebSocket (lib/websocket.ts)
```typescript
import { io, Socket } from 'socket.io-client';

class WebSocketClient {
  private socket: Socket | null = null;
  private url: string;

  constructor() {
    this.url = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3001';
  }

  connect() {
    if (!this.socket) {
      this.socket = io(this.url, {
        transports: ['websocket'],
      });

      this.socket.on('connect', () => {
        console.log('Conectado al servidor WebSocket');
      });

      this.socket.on('disconnect', () => {
        console.log('Desconectado del servidor WebSocket');
      });

      this.socket.on('error', (error) => {
        console.error('Error en WebSocket:', error);
      });
    }

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  sendMessage(type: string, data: any) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('message', { type, data });
    }
  }

  onMessage(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.on('message', callback);
    }
  }
}

export const wsClient = new WebSocketClient();
```

## Integración Completa del Sistema

### 1. Flujo de Trabajo Completo

#### Inicio del Scraping
1. Usuario ingresa URLs en la interfaz
2. Usuario selecciona estrategia
3. Usuario hace clic en "Iniciar Scraping"
4. Frontend establece conexión WebSocket
5. Frontend envía configuración al backend
6. Backend inicia proceso con Puppeteer

#### Comunicación en Tiempo Real
1. Backend envía mensajes de progreso por WebSocket
2. Frontend actualiza barra de progreso
3. Frontend muestra logs en ventana de tiempo real
4. Backend notifica finalización del proceso

#### Guardado de Resultados
1. Botón "Guardar en Supabase" se activa al finalizar
2. Usuario hace clic en el botón
3. Frontend envía señal al backend
4. Backend inserta resultado en Supabase
5. Frontend actualiza vista de resultados

### 2. Manejo de Errores del Sistema

#### Errores de Conexión
```typescript
// lib/error-handler.ts
export class ScrapingHubError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ScrapingHubError';
  }
}

export function handleWebSocketError(error: any) {
  if (error.code === 'ECONNREFUSED') {
    throw new ScrapingHubError(
      'No se puede conectar al servidor de scraping',
      'WEBSOCKET_CONNECTION_FAILED'
    );
  }
  
  throw new ScrapingHubError(
    'Error en la conexión WebSocket',
    'WEBSOCKET_ERROR',
    error
  );
}
```

#### Errores de Scraping
```typescript
// lib/scraper-errors.ts
export enum ScrapingErrorType {
  URL_INVALID = 'URL_INVALID',
  TIMEOUT = 'TIMEOUT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  CONTENT_NOT_FOUND = 'CONTENT_NOT_FOUND',
  BROWSER_ERROR = 'BROWSER_ERROR'
}

export interface ScrapingError {
  type: ScrapingErrorType;
  message: string;
  url?: string;
  details?: any;
}
```

### 3. Seguridad del Sistema

#### Validación de Entrada
```typescript
// utils/validation.ts
export function validateUrls(urls: string[]): { valid: boolean; error?: string } {
  if (urls.length === 0) {
    return { valid: false, error: 'Debe ingresar al menos una URL' };
  }

  if (urls.length > 100) {
    return { valid: false, error: 'No se pueden procesar más de 100 URLs a la vez' };
  }

  for (const url of urls) {
    try {
      new URL(url);
    } catch {
      return { valid: false, error: `URL inválida: ${url}` };
    }
  }

  return { valid: true };
}
```

#### Protección contra Abusos
```typescript
// middleware/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, '60 s'),
  analytics: true,
});

export async function checkRateLimit(identifier: string) {
  const { success } = await ratelimit.limit(identifier);
  return success;
}
```

## Pruebas de Integración

### 1. Pruebas End-to-End
```typescript
// tests/e2e/scraping-flow.test.ts
import { test, expect } from '@playwright/test';

test('flujo completo de scraping', async ({ page }) => {
  // Navegar a la página de scraper
  await page.goto('/scraper');
  
  // Ingresar URLs
  await page.getByLabel('URLs para procesar').fill(
    'https://www.bcn.cl/leychile/navegar?idNorma=28650\n' +
    'https://www.bcn.cl/leychile/navegar?idNorma=167362'
  );
  
  // Seleccionar estrategia
  await page.getByLabel('Estrategia de Scraping').selectOption('leychile');
  
  // Iniciar scraping
  await page.getByRole('button', { name: 'Iniciar Scraping' }).click();
  
  // Verificar progreso
  await expect(page.getByText('Procesando 1/2')).toBeVisible();
  
  // Verificar logs
  await expect(page.getByText('[INFO] Procesando URL:')).toBeVisible();
  
  // Verificar finalización
  await expect(page.getByText('Scraping completado exitosamente')).toBeVisible();
  
  // Guardar resultados
  await page.getByRole('button', { name: 'Guardar en Supabase' }).click();
  
  // Verificar guardado
  await expect(page.getByText('Resultados guardados exitosamente')).toBeVisible();
});
```

### 2. Pruebas de Integración con Supabase
```typescript
// tests/integration/supabase.test.ts
import { supabase } from '@/lib/supabase';
import { describe, it, expect, beforeEach } from 'vitest';

describe('Integración con Supabase', () => {
  beforeEach(async () => {
    // Limpiar datos de prueba
    await supabase.from('resultados_scraping').delete().neq('id', '');
  });

  it('debe guardar resultados de scraping', async () => {
    const testData = {
      estrategia_usada: 'leychile',
      urls_procesadas: 2,
      resultado_json: [
        {
          url: 'https://www.bcn.cl/leychile/navegar?idNorma=28650',
          content: 'LEY NÚM. 16.744 ESTABLECE NORMAS SOBRE ACCIDENTES DEL TRABAJO...'
        }
      ]
    };

    const { data, error } = await supabase
      .from('resultados_scraping')
      .insert([testData])
      .select();

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data![0].estrategia_usada).toBe('leychile');
    expect(data![0].urls_procesadas).toBe(2);
  });

  it('debe recuperar resultados guardados', async () => {
    // Insertar datos de prueba
    await supabase.from('resultados_scraping').insert([
      {
        estrategia_usada: 'universal',
        urls_procesadas: 1,
        resultado_json: []
      }
    ]);

    // Recuperar datos
    const { data, error } = await supabase
      .from('resultados_scraping')
      .select('*')
      .order('created_at', { ascending: false });

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data![0].estrategia_usada).toBe('universal');
  });
});
```

## Despliegue y Monitoreo

### 1. Configuración de Netlify
```toml
# netlify.toml
[build]
  command = "next build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[functions]
  directory = "functions"

[dev]
  command = "next dev"
  port = 3000
  targetPort = 3000

[[headers]]
  for = "/_next/static/*"
  [headers.values]
    cache-control = "public, max-age=31536000, immutable"
```

### 2. Monitoreo de Errores
```typescript
// lib/monitoring.ts
import * as Sentry from '@sentry/nextjs';

export function initMonitoring() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1.0,
    });
  }
}

export function captureError(error: any, context?: any) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureException(error, {
      contexts: {
        scraping: context
      }
    });
  }
}
```

### 3. Métricas de Rendimiento
```typescript
// lib/metrics.ts
export interface ScrapingMetrics {
  totalJobs: number;
  successfulJobs: number;
  failedJobs: number;
  averageProcessingTime: number;
  errorRate: number;
}

export async function getScrapingMetrics(): Promise<ScrapingMetrics> {
  // Implementar consulta a Supabase para obtener métricas
  // Esta es una implementación simplificada
  return {
    totalJobs: 0,
    successfulJobs: 0,
    failedJobs: 0,
    averageProcessingTime: 0,
    errorRate: 0
  };
}
```

Este documento proporciona una guía completa para la integración del sistema "Scraping Hub", incluyendo la configuración de Supabase, la implementación de shadcn/ui, y la conexión entre todos los componentes del sistema.