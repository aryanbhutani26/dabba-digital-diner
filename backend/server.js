import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

// Routes
import authRoutes from './routes/auth.js';
import couponRoutes from './routes/coupons.js';
import navbarRoutes from './routes/navbar.js';
import menuRoutes from './routes/menu.js';
import settingsRoutes from './routes/settings.js';
import uploadRoutes from './routes/upload.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:5173',
  'https://your-app.vercel.app', // Replace with your actual Vercel URL
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Increase payload limit for image uploads (base64 encoded images can be large)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Routes
import orderRoutes from './routes/orders.js';
import userRoutes from './routes/users.js';
import analyticsRoutes from './routes/analytics.js';
import reservationRoutes from './routes/reservations.js';
import newsletterRoutes from './routes/newsletter.js';
import promotionRoutes from './routes/promotions.js';
import voucherRoutes from './routes/vouchers.js';
import blogRoutes from './routes/blog.js';
import paymentRoutes from './routes/payment.js';
import dabbaServicesRoutes from './routes/dabbaServices.js';
import printerRoutes from './routes/printers.js';
import thermalPrinterRoutes from './routes/thermalPrinters.js';
import invoiceRoutes from './routes/invoices.js';

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/navbar', navbarRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/dabba-services', dabbaServicesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/printers', printerRoutes);
app.use('/api/thermal-printers', thermalPrinterRoutes);
app.use('/api/invoices', invoiceRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
