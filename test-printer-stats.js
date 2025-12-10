#!/usr/bin/env node

/**
 * Test script to check printer statistics accuracy
 */

const API_BASE = 'http://localhost:5000/api';

async function testPrinterStats() {
  console.log('🧪 Testing Printer Statistics Accuracy...\n');

  try {
    // Login as admin
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

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful');

    // Get current printer status
    console.log('\n📊 Current Printer Statistics:');
    const statusResponse = await fetch(`${API_BASE}/thermal-printers/status`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const statusData = await statusResponse.json();
    
    Object.entries(statusData.printers).forEach(([id, printer]) => {
      console.log(`\n🖨️ ${printer.name}:`);
      console.log(`   Status: ${printer.status}`);
      console.log(`   Successful: ${printer.successCount}`);
      console.log(`   Failed: ${printer.errorCount}`);
      console.log(`   Enabled: ${printer.enabled}`);
      console.log(`   Last Check: ${printer.lastCheck || 'Never'}`);
    });

    // Reset statistics
    console.log('\n🔄 Resetting printer statistics...');
    const resetResponse = await fetch(`${API_BASE}/thermal-printers/reset-stats`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const resetData = await resetResponse.json();
    if (resetData.success) {
      console.log('✅ Statistics reset successfully');
    }

    // Check statistics after reset
    console.log('\n📊 Statistics After Reset:');
    const newStatusResponse = await fetch(`${API_BASE}/thermal-printers/status`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const newStatusData = await newStatusResponse.json();
    
    Object.entries(newStatusData.printers).forEach(([id, printer]) => {
      console.log(`\n🖨️ ${printer.name}:`);
      console.log(`   Status: ${printer.status}`);
      console.log(`   Successful: ${printer.successCount}`);
      console.log(`   Failed: ${printer.errorCount}`);
    });

    console.log('\n🎉 Printer statistics test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testPrinterStats();