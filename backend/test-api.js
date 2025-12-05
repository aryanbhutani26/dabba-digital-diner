// Simple API test script
// Run this after starting the server to verify endpoints

const API_URL = 'http://localhost:5000/api';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.yellow}ℹ${colors.reset} ${msg}`)
};

async function testEndpoint(name, url, options = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (response.ok) {
      log.success(`${name}: ${response.status}`);
      return { success: true, data };
    } else {
      log.error(`${name}: ${response.status} - ${data.error || 'Unknown error'}`);
      return { success: false, error: data.error };
    }
  } catch (error) {
    log.error(`${name}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('\\n🧪 Testing API Endpoints...\\n');

  // Test health check
  await testEndpoint('Health Check', `${API_URL.replace('/api', '')}/health`);

  // Test public endpoints
  log.info('\\nTesting public endpoints...');
  await testEndpoint('Get Coupons', `${API_URL}/coupons`);
  await testEndpoint('Get Navbar Items', `${API_URL}/navbar`);
  await testEndpoint('Get Menu Items', `${API_URL}/menu`);
  await testEndpoint('Get Setting', `${API_URL}/settings/services_visible`);

  // Test auth endpoints
  log.info('\\nTesting auth endpoints...');
  
  // Try to sign up
  const signupResult = await testEndpoint('Sign Up', `${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `test${Date.now()}@example.com`,
      password: 'test123',
      name: 'Test User'
    })
  });

  if (signupResult.success) {
    const token = signupResult.data.token;
    
    // Test authenticated endpoint
    log.info('\\nTesting authenticated endpoints...');
    await testEndpoint('Get Current User', `${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  // Test admin endpoints (should fail without admin role)
  log.info('\\nTesting admin endpoints (should fail for regular user)...');
  if (signupResult.success) {
    const token = signupResult.data.token;
    await testEndpoint('Get All Coupons (Admin)', `${API_URL}/coupons/all`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  console.log('\\n✅ API tests complete!\\n');
  console.log('Note: Admin endpoint tests should fail unless you use an admin token.\\n');
}

// Check if server is running
fetch(`${API_URL.replace('/api', '')}/health`)
  .then(() => runTests())
  .catch(() => {
    log.error('Server is not running!');
    console.log('\\nPlease start the server first:');
    console.log('  cd server');
    console.log('  npm run dev\\n');
  });
