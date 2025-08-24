# Checklist de TODOs - Gestión Documental y Autenticación

Este documento registra la lista de chequeo (checklist) para próximas mejoras relacionadas con autenticación, almacenamiento por usuario y funcionalidades de Documentación.

## Autenticación y almacenamiento por usuario
- [ ] Namespace por usuario en Storage: `prevencion2/{user_id}/{carpeta}/archivo.ext`.
- [ ] Ajustar endpoints server para forzar prefijo por usuario (no confiar en `path` del cliente):
  - [ ] `app/api/gestion-documental/upload/route.ts`
  - [ ] `app/api/gestion-documental/create-file/route.ts`
  - [ ] `app/api/gestion-documental/mkdir/route.ts`
  - [ ] `app/api/plantillas/tree/route.ts`
  - [ ] `app/api/plantillas/file/route.ts`
- [ ] Feature-flag para activar prefijo por usuario cuando haya login (p.ej. `ENABLE_PER_USER_STORAGE=true`).
- [ ] Obtener `user_id` desde sesión (Supabase Auth) en endpoints.
- [ ] Políticas de seguridad en `storage.objects` (RLS):
  - [ ] Permitir leer/escribir solo cuando `bucket_id = 'prevencion2'` y `name LIKE auth.uid() || '/%'`.
  - [ ] Verificar acceso con Signed URLs (expiración y alcance).

## Migración y estructura inicial
- [ ] Bootstrap por usuario: crear estructura base dentro de `/{user_id}/...`.
- [ ] Migración (si ya hay archivos sin prefijo): script de realojar a `/{user_id}/...` o estrategia de compatibilidad.
- [ ] Señalizar en UI si la carpeta ya está migrada al esquema por usuario.

## UI/UX
- [ ] Mostrar indicador del espacio de trabajo actual (organización/usuario) en la cabecera de Documentación.
- [ ] Soporte de vista “split” para edición de `.md` (editor + vista Markdown simultánea).
- [ ] Iconos por tipo de archivo y ordenamiento/búsqueda en lista de archivos.
- [ ] Validación de nombres (carpetas/archivos) y modal de creación (reemplazar `prompt`).
- [ ] Analizar conveniencia de edición de Excel/otros: opciones y trade-offs.
  - [ ] In-app (recomendado): `xlsx` + AG Grid/Handsontable para edición; sidecar de acciones con asistente AI (limpieza, fórmulas, pivotes, transformación de columnas).
  - [ ] Google Sheets: integración OAuth, conversión en Drive; pro: colaboración; contra: complejidad OAuth, privacidad, lock-in.
  - [ ] Airtable: UI excelente; contra: límites API, costos, lock-in; AI asistido más complejo.
  - [ ] Plan por fases: 1) visor solo lectura con `xlsx` (hecho), 2) edición en-app con grid + AI, 3) export/import a `.xlsx`/`.csv`.

## Seguridad y operativa
- [ ] Limitar tipos/tamaño de archivos en upload; mostrar error claro en UI.
- [ ] Sanitizar rutas recibidas del cliente (evitar path traversal).
- [ ] Registrar auditoría básica (quién sube/edita/borra, path y timestamp).
- [ ] Manejo de errores y reintentos con feedback en UI.

## Rendimiento y costos
- [ ] Ajustar expiración de URLs firmadas según uso (previsualización vs descarga).
- [ ] Cache de listados por carpeta por corto tiempo (evitar llamadas redundantes).

## Tests
- [ ] Tests de endpoints (unit/integration) para rutas con prefijo por usuario.
- [ ] Test de UI: flujos de crear carpeta/archivo, subir archivo y previsualizar/editar.

---

Última actualización: mantener este checklist vivo conforme avancemos con autenticación y nuevas funciones.
