import express from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get active menu items (public)
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const items = await db.collection('menu_items')
      .find({ isActive: true })
      .toArray();
    
    // Get lunch menu status
    const lunchSetting = await db.collection('site_settings').findOne({ key: 'lunch_menu_enabled' });
    const lunchEnabled = lunchSetting?.value !== false;
    
    res.json({ items, lunchEnabled });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all menu items (admin)
router.get('/all', authenticate, isAdmin, async (req, res) => {
  try {
    const db = getDB();
    const items = await db.collection('menu_items').find().toArray();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create menu item (admin)
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('menu_items').insertOne({
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    res.status(201).json({ id: result.insertedId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update menu item (admin)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('menu_items').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { ...req.body, updatedAt: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete menu item (admin)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('menu_items').deleteOne(
      { _id: new ObjectId(req.params.id) }
    );
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
