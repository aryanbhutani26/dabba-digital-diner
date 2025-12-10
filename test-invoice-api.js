#!/usr/bin/env node

/**
 * Test script for invoice API
 */

const API_BASE = 'http://localhost:5000/api';

async function testInvoiceAPI() {
  console.log('🧪 Testing Invoice API...\n');

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

    // Step 2: Get orders with invoices
    console.log('\n2. Getting orders with invoices...');
    const ordersResponse = await fetch(`${API_BASE}/invoices/list?limit=5`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!ordersResponse.ok) {
      throw new Error(`Orders request failed: ${ordersResponse.status}`);
    }

    const ordersData = await ordersResponse.json();
    console.log('✅ Orders retrieved successfully');
    console.log(`📋 Found ${ordersData.orders.length} orders`);

    if (ordersData.orders.length > 0) {
      const testOrder = ordersData.orders[0];
      console.log(`\n3. Testing invoice for order: ${testOrder.orderNumber}`);

      // Step 3: Get invoice data
      const invoiceResponse = await fetch(`${API_BASE}/invoices/${testOrder._id}/data`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (invoiceResponse.ok) {
        const invoiceData = await invoiceResponse.json();
        console.log('✅ Invoice data retrieved');
        console.log('📊 Invoice totals:', invoiceData.calculations);
      }

      // Step 4: Test reprint
      console.log('\n4. Testing reprint functionality...');
      const reprintResponse = await fetch(`${API_BASE}/invoices/${testOrder._id}/reprint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ printerType: 'both' })
      });

      if (reprintResponse.ok) {
        const reprintData = await reprintResponse.json();
        console.log('✅ Reprint triggered successfully');
        console.log('📄 Reprint result:', reprintData.message);
      }
    }

    console.log('\n🎉 Invoice API test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testInvoiceAPI();