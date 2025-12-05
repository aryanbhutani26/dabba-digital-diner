# Quick Start Guide - MongoDB Migration

## 🚀 Get Started in 5 Minutes

### 1. Set Up MongoDB Atlas (2 minutes)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account
2. Create a new cluster (choose the free tier)
3. Create a database user:
   - Click "Database Access" → "Add New Database User"
   - Username: `indiya_admin`
   - Password: (generate a secure password)
   - User Privileges: "Read and write to any database"
4. Whitelist your IP:
   - Click "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
5. Get connection string:
   - Click "Database" → "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password

### 2. Configure Backend (1 minute)

```bash
cd server
cp .env.example .env
```

Edit `server/.env` and add your MongoDB connection string:
```
MONGODB_URI=mongodb+srv://indiya_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/indiya-restaurant?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=my-super-secret-jwt-key-12345
NODE_ENV=development
```

### 3. Install & Seed (1 minute)

```bash
# Install backend dependencies
npm install

# Seed the database with initial data
npm run seed
```

This creates:
- Admin user: `admin@indiya.com` / `admin123`
- Sample navbar items
- Sample coupons
- Sample menu items
- Default settings

### 4. Configure Frontend (30 seconds)

In the root directory:
```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

### 5. Start Everything (30 seconds)

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 6. Test It! ✅

1. Open `http://localhost:8080`
2. You should see the homepage with coupons
3. Login at `/auth` with:
   - Email: `admin@indiya.com`
   - Password: `admin123`
4. Access admin panel at `/admin`

## 🎯 What Changed?

### Removed:
- ❌ Supabase client
- ❌ Supabase auth
- ❌ Direct database queries from frontend

### Added:
- ✅ Express.js backend API
- ✅ MongoDB Atlas database
- ✅ JWT authentication
- ✅ RESTful API endpoints
- ✅ API client in frontend

## 📝 Key Differences

| Feature | Supabase | MongoDB |
|---------|----------|---------|
| Database | PostgreSQL | MongoDB |
| Auth | Built-in | Custom JWT |
| Queries | Direct from frontend | Through API |
| Real-time | Built-in | Need to implement |
| File Storage | Built-in | Need separate service |

## 🔧 Common Commands

```bash
# Backend
cd server
npm run dev          # Start development server
npm run seed         # Seed database
npm start            # Start production server

# Frontend
npm run dev          # Start development server
npm run build        # Build for production
```

## 🐛 Troubleshooting

**Can't connect to MongoDB?**
- Check your connection string
- Verify IP is whitelisted
- Ensure password doesn't contain special characters (or URL encode them)

**Backend won't start?**
- Check if port 5000 is available
- Verify all environment variables are set
- Check MongoDB connection string format

**Frontend can't reach API?**
- Ensure backend is running on port 5000
- Check `VITE_API_URL` in `.env`
- Look for CORS errors in browser console

**Authentication not working?**
- Clear localStorage in browser
- Check JWT_SECRET is set in backend
- Verify token is being sent in requests

## 📚 Next Steps

- Read [MONGODB_MIGRATION.md](./MONGODB_MIGRATION.md) for detailed documentation
- Update admin components to use new API
- Implement remaining pages (Menu, About, etc.)
- Set up production deployment

## 🆘 Need Help?

Check the detailed migration guide: [MONGODB_MIGRATION.md](./MONGODB_MIGRATION.md)
