# Módulo Plantillas y Buenas Prácticas

Este documento describe la implementación del módulo de Plantillas y Buenas Prácticas integrado a la Gestión Documental de Preventi Flow.

- Bucket de almacenamiento: `prevencion2`
- Carpeta raíz de plantillas: `12_plantillas/`
- APIs: bootstrap, árbol, file (signed URL), usar plantilla, personalización con AI
- UI: página de navegación y acciones en `dashboard/plantillas`

## Estructura de carpetas en Storage

- `12_plantillas/`
  - Subcarpetas que reflejan la estructura real del usuario (ej.: `01_reglamentos/`, `05_capacitaciones/`, etc.)
  - Cada carpeta inicializada con `.keep`

Endpoint para crear estructura (idempotente):
- `POST /api/plantillas/bootstrap`
  - Archivo: `app/api/plantillas/bootstrap/route.ts`

## Endpoints

1) Árbol de plantillas
- `GET /api/plantillas/tree?path=12_plantillas/...&includeKeeps=false`
- Devuelve carpetas y archivos con metadatos para navegación.
- Archivo: `app/api/plantillas/tree/route.ts`

2) Previsualización / Descarga (Signed URL)
- `GET /api/plantillas/file?path=12_plantillas/.../archivo.ext&expiresIn=600`
- Responde con `signedUrl` seguro para previsualización/descarga.
- Archivo: `app/api/plantillas/file/route.ts`

3) Usar plantilla (copiar a empresa / trabajador)
- `POST /api/plantillas/use`
- Copia el archivo desde `12_plantillas/...` a:
  - `08_trabajadores/...` (cuando se usa para un trabajador)
  - o a una ruta explícita válida (`08_trabajadores/` o `12_plantillas/`)
- Si llega `id_trabajador` + `tipo_documento` y el destino cae bajo `08_trabajadores/`, se inserta una fila en `documentos_sst` con versionado automático y se opcionalmente guarda sidecar `.meta.json`.
- Archivo: `app/api/plantillas/use/route.ts`

4) Personalizar con AI
- `POST /api/plantillas/personalizar`
- Usa `utils/deepseek.ts#getDeepseekChatCompletion()` para adaptar el contenido según rubro/tamaño/región y requerimientos extra.
- Acepta `template_path` (txt/md) o `base_text`.
- Devuelve `{ adapted_text, recommendations }` y permite `save` como documento del trabajador o como plantilla interna, con sidecar `.meta.json`.
- Archivo: `app/api/plantillas/personalizar/route.ts`

## Integración AI (Deepseek)

- Archivo: `utils/deepseek.ts`
  - `getDeepseekChatCompletion(prompt)` con soporte para parámetros configurables por env vars.
- Variables de entorno relevantes:
  - `SUPABASE_URL`, `SUPABASE_KEY` (service role)
  - `DEEPSEEK_API_KEY`
  - `DEEPSEEK_CHAT_URL` (default `https://api.deepseek.com/v1/chat/completions`)
  - `DEEPSEEK_CHAT_MODEL` (default `deepseek-chat`)
  - Opcionales: `DEEPSEEK_TEMPERATURE`, `DEEPSEEK_TOP_P`, `DEEPSEEK_MAX_TOKENS`, etc.

## Seguridad y políticas de Storage

- Bucket `prevencion2` con RLS:
  - Lectura para `authenticated`.
  - Escritura privilegiada para `service_role` (las rutas API usan `SUPABASE_KEY`).

## UI del Módulo

- Página: `app/dashboard/plantillas/page.tsx`
  - Árbol con breadcrumbs usando `GET /api/plantillas/tree`
  - Previsualización con `GET /api/plantillas/file`
  - Acciones:
    - "Personalizar con AI" → `POST /api/plantillas/personalizar`
    - "Guardar en mi empresa" → `POST /api/plantillas/use`

- Integración en sidebar del dashboard
  - Archivo: `app/dashboard/page.tsx`
  - Item agregado: "Plantillas y Buenas Prácticas" → `/dashboard/plantillas` (tras Reports)

- Cross-link en Documentos Modelo
  - Archivo: `app/dashboard/documentos-modelo/page.tsx`
  - Botón en header: "Plantillas y Buenas Prácticas →"

## Flujo típico

1. Inicializar estructura (una vez):
   - `POST /api/plantillas/bootstrap`
2. Navegar y previsualizar plantillas:
   - `GET /api/plantillas/tree?path=12_plantillas/...`
   - `GET /api/plantillas/file?path=12_plantillas/.../archivo.ext`
3. Guardar plantilla para un trabajador (versión y sidecar):
   - `POST /api/plantillas/use` con `{ template_path, id_trabajador, tipo_documento, metadatos? }`
4. Personalizar con AI y guardar:
   - `POST /api/plantillas/personalizar` con `{ template_path|base_text, empresa:{rubro,tamano,region}, extra_requisitos?, save?, id_trabajador?, tipo_documento?, metadatos? }`

## Próximos pasos sugeridos

- Cargar plantillas reales (docx/pdf/xlsx) y sidecars de ejemplo en `12_plantillas/`.
- Esquema uniforme de metadatos para sidecars y visualización en UI.
- Tutorial in-app (onboarding) para uso de plantillas.
