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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

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
