import express from 'express';
import { getDB } from '../config/db.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get top dishes
router.get('/top-dishes', authenticate, isAdmin, async (req, res) => {
  try {
    const { period = 'week' } = req.query; // week, month, year
    const db = getDB();

    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 7));
    }

    // Aggregate top dishes from orders
    const topDishes = await db.collection('orders').aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: 'delivered'
        }
      },
      {
        $unwind: '$items'
      },
      {
        $group: {
          _id: '$items.name',
          totalOrders: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', { $toDouble: '$items.price' }] } }
        }
      },
      {
        $sort: { totalOrders: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          _id: 0,
          dishName: '$_id',
          totalOrders: 1,
          totalRevenue: { $round: ['$totalRevenue', 2] }
        }
      }
    ]).toArray();

    res.json(topDishes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get revenue analytics
router.get('/revenue', authenticate, isAdmin, async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    const db = getDB();

    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 7));
    }

    const revenueData = await db.collection('orders').aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: 'delivered'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]).toArray();

    res.json(revenueData[0] || { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get delivery performance
router.get('/delivery-performance', authenticate, isAdmin, async (req, res) => {
  try {
    const db = getDB();

    const performance = await db.collection('orders').aggregate([
      {
        $match: {
          status: 'delivered',
          deliveryBoyId: { $exists: true }
        }
      },
      {
        $group: {
          _id: '$deliveryBoyId',
          totalDeliveries: { $sum: 1 },
          totalEarnings: { $sum: '$deliveryFee' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'deliveryBoy'
        }
      },
      {
        $unwind: '$deliveryBoy'
      },
      {
        $project: {
          _id: 0,
          deliveryBoyId: '$_id',
          deliveryBoyName: '$deliveryBoy.name',
          deliveryBoyEmail: '$deliveryBoy.email',
          totalDeliveries: 1,
          totalEarnings: 1
        }
      },
      {
        $sort: { totalDeliveries: -1 }
      }
    ]).toArray();

    res.json(performance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
