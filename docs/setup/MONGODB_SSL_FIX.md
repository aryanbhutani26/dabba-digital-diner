# 🔧 MongoDB SSL Error Fix

## Error: `tlsv1 alert internal error`

This error occurs when there's an SSL/TLS handshake issue with MongoDB Atlas.

## ✅ Solutions Applied

### 1. Updated Connection String
Added SSL/TLS parameters:
```
?tls=true&tlsAllowInvalidCertificates=true
```

### 2. Updated MongoDB Client Options
Added SSL configuration in `server/config/db.js`

## 🚀 Try These Steps

### Step 1: Restart Server
```bash
# Stop server (Ctrl+C)
npm run dev
```

### Step 2: If Still Failing - Check MongoDB Atlas

**Go to MongoDB Atlas Dashboard:**

1. **Check IP Whitelist:**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Add `0.0.0.0/0` (allows all IPs - for development)
   - Or add your specific IP

2. **Check Database User:**
   - Go to "Database Access"
   - Verify user: `dineindiyarestaurant_db_user`
   - Password: `Qn57J6VBgVRDz00G`
   - Make sure user has "Read and write to any database" permission

3. **Get Fresh Connection String:**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace in `server/.env`

### Step 3: Alternative Connection String

If the issue persists, try this format:

```env
MONGODB_URI=mongodb://dineindiyarestaurant_db_user:Qn57J6VBgVRDz00G@cluster0.cch1f2i.mongodb.net:27017/indiya-restaurant?ssl=true&replicaSet=atlas-zkgg4t-shard-0&authSource=admin&retryWrites=true&w=majority
```

### Step 4: Check Node.js Version

This error can occur with older Node.js versions.

```bash
node --version
```

**Recommended:** Node.js v18 or higher

**Update if needed:**
- Download from: https://nodejs.org/

### Step 5: Update MongoDB Driver

```bash
cd server
npm install mongodb@latest
npm run dev
```

### Step 6: Test Connection Manually

Create `server/test-connection.js`:

```javascript
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  tls: true,
  tlsAllowInvalidCertificates: true,
});

async function testConnection() {
  try {
    console.log('Attempting to connect...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const db = client.db();
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    await client.close();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();
```

Run it:
```bash
node test-connection.js
```

## 🔍 Common Causes

1. **IP Not Whitelisted** ⚠️ Most Common
   - Solution: Add your IP in MongoDB Atlas

2. **Wrong Password**
   - Solution: Reset password in MongoDB Atlas

3. **Network/Firewall**
   - Solution: Check firewall settings
   - Try different network (mobile hotspot)

4. **MongoDB Atlas Issue**
   - Solution: Check MongoDB Atlas status
   - Visit: https://status.mongodb.com/

5. **Outdated Node.js**
   - Solution: Update to Node.js v18+

## 🎯 Quick Fix Checklist

- [ ] IP whitelisted in MongoDB Atlas (0.0.0.0/0)
- [ ] Database user exists with correct password
- [ ] User has read/write permissions
- [ ] Node.js version 18 or higher
- [ ] MongoDB driver updated
- [ ] Connection string has SSL parameters
- [ ] Firewall not blocking port 27017
- [ ] Internet connection stable

## 💡 Alternative: Use Local MongoDB

If MongoDB Atlas keeps failing, use local MongoDB:

```bash
# Install MongoDB locally
# Windows: Download from mongodb.com
# Mac: brew install mongodb-community
# Linux: sudo apt install mongodb

# Update .env
MONGODB_URI=mongodb://localhost:27017/indiya-restaurant
```

## 🆘 Still Not Working?

**Option 1: Create New Cluster**
- Go to MongoDB Atlas
- Create a new free cluster
- Get new connection string
- Update `.env`

**Option 2: Use Different Database**
- Try MongoDB Atlas M0 (free tier)
- Or use local MongoDB
- Or use different cloud provider

**Option 3: Contact Support**
- MongoDB Atlas Support
- Check their status page
- Community forums

---

**Most likely fix:** Add `0.0.0.0/0` to IP whitelist in MongoDB Atlas Network Access! 🎯
