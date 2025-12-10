import express from 'express';
import { ObjectId } from 'mongodb';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { invoiceService } from '../services/invoiceService.js';

const router = express.Router();

// Get invoice HTML for display/printing
router.get('/:orderId/html', authenticate, isAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { type = 'bill' } = req.query; // 'bill' or 'kitchen'
    
    // Get order from database
    const { getDB } = await import('../config/db.js');
    const db = getDB();
    
    let order;
    if (ObjectId.isValid(orderId)) {
      order = await db.collection('orders').findOne({ _id: new ObjectId(orderId) });
    } else {
      order = await db.collection('orders').findOne({ orderNumber: orderId });
    }
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    let html;
    if (type === 'kitchen') {
      html = invoiceService.generateKitchenReceipt(order);
    } else {
      html = invoiceService.generateHTMLInvoice(order);
    }

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
    
  } catch (error) {
    console.error('❌ Error generating invoice HTML:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get invoice data as JSON
router.get('/:orderId/data', authenticate, isAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Get order from database
    const { getDB } = await import('../config/db.js');
    const db = getDB();
    
    let order;
    if (ObjectId.isValid(orderId)) {
      order = await db.collection('orders').findOne({ _id: new ObjectId(orderId) });
    } else {
      order = await db.collection('orders').findOne({ orderNumber: orderId });
    }
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Calculate totals
    const subtotal = order.items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    const deliveryFee = parseFloat(order.deliveryFee) || 0;
    const discount = parseFloat(order.discount) || 0;
    const total = subtotal + deliveryFee - discount;

    const invoiceData = {
      order,
      calculations: {
        subtotal: subtotal.toFixed(2),
        deliveryFee: deliveryFee.toFixed(2),
        discount: discount.toFixed(2),
        total: total.toFixed(2)
      },
      thermalReceipts: {
        kitchen: invoiceService.generateThermalReceipt(order, 'kitchen'),
        bill: invoiceService.generateThermalReceipt(order, 'bill')
      }
    };

    res.json(invoiceData);
    
  } catch (error) {
    console.error('❌ Error getting invoice data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Download invoice as text file (for thermal printer simulation)
router.get('/:orderId/download', authenticate, isAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { type = 'bill' } = req.query; // 'bill' or 'kitchen'
    
    // Get order from database
    const { getDB } = await import('../config/db.js');
    const db = getDB();
    
    let order;
    if (ObjectId.isValid(orderId)) {
      order = await db.collection('orders').findOne({ _id: new ObjectId(orderId) });
    } else {
      order = await db.collection('orders').findOne({ orderNumber: orderId });
    }
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const receiptText = invoiceService.generateThermalReceipt(order, type);
    const filename = `${order.orderNumber}_${type}_receipt.txt`;

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(receiptText);
    
  } catch (error) {
    console.error('❌ Error downloading invoice:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reprint order (manual print trigger)
router.post('/:orderId/reprint', authenticate, isAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { printerType = 'both' } = req.body; // 'kitchen', 'bill', or 'both'
    
    // Get order from database
    const { getDB } = await import('../config/db.js');
    const db = getDB();
    
    let order;
    if (ObjectId.isValid(orderId)) {
      order = await db.collection('orders').findOne({ _id: new ObjectId(orderId) });
    } else {
      order = await db.collection('orders').findOne({ orderNumber: orderId });
    }
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Import hybrid printing service
    const { hybridPrintingService } = await import('../services/hybridPrintingService.js');
    
    console.log(`🔄 Admin manual reprint requested for order ${order.orderNumber}`);
    
    const result = await hybridPrintingService.printOrder(order, printerType);
    
    res.json({
      success: true,
      message: `Manual reprint triggered for order ${order.orderNumber}`,
      result
    });
    
  } catch (error) {
    console.error('❌ Manual reprint error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all orders with invoice links (for admin panel)
router.get('/list', authenticate, isAdmin, async (req, res) => {
  try {
    const { limit = 50, offset = 0, status } = req.query;
    
    // Get orders from database
    const { getDB } = await import('../config/db.js');
    const db = getDB();
    
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const orders = await db.collection('orders')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .toArray();

    const total = await db.collection('orders').countDocuments(query);

    // Add invoice URLs to each order and normalize field names
    const ordersWithInvoices = orders.map(order => ({
      ...order,
      // Normalize total field (some orders have totalAmount, others have total)
      total: order.total || order.totalAmount || 0,
      invoiceUrls: {
        html: `/api/invoices/${order._id}/html`,
        kitchen: `/api/invoices/${order._id}/html?type=kitchen`,
        data: `/api/invoices/${order._id}/data`,
        downloadBill: `/api/invoices/${order._id}/download?type=bill`,
        downloadKitchen: `/api/invoices/${order._id}/download?type=kitchen`,
        reprint: `/api/invoices/${order._id}/reprint`
      }
    }));

    res.json({
      orders: ordersWithInvoices,
      total,
      hasMore: (parseInt(offset) + parseInt(limit)) < total
    });
    
  } catch (error) {
    console.error('❌ Error getting orders list:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;