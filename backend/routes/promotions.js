import express from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get active promotions (public)
router.get('/active', async (req, res) => {
  try {
    const db = getDB();
    const now = new Date();
    
    const promotions = await db.collection('promotions')
      .find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now }
      })
      .sort({ priority: -1 })
      .toArray();
    
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all promotions (admin)
router.get('/all', authenticate, isAdmin, async (req, res) => {
  try {
    const db = getDB();
    const promotions = await db.collection('promotions')
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create promotion (admin)
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { title, description, discountType, discountValue, startDate, endDate, minOrderValue, maxDiscount, applicableCategories, priority } = req.body;
    const db = getDB();

    const promotion = {
      title,
      description,
      discountType, // 'percentage' or 'fixed'
      discountValue,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      minOrderValue: minOrderValue || 0,
      maxDiscount: maxDiscount || null,
      applicableCategories: applicableCategories || [],
      priority: priority || 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('promotions').insertOne(promotion);
    res.status(201).json({ 
      success: true, 
      promotionId: result.insertedId.toString(),
      message: 'Promotion created successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update promotion (admin)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { title, description, discountType, discountValue, startDate, endDate, minOrderValue, maxDiscount, applicableCategories, priority, isActive } = req.body;
    const db = getDB();

    const updateData = {
      title,
      description,
      discountType,
      discountValue,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      minOrderValue,
      maxDiscount,
      applicableCategories,
      priority,
      isActive,
      updatedAt: new Date(),
    };

    const result = await db.collection('promotions').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Promotion not found' });
    }

    res.json({ success: true, message: 'Promotion updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete promotion (admin)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('promotions').deleteOne({
      _id: new ObjectId(req.params.id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Promotion not found' });
    }

    res.json({ success: true, message: 'Promotion deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Apply promotion to order
router.post('/apply', authenticate, async (req, res) => {
  try {
    const { orderTotal, categories } = req.body;
    const db = getDB();
    const now = new Date();

    // Find applicable promotions
    const promotions = await db.collection('promotions')
      .find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
        minOrderValue: { $lte: orderTotal }
      })
      .sort({ priority: -1 })
      .toArray();

    // Find best promotion
    let bestPromotion = null;
    let maxDiscount = 0;

    for (const promo of promotions) {
      // Check if promotion applies to categories
      if (promo.applicableCategories.length > 0) {
        const hasMatch = promo.applicableCategories.some(cat => categories.includes(cat));
        if (!hasMatch) continue;
      }

      let discount = 0;
      if (promo.discountType === 'percentage') {
        discount = (orderTotal * promo.discountValue) / 100;
        if (promo.maxDiscount) {
          discount = Math.min(discount, promo.maxDiscount);
        }
      } else {
        discount = promo.discountValue;
      }

      if (discount > maxDiscount) {
        maxDiscount = discount;
        bestPromotion = promo;
      }
    }

    if (bestPromotion) {
      res.json({
        success: true,
        promotion: bestPromotion,
        discount: maxDiscount,
        finalTotal: orderTotal - maxDiscount
      });
    } else {
      res.json({
        success: false,
        message: 'No applicable promotions found'
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
