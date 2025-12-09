import express from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { printerService } from '../services/printerService.js';

const router = express.Router();

// Test printer connection
router.post('/test/:printerType', authenticate, isAdmin, async (req, res) => {
  try {
    const { printerType } = req.params; // 'kitchen' or 'billDesk'
    
    // Validate printer type
    if (!['kitchen', 'billDesk'].includes(printerType)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid printer type. Must be "kitchen" or "billDesk"' 
      });
    }
    
    // Check if printing is enabled
    if (!printerService.isAvailable()) {
      return res.status(503).json({ 
        success: false, 
        error: 'Printing service is disabled. Set ENABLE_PRINTING=true in .env',
        enabled: printerService.enabled,
        initialized: printerService.initialized
      });
    }
    
    const printerName = printerType === 'kitchen' 
      ? printerService.printers.kitchen 
      : printerService.printers.billDesk;
    
    const result = await printerService.testPrinter(printerName);
    
    res.json({ 
      success: true, 
      message: `Test print sent to ${printerType} printer`,
      printerName,
      printerType,
      result
    });
  } catch (error) {
    console.error('Printer test error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: 'Check server logs for more information'
    });
  }
});

// Reprint order
router.post('/reprint/:orderNumber', authenticate, isAdmin, async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { printerType } = req.body; // 'kitchen', 'billDesk', or 'both'
    
    // Validate order number
    if (!orderNumber || typeof orderNumber !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid order number' 
      });
    }
    
    // Check if printing is enabled
    if (!printerService.isAvailable()) {
      return res.status(503).json({ 
        success: false, 
        error: 'Printing service is disabled. Set ENABLE_PRINTING=true in .env',
        enabled: printerService.enabled,
        initialized: printerService.initialized
      });
    }
    
    const result = await printerService.reprintOrder(orderNumber, printerType || 'both');
    
    res.json({ 
      success: true, 
      message: `Order #${orderNumber} reprinted successfully`,
      orderNumber,
      printerType: printerType || 'both',
      result
    });
  } catch (error) {
    console.error('Reprint error:', error);
    
    // Determine appropriate status code
    const statusCode = error.message.includes('not found') ? 404 : 500;
    
    res.status(statusCode).json({ 
      success: false, 
      error: error.message,
      orderNumber: req.params.orderNumber
    });
  }
});

// Get print logs
router.get('/logs', authenticate, isAdmin, async (req, res) => {
  try {
    const db = getDB();
    const logs = await db.collection('print_logs')
      .find()
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();
    
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get printer settings
router.get('/settings', authenticate, isAdmin, async (req, res) => {
  try {
    res.json({
      enabled: printerService.enabled,
      initialized: printerService.initialized,
      available: printerService.isAvailable(),
      initializationError: printerService.initializationError?.message || null,
      kitchen: {
        name: printerService.printers.kitchen,
        status: printerService.isAvailable() ? 'ready' : 'unavailable'
      },
      billDesk: {
        name: printerService.printers.billDesk,
        status: printerService.isAvailable() ? 'ready' : 'unavailable'
      },
      environment: process.env.NODE_ENV || 'production'
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Failed to retrieve printer settings'
    });
  }
});

// Update printer settings
router.put('/settings', authenticate, isAdmin, async (req, res) => {
  try {
    const { kitchenPrinter, billDeskPrinter, enabled } = req.body;
    
    // Validate inputs
    if (kitchenPrinter && typeof kitchenPrinter !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid kitchen printer name' 
      });
    }
    
    if (billDeskPrinter && typeof billDeskPrinter !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid bill desk printer name' 
      });
    }
    
    // Update printer names
    if (kitchenPrinter) {
      printerService.printers.kitchen = kitchenPrinter.trim();
      console.log(`✏️  Kitchen printer updated to: ${kitchenPrinter}`);
    }
    
    if (billDeskPrinter) {
      printerService.printers.billDesk = billDeskPrinter.trim();
      console.log(`✏️  Bill desk printer updated to: ${billDeskPrinter}`);
    }
    
    // Update enabled status
    if (typeof enabled === 'boolean') {
      printerService.enabled = enabled;
      console.log(`✏️  Printing ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    res.json({ 
      success: true, 
      message: 'Printer settings updated successfully',
      printers: printerService.printers,
      enabled: printerService.enabled,
      note: 'Changes take effect immediately'
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: 'Failed to update printer settings'
    });
  }
});

export default router;
