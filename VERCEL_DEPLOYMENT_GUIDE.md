# 🚀 Vercel Deployment Guide with Thermal Printing

## 🎯 **Production Architecture**

```
[Customer] → [Vercel Frontend] → [Vercel Backend API] → [Local Print Server] → [Thermal Printers]
```

Your website will be hosted on Vercel (fast, global), but printing will be handled by a local server in your restaurant.

## 📋 **Step-by-Step Deployment**

### **Phase 1: Set Up Local Print Server**

**1. Install Local Print Server on Restaurant Computer**
```bash
# Copy these files to a computer in your restaurant:
- local-print-server.js
- local-print-server-package.json (rename to package.json)
- local-print-server.env (rename to .env)
```

**2. Install Dependencies**
```bash
npm install
```

**3. Configure Environment**
```bash
# Edit .env file with your actual settings:
LOCAL_PRINT_PORT=3001
KITCHEN_PRINTER_IP=192.168.1.227
BILL_PRINTER_IP=192.168.1.251
WEBHOOK_SECRET=indiya-restaurant-print-webhook-2024
```

**4. Start Local Print Server**
```bash
npm start
```

**5. Test Local Server**
```bash
# Test kitchen printer
curl -X POST http://localhost:3001/test-print/kitchen

# Test bill printer  
curl -X POST http://localhost:3001/test-print/bill
```

### **Phase 2: Deploy to Vercel**

**1. Prepare for Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login
```

**2. Configure Environment Variables on Vercel**
Go to your Vercel dashboard and add these environment variables:

```bash
# Database
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret

# Printing
ENABLE_PRINTING=true
LOCAL_PRINT_SERVER_URL=http://YOUR-RESTAURANT-PUBLIC-IP:3001
WEBHOOK_SECRET=indiya-restaurant-print-webhook-2024

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Other services (Stripe, ImageKit, etc.)
STRIPE_SECRET_KEY=your-stripe-key
IMAGEKIT_PUBLIC_KEY=your-imagekit-key
# ... etc
```

**3. Deploy**
```bash
# Deploy backend
cd backend
vercel

# Deploy frontend  
cd ../frontend
vercel
```

### **Phase 3: Network Configuration**

**1. Get Your Restaurant's Public IP**
```bash
# On restaurant computer, visit:
https://whatismyipaddress.com/
```

**2. Configure Router Port Forwarding**
- Login to your restaurant's router admin panel
- Forward port 3001 to the computer running the print server
- Example: External Port 3001 → Internal IP 192.168.1.4:3001

**3. Update Vercel Environment**
```bash
# Update this in Vercel dashboard:
LOCAL_PRINT_SERVER_URL=http://YOUR-PUBLIC-IP:3001
```

**4. Test End-to-End**
- Place an order on your live Vercel website
- Check if printers receive the order automatically

## 🔧 **Alternative Solutions**

### **Option 1: VPN Tunnel (Recommended for Security)**
```bash
# Use ngrok to create secure tunnel
npm install -g ngrok
ngrok http 3001

# Use the ngrok URL in Vercel:
LOCAL_PRINT_SERVER_URL=https://abc123.ngrok.io
```

### **Option 2: Cloud VPS**
- Deploy your backend on a VPS (DigitalOcean, AWS EC2)
- Connect VPS to restaurant network via VPN
- More complex but more reliable

### **Option 3: Dedicated Server**
- Host entire application on a server in your restaurant
- No Vercel needed, but requires more maintenance

## 🛡️ **Security Considerations**

**1. Webhook Secret**
- Use a strong, unique webhook secret
- Never expose it publicly

**2. Firewall Rules**
- Only allow connections from Vercel IPs
- Use HTTPS when possible

**3. Local Network Security**
- Ensure printers are on a secure network
- Regular security updates

## 📊 **Monitoring & Troubleshooting**

**1. Local Print Server Logs**
```bash
# Check if server is running
curl http://localhost:3001/health

# View logs
npm run dev  # Shows detailed logs
```

**2. Vercel Function Logs**
- Check Vercel dashboard for function logs
- Look for printing-related errors

**3. Common Issues**

| Issue | Solution |
|-------|----------|
| Printers offline | Check IP addresses and network |
| Webhook timeout | Verify LOCAL_PRINT_SERVER_URL |
| Orders not printing | Check webhook secret |
| Network unreachable | Verify port forwarding |

## 🎯 **Production Checklist**

- [ ] Local print server running on restaurant computer
- [ ] Both printers responding to test prints
- [ ] Router port forwarding configured
- [ ] Vercel environment variables set
- [ ] End-to-end test successful
- [ ] Webhook secret configured
- [ ] Monitoring setup

## 🚨 **Fallback Plan**

If printing fails:
1. Orders are still created successfully
2. Admin receives email notification
3. Manual printing from admin dashboard
4. Order details logged for manual processing

## 📞 **Support**

If you need help with deployment:
1. Check local print server logs
2. Verify network connectivity
3. Test webhook endpoints
4. Contact support with specific error messages

---

**Your thermal printing system is now production-ready for Vercel deployment!** 🎉