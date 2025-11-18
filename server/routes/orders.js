import express from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';
import { authenticate, isAdmin, isAdminOrDeliveryBoy } from '../middleware/auth.js';

const router = express.Router();

// Get all orders (admin)
router.get('/all', authenticate, isAdmin, async (req, res) => {
  try {
    const db = getDB();
    const orders = await db.collection('orders')
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get orders for delivery boy
router.get('/my-deliveries', authenticate, isAdminOrDeliveryBoy, async (req, res) => {
  try {
    const db = getDB();
    const orders = await db.collection('orders')
      .find({ 
        deliveryBoyId: req.user.userId,
        status: { $in: ['assigned', 'picked_up', 'out_for_delivery'] }
      })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get delivery boy stats
router.get('/delivery-stats', authenticate, isAdminOrDeliveryBoy, async (req, res) => {
  try {
    const db = getDB();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayDeliveries, totalDeliveries, earnings] = await Promise.all([
      db.collection('orders').countDocuments({
        deliveryBoyId: req.user.userId,
        status: 'delivered',
        deliveredAt: { $gte: today }
      }),
      db.collection('orders').countDocuments({
        deliveryBoyId: req.user.userId,
        status: 'delivered'
      }),
      db.collection('orders').aggregate([
        {
          $match: {
            deliveryBoyId: req.user.userId,
            status: 'delivered'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$deliveryFee' }
          }
        }
      ]).toArray()
    ]);

    res.json({
      todayDeliveries,
      totalDeliveries,
      totalEarnings: earnings[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { status, location } = req.body;
    const db = getDB();
    
    const updateData = {
      status,
      updatedAt: new Date()
    };

    if (status === 'picked_up') {
      updateData.pickedUpAt = new Date();
    } else if (status === 'out_for_delivery') {
      updateData.outForDeliveryAt = new Date();
    } else if (status === 'delivered') {
      updateData.deliveredAt = new Date();
    }

    if (location) {
      updateData.currentLocation = location;
    }

    const result = await db.collection('orders').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order status updated', status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update delivery location
router.patch('/:id/location', authenticate, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const db = getDB();

    const result = await db.collection('orders').updateOne(
      { _id: new ObjectId(req.params.id) },
      { 
        $set: { 
          currentLocation: { latitude, longitude },
          locationUpdatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Location updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create order
router.post('/', authenticate, async (req, res) => {
  try {
    const db = getDB();
    const { items, deliveryAddress, customerName, customerPhone, totalAmount, paymentMethod } = req.body;

    // Generate order number
    const orderCount = await db.collection('orders').countDocuments();
    const orderNumber = `ORD${String(orderCount + 1).padStart(6, '0')}`;

    const order = {
      orderNumber,
      userId: req.user.userId,
      customerName,
      customerPhone,
      deliveryAddress,
      items,
      totalAmount,
      deliveryFee: 50,
      paymentMethod: paymentMethod || 'mock',
      paymentStatus: 'paid', // Mock payment always succeeds
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('orders').insertOne(order);
    res.status(201).json({ 
      success: true,
      orderId: result.insertedId.toString(),
      orderNumber,
      message: 'Order placed successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single order
router.get('/:id', authenticate, async (req, res) => {
  try {
    const db = getDB();
    const order = await db.collection('orders').findOne({
      _id: new ObjectId(req.params.id)
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user owns this order or is admin
    if (order.userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
