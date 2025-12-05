import express from 'express';
import { getDB } from '../config/db.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get setting by key (public)
router.get('/:key', async (req, res) => {
  try {
    const db = getDB();
    const setting = await db.collection('site_settings').findOne({ key: req.params.key });
    
    if (!setting) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    
    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all settings (admin)
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const db = getDB();
    const settings = await db.collection('site_settings').find().toArray();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update setting (admin)
router.put('/:key', authenticate, isAdmin, async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('site_settings').updateOne(
      { key: req.params.key },
      { 
        $set: { 
          value: req.body.value, 
          updatedAt: new Date() 
        },
        $setOnInsert: { key: req.params.key }
      },
      { upsert: true }
    );
    
    res.json({ key: req.params.key, value: req.body.value });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
