#!/bin/bash

# Script de backup automático para Supabase
# Uso: ./backup-db.sh [daily|weekly|manual]

BACKUP_TYPE=${1:-manual}
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups"
BACKUP_FILE="backup_${BACKUP_TYPE}_${TIMESTAMP}.sql"

echo "🗄️ Iniciando backup de base de datos..."
echo "=================================================="
echo "Tipo: $BACKUP_TYPE"
echo "Archivo: $BACKUP_FILE"
echo "Fecha: $(date)"
echo ""

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"

# Función para logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Función para verificar variables de entorno
check_env() {
    if [ -z "$SUPABASE_DB_URL" ]; then
        log "ERROR: Variable SUPABASE_DB_URL no configurada"
        log "Configura la URL de conexión directa a PostgreSQL en .env.local"
        log "Formato: postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
        exit 1
    fi
}

# Función para crear backup usando pg_dump
create_backup() {
    log "Creando backup con pg_dump..."
    
    # Verificar si pg_dump está disponible
    if ! command -v pg_dump &> /dev/null; then
        log "ERROR: pg_dump no encontrado"
        log "Instala PostgreSQL client tools:"
        log "- macOS: brew install postgresql"
        log "- Ubuntu: sudo apt install postgresql-client"
        exit 1
    fi
    
    # Crear backup completo
    pg_dump "$SUPABASE_DB_URL" \
        --clean \
        --create \
        --verbose \
        --file="$BACKUP_DIR/$BACKUP_FILE" \
        --format=plain \
        --no-password
    
    if [ $? -eq 0 ]; then
        log "✅ Backup creado exitosamente: $BACKUP_DIR/$BACKUP_FILE"
        
        # Comprimir el backup
        gzip "$BACKUP_DIR/$BACKUP_FILE"
        log "📦 Backup comprimido: $BACKUP_DIR/$BACKUP_FILE.gz"
        
        # Mostrar tamaño del archivo
        local file_size=$(du -h "$BACKUP_DIR/$BACKUP_FILE.gz" | cut -f1)
        log "📊 Tamaño del backup: $file_size"
        
        return 0
    else
        log "❌ Error al crear backup"
        return 1
    fi
}

# Función para limpiar backups antiguos
cleanup_old_backups() {
    log "🧹 Limpiando backups antiguos..."
    
    case $BACKUP_TYPE in
        "daily")
            # Mantener últimos 7 backups diarios
            find "$BACKUP_DIR" -name "backup_daily_*.sql.gz" -type f -mtime +7 -delete
            log "Backups diarios > 7 días eliminados"
            ;;
        "weekly")
            # Mantener últimos 4 backups semanales
            find "$BACKUP_DIR" -name "backup_weekly_*.sql.gz" -type f -mtime +28 -delete
            log "Backups semanales > 4 semanas eliminados"
            ;;
        "manual")
            # No eliminar backups manuales automáticamente
            log "Backups manuales no se eliminan automáticamente"
            ;;
    esac
}

# Función para enviar notificación (opcional)
send_notification() {
    local status=$1
    local message=$2
    
    # Aquí puedes agregar notificaciones (email, Slack, Discord, etc.)
    log "📢 Notificación: $message"
    
    # Ejemplo con curl para webhook (descomenta y configura tu webhook)
    # curl -X POST -H 'Content-type: application/json' \
    #     --data "{\"text\":\"🗄️ Backup $status: $message\"}" \
    #     "$WEBHOOK_URL"
}

# Función para verificar integridad del backup
verify_backup() {
    local backup_file="$BACKUP_DIR/$BACKUP_FILE.gz"
    
    log "🔍 Verificando integridad del backup..."
    
    # Verificar que el archivo no esté corrupto
    if gzip -t "$backup_file" 2>/dev/null; then
        log "✅ Backup íntegro y válido"
        return 0
    else
        log "❌ Backup corrupto o inválido"
        return 1
    fi
}

# Función principal
main() {
    log "Iniciando proceso de backup ($BACKUP_TYPE)"
    
    # Verificar variables de entorno
    check_env
    
    # Crear backup
    if create_backup; then
        # Verificar integridad
        if verify_backup; then
            # Limpiar backups antiguos
            cleanup_old_backups
            
            # Enviar notificación de éxito
            send_notification "exitoso" "Backup $BACKUP_TYPE completado"
            
            log "🎉 Proceso de backup completado exitosamente"
            exit 0
        else
            send_notification "fallido" "Backup $BACKUP_TYPE corrupto"
            log "❌ Proceso de backup falló: archivo corrupto"
            exit 1
        fi
    else
        send_notification "fallido" "Error creando backup $BACKUP_TYPE"
        log "❌ Proceso de backup falló"
        exit 1
    fi
}

# Función de ayuda
show_help() {
    echo "Uso: $0 [daily|weekly|manual]"
    echo ""
    echo "Opciones:"
    echo "  daily   - Backup diario (mantiene 7 días)"
    echo "  weekly  - Backup semanal (mantiene 4 semanas)"
    echo "  manual  - Backup manual (no se elimina automáticamente)"
    echo ""
    echo "Variables de entorno requeridas:"
    echo "  SUPABASE_DB_URL - URL de conexión directa a PostgreSQL"
    echo ""
    echo "Ejemplo:"
    echo "  $0 daily"
    echo ""
}

# Parsear argumentos
case $BACKUP_TYPE in
    "daily"|"weekly"|"manual")
        main
        ;;
    "-h"|"--help"|"help")
        show_help
        ;;
    *)
        echo "❌ Tipo de backup inválido: $BACKUP_TYPE"
        show_help
        exit 1
        ;;
esac