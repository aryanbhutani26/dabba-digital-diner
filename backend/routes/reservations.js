import express from 'express';
import { getDB } from '../config/db.js';
import { sendReservationConfirmation } from '../services/emailService.js';

const router = express.Router();

// Create reservation
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, date, time, guests, specialRequests } = req.body;
    const db = getDB();

    // Validate required fields
    if (!name || !email || !phone || !date || !time || !guests) {
      const missing = [];
      if (!name) missing.push('name');
      if (!email) missing.push('email');
      if (!phone) missing.push('phone');
      if (!date) missing.push('date');
      if (!time) missing.push('time');
      if (!guests) missing.push('guests');
      
      console.log('Missing fields:', missing);
      console.log('Received data:', { name, email, phone, date, time, guests });
      
      return res.status(400).json({ 
        error: `Missing required fields: ${missing.join(', ')}`,
        received: { name, email, phone, date, time, guests }
      });
    }

    // Create reservation
    const reservation = {
      name,
      email,
      phone,
      date,
      time,
      guests: parseInt(guests),
      specialRequests: specialRequests || '',
      status: 'pending',
      createdAt: new Date(),
    };

    const result = await db.collection('reservations').insertOne(reservation);

    // Send confirmation email
    sendReservationConfirmation(reservation).catch(err => 
      console.error('Email failed:', err)
    );

    res.status(201).json({
      success: true,
      reservationId: result.insertedId.toString(),
      message: 'Reservation created successfully. Check your email for confirmation.',
    });
  } catch (error) {
    console.error('Reservation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all reservations (admin)
router.get('/all', async (req, res) => {
  try {
    const db = getDB();
    const reservations = await db.collection('reservations')
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json(reservations);
  } catch (error) {
    console.error('Get reservations error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update reservation status (admin)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const db = getDB();
    const { ObjectId } = await import('mongodb');

    const result = await db.collection('reservations').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    res.json({ success: true, message: 'Reservation status updated' });
  } catch (error) {
    console.error('Update reservation error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
