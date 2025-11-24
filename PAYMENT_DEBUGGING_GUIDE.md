# 🔍 Payment Integration Debugging Guide

## Issue: "Proceed to Payment" button not showing payment form

### ✅ What I've Added:

1. **Console Logging** - Added detailed logs to track the payment flow
2. **Loading Indicator** - Shows spinner while payment form loads
3. **Better Error Handling** - More descriptive error messages

---

## 🧪 How to Debug:

### Step 1: Open Browser Console

1. Open your app in browser (http://localhost:5173)
2. Press F12 to open Developer Tools
3. Go to "Console" tab
4. Clear the console (click 🚫 icon)

### Step 2: Test the Payment Flow

1. Add items to cart
2. Click "Proceed to Payment"
3. Watch the console for these messages:

```
🚀 handleCheckout called
💳 Creating payment intent...
💰 Final amount: 75
📧 Customer email: your@email.com
🌐 API URL: http://localhost:5000/api/payment/create-payment-intent
📡 Payment response status: 200
📦 Payment data: { clientSecret: "...", paymentIntentId: "..." }
✅ Setting client secret and showing payment form
```

### Step 3: Check for Errors

**If you see errors, check:**

#### ❌ Error: "Failed to fetch" or "Network Error"
**Solution:**
- Backend server is not running
- Run: `cd server && npm run dev`

#### ❌ Error: "401 Unauthorized"
**Solution:**
- Not logged in
- Sign in to your account first

#### ❌ Error: "Address required"
**Solution:**
- No delivery address saved
- Go to Account page and add an address

#### ❌ Error: "Failed to create payment"
**Solution:**
- Check Stripe keys in `server/.env`
- Make sure `STRIPE_SECRET_KEY` is set correctly

#### ❌ Error: "Invalid API key"
**Solution:**
- Stripe key is incorrect
- Get new keys from https://dashboard.stripe.com/apikeys
- Update `server/.env` with correct key

---

## 🔧 Quick Fixes:

### Fix 1: Restart Both Servers

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
npm run dev
```

### Fix 2: Check Environment Variables

**Frontend (.env):**
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
```

**Backend (server/.env):**
```env
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
```

### Fix 3: Clear Browser Cache

1. Press Ctrl+Shift+Delete
2. Clear "Cached images and files"
3. Refresh page (Ctrl+F5)

### Fix 4: Check if Logged In

1. Open Console
2. Type: `localStorage.getItem('auth_token')`
3. If null, you need to sign in

### Fix 5: Check if Address is Saved

1. Go to Account page
2. Check "Delivery Addresses" section
3. Add an address if none exist

---

## 🧪 Manual Testing:

### Test 1: Check Backend Health

```bash
curl http://localhost:5000/health
```

**Expected:** `{"status":"ok","message":"Server is running"}`

### Test 2: Check Payment Endpoint (with auth token)

1. Get auth token from browser console:
   ```javascript
   localStorage.getItem('auth_token')
   ```

2. Test endpoint:
   ```bash
   curl -X POST http://localhost:5000/api/payment/create-payment-intent \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -d '{"amount":75,"customerEmail":"test@example.com"}'
   ```

**Expected:** `{"clientSecret":"pi_xxx_secret_xxx","paymentIntentId":"pi_xxx"}`

---

## 📊 What Should Happen:

### Correct Flow:

1. **Click "Proceed to Payment"**
   - Button shows "Processing..."
   - Console shows: "🚀 handleCheckout called"

2. **Payment Intent Created**
   - Console shows: "💳 Creating payment intent..."
   - Console shows: "📡 Payment response status: 200"

3. **Payment Form Appears**
   - Console shows: "✅ Setting client secret and showing payment form"
   - You see "Complete Payment" header
   - Stripe payment form loads below

4. **Enter Card Details**
   - Card number: 4242 4242 4242 4242
   - Expiry: 12/25
   - CVC: 123

5. **Click "Pay"**
   - Payment processes
   - Order created
   - Email sent
   - Redirect to confirmation

---

## 🚨 Common Issues:

### Issue 1: Button Does Nothing

**Symptoms:**
- Click "Proceed to Payment"
- Nothing happens
- No console logs

**Solution:**
- Check if you're logged in
- Check if address is saved
- Check browser console for JavaScript errors

### Issue 2: "Processing..." Never Stops

**Symptoms:**
- Button shows "Processing..."
- Never changes back
- No payment form appears

**Solution:**
- Backend is not responding
- Check if backend server is running
- Check console for network errors

### Issue 3: Payment Form Doesn't Load

**Symptoms:**
- "Complete Payment" header appears
- But no payment form below
- Shows "Loading payment form..." forever

**Solution:**
- Client secret not received
- Check backend logs for Stripe errors
- Verify Stripe secret key is correct

### Issue 4: "Invalid API Key" Error

**Symptoms:**
- Console shows Stripe API error
- "Invalid API key provided"

**Solution:**
- Stripe key is wrong or expired
- Get new keys from Stripe dashboard
- Update server/.env file
- Restart backend server

---

## 🎯 Checklist:

Before testing, verify:

- [ ] Backend server is running (port 5000)
- [ ] Frontend server is running (port 5173)
- [ ] Stripe publishable key in `.env`
- [ ] Stripe secret key in `server/.env`
- [ ] User is logged in
- [ ] User has saved address
- [ ] Items are in cart
- [ ] Browser console is open

---

## 💡 Pro Tips:

1. **Always check console first** - Most issues show up there
2. **Test with test cards** - Never use real cards in test mode
3. **Check network tab** - See if API calls are being made
4. **Restart servers** - Fixes 90% of issues
5. **Clear cache** - Old code might be cached

---

## 📞 Still Not Working?

If you've tried everything above and it's still not working:

1. **Check the console logs** - Copy all error messages
2. **Check backend logs** - Look at terminal running backend
3. **Verify Stripe keys** - Make sure they're test keys (pk_test_ and sk_test_)
4. **Test payment endpoint manually** - Use curl or Postman
5. **Check if Stripe is down** - Visit https://status.stripe.com

---

## 🎉 Success Indicators:

You'll know it's working when:

✅ Console shows all the 🚀 💳 📡 ✅ emojis
✅ Payment form appears with card input fields
✅ Can enter test card: 4242 4242 4242 4242
✅ Payment processes successfully
✅ Order is created
✅ Email confirmation is sent
✅ Redirected to order confirmation page

---

## 📝 Next Steps:

Once it's working:

1. Test with different test cards
2. Test with coupons
3. Test order creation
4. Test email notifications
5. Check admin panel for orders
6. Verify payment tracking

**Your payment integration is ready - just need to debug why it's not showing!** 🚀
