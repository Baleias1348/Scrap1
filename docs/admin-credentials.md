# Acceso Administrativo - Credenciales y Seguridad

## 🔐 Credenciales de Acceso

### Super Administrador
- **Email:** `admin@preventiflow.com`
- **Contraseña:** `AdminPreventi2025!`
- **Rol:** `super_admin`
- **Permisos:** Acceso completo a todas las funciones

### Administrador Principal (Tu cuenta)
- **Email:** `hernan@preventiflow.com`
- **Contraseña:** `HernanAdmin2025!`
- **Rol:** `admin`
- **Permisos:** Acceso a funciones administrativas estándar

## 🌐 URLs de Acceso

### Página de Login
```
http://localhost:3005/admin/login
```

### Dashboard Principal
```
http://localhost:3005/admin
```
*Nota: Redirige automáticamente al login si no estás autenticado*

## 🔧 Cómo Funciona la Autenticación

### 1. Proceso de Login
1. Accede a `/admin/login`
2. Ingresa email y contraseña
3. El sistema verifica las credenciales
4. Se crea una cookie de sesión válida por 24 horas
5. Redirección automática al dashboard

### 2. Protección de Rutas
- **Rutas protegidas:** Todas las que empiecen con `/admin` (excepto login)
- **APIs protegidas:** Todas las que empiecen con `/api/admin` (excepto auth)
- **Middleware automático:** Verifica la cookie en cada request

### 3. Expiración de Sesión
- **Duración:** 24 horas desde el login
- **Renovación:** Automática en cada request válido
- **Logout:** Manual o automático al expirar

## 🛡️ Características de Seguridad

### Protección Implementada
- ✅ **Autenticación obligatoria** para todas las rutas admin
- ✅ **Cookies HTTPOnly** para mayor seguridad
- ✅ **Expiración automática** de sesiones
- ✅ **Verificación de integridad** del token
- ✅ **Redirección automática** a login si no autenticado

### Información Mostrada en el Dashboard
- Email del usuario logueado
- Rol (Super Admin / Admin)
- Botón de logout
- Tiempo de sesión

## 🔄 Gestión de Sesiones

### Cerrar Sesión
- Click en el botón de logout (icono de salida)
- Eliminación automática de la cookie
- Redirección al login

### Cambio de Credenciales
Para cambiar las credenciales, edita el archivo:
```
/app/api/admin/auth/route.ts
```

Actualiza el array `ADMIN_USERS`:
```typescript
const ADMIN_USERS: AdminUser[] = [
  {
    email: 'tu-nuevo-email@dominio.com',
    password: 'TuNuevaContraseñaSegura!',
    role: 'admin',
    name: 'Tu Nombre'
  }
];
```

## 📋 Mejores Prácticas

### Para Uso en Desarrollo
1. **Mantén las credenciales seguras** - No las compartas
2. **Cierra sesión** cuando termines de usar el dashboard
3. **Usa HTTPS en producción** para mayor seguridad

### Para Producción (Recomendaciones futuras)
1. **Implementar JWT** en lugar de cookies simples
2. **Hash de contraseñas** con bcrypt o similar
3. **Autenticación 2FA** para mayor seguridad
4. **Base de datos** para gestión de usuarios admin
5. **Logs de auditoría** para tracking de accesos

## ⚠️ Consideraciones de Seguridad

### Limitaciones Actuales
- Las contraseñas están en texto plano (solo para desarrollo)
- No hay límite de intentos de login
- No hay logs de acceso detallados

### Recomendaciones
- **Cambiar contraseñas** regularmente
- **No usar en redes públicas** sin VPN
- **Implementar HTTPS** en producción

## 🆘 Solución de Problemas

### Si no puedes acceder:
1. **Verifica las credenciales** - Copia y pega desde esta documentación
2. **Borra cookies** del navegador y vuelve a intentar
3. **Reinicia el servidor** de desarrollo (`npm run dev`)
4. **Verifica la URL** - Debe ser exactamente `/admin/login`

### Si la sesión expira:
- El sistema te redirigirá automáticamente al login
- Simplemente vuelve a ingresar tus credenciales

### Restaurar acceso:
Si pierdes acceso por completo, puedes:
1. Editar `middleware.ts` temporalmente para deshabilitar la protección
2. Acceder directamente al dashboard
3. Restaurar las credenciales en el código
4. Reactivar la protección

---

**Última actualización:** 25 de agosto de 2025  
**Versión:** 1.0.0

> 💡 **Tip:** Guarda estas credenciales en un lugar seguro como tu gestor de contraseñas.