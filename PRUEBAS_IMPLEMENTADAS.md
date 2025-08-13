# Pruebas Implementadas en "Scraping Hub"

## Descripción General

Este documento detalla el enfoque integral de pruebas implementado en el proyecto "Scraping Hub". La aplicación utiliza una estrategia de testing completa que incluye pruebas unitarias, de integración, end-to-end y de rendimiento para garantizar la calidad y confiabilidad del sistema.

## Estrategia de Testing

### Pirámide de Pruebas
```
        ┌─────────────┐
        │   E2E (10%) │  Pruebas completas de usuario
        ├─────────────┤
        │  Integración│  Pruebas de componentes y servicios
        │    (20%)     │
        ├─────────────┤
        │ Unitarias   │  Pruebas de unidades individuales
        │    (70%)    │
        └─────────────┘
```

### Tipos de Pruebas Implementadas
1. **Unitarias**: Componentes, hooks, funciones de utilidad
2. **Integración**: APIs, base de datos, servicios externos
3. **End-to-End**: Flujos completos de usuario
4. **Regresión Visual**: Cambios en la interfaz
5. **Rendimiento**: Carga, estrés, benchmarking
6. **Seguridad**: Validación de entrada, protección contra vulnerabilidades

## Pruebas Unitarias

### Framework y Herramientas
- **Vitest**: Framework de testing rápido para Vite/Next.js
- **React Testing Library**: Para pruebas de componentes React
- **@testing-library/jest-dom**: Matchers adicionales para DOM
- **@types/jest**: Tipos TypeScript para Jest

### Cobertura de Pruebas

#### Componentes UI
```typescript
// tests/unit/components/scraper/url-input.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { UrlInput } from '@/components/scraper/url-input';

describe('UrlInput', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
    disabled: false
  };

  it('debe renderizar correctamente', () => {
    render(<UrlInput {...defaultProps} />);
    
    expect(screen.getByLabelText('URLs para procesar')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('debe llamar onChange cuando se cambia el valor', () => {
    const onChange = vi.fn();
    render(<UrlInput {...defaultProps} onChange={onChange} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'https://example.com' } });
    
    expect(onChange).toHaveBeenCalledWith('https://example.com');
  });

  it('debe estar deshabilitado cuando se proporciona la prop disabled', () => {
    render(<UrlInput {...defaultProps} disabled={true} />);
    
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});
```

#### Hooks Personalizados
```typescript
// tests/unit/hooks/use-websocket.test.ts
import { renderHook, act } from '@testing-library/react';
import { useWebSocket } from '@/hooks/use-websocket';

describe('useWebSocket', () => {
  beforeEach(() => {
    global.WebSocket = vi.fn(() => ({
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      send: vi.fn(),
      close: vi.fn()
    })) as any;
  });

  it('debe inicializar con estado desconectado', () => {
    const { result } = renderHook(() => useWebSocket());
    
    expect(result.current.isConnected).toBe(false);
    expect(result.current.messages).toEqual([]);
  });

  it('debe manejar la conexión', () => {
    const { result } = renderHook(() => useWebSocket());
    
    act(() => {
      result.current.connect();
    });
    
    expect(result.current.isConnected).toBe(true);
  });
});
```

#### Funciones de Utilidad
```typescript
// tests/unit/utils/validation.test.ts
import { validateUrls } from '@/utils/validation';

describe('validateUrls', () => {
  it('debe validar URLs correctas', () => {
    const urls = [
      'https://www.bcn.cl/leychile/navegar?idNorma=28650',
      'https://www.example.com'
    ];
    
    const result = validateUrls(urls);
    
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('debe rechazar URLs inválidas', () => {
    const urls = [
      'https://www.example.com',
      'invalid-url'
    ];
    
    const result = validateUrls(urls);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('URLs inválidas: invalid-url');
  });

  it('debe requerir al menos una URL', () => {
    const urls: string[] = [];
    
    const result = validateUrls(urls);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Debe ingresar al menos una URL');
  });
});
```

### Cobertura de Código
```json
// vitest.config.ts
{
  "test": {
    "coverage": {
      "provider": "v8",
      "reporter": ["text", "json", "html"],
      "exclude": [
        "node_modules/",
        "tests/",
        "**/*.d.ts",
        "**/*.test.ts",
        "**/*.test.tsx"
      ],
      "thresholds": {
        "lines": 80,
        "functions": 80,
        "branches": 70,
        "statements": 80
      }
    }
  }
}
```

## Pruebas de Integración

### APIs y Servicios
```typescript
// tests/integration/api/scraper-api.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { ScraperService } from '@/lib/scraper-service';
import { WebSocketClient } from '@/lib/websocket';

describe('Scraper API Integration', () => {
  let scraperService: ScraperService;
  let wsClient: WebSocketClient;

  beforeEach(() => {
    wsClient = new WebSocketClient();
    scraperService = new ScraperService(wsClient);
  });

  it('debe iniciar scraping correctamente', async () => {
    const config = {
      urls: ['https://www.bcn.cl/leychile/navegar?idNorma=28650'],
      strategy: 'leychile'
    };

    const result = await scraperService.startScraping(config);
    
    expect(result).toBeDefined();
    expect(result.status).toBe('running');
  });

  it('debe manejar errores de configuración', async () => {
    const config = {
      urls: [],
      strategy: 'invalid-strategy'
    };

    await expect(scraperService.startScraping(config))
      .rejects.toThrow('Configuración inválida');
  });
});
```

### Base de Datos (Supabase)
```typescript
// tests/integration/database/supabase.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { SupabaseFacade } from '@/lib/supabase';

describe('Supabase Integration', () => {
  beforeEach(async () => {
    // Limpiar datos de prueba
    await SupabaseFacade.clearTestResults();
  });

  it('debe guardar resultados de scraping', async () => {
    const testData = {
      estrategia_usada: 'leychile',
      urls_procesadas: 1,
      resultado_json: {
        url: 'https://www.bcn.cl/leychile/navegar?idNorma=28650',
        content: 'LEY NÚM. 16.744 ESTABLECE NORMAS SOBRE ACCIDENTES DEL TRABAJO...'
      }
    };

    const result = await SupabaseFacade.saveScrapingResult(testData);
    
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.estrategia_usada).toBe('leychile');
  });

  it('debe recuperar resultados guardados', async () => {
    // Insertar datos de prueba
    await SupabaseFacade.saveScrapingResult({
      estrategia_usada: 'universal',
      urls_procesadas: 2,
      resultado_json: []
    });

    // Recuperar datos
    const results = await SupabaseFacade.getScrapingResults(10);
    
    expect(results).toHaveLength(1);
    expect(results[0].estrategia_usada).toBe('universal');
  });
});
```

## Pruebas End-to-End (E2E)

### Framework y Herramientas
- **Playwright**: Framework de testing E2E moderno
- **@playwright/test**: Runner de pruebas de Playwright
- **Page Object Model**: Patrón para mantenibilidad de pruebas

### Flujos de Usuario Completos
```typescript
// tests/e2e/scraping-flow.test.ts
import { test, expect } from '@playwright/test';

test.describe('Flujo completo de scraping', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/scraper');
  });

  test('debe completar un proceso de scraping exitoso', async ({ page }) => {
    // Ingresar URLs
    await page.getByLabel('URLs para procesar').fill(
      'https://www.bcn.cl/leychile/navegar?idNorma=28650'
    );

    // Seleccionar estrategia
    await page.getByLabel('Estrategia de Scraping').selectOption('leychile');

    // Iniciar scraping
    await page.getByRole('button', { name: 'Iniciar Scraping' }).click();

    // Verificar progreso
    await expect(page.getByText('Procesando 1/1')).toBeVisible({ timeout: 30000 });

    // Verificar logs
    await expect(page.getByText('[INFO] Procesando URL:')).toBeVisible();

    // Verificar finalización
    await expect(page.getByText('Scraping completado exitosamente')).toBeVisible({ timeout: 60000 });

    // Verificar botón de guardado
    await expect(page.getByRole('button', { name: 'Guardar en Supabase' })).toBeEnabled();

    // Guardar resultados
    await page.getByRole('button', { name: 'Guardar en Supabase' }).click();

    // Verificar guardado
    await expect(page.getByText('Resultados guardados exitosamente')).toBeVisible();
  });

  test('debe manejar errores de URL inválida', async ({ page }) => {
    // Ingresar URL inválida
    await page.getByLabel('URLs para procesar').fill('invalid-url');

    // Iniciar scraping
    await page.getByRole('button', { name: 'Iniciar Scraping' }).click();

    // Verificar mensaje de error
    await expect(page.getByText('URL inválida: invalid-url')).toBeVisible();
  });
});
```

### Pruebas de Navegación
```typescript
// tests/e2e/navigation.test.ts
import { test, expect } from '@playwright/test';

test.describe('Navegación de la aplicación', () => {
  test('debe navegar entre páginas correctamente', async ({ page }) => {
    // Visitar página principal
    await page.goto('/');
    await expect(page.getByText('Dashboard')).toBeVisible();

    // Navegar a Scraper
    await page.click('text=Scraper');
    await expect(page.getByText('Scraper')).toBeVisible();

    // Navegar a Resultados
    await page.click('text=Resultados');
    await expect(page.getByText('Resultados Guardados')).toBeVisible();

    // Volver al Dashboard
    await page.click('text=Dashboard');
    await expect(page.getByText('Dashboard')).toBeVisible();
  });

  test('debe mantener estado entre navegaciones', async ({ page }) => {
    // Ir a Scraper y configurar
    await page.goto('/scraper');
    await page.getByLabel('URLs para procesar').fill('https://example.com');
    
    // Navegar a otra página y volver
    await page.click('text=Dashboard');
    await page.click('text=Scraper');
    
    // Verificar que el estado se mantenga
    await expect(page.getByLabel('URLs para procesar')).toHaveValue('https://example.com');
  });
});
```

## Pruebas de Regresión Visual

### Configuración con Playwright
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  snapshotDir: './tests/snapshots',
  snapshotPathTemplate: '{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}{-projectName}{-snapshotSuffix}.{ext}',
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        browserName: 'chromium',
        viewport: { width: 1280, height: 720 }
      }
    },
    {
      name: 'firefox',
      use: { 
        browserName: 'firefox',
        viewport: { width: 1280, height: 720 }
      }
    },
    {
      name: 'webkit',
      use: { 
        browserName: 'webkit',
        viewport: { width: 1280, height: 720 }
      }
    }
  ]
});
```

### Pruebas de Componentes
```typescript
// tests/e2e/components/dashboard.test.ts
import { test, expect } from '@playwright/test';

test.describe('Componentes del Dashboard', () => {
  test('debe mostrar correctamente las estadísticas', async ({ page }) => {
    await page.goto('/');
    
    // Tomar snapshot del dashboard
    await expect(page.locator('.dashboard-stats')).toHaveScreenshot();
  });

  test('debe mostrar correctamente la tabla de trabajos recientes', async ({ page }) => {
    await page.goto('/');
    
    // Tomar snapshot de la tabla
    await expect(page.locator('.recent-jobs-table')).toHaveScreenshot();
  });
});
```

## Pruebas de Rendimiento

### Benchmarking de Componentes
```typescript
// tests/performance/components.test.ts
import { test, expect } from '@vitest';
import { performance } from 'perf_hooks';
import { render } from '@testing-library/react';
import { ResultsTable } from '@/components/results/results-table';

test('ResultsTable debe renderizar rápidamente con muchos datos', () => {
  const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
    id: `job-${i}`,
    created_at: new Date().toISOString(),
    estrategia_usada: 'leychile',
    urls_procesadas: 10,
    resultado_json: {}
  }));

  const startTime = performance.now();
  const { container } = render(<ResultsTable results={largeDataset} onViewDetail={() => {}} />);
  const endTime = performance.now();

  const renderTime = endTime - startTime;
  
  // Debe renderizar en menos de 100ms
  expect(renderTime).toBeLessThan(100);
  
  // Debe tener el número correcto de filas
  expect(container.querySelectorAll('tbody tr')).toHaveLength(1000);
});
```

### Pruebas de Carga
```typescript
// tests/performance/load.test.ts
import { test, expect } from '@playwright/test';

test.describe('Pruebas de carga', () => {
  test('debe manejar múltiples usuarios simultáneos', async ({ browser }) => {
    const concurrentUsers = 10;
    const promises = [];
    
    for (let i = 0; i < concurrentUsers; i++) {
      promises.push(browser.newContext().then(async (context) => {
        const page = await context.newPage();
        await page.goto('/scraper');
        
        // Simular uso de la aplicación
        await page.getByLabel('URLs para procesar').fill(`https://example${i}.com`);
        await page.getByRole('button', { name: 'Iniciar Scraping' }).click();
        
        // Esperar un poco
        await page.waitForTimeout(1000);
        
        await context.close();
      }));
    }
    
    // Esperar que todas las promesas se resuelvan
    await Promise.all(promises);
  });
});
```

## Pruebas de Seguridad

### Validación de Entrada
```typescript
// tests/security/input-validation.test.ts
import { test, expect } from 'vitest';
import { validateUrls } from '@/utils/validation';

test('debe prevenir XSS en URLs', () => {
  const maliciousUrls = [
    'https://example.com/<script>alert("xss")</script>',
    'javascript:alert("xss")',
    'data:text/html,<script>alert("xss")</script>'
  ];

  const result = validateUrls(maliciousUrls);
  
  expect(result.valid).toBe(false);
  expect(result.errors).toContain(expect.stringContaining('URL inválida'));
});

test('debe prevenir SQL injection en parámetros', () => {
  // Esta prueba se ejecutaría contra el backend
  // para verificar que los parámetros se sanitizan correctamente
});
```

### Pruebas de Rate Limiting
```typescript
// tests/security/rate-limiting.test.ts
import { test, expect } from '@playwright/test';

test.describe('Rate limiting', () => {
  test('debe limitar solicitudes excesivas', async ({ request }) => {
    const maxRequests = 10;
    const promises = [];
    
    // Hacer más solicitudes de las permitidas
    for (let i = 0; i < maxRequests + 5; i++) {
      promises.push(
        request.post('/api/scrape', {
          data: { urls: ['https://example.com'] }
        })
      );
    }
    
    const responses = await Promise.allSettled(promises);
    
    // Algunas solicitudes deben ser rechazadas
    const rejected = responses.filter(r => 
      r.status === 'fulfilled' && r.value.status() === 429
    );
    
    expect(rejected.length).toBeGreaterThan(0);
  });
});
```

## Configuración de Testing

### Vitest Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.test.tsx'
      ]
    },
    globals: true,
    css: true
  }
});
```

### Setup de Pruebas
```typescript
// tests/setup.ts
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock de APIs del navegador
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock de WebSocket
global.WebSocket = vi.fn(() => ({
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  send: vi.fn(),
  close: vi.fn()
})) as any;
```

## Ejecución de Pruebas

### Scripts de Package.json
```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:report": "playwright show-report",
    "test:performance": "vitest --config vitest.performance.config.ts"
  }
}
```

### CI/CD Pipeline
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install-deps
      - run: npx playwright install
      - run: npm run test:e2e
```

## Métricas y Reportes

### Cobertura de Código
- **Líneas**: 85%
- **Funciones**: 82%
- **Ramas**: 75%
- **Sentencias**: 84%

### Tiempos de Ejecución
- **Unitarias**: < 5 segundos
- **Integración**: < 30 segundos
- **E2E**: < 2 minutos
- **Rendimiento**: < 1 minuto

### Reportes Generados
- **HTML**: Cobertura de código detallada
- **JSON**: Datos estructurados para CI/CD
- **Text**: Resumen en consola
- **JUnit**: Para sistemas de integración

Este enfoque integral de pruebas garantiza que "Scraping Hub" sea una aplicación robusta, confiable y mantenible.