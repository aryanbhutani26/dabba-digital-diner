# MongoDB Atlas Migration Guide

This guide will help you migrate from Supabase to MongoDB Atlas.

## Prerequisites

1. **MongoDB Atlas Account**: Sign up at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. **Node.js**: Ensure you have Node.js installed (v18 or higher recommended)

## Step 1: Set Up MongoDB Atlas

1. Create a new cluster in MongoDB Atlas
2. Create a database user with read/write permissions
3. Whitelist your IP address (or use 0.0.0.0/0 for development)
4. Get your connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

## Step 2: Configure Environment Variables

### Frontend (.env in root directory)
```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

### Backend (server/.env)
```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/indiya-restaurant?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this
NODE_ENV=development
```

## Step 3: Install Dependencies

### Install Backend Dependencies
```bash
cd server
npm install
```

## Step 4: Seed Initial Data (Optional)

You can manually add initial data through MongoDB Atlas UI or create a seed script. Here's the collection structure:

### Collections:

**users**
```json
{
  "email": "admin@indiya.com",
  "password": "hashed_password",
  "name": "Admin User",
  "role": "admin",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**navbar_items**
```json
{
  "name": "Home",
  "path": "/",
  "sortOrder": 1,
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**coupons**
```json
{
  "title": "20% OFF",
  "subtitle": "Weekend Dinner",
  "description": "Valid on Fri-Sun from 6 PM onwards",
  "code": "WEEKEND20",
  "icon": "Percent",
  "color": "from-amber-500 to-amber-600",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**menu_items**
```json
{
  "name": "Grilled Ribeye",
  "description": "16oz prime ribeye with roasted vegetables",
  "price": "45.99",
  "category": "Main Course",
  "image": "https://example.com/image.jpg",
  "allergens": ["dairy"],
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**site_settings**
```json
{
  "key": "services_visible",
  "value": true,
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Step 5: Start the Backend Server

```bash
cd server
npm run dev
```

The server should start on `http://localhost:5000`

## Step 6: Start the Frontend

In a new terminal:
```bash
npm run dev
```

The frontend should start on `http://localhost:8080`

## Step 7: Create Admin User

You can create an admin user by:

1. Sign up through the UI at `/auth`
2. Manually update the user's role in MongoDB Atlas:
   - Go to your `users` collection
   - Find your user
   - Change `role` from `"user"` to `"admin"`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login
- `GET /api/auth/me` - Get current user (requires auth)

### Coupons
- `GET /api/coupons` - Get active coupons (public)
- `GET /api/coupons/all` - Get all coupons (admin)
- `POST /api/coupons` - Create coupon (admin)
- `PUT /api/coupons/:id` - Update coupon (admin)
- `DELETE /api/coupons/:id` - Delete coupon (admin)

### Navbar
- `GET /api/navbar` - Get active navbar items (public)
- `GET /api/navbar/all` - Get all navbar items (admin)
- `POST /api/navbar` - Create navbar item (admin)
- `PUT /api/navbar/:id` - Update navbar item (admin)
- `DELETE /api/navbar/:id` - Delete navbar item (admin)

### Menu
- `GET /api/menu` - Get active menu items (public)
- `GET /api/menu/all` - Get all menu items (admin)
- `POST /api/menu` - Create menu item (admin)
- `PUT /api/menu/:id` - Update menu item (admin)
- `DELETE /api/menu/:id` - Delete menu item (admin)

### Settings
- `GET /api/settings/:key` - Get setting by key (public)
- `GET /api/settings` - Get all settings (admin)
- `PUT /api/settings/:key` - Update setting (admin)

## Deployment

### Backend Deployment (Railway, Render, or Heroku)
1. Push your code to GitHub
2. Connect your repository to your hosting platform
3. Set environment variables
4. Deploy

### Frontend Deployment (Vercel, Netlify)
1. Update `VITE_API_URL` to your production API URL
2. Deploy as usual

## Troubleshooting

**Connection Issues:**
- Verify MongoDB connection string
- Check IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions

**Authentication Issues:**
- Check JWT_SECRET is set
- Verify token is being stored in localStorage
- Check browser console for errors

**CORS Issues:**
- Ensure backend CORS is configured correctly
- Update CORS origin in production

## Migration Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Environment variables configured
- [ ] Backend dependencies installed
- [ ] Backend server running
- [ ] Initial data seeded
- [ ] Admin user created
- [ ] Frontend updated with API URL
- [ ] Frontend running and connected to backend
- [ ] Authentication working
- [ ] All CRUD operations tested
