import express from 'express';
import { ObjectId } from 'mongodb';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { hybridPrintingService } from '../services/hybridPrintingService.js';
import { thermalPrinterService } from '../services/thermalPrinterService.js';
import { printJobManager } from '../services/printJobManager.js';

const router = express.Router();

// Get printer status
router.get('/status', authenticate, isAdmin, async (req, res) => {
  try {
    const printerStatus = hybridPrintingService.getPrinterStatus();
    const queueStatus = hybridPrintingService.getQueueStatus();
    
    res.json({
      printers: printerStatus,
      queue: queueStatus,
      enabled: process.env.ENABLE_PRINTING !== 'false',
      mode: process.env.VERCEL ? 'production' : 'development'
    });
  } catch (error) {
    console.error('❌ Error getting printer status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test print
router.post('/test/:printerId', authenticate, isAdmin, async (req, res) => {
  try {
    const { printerId } = req.params;
    
    if (!['kitchen', 'bill'].includes(printerId)) {
      return res.status(400).json({ error: 'Invalid printer ID' });
    }

    console.log(`🧪 Admin test print requested for ${printerId} printer`);
    
    const result = await hybridPrintingService.testPrint(printerId);
    
    // The hybrid service now returns a result object with success/error info
    if (result.success) {
      res.json(result);
    } else {
      // Return error but with 200 status since it's an expected printer connectivity issue
      res.json(result);
    }
  } catch (error) {
    console.error('❌ Unexpected test print error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Reprint order
router.post('/reprint/:orderId', authenticate, isAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { printerType = 'both' } = req.body;
    
    // Get order from database
    const { getDB } = await import('../config/db.js');
    const db = getDB();
    const order = await db.collection('orders').findOne({ 
      $or: [
        { _id: new ObjectId(orderId) },
        { orderNumber: orderId }
      ]
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    console.log(`🔄 Admin reprint requested for order ${order.orderNumber}`);
    
    const result = await thermalPrinterService.printOrder(order, printerType);
    
    res.json({
      success: true,
      message: `Reprint job queued for order ${order.orderNumber}`,
      result
    });
  } catch (error) {
    console.error('❌ Reprint error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get print history/logs with advanced analytics
router.get('/logs', authenticate, isAdmin, async (req, res) => {
  try {
    const { limit = 50, offset = 0, startDate, endDate, status, printerId } = req.query;
    
    // Get comprehensive job statistics
    const queueStats = printJobManager.getQueueStats();
    const printerStatus = thermalPrinterService.getPrinterStatus();
    
    // Get recent activity with filters
    let recentJobs = queueStats.recentActivity;
    
    // Apply filters
    if (status) {
      recentJobs = recentJobs.filter(job => job.status === status);
    }
    
    if (printerId) {
      recentJobs = recentJobs.filter(job => job.printerId === printerId);
    }
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      recentJobs = recentJobs.filter(job => 
        job.createdAt >= start && job.createdAt <= end
      );
    }
    
    // Paginate results
    const paginatedJobs = recentJobs.slice(offset, offset + limit);
    
    res.json({
      jobs: paginatedJobs,
      total: recentJobs.length,
      statistics: {
        queue: queueStats,
        printers: printerStatus,
        performance: {
          avgProcessingTime: queueStats.avgProcessingTime,
          successRate: queueStats.successRate,
          totalProcessed: queueStats.completed,
          currentlyProcessing: queueStats.processing
        }
      }
    });
  } catch (error) {
    console.error('❌ Error getting print logs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update printer configuration
router.put('/config/:printerId', authenticate, isAdmin, async (req, res) => {
  try {
    const { printerId } = req.params;
    const { enabled } = req.body;
    
    if (!['kitchen', 'bill'].includes(printerId)) {
      return res.status(400).json({ error: 'Invalid printer ID' });
    }

    // Update printer enabled status
    const printers = thermalPrinterService.printers;
    const printer = printers.get(printerId);
    
    if (!printer) {
      return res.status(404).json({ error: 'Printer not found' });
    }

    printer.enabled = enabled;
    
    console.log(`⚙️ Printer ${printerId} ${enabled ? 'enabled' : 'disabled'} by admin`);
    
    res.json({
      success: true,
      message: `Printer ${printerId} ${enabled ? 'enabled' : 'disabled'}`,
      printer: {
        id: printerId,
        name: printer.name,
        enabled: printer.enabled,
        status: printer.status
      }
    });
  } catch (error) {
    console.error('❌ Error updating printer config:', error);
    res.status(500).json({ error: error.message });
  }
});

// Force queue processing
router.post('/queue/process', authenticate, isAdmin, async (req, res) => {
  try {
    console.log('🔄 Admin forced queue processing');
    
    // Force process the queue
    await thermalPrinterService.processQueue();
    
    const queueStatus = thermalPrinterService.getQueueStatus();
    
    res.json({
      success: true,
      message: 'Queue processing triggered',
      queueStatus
    });
  } catch (error) {
    console.error('❌ Error processing queue:', error);
    res.status(500).json({ error: error.message });
  }
});

// Clear print queue
router.delete('/queue', authenticate, isAdmin, async (req, res) => {
  try {
    console.log('🗑️ Admin cleared print queue');
    
    const queueLength = thermalPrinterService.printQueue.length;
    thermalPrinterService.printQueue = [];
    
    res.json({
      success: true,
      message: `Cleared ${queueLength} jobs from print queue`
    });
  } catch (error) {
    console.error('❌ Error clearing queue:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
router.get('/health', authenticate, isAdmin, async (req, res) => {
  try {
    await thermalPrinterService.checkAllPrinters();
    const status = thermalPrinterService.getPrinterStatus();
    
    const allOnline = Object.values(status).every(printer => 
      !printer.enabled || printer.status === 'online'
    );
    
    res.json({
      healthy: allOnline,
      printers: status,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('❌ Health check error:', error);
    res.status(500).json({ 
      healthy: false, 
      error: error.message 
    });
  }
});

// Reset printer statistics
router.post('/reset-stats', authenticate, isAdmin, async (req, res) => {
  try {
    thermalPrinterService.resetPrinterStats();
    
    res.json({
      success: true,
      message: 'Printer statistics reset successfully'
    });
  } catch (error) {
    console.error('❌ Error resetting printer stats:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;