import express from 'express';
import { getDB } from '../config/db.js';

const router = express.Router();

// Subscribe to newsletter
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    const db = getDB();

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if already subscribed
    const existing = await db.collection('newsletter_subscribers').findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already subscribed' });
    }

    // Add subscriber
    await db.collection('newsletter_subscribers').insertOne({
      email,
      subscribedAt: new Date(),
      active: true,
    });

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter',
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Unsubscribe from newsletter
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;
    const db = getDB();

    await db.collection('newsletter_subscribers').updateOne(
      { email },
      { $set: { active: false, unsubscribedAt: new Date() } }
    );

    res.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter',
    });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
