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
      return res.status(400).json({ error: 'All fields are required' });
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

export default router;
