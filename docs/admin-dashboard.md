# Dashboard Administrativo - Documentación

## 📋 Índice

1. [Introducción](#introducción)
2. [Acceso al Dashboard](#acceso-al-dashboard)
3. [Secciones Principales](#secciones-principales)
4. [Gestión de Usuarios](#gestión-de-usuarios)
5. [Base de Datos](#base-de-datos)
6. [Configuración](#configuración)
7. [Scripts Automatizados](#scripts-automatizados)
8. [APIs Administrativas](#apis-administrativas)
9. [Seguridad](#seguridad)
10. [Mantenimiento](#mantenimiento)

## 🎯 Introducción

El Dashboard Administrativo es una herramienta centralizada para la gestión completa del sistema Preventi Flow. Proporciona:

- **Gestión de usuarios** con detección automática de problemas
- **Mantenimiento de base de datos** con scripts automatizados
- **Configuración del sistema** con variables de entorno
- **Estadísticas en tiempo real** del estado del sistema
- **Herramientas de backup** y restauración

## 🔐 Acceso al Dashboard

### URL de Acceso
```
http://localhost:3005/admin
```

### Desde la Página Principal
- Botón "Admin" en el header (color naranja)
- Acceso directo desde `/admin`

### Requisitos
- Servidor de desarrollo ejecutándose (`npm run dev`)
- Variables de entorno configuradas correctamente
- `SUPABASE_SERVICE_ROLE_KEY` para operaciones administrativas

## 🏠 Secciones Principales

### 1. Resumen General (`/admin`)
- **Estadísticas del Sistema**: Total de usuarios, usuarios activos, problemas detectados
- **Estado de la Base de Datos**: Salud, tamaño, última limpieza
- **Acciones Rápidas**: Enlaces directos a herramientas principales
- **Actividad Reciente**: Log de eventos y operaciones
- **Estado del Sistema**: Conexiones, APIs, servicios

### 2. Gestión de Usuarios (`/admin/users`)
- **Búsqueda de Usuarios**: Por email con verificación de estado
- **Detección Automática**: Encuentra usuarios problemáticos
- **Limpieza de Usuarios**: Eliminación segura y completa
- **Acciones Rápidas**: Herramientas de gestión masiva

### 3. Base de Datos (`/admin/database`)
- **Estadísticas de BD**: Tablas, registros, tamaño, conexiones
- **Scripts de Mantenimiento**: Limpieza, optimización, análisis
- **Backup y Restauración**: Gestión de respaldos
- **Estado de Salud**: Verificaciones de integridad

### 4. Configuración (`/admin/settings`)
- **Configuración de Supabase**: URLs, claves, autenticación
- **Variables del Sistema**: Puerto, entorno, debug
- **Gestión de Usuarios**: Configuraciones de limpieza automática
- **Variables de Entorno**: Visualización y gestión

## 👥 Gestión de Usuarios

### Problemas Comunes Detectados

#### Estado Inconsistente
- Usuario existe en `auth.users` pero no puede autenticarse
- Error: "User already registered" + "Invalid login credentials"

#### Detección Automática
```bash
# El sistema detecta automáticamente:
- Usuarios que no pueden registrarse
- Usuarios que no pueden hacer login
- Estados inconsistentes en Supabase
```

### Herramientas Disponibles

#### 1. Búsqueda Manual
```
1. Ingresa email del usuario
2. Verifica estado actual
3. Ejecuta limpieza si es necesario
4. Confirma eliminación
```

#### 2. Detección Automática
```
1. Ejecuta "Detección Automática"
2. Revisa lista de usuarios problemáticos
3. Aplica limpieza automática
4. Verifica resultados
```

#### 3. API Directa
```bash
# Verificar usuario
curl -X POST http://localhost:3005/api/admin/cleanup-users \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@ejemplo.com","action":"check"}'

# Limpiar usuario
curl -X POST http://localhost:3005/api/admin/cleanup-users \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@ejemplo.com","action":"cleanup"}'
```

### Proceso de Limpieza Segura

1. **Verificación Previa**
   - Confirma existencia del usuario
   - Muestra datos antes de eliminar

2. **Eliminación Completa**
   - Remueve de `auth.users`
   - Limpia tablas relacionadas (`organizaciones`, `interacciones`)
   - Elimina identidades y sesiones

3. **Verificación Post-Limpieza**
   - Confirma eliminación completa
   - Verifica que el usuario puede registrarse nuevamente

## 🗄️ Base de Datos

### Scripts de Mantenimiento

#### Disponibles en el Dashboard
- **Limpieza de Usuarios**: Detecta y corrige usuarios problemáticos
- **Optimizar BD**: Optimiza índices y rendimiento
- **Crear Respaldo**: Genera backup completo
- **Analizar Tablas**: Análisis detallado de estructura
- **Vacuum Database**: Recupera espacio en disco
- **Actualizar Stats**: Actualiza estadísticas de consultas

#### Script de Backup Automático
```bash
# Backup manual
./scripts/backup-db.sh manual

# Backup diario (mantiene 7 días)
./scripts/backup-db.sh daily

# Backup semanal (mantiene 4 semanas)
./scripts/backup-db.sh weekly
```

### Configuración de Backup

#### Variables Requeridas
```bash
# En .env.local
SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
```

#### Programación Automática (Cron)
```bash
# Backup diario a las 2:00 AM
0 2 * * * /path/to/scripts/backup-db.sh daily

# Backup semanal los domingos a las 3:00 AM
0 3 * * 0 /path/to/scripts/backup-db.sh weekly
```

## ⚙️ Configuración

### Variables de Entorno Críticas

#### Supabase
```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
```

#### Sistema
```bash
NODE_ENV=development
DEBUG=true
```

### Configuraciones de Seguridad
- Las claves se muestran parcialmente enmascaradas
- Botones de mostrar/ocultar para claves sensibles
- Validación de formato y conexión

## 🤖 Scripts Automatizados

### Script de Detección Automática
```bash
# Ejecutar detección completa
./scripts/auto-cleanup.sh

# Resultados típicos:
- Usuarios problemáticos detectados: 2
- Usuarios limpiados: 2
- Usuarios verificados: 2
```

### Script de Backup
```bash
# Crear backup manual
./scripts/backup-db.sh manual

# Resultados:
- Archivo: backup_manual_20250825_143022.sql.gz
- Tamaño: 2.3 MB
- Estado: ✅ Íntegro y válido
```

## 🔌 APIs Administrativas

### Endpoints Disponibles

#### 1. Estadísticas del Sistema
```http
GET /api/admin/stats
```
**Respuesta:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 156,
      "active": 142,
      "problematic": 0
    },
    "database": {
      "size": "45.2 MB",
      "health": "healthy"
    }
  }
}
```

#### 2. Gestión de Usuarios
```http
POST /api/admin/cleanup-users
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "action": "check" | "cleanup"
}
```

**Respuesta para `check`:**
```json
{
  "exists": true,
  "user": {
    "id": "uuid",
    "email": "usuario@ejemplo.com",
    "created_at": "2025-08-25T12:00:00Z"
  }
}
```

**Respuesta para `cleanup`:**
```json
{
  "message": "Usuario eliminado completamente",
  "deletedUserId": "uuid"
}
```

## 🔒 Seguridad

### Autenticación y Autorización
- **Service Role Key**: Requerida para operaciones administrativas
- **Validación de Entrada**: Todos los inputs son validados
- **Logging Completo**: Todas las operaciones se registran

### Mejores Prácticas
1. **Backups Regulares**: Antes de cualquier operación de limpieza
2. **Verificación Doble**: Confirmar antes de eliminar usuarios
3. **Logging**: Mantener logs de todas las operaciones
4. **Acceso Restringido**: Solo administradores deben acceder

### Variables Sensibles
- Las claves se almacenan de forma segura en `.env.local`
- Se muestran parcialmente enmascaradas en la UI
- No se exponen en logs o respuestas de API

## 🔧 Mantenimiento

### Tareas Diarias
- [ ] Revisar estadísticas del sistema
- [ ] Verificar usuarios problemáticos
- [ ] Comprobar estado de la base de datos

### Tareas Semanales
- [ ] Ejecutar detección automática completa
- [ ] Crear backup manual
- [ ] Revisar logs de errores
- [ ] Optimizar base de datos

### Tareas Mensuales
- [ ] Análisis completo de tablas
- [ ] Limpieza de backups antiguos
- [ ] Revisión de configuraciones
- [ ] Actualización de documentación

### Indicadores de Problemas
- 🚨 **Usuarios problemáticos > 0**: Ejecutar limpieza inmediata
- ⚠️ **Base de datos > 100MB**: Considerar optimización
- 🔴 **Conexiones activas > 10**: Revisar eficiencia de consultas
- 📊 **Crecimiento anómalo**: Investigar causas

## 📞 Soporte

### En Caso de Problemas
1. Revisar logs del servidor (`npm run dev`)
2. Verificar variables de entorno
3. Comprobar conectividad con Supabase
4. Ejecutar scripts de diagnóstico

### Contacto
- Dashboard: `http://localhost:3005/admin`
- Logs: Terminal donde se ejecuta `npm run dev`
- Configuración: `/admin/settings`

---

**Última actualización**: 25 de agosto de 2025  
**Versión**: 1.0.0