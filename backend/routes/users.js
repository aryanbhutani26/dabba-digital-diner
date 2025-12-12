import express from 'express';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import { getDB } from '../config/db.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const db = getDB();
    const users = await db.collection('users')
      .find({}, { projection: { password: 0 } })
      .toArray();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get delivery boys only
router.get('/delivery-boys', authenticate, isAdmin, async (req, res) => {
  try {
    const db = getDB();
    const deliveryBoys = await db.collection('users')
      .find({ role: 'delivery_boy' }, { projection: { password: 0 } })
      .toArray();
    res.json(deliveryBoys);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user role (admin only)
router.patch('/:id/role', authenticate, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'delivery_boy', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const db = getDB();
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(req.params.id) },
      { 
        $set: { 
          role,
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User role updated', role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create delivery boy (admin only)
router.post('/delivery-boy', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const db = getDB();

    // Validate required fields
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create delivery boy
    const result = await db.collection('users').insertOne({
      email,
      password: hashedPassword,
      name,
      phone,
      role: 'delivery_boy',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({
      message: 'Delivery boy created successfully',
      userId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error('Error creating delivery boy:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('users').deleteOne(
      { _id: new ObjectId(req.params.id) }
    );

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const db = getDB();
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(req.user.userId) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.patch('/profile', authenticate, async (req, res) => {
  try {
    const { name, phone, dateOfBirth, addresses, licenseNumber, vehicleType, vehicleNumber, vehicleModel } = req.body;
    const db = getDB();

    // Validate date of birth if provided
    if (dateOfBirth !== undefined) {
      const dob = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      
      if (dob > today) {
        return res.status(400).json({ error: 'Date of birth cannot be in the future' });
      }
      
      if (age < 13) {
        return res.status(400).json({ error: 'User must be at least 13 years old' });
      }
      
      if (age > 120) {
        return res.status(400).json({ error: 'Please enter a valid date of birth' });
      }
    }

    // Validate phone number if provided
    if (phone !== undefined && phone.length > 0) {
      if (!/^\d{10}$/.test(phone)) {
        return res.status(400).json({ error: 'Phone number must be exactly 10 digits' });
      }
    }

    const updateData = {
      updatedAt: new Date()
    };

    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = new Date(dateOfBirth);
    if (addresses !== undefined) updateData.addresses = addresses;
    if (licenseNumber !== undefined) updateData.licenseNumber = licenseNumber;
    if (vehicleType !== undefined) updateData.vehicleType = vehicleType;
    if (vehicleNumber !== undefined) updateData.vehicleNumber = vehicleNumber;
    if (vehicleModel !== undefined) updateData.vehicleModel = vehicleModel;

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(req.user.userId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user order history
router.get('/orders', authenticate, async (req, res) => {
  try {
    const db = getDB();
    const orders = await db.collection('orders')
      .find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
