# 🚀 Stripe Integration - Quick Start

## ⚡ 5-Minute Setup

### 1. Get Stripe Keys (2 minutes)
```
1. Go to https://stripe.com
2. Sign up (free)
3. Go to https://dashboard.stripe.com/apikeys
4. Copy both keys:
   - Publishable key (pk_test_...)
   - Secret key (sk_test_...)
```

### 2. Update Environment Variables (1 minute)

**Frontend (.env):**
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
```

**Backend (server/.env):**
```env
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
```

### 3. Restart Servers (1 minute)
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend  
npm run dev
```

### 4. Test Payment (1 minute)
```
1. Add items to cart
2. Click "Proceed to Payment"
3. Enter test card: 4242 4242 4242 4242
4. Expiry: 12/25, CVC: 123
5. Click "Pay"
6. ✅ Success!
```

---

## 💳 Test Cards

| Card | Result |
|------|--------|
| 4242 4242 4242 4242 | ✅ Success |
| 4000 0000 0000 0002 | ❌ Declined |
| 4000 0025 0000 3155 | 🔐 3D Secure |

---

## 🎯 Payment Flow

```
🛒 Cart → 💳 Payment → ✅ Confirmed → 📧 Email → 🎉 Done
```

---

## ✅ What Works

- ✅ Secure card payments
- ✅ Real-time validation
- ✅ Order creation
- ✅ Email confirmations
- ✅ Admin tracking
- ✅ Refund support

---

## 🚨 Troubleshooting

**Payment form not showing?**
- Check VITE_STRIPE_PUBLISHABLE_KEY in .env
- Restart frontend server

**Payment failed?**
- Check STRIPE_SECRET_KEY in server/.env
- Restart backend server
- Use correct test card: 4242 4242 4242 4242

**Order not created?**
- Check backend logs
- Verify MongoDB connection

---

## 📞 Support

- **Stripe Docs:** https://stripe.com/docs
- **Test Cards:** https://stripe.com/docs/testing
- **Dashboard:** https://dashboard.stripe.com

---

## 🎊 You're Ready!

Your restaurant can now:
- ✅ Accept real payments
- ✅ Process orders automatically
- ✅ Generate revenue
- ✅ Scale your business

**Just add your Stripe keys and start taking orders!** 🚀💰
