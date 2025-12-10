import express from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';
import { authenticate, isAdmin, isAdminOrDeliveryBoy } from '../middleware/auth.js';
import { sendOrderConfirmation, sendDeliveryAssignment } from '../services/emailService.js';
import { hybridPrintingService } from '../services/hybridPrintingService.js';

const router = express.Router();

// Reverse geocode coordinates to address (to avoid CORS issues with Nominatim)
router.post('/reverse-geocode', async (req, res) => {
  try {
    const { lat, lng } = req.body;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    console.log('🔍 Backend reverse geocoding:', lat, lng);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      {
        headers: {
          'User-Agent': 'IndiyaRestaurant/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Reverse geocoding API returned ${response.status}`);
    }
    
    const data = await response.json();
    console.log('📡 Backend reverse geocoding response:', data.display_name);
    
    if (data && data.display_name) {
      res.json({
        address: data.display_name,
        city: data.address?.city || data.address?.town || data.address?.village || '',
        state: data.address?.state || '',
        country: data.address?.country || '',
        postcode: data.address?.postcode || ''
      });
    } else {
      res.json({
        address: `Location at ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        city: '',
        state: '',
        country: '',
        postcode: ''
      });
    }
  } catch (error) {
    console.error('❌ Backend reverse geocoding error:', error);
    res.json({
      address: `Location at ${req.body.lat.toFixed(6)}, ${req.body.lng.toFixed(6)}`,
      city: '',
      state: '',
      country: '',
      postcode: ''
    });
  }
});

// Geocode address endpoint (to avoid CORS issues with Nominatim)
router.post('/geocode', async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    console.log('🔍 Backend geocoding address:', address);

    // Try multiple geocoding strategies
    let data = [];
    
    // Strategy 1: Try exact address
    let geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    console.log('🌐 Trying exact address...');
    
    let response = await fetch(geocodeUrl, {
      headers: {
        'User-Agent': 'IndiyaRestaurant/1.0'
      }
    });
    
    if (response.ok) {
      data = await response.json();
    }
    
    // Strategy 2: If no results, try with structured query
    if (!data || data.length === 0) {
      console.log('⚠️ No results with exact address, trying structured query...');
      
      // Parse address components
      const parts = address.split(',').map(p => p.trim());
      if (parts.length >= 2) {
        // Try with city and state
        const city = parts[0];
        const state = parts.length > 2 ? parts[parts.length - 2] : parts[parts.length - 1];
        const country = parts[parts.length - 1];
        
        geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&country=${encodeURIComponent(country)}&limit=1`;
        console.log('🌐 Trying structured query:', { city, state, country });
        
        response = await fetch(geocodeUrl, {
          headers: {
            'User-Agent': 'IndiyaRestaurant/1.0'
          }
        });
        
        if (response.ok) {
          data = await response.json();
        }
      }
    }
    
    // Strategy 3: Extract area/city and try that
    if (!data || data.length === 0) {
      console.log('⚠️ Still no results, trying to extract area...');
      
      // Try to extract recognizable area names (Rohini, Sector, etc.)
      // Look for patterns like "Sector 16 Rohini", "Rohini", "Sector 16", etc.
      const areaMatch = address.match(/(Sector\s+\d+\s+\w+|Rohini|Sector\s+\d+|Delhi)/i);
      if (areaMatch) {
        const area = `${areaMatch[0]}, Delhi, India`;
        geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(area)}&limit=1`;
        console.log('🌐 Trying area:', area);
        
        response = await fetch(geocodeUrl, {
          headers: {
            'User-Agent': 'IndiyaRestaurant/1.0'
          }
        });
        
        if (response.ok) {
          data = await response.json();
        }
      }
    }
    
    console.log('📡 Backend geocoding response:', data);
    
    if (data && data.length > 0) {
      const location = {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
        displayName: data[0].display_name
      };
      console.log('✅ Backend geocoded location:', location);
      res.json(location);
    } else {
      // Return a fallback location near the restaurant (Orpington area)
      console.log('⚠️ No geocoding results after all strategies, returning fallback');
      res.json({
        latitude: 51.3750,
        longitude: 0.1000,
        displayName: `${address} (approximate location)`
      });
    }
  } catch (error) {
    console.error('❌ Backend geocoding error:', error);
    // Return fallback on error
    res.json({
      latitude: 51.3750,
      longitude: 0.1000,
      displayName: 'Fallback location (geocoding failed)'
    });
  }
});

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

// Assign delivery boy to order (admin only)
router.patch('/:id/assign', authenticate, isAdmin, async (req, res) => {
  try {
    const { deliveryBoyId } = req.body;
    const db = getDB();

    // Verify delivery boy exists
    const deliveryBoy = await db.collection('users').findOne({
      _id: new ObjectId(deliveryBoyId),
      role: 'delivery_boy'
    });

    if (!deliveryBoy) {
      return res.status(404).json({ error: 'Delivery boy not found' });
    }

    // Update order
    const result = await db.collection('orders').updateOne(
      { _id: new ObjectId(req.params.id) },
      { 
        $set: { 
          deliveryBoyId,
          status: 'assigned',
          assignedAt: new Date(),
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Get order details for email
    const order = await db.collection('orders').findOne({ _id: new ObjectId(req.params.id) });
    
    // Send delivery assignment email
    if (deliveryBoy.email && order) {
      sendDeliveryAssignment({
        orderNumber: order.orderNumber,
        deliveryBoyName: deliveryBoy.name,
        deliveryBoyEmail: deliveryBoy.email,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        deliveryAddress: order.deliveryAddress,
        totalAmount: order.totalAmount,
        itemCount: order.items?.length || 0,
      }).catch(err => console.error('Email failed:', err));
    }

    res.json({ 
      message: 'Order assigned successfully',
      deliveryBoyName: deliveryBoy.name 
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
    
    // Send order confirmation email
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.userId) });
    if (user && user.email) {
      sendOrderConfirmation({
        ...order,
        _id: result.insertedId,
        customerEmail: user.email,
      }).catch(err => console.error('Email failed:', err));
    }
    
    // 🖨️ HYBRID THERMAL PRINTING - Works both locally and on Vercel
    // This runs asynchronously and won't block order creation
    setImmediate(async () => {
      try {
        const orderWithId = { ...order, _id: result.insertedId };
        const printResult = await hybridPrintingService.printOrder(orderWithId, 'both');
        
        if (printResult.success) {
          console.log(`✅ Order #${orderNumber} printing successful:`, printResult.message);
        } else {
          console.log(`⚠️  Order #${orderNumber} printing failed:`, printResult.error);
          if (printResult.fallback) {
            console.log(`📋 Fallback: ${printResult.fallback}`);
          }
        }
      } catch (printError) {
        // Printing errors should never break order creation
        console.error(`❌ Printing error for order #${orderNumber}:`, printError.message);
        console.log(`ℹ️  Order #${orderNumber} was created successfully despite printing error`);
      }
    });
    
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
