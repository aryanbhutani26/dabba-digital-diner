#!/usr/bin/env node

/**
 * Test script for thermal printer API
 */

const API_BASE = 'http://localhost:5000/api';

async function testThermalPrinterAPI() {
  console.log('🧪 Testing Thermal Printer API...\n');

  try {
    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await fetch(`${API_BASE}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@indiya.com',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful');

    // Step 2: Test thermal printer status
    console.log('\n2. Testing thermal printer status...');
    const statusResponse = await fetch(`${API_BASE}/thermal-printers/status`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!statusResponse.ok) {
      throw new Error(`Status request failed: ${statusResponse.status}`);
    }

    const statusData = await statusResponse.json();
    console.log('✅ Status request successful');
    console.log('📊 Status data:', JSON.stringify(statusData, null, 2));

    // Step 3: Test kitchen printer
    console.log('\n3. Testing kitchen printer...');
    const kitchenTestResponse = await fetch(`${API_BASE}/thermal-printers/test/kitchen`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!kitchenTestResponse.ok) {
      const errorText = await kitchenTestResponse.text();
      console.log('⚠️ Kitchen test failed:', errorText);
    } else {
      const kitchenData = await kitchenTestResponse.json();
      console.log('✅ Kitchen test response:', kitchenData);
    }

    // Step 4: Test bill printer
    console.log('\n4. Testing bill printer...');
    const billTestResponse = await fetch(`${API_BASE}/thermal-printers/test/bill`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!billTestResponse.ok) {
      const errorText = await billTestResponse.text();
      console.log('⚠️ Bill test failed:', errorText);
    } else {
      const billData = await billTestResponse.json();
      console.log('✅ Bill test response:', billData);
    }

    console.log('\n🎉 Thermal printer API test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testThermalPrinterAPI();