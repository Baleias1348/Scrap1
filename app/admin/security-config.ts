// Configuración de seguridad para el panel administrativo
export const SECURITY_CONFIG = {
  // Rate limiting
  RATE_LIMIT: {
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_TIME: 15 * 60 * 1000, // 15 minutos
    API_REQUESTS_PER_MINUTE: 60,
    ADMIN_ACTIONS_PER_HOUR: 100
  },
  
  // Sesiones
  SESSION: {
    MAX_DURATION: 24 * 60 * 60 * 1000, // 24 horas
    IDLE_TIMEOUT: 2 * 60 * 60 * 1000, // 2 horas de inactividad
    REFRESH_THRESHOLD: 30 * 60 * 1000, // Renovar token si quedan menos de 30 min
    CONCURRENT_SESSIONS: 3 // Máximo 3 sesiones concurrentes por usuario
  },
  
  // Monitoring
  MONITORING: {
    LOG_ALL_ADMIN_ACTIONS: true,
    ALERT_ON_CRITICAL_EVENTS: true,
    RETENTION_DAYS: 90, // Retener logs por 90 días
    SUSPICIOUS_ACTIVITY_THRESHOLD: 5, // Número de eventos sospechosos antes de alertar
    FAILED_LOGIN_THRESHOLD: 3 // Alertar después de 3 logins fallidos
  },
  
  // Restricciones IP
  IP_RESTRICTIONS: {
    ENABLED: false, // Habilitar en producción
    WHITELIST: [
      '192.168.1.0/24', // Red local
      '10.0.0.0/8', // VPN corporativa
    ],
    BLACKLIST: [
      // IPs conocidas maliciosas se agregarían aquí
    ],
    GEO_BLOCKING: {
      ENABLED: false,
      ALLOWED_COUNTRIES: ['US', 'CA', 'MX', 'CL', 'AR', 'PE', 'CO'], // Códigos ISO
      BLOCK_VPN_TOR: true
    }
  },
  
  // Validaciones
  VALIDATION: {
    PASSWORD_POLICY: {
      MIN_LENGTH: 12,
      REQUIRE_UPPERCASE: true,
      REQUIRE_LOWERCASE: true,
      REQUIRE_NUMBERS: true,
      REQUIRE_SYMBOLS: true,
      NO_COMMON_PASSWORDS: true,
      NO_USER_INFO: true // No permitir info del usuario en la contraseña
    },
    ADMIN_EMAIL_DOMAINS: [
      'preventiflow.com',
      'company.com' // Agregar dominios autorizados
    ]
  },
  
  // Alertas
  ALERTS: {
    EMAIL_NOTIFICATIONS: {
      ENABLED: false, // Configurar en producción
      RECIPIENTS: [
        'security@preventiflow.com',
        'admin@preventiflow.com'
      ],
      SEVERITY_THRESHOLD: 'medium' // Alertar desde severidad media
    },
    WEBHOOK_NOTIFICATIONS: {
      ENABLED: false,
      SLACK_WEBHOOK: process.env.SLACK_SECURITY_WEBHOOK,
      DISCORD_WEBHOOK: process.env.DISCORD_SECURITY_WEBHOOK
    }
  },
  
  // Características de seguridad
  FEATURES: {
    TWO_FACTOR_AUTH: {
      ENABLED: false, // Para implementar en el futuro
      REQUIRED_FOR_SUPER_ADMIN: true,
      BACKUP_CODES: true
    },
    API_KEY_ROTATION: {
      ENABLED: false,
      ROTATION_INTERVAL: 30 * 24 * 60 * 60 * 1000, // 30 días
      WARNING_BEFORE_EXPIRY: 7 * 24 * 60 * 60 * 1000 // 7 días
    },
    AUDIT_EXPORT: {
      ENABLED: true,
      MAX_EXPORT_RANGE: 30 * 24 * 60 * 60 * 1000, // 30 días máximo
      REQUIRE_APPROVAL: false // Para super admin
    }
  }
};

// Tipos de eventos de seguridad
export enum SecurityEventType {
  LOGIN = 'login',
  FAILED_LOGIN = 'failed_login',
  LOGOUT = 'logout',
  ADMIN_ACCESS = 'admin_access',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  SESSION_EXPIRED = 'session_expired',
  INVALID_TOKEN = 'invalid_token',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  DATA_EXPORT = 'data_export',
  USER_CREATED = 'user_created',
  USER_DELETED = 'user_deleted',
  USER_MODIFIED = 'user_modified',
  PASSWORD_CHANGE = 'password_change',
  ADMIN_TASK_STARTED = 'admin_task_started',
  ADMIN_TASK_COMPLETED = 'admin_task_completed',
  ADMIN_TASK_FAILED = 'admin_task_failed',
  API_ACCESS = 'api_access',
  CONFIG_CHANGE = 'config_change',
  SECURITY_SCAN = 'security_scan',
  BLOCKED_LOGIN_ATTEMPT = 'blocked_login_attempt'
}

// Niveles de severidad
export enum SecuritySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Función para determinar si una IP está en la whitelist
export function isIPWhitelisted(ip: string): boolean {
  if (!SECURITY_CONFIG.IP_RESTRICTIONS.ENABLED) return true;
  
  // Implementar lógica de verificación de IP
  // Por ahora, permitir IPs locales por defecto
  return ip.startsWith('192.168.') || ip.startsWith('10.') || ip === '127.0.0.1';
}

// Función para verificar si un dominio de email es autorizado
export function isEmailDomainAuthorized(email: string): boolean {
  const domain = email.split('@')[1];
  return SECURITY_CONFIG.VALIDATION.ADMIN_EMAIL_DOMAINS.includes(domain);
}

// Función para evaluar la fortaleza de una contraseña
export function evaluatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  issues: string[];
} {
  const issues: string[] = [];
  let score = 0;
  
  const policy = SECURITY_CONFIG.VALIDATION.PASSWORD_POLICY;
  
  if (password.length < policy.MIN_LENGTH) {
    issues.push(`La contraseña debe tener al menos ${policy.MIN_LENGTH} caracteres`);
  } else {
    score += 2;
  }
  
  if (policy.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    issues.push('Debe incluir al menos una letra mayúscula');
  } else {
    score += 1;
  }
  
  if (policy.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    issues.push('Debe incluir al menos una letra minúscula');
  } else {
    score += 1;
  }
  
  if (policy.REQUIRE_NUMBERS && !/\d/.test(password)) {
    issues.push('Debe incluir al menos un número');
  } else {
    score += 1;
  }
  
  if (policy.REQUIRE_SYMBOLS && !/[^A-Za-z0-9]/.test(password)) {
    issues.push('Debe incluir al menos un símbolo especial');
  } else {
    score += 1;
  }
  
  // Verificar contraseñas comunes
  const commonPasswords = ['password', '123456', 'admin', 'preventi', 'flow'];
  if (policy.NO_COMMON_PASSWORDS && commonPasswords.some(common => 
    password.toLowerCase().includes(common))) {
    issues.push('No use contraseñas comunes o predecibles');
    score = Math.max(0, score - 2);
  }
  
  return {
    isValid: issues.length === 0,
    score: Math.min(score, 5),
    issues
  };
}

// Recomendaciones de seguridad
export const SECURITY_RECOMMENDATIONS = [
  {
    id: 'enable-2fa',
    title: 'Habilitar Autenticación de Dos Factores',
    description: 'Agregar una capa adicional de seguridad para cuentas administrativas',
    priority: 'high',
    implementation: 'Integrar con Google Authenticator o similar'
  },
  {
    id: 'implement-rate-limiting',
    title: 'Implementar Rate Limiting Avanzado',
    description: 'Limitar el número de solicitudes por IP y usuario',
    priority: 'medium',
    implementation: 'Usar Redis para almacenar contadores de rate limiting'
  },
  {
    id: 'ip-whitelist',
    title: 'Configurar Whitelist de IPs',
    description: 'Restringir acceso administrativo a IPs conocidas',
    priority: 'medium',
    implementation: 'Definir rangos de IP autorizados en configuración'
  },
  {
    id: 'audit-persistence',
    title: 'Persistir Logs de Auditoría',
    description: 'Guardar eventos de seguridad en base de datos persistente',
    priority: 'high',
    implementation: 'Crear tabla security_events en Supabase'
  },
  {
    id: 'automated-alerts',
    title: 'Alertas Automatizadas',
    description: 'Notificaciones automáticas para eventos críticos',
    priority: 'medium',
    implementation: 'Integrar con email, Slack o sistema de alertas'
  },
  {
    id: 'session-management',
    title: 'Gestión Avanzada de Sesiones',
    description: 'Control de sesiones concurrentes y timeouts',
    priority: 'low',
    implementation: 'Implementar store de sesiones con Redis'
  }
];