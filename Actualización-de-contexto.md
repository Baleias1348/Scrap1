# Actualización de Contexto Preventi Flow

## 1. Autenticación del Usuario

- **Producción:**  
  - El usuario accede al portal principal en https://preventiflow.com/
  - El módulo de autenticación está implementado en HTML + JS, usando Supabase y Google Auth.
  - Páginas clave: `index.html`, `login.html`, `register.html`, `privacidad.html`, `terminos.html` (repositorio: `/Users/hernanherreraacevedo/CascadeProjects/prevencion-2`).
  - Tras autenticarse, el usuario es redirigido al dashboard de la app en el subdominio: https://app.preventiflow.com/
  - El dashboard principal (en construcción) será `dashboard-index.html` y será el index de ese subdominio.
  - Todos los datos de autenticación se inyectan a la app.
  - El menú de usuario debe incluir: cuenta, perfil y logout para cierre seguro de sesión.

- **Desarrollo:**  
  - Se usará una página de login local simple (usuario/contraseña) que almacene usuarios en Supabase Auth, sin Google.
  - Si es necesario un token de sesión, se debe informar a los desarrolladores para crear el flujo adecuado.

---

## 2. Gestión de Organizaciones

- Al iniciar sesión, el usuario debe crear una organización (puede tener hasta 5).
- Si tiene varias, la sesión inicia en la organización por defecto o la más antigua.
- Puede cambiar de organización desde el menú de configuración de cuenta.
- **Datos requeridos para la organización:**
  - Nombre (obligatorio)
  - Opcionales: Razón social, RUT, número de trabajadores, rubro, actividad económica, dirección.
  - Para actividad económica: se debe sugerir códigos desde la tabla `codigos_actividad_economica_sii_chile` en Supabase, usando búsqueda inteligente según el rubro ingresado. Esta tabla debe poblarse desde `/Users/hernanherreraacevedo/CascadeProjects/Scrap1/codigos_actividad_economica_sii_chile.csv` si aún no está llena.
- Una vez creada la organización, el usuario accede a la app.

---

## 3. Inicio de Interacción y Componentes Principales

- El usuario ve el dashboard principal (`dashboard-index.html`), que integra:
  - **ChatComponent:** interfaz de chat con la agente AI.
  - **Sidebar/TopNav:** navegación a secciones como “Resultados”, “Documentos Modelo”, “Cuenta”, etc.
  - **Menú de usuario:** acceso a cuenta, perfil, logout y cambio de organización.
- **Nota:**  
  - Toda funcionalidad de scraping y cualquier mención a ella debe estar excluida en producción (solo disponible en desarrollo para el equipo técnico).

---

## 4. Interacción con la Agente AI

- El usuario interactúa con la agente AI a través del chat:
  - Puede pedir modelos de documentos, consultar normativas, solicitar recomendaciones, etc.
- El `ChatComponent` envía la consulta al endpoint `/api/ask`.
- El backend construye el prompt con la constitución del agente y la pregunta del usuario.
- **Estrategia actual:**  
  - Se utiliza la estrategia “TOP OPEN” (no RAG): el agente responde usando el conocimiento abierto del modelo (ej: GPT-5).
  - Todas las respuestas deben ser profesionales, cálidas, alineadas a normativa y buenas prácticas.
  - Si se solicita un documento, la respuesta es un modelo profesional en Markdown enriquecido, con campos editables y disclaimers.
  - El agente siempre ofrece ayuda adicional y personalización.
- Todas las interacciones quedan registradas en Supabase (`interacciones`).  
- Los documentos generados quedan en la tabla `modelos_documento`.

---

## 5. Visualización y Acciones del Usuario

- El usuario puede:
  - Leer la respuesta AI en el chat.
  - Visualizar documentos generados en formato enriquecido.
  - Descargar documentos en Word o PDF (botones aparecen cuando corresponde).
  - Calificar la respuesta de la AI (`RatingBox`).
  - Validar, editar o solicitar validación experta de una respuesta/documento (si tiene permisos).

---

## 6. Gestión de Interacciones y Supabase

- **Cada interacción** (pregunta/respuesta) se almacena en la tabla `interacciones`:
  - Se guarda texto, usuario, fecha, validación, categoría, etc.
  - Permite trazabilidad, auditoría, entrenamiento y personalización.
- **Las sesiones o historiales de chat** pueden asociarse a un usuario, permitiendo continuidad y contexto personalizado.

---

## 7. Documentos Generados por la IA

- **Almacenamiento:**  
  - Cada documento generado por la AI se guarda en Supabase, tabla `modelos_documento`.
  - Se registra: nombre, descripción, campos editables, contenido base, versión, validador, etc.
- **Acciones del usuario:**  
  - Visualizar, descargar, editar, solicitar validación experta, compartir o reutilizar documentos.
- **Objetivo:**  
  - Centralización de conocimiento, control de versiones y validación, mejora continua.

---

## 8. Lógica de almacenamiento y metadatos de documentos

### Buckets y rutas en Supabase Storage
- **Bucket principal:** `prevencion2` (privado)
- **Rutas recomendadas:**
  - Documentos generales: `prevencion2/modelos_generales/<nombre_del_documento>.<extensión>`
  - Documentos de usuario: `prevencion2/usuarios/<user_id>/documentos/<nombre_del_documento>.<extensión>`
  - Documentos de organización: `prevencion2/organizaciones/<org_id>/documentos/<nombre_del_documento>.<extensión>`

### Tablas de metadatos
- **documentos_usuario**: Metadatos de archivos privados de cada usuario (id, user_id, nombre, descripción, tipo, url_storage, metadata, created_at).
- **documentos_organizacion**: Metadatos de archivos de cada organización (id, organizacion_id, nombre, descripción, tipo, url_storage, metadata, created_at).
- **documentos_generales**: Metadatos de documentos modelo generales (id, nombre, descripción, tipo, url_storage, metadata, created_at).

### Seguridad y acceso
- El bucket es privado. El acceso a archivos se realiza mediante Signed URLs generados por el backend/SDK de Supabase.
- Las policies de Storage y RLS garantizan que solo usuarios autenticados accedan a sus propios documentos o a los de su organización.
- La IA puede sugerir, buscar o mostrar documentos generales y, si corresponde, documentos de usuario/organización según permisos.

### Lógica de subida y consulta
- Al subir un archivo, se almacena en la ruta correspondiente y se registra su metadata en la tabla respectiva.
- Para mostrar o descargar, se consulta la metadata y se genera un Signed URL temporal.
- Los documentos generales pueden ser accedidos por todos los usuarios (según permisos definidos).

---

## 8. Ciclo de Mejora y Validación

- Las respuestas y documentos pueden ser validados por expertos.
- El usuario o experto puede editar, validar o rechazar respuestas/documentos.
- El sistema aprende de las validaciones y calificaciones, mejorando la calidad de la AI y los modelos entregados.
- Se crearán tablas de documentos e interacciones destacadas, disponibles en el dashboard de expertos (`/app/expert-panel`).
- El objetivo es construir un corpus interno robusto para una futura estrategia RAG.

---

## 9. Funcionalidades excluidas para el usuario final

- **Scraping:**  
  - Toda funcionalidad relacionada con scraping, jobs o helpers asociados está excluida para el usuario final en producción.
  - Solo estará disponible para desarrolladores en entornos de desarrollo.

---

## 10. Resumen de objetivos de cada parte

- **Almacenar interacciones:** Trazabilidad, auditoría, personalización, entrenamiento y mejora continua.
- **Almacenar documentos:** Centralización, control de versiones, validación, disponibilidad y mejora constante.
- **Componentes clave:** ChatComponent, RatingBox, ExportButtons, Dashboard, DocumentosModeloDashboard, ExpertPanel.
- **Funcionalidades presentes:** Chat AI, generación y gestión de documentos, exportación, validación, calificación, historial, navegación centralizada, gestión de organizaciones y usuarios.

---

# Próximas tareas inmediatas (ordenadas por prioridad)

1. **Poblar la tabla `codigos_actividad_economica_sii_chile` en Supabase**  
   - Importar los datos desde `/Users/hernanherreraacevedo/CascadeProjects/Scrap1/codigos_actividad_economica_sii_chile.csv`.
   - Verificar que la tabla esté correctamente poblada y solo actualizar si está vacía.

2. **Desarrollar el formulario de creación de organización**  
   - Implementar todos los campos requeridos.
   - Integrar búsqueda inteligente de actividad económica usando la tabla importada.
   - Registrar la organización en la tabla `organizaciones` de Supabase.
   - Permitir gestión de múltiples organizaciones por usuario.

3. **Integrar el Chat de la Agente AI en `dashboard-index.html`**  
   - Conectar el componente de chat con el backend `/api/ask`.
   - Mostrar respuestas enriquecidas y botones de exportación cuando corresponda.

4. **Crear una página simple de login local para desarrollo**  
   - Permitir login con usuario/contraseña y almacenar en Supabase Auth.
   - Inyectar los datos de usuario a la app tras autenticación.

5. **Probar y validar los prompts preconfigurados del agente AI**  
   - Ajustar los prompts según feedback y resultados de pruebas.
   - Asegurar robustez y utilidad de las respuestas.

6. **Probar los flujos completos de generación y gestión de documentos**  
   - Validar almacenamiento, visualización, descarga, edición y validación experta de documentos.

7. **Desplegar todo Scrap1 en Netlify y crear el subdominio `app.preventiflow.com`**  
   - Asegurar que el dashboard y todas las funcionalidades estén accesibles tras login.

8. **Vincular la app al módulo de autenticación principal**  
   - Garantizar que tras login en https://preventiflow.com/ el usuario es redirigido correctamente al dashboard con sus datos de sesión.

9. **Probar y validar el funcionamiento y el flujo completo en producción**  
   - Simular el flujo real de usuario desde login hasta generación y gestión de documentos.

10. **(A futuro) Completar y poblar las tablas de interacciones y documentos destacados**  
    - Implementar el dashboard de expertos para revisión y curación de contenido.

---

# Índice de archivos y explicación de funciones

## Módulo de autenticación (`/Users/hernanherreraacevedo/CascadeProjects/prevencion-2`)

- **index.html**  
  Página principal del portal Preventi Flow. Punto de entrada para usuarios nuevos y existentes. Desde aquí se navega hacia login, registro y otras páginas legales.

- **login.html**  
  Página de inicio de sesión para usuarios ya registrados. Gestiona el proceso de autenticación usando Supabase y Google Auth. Es el punto de entrada para acceder a la app principal tras la autenticación.

- **register.html**  
  Página de registro de nuevos usuarios. Permite crear cuentas mediante Supabase y, opcionalmente, Google Auth. Es fundamental para el onboarding de nuevos usuarios.

- **privacidad.html**  
  Página de política de privacidad. Informa a los usuarios sobre el tratamiento de sus datos personales y el cumplimiento normativo.

- **terminos.html**  
  Página de términos y condiciones de uso. Define el marco legal y las reglas de uso de la plataforma Preventi Flow.

- **dashboard.html / dashboard_legacy.html**  
  Dashboards experimentales o prototipos. No son el dashboard principal de la app, pero pueden contener lógica útil para futuras integraciones.

- **firma_epp.html**  
  Página específica para la gestión o firma de Equipos de Protección Personal (EPP). No forma parte del flujo estándar de autenticación, pero puede estar relacionada con módulos adicionales.

- **prueba7.html**  
  Archivo de pruebas/desarrollo. No forma parte del flujo de autenticación, pero puede contener ejemplos o experimentos útiles para desarrolladores.

**Relación:**  
Estos archivos gestionan el acceso y registro de usuarios, así como el cumplimiento legal. Tras autenticación, el usuario es redirigido e inyectado en la app principal, que reside en otro repositorio/subdominio.

---

## Raíz del proyecto Scrap1

- **README.md**  
  Descripción general del proyecto, visión, tecnologías y guía de uso. Relaciona todos los módulos y es el punto de partida para nuevos desarrolladores.

- **ESTRUCTURA_PROYECTO.md**  
  Explica la estructura de carpetas y archivos, arquitectura y convenciones. Es clave para entender cómo se organiza el código y cómo se conectan los módulos.

- **PATRONES_DISENO.md**  
  Documenta los patrones de diseño aplicados (SOLID, arquitectura por capas, etc.), asegurando mantenibilidad y escalabilidad.

- **SCRAPING_HUB_RESUMEN.md / SCRAPING_HUB_PLAN.md / SCRAPING_HUB_BACKEND.md / SCRAPING_HUB_FRONTEND.md / SCRAPING_HUB_INICIO.md / SCRAPING_HUB_INTEGRACION.md**  
  Documentos técnicos que profundizan en la arquitectura, planificación, frontend, backend, integración y puesta en marcha. Sirven de referencia para desarrollo, QA y onboarding.

- **NETLIFY_CONFIG.md**  
  Guía de despliegue y configuración en Netlify. Relaciona la app con el entorno de hosting y variables de entorno.

- **RENDIMIENTO_OPTIMIZACION.md / SEGURIDAD_IMPLEMENTADA.md**  
  Estrategias de optimización y seguridad implementadas en el sistema. Relacionan decisiones de código con requisitos de calidad y cumplimiento.

- **PRUEBAS_IMPLEMENTADAS.md**  
  Estrategia y cobertura de pruebas. Relaciona los componentes clave con los tests automatizados y manuales.

---

## Carpeta `/src/lib/`

- **supabase.ts**  
  Inicializa y exporta el cliente Supabase para toda la app. Es el punto central de comunicación con la base de datos y autenticación.

- **utils.ts**  
  Funciones utilitarias generales usadas en varios módulos de la app.

---

## Carpeta `/app/` (Next.js App Directory)

- **globals.css**  
  Estilos globales para toda la aplicación.

- **(routes)/dashboard/page.tsx**  
  Página principal del dashboard donde el usuario interactúa tras autenticarse. Integra el ChatComponent y la navegación.

- **components/ChatComponent.tsx**  
  Componente de chat principal. Gestiona la interacción usuario-agente AI, visualización de mensajes, exportación y calificación.

- **components/MarkdownRenderer.tsx**  
  Renderiza respuestas y documentos en formato Markdown enriquecido.

- **components/ExportButtons.tsx**  
  Permite descargar documentos generados en Word o PDF.

- **components/RatingBox.tsx**  
  Permite al usuario calificar la respuesta de la AI, facilitando la mejora continua.

- **api/ask/route.ts**  
  Endpoint principal para la interacción con la agente AI. Construye el prompt, gestiona el flujo de preguntas/respuestas y registra en Supabase.

- **api/interacciones/route.ts**  
  Endpoint para gestionar el registro, edición y validación de interacciones (preguntas/respuestas) en la base de datos.

- **api/documentos_modelo/route.ts**  
  Endpoint para crear, listar y gestionar documentos modelo generados por la AI.

- **api/modelos/route.ts**  
  Endpoint para filtrar, editar y validar modelos de documentos basados en interacciones.

- **utils/markdownToHtml.ts**  
  Utilidad para convertir Markdown a HTML, usada para mostrar respuestas y documentos enriquecidos.

---

## Otros archivos clave

- **codigos_actividad_economica_sii_chile.csv**  
  Fuente de datos para poblar la tabla de actividades económicas en Supabase. Es fundamental para la creación inteligente de organizaciones.

- **supabase_create_economic_codes_table.sql**  
  Script SQL para la creación de la tabla de actividades económicas en Supabase.

- **dashboard-index.html**  
  Dashboard principal de usuario (en construcción), será el landing page tras login y el núcleo de la experiencia de usuario.

---

## Relación y flujo entre archivos

- El usuario inicia sesión (módulo externo en https://preventiflow.com/), luego es redirigido a `dashboard-index.html` donde interactúa con la app.
- El ChatComponent conecta con `api/ask/route.ts`, que utiliza `supabase.ts` para registrar interacciones y documentos.
- Las respuestas y documentos se muestran usando `MarkdownRenderer.tsx` y pueden ser exportados con `ExportButtons.tsx`.
- La gestión de organizaciones y actividades económicas se apoya en los datos de `codigos_actividad_economica_sii_chile.csv` y la integración con Supabase.
- La validación y mejora continua se realiza mediante los endpoints de interacciones y documentos, y la retroalimentación del usuario a través de `RatingBox.tsx`.
- Toda la lógica de negocio, integración y orquestación está documentada en los archivos `.md` y centralizada en los endpoints de `/app/api/`.

---

**Fin del informe actualizado.**
¿Quieres que lo guarde ya como `Actualización-de-contexto.md` en la carpeta Scrap1 o deseas algún ajuste final?
