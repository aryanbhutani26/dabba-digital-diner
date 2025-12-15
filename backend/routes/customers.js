import express from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { sendBulkBirthdayEmails } from '../services/emailService.js';

const router = express.Router();

// Get all customers with pagination and stats (admin only)
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const db = getDB();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'totalOrders'; // totalOrders, totalSpent, name, createdAt
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build search filter
    const searchFilter = search ? {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ]
    } : {};

    // Aggregate pipeline to get customer stats
    const pipeline = [
      { $match: searchFilter },
      {
        $addFields: {
          userIdString: { $toString: '$_id' }
        }
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'userIdString',
          foreignField: 'userId',
          as: 'orders'
        }
      },
      {
        $lookup: {
          from: 'dabbaSubscriptions',
          localField: '_id',
          foreignField: 'userId',
          as: 'subscriptions'
        }
      },
      {
        $lookup: {
          from: 'coupons',
          localField: '_id',
          foreignField: 'userId',
          as: 'coupons'
        }
      },
      {
        $addFields: {
          totalOrders: { $size: '$orders' },
          totalSpent: {
            $sum: {
              $map: {
                input: '$orders',
                as: 'order',
                in: '$$order.totalAmount'
              }
            }
          },
          totalSubscriptions: { $size: '$subscriptions' },
          totalCoupons: { $size: '$coupons' },
          lastOrderDate: {
            $max: {
              $map: {
                input: '$orders',
                as: 'order',
                in: '$$order.createdAt'
              }
            }
          },
          avgOrderValue: {
            $cond: {
              if: { $gt: [{ $size: '$orders' }, 0] },
              then: {
                $divide: [
                  {
                    $sum: {
                      $map: {
                        input: '$orders',
                        as: 'order',
                        in: '$$order.totalAmount'
                      }
                    }
                  },
                  { $size: '$orders' }
                ]
              },
              else: 0
            }
          }
        }
      },
      {
        $project: {
          orders: 0, // Remove the full orders array to reduce response size
          subscriptions: 0,
          coupons: 0,
          password: 0 // Never send password
        }
      }
    ];

    // Add sorting
    const sortField = {};
    sortField[sortBy] = sortOrder;
    pipeline.push({ $sort: sortField });

    // Get total count for pagination
    const totalPipeline = [...pipeline, { $count: 'total' }];
    const totalResult = await db.collection('users').aggregate(totalPipeline).toArray();
    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    // Add pagination
    pipeline.push({ $skip: skip }, { $limit: limit });

    // Execute the aggregation
    const customers = await db.collection('users').aggregate(pipeline).toArray();

    // Get overall stats
    const overallStats = await db.collection('users').aggregate([
      {
        $addFields: {
          userIdString: { $toString: '$_id' }
        }
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'userIdString',
          foreignField: 'userId',
          as: 'orders'
        }
      },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          totalOrders: { $sum: { $size: '$orders' } },
          totalRevenue: {
            $sum: {
              $sum: {
                $map: {
                  input: '$orders',
                  as: 'order',
                  in: '$$order.totalAmount'
                }
              }
            }
          },
          avgOrdersPerCustomer: {
            $avg: { $size: '$orders' }
          }
        }
      }
    ]).toArray();

    const stats = overallStats.length > 0 ? overallStats[0] : {
      totalCustomers: 0,
      totalOrders: 0,
      totalRevenue: 0,
      avgOrdersPerCustomer: 0
    };

    res.json({
      customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats
    });

  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Get top customers (admin only)
router.get('/top', authenticate, isAdmin, async (req, res) => {
  try {
    const db = getDB();
    const limit = parseInt(req.query.limit) || 10;
    const metric = req.query.metric || 'totalSpent'; // totalSpent, totalOrders, avgOrderValue

    const pipeline = [
      {
        $addFields: {
          userIdString: { $toString: '$_id' }
        }
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'userIdString',
          foreignField: 'userId',
          as: 'orders'
        }
      },
      {
        $addFields: {
          totalOrders: { $size: '$orders' },
          totalSpent: {
            $sum: {
              $map: {
                input: '$orders',
                as: 'order',
                in: '$$order.totalAmount'
              }
            }
          },
          avgOrderValue: {
            $cond: {
              if: { $gt: [{ $size: '$orders' }, 0] },
              then: {
                $divide: [
                  {
                    $sum: {
                      $map: {
                        input: '$orders',
                        as: 'order',
                        in: '$$order.totalAmount'
                      }
                    }
                  },
                  { $size: '$orders' }
                ]
              },
              else: 0
            }
          }
        }
      },
      {
        $match: {
          totalOrders: { $gt: 0 } // Only customers with orders
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          phone: 1,
          totalOrders: 1,
          totalSpent: 1,
          avgOrderValue: 1,
          createdAt: 1
        }
      }
    ];

    // Add sorting based on metric
    const sortField = {};
    sortField[metric] = -1;
    pipeline.push({ $sort: sortField });
    pipeline.push({ $limit: limit });

    const topCustomers = await db.collection('users').aggregate(pipeline).toArray();

    res.json(topCustomers);

  } catch (error) {
    console.error('Error fetching top customers:', error);
    res.status(500).json({ error: 'Failed to fetch top customers' });
  }
});

// Get customer details by ID (admin only)
router.get('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const db = getDB();
    const customerId = new ObjectId(req.params.id);

    // Get customer with detailed stats
    const pipeline = [
      { $match: { _id: customerId } },
      {
        $addFields: {
          userIdString: { $toString: '$_id' }
        }
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'userIdString',
          foreignField: 'userId',
          as: 'orders'
        }
      },
      {
        $lookup: {
          from: 'dabbaSubscriptions',
          localField: '_id',
          foreignField: 'userId',
          as: 'subscriptions'
        }
      },
      {
        $lookup: {
          from: 'coupons',
          localField: '_id',
          foreignField: 'userId',
          as: 'coupons'
        }
      },
      {
        $addFields: {
          totalOrders: { $size: '$orders' },
          totalSpent: {
            $sum: {
              $map: {
                input: '$orders',
                as: 'order',
                in: '$$order.totalAmount'
              }
            }
          },
          avgOrderValue: {
            $cond: {
              if: { $gt: [{ $size: '$orders' }, 0] },
              then: {
                $divide: [
                  {
                    $sum: {
                      $map: {
                        input: '$orders',
                        as: 'order',
                        in: '$$order.totalAmount'
                      }
                    }
                  },
                  { $size: '$orders' }
                ]
              },
              else: 0
            }
          },
          lastOrderDate: {
            $max: {
              $map: {
                input: '$orders',
                as: 'order',
                in: '$$order.createdAt'
              }
            }
          }
        }
      },
      {
        $project: {
          password: 0 // Never send password
        }
      }
    ];

    const customerResult = await db.collection('users').aggregate(pipeline).toArray();
    
    if (customerResult.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const customer = customerResult[0];

    // Get recent orders (last 10)
    const recentOrders = await db.collection('orders')
      .find({ userId: customerId.toString() })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    customer.recentOrders = recentOrders;

    res.json(customer);

  } catch (error) {
    console.error('Error fetching customer details:', error);
    res.status(500).json({ error: 'Failed to fetch customer details' });
  }
});

// Create special coupon for customer (admin only)
router.post('/:id/coupon', authenticate, isAdmin, async (req, res) => {
  try {
    const db = getDB();
    const customerId = new ObjectId(req.params.id);
    const { 
      discountPercentage, 
      validDays = 30, 
      message, 
      couponType = 'special',
      usageLimit = 1 
    } = req.body;

    if (!discountPercentage || discountPercentage < 1 || discountPercentage > 100) {
      return res.status(400).json({ error: 'Discount percentage must be between 1 and 100' });
    }

    // Get customer details
    const customer = await db.collection('users').findOne({ _id: customerId });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Generate unique coupon code
    const couponCode = `SPECIAL${customer._id.toString().slice(-6).toUpperCase()}${Date.now().toString().slice(-4)}`;
    
    // Set expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + validDays);

    const couponData = {
      code: couponCode,
      discountPercentage,
      expiryDate,
      isActive: true,
      usageLimit,
      usedCount: 0,
      type: couponType,
      userId: customerId,
      userName: customer.name,
      userEmail: customer.email,
      message: message || `🎉 Special ${discountPercentage}% discount just for you, ${customer.name}!`,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin'
    };

    // Insert coupon
    const result = await db.collection('coupons').insertOne(couponData);

    // Send email notification
    try {
      await sendBulkBirthdayEmails([{
        to: customer.email,
        name: customer.name,
        couponCode,
        discountPercentage,
        birthdayDate: 'Special Offer',
        expiryDate: expiryDate.toLocaleDateString('en-GB'),
        message: couponData.message
      }]);
      console.log(`✅ Special coupon email sent to ${customer.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send coupon email:', emailError);
      // Don't fail the coupon creation if email fails
    }

    res.status(201).json({
      id: result.insertedId,
      ...couponData,
      emailSent: true
    });

  } catch (error) {
    console.error('Error creating special coupon:', error);
    res.status(500).json({ error: 'Failed to create special coupon' });
  }
});

// Get newsletter subscribers (admin only)
router.get('/newsletter/subscribers', authenticate, isAdmin, async (req, res) => {
  try {
    const db = getDB();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get newsletter subscribers (assuming you have a newsletter collection)
    // If not, this will get users who have opted in for updates
    const subscribers = await db.collection('users')
      .find({ 
        $or: [
          { newsletter: true },
          { stayUpdated: true },
          { email: { $exists: true } }
        ]
      })
      .project({ password: 0 })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await db.collection('users').countDocuments({
      $or: [
        { newsletter: true },
        { stayUpdated: true },
        { email: { $exists: true } }
      ]
    });

    res.json({
      subscribers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error);
    res.status(500).json({ error: 'Failed to fetch newsletter subscribers' });
  }
});

export default router;