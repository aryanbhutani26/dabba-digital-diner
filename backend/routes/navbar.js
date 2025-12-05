import express from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get active navbar items (public)
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const items = await db.collection('navbar_items')
      .find({ isActive: true })
      .sort({ sortOrder: 1 })
      .toArray();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all navbar items (admin)
router.get('/all', authenticate, isAdmin, async (req, res) => {
  try {
    const db = getDB();
    const items = await db.collection('navbar_items')
      .find()
      .sort({ sortOrder: 1 })
      .toArray();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create navbar item (admin)
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('navbar_items').insertOne({
      ...req.body,
      createdAt: new Date(),
    });
    res.status(201).json({ id: result.insertedId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update navbar item (admin)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('navbar_items').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Navbar item not found' });
    }
    
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete navbar item (admin)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('navbar_items').deleteOne(
      { _id: new ObjectId(req.params.id) }
    );
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Navbar item not found' });
    }
    
    res.json({ message: 'Navbar item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
