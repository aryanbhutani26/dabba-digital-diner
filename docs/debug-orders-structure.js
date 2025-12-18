#!/usr/bin/env node

/**
 * Debug script to check orders data structure
 */

const API_BASE = 'http://localhost:5000/api';

async function debugOrdersStructure() {
  console.log('🔍 Debugging Orders Data Structure...\n');

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

    // Get orders with invoices
    const ordersResponse = await fetch(`${API_BASE}/invoices/list?limit=3`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const ordersData = await ordersResponse.json();
    
    console.log('📊 Orders Response Structure:');
    console.log('- Total orders:', ordersData.total);
    console.log('- Orders array length:', ordersData.orders?.length || 0);
    console.log('- Has more:', ordersData.hasMore);
    
    if (ordersData.orders && ordersData.orders.length > 0) {
      console.log('\n📋 First Order Structure:');
      const firstOrder = ordersData.orders[0];
      
      console.log('- _id:', typeof firstOrder._id, firstOrder._id);
      console.log('- orderNumber:', typeof firstOrder.orderNumber, firstOrder.orderNumber);
      console.log('- customerName:', typeof firstOrder.customerName, firstOrder.customerName);
      console.log('- status:', typeof firstOrder.status, firstOrder.status);
      console.log('- total:', typeof firstOrder.total, firstOrder.total);
      console.log('- createdAt:', typeof firstOrder.createdAt, firstOrder.createdAt);
      console.log('- items:', Array.isArray(firstOrder.items), firstOrder.items?.length || 'undefined');
      console.log('- invoiceUrls:', typeof firstOrder.invoiceUrls, !!firstOrder.invoiceUrls);
      
      if (firstOrder.items && firstOrder.items.length > 0) {
        console.log('\n🍽️ First Item Structure:');
        const firstItem = firstOrder.items[0];
        console.log('- name:', typeof firstItem.name, firstItem.name);
        console.log('- quantity:', typeof firstItem.quantity, firstItem.quantity);
        console.log('- price:', typeof firstItem.price, firstItem.price);
        console.log('- selectedSize:', typeof firstItem.selectedSize, firstItem.selectedSize);
      }
      
      console.log('\n🔗 Invoice URLs:');
      if (firstOrder.invoiceUrls) {
        Object.entries(firstOrder.invoiceUrls).forEach(([key, value]) => {
          console.log(`- ${key}:`, value);
        });
      } else {
        console.log('❌ No invoiceUrls found');
      }
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

// Run the debug
debugOrdersStructure();