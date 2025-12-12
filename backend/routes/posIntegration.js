import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { posIntegrationService } from '../services/posIntegrationService.js';

const router = express.Router();

// Get POS integration status
router.get('/status', authenticate, isAdmin, async (req, res) => {
  try {
    const status = posIntegrationService.getStatus();
    
    res.json({
      ...status,
      message: status.enabled ? 'POS integration is enabled' : 'POS integration is disabled'
    });
  } catch (error) {
    console.error('❌ Error getting POS status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test POS connection
router.post('/test', authenticate, isAdmin, async (req, res) => {
  try {
    console.log('🧪 Admin POS connection test requested');
    
    const result = await posIntegrationService.testConnection();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'POS connection test successful',
        result
      });
    } else {
      res.json({
        success: false,
        message: 'POS connection test failed',
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ POS test error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Send test print to POS
router.post('/test-print', authenticate, isAdmin, async (req, res) => {
  try {
    const { printerType = 'both' } = req.body;
    
    console.log(`🧪 Admin POS test print requested for ${printerType} printer(s)`);
    
    const testOrder = {
      orderNumber: 'POS-TEST-' + Date.now(),
      customerName: 'POS Test Customer',
      customerPhone: '01234 567890',
      items: [
        {
          name: 'POS Test Item',
          quantity: 1,
          price: 10.00,
          selectedSize: 'Medium'
        }
      ],
      totalAmount: 10.00,
      deliveryFee: 0,
      discount: 0,
      paymentMethod: 'Test',
      deliveryAddress: 'POS Integration Test',
      specialInstructions: 'This is a test print from the POS integration system'
    };

    const result = await posIntegrationService.printOrder(testOrder, printerType);
    
    if (result.success) {
      res.json({
        success: true,
        message: `POS test print sent to ${printerType} printer(s)`,
        result
      });
    } else {
      res.json({
        success: false,
        message: 'POS test print failed',
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ POS test print error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get POS integration configuration (safe - no sensitive data)
router.get('/config', authenticate, isAdmin, async (req, res) => {
  try {
    const config = {
      enabled: process.env.ENABLE_POS_INTEGRATION === 'true',
      serverUrl: process.env.POS_SERVER_URL ? 
        process.env.POS_SERVER_URL.replace(/\/\/.*@/, '//***:***@') : // Hide credentials in URL
        'Not configured',
      integrationMethod: process.env.POS_INTEGRATION_METHOD || 'rest',
      hasApiKey: !!process.env.POS_API_KEY,
      hasCredentials: !!(process.env.POS_USERNAME && process.env.POS_PASSWORD)
    };
    
    res.json(config);
  } catch (error) {
    console.error('❌ Error getting POS config:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;