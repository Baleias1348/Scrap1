/**
 * Script automático para detectar y limpiar usuarios problemáticos
 */

const BASE_URL = 'http://localhost:3005';

// Función para hacer requests con manejo de errores
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error(`❌ Error en request a ${url}:`, error.message);
    return { ok: false, error: error.message };
  }
}

// Función para probar registro y detectar usuarios problemáticos
async function detectProblematicUser(email, password = 'TestPassword123!') {
  console.log(`🔍 Detectando problemas con usuario: ${email}`);
  
  // Intentar registro
  const signupResult = await makeRequest(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      extra: { nombres: 'Test', apellidos: 'User' }
    })
  });
  
  // Si hay error "User already registered", es problemático
  if (!signupResult.ok && signupResult.data?.code === 'user_already_exists') {
    console.log(`⚠️  Usuario problemático detectado: ${email}`);
    
    // Intentar login para confirmar inconsistencia
    const loginResult = await makeRequest(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (!loginResult.ok && loginResult.data?.code === 'invalid_credentials') {
      console.log(`🚨 Confirmado: ${email} tiene estado inconsistente`);
      return true; // Es problemático
    }
  }
  
  return false; // No es problemático
}

// Función para limpiar un usuario
async function cleanupUser(email) {
  console.log(`🧹 Limpiando usuario: ${email}`);
  
  const result = await makeRequest(`${BASE_URL}/api/admin/cleanup-users`, {
    method: 'POST',
    body: JSON.stringify({ email, action: 'cleanup' })
  });
  
  if (result.ok) {
    console.log(`✅ Usuario limpiado: ${email}`);
    return true;
  } else {
    console.error(`❌ Error limpiando ${email}:`, result.data?.error);
    return false;
  }
}

// Función para verificar que el usuario puede registrarse después de limpieza
async function verifyCleanup(email, password = 'TestPassword123!') {
  console.log(`🧪 Verificando limpieza de: ${email}`);
  
  const result = await makeRequest(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      extra: { nombres: 'Test', apellidos: 'User' }
    })
  });
  
  if (result.ok) {
    console.log(`✅ Verificación exitosa: ${email} puede registrarse`);
    return true;
  } else {
    console.error(`❌ Verificación falló para ${email}:`, result.data?.error);
    return false;
  }
}

// Función principal automatizada
async function autoCleanup(emails) {
  console.log('🚀 Iniciando limpieza automática de usuarios...\n');
  
  const results = {
    detected: [],
    cleaned: [],
    verified: [],
    errors: []
  };
  
  for (const email of emails) {
    try {
      console.log(`\n--- Procesando: ${email} ---`);
      
      // 1. Detectar si es problemático
      const isProblematic = await detectProblematicUser(email);
      
      if (isProblematic) {
        results.detected.push(email);
        
        // 2. Limpiar usuario
        const cleaned = await cleanupUser(email);
        
        if (cleaned) {
          results.cleaned.push(email);
          
          // 3. Verificar limpieza
          await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa
          const verified = await verifyCleanup(email);
          
          if (verified) {
            results.verified.push(email);
          }
        }
      } else {
        console.log(`ℹ️  ${email} no presenta problemas`);
      }
      
      // Pausa entre usuarios
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`💥 Error procesando ${email}:`, error);
      results.errors.push({ email, error: error.message });
    }
  }
  
  // Reporte final
  console.log('\n🎯 REPORTE FINAL:');
  console.log('================');
  console.log(`👀 Usuarios problemáticos detectados: ${results.detected.length}`);
  console.log(`🧹 Usuarios limpiados: ${results.cleaned.length}`);
  console.log(`✅ Usuarios verificados: ${results.verified.length}`);
  console.log(`❌ Errores: ${results.errors.length}`);
  
  if (results.detected.length > 0) {
    console.log('\n📋 Usuarios detectados:', results.detected.join(', '));
  }
  
  if (results.cleaned.length > 0) {
    console.log('🧹 Usuarios limpiados:', results.cleaned.join(', '));
  }
  
  if (results.verified.length > 0) {
    console.log('✅ Usuarios verificados:', results.verified.join(', '));
  }
  
  if (results.errors.length > 0) {
    console.log('\n💥 Errores encontrados:');
    results.errors.forEach(({ email, error }) => {
      console.log(`  - ${email}: ${error}`);
    });
  }
  
  return results;
}

// Función para ejecutar con emails específicos
async function runCleanup() {
  // Lista de emails a verificar y limpiar
  const emailsToCheck = [
    // Agregar aquí los emails problemáticos
    // 'usuario1@ejemplo.com',
    // 'usuario2@ejemplo.com'
  ];
  
  if (emailsToCheck.length === 0) {
    console.log('⚠️  No hay emails configurados para verificar.');
    console.log('💡 Puedes agregar emails al array "emailsToCheck" o usar la función directamente:');
    console.log('   await autoCleanup(["email1@test.com", "email2@test.com"])');
    return;
  }
  
  return await autoCleanup(emailsToCheck);
}

// Exportar funciones para uso externo
module.exports = {
  autoCleanup,
  detectProblematicUser,
  cleanupUser,
  verifyCleanup,
  runCleanup
};

// Ejecutar si es llamado directamente
if (require.main === module) {
  runCleanup().catch(console.error);
}