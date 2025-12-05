# 🧪 Payment Integration - Test Steps

## Quick Test (2 Minutes)

### Step 1: Open Browser Console
1. Open app: http://localhost:5173
2. Press **F12** (Developer Tools)
3. Click **Console** tab
4. Clear console (click 🚫)

### Step 2: Prepare for Test
1. Make sure you're **logged in**
2. Go to **Account** page
3. Add a **delivery address** if you don't have one
4. Go back to **Menu** page

### Step 3: Add Items to Cart
1. Click any dish
2. Click "Add to Cart"
3. Click cart icon (top right)
4. Cart sheet opens

### Step 4: Proceed to Payment
1. In cart, click **"Proceed to Payment"**
2. **Watch the console** for logs:

```
Expected Console Output:
🚀 handleCheckout called
💳 Creating payment intent...
💰 Final amount: 75
📧 Customer email: your@email.com
🌐 API URL: http://localhost:5000/api/payment/create-payment-intent
📡 Payment response status: 200
📦 Payment data: {...}
✅ Setting client secret and showing payment form
```

### Step 5: What Should Happen

**✅ SUCCESS:**
- Cart title changes to "Complete Payment"
- You see "Back to Cart" button
- Stripe payment form appears
- Can enter card details

**❌ FAILURE:**
- Button just says "Processing..." forever
- No payment form appears
- Console shows errors

---

## 🔍 If It's Not Working:

### Check 1: Are Both Servers Running?

**Backend:**
```bash
cd server
npm run dev
```
Should show: `🚀 Server running on port 5000`

**Frontend:**
```bash
npm run dev
```
Should show: `Local: http://localhost:5173`

### Check 2: Are You Logged In?

**In browser console, type:**
```javascript
localStorage.getItem('auth_token')
```

**If it returns `null`:**
- You're not logged in
- Go to /auth and sign in

### Check 3: Do You Have an Address?

**In browser console, type:**
```javascript
fetch('http://localhost:5000/api/users/profile', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
}).then(r => r.json()).then(d => console.log('Addresses:', d.addresses))
```

**If addresses is empty:**
- Go to Account page
- Add a delivery address

### Check 4: Are Stripe Keys Set?

**Check frontend .env:**
```bash
type .env | findstr STRIPE
```
Should show: `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...`

**Check backend server/.env:**
```bash
type server\.env | findstr STRIPE
```
Should show: `STRIPE_SECRET_KEY=sk_test_...`

---

## 🎯 Visual Test:

### What You Should See:

**Before clicking "Proceed to Payment":**
```
┌─────────────────────────────┐
│ Your Cart                   │
├─────────────────────────────┤
│ [Delivery Address]          │
│ [Cart Items]                │
│ [Coupon Section]            │
│ [Price Summary]             │
│ [Proceed to Payment] ←─────┐
└─────────────────────────────┘
                               │
                               │ Click this
                               │
                               ▼
```

**After clicking "Proceed to Payment":**
```
┌─────────────────────────────┐
│ Complete Payment            │
│ [Back to Cart]              │
├─────────────────────────────┤
│ Payment Details             │
│ Total Amount: £75.00        │
│                             │
│ ┌─────────────────────────┐ │
│ │ Card number             │ │
│ │ [4242 4242 4242 4242]  │ │
│ │                         │ │
│ │ Expiry    CVC           │ │
│ │ [12/25]   [123]        │ │
│ └─────────────────────────┘ │
│                             │
│ [Pay £75.00]                │
└─────────────────────────────┘
```

---

## 🚨 Common Problems:

### Problem 1: Nothing Happens

**Symptoms:**
- Click button
- Nothing happens
- No console logs

**Fix:**
```javascript
// In console, check if function exists:
console.log('Cart component loaded:', !!document.querySelector('[data-cart]'))
```

### Problem 2: "Processing..." Forever

**Symptoms:**
- Button shows "Processing..."
- Never changes
- No form appears

**Fix:**
1. Check backend is running
2. Check console for errors
3. Restart both servers

### Problem 3: Form Doesn't Load

**Symptoms:**
- "Complete Payment" appears
- But no form below
- Shows loading spinner forever

**Fix:**
1. Check Stripe keys are correct
2. Check backend logs for errors
3. Verify payment endpoint works

---

## 🧪 Manual API Test:

### Test Payment Endpoint Directly:

1. **Get your auth token:**
```javascript
// In browser console:
copy(localStorage.getItem('auth_token'))
```

2. **Test with curl:**
```bash
curl -X POST http://localhost:5000/api/payment/create-payment-intent ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE" ^
  -d "{\"amount\":75,\"customerEmail\":\"test@example.com\"}"
```

3. **Expected response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

---

## ✅ Success Checklist:

When it's working, you should see:

- [x] Console shows all debug logs
- [x] Cart title changes to "Complete Payment"
- [x] "Back to Cart" button appears
- [x] Stripe payment form loads
- [x] Can see card input fields
- [x] Can enter test card: 4242 4242 4242 4242
- [x] Can click "Pay £75.00" button

---

## 🎉 Next Steps After Success:

1. **Test payment:**
   - Card: 4242 4242 4242 4242
   - Expiry: 12/25
   - CVC: 123
   - Click "Pay"

2. **Verify order created:**
   - Check order confirmation page
   - Check email for confirmation
   - Check admin panel for order

3. **Test with coupon:**
   - Apply coupon before payment
   - Verify discount applied
   - Complete payment

4. **Test error handling:**
   - Use decline card: 4000 0000 0000 0002
   - Verify error message shows
   - Verify order NOT created

---

## 📞 Need Help?

If you're still stuck:

1. **Copy all console logs** - Share them
2. **Copy any error messages** - From console and backend
3. **Check backend terminal** - Look for errors there
4. **Verify Stripe dashboard** - Check if test mode is enabled

**The integration is complete - we just need to debug why the form isn't showing!** 🚀
