#!/bin/bash

# Programador de Tareas Automatizadas para Preventi Flow
# Este script programa las tareas de mantenimiento para ejecutarse automáticamente

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
CRON_FILE="/tmp/preventi_cron"

echo "📅 Configurando Tareas Automatizadas"
echo "===================================="
echo "Directorio del proyecto: $PROJECT_DIR"
echo ""

# Función para crear el archivo cron
create_cron_jobs() {
    echo "⚙️ Creando programación de tareas..."
    
    # Crear archivo cron temporal
    cat > "$CRON_FILE" << EOF
# Tareas Automatizadas de Preventi Flow
# Generado automáticamente - $(date)

# Limpieza diaria de usuarios problemáticos (2:00 AM)
0 2 * * * cd $PROJECT_DIR && curl -s -X POST http://localhost:3005/api/admin/tasks -H "Content-Type: application/json" -d '{"taskType":"cleanup-problematic-users","taskId":"daily_cleanup_$(date +\%Y\%m\%d)"}'

# Optimización de base de datos (3:00 AM los domingos)
0 3 * * 0 cd $PROJECT_DIR && curl -s -X POST http://localhost:3005/api/admin/tasks -H "Content-Type: application/json" -d '{"taskType":"optimize-database","taskId":"weekly_optimization_$(date +\%Y\%m\%d)"}'

# Limpieza de sesiones antiguas (1:00 AM diario)
0 1 * * * cd $PROJECT_DIR && curl -s -X POST http://localhost:3005/api/admin/tasks -H "Content-Type: application/json" -d '{"taskType":"cleanup-old-sessions","taskId":"daily_sessions_$(date +\%Y\%m\%d)"}'

# Análisis de actividad de usuarios (6:00 AM los lunes)
0 6 * * 1 cd $PROJECT_DIR && curl -s -X POST http://localhost:3005/api/admin/tasks -H "Content-Type: application/json" -d '{"taskType":"analyze-user-activity","taskId":"weekly_analysis_$(date +\%Y\%m\%d)"}'

# Verificación de salud del sistema (cada 6 horas)
0 */6 * * * cd $PROJECT_DIR && curl -s -X POST http://localhost:3005/api/admin/tasks -H "Content-Type: application/json" -d '{"taskType":"system-health-check","taskId":"health_check_$(date +\%Y\%m\%d_\%H)"}'

# Backup diario (4:00 AM)
0 4 * * * cd $PROJECT_DIR && ./scripts/backup-db.sh daily

# Backup semanal (5:00 AM los domingos)
0 5 * * 0 cd $PROJECT_DIR && ./scripts/backup-db.sh weekly

EOF
}

# Función para instalar cron jobs
install_cron_jobs() {
    echo "📥 Instalando programación en crontab..."
    
    # Backup del crontab actual
    crontab -l > "/tmp/crontab_backup_$(date +%Y%m%d_%H%M%S)" 2>/dev/null || true
    
    # Remover tareas existentes de Preventi Flow
    crontab -l 2>/dev/null | grep -v "Preventi Flow" | grep -v "localhost:3005/api/admin/tasks" | grep -v "backup-db.sh" > "/tmp/crontab_current" || true
    
    # Agregar nuevas tareas
    cat "/tmp/crontab_current" "$CRON_FILE" | crontab -
    
    echo "✅ Tareas programadas instaladas exitosamente"
}

# Función para mostrar tareas programadas
show_scheduled_tasks() {
    echo "📋 Tareas Programadas Actualmente:"
    echo "=================================="
    
    crontab -l 2>/dev/null | grep -E "(Preventi Flow|localhost:3005|backup-db)" || echo "No hay tareas programadas"
    echo ""
}

# Función para remover tareas programadas
remove_cron_jobs() {
    echo "🗑️ Removiendo tareas programadas..."
    
    # Backup del crontab actual
    crontab -l > "/tmp/crontab_backup_$(date +%Y%m%d_%H%M%S)" 2>/dev/null || true
    
    # Remover tareas de Preventi Flow
    crontab -l 2>/dev/null | grep -v "Preventi Flow" | grep -v "localhost:3005/api/admin/tasks" | grep -v "backup-db.sh" | crontab - || true
    
    echo "✅ Tareas programadas removidas"
}

# Función de verificación del sistema
verify_system() {
    echo "🔍 Verificando sistema..."
    
    # Verificar que el servidor esté corriendo
    if curl -s -f http://localhost:3005/api/admin/stats > /dev/null; then
        echo "✅ Servidor de desarrollo ejecutándose"
    else
        echo "❌ Servidor no disponible en puerto 3005"
        echo "   Ejecuta: npm run dev"
        return 1
    fi
    
    # Verificar scripts de backup
    if [ -f "$PROJECT_DIR/scripts/backup-db.sh" ]; then
        echo "✅ Script de backup disponible"
    else
        echo "❌ Script de backup no encontrado"
        return 1
    fi
    
    # Verificar variables de entorno
    if [ -f "$PROJECT_DIR/.env.local" ]; then
        echo "✅ Archivo .env.local encontrado"
    else
        echo "⚠️ Archivo .env.local no encontrado"
        echo "   Algunas tareas pueden fallar"
    fi
    
    return 0
}

# Función para mostrar estado de las tareas
show_task_status() {
    echo "📊 Estado de las Tareas:"
    echo "======================="
    
    # Verificar logs de cron (Linux/macOS)
    if [ -f /var/log/cron ]; then
        echo "Últimas ejecuciones:"
        tail -10 /var/log/cron | grep -i preventi || echo "No hay logs recientes"
    elif [ -f /var/log/system.log ]; then
        echo "Últimas ejecuciones (macOS):"
        tail -10 /var/log/system.log | grep -i cron | grep -i preventi || echo "No hay logs recientes"
    else
        echo "Logs de cron no disponibles en esta ubicación"
    fi
    echo ""
}

# Función de ayuda
show_help() {
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos disponibles:"
    echo "  install   - Instalar programación de tareas automáticas"
    echo "  remove    - Remover todas las tareas programadas"
    echo "  show      - Mostrar tareas actualmente programadas"
    echo "  status    - Mostrar estado y logs de las tareas"
    echo "  verify    - Verificar que el sistema esté listo"
    echo "  help      - Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0 install"
    echo "  $0 show"
    echo "  $0 status"
    echo ""
}

# Función para mostrar resumen de tareas
show_task_summary() {
    echo ""
    echo "📋 Resumen de Tareas Automatizadas:"
    echo "=================================="
    echo ""
    echo "🕐 Tareas Diarias:"
    echo "  • 01:00 - Limpieza de sesiones antiguas"
    echo "  • 02:00 - Limpieza de usuarios problemáticos"  
    echo "  • 04:00 - Backup diario"
    echo ""
    echo "🕕 Tareas Semanales:"
    echo "  • Domingo 03:00 - Optimización de base de datos"
    echo "  • Domingo 05:00 - Backup semanal"
    echo "  • Lunes 06:00 - Análisis de actividad de usuarios"
    echo ""
    echo "⏰ Tareas Periódicas:"
    echo "  • Cada 6 horas - Verificación de salud del sistema"
    echo ""
}

# Procesar argumentos
case "${1:-help}" in
    "install")
        echo "🚀 Instalando Tareas Automatizadas..."
        echo ""
        if verify_system; then
            create_cron_jobs
            install_cron_jobs
            show_task_summary
            echo "✅ Instalación completada"
            echo ""
            echo "💡 Para ver las tareas programadas: $0 show"
        else
            echo "❌ Sistema no está listo. Corrige los problemas y vuelve a intentar."
            exit 1
        fi
        ;;
    "remove")
        remove_cron_jobs
        ;;
    "show")
        show_scheduled_tasks
        show_task_summary
        ;;
    "status")
        show_task_status
        ;;
    "verify")
        verify_system
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        echo "❌ Comando desconocido: $1"
        echo ""
        show_help
        exit 1
        ;;
esac

# Limpiar archivos temporales
rm -f "$CRON_FILE" "/tmp/crontab_current" 2>/dev/null || true