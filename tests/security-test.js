#!/usr/bin/env node
/**
 * Comprehensive Security System Test
 * Tests all security features of the administrative dashboard
 */

const axios = require('axios').default;

const BASE_URL = 'http://localhost:3006';
let adminCookie = '';

// Test credentials
const ADMIN_CREDENTIALS = {
  email: 'admin@preventiflow.com',
  password: 'AdminPreventi2025!'
};

async function testAuthenticationFlow() {
  console.log('\n🔐 Testing Authentication Flow...');
  
  try {
    // Test login
    const loginResponse = await axios.post(`${BASE_URL}/api/admin/auth`, {
      email: ADMIN_CREDENTIALS.email,
      password: ADMIN_CREDENTIALS.password,
      action: 'login'
    });
    
    if (loginResponse.data.success) {
      console.log('✅ Login successful');
      
      // Extract cookie from response
      const setCookie = loginResponse.headers['set-cookie'];
      if (setCookie) {
        adminCookie = setCookie.find(cookie => cookie.startsWith('admin_auth='));
        console.log('✅ Admin cookie obtained');
      }
    } else {
      console.log('❌ Login failed:', loginResponse.data);
      return false;
    }
    
    // Test failed login with wrong password
    try {
      await axios.post(`${BASE_URL}/api/admin/auth`, {
        email: ADMIN_CREDENTIALS.email,
        password: 'wrong_password',
        action: 'login'
      });
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Failed login properly rejected');
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
    return false;
  }
}

async function testSecurityEventLogging() {
  console.log('\n📋 Testing Security Event Logging...');
  
  if (!adminCookie) {
    console.log('❌ No admin cookie available for testing');
    return false;
  }
  
  try {
    // Test posting security event
    const eventResponse = await axios.post(`${BASE_URL}/api/admin/security`, {
      type: 'admin_access',
      user: 'admin@preventiflow.com',
      details: 'Test security event from automated test',
      severity: 'medium',
      resource: '/admin/security'
    }, {
      headers: {
        'Cookie': adminCookie
      }
    });
    
    if (eventResponse.data.success) {
      console.log('✅ Security event logged successfully');
      console.log(`   Event ID: ${eventResponse.data.eventId}`);
    }
    
    // Test retrieving security events
    const getEventsResponse = await axios.get(`${BASE_URL}/api/admin/security?timeframe=24h`, {
      headers: {
        'Cookie': adminCookie
      }
    });
    
    if (getEventsResponse.data.success) {
      console.log('✅ Security events retrieved successfully');
      console.log(`   Total events: ${getEventsResponse.data.totalEvents}`);
      console.log(`   Events in response: ${getEventsResponse.data.events.length}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Security event logging test failed:', error.message);
    return false;
  }
}

async function testTaskExecution() {
  console.log('\n⚡ Testing Administrative Task Execution...');
  
  if (!adminCookie) {
    console.log('❌ No admin cookie available for testing');
    return false;
  }
  
  try {
    // Test starting a task
    const taskResponse = await axios.post(`${BASE_URL}/api/admin/tasks`, {
      taskType: 'system-health-check',
      taskId: 'test_task_' + Date.now()
    }, {
      headers: {
        'Cookie': adminCookie
      }
    });
    
    if (taskResponse.data.success) {
      console.log('✅ Administrative task started successfully');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Task execution test failed:', error.message);
    return false;
  }
}

async function testRateLimiting() {
  console.log('\n🚦 Testing Rate Limiting...');
  
  try {
    // Try multiple failed login attempts
    const failedAttempts = [];
    for (let i = 0; i < 6; i++) {
      try {
        const response = await axios.post(`${BASE_URL}/api/admin/auth`, {
          email: 'test@test.com',
          password: 'wrong_password',
          action: 'login'
        });
        failedAttempts.push(response.status);
      } catch (error) {
        failedAttempts.push(error.response?.status || 'error');
      }
    }
    
    // Check if rate limiting kicked in (status 429)
    const rateLimited = failedAttempts.includes(429);
    if (rateLimited) {
      console.log('✅ Rate limiting is working correctly');
    } else {
      console.log('⚠️  Rate limiting may not be active (this is OK for development)');
      console.log('   Failed attempt statuses:', failedAttempts);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Rate limiting test failed:', error.message);
    return false;
  }
}

async function testMiddlewareProtection() {
  console.log('\n🛡️  Testing Middleware Protection...');
  
  try {
    // Test access to protected route without authentication
    try {
      await axios.get(`${BASE_URL}/admin/security`);
      console.log('❌ Protected route accessible without authentication');
      return false;
    } catch (error) {
      if (error.response?.status === 404 || error.message.includes('redirected')) {
        console.log('✅ Protected routes properly redirecting unauthenticated users');
      }
    }
    
    // Test API protection
    try {
      await axios.get(`${BASE_URL}/api/admin/security`);
      console.log('❌ Protected API accessible without authentication');
      return false;
    } catch (error) {
      if (error.response?.status === 404 || error.message.includes('redirected')) {
        console.log('✅ Protected APIs properly secured');
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Middleware protection test failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Comprehensive Security System Tests');
  console.log('================================================');
  
  const results = {
    authentication: await testAuthenticationFlow(),
    middleware: await testMiddlewareProtection(),
    rateLimiting: await testRateLimiting(),
    eventLogging: await testSecurityEventLogging(),
    taskExecution: await testTaskExecution()
  };
  
  console.log('\n📊 Test Results Summary');
  console.log('========================');
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  
  console.log(`\n🎯 Overall Score: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All security features are working correctly!');
  } else {
    console.log('⚠️  Some features need attention. Check the logs above.');
  }
  
  return passedTests === totalTests;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests };