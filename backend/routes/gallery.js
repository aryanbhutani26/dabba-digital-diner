import express from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all gallery items (public)
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const galleryItems = await db.collection('gallery_items')
      .find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .toArray();

    res.json(galleryItems);
  } catch (error) {
    console.error('Error fetching gallery items:', error);
    res.status(500).json({ error: 'Failed to fetch gallery items' });
  }
});

// Get all gallery items for admin (includes inactive)
router.get('/admin/all', authenticate, isAdmin, async (req, res) => {
  try {
    const db = getDB();
    const galleryItems = await db.collection('gallery_items')
      .find({})
      .sort({ order: 1, createdAt: -1 })
      .toArray();

    res.json(galleryItems);
  } catch (error) {
    console.error('Error fetching admin gallery items:', error);
    res.status(500).json({ error: 'Failed to fetch gallery items' });
  }
});

// Create gallery item
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { title, description, imageUrl, category, order } = req.body;

    // Validate required fields
    if (!title || !imageUrl) {
      return res.status(400).json({ error: 'Title and image URL are required' });
    }

    const db = getDB();
    
    // If no order specified, set it to the highest order + 1
    let itemOrder = order;
    if (itemOrder === undefined || itemOrder === null) {
      const lastItem = await db.collection('gallery_items')
        .findOne({}, { sort: { order: -1 } });
      itemOrder = lastItem ? lastItem.order + 1 : 1;
    }

    const galleryItem = {
      title: title.trim(),
      description: description?.trim() || '',
      imageUrl: imageUrl.trim(),
      category: category?.trim() || 'General',
      order: itemOrder,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('gallery_items').insertOne(galleryItem);
    
    res.status(201).json({
      _id: result.insertedId,
      ...galleryItem
    });
  } catch (error) {
    console.error('Error creating gallery item:', error);
    res.status(500).json({ error: 'Failed to create gallery item' });
  }
});

// Update gallery item
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { title, description, imageUrl, category, order, isActive } = req.body;
    const db = getDB();

    const updateData = {
      updatedAt: new Date()
    };

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl.trim();
    if (category !== undefined) updateData.category = category.trim();
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;

    const result = await db.collection('gallery_items').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error updating gallery item:', error);
    res.status(500).json({ error: 'Failed to update gallery item' });
  }
});

// Delete gallery item
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('gallery_items').deleteOne({
      _id: new ObjectId(req.params.id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    res.json({ message: 'Gallery item deleted successfully' });
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    res.status(500).json({ error: 'Failed to delete gallery item' });
  }
});

// Reorder gallery items
router.put('/admin/reorder', authenticate, isAdmin, async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, order }
    
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items must be an array' });
    }

    const db = getDB();
    const bulkOps = items.map(item => ({
      updateOne: {
        filter: { _id: new ObjectId(item.id) },
        update: { $set: { order: item.order, updatedAt: new Date() } }
      }
    }));

    await db.collection('gallery_items').bulkWrite(bulkOps);
    
    res.json({ message: 'Gallery items reordered successfully' });
  } catch (error) {
    console.error('Error reordering gallery items:', error);
    res.status(500).json({ error: 'Failed to reorder gallery items' });
  }
});

export default router;