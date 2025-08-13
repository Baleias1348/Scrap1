# Implementación del Backend para "Scraping Hub"

## Descripción General

El backend de "Scraping Hub" se implementará utilizando Netlify Functions con Node.js y Puppeteer. Esta arquitectura permite ejecutar tareas de scraping pesadas en un entorno serverless, escalable y manejado.

## Arquitectura del Backend

### Netlify Functions
- **Runtime**: Node.js 18+
- **Ubicación**: Directorio `/functions`
- **Despliegue**: Automático con Netlify
- **Escalabilidad**: Serverless, escalado automático

### Puppeteer
- **Propósito**: Control de navegador headless para scraping
- **Equivalente**: Similar a Selenium en Python
- **Características**:
  - Navegación web
  - Interacción con elementos DOM
  - Manejo de JavaScript dinámico
  - Captura de pantalla (opcional)

## Estructura de Funciones

```
functions/
├── scrape.ts          # Función principal de scraping
├── websocket.ts       # Manejo de conexiones WebSocket
└── supabase.ts        # Integración con Supabase
```

## Función Principal de Scraping (scrape.ts)

### Descripción
Esta función maneja todo el proceso de scraping, incluyendo la comunicación con el frontend a través de WebSockets.

### Código Base
```typescript
import { Builder, By, until } from 'selenium-webdriver';
import puppeteer from 'puppeteer';

// Tipos para la configuración del scraping
interface ScrapingConfig {
  urls: string[];
  strategy: 'universal' | 'leychile';
  // Otros parámetros de configuración
}

// Tipos para los mensajes WebSocket
interface WebSocketMessage {
  type: 'progress' | 'log' | 'result' | 'error';
  data: any;
}

export async function handler(event: any, context: any) {
  // Obtener la configuración del evento
  const config: ScrapingConfig = JSON.parse(event.body);
  
  // Establecer conexión WebSocket con el cliente
  const wsConnection = establishWebSocketConnection(event);
  
  try {
    // Iniciar el navegador con Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });
    
    // Crear una nueva página
    const page = await browser.newPage();
    
    // Configurar el user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Procesar cada URL
    const results = [];
    for (let i = 0; i < config.urls.length; i++) {
      const url = config.urls[i];
      
      // Enviar mensaje de progreso
      sendWebSocketMessage(wsConnection, {
        type: 'progress',
        data: {
          current: i + 1,
          total: config.urls.length,
          url: url
        }
      });
      
      // Enviar mensaje de log
      sendWebSocketMessage(wsConnection, {
        type: 'log',
        data: {
          level: 'INFO',
          message: `Procesando URL: ${url}`
        }
      });
      
      try {
        // Navegar a la URL
        await page.goto(url, { waitUntil: 'networkidle2' });
        
        // Aplicar estrategia de scraping según la configuración
        let result;
        if (config.strategy === 'leychile') {
          result = await scrapeLeyChile(page);
        } else {
          result = await scrapeUniversal(page);
        }
        
        // Agregar resultado al array
        results.push({
          url: url,
          content: result
        });
        
        // Enviar mensaje de éxito
        sendWebSocketMessage(wsConnection, {
          type: 'log',
          data: {
            level: 'SUCCESS',
            message: `✓ Procesado correctamente: ${url}`
          }
        });
      } catch (error) {
        // Enviar mensaje de error
        sendWebSocketMessage(wsConnection, {
          type: 'log',
          data: {
            level: 'ERROR',
            message: `✗ Error al procesar ${url}: ${error.message}`
          }
        });
      }
    }
    
    // Cerrar el navegador
    await browser.close();
    
    // Enviar resultados finales
    sendWebSocketMessage(wsConnection, {
      type: 'result',
      data: results
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Scraping completado' })
    };
  } catch (error) {
    // Enviar mensaje de error crítico
    sendWebSocketMessage(wsConnection, {
      type: 'error',
      data: {
        message: `Error crítico: ${error.message}`
      }
    });
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}

// Estrategia de scraping para LeyChile
async function scrapeLeyChile(page: puppeteer.Page) {
  try {
    // Manejar banner de cookies
    await handleCookiesBanner(page);
    
    // Esperar y cambiar al iframe
    await page.waitForSelector('#iFrmNorma', { timeout: 10000 });
    const frame = page.frames().find(f => f.name() === 'iFrmNorma');
    
    if (frame) {
      // Esperar a que el contenido del iframe cargue
      await frame.waitForSelector('#textoNorma', { timeout: 10000 });
      
      // Extraer el texto del selector específico
      const text = await frame.evaluate(() => {
        const element = document.querySelector('#textoNorma');
        return element ? element.textContent : '';
      });
      
      return text;
    } else {
      throw new Error('No se encontró el iframe iFrmNorma');
    }
  } catch (error) {
    throw new Error(`Error en estrategia LeyChile: ${error.message}`);
  }
}

// Estrategia de scraping universal
async function scrapeUniversal(page: puppeteer.Page) {
  try {
    // Lista de selectores comunes
    const commonSelectors = [
      'div#textoNorma',
      'article.ley',
      'div.cuerpo-decreto',
      'div#body',
      'div.content',
      'div.document',
      'div.article',
      'div#content',
      'main',
      'div.main',
      'div.container',
      'div.texto',
      'div.norma',
      'div.ley',
      'div.decreto'
    ];
    
    // Intentar encontrar contenido con selectores comunes
    for (const selector of commonSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        const elements = await page.$$(selector);
        
        if (elements.length > 0) {
          const texts = await Promise.all(
            elements.map(el => el.evaluate(e => e.textContent))
          );
          
          const combinedText = texts.join(' ').trim();
          if (combinedText.length > 100) {
            return combinedText;
          }
        }
      } catch (error) {
        // Continuar con el siguiente selector
        continue;
      }
    }
    
    // Si no se encontró con selectores específicos, intentar con etiquetas semánticas
    const semanticTags = ['article', 'main', 'section'];
    for (const tag of semanticTags) {
      try {
        await page.waitForSelector(tag, { timeout: 5000 });
        const elements = await page.$$(tag);
        
        if (elements.length > 0) {
          const texts = await Promise.all(
            elements.map(el => el.evaluate(e => e.textContent))
          );
          
          const combinedText = texts.join(' ').trim();
          if (combinedText.length > 100) {
            return combinedText;
          }
        }
      } catch (error) {
        // Continuar con la siguiente etiqueta
        continue;
      }
    }
    
    // Último recurso: extraer texto del body
    const bodyText = await page.evaluate(() => {
      const body = document.querySelector('body');
      if (body) {
        // Remover scripts y estilos
        const scripts = body.querySelectorAll('script, style, nav, header, footer');
        scripts.forEach(el => el.remove());
        return body.textContent;
      }
      return '';
    });
    
    return bodyText;
  } catch (error) {
    throw new Error(`Error en estrategia universal: ${error.message}`);
  }
}

// Manejo de banner de cookies
async function handleCookiesBanner(page: puppeteer.Page) {
  try {
    // Esperar a que aparezca un botón de aceptar cookies
    await page.waitForSelector(
      "button:enabled[contains(text(), 'Aceptar') or contains(text(), 'Acepto') or contains(text(), 'Entendido') or contains(text(), 'Aceptar todas') or contains(text(), 'Aceptar todo') or contains(text(), 'Continuar') or contains(text(), 'OK') or contains(text(), 'ok') or contains(text(), 'De acuerdo') or contains(text(), 'Estoy de acuerdo') or contains(text(), 'Consentir') or contains(text(), 'Permitir') or contains(text(), 'Allow') or contains(text(), 'Agree') or @value='Aceptar' or @value='Acepto' or @value='Entendido' or @value='Aceptar todas' or @value='Aceptar todo' or @value='Continuar' or @value='OK' or @value='ok' or @value='De acuerdo' or @value='Estoy de acuerdo' or @value='Consentir' or @value='Permitir' or @value='Allow' or @value='Agree' or contains(@class, 'accept') or contains(@class, 'consent') or contains(@id, 'accept') or contains(@id, 'consent')]",
      { timeout: 10000 }
    );
    
    // Hacer clic en el botón de aceptar
    await page.click(
      "button:enabled[contains(text(), 'Aceptar') or contains(text(), 'Acepto') or contains(text(), 'Entendido') or contains(text(), 'Aceptar todas') or contains(text(), 'Aceptar todo') or contains(text(), 'Continuar') or contains(text(), 'OK') or contains(text(), 'ok') or contains(text(), 'De acuerdo') or contains(text(), 'Estoy de acuerdo') or contains(text(), 'Consentir') or contains(text(), 'Permitir') or contains(text(), 'Allow') or contains(text(), 'Agree') or @value='Aceptar' or @value='Acepto' or @value='Entendido' or @value='Aceptar todas' or @value='Aceptar todo' or @value='Continuar' or @value='OK' or @value='ok' or @value='De acuerdo' or @value='Estoy de acuerdo' or @value='Consentir' or @value='Permitir' or @value='Allow' or @value='Agree' or contains(@class, 'accept') or contains(@class, 'consent') or contains(@id, 'accept') or contains(@id, 'consent')]"
    );
  } catch (error) {
    // Si no se encuentra el banner, continuar sin errores
    console.log('No se encontró banner de cookies o consentimiento');
  }
}

// Funciones de WebSocket (implementación simplificada)
function establishWebSocketConnection(event: any) {
  // Implementación específica de Netlify Functions para WebSocket
  // Esta sería una implementación más compleja en la práctica
  return {
    send: (message: WebSocketMessage) => {
      // Lógica para enviar mensaje al cliente
      console.log('WebSocket message:', message);
    }
  };
}

function sendWebSocketMessage(connection: any, message: WebSocketMessage) {
  // Enviar mensaje a través de WebSocket
  connection.send(message);
}
```

## Manejo de WebSockets

### Descripción
La comunicación en tiempo real entre el frontend y el backend se realiza a través de WebSockets, permitiendo actualizaciones de progreso y logs en tiempo real.

### Consideraciones Técnicas
1. **Conexiones persistentes**: Mantener conexiones WebSocket activas durante el proceso de scraping
2. **Manejo de reconexiones**: Implementar lógica para reconectar en caso de fallos
3. **Seguridad**: Validar conexiones y mensajes
4. **Escalabilidad**: Considerar límites de conexiones concurrentes

## Integración con Supabase

### Descripción
Los resultados del scraping se almacenan en Supabase una vez completado el proceso.

### Código Base
```typescript
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Función para guardar resultados en Supabase
export async function saveScrapingResults(results: any, strategy: string) {
  try {
    const { data, error } = await supabase
      .from('resultados_scraping')
      .insert([
        {
          estrategia_usada: strategy,
          urls_procesadas: results.length,
          resultado_json: results
        }
      ]);
    
    if (error) {
      throw new Error(`Error al guardar en Supabase: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    throw new Error(`Error al guardar resultados: ${error.message}`);
  }
}
```

## Consideraciones de Rendimiento

### 1. Optimización de Puppeteer
- **Reutilización de navegador**: Mantener una instancia de navegador para múltiples solicitudes
- **Pooling de páginas**: Reutilizar páginas cuando sea posible
- **Configuración de recursos**: Limitar uso de CPU y memoria

### 2. Manejo de Errores
- **Reintentos**: Implementar lógica de reintentos para URLs fallidas
- **Timeouts**: Configurar tiempos de espera apropiados
- **Logging**: Registrar errores detallados para debugging

### 3. Escalabilidad
- **Concurrencia**: Limitar número de operaciones concurrentes
- **Colas**: Implementar sistema de colas para trabajos de scraping
- **Monitoreo**: Seguimiento de rendimiento y errores

## Seguridad

### 1. Validación de Entrada
- Validar URLs antes de procesarlas
- Limitar número de URLs por solicitud
- Sanitizar entrada de datos

### 2. Protección contra Abusos
- Implementar rate limiting
- Validar dominios permitidos
- Monitorear uso excesivo

### 3. Variables de Entorno
- Almacenar credenciales en variables de entorno
- No exponer claves en el código
- Rotar credenciales regularmente

## Despliegue en Netlify

### Configuración
```toml
[build]
  functions = "functions"
  publish = "out"

[functions]
  included_files = ["functions/**"]

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Variables de Entorno
- `SUPABASE_URL`: URL del proyecto Supabase
- `SUPABASE_KEY`: Clave de API de Supabase
- `PUPPETEER_EXECUTABLE_PATH`: Ruta al ejecutable de Chromium (si es necesario)

## Pruebas del Backend

### 1. Pruebas Unitarias
- Funciones de scraping individuales
- Manejo de selectores
- Procesamiento de texto

### 2. Pruebas de Integración
- Comunicación WebSocket
- Guardado en Supabase
- Proceso completo de scraping

### 3. Pruebas de Carga
- Múltiples URLs simultáneas
- Tiempos de respuesta
- Uso de recursos

Este documento proporciona una guía detallada para la implementación del backend de "Scraping Hub" utilizando Netlify Functions y Puppeteer.