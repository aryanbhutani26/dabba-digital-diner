# MongoDB Connection Troubleshooting

## Error: Server selection timed out

This error means the server cannot connect to MongoDB Atlas. Here are the solutions:

## Quick Test

Run this command to test your MongoDB connection:

```bash
cd server
npm run test-db
```

## Common Causes & Solutions

### 1. MongoDB Atlas Cluster is Paused ⏸️

**Free tier clusters automatically pause after 60 days of inactivity.**

**Solution:**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Login to your account
3. Find your cluster
4. If it shows "Paused", click **"Resume"**
5. Wait 2-3 minutes for it to start
6. Try connecting again

### 2. IP Address Not Whitelisted 🔒

**MongoDB Atlas blocks connections from non-whitelisted IPs.**

**Solution:**
1. Go to MongoDB Atlas → **Network Access**
2. Click **"Add IP Address"**
3. Choose one:
   - **"Add Current IP Address"** (recommended for security)
   - **"Allow Access from Anywhere"** (0.0.0.0/0) - easier but less secure
4. Click **"Confirm"**
5. Wait 1-2 minutes for changes to apply
6. Try connecting again

### 3. Incorrect Connection String 🔗

**Check your `.env` file has the correct credentials.**

**Solution:**
1. Open `server/.env`
2. Verify `MONGODB_URI` is correct
3. Get a fresh connection string from MongoDB Atlas:
   - Go to **Clusters** → **Connect** → **Connect your application**
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Update `server/.env`

### 4. Firewall/Network Issues 🔥

**Your firewall or network might be blocking MongoDB port (27017).**

**Solution:**
- Try connecting from a different network (mobile hotspot)
- Disable firewall temporarily to test
- Check if your ISP blocks MongoDB ports
- Use a VPN if needed

### 5. Internet Connection 🌐

**Slow or unstable internet can cause timeouts.**

**Solution:**
- Check your internet connection
- Try again with a stable connection
- The timeout has been increased to 30 seconds

## Configuration Changes Made

I've updated the MongoDB configuration to:
- Increased timeout from 5s to 30s
- Added retry logic
- Added better error messages
- Added connection test script

## Still Having Issues?

If none of the above work:

1. **Create a new cluster:**
   - Go to MongoDB Atlas
   - Create a new free cluster
   - Get the new connection string
   - Update `server/.env`

2. **Check MongoDB Atlas Status:**
   - Visit [MongoDB Status Page](https://status.mongodb.com/)
   - Check if there are any ongoing issues

3. **Contact Support:**
   - MongoDB Atlas has free support for connection issues
   - Use the chat support in MongoDB Atlas dashboard

## Test Commands

```bash
# Test MongoDB connection
cd server
npm run test-db

# Reset admin password (requires working connection)
npm run reset-admin

# Seed navbar items (requires working connection)
npm run seed:navbar

# Start server
npm run dev
```
