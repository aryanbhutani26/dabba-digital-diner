import express from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all active coupons (public) - excludes birthday and special coupons
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const coupons = await db.collection('coupons')
      .find({ 
        isActive: true,
        type: { $nin: ['birthday', 'special'] }, // Exclude birthday and special coupons
        userId: { $exists: false } // Only show general coupons (not user-specific)
      })
      .toArray();
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user-specific coupons (authenticated users) - includes birthday and special coupons for the user
router.get('/my-coupons', authenticate, async (req, res) => {
  try {
    const db = getDB();
    const userId = req.user.id;
    
    // Get general coupons + user-specific coupons
    const coupons = await db.collection('coupons')
      .find({ 
        isActive: true,
        $or: [
          // General coupons (no userId and not birthday/special)
          { 
            type: { $nin: ['birthday', 'special'] },
            userId: { $exists: false }
          },
          // User-specific coupons (birthday and special)
          { 
            userId: new ObjectId(userId)
          }
        ]
      })
      .toArray();
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all coupons (admin)
router.get('/all', authenticate, isAdmin, async (req, res) => {
  try {
    const db = getDB();
    const coupons = await db.collection('coupons').find().toArray();
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create coupon (admin)
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('coupons').insertOne({
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    res.status(201).json({ id: result.insertedId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update coupon (admin)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('coupons').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { ...req.body, updatedAt: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete coupon (admin)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('coupons').deleteOne(
      { _id: new ObjectId(req.params.id) }
    );
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
