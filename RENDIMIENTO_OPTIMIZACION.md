# Rendimiento y Optimización en "Scraping Hub"

## Descripción General

Este documento detalla las consideraciones de rendimiento y optimización implementadas en el proyecto "Scraping Hub". La aplicación está diseñada para ser eficiente, escalable y capaz de manejar cargas de trabajo significativas sin comprometer la experiencia del usuario.

## Estrategias de Optimización

### 1. Optimización del Frontend

#### Code Splitting y Carga Diferida
```typescript
// app/scraper/page.tsx - Carga diferida de componentes pesados
'use client';

import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Componentes pesados cargados de forma diferida
const LogWindow = lazy(() => import('@/components/scraper/log-window'));
const ResultsTable = lazy(() => import('@/components/results/results-table'));

export default function ScraperPage() {
  return (
    <div className="space-y-6">
      {/* Componentes ligeros cargados inmediatamente */}
      <ScraperForm />
      
      {/* Componentes pesados con carga diferida */}
      <Suspense fallback={<LoadingSpinner />}>
        <LogWindow />
      </Suspense>
      
      <Suspense fallback={<LoadingSpinner />}>
        <ResultsTable />
      </Suspense>
    </div>
  );
}
```

#### Optimización de Imágenes
```typescript
// components/ui/optimized-image.tsx
'use client';

import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

export function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  className 
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  
  return (
    <div className="relative">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`
          duration-700 ease-in-out
          ${isLoading ? 'scale-110 blur-2xl grayscale' : 'scale-100 blur-0 grayscale-0'}
          ${className}
        `}
        onLoadingComplete={() => setIsLoading(false)}
        placeholder="blur"
        blurDataURL="data:image/svg+xml;base64,..."
      />
    </div>
  );
}
```

#### Memoización de Componentes
```typescript
// components/results/results-row.tsx
import { memo } from 'react';

interface ResultsRowProps {
  result: ScrapingResult;
  onViewDetail: (result: ScrapingResult) => void;
}

// Componente memoizado para evitar renders innecesarios
export const ResultsRow = memo(function ResultsRow({ 
  result, 
  onViewDetail 
}: ResultsRowProps) {
  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {result.id.substring(0, 8)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(result.created_at).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant="secondary">{result.estrategia_usada}</Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {result.urls_procesadas}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetail(result)}
        >
          Ver Detalle
        </Button>
      </td>
    </tr>
  );
});
```

### 2. Optimización de WebSockets

#### Pooling de Conexiones
```typescript
// lib/websocket-pool.ts
class WebSocketPool {
  private connections: Map<string, WebSocket> = new Map();
  private maxConnections: number = 10;
  
  getConnection(identifier: string): WebSocket | null {
    // Reutilizar conexión existente
    if (this.connections.has(identifier)) {
      return this.connections.get(identifier)!;
    }
    
    // Crear nueva conexión si hay espacio
    if (this.connections.size < this.maxConnections) {
      const ws = new WebSocket(process.env.NEXT_PUBLIC_WEBSOCKET_URL!);
      this.connections.set(identifier, ws);
      return ws;
    }
    
    // Reutilizar conexión menos utilizada
    return this.getLeastUsedConnection();
  }
  
  private getLeastUsedConnection(): WebSocket | null {
    // Implementación para obtener la conexión menos utilizada
    const entries = Array.from(this.connections.entries());
    if (entries.length === 0) return null;
    
    // Simplificación: retornar la primera conexión
    return entries[0][1];
  }
  
  closeConnection(identifier: string): void {
    const ws = this.connections.get(identifier);
    if (ws) {
      ws.close();
      this.connections.delete(identifier);
    }
  }
}

export const wsPool = new WebSocketPool();
```

#### Compresión de Mensajes
```typescript
// lib/message-compression.ts
import { compress, decompress } from 'lz-string';

export class MessageCompression {
  static compressMessage(message: any): string {
    const jsonString = JSON.stringify(message);
    return compress(jsonString);
  }
  
  static decompressMessage(compressedMessage: string): any {
    const jsonString = decompress(compressedMessage);
    return JSON.parse(jsonString);
  }
  
  static shouldCompress(message: any): boolean {
    const jsonString = JSON.stringify(message);
    return jsonString.length > 1024; // Comprimir mensajes mayores a 1KB
  }
}
```

### 3. Optimización de Puppeteer/Scraping

#### Reutilización de Navegadores
```typescript
// lib/puppeteer-manager.ts
import puppeteer, { Browser } from 'puppeteer';

class PuppeteerManager {
  private browser: Browser | null = null;
  private pagePool: puppeteer.Page[] = [];
  private maxPages: number = 5;
  
  async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
    }
    
    return this.browser;
  }
  
  async getPage(): Promise<puppeteer.Page> {
    const browser = await this.getBrowser();
    
    // Reutilizar página del pool si está disponible
    if (this.pagePool.length > 0) {
      return this.pagePool.pop()!;
    }
    
    // Crear nueva página si no se excede el límite
    if (this.pagePool.length < this.maxPages) {
      return await browser.newPage();
    }
    
    // Reutilizar página existente (simplificación)
    const pages = await browser.pages();
    return pages[0];
  }
  
  async releasePage(page: puppeteer.Page): Promise<void> {
    // Limpiar estado de la página antes de reutilizarla
    await page.goto('about:blank');
    this.pagePool.push(page);
  }
  
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
    this.pagePool = [];
  }
}

export const puppeteerManager = new PuppeteerManager();
```

#### Caching de Recursos
```typescript
// lib/resource-cache.ts
class ResourceCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private ttl: number = 5 * 60 * 1000; // 5 minutos
  
  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
  
  get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Verificar si el cache ha expirado
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  getSize(): number {
    return this.cache.size;
  }
}

export const resourceCache = new ResourceCache();
```

## Optimización de Base de Datos

### 1. Índices y Consultas Optimizadas
```sql
-- Índices para mejorar el rendimiento de consultas
CREATE INDEX idx_resultados_scraping_created_at 
ON resultados_scraping(created_at DESC);

CREATE INDEX idx_resultados_scraping_estrategia 
ON resultados_scraping(estrategia_usada);

CREATE INDEX idx_resultados_scraping_user_id 
ON resultados_scraping(user_id);

-- Índice compuesto para consultas frecuentes
CREATE INDEX idx_resultados_scraping_user_created 
ON resultados_scraping(user_id, created_at DESC);
```

### 2. Paginación Eficiente
```typescript
// lib/supabase.ts
export class SupabaseFacade {
  static async getScrapingResultsPaginated(
    page: number = 1, 
    limit: number = 20,
    userId?: string
  ) {
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('resultados_scraping')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error, count } = await query;
    
    if (error) throw new Error(error.message);
    
    return {
      data,
      count: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      currentPage: page
    };
  }
}
```

### 3. Caching de Resultados
```typescript
// lib/cache-manager.ts
import { createClient } from 'redis';

class CacheManager {
  private client: any;
  
  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL
    });
    
    this.client.connect();
  }
  
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.client.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }
  
  async set<T>(key: string, value: T, ttl: number = 300): Promise<void> {
    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  }
  
  async invalidate(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      console.error('Error invalidating cache:', error);
    }
  }
}

export const cacheManager = new CacheManager();
```

## Optimización de Red

### 1. Compresión HTTP
```typescript
// next.config.js
const nextConfig = {
  compress: true, // Habilitar compresión gzip
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
```

### 2. CDN y Caching
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

## Monitoreo de Rendimiento

### 1. Métricas de Rendimiento
```typescript
// lib/performance-monitor.ts
class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  
  startTimer(name: string): () => number {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      const duration = end - start;
      
      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }
      
      this.metrics.get(name)!.push(duration);
      return duration;
    };
  }
  
  getAverage(name: string): number {
    const times = this.metrics.get(name);
    if (!times || times.length === 0) return 0;
    
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }
  
  getPercentile(name: string, percentile: number): number {
    const times = this.metrics.get(name);
    if (!times || times.length === 0) return 0;
    
    const sorted = [...times].sort((a, b) => a - b);
    const index = Math.floor((percentile / 100) * (sorted.length - 1));
    return sorted[index];
  }
  
  report(): void {
    console.log('=== Performance Report ===');
    this.metrics.forEach((times, name) => {
      console.log(`${name}:`);
      console.log(`  Average: ${this.getAverage(name).toFixed(2)}ms`);
      console.log(`  95th Percentile: ${this.getPercentile(name, 95).toFixed(2)}ms`);
      console.log(`  99th Percentile: ${this.getPercentile(name, 99).toFixed(2)}ms`);
    });
  }
}

export const perfMonitor = new PerformanceMonitor();
```

### 2. Instrumentación de Componentes
```typescript
// components/scraper/scraper-container.tsx
'use client';

import { useEffect } from 'react';
import { perfMonitor } from '@/lib/performance-monitor';

export function ScraperContainer() {
  useEffect(() => {
    const stopTimer = perfMonitor.startTimer('scraper-container-mount');
    
    return () => {
      const duration = stopTimer();
      console.log(`ScraperContainer mounted in ${duration.toFixed(2)}ms`);
    };
  }, []);
  
  // Resto del componente...
}
```

## Optimización de Carga Inicial

### 1. Preloading Estratégico
```typescript
// app/layout.tsx
import Script from 'next/script';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        {/* Preload recursos críticos */}
        <link rel="preload" href="/fonts/inter-var-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
        
        {/* Scripts no críticos con carga diferida */}
        <Script 
          src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.0.0/socket.io.js" 
          strategy="lazyOnload" 
        />
      </body>
    </html>
  );
}
```

### 2. Optimización de Bundles
```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  // Eliminar código no utilizado
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },
  
  // Optimización de imágenes
  images: {
    domains: ['images.unsplash.com', 'avatars.githubusercontent.com'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Configuración de webpack para optimización
  webpack: (config, { dev, isServer }) => {
    // Reducir tamaño de bundles en producción
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    
    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);
```

## Estrategias de Escalabilidad

### 1. Colas de Procesamiento
```typescript
// lib/job-queue.ts
class JobQueue {
  private queue: ScrapingJob[] = [];
  private processing: boolean = false;
  private maxConcurrent: number = 3;
  private activeJobs: number = 0;
  
  addJob(job: ScrapingJob): void {
    this.queue.push(job);
    this.processQueue();
  }
  
  private async processQueue(): Promise<void> {
    if (this.processing || this.activeJobs >= this.maxConcurrent) {
      return;
    }
    
    this.processing = true;
    
    while (this.queue.length > 0 && this.activeJobs < this.maxConcurrent) {
      const job = this.queue.shift();
      if (job) {
        this.activeJobs++;
        this.processJob(job)
          .finally(() => {
            this.activeJobs--;
            this.processQueue(); // Procesar siguiente job
          });
      }
    }
    
    this.processing = false;
  }
  
  private async processJob(job: ScrapingJob): Promise<void> {
    // Implementación del procesamiento del job
    try {
      // Lógica de scraping
      await this.executeScraping(job);
    } catch (error) {
      console.error('Error processing job:', error);
    }
  }
}

export const jobQueue = new JobQueue();
```

### 2. Balanceo de Carga
```typescript
// lib/load-balancer.ts
class LoadBalancer {
  private workers: string[] = [
    'https://worker1.scraping-hub.com',
    'https://worker2.scraping-hub.com',
    'https://worker3.scraping-hub.com'
  ];
  private currentIndex: number = 0;
  
  getNextWorker(): string {
    const worker = this.workers[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.workers.length;
    return worker;
  }
  
  async distributeJob(job: ScrapingJob): Promise<any> {
    const workerUrl = this.getNextWorker();
    
    try {
      const response = await fetch(`${workerUrl}/api/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(job)
      });
      
      if (!response.ok) {
        throw new Error(`Worker error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Load balancer error:', error);
      // Reintentar con otro worker o manejar error
      throw error;
    }
  }
}

export const loadBalancer = new LoadBalancer();
```

## Métricas y Monitoreo

### 1. Dashboard de Métricas
```typescript
// components/dashboard/performance-metrics.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PerformanceMetrics {
  avgResponseTime: number;
  successRate: number;
  activeJobs: number;
  queueLength: number;
  memoryUsage: number;
  cpuUsage: number;
}

export function PerformanceMetricsDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    avgResponseTime: 0,
    successRate: 0,
    activeJobs: 0,
    queueLength: 0,
    memoryUsage: 0,
    cpuUsage: 0
  });
  
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/metrics');
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    }, 5000); // Actualizar cada 5 segundos
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Tiempo Promedio de Respuesta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.avgResponseTime.toFixed(2)}ms</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Tasa de Éxito</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.successRate.toFixed(1)}%</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Trabajos Activos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.activeJobs}</div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 2. Alertas de Rendimiento
```typescript
// lib/performance-alerts.ts
class PerformanceAlerts {
  private thresholds = {
    responseTime: 5000, // 5 segundos
    successRate: 95,    // 95%
    queueLength: 50,    // 50 jobs
    memoryUsage: 80,    // 80%
    cpuUsage: 85        // 85%
  };
  
  checkMetrics(metrics: any): string[] {
    const alerts: string[] = [];
    
    if (metrics.avgResponseTime > this.thresholds.responseTime) {
      alerts.push(`Tiempo de respuesta alto: ${metrics.avgResponseTime.toFixed(2)}ms`);
    }
    
    if (metrics.successRate < this.thresholds.successRate) {
      alerts.push(`Tasa de éxito baja: ${metrics.successRate.toFixed(1)}%`);
    }
    
    if (metrics.queueLength > this.thresholds.queueLength) {
      alerts.push(`Cola de trabajos larga: ${metrics.queueLength} jobs`);
    }
    
    if (metrics.memoryUsage > this.thresholds.memoryUsage) {
      alerts.push(`Uso de memoria alto: ${metrics.memoryUsage.toFixed(1)}%`);
    }
    
    if (metrics.cpuUsage > this.thresholds.cpuUsage) {
      alerts.push(`Uso de CPU alto: ${metrics.cpuUsage.toFixed(1)}%`);
    }
    
    return alerts;
  }
  
  async sendAlert(alerts: string[]): Promise<void> {
    if (alerts.length === 0) return;
    
    // Enviar alerta por email, Slack, etc.
    console.warn('Performance Alerts:', alerts);
    
    // En producción, enviar notificaciones reales
    // await sendSlackAlert(alerts);
    // await sendEmailAlert(alerts);
  }
}

export const performanceAlerts = new PerformanceAlerts();
```

## Consideraciones Finales

### 1. Plan de Optimización Continua
- **Monitoreo continuo** de métricas de rendimiento
- **Revisión trimestral** de estrategias de optimización
- **Actualización de dependencias** para mejoras de rendimiento
- **Pruebas de carga** regulares

### 2. Escalabilidad Horizontal
- **Autoescalado** de funciones serverless
- **Balanceo de carga** entre múltiples workers
- **Caching distribuido** con Redis
- **Base de datos escalable** con Supabase

### 3. Optimización Específica por Componente
- **Frontend**: Code splitting, lazy loading, memoización
- **Backend**: Pooling de conexiones, caching, colas
- **Scraping**: Reutilización de recursos, optimización de Puppeteer
- **Base de datos**: Índices, paginación, caching

Este enfoque integral de optimización garantiza que "Scraping Hub" mantenga un rendimiento óptimo incluso bajo cargas de trabajo significativas.