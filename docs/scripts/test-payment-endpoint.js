// Test script to verify payment endpoint
const testPaymentEndpoint = async () => {
  try {
    console.log('🧪 Testing payment endpoint...');
    
    // You'll need to replace this with a valid auth token
    const authToken = 'YOUR_AUTH_TOKEN_HERE';
    
    const response = await fetch('http://localhost:5000/api/payment/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        amount: 75.00,
        customerEmail: 'test@example.com',
      }),
    });

    console.log('📡 Response status:', response.status);
    const data = await response.json();
    console.log('📦 Response data:', data);

    if (response.ok) {
      console.log('✅ Payment endpoint is working!');
      console.log('🔑 Client Secret:', data.clientSecret ? 'Received' : 'Missing');
      console.log('🆔 Payment Intent ID:', data.paymentIntentId);
    } else {
      console.log('❌ Payment endpoint failed:', data.error);
    }
  } catch (error) {
    console.error('❌ Error testing payment endpoint:', error);
  }
};

// Note: This is a test script. To run it:
// 1. Get a valid auth token by logging in
// 2. Replace YOUR_AUTH_TOKEN_HERE with the actual token
// 3. Run: node test-payment-endpoint.js

console.log('📝 To test the payment endpoint:');
console.log('1. Open browser console on your app');
console.log('2. Get auth token: localStorage.getItem("auth_token")');
console.log('3. Replace YOUR_AUTH_TOKEN_HERE in this file');
console.log('4. Run: node test-payment-endpoint.js');
