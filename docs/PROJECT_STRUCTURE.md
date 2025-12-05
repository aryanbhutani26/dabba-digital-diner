# 📁 Project Structure

## Overview

The project is organized into **three main folders** for clarity and ease of deployment:

1. **frontend/** - React + TypeScript frontend application
2. **backend/** - Node.js + Express backend API  
3. **docs/** - All documentation, guides, and scripts

```
dabba-digital-diner/
├── 📁 frontend/                # Frontend Application
│   ├── 📁 src/                # Source code
│   │   ├── 📁 assets/        # Images and media files
│   │   ├── 📁 components/    # React components
│   │   │   ├── 📁 admin/    # Admin-specific components
│   │   │   └── 📁 ui/       # Reusable UI components (shadcn)
│   │   ├── 📁 hooks/         # Custom React hooks
│   │   ├── 📁 lib/           # Utilities and API client
│   │   └── 📁 pages/         # Page components
│   ├── 📁 public/            # Static assets
│   ├── 📁 node_modules/      # Dependencies (not in git)
│   ├── .env                  # Environment variables (not in git)
│   ├── .env.example          # Environment template
│   ├── package.json          # Frontend dependencies
│   ├── vite.config.ts        # Vite configuration
│   ├── tailwind.config.ts    # Tailwind CSS config
│   ├── tsconfig.json         # TypeScript config
│   └── index.html            # HTML entry point
│
├── 📁 backend/                 # Backend Application
│   ├── 📁 config/            # Configuration files
│   │   └── db.js            # Database connection
│   ├── 📁 middleware/        # Express middleware
│   │   └── auth.js          # Authentication middleware
│   ├── 📁 routes/            # API routes
│   │   ├── auth.js          # Authentication
│   │   ├── menu.js          # Menu management
│   │   ├── orders.js        # Order management
│   │   ├── dabbaServices.js # Dabba services
│   │   ├── payment.js       # Payment processing
│   │   ├── reservations.js  # Table reservations
│   │   ├── users.js         # User management
│   │   ├── coupons.js       # Coupons
│   │   ├── promotions.js    # Promotions
│   │   ├── vouchers.js      # Vouchers
│   │   ├── navbar.js        # Navigation items
│   │   └── settings.js      # App settings
│   ├── 📁 node_modules/      # Dependencies (not in git)
│   ├── .env                  # Environment variables (not in git)
│   ├── .env.example          # Environment template
│   ├── package.json          # Backend dependencies
│   └── server.js             # Express server entry point
│
├── 📁 docs/                    # Documentation
│   ├── 📁 setup/             # Setup and installation guides
│   │   ├── DEPLOYMENT.md    # Deployment guide
│   │   ├── QUICKSTART.md    # Quick start guide
│   │   ├── MONGODB_MIGRATION.md
│   │   ├── STRIPE_SETUP_GUIDE.md
│   │   ├── GOOGLE_OAUTH_SETUP.md
│   │   └── ...
│   ├── 📁 guides/            # Feature and usage guides
│   │   ├── ARCHITECTURE.md
│   │   ├── ORDER_MANAGEMENT_FLOW.md
│   │   ├── LIVE_TRACKING_GUIDE.md
│   │   └── ...
│   ├── 📁 reports/           # Development reports
│   │   └── ...              # Historical development docs
│   ├── 📁 scripts/           # Utility scripts
│   │   └── test-payment-endpoint.js
│   ├── PROJECT_STRUCTURE.md  # This file
│   └── DEPLOYMENT_CHECKLIST.md
│
├── 📁 .git/                    # Git version control
├── 📁 .vscode/                 # VS Code settings
├── .gitignore                  # Git ignore rules
├── README.md                   # Main project documentation
├── DEPLOYMENT_READY.md         # Deployment quick guide
└── package.json                # Root package.json (convenience scripts)
```

## 📂 Directory Descriptions

### `/frontend`
React + TypeScript frontend application built with Vite.

**Key subdirectories:**
- **src/assets/** - Images, fonts, and media files
- **src/components/** - Reusable React components
  - **admin/** - Admin panel specific components
  - **ui/** - Base UI components from shadcn/ui
- **src/hooks/** - Custom React hooks for shared logic
- **src/lib/** - Utility functions and API client
- **src/pages/** - Top-level page components (routes)
- **public/** - Static assets served directly

### `/backend`
Node.js + Express backend API with MongoDB.

**Key subdirectories:**
- **config/** - Database and service configurations
- **middleware/** - Express middleware (auth, validation, etc.)
- **routes/** - API endpoint definitions

### `/docs`
All documentation organized by category:
- **setup/** - Installation and configuration guides
- **guides/** - Feature documentation and how-tos
- **reports/** - Development progress and changelogs
- **scripts/** - Utility scripts for testing and maintenance

## 🔑 Key Files

### Root Level

| File | Purpose |
|------|---------|
| `README.md` | Main project documentation |
| `DEPLOYMENT_READY.md` | Quick deployment guide |
| `package.json` | Root package.json with convenience scripts |
| `.gitignore` | Git ignore rules |

### Frontend Configuration

| File | Purpose |
|------|---------|
| `frontend/package.json` | Frontend dependencies and scripts |
| `frontend/vite.config.ts` | Vite build configuration |
| `frontend/tailwind.config.ts` | Tailwind CSS customization |
| `frontend/tsconfig.json` | TypeScript compiler options |
| `frontend/eslint.config.js` | Code linting rules |
| `frontend/components.json` | Shadcn/ui configuration |
| `frontend/.env` | Frontend environment variables (not in git) |

### Backend Configuration

| File | Purpose |
|------|---------|
| `backend/package.json` | Backend dependencies and scripts |
| `backend/server.js` | Express server entry point |
| `backend/.env` | Backend environment variables (not in git) |

## 📦 Component Organization

### Frontend Components

**UI Components** (`frontend/src/components/ui/`)
- Base components from shadcn/ui library
- Customizable and follow Radix UI patterns
- Examples: Button, Card, Dialog, Input, Select, etc.

**Feature Components** (`frontend/src/components/`)
- Application-specific components
- Examples: Navbar, Footer, CartSheet, etc.

**Admin Components** (`frontend/src/components/admin/`)
- Components used exclusively in admin dashboard
- Examples: AddMenuItemDialog, EditCouponDialog, etc.

**Page Components** (`frontend/src/pages/`)
- Top-level components representing entire pages/routes
- Examples: Index, Menu, Admin, Checkout, etc.

## 🗄️ Database Collections

MongoDB collections used by the application:

| Collection | Purpose |
|------------|---------|
| `users` | User accounts and profiles |
| `menu_items` | Restaurant menu items |
| `dabba_services` | Tiffin/meal subscription packages |
| `orders` | Customer orders |
| `reservations` | Table bookings |
| `coupons` | Discount codes |
| `promotions` | Marketing campaigns |
| `vouchers` | Gift vouchers |
| `navbar_items` | Dynamic navigation items |
| `settings` | Application settings |

## 🔄 Data Flow

```
User Request
    ↓
React Component (frontend/src/pages/)
    ↓
API Client (frontend/src/lib/api.ts)
    ↓
Express Route (backend/routes/*.js)
    ↓
MongoDB Collection
    ↓
Response back through chain
```

## 🎨 Styling Architecture

- **Tailwind CSS**: Utility-first CSS framework
- **CSS Variables**: Theme colors defined in `frontend/src/index.css`
- **Dark Mode**: Supported via `next-themes`
- **Component Variants**: Using `class-variance-authority`

## 🔐 Authentication Flow

```
Login Request
    ↓
backend/routes/auth.js
    ↓
JWT Token Generated
    ↓
Stored in localStorage (frontend)
    ↓
Included in API requests
    ↓
Verified by backend/middleware/auth.js
```

## 📱 Responsive Design

- **Mobile First**: Tailwind breakpoints (sm, md, lg, xl)
- **Adaptive Components**: Different layouts for mobile/desktop
- **Touch Optimized**: Mobile-friendly interactions

## 🚀 Build Process

### Development
```bash
# From root
npm run dev              # Run both frontend and backend

# Or separately
npm run dev:frontend     # Start Vite dev server
npm run dev:backend      # Start Express server
```

### Production
```bash
npm run build:frontend   # Build frontend
npm run start:backend    # Start production server
```

## 📝 Naming Conventions

- **Components**: PascalCase (e.g., `CartSheet.tsx`)
- **Utilities**: camelCase (e.g., `api.ts`)
- **Routes**: kebab-case (e.g., `/api/dabba-services`)
- **Database**: snake_case (e.g., `menu_items`)
- **Folders**: lowercase (e.g., `frontend`, `backend`, `docs`)

## 🔧 Development Workflow

1. Create feature branch
2. Develop in `frontend/` or `backend/`
3. Test locally
4. Commit changes
5. Push and create PR
6. Deploy to staging
7. Test in staging
8. Deploy to production

## 🚢 Deployment Structure

### Frontend Deployment
- Deploy `frontend/` folder to Vercel, Netlify, or static hosting
- Build output: `frontend/dist/`
- Environment variables set in hosting platform

### Backend Deployment
- Deploy `backend/` folder to Railway, Render, Heroku, or VPS
- Entry point: `backend/server.js`
- Environment variables set in hosting platform

### Documentation
- `docs/` folder can be hosted separately or kept in repository
- Useful for team reference and onboarding

## 📊 Advantages of This Structure

✅ **Clear Separation** - Frontend, backend, and docs are completely separate
✅ **Easy Deployment** - Each folder can be deployed independently
✅ **Better Organization** - No confusion about where files belong
✅ **Scalability** - Easy to add microservices or additional apps
✅ **Team Collaboration** - Frontend and backend teams can work independently
✅ **Clean Root** - Root directory is minimal and professional

---

**This structure is optimized for scalability, maintainability, and deployment.**
