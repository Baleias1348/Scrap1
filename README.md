# Preventi Flow: Gestión Inteligente de Documentos y Asistente Legal

## Visión
Preventi Flow es una plataforma conversacional que integra IA, cumplimiento normativo y gestión documental inteligente para organizaciones. Permite a usuarios y expertos:
- Solicitar, editar y guardar modelos de documentos legales y técnicos.
- Rellenar campos editables guiados por el agente dentro del chat, no en formularios tradicionales.
- Guardar, descargar o compartir documentos en la biblioteca de su organización.
- Calificar la calidad de las respuestas y modelos para mejorar el sistema.
- Integrarse con autenticación y panel organizacional Preventi Flow (https://preventiflow.com/).

## Plan de Trabajo Actual
1. **Modelos de Documento Inteligentes**
   - Creación y almacenamiento de plantillas base por expertos.
   - Librería centralizada con metadatos, campos editables y estilos.
2. **Edición Guiada en el Chat**
   - Renderizado de modelos con campos inline editables dentro de los globos del chat.
   - Guía paso a paso del agente para completar cada campo.
3. **Biblioteca Personal y Organizacional**
   - Guardado, descarga y compartición de documentos terminados.
   - Asociación a la organización del usuario autenticado.
4. **Calificación de Respuestas y Modelos**
   - Box de 1 a 5 estrellas al final de cada respuesta.
   - Registro en Supabase para análisis y mejora continua.
5. **Integración con Autenticación Preventi Flow**
   - Uso del sistema de login ya desplegado.
   - Acceso a funcionalidades avanzadas solo para usuarios autenticados.

## Normativa y Buenas Prácticas
- UX: Conversational UI según Nielsen Norman Group.
- Protección de datos: Ley 19.628 (Chile) y GDPR (UE).
- Seguridad: Control de acceso y autenticación robusta.

## Kit de Carpetas por Organización/Usuario (Gestión Documental)
Cada usuario puede crear múltiples organizaciones. Para cada organización se provisiona un kit de carpetas por defecto en el bucket de almacenamiento (Supabase). Estas carpetas base están protegidas contra eliminación:

- `01_reglamentos/`
- `02_afiliacion_y_seguros/`
- `03_comite_paritario/`
- `04_matriz_riesgos/`
- `05_capacitaciones/`
- `06_emergencias/`
- `07_accidentes_enfermedades/`
- `08_trabajadores/`
  - `08_trabajadores/trabajadores indirectos/` (protegida)
- `09_epp/`
- `10_fiscalizaciones/`
- `11_equipos_mantenimiento/`

Notas:
- En el futuro inmediato, las rutas se namespacen por organización y usuario, p. ej.: `/{org_id}/{user_id}/01_reglamentos/`.
- El endpoint de borrado bloquea la eliminación de estas rutas base. Si se usa namespacing, la verificación deberá considerar prefijos.

---

# Scraping Hub

Una aplicación web interna para gestionar, ejecutar y almacenar tareas de web scraping de forma centralizada.

## Descripción

"Scraping Hub" es una solución completa para equipos que necesitan realizar scraping de contenido web de manera organizada y eficiente. La aplicación permite configurar trabajos de scraping, monitorear su progreso en tiempo real, y almacenar los resultados para su posterior análisis.

## Características Principales

- 🚀 **Interfaz Moderna**: Construida con Next.js 14, TypeScript y Tailwind CSS
- 📊 **Dashboard**: Vista general de estadísticas y trabajos recientes
- 🕸️ **Scraper Avanzado**: Configuración flexible de trabajos de scraping
- 📈 **Progreso en Tiempo Real**: Actualizaciones instantáneas mediante WebSockets
- 💾 **Almacenamiento**: Guardado de resultados en Supabase (PostgreSQL)
- 🎨 **UI Elegante**: Componentes accesibles con shadcn/ui
- ⚡ **Estrategias de Scraping**: Múltiples enfoques para diferentes tipos de sitios
- 🛡️ **Seguridad**: Validación de entrada y manejo seguro de datos

## Tecnologías

### Frontend
- [Next.js 14](https://nextjs.org/) con App Router
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [React](https://reactjs.org/)

### Backend
- [Netlify Functions](https://www.netlify.com/products/functions/)
- [Node.js](https://nodejs.org/)
- [Puppeteer](https://pptr.dev/)
- [Socket.IO](https://socket.io/)

### Base de Datos
- [Supabase](https://supabase.io/)
- [PostgreSQL](https://www.postgresql.org/)

## Arquitectura

```
┌─────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   Frontend      │    │   WebSockets     │    │   Backend        │
│   (Next.js)     │◄──►│   (Tiempo Real)  │◄──►│   (Netlify)      │
│                 │    │                  │    │   (Puppeteer)    │
└─────────────────┘    └──────────────────┘    └──────────────────┘
                                │
                                ▼
                      ┌──────────────────┐
                      │   Base de Datos  │
                      │   (Supabase)     │
                      └──────────────────┘
```

## Requisitos del Sistema

- Node.js v18.17.0 o superior
- npm v9.0.0 o superior
- Git v2.13.0 o superior
- 8GB RAM mínimo (16GB recomendado)

## Instalación

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-organizacion/scraping-hub.git
cd scraping-hub
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
```bash
cp .env.example .env.local
```

Editar `.env.local` con tus credenciales de Supabase:

```bash
NEXT_PUBLIC_SUPABASE_URL=tu_project_url_de_supabase
NEXT_PUBLIC_SUPABASE_KEY=tu_anon_key_de_supabase
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:3001
```

### 4. Configurar Base de Datos
Ejecutar el siguiente SQL en tu proyecto de Supabase:

```sql
CREATE TABLE resultados_scraping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  estrategia_usada TEXT,
  urls_procesadas INTEGER,
  resultado_json JSONB
);

CREATE INDEX idx_resultados_scraping_created_at ON resultados_scraping(created_at);
CREATE INDEX idx_resultados_scraping_estrategia ON resultados_scraping(estrategia_usada);
```

## Ejecución

### Modo de Desarrollo
```bash
# Iniciar servidor de desarrollo
npm run dev

# La aplicación estará disponible en http://localhost:3000
```

### Modo de Producción
```bash
# Construir la aplicación
npm run build

# Iniciar servidor de producción
npm run start
```

## Estructura del Proyecto

```
scraping-hub/
├── app/                    # Páginas de Next.js App Router
│   ├── dashboard/          # Página Dashboard
│   ├── scraper/            # Página Scraper
│   └── resultados/         # Página Resultados
├── components/             # Componentes React
│   ├── ui/                 # Componentes shadcn/ui
│   ├── layout/             # Componentes de layout
│   ├── scraper/            # Componentes del scraper
│   └── results/            # Componentes de resultados
├── lib/                    # Librerías y utilidades
├── functions/              # Funciones Netlify
├── public/                 # Archivos estáticos
├── styles/                 # Estilos globales
├── types/                  # Tipos TypeScript
├── hooks/                  # Hooks personalizados
├── utils/                  # Funciones de utilidad
└── tests/                  # Pruebas
```

## Estrategias de Scraping

### Estrategia Universal
Para sitios web desconocidos, utiliza múltiples enfoques:
- Búsqueda por selectores CSS comunes
- Análisis de etiquetas semánticas
- Extracción del contenido del body
- Procesamiento de texto avanzado

### Estrategia LeyChile
Para bcn.cl/leychile con alta precisión:
- Manejo automático de banners de cookies
- Acceso a contenido en iframes
- Extracción específica de `div#textoNorma`
- Optimización para leyes chilenas

## Documentación Completa

Para una guía detallada de implementación, consulta los siguientes documentos:

1. [Plan de Desarrollo](SCRAPING_HUB_PLAN.md) - Arquitectura y planificación
2. [Implementación del Backend](SCRAPING_HUB_BACKEND.md) - Funciones y scraping
3. [Implementación del Frontend](SCRAPING_HUB_FRONTEND.md) - UI y componentes
4. [Integración del Sistema](SCRAPING_HUB_INTEGRACION.md) - Conexiones y seguridad
5. [Guía de Inicio](SCRAPING_HUB_INICIO.md) - Instalación y ejecución

## Pruebas

### Pruebas Unitarias
```bash
npm run test
```

### Pruebas de Integración
```bash
npm run test:integration
```

### Pruebas E2E
```bash
npm run test:e2e
```

## Despliegue

### Netlify
1. Conectar repositorio a Netlify
2. Configurar variables de entorno
3. El despliegue se realiza automáticamente en cada push

### Configuración Recomendada de Netlify
```toml
[build]
  command = "next build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

## Contribución

1. Fork del repositorio
2. Crear rama de feature (`git checkout -b feature/NuevaFuncionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/NuevaFuncionalidad`)
5. Abrir Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## Soporte

Para reportar problemas o solicitar nuevas funcionalidades, por favor abre un issue en el repositorio.

## Desarrollado Por

**Tu Nombre/Organización** - [tu-sitio-web.com](https://tu-sitio-web.com)

## Agradecimientos

- [Next.js Team](https://vercel.com/) por el excelente framework
- [shadcn](https://twitter.com/shadcn) por los componentes UI
- [Supabase Team](https://supabase.io/) por la plataforma de backend
- [Puppeteer Team](https://pptr.dev/) por la librería de automatización
