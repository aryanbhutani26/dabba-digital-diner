# Architecture Overview

## Before (Supabase)

```
┌─────────────────────────────────────────┐
│         React Frontend                  │
│  (Direct Supabase Client Queries)       │
│                                         │
│  - useAuth() → Supabase Auth            │
│  - Components → Supabase DB             │
│  - Real-time subscriptions              │
└─────────────────┬───────────────────────┘
                  │
                  │ Direct Connection
                  ↓
┌─────────────────────────────────────────┐
│         Supabase Cloud                  │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   PostgreSQL Database           │   │
│  │   - users                       │   │
│  │   - navbar_items                │   │
│  │   - coupons                     │   │
│  │   - menu_items                  │   │
│  │   - site_settings               │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   Built-in Auth                 │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## After (MongoDB)

```
┌─────────────────────────────────────────┐
│         React Frontend                  │
│      (API Client - fetch)               │
│                                         │
│  - useAuth() → API Client               │
│  - Components → API Client              │
│  - JWT Token in localStorage            │
└─────────────────┬───────────────────────┘
                  │
                  │ HTTP/REST API
                  │ (JSON)
                  ↓
┌─────────────────────────────────────────┐
│      Express.js Backend API             │
│         (Node.js Server)                │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   Routes                        │   │
│  │   - /api/auth                   │   │
│  │   - /api/coupons                │   │
│  │   - /api/navbar                 │   │
│  │   - /api/menu                   │   │
│  │   - /api/settings               │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   Middleware                    │   │
│  │   - JWT Authentication          │   │
│  │   - Role Authorization          │   │
│  │   - CORS                        │   │
│  └─────────────────────────────────┘   │
└─────────────────┬───────────────────────┘
                  │
                  │ MongoDB Driver
                  │
                  ↓
┌─────────────────────────────────────────┐
│       MongoDB Atlas Cloud               │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   MongoDB Database              │   │
│  │   Collections:                  │   │
│  │   - users                       │   │
│  │   - navbar_items                │   │
│  │   - coupons                     │   │
│  │   - menu_items                  │   │
│  │   - site_settings               │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## Request Flow Example

### Getting Coupons

**Before (Supabase):**
```
Frontend Component
    ↓
supabase.from('coupons').select('*').eq('is_active', true)
    ↓
Supabase API
    ↓
PostgreSQL Database
    ↓
Return Data
```

**After (MongoDB):**
```
Frontend Component
    ↓
api.getCoupons()
    ↓
fetch('http://localhost:5000/api/coupons')
    ↓
Express Route Handler
    ↓
MongoDB Query: db.collection('coupons').find({ isActive: true })
    ↓
MongoDB Atlas
    ↓
Return Data through API
    ↓
Frontend receives JSON
```

## Authentication Flow

### Sign In

```
1. User enters email/password
   ↓
2. Frontend: api.signIn(email, password)
   ↓
3. Backend: POST /api/auth/signin
   ↓
4. Backend: Check user in MongoDB
   ↓
5. Backend: Verify password with bcrypt
   ↓
6. Backend: Generate JWT token
   ↓
7. Backend: Return { token, user }
   ↓
8. Frontend: Store token in localStorage
   ↓
9. Frontend: Set user state
```

### Authenticated Request

```
1. Frontend: api.getAllCoupons() (admin only)
   ↓
2. Frontend: Add Authorization header with JWT
   ↓
3. Backend: authenticate middleware
   ↓
4. Backend: Verify JWT token
   ↓
5. Backend: isAdmin middleware
   ↓
6. Backend: Check user role
   ↓
7. Backend: Execute query
   ↓
8. Backend: Return data
```

## File Structure

```
project/
├── src/                          # Frontend
│   ├── components/
│   │   ├── Navbar.tsx           # Uses api.getNavbarItems()
│   │   └── admin/               # Admin components
│   ├── hooks/
│   │   └── useAuth.tsx          # Uses api client
│   ├── lib/
│   │   └── api.ts               # API client (replaces Supabase)
│   ├── pages/
│   │   ├── Index.tsx            # Uses api.getCoupons()
│   │   └── ...
│   └── App.tsx
│
├── server/                       # Backend (NEW)
│   ├── config/
│   │   └── db.js                # MongoDB connection
│   ├── middleware/
│   │   └── auth.js              # JWT auth
│   ├── routes/
│   │   ├── auth.js              # Authentication
│   │   ├── coupons.js           # Coupons CRUD
│   │   ├── navbar.js            # Navbar CRUD
│   │   ├── menu.js              # Menu CRUD
│   │   └── settings.js          # Settings
│   ├── .env                     # Environment variables
│   ├── package.json
│   ├── seed.js                  # Database seeding
│   ├── check-setup.js           # Setup verification
│   └── server.js                # Main server
│
├── .env                         # Frontend env (API URL)
├── QUICKSTART.md                # Quick setup guide
├── MONGODB_MIGRATION.md         # Detailed migration guide
└── ARCHITECTURE.md              # This file
```

## Key Differences

| Aspect | Supabase | MongoDB |
|--------|----------|---------|
| **Database Type** | PostgreSQL (Relational) | MongoDB (Document) |
| **Schema** | Strict schema with migrations | Flexible schema |
| **Queries** | SQL-like with Supabase client | MongoDB query language |
| **Auth** | Built-in with magic links, OAuth | Custom JWT implementation |
| **Real-time** | Built-in subscriptions | Need to implement (Socket.io) |
| **File Storage** | Built-in storage buckets | Need separate service (S3, Cloudinary) |
| **Admin Panel** | Built-in dashboard | Need to build custom |
| **Deployment** | Managed service | Self-hosted backend + MongoDB Atlas |
| **Cost** | Free tier then paid | Free tier then paid |
| **Control** | Limited backend control | Full backend control |

## Security Layers

```
┌─────────────────────────────────────────┐
│  1. CORS                                │
│     - Restrict origins                  │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  2. JWT Authentication                  │
│     - Verify token                      │
│     - Check expiration                  │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  3. Role Authorization                  │
│     - Check user role (admin/user)      │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  4. Input Validation                    │
│     - Validate request data             │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  5. Database Query                      │
│     - Execute with proper permissions   │
└─────────────────────────────────────────┘
```

## Advantages of New Architecture

✅ **Full Control**: Complete control over backend logic
✅ **Flexibility**: Easy to add custom business logic
✅ **Scalability**: Can optimize and scale independently
✅ **Portability**: Not locked into a specific platform
✅ **Learning**: Better understanding of full-stack development
✅ **Customization**: Can implement any feature you need

## Trade-offs

⚠️ **More Code**: Need to write backend API
⚠️ **Deployment**: Need to deploy backend separately
⚠️ **Maintenance**: Responsible for backend updates
⚠️ **Real-time**: Need to implement if required
⚠️ **File Storage**: Need separate solution

## Next Steps

1. ✅ Backend API created
2. ✅ Frontend API client created
3. ✅ Authentication migrated
4. ✅ Basic routes migrated (Navbar, Index)
5. ⏳ Update remaining components
6. ⏳ Add input validation
7. ⏳ Implement rate limiting
8. ⏳ Add logging
9. ⏳ Deploy to production
