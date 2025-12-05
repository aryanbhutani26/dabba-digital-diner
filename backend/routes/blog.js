import express from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get published blog posts (public)
router.get('/published', async (req, res) => {
  try {
    const db = getDB();
    const posts = await db.collection('blog_posts')
      .find({ isPublished: true })
      .sort({ publishedAt: -1 })
      .toArray();
    
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single blog post (public)
router.get('/:slug', async (req, res) => {
  try {
    const db = getDB();
    const post = await db.collection('blog_posts').findOne({ 
      slug: req.params.slug,
      isPublished: true 
    });
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all blog posts (admin)
router.get('/admin/all', authenticate, isAdmin, async (req, res) => {
  try {
    const db = getDB();
    const posts = await db.collection('blog_posts')
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create blog post (admin)
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { title, content, excerpt, tags, isPublished } = req.body;
    const db = getDB();

    // Generate slug from title
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug exists
    const existingPost = await db.collection('blog_posts').findOne({ slug });
    if (existingPost) {
      return res.status(400).json({ error: 'A post with this title already exists' });
    }

    const post = {
      title,
      slug,
      content,
      excerpt: excerpt || content.substring(0, 200) + '...',
      tags: tags || [],
      isPublished: isPublished || false,
      author: 'Admin',
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: isPublished ? new Date() : null,
    };

    const result = await db.collection('blog_posts').insertOne(post);
    res.status(201).json({ 
      success: true, 
      postId: result.insertedId.toString(),
      slug: post.slug,
      message: 'Blog post created successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update blog post (admin)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { title, content, excerpt, tags, isPublished } = req.body;
    const db = getDB();

    const updateData = {
      title,
      content,
      excerpt,
      tags,
      isPublished,
      updatedAt: new Date(),
    };

    // If publishing for first time, set publishedAt
    const existingPost = await db.collection('blog_posts').findOne({ _id: new ObjectId(req.params.id) });
    if (isPublished && !existingPost.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const result = await db.collection('blog_posts').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ success: true, message: 'Blog post updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete blog post (admin)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('blog_posts').deleteOne({
      _id: new ObjectId(req.params.id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ success: true, message: 'Blog post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
