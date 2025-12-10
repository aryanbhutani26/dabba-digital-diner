#!/usr/bin/env node

/**
 * Test script for order creation and automatic printing
 */

const API_BASE = 'http://localhost:5000/api';

async function testOrderCreation() {
  console.log('🧪 Testing Order Creation and Automatic Printing...\n');

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

    // Step 2: Create a test order
    console.log('\n2. Creating test order...');
    const testOrder = {
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      customerPhone: '01234567890',
      items: [
        {
          name: 'Test Dish',
          price: 12.99,
          quantity: 2,
          selectedSize: 'Medium'
        },
        {
          name: 'Test Drink',
          price: 3.50,
          quantity: 1
        }
      ],
      totalAmount: 29.48,
      deliveryFee: 2.50,
      discount: 0,
      paymentMethod: 'card',
      deliveryAddress: '123 Test Street, Test City, TE5T 1NG',
      specialInstructions: 'Test order for automatic printing'
    };

    const orderResponse = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testOrder)
    });

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      throw new Error(`Order creation failed: ${orderResponse.status} - ${errorText}`);
    }

    const orderData = await orderResponse.json();
    console.log('✅ Order created successfully');
    console.log('📋 Order details:', {
      orderId: orderData.orderId,
      orderNumber: orderData.orderNumber
    });

    console.log('\n⏳ Waiting 3 seconds for automatic printing to process...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('\n🎉 Test completed! Check the backend logs for printing activity.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testOrderCreation();