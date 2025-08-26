#!/bin/bash

# Script automático para detectar y limpiar usuarios problemáticos
BASE_URL="http://localhost:3005"

echo "🚀 Iniciando detección automática de usuarios problemáticos..."
echo "=================================================="

# Función para probar registro y detectar problemas
test_user() {
    local email=$1
    local password="TestPassword123!"
    
    echo "🔍 Probando usuario: $email"
    
    # Intentar registro
    signup_response=$(curl -s -X POST "$BASE_URL/api/auth/signup" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\",\"password\":\"$password\",\"extra\":{\"nombres\":\"Test\",\"apellidos\":\"User\"}}")
    
    # Verificar si el error es "User already registered"
    if echo "$signup_response" | grep -q "already registered\|User already registered"; then
        echo "⚠️  Usuario posiblemente problemático: $email"
        
        # Intentar login para confirmar inconsistencia
        login_response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
            -H "Content-Type: application/json" \
            -d "{\"email\":\"$email\",\"password\":\"$password\"}")
        
        # Si el login falla con credenciales inválidas, es problemático
        if echo "$login_response" | grep -q "Invalid login credentials\|credentials"; then
            echo "🚨 CONFIRMADO: $email tiene estado inconsistente"
            return 0  # Es problemático
        else
            echo "ℹ️  $email puede hacer login, no es problemático"
            return 1  # No es problemático
        fi
    else
        echo "✅ $email no presenta problemas"
        return 1  # No es problemático
    fi
}

# Función para limpiar usuario
cleanup_user() {
    local email=$1
    
    echo "🧹 Limpiando usuario: $email"
    
    cleanup_response=$(curl -s -X POST "$BASE_URL/api/admin/cleanup-users" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\",\"action\":\"cleanup\"}")
    
    if echo "$cleanup_response" | grep -q "Successfully deleted\|Usuario eliminado"; then
        echo "✅ Usuario $email limpiado exitosamente"
        return 0
    else
        echo "❌ Error limpiando $email: $cleanup_response"
        return 1
    fi
}

# Función para verificar limpieza
verify_cleanup() {
    local email=$1
    local password="TestPassword123!"
    
    echo "🧪 Verificando limpieza de: $email"
    
    # Intentar registro después de limpieza
    verify_response=$(curl -s -X POST "$BASE_URL/api/auth/signup" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\",\"password\":\"$password\",\"extra\":{\"nombres\":\"Test\",\"apellidos\":\"User\"}}")
    
    if echo "$verify_response" | grep -q "\"user\":\{\"id\""; then
        echo "✅ Verificación exitosa: $email puede registrarse correctamente"
        return 0
    else
        echo "❌ Verificación falló para $email: $verify_response"
        return 1
    fi
}

# Emails comunes que podrían estar problemáticos
test_emails=(
    "test@test.com"
    "admin@test.com" 
    "user@test.com"
    "demo@test.com"
    "olivia@test.com"
    "prueba@test.com"
    "usuario@test.com"
)

# Arrays para tracking
problematic_users=()
cleaned_users=()
verified_users=()

echo ""
echo "🔍 FASE 1: Detectando usuarios problemáticos..."
echo "============================================="

# Detectar usuarios problemáticos
for email in "${test_emails[@]}"; do
    if test_user "$email"; then
        problematic_users+=("$email")
    fi
    sleep 1  # Pausa entre requests
done

echo ""
echo "📋 Usuarios problemáticos encontrados: ${#problematic_users[@]}"
for user in "${problematic_users[@]}"; do
    echo "  - $user"
done

if [ ${#problematic_users[@]} -eq 0 ]; then
    echo "🎉 ¡No se encontraron usuarios problemáticos!"
    exit 0
fi

echo ""
echo "🧹 FASE 2: Limpiando usuarios problemáticos..."
echo "============================================="

# Limpiar usuarios problemáticos
for email in "${problematic_users[@]}"; do
    if cleanup_user "$email"; then
        cleaned_users+=("$email")
    fi
    sleep 2  # Pausa después de limpieza
done

echo ""
echo "🧪 FASE 3: Verificando limpiezas..."
echo "================================="

# Verificar limpiezas
for email in "${cleaned_users[@]}"; do
    if verify_cleanup "$email"; then
        verified_users+=("$email")
    fi
    sleep 1
done

# Reporte final
echo ""
echo "🎯 REPORTE FINAL"
echo "================"
echo "👀 Usuarios problemáticos detectados: ${#problematic_users[@]}"
echo "🧹 Usuarios limpiados: ${#cleaned_users[@]}"
echo "✅ Usuarios verificados: ${#verified_users[@]}"

echo ""
if [ ${#verified_users[@]} -gt 0 ]; then
    echo "✅ Usuarios corregidos exitosamente:"
    for user in "${verified_users[@]}"; do
        echo "  ✓ $user"
    done
fi

if [ ${#verified_users[@]} -eq ${#problematic_users[@]} ]; then
    echo ""
    echo "🎉 ¡Todos los usuarios problemáticos han sido corregidos!"
else
    echo ""
    echo "⚠️  Algunos usuarios requieren atención manual."
fi