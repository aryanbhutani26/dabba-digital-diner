import express from 'express';
import { getDB } from '../config/db.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get analytics data with date filtering (admin only)
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { period, startDate, endDate } = req.query;
    
    // Calculate date range based on period
    let dateFilter = {};
    const now = new Date();
    
    if (period && period !== 'all') {
      let startDateTime;
      
      switch (period) {
        case 'today':
          startDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDateTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDateTime = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDateTime = new Date(now.getFullYear(), 0, 1);
          break;
        case 'custom':
          if (startDate && endDate) {
            startDateTime = new Date(startDate);
            const endDateTime = new Date(endDate);
            endDateTime.setHours(23, 59, 59, 999); // End of day
            dateFilter = {
              createdAt: {
                $gte: startDateTime,
                $lte: endDateTime
              }
            };
          }
          break;
        default:
          break;
      }
      
      if (period !== 'custom' && startDateTime) {
        dateFilter = {
          createdAt: { $gte: startDateTime }
        };
      }
    }

    // Get filtered orders
    const orders = await db.collection('orders').find(dateFilter).toArray();
    
    // Get filtered users (for new registrations in period)
    const users = await db.collection('users').find(dateFilter).toArray();
    
    // Calculate analytics
    const analytics = {
      period: period || 'all',
      dateRange: {
        start: dateFilter.createdAt?.$gte || null,
        end: dateFilter.createdAt?.$lte || null
      },
      orders: {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        assigned: orders.filter(o => o.status === 'assigned').length,
        picked_up: orders.filter(o => o.status === 'picked_up').length,
        out_for_delivery: orders.filter(o => o.status === 'out_for_delivery').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length
      },
      revenue: {
        total: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
        average: orders.length > 0 ? orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0) / orders.length : 0,
        byStatus: {
          delivered: orders.filter(o => o.status === 'delivered').reduce((sum, order) => sum + (order.totalAmount || 0), 0),
          pending: orders.filter(o => o.status === 'pending').reduce((sum, order) => sum + (order.totalAmount || 0), 0)
        }
      },
      customers: {
        newRegistrations: users.filter(u => u.role === 'user').length,
        totalCustomers: await db.collection('users').countDocuments({ role: 'user' }),
        activeCustomers: [...new Set(orders.map(o => o.userId))].length // Unique customers who placed orders
      },
      topItems: await getTopItems(db, dateFilter),
      dailyStats: await getDailyStats(db, dateFilter, period),
      hourlyStats: period === 'today' ? await getHourlyStats(db, dateFilter) : null
    };

    res.json(analytics);

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Helper function to get top selling items
async function getTopItems(db, dateFilter) {
  try {
    const pipeline = [
      { $match: dateFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 }
    ];

    return await db.collection('orders').aggregate(pipeline).toArray();
  } catch (error) {
    console.error('Error getting top items:', error);
    return [];
  }
}

// Helper function to get daily stats
async function getDailyStats(db, dateFilter, period) {
  try {
    if (period === 'today') return null;

    const pipeline = [
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
          date: { $first: '$createdAt' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      { $limit: 30 } // Last 30 days max
    ];

    const results = await db.collection('orders').aggregate(pipeline).toArray();
    
    return results.map(item => ({
      date: new Date(item._id.year, item._id.month - 1, item._id.day).toISOString().split('T')[0],
      orders: item.orders,
      revenue: item.revenue
    }));
  } catch (error) {
    console.error('Error getting daily stats:', error);
    return [];
  }
}

// Helper function to get hourly stats for today
async function getHourlyStats(db, dateFilter) {
  try {
    const pipeline = [
      { $match: dateFilter },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id': 1 } }
    ];

    const results = await db.collection('orders').aggregate(pipeline).toArray();
    
    // Fill in missing hours with 0 values
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const data = results.find(item => item._id === hour);
      return {
        hour,
        orders: data ? data.orders : 0,
        revenue: data ? data.revenue : 0
      };
    });

    return hourlyData;
  } catch (error) {
    console.error('Error getting hourly stats:', error);
    return [];
  }
}

export default router;