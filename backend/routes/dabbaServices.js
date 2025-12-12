import express from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all dabba services (public)
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const services = await db.collection('dabba_services')
      .find({ isActive: true })
      .sort({ order: 1 })
      .toArray();
    res.json(services);
  } catch (error) {
    console.error('Error fetching dabba services:', error);
    res.status(500).json({ error: 'Failed to fetch dabba services' });
  }
});

// Get services visibility setting (public)
router.get('/visibility', async (req, res) => {
  try {
    const db = getDB();
    const setting = await db.collection('settings').findOne({ key: 'services_enabled' });
    res.json({ enabled: setting ? setting.value : false });
  } catch (error) {
    console.error('Error fetching services visibility:', error);
    res.status(500).json({ error: 'Failed to fetch services visibility' });
  }
});

// Get all dabba services (admin)
router.get('/admin', authenticate, isAdmin, async (req, res) => {
  try {
    const db = getDB();
    const services = await db.collection('dabba_services')
      .find()
      .sort({ order: 1 })
      .toArray();
    res.json(services);
  } catch (error) {
    console.error('Error fetching dabba services:', error);
    res.status(500).json({ error: 'Failed to fetch dabba services' });
  }
});

// Create dabba service (admin)
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { title, price, description, features, image, order, pricingPeriod } = req.body;

    if (!title || !price || !description || !features || !Array.isArray(features)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = getDB();
    const service = {
      title,
      price: parseFloat(price),
      description,
      features: features.filter(f => f.trim()),
      image: image || '',
      order: order || 0,
      pricingPeriod: pricingPeriod || 'day',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('dabba_services').insertOne(service);
    res.status(201).json({ _id: result.insertedId, ...service });
  } catch (error) {
    console.error('Error creating dabba service:', error);
    res.status(500).json({ error: 'Failed to create dabba service' });
  }
});

// Update dabba service (admin)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { title, price, description, features, image, isActive, order, pricingPeriod } = req.body;
    const db = getDB();

    const updateData = {
      updatedAt: new Date()
    };

    if (title) updateData.title = title;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (description) updateData.description = description;
    if (features && Array.isArray(features)) updateData.features = features.filter(f => f.trim());
    if (image !== undefined) updateData.image = image;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (order !== undefined) updateData.order = order;
    if (pricingPeriod) updateData.pricingPeriod = pricingPeriod;

    const result = await db.collection('dabba_services').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ error: 'Dabba service not found' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error updating dabba service:', error);
    res.status(500).json({ error: 'Failed to update dabba service' });
  }
});

// Delete dabba service (admin)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('dabba_services').deleteOne({
      _id: new ObjectId(req.params.id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Dabba service not found' });
    }

    res.json({ message: 'Dabba service deleted successfully' });
  } catch (error) {
    console.error('Error deleting dabba service:', error);
    res.status(500).json({ error: 'Failed to delete dabba service' });
  }
});

// Toggle services visibility (admin)
router.post('/toggle-visibility', authenticate, isAdmin, async (req, res) => {
  try {
    const { enabled } = req.body;
    const db = getDB();
    
    await db.collection('settings').updateOne(
      { key: 'services_enabled' },
      { 
        $set: {
          key: 'services_enabled',
          value: enabled,
          description: 'Controls whether the Services/Dabba section is visible to customers',
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    res.json({ message: 'Services visibility updated', enabled });
  } catch (error) {
    console.error('Error updating services visibility:', error);
    res.status(500).json({ error: 'Failed to update services visibility' });
  }
});

export default router;
