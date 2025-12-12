import express from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { sendBulkBirthdayEmails } from '../services/emailService.js';

const router = express.Router();

// Generate birthday coupons for users (admin only)
router.post('/generate', authenticate, isAdmin, async (req, res) => {
  try {
    const { discountPercentage, validDays = 7, message, daysInAdvance = 3 } = req.body;
    
    if (!discountPercentage || discountPercentage < 1 || discountPercentage > 100) {
      return res.status(400).json({ error: 'Discount percentage must be between 1 and 100' });
    }

    const db = getDB();
    const today = new Date();
    
    // Calculate the target date (today + daysInAdvance)
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysInAdvance);
    
    const targetMonth = targetDate.getMonth() + 1;
    const targetDay = targetDate.getDate();

    // Find users whose birthday is in X days
    const allUsersWithDOB = await db.collection('users').find({
      dateOfBirth: { $exists: true }
    }).toArray();

    const usersWithUpcomingBirthday = allUsersWithDOB.filter(user => {
      const userDOB = new Date(user.dateOfBirth);
      return userDOB.getMonth() + 1 === targetMonth && userDOB.getDate() === targetDay;
    });

    if (usersWithUpcomingBirthday.length === 0) {
      return res.json({ 
        message: `No users have birthdays in ${daysInAdvance} days (${targetDate.toDateString()})`,
        usersCount: allUsersWithDOB.length,
        usersWithBirthdays: 0,
        couponsGenerated: 0,
        targetDate: targetDate.toDateString(),
        debug: {
          totalUsersWithDOB: allUsersWithDOB.length,
          targetMonth: targetMonth,
          targetDay: targetDay,
          upcomingBirthdays: allUsersWithDOB.map(user => {
            const userDOB = new Date(user.dateOfBirth);
            return {
              name: user.name,
              email: user.email,
              birthdayMonth: userDOB.getMonth() + 1,
              birthdayDay: userDOB.getDate(),
              daysUntilBirthday: Math.ceil((new Date(today.getFullYear(), userDOB.getMonth(), userDOB.getDate()) - today) / (1000 * 60 * 60 * 24))
            };
          }).filter(user => user.daysUntilBirthday >= 0 && user.daysUntilBirthday <= 7)
        }
      });
    }

    const couponsToCreate = [];
    const emailsToSend = [];
    
    // Set expiry date to be after their actual birthday
    const expiryDate = new Date(targetDate);
    expiryDate.setDate(targetDate.getDate() + validDays);

    for (const user of usersWithUpcomingBirthday) {
      // Check if user already has a birthday coupon for this year
      const existingCoupon = await db.collection('coupons').findOne({
        userId: user._id,
        type: 'birthday',
        createdAt: {
          $gte: new Date(today.getFullYear(), 0, 1), // Start of current year
          $lt: new Date(today.getFullYear() + 1, 0, 1) // Start of next year
        }
      });

      if (!existingCoupon) {
        const couponCode = `BIRTHDAY${user._id.toString().slice(-6).toUpperCase()}${today.getFullYear()}`;
        const birthdayDate = targetDate.toLocaleDateString('en-GB', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        
        const couponData = {
          code: couponCode,
          discountPercentage,
          expiryDate,
          isActive: true,
          usageLimit: 1,
          usedCount: 0,
          type: 'birthday',
          userId: user._id,
          userName: user.name,
          userEmail: user.email,
          birthdayDate: targetDate,
          daysInAdvance,
          message: message || `🎉 Happy Early Birthday ${user.name}! Your special ${discountPercentage}% off coupon is ready for your birthday on ${birthdayDate}!`,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        couponsToCreate.push(couponData);
        
        // Prepare email data
        emailsToSend.push({
          to: user.email,
          name: user.name,
          couponCode,
          discountPercentage,
          birthdayDate,
          expiryDate: expiryDate.toLocaleDateString('en-GB'),
          message: couponData.message
        });
      }
    }

    let emailResults = [];
    
    if (couponsToCreate.length > 0) {
      // Insert coupons into database
      await db.collection('coupons').insertMany(couponsToCreate);
      
      // Send birthday emails
      console.log(`📧 Sending ${emailsToSend.length} birthday emails...`);
      emailResults = await sendBulkBirthdayEmails(emailsToSend);
      
      const successfulEmails = emailResults.filter(r => r.success).length;
      const failedEmails = emailResults.filter(r => !r.success).length;
      
      console.log(`✅ Successfully sent ${successfulEmails} emails`);
      if (failedEmails > 0) {
        console.log(`❌ Failed to send ${failedEmails} emails`);
      }
    }

    res.json({
      message: `Birthday coupons generated successfully`,
      usersCount: usersWithUpcomingBirthday.length,
      couponsGenerated: couponsToCreate.length,
      emailsSent: emailResults.filter(r => r.success).length,
      emailsFailed: emailResults.filter(r => !r.success).length,
      daysInAdvance,
      targetDate: targetDate.toDateString(),
      coupons: couponsToCreate.map(c => ({
        code: c.code,
        userName: c.userName,
        userEmail: c.userEmail,
        discountPercentage: c.discountPercentage,
        birthdayDate: c.birthdayDate
      })),
      emailResults: emailResults.map(r => ({
        recipient: r.recipient,
        success: r.success,
        error: r.error || null
      }))
    });

  } catch (error) {
    console.error('Error generating birthday coupons:', error);
    res.status(500).json({ error: 'Failed to generate birthday coupons' });
  }
});

// Get birthday coupons for current user
router.get('/my-coupons', authenticate, async (req, res) => {
  try {
    const db = getDB();
    const today = new Date();
    
    const birthdayCoupons = await db.collection('coupons').find({
      userId: new ObjectId(req.user.userId),
      type: 'birthday',
      isActive: true,
      expiryDate: { $gte: today },
      usedCount: { $lt: '$usageLimit' }
    }).sort({ createdAt: -1 }).toArray();

    res.json(birthdayCoupons);
  } catch (error) {
    console.error('Error fetching user birthday coupons:', error);
    res.status(500).json({ error: 'Failed to fetch birthday coupons' });
  }
});

// Get all birthday coupons (admin only)
router.get('/admin/all', authenticate, isAdmin, async (req, res) => {
  try {
    const db = getDB();
    
    const birthdayCoupons = await db.collection('coupons').find({
      type: 'birthday'
    }).sort({ createdAt: -1 }).toArray();

    res.json(birthdayCoupons);
  } catch (error) {
    console.error('Error fetching birthday coupons:', error);
    res.status(500).json({ error: 'Failed to fetch birthday coupons' });
  }
});

// Get users with upcoming birthdays (admin only)
router.get('/upcoming-birthdays', authenticate, isAdmin, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const db = getDB();
    const today = new Date();
    const upcomingDays = parseInt(days);

    // Get all users with DOB and filter for upcoming birthdays
    const allUsersWithDOB = await db.collection('users').find({
      dateOfBirth: { $exists: true }
    }, {
      projection: { 
        name: 1, 
        email: 1, 
        dateOfBirth: 1,
        phone: 1
      }
    }).toArray();

    const upcomingBirthdays = [];
    
    for (let i = 0; i <= upcomingDays; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      
      const month = checkDate.getMonth() + 1;
      const day = checkDate.getDate();
      
      // Filter users with birthdays on this date
      const usersWithBirthdayToday = allUsersWithDOB.filter(user => {
        const userDOB = new Date(user.dateOfBirth);
        return userDOB.getMonth() + 1 === month && userDOB.getDate() === day;
      });

      usersWithBirthdayToday.forEach(user => {
        const age = today.getFullYear() - new Date(user.dateOfBirth).getFullYear();
        upcomingBirthdays.push({
          ...user,
          birthdayDate: `${checkDate.getFullYear()}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
          daysUntilBirthday: i,
          age: age + 1 // Age they will turn
        });
      });
    }

    res.json(upcomingBirthdays);
  } catch (error) {
    console.error('Error fetching upcoming birthdays:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming birthdays' });
  }
});

// Generate coupons for users with birthdays in the next X days
router.post('/generate-range', authenticate, isAdmin, async (req, res) => {
  try {
    const { discountPercentage = 15, validDays = 7, message, maxDaysAhead = 7 } = req.body;
    
    if (!discountPercentage || discountPercentage < 1 || discountPercentage > 100) {
      return res.status(400).json({ error: 'Discount percentage must be between 1 and 100' });
    }

    const db = getDB();
    const today = new Date();
    
    // Find users with birthdays in the next maxDaysAhead days
    const allUsersWithDOB = await db.collection('users').find({
      dateOfBirth: { $exists: true }
    }).toArray();

    const usersWithUpcomingBirthdays = [];
    
    for (let daysAhead = 0; daysAhead <= maxDaysAhead; daysAhead++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + daysAhead);
      
      const targetMonth = targetDate.getMonth() + 1;
      const targetDay = targetDate.getDate();
      
      const usersForThisDay = allUsersWithDOB.filter(user => {
        const userDOB = new Date(user.dateOfBirth);
        return userDOB.getMonth() + 1 === targetMonth && userDOB.getDate() === targetDay;
      });
      
      for (const user of usersForThisDay) {
        usersWithUpcomingBirthdays.push({
          ...user,
          daysAhead,
          birthdayDate: targetDate
        });
      }
    }

    if (usersWithUpcomingBirthdays.length === 0) {
      return res.json({ 
        message: `No users have birthdays in the next ${maxDaysAhead} days`,
        usersCount: allUsersWithDOB.length,
        couponsGenerated: 0,
        maxDaysAhead
      });
    }

    const couponsToCreate = [];
    const emailsToSend = [];
    let skippedCount = 0;

    for (const user of usersWithUpcomingBirthdays) {
      // Check if user already has a birthday coupon for this year
      const existingCoupon = await db.collection('coupons').findOne({
        userId: user._id,
        type: 'birthday',
        createdAt: {
          $gte: new Date(today.getFullYear(), 0, 1),
          $lt: new Date(today.getFullYear() + 1, 0, 1)
        }
      });

      if (!existingCoupon) {
        const couponCode = `BIRTHDAY${user._id.toString().slice(-6).toUpperCase()}${today.getFullYear()}`;
        const birthdayDate = user.birthdayDate.toLocaleDateString('en-GB', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        
        // Set expiry date to be after their actual birthday
        const expiryDate = new Date(user.birthdayDate);
        expiryDate.setDate(user.birthdayDate.getDate() + validDays);
        
        const couponData = {
          code: couponCode,
          discountPercentage,
          expiryDate,
          isActive: true,
          usageLimit: 1,
          usedCount: 0,
          type: 'birthday',
          userId: user._id,
          userName: user.name,
          userEmail: user.email,
          birthdayDate: user.birthdayDate,
          daysInAdvance: user.daysAhead,
          message: message || `🎉 Happy ${user.daysAhead === 0 ? '' : 'Early '}Birthday ${user.name}! Your special ${discountPercentage}% off coupon is ready${user.daysAhead === 0 ? '!' : ` for your birthday on ${birthdayDate}!`}`,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        couponsToCreate.push(couponData);
        
        // Prepare email data
        emailsToSend.push({
          to: user.email,
          name: user.name,
          couponCode,
          discountPercentage,
          birthdayDate,
          expiryDate: expiryDate.toLocaleDateString('en-GB'),
          message: couponData.message
        });
      } else {
        skippedCount++;
      }
    }

    let emailResults = [];
    
    if (couponsToCreate.length > 0) {
      // Insert coupons into database
      await db.collection('coupons').insertMany(couponsToCreate);
      
      // Send birthday emails
      console.log(`📧 Sending ${emailsToSend.length} birthday emails...`);
      emailResults = await sendBulkBirthdayEmails(emailsToSend);
      
      const successfulEmails = emailResults.filter(r => r.success).length;
      const failedEmails = emailResults.filter(r => !r.success).length;
      
      console.log(`✅ Successfully sent ${successfulEmails} emails`);
      if (failedEmails > 0) {
        console.log(`❌ Failed to send ${failedEmails} emails`);
      }
    }

    res.json({
      message: `Birthday coupons generated successfully for next ${maxDaysAhead} days`,
      usersWithBirthdays: usersWithUpcomingBirthdays.length,
      couponsGenerated: couponsToCreate.length,
      skippedExisting: skippedCount,
      emailsSent: emailResults.filter(r => r.success).length,
      emailsFailed: emailResults.filter(r => !r.success).length,
      maxDaysAhead,
      coupons: couponsToCreate.map(c => ({
        code: c.code,
        userName: c.userName,
        userEmail: c.userEmail,
        discountPercentage: c.discountPercentage,
        birthdayDate: c.birthdayDate,
        daysInAdvance: c.daysInAdvance
      })),
      emailResults: emailResults.map(r => ({
        recipient: r.recipient,
        success: r.success,
        error: r.error || null
      }))
    });

  } catch (error) {
    console.error('Error generating birthday coupons for range:', error);
    res.status(500).json({ error: 'Failed to generate birthday coupons' });
  }
});

// Auto-generate birthday coupons (can be called by cron job)
router.post('/auto-generate', authenticate, isAdmin, async (req, res) => {
  try {
    const db = getDB();
    
    // Get default birthday coupon settings
    const settings = await db.collection('settings').findOne({ key: 'birthday_coupons' });
    const defaultDiscount = settings?.value?.discountPercentage || 15;
    const defaultValidDays = settings?.value?.validDays || 7;
    const defaultMessage = settings?.value?.message || '🎉 Happy Birthday! Enjoy your special discount!';

    // Generate coupons with default settings
    const result = await fetch(`${req.protocol}://${req.get('host')}/api/birthday-coupons/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization
      },
      body: JSON.stringify({
        discountPercentage: defaultDiscount,
        validDays: defaultValidDays,
        message: defaultMessage
      })
    });

    const data = await result.json();
    res.json(data);

  } catch (error) {
    console.error('Error auto-generating birthday coupons:', error);
    res.status(500).json({ error: 'Failed to auto-generate birthday coupons' });
  }
});

export default router;