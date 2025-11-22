import express from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Generate voucher code
const generateVoucherCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Create voucher (admin)
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { amount, description, expiryDate, quantity, isGift } = req.body;
    const db = getDB();

    const vouchers = [];
    for (let i = 0; i < (quantity || 1); i++) {
      const voucher = {
        code: generateVoucherCode(),
        amount: parseFloat(amount),
        description: description || `Gift Voucher - ₹${amount}`,
        expiryDate: new Date(expiryDate),
        isGift: isGift || false,
        isUsed: false,
        usedBy: null,
        usedAt: null,
        createdAt: new Date(),
      };
      vouchers.push(voucher);
    }

    const result = await db.collection('vouchers').insertMany(vouchers);
    res.status(201).json({ 
      success: true, 
      vouchers: vouchers.map(v => ({ code: v.code, amount: v.amount })),
      message: `${vouchers.length} voucher(s) created successfully` 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all vouchers (admin)
router.get('/all', authenticate, isAdmin, async (req, res) => {
  try {
    const db = getDB();
    const vouchers = await db.collection('vouchers')
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Validate voucher
router.post('/validate', authenticate, async (req, res) => {
  try {
    const { code } = req.body;
    const db = getDB();
    const now = new Date();

    const voucher = await db.collection('vouchers').findOne({ 
      code: code.toUpperCase(),
      isUsed: false,
      expiryDate: { $gte: now }
    });

    if (!voucher) {
      return res.status(404).json({ 
        success: false, 
        error: 'Invalid or expired voucher code' 
      });
    }

    res.json({
      success: true,
      voucher: {
        code: voucher.code,
        amount: voucher.amount,
        description: voucher.description,
        expiryDate: voucher.expiryDate
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Use voucher
router.post('/use', authenticate, async (req, res) => {
  try {
    const { code, orderId } = req.body;
    const db = getDB();
    const now = new Date();

    const voucher = await db.collection('vouchers').findOne({ 
      code: code.toUpperCase(),
      isUsed: false,
      expiryDate: { $gte: now }
    });

    if (!voucher) {
      return res.status(404).json({ 
        success: false, 
        error: 'Invalid or expired voucher code' 
      });
    }

    // Mark voucher as used
    await db.collection('vouchers').updateOne(
      { _id: voucher._id },
      { 
        $set: { 
          isUsed: true, 
          usedBy: req.user.userId,
          usedAt: now,
          orderId: orderId
        } 
      }
    );

    res.json({
      success: true,
      discount: voucher.amount,
      message: 'Voucher applied successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete voucher (admin)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('vouchers').deleteOne({
      _id: new ObjectId(req.params.id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Voucher not found' });
    }

    res.json({ success: true, message: 'Voucher deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
