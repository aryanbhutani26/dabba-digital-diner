#!/usr/bin/env node

/**
 * Test script for invoice viewing with authentication
 */

const API_BASE = 'http://localhost:5000/api';

async function testInvoiceView() {
  console.log('🧪 Testing Invoice View with Authentication...\n');

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

    // Step 2: Get orders
    console.log('\n2. Getting orders...');
    const ordersResponse = await fetch(`${API_BASE}/invoices/list?limit=1`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!ordersResponse.ok) {
      throw new Error(`Orders request failed: ${ordersResponse.status}`);
    }

    const ordersData = await ordersResponse.json();
    console.log('✅ Orders retrieved successfully');

    if (ordersData.orders.length > 0) {
      const testOrder = ordersData.orders[0];
      console.log(`\n3. Testing invoice HTML for order: ${testOrder.orderNumber}`);

      // Step 3: Get invoice HTML
      const invoiceResponse = await fetch(`${API_BASE}/invoices/${testOrder._id}/html`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (invoiceResponse.ok) {
        const htmlContent = await invoiceResponse.text();
        console.log('✅ Invoice HTML retrieved successfully');
        console.log(`📄 HTML length: ${htmlContent.length} characters`);
        console.log(`📄 Contains title: ${htmlContent.includes('Invoice')}`);
      } else {
        console.error('❌ Invoice HTML failed:', invoiceResponse.status, await invoiceResponse.text());
      }

      // Step 4: Test download
      console.log('\n4. Testing invoice download...');
      const downloadResponse = await fetch(`${API_BASE}/invoices/${testOrder._id}/download?type=bill`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (downloadResponse.ok) {
        const textContent = await downloadResponse.text();
        console.log('✅ Invoice download successful');
        console.log(`📄 Text length: ${textContent.length} characters`);
        console.log(`📄 Contains order number: ${textContent.includes(testOrder.orderNumber)}`);
      } else {
        console.error('❌ Invoice download failed:', downloadResponse.status, await downloadResponse.text());
      }
    }

    console.log('\n🎉 Invoice view test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testInvoiceView();