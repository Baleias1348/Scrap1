/**
 * Script para limpiar usuarios problemáticos de Supabase
 * Usar cuando hay inconsistencias entre auth.users y registros eliminados manualmente
 */

const CLEANUP_URL = 'http://localhost:3005/api/admin/cleanup-users';

async function cleanupUser(email: string) {
  console.log(`\n🧹 Limpiando usuario: ${email}`);
  
  try {
    // Primero verificar si el usuario existe
    const checkResponse = await fetch(CLEANUP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, action: 'check' })
    });
    
    const checkResult = await checkResponse.json();
    console.log('📊 Estado actual:', checkResult);
    
    if (checkResult.exists) {
      // Limpiar usuario
      const cleanupResponse = await fetch(CLEANUP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action: 'cleanup' })
      });
      
      const cleanupResult = await cleanupResponse.json();
      
      if (cleanupResponse.ok) {
        console.log('✅ Usuario limpiado exitosamente:', cleanupResult);
      } else {
        console.error('❌ Error en limpieza:', cleanupResult);
      }
    } else {
      console.log('ℹ️  Usuario no existe en auth.users');
    }
    
  } catch (error) {
    console.error('💥 Error durante limpieza:', error);
  }
}

async function testRegistration(email: string, password: string = 'TestPassword123!') {
  console.log(`\n🧪 Probando registro de: ${email}`);
  
  try {
    const response = await fetch('http://localhost:3005/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email, 
        password,
        extra: { nombres: 'Test', apellidos: 'User' }
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Registro exitoso:', result);
    } else {
      console.error('❌ Error en registro:', result);
    }
    
    return response.ok;
  } catch (error) {
    console.error('💥 Error durante registro:', error);
    return false;
  }
}

// Función principal
async function main() {
  console.log('🚀 Iniciando limpieza de usuarios problemáticos...');
  
  // Lista de emails problemáticos que necesitas limpiar
  const problematicEmails = [
    // Agrega aquí los emails que están causando problemas
    // 'usuario1@ejemplo.com',
    // 'usuario2@ejemplo.com'
  ];
  
  if (problematicEmails.length === 0) {
    console.log('\n⚠️  No hay emails configurados para limpiar.');
    console.log('📝 Edita este script y agrega los emails problemáticos en el array "problematicEmails"');
    return;
  }
  
  // Limpiar cada usuario problemático
  for (const email of problematicEmails) {
    await cleanupUser(email);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa entre requests
  }
  
  console.log('\n🎯 Probando registros después de limpieza...');
  
  // Probar registros
  for (const email of problematicEmails) {
    await testRegistration(email);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa entre requests
  }
  
  console.log('\n✨ Proceso completado!');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { cleanupUser, testRegistration };