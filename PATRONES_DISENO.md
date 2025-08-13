# Patrones de Diseño y Buenas Prácticas en "Scraping Hub"

## Descripción General

Este documento detalla los patrones de diseño, principios de arquitectura y buenas prácticas implementadas en el proyecto "Scraping Hub". La aplicación sigue principios de desarrollo moderno para garantizar mantenibilidad, escalabilidad y calidad del código.

## Patrones de Diseño Implementados

### 1. Arquitectura por Capas

#### Separación de Concerns
```
Presentación (UI) → Lógica de Negocio → Datos (API/DB)
```

- **Capa de Presentación**: Componentes React en `app/` y `components/`
- **Capa de Lógica de Negocio**: Hooks personalizados en `hooks/` y librerías en `lib/`
- **Capa de Datos**: Cliente Supabase en `lib/supabase.ts` y funciones serverless en `functions/`

#### Beneficios
- Facilita el mantenimiento y testing
- Permite reutilización de lógica
- Mejora la escalabilidad

### 2. Patrón Contenedor/Componente Presentacional

#### Componentes Contenedores
```typescript
// components/scraper/scraper-container.tsx
'use client';

import { useState, useEffect } from 'react';
import { ScraperForm } from './scraper-form';
import { LogWindow } from './log-window';
import { useWebSocket } from '@/hooks/use-websocket';

export function ScraperContainer() {
  const [urls, setUrls] = useState<string>('');
  const [strategy, setStrategy] = useState<string>('universal');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  const ws = useWebSocket();
  
  useEffect(() => {
    if (ws) {
      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleMessage(message);
      };
    }
  }, [ws]);
  
  // Lógica de negocio aquí...
  
  return (
    <div>
      <ScraperForm 
        urls={urls}
        strategy={strategy}
        onUrlsChange={setUrls}
        onStrategyChange={setStrategy}
        onSubmit={handleSubmit}
      />
      <LogWindow logs={logs} />
    </div>
  );
}
```

#### Componentes Presentacionales
```typescript
// components/scraper/scraper-form.tsx
interface ScraperFormProps {
  urls: string;
  strategy: string;
  onUrlsChange: (urls: string) => void;
  onStrategyChange: (strategy: string) => void;
  onSubmit: () => void;
}

export function ScraperForm({
  urls,
  strategy,
  onUrlsChange,
  onStrategyChange,
  onSubmit
}: ScraperFormProps) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <UrlInput value={urls} onChange={onUrlsChange} />
      <StrategySelector value={strategy} onChange={onStrategyChange} />
      <SubmitButton />
    </form>
  );
}
```

#### Beneficios
- Separación clara entre lógica y presentación
- Componentes reutilizables y testables
- Mejor organización del código

### 3. Patrón Módulo/Fachada

#### Fachada para Supabase
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export class SupabaseFacade {
  static async getScrapingResults(limit: number = 10) {
    const { data, error } = await supabase
      .from('resultados_scraping')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw new Error(error.message);
    return data;
  }
  
  static async saveScrapingResult(result: any) {
    const { data, error } = await supabase
      .from('resultados_scraping')
      .insert([result])
      .select();
    
    if (error) throw new Error(error.message);
    return data[0];
  }
  
  static async deleteScrapingResult(id: string) {
    const { error } = await supabase
      .from('resultados_scraping')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
  }
}
```

#### Beneficios
- Interfaz simplificada para sistemas complejos
- Encapsulamiento de lógica de bajo nivel
- Facilita el testing y mantenimiento

### 4. Patrón Estrategia

#### Implementación de Estrategias de Scraping
```typescript
// lib/scraper-strategies.ts
export interface ScrapingStrategy {
  scrape(page: puppeteer.Page, url: string): Promise<string>;
}

export class UniversalStrategy implements ScrapingStrategy {
  async scrape(page: puppeteer.Page, url: string): Promise<string> {
    // Implementación de estrategia universal
    return await scrapeUniversal(page);
  }
}

export class LeyChileStrategy implements ScrapingStrategy {
  async scrape(page: puppeteer.Page, url: string): Promise<string> {
    // Implementación de estrategia LeyChile
    return await scrapeLeyChile(page);
  }
}

// Selector de estrategia
export class StrategyFactory {
  static create(strategyName: string): ScrapingStrategy {
    switch (strategyName) {
      case 'leychile':
        return new LeyChileStrategy();
      case 'universal':
      default:
        return new UniversalStrategy();
    }
  }
}
```

#### Beneficios
- Flexibilidad para cambiar algoritmos en tiempo de ejecución
- Código abierto para extensión pero cerrado para modificación
- Facilita el testing de diferentes estrategias

### 5. Patrón Observador

#### Implementación con WebSockets
```typescript
// hooks/use-websocket.ts
export function useWebSocket() {
  const [messages, setMessages] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  
  useEffect(() => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WEBSOCKET_URL!);
    wsRef.current = ws;
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
      
      // Notificar a otros observadores
      notifyObservers(message);
    };
    
    return () => {
      ws.close();
    };
  }, []);
  
  const observers: ((message: any) => void)[] = [];
  
  function addObserver(observer: (message: any) => void) {
    observers.push(observer);
  }
  
  function removeObserver(observer: (message: any) => void) {
    const index = observers.indexOf(observer);
    if (index > -1) {
      observers.splice(index, 1);
    }
  }
  
  function notifyObservers(message: any) {
    observers.forEach(observer => observer(message));
  }
  
  return { messages, addObserver, removeObserver };
}
```

#### Beneficios
- Desacoplamiento entre productores y consumidores de eventos
- Soporte para múltiples suscriptores
- Comunicación en tiempo real eficiente

## Principios SOLID Aplicados

### 1. Principio de Responsabilidad Única (SRP)

#### Ejemplo: Componente de Logs
```typescript
// components/scraper/log-window.tsx - Solo muestra logs
export function LogWindow({ logs }: LogWindowProps) {
  return (
    <div className="log-window">
      {logs.map((log, index) => (
        <LogEntry key={index} log={log} />
      ))}
    </div>
  );
}

// components/scraper/log-entry.tsx - Solo muestra una entrada de log
export function LogEntry({ log }: { log: LogEntry }) {
  return (
    <div className={`log-entry log-${log.level.toLowerCase()}`}>
      [{log.timestamp.toLocaleTimeString()}] [{log.level}] {log.message}
    </div>
  );
}
```

### 2. Principio de Abierto/Cerrado (OCP)

#### Ejemplo: Estrategias de Scraping
```typescript
// lib/scraper-strategies.ts - Abierto para extensión, cerrado para modificación
export abstract class ScrapingStrategy {
  abstract scrape(page: puppeteer.Page, url: string): Promise<string>;
}

// Nueva estrategia sin modificar código existente
export class NewStrategy extends ScrapingStrategy {
  async scrape(page: puppeteer.Page, url: string): Promise<string> {
    // Implementación de nueva estrategia
  }
}
```

### 3. Principio de Sustitución de Liskov (LSP)

#### Ejemplo: Componentes UI
```typescript
// components/ui/button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg';
}

export function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

// Cualquier variante puede sustituir al botón base
const PrimaryButton = () => <Button variant="default">Primary</Button>;
const SecondaryButton = () => <Button variant="secondary">Secondary</Button>;
```

### 4. Principio de Segregación de Interfaces (ISP)

#### Ejemplo: Props de Componentes
```typescript
// interfaces separadas para diferentes props
interface UrlInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

interface StrategySelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

// Componentes que solo necesitan sus props específicas
export function UrlInput({ value, onChange, disabled }: UrlInputProps) { ... }
export function StrategySelector({ value, onChange, disabled }: StrategySelectorProps) { ... }
```

### 5. Principio de Inversión de Dependencias (DIP)

#### Ejemplo: Inyección de Dependencias
```typescript
// lib/scraper-service.ts
export class ScraperService {
  constructor(
    private websocketClient: WebSocketClient,
    private supabaseClient: SupabaseClient
  ) {}
  
  async startScraping(config: ScrapingConfig) {
    // Usa las dependencias inyectadas
    this.websocketClient.sendMessage('start', config);
    // ...
  }
}

// En el componente
const scraperService = new ScraperService(wsClient, supabase);
```

## Buenas Prácticas de Desarrollo

### 1. Tipado Estricto con TypeScript

#### Interfaces Bien Definidas
```typescript
// types/scraper.ts
export interface ScrapingResult {
  url: string;
  content: string;
  timestamp: Date;
  strategy: ScrapingStrategyType;
}

export interface ScrapingJob {
  id: string;
  urls: string[];
  strategy: ScrapingStrategyType;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  results: ScrapingResult[];
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. Manejo de Errores Centralizado

#### Sistema de Errores Personalizados
```typescript
// lib/errors.ts
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

export class ValidationError extends ScrapingHubError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

// Uso en funciones
export async function validateScrapingConfig(config: any) {
  if (!config.urls || config.urls.length === 0) {
    throw new ValidationError('Debe proporcionar al menos una URL');
  }
}
```

### 3. Pruebas Automatizadas

#### Pruebas Unitarias
```typescript
// tests/unit/components/scraper-form.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ScraperForm } from '@/components/scraper/scraper-form';

describe('ScraperForm', () => {
  it('debe renderizar campos de entrada', () => {
    render(<ScraperForm {...defaultProps} />);
    
    expect(screen.getByLabelText('URLs para procesar')).toBeInTheDocument();
    expect(screen.getByLabelText('Estrategia de Scraping')).toBeInTheDocument();
  });
  
  it('debe llamar onSubmit cuando se envía el formulario', () => {
    const onSubmit = vi.fn();
    render(<ScraperForm {...defaultProps} onSubmit={onSubmit} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Scraping' }));
    
    expect(onSubmit).toHaveBeenCalled();
  });
});
```

### 4. Documentación en Línea

#### JSDoc/TypeDoc Completo
```typescript
/**
 * Hook personalizado para manejo de WebSocket
 * 
 * @description Este hook maneja la conexión WebSocket, envío de mensajes
 * y recepción de datos en tiempo real para la aplicación Scraping Hub.
 * 
 * @example
 * ```tsx
 * const { messages, sendMessage } = useWebSocket();
 * 
 * useEffect(() => {
 *   messages.forEach(message => {
 *     console.log('Nuevo mensaje:', message);
 *   });
 * }, [messages]);
 * 
 * const handleStartScraping = () => {
 *   sendMessage({ type: 'start_scraping', data: config });
 * };
 * ```
 * 
 * @returns {Object} Objeto con funciones y estado del WebSocket
 * @property {any[]} messages - Array de mensajes recibidos
 * @property {Function} sendMessage - Función para enviar mensajes
 * @property {boolean} isConnected - Estado de conexión
 */
export function useWebSocket() {
  // Implementación...
}
```

### 5. Optimización de Rendimiento

#### Memoización y useCallback
```typescript
// components/scraper/results-table.tsx
export function ResultsTable({ results }: ResultsTableProps) {
  // Memoizar cálculos pesados
  const processedResults = useMemo(() => {
    return results.map(result => ({
      ...result,
      processedContent: processContent(result.content)
    }));
  }, [results]);
  
  // Memoizar funciones
  const handleViewDetail = useCallback((result: ScrapingResult) => {
    // Lógica para ver detalle
  }, []);
  
  return (
    <Table>
      {processedResults.map(result => (
        <ResultsRow 
          key={result.id} 
          result={result} 
          onViewDetail={handleViewDetail}
        />
      ))}
    </Table>
  );
}
```

## Consideraciones de Seguridad

### 1. Validación de Entrada
```typescript
// utils/validation.ts
export function validateUrls(urls: string[]): ValidationResult {
  const errors: string[] = [];
  
  if (urls.length === 0) {
    errors.push('Debe ingresar al menos una URL');
  }
  
  if (urls.length > 100) {
    errors.push('No se pueden procesar más de 100 URLs a la vez');
  }
  
  const invalidUrls = urls.filter(url => {
    try {
      new URL(url);
      return false;
    } catch {
      return true;
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
```

### 2. Protección contra Abusos
```typescript
// middleware/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '60 s'),
  analytics: true,
});

export async function checkRateLimit(identifier: string) {
  const { success } = await ratelimit.limit(identifier);
  return success;
}
```

## Mantenibilidad y Escalabilidad

### 1. Estructura Modular
```typescript
// lib/index.ts - Punto de entrada para librerías
export { SupabaseFacade } from './supabase';
export { WebSocketClient } from './websocket';
export { ScraperService } from './scraper';
export * from './errors';
export * from './validation';
```

### 2. Configuración Centralizada
```typescript
// config/index.ts
export const config = {
  scraping: {
    timeout: parseInt(process.env.SCRAPING_TIMEOUT || '30000'),
    maxUrls: parseInt(process.env.SCRAPING_MAX_URLS || '100'),
    strategies: ['universal', 'leychile'] as const
  },
  websocket: {
    url: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001'
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key: process.env.NEXT_PUBLIC_SUPABASE_KEY!
  }
};
```

Este documento proporciona una guía completa de los patrones de diseño y buenas prácticas implementadas en el proyecto "Scraping Hub", asegurando un código mantenible, escalable y de alta calidad.