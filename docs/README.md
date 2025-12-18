# 🍛 Indiya Bar & Restaurant - Full Stack Application

A modern, full-featured restaurant management system with online ordering, reservations, delivery tracking, and admin dashboard.

## �  Project Structure

```
dabba-digital-diner/
├── frontend/           # React + TypeScript frontend
├── backend/            # Node.js + Express backend
└── docs/               # Documentation
```

## � Featpures

### Customer Features
- 🛒 **Online Ordering** - Browse menu, add to cart, and place orders
- � **Taable Reservations** - Book tables with date/time selection
- 🥡 **Dabba Services** - Tiffin/meal subscription packages
- 💳 **Stripe Payments** - Secure payment processing
- � ***Live Delivery Tracking** - Real-time order tracking
- � ***User Accounts** - Profile management and order history
- � **Coupoons & Promotions** - Discount codes and special offers
- 🔐 **Google OAuth** - Quick sign-in with Google

### Admin Features
- � **Dashboarsd** - Overview of orders, revenue, and users
- 🍽️ **Menu Management** - Add, edit, delete menu items
- 🥡 **Services Management** - Manage dabba/tiffin packages
- � **Ordier Management** - Assign orders to delivery boys
- �  **User Management** - Manage customers and delivery personnel
- 🎉 **Promotions** - Create and manage promotional campaigns
- 🎫 **Coupons** - Generate and manage discount codes
- � **Recservations** - View and manage table bookings
- 🧭 **Navigation** - Customize navbar items
- 📈 **Analytics** - Revenue and order statistics

### Delivery Boy Features
- 📱 **Delivery Dashboard** - View assigned orders
- 📍 **Location Updates** - Update delivery location in real-time
- ✅ **Status Management** - Update order status

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Fast build tool
- **TailwindCSS** - Utility-first CSS
- **Shadcn/ui** - Beautiful UI components
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching

### Backend
- **Node.js** with Express
- **MongoDB** - Database
- **JWT** - Authentication
- **Stripe** - Payment processing
- **Nodemailer** - Email notifications
- **Google OAuth** - Social authentication

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)
- Stripe account (for payments)
- Google OAuth credentials (optional)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd dabba-digital-diner
```

### 2. Install Dependencies

**Install all at once:**
```bash
npm run install:all
```

**Or install separately:**

Frontend:
```bash
cd frontend
npm install
```

Backend:
```bash
cd backend
npm install
```

### 3. Environment Setup

**Frontend (frontend/.env):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

**Backend (backend/.env):**
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
NODE_ENV=development
```

### 4. Run the Application

**Development Mode:**

From root directory:
```bash
# Run both frontend and backend
npm run dev
```

Or run separately:

Terminal 1 (Frontend):
```bash
cd frontend
npm run dev
```

Terminal 2 (Backend):
```bash
cd backend
npm run dev
```

**Production Build:**
```bash
# Build frontend
cd frontend
npm run build

# Start backend
cd backend
npm start
```

## 📚 Documentation

All documentation is organized in the `docs/` folder:

- **Setup Guides**: `docs/setup/` - Installation and configuration
- **Feature Guides**: `docs/guides/` - Feature documentation
- **Development Reports**: `docs/reports/` - Development history
- **Scripts**: `docs/scripts/` - Utility scripts

### Key Documentation Files
- [Quick Start Guide](docs/setup/QUICKSTART.md)
- [Deployment Guide](docs/setup/DEPLOYMENT.md)
- [Project Structure](docs/PROJECT_STRUCTURE.md)
- [Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md)
- [Stripe Setup](docs/setup/STRIPE_SETUP_GUIDE.md)
- [Google OAuth Setup](docs/setup/GOOGLE_OAUTH_SETUP.md)
- [MongoDB Setup](docs/setup/MONGODB_MIGRATION.md)

## 🔐 Default Admin Credentials

After seeding the database:
- **Email**: admin@indiya.com
- **Password**: admin123

⚠️ **Important**: Change these credentials immediately in production!

## 🧪 Testing

Run the API health check:
```bash
cd backend
npm run check
```

Test payment endpoint:
```bash
node docs/scripts/test-payment-endpoint.js
```

## 🚢 Deployment

### Frontend (Vercel/Netlify)
1. Build: `cd frontend && npm run build`
2. Deploy the `frontend/dist` folder
3. Set environment variables in your hosting platform

### Backend (Railway/Render/Heroku)
1. Deploy the `backend` folder
2. Set environment variables
3. Ensure MongoDB connection string is correct

See [Deployment Guide](docs/setup/DEPLOYMENT.md) for detailed instructions.

## 📁 Detailed Structure

```
dabba-digital-diner/
├── frontend/                   # Frontend Application
│   ├── src/                   # Source code
│   │   ├── components/       # React components
│   │   │   ├── admin/       # Admin components
│   │   │   └── ui/          # UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilities & API
│   │   └── assets/          # Images & media
│   ├── public/              # Static assets
│   ├── .env                 # Environment variables
│   ├── package.json         # Dependencies
│   ├── vite.config.ts       # Vite config
│   └── tailwind.config.ts   # Tailwind config
│
├── backend/                    # Backend Application
│   ├── config/               # Configuration
│   │   └── db.js            # Database connection
│   ├── middleware/           # Express middleware
│   │   └── auth.js          # Authentication
│   ├── routes/               # API routes
│   │   ├── auth.js          # Auth routes
│   │   ├── menu.js          # Menu routes
│   │   ├── orders.js        # Order routes
│   │   ├── dabbaServices.js # Dabba services
│   │   └── ...              # Other routes
│   ├── .env                  # Environment variables
│   ├── package.json          # Dependencies
│   └── server.js             # Server entry point
│
├── docs/                       # Documentation
│   ├── setup/                # Setup guides
│   ├── guides/               # Feature guides
│   ├── reports/              # Development reports
│   ├── scripts/              # Utility scripts
│   ├── PROJECT_STRUCTURE.md  # Structure docs
│   └── DEPLOYMENT_CHECKLIST.md
│
├── .gitignore                  # Git ignore rules
├── README.md                   # This file
├── DEPLOYMENT_READY.md         # Deployment guide
└── package.json                # Root package.json
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the documentation in `docs/`
2. Review troubleshooting guides
3. Open an issue on GitHub

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Loyalty program
- [ ] SMS notifications
- [ ] Table QR code ordering

## 📞 Contact

For more information, visit our documentation or contact the development team.

---

**Built with ❤️ for Indiya Bar & Restaurant**
