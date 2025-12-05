# 🚀 Get Started with MongoDB Migration

Welcome! Your restaurant website has been migrated from Supabase to MongoDB Atlas. This guide will get you up and running.

## 📋 What You Need

1. **MongoDB Atlas Account** (free) - [Sign up here](https://www.mongodb.com/cloud/atlas)
2. **Node.js** (v18+) - [Download here](https://nodejs.org/)
3. **A code editor** (VS Code recommended)
4. **15 minutes** of your time

## 🎯 Quick Start (5 Steps)

### Step 1: Set Up MongoDB Atlas (3 minutes)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up
2. Create a **FREE** cluster (M0 Sandbox)
3. Create a database user:
   - Username: `indiya_admin`
   - Password: (generate a strong one)
4. Whitelist your IP:
   - Click "Network Access"
   - Add "0.0.0.0/0" (allows all IPs - for development only)
5. Get your connection string:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://indiya_admin:<password>@cluster0.xxxxx.mongodb.net/`

### Step 2: Configure Backend (2 minutes)

```bash
# Navigate to server folder
cd server

# Copy environment template
cp .env.example .env
```

Edit `server/.env` with your favorite editor:
```env
MONGODB_URI=mongodb+srv://indiya_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/indiya-restaurant?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=change-this-to-a-random-string-abc123xyz789
NODE_ENV=development
```

**Important:** Replace `YOUR_PASSWORD` with your actual MongoDB password!

### Step 3: Install & Seed (2 minutes)

```bash
# Still in server folder
npm install

# Check if everything is configured correctly
npm run check

# Seed the database with initial data
npm run seed
```

This creates:
- ✅ Admin user: `admin@indiya.com` / `admin123`
- ✅ Sample navbar items
- ✅ Sample coupons
- ✅ Sample menu items
- ✅ Default settings

### Step 4: Configure Frontend (1 minute)

```bash
# Go back to root folder
cd ..

# Copy environment template
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 5: Start Everything (1 minute)

**Terminal 1 - Start Backend:**
```bash
cd server
npm run dev
```

You should see:
```
✅ MongoDB Connected Successfully
🚀 Server running on port 5000
```

**Terminal 2 - Start Frontend:**
```bash
# In root folder
npm run dev
```

You should see:
```
VITE ready in XXX ms
➜  Local:   http://localhost:8080/
```

## 🎉 You're Done!

Open your browser and go to: **http://localhost:8080**

### Test It Out:

1. **Homepage** - Should show coupons with golden styling
2. **Login** - Go to `/auth` and login with:
   - Email: `admin@indiya.com`
   - Password: `admin123`
3. **Admin Panel** - After login, click the settings icon or go to `/admin`

## 🧪 Verify Everything Works

Run the API test script:
```bash
cd server
npm test
```

This will test all API endpoints and show you what's working.

## 📚 Documentation

- **Quick Reference**: [QUICKSTART.md](./QUICKSTART.md)
- **Detailed Guide**: [MONGODB_MIGRATION.md](./MONGODB_MIGRATION.md)
- **Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Progress Tracking**: [MIGRATION_CHECKLIST.md](./MIGRATION_CHECKLIST.md)

## 🔧 Common Issues

### "Cannot connect to MongoDB"
- Check your connection string in `server/.env`
- Verify your IP is whitelisted in MongoDB Atlas
- Make sure your password doesn't have special characters (or URL encode them)

### "Port 5000 already in use"
- Change `PORT=5000` to `PORT=5001` in `server/.env`
- Update `VITE_API_URL` in root `.env` to match

### "Module not found"
- Run `npm install` in both root and server folders
- Make sure you're using Node.js v18 or higher

### "No coupons showing"
- Make sure backend is running
- Check browser console for errors
- Verify `VITE_API_URL` is correct in `.env`
- Run `npm run seed` again if database is empty

## 🎨 What's New?

### Golden Coupon Cards
Your coupons now have a beautiful royal golden color scheme that matches your brand!

### Dark Mode Only
The app now opens in dark mode by default and stays in dark mode.

### MongoDB Backend
- Full control over your data
- Flexible schema
- Easy to scale
- Free tier available

## 📝 Next Steps

1. **Update remaining pages** - Some pages still need to be connected to the API
2. **Customize your data** - Add your own menu items, coupons, etc.
3. **Deploy to production** - When ready, deploy both frontend and backend
4. **Add features** - The backend is ready for you to add custom features

## 🆘 Need Help?

1. Check the [MIGRATION_CHECKLIST.md](./MIGRATION_CHECKLIST.md) for progress tracking
2. Read the [MONGODB_MIGRATION.md](./MONGODB_MIGRATION.md) for detailed info
3. Look at [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the system

## 🎯 Quick Commands Reference

```bash
# Backend (in server folder)
npm run dev      # Start development server
npm run seed     # Seed database
npm run check    # Verify setup
npm test         # Test API endpoints
npm start        # Start production server

# Frontend (in root folder)
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🚀 Ready to Deploy?

When you're ready to deploy to production:

1. **Backend**: Deploy to Railway, Render, or Heroku
2. **Frontend**: Deploy to Vercel or Netlify
3. Update environment variables for production
4. Update CORS settings in backend

See [MONGODB_MIGRATION.md](./MONGODB_MIGRATION.md) for deployment details.

---

**Happy coding! 🎉**

If you run into any issues, check the documentation files or the troubleshooting sections.
