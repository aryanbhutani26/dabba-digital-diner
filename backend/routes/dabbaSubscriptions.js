import express from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import Stripe from 'stripe';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create dabba subscription (authenticated user)
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      serviceId,
      startDate,
      deliveryTime,
      phoneNumber,
      fulfillmentType,
      deliveryAddress,
      pickupLocation,
      specialInstructions
    } = req.body;

    // Validate required fields
    if (!serviceId || !startDate || !deliveryTime || !phoneNumber) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate phone number (exactly 10 digits)
    if (!/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({ error: 'Phone number must be exactly 10 digits' });
    }

    // Validate fulfillment details
    if (fulfillmentType === 'delivery' && !deliveryAddress) {
      return res.status(400).json({ error: 'Delivery address is required for delivery option' });
    }
    if (fulfillmentType === 'pickup' && !pickupLocation) {
      return res.status(400).json({ error: 'Pickup location is required for pickup option' });
    }

    const db = getDB();
    
    // Get service details
    const service = await db.collection('dabba_services').findOne({ 
      _id: new ObjectId(serviceId),
      isActive: true 
    });
    
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Check if user already has an active subscription for this service
    const existingSubscription = await db.collection('dabba_subscriptions').findOne({
      userId: new ObjectId(req.user.id),
      serviceId: new ObjectId(serviceId),
      status: { $in: ['active', 'pending'] }
    });

    if (existingSubscription) {
      return res.status(400).json({ error: 'You already have an active subscription for this service' });
    }

    // Create subscription record
    const subscription = {
      userId: new ObjectId(req.user.id),
      serviceId: new ObjectId(serviceId),
      serviceName: service.title,
      servicePrice: service.price,
      pricingPeriod: service.pricingPeriod || 'day',
      startDate: new Date(startDate),
      deliveryTime,
      phoneNumber,
      fulfillmentType,
      deliveryAddress: fulfillmentType === 'delivery' ? deliveryAddress : null,
      pickupLocation: fulfillmentType === 'pickup' ? pickupLocation : null,
      specialInstructions: specialInstructions || null,
      status: 'pending', // pending, active, paused, cancelled
      paymentStatus: 'pending', // pending, paid, failed
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('dabba_subscriptions').insertOne(subscription);

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(service.price * 100), // Convert to cents
      currency: 'gbp',
      metadata: {
        subscriptionId: result.insertedId.toString(),
        serviceId: serviceId,
        userId: req.user.id
      }
    });

    res.status(201).json({
      subscription: { _id: result.insertedId, ...subscription },
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Error creating dabba subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// Get user's subscriptions (authenticated user)
router.get('/my-subscriptions', authenticate, async (req, res) => {
  try {
    const db = getDB();
    const subscriptions = await db.collection('dabba_subscriptions')
      .find({ userId: new ObjectId(req.user.id) })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(subscriptions);
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

// Update subscription status after payment (webhook or manual)
router.put('/:id/payment-status', authenticate, async (req, res) => {
  try {
    const { paymentStatus, paymentIntentId } = req.body;
    const db = getDB();

    const updateData = {
      paymentStatus,
      updatedAt: new Date()
    };

    if (paymentStatus === 'paid') {
      updateData.status = 'active';
      updateData.paymentIntentId = paymentIntentId;
    }

    const result = await db.collection('dabba_subscriptions').findOneAndUpdate(
      { 
        _id: new ObjectId(req.params.id),
        userId: new ObjectId(req.user.id)
      },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error updating subscription payment status:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

// Cancel subscription (authenticated user)
router.put('/:id/cancel', authenticate, async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('dabba_subscriptions').findOneAndUpdate(
      { 
        _id: new ObjectId(req.params.id),
        userId: new ObjectId(req.user.id)
      },
      { 
        $set: { 
          status: 'cancelled',
          cancelledAt: new Date(),
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Admin: Get all subscriptions
router.get('/admin/all', authenticate, isAdmin, async (req, res) => {
  try {
    const db = getDB();
    
    // Aggregate to get subscription details with user information
    // Use $lookup with preserveNullAndEmptyArrays to handle missing users gracefully
    const subscriptions = await db.collection('dabba_subscriptions').aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'userId',
          foreignField: 'userId',
          as: 'orders'
        }
      },
      {
        $addFields: {
          // Handle missing user data gracefully
          user: {
            $cond: {
              if: { $eq: ['$user', null] },
              then: {
                name: 'Unknown User',
                email: 'unknown@example.com',
                phone: '',
                addresses: [],
                createdAt: new Date()
              },
              else: '$user'
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          serviceName: 1,
          servicePrice: 1,
          pricingPeriod: 1,
          startDate: 1,
          deliveryTime: 1,
          phoneNumber: 1,
          fulfillmentType: 1,
          deliveryAddress: 1,
          pickupLocation: 1,
          specialInstructions: 1,
          status: 1,
          paymentStatus: 1,
          createdAt: 1,
          updatedAt: 1,
          'user.name': 1,
          'user.email': 1,
          'user.phone': 1,
          'user.addresses': 1,
          'user.createdAt': 1,
          orderCount: { $size: '$orders' }
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]).toArray();

    console.log(`Found ${subscriptions.length} subscriptions for admin panel`);
    res.json(subscriptions);
  } catch (error) {
    console.error('Error fetching admin subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

// Admin: Get subscription details
router.get('/admin/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const db = getDB();
    
    const subscription = await db.collection('dabba_subscriptions').aggregate([
      {
        $match: { _id: new ObjectId(req.params.id) }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'userId',
          foreignField: 'userId',
          as: 'orders'
        }
      }
    ]).toArray();

    if (subscription.length === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json(subscription[0]);
  } catch (error) {
    console.error('Error fetching subscription details:', error);
    res.status(500).json({ error: 'Failed to fetch subscription details' });
  }
});

// Admin: Update subscription status
router.put('/admin/:id/status', authenticate, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const db = getDB();

    const result = await db.collection('dabba_subscriptions').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { 
        $set: { 
          status,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error updating subscription status:', error);
    res.status(500).json({ error: 'Failed to update subscription status' });
  }
});

export default router;