#!/usr/bin/env node

/**
 * Local Print Server for Restaurant
 * Runs on a computer in the restaurant to handle thermal printing
 * Communicates with Vercel backend via webhooks/API calls
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ThermalPrinter, PrinterTypes, CharacterSet } from 'node-thermal-printer';
import net from 'net';
import moment from 'moment';

dotenv.config();

const app = express();
const PORT = process.env.LOCAL_PRINT_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Printer Configuration
const PRINTERS = {
  kitchen: {
    name: 'Kitchen Printer',
    ip: process.env.KITCHEN_PRINTER_IP || '192.168.1.227',
    port: parseInt(process.env.KITCHEN_PRINTER_PORT) || 9100,
    enabled: process.env.KITCHEN_PRINTER_ENABLED !== 'false'
  },
  bill: {
    name: 'Bill Desk Printer',
    ip: process.env.BILL_PRINTER_IP || '192.168.1.251',
    port: parseInt(process.env.BILL_PRINTER_PORT) || 9100,
    enabled: process.env.BILL_PRINTER_ENABLED !== 'false'
  }
};

// Generate Kitchen Receipt
function generateKitchenReceipt(order) {
  const printer = new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: 'tcp://localhost:9100',
    characterSet: CharacterSet.PC852_LATIN2,
    removeSpecialCharacters: false,
    lineCharacter: "=",
  });

  try {
    // Header
    printer.alignCenter();
    printer.setTextSize(1, 1);
    printer.bold(true);
    printer.println("================================");
    printer.println("    KITCHEN ORDER #" + order.orderNumber);
    printer.println("================================");
    printer.bold(false);
    printer.newLine();

    // Order Info
    printer.alignLeft();
    printer.println("Table: " + (order.tableNumber || "Delivery"));
    printer.println("Time: " + moment().format('HH:mm DD/MM/YYYY'));
    printer.println("Customer: " + order.customerName);
    if (order.customerPhone) {
      printer.println("Phone: " + order.customerPhone);
    }
    printer.println("--------------------------------");

    // Items
    order.items.forEach(item => {
      printer.bold(true);
      printer.println(`${item.quantity}x ${item.name}`);
      printer.bold(false);
      
      if (item.selectedSize) {
        printer.println(`   Size: ${item.selectedSize}`);
      }
      
      if (item.notes) {
        printer.println(`   Notes: ${item.notes}`);
      }
      printer.newLine();
    });

    printer.println("--------------------------------");

    // Special Instructions
    if (order.specialInstructions) {
      printer.bold(true);
      printer.println("SPECIAL INSTRUCTIONS:");
      printer.bold(false);
      printer.println(order.specialInstructions);
      printer.println("--------------------------------");
    }

    // Summary
    printer.bold(true);
    printer.println(`TOTAL ITEMS: ${order.items.reduce((sum, item) => sum + item.quantity, 0)}`);
    printer.bold(false);
    printer.println("================================");
    printer.newLine();
    printer.newLine();

    // Cut paper
    printer.cut();

    return printer.getBuffer();
  } catch (error) {
    console.error('❌ Error generating kitchen receipt:', error);
    throw error;
  }
}

// Generate Bill Receipt
function generateBillReceipt(order) {
  const printer = new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: 'tcp://localhost:9100',
    characterSet: CharacterSet.PC852_LATIN2,
    removeSpecialCharacters: false,
    lineCharacter: "=",
  });

  try {
    // Header
    printer.alignCenter();
    printer.setTextSize(1, 1);
    printer.bold(true);
    printer.println("================================");
    printer.println("     INDIYA BAR & RESTAURANT");
    printer.println("    180 High Street, Orpington");
    printer.println("      Tel: 01689 451 403");
    printer.println("================================");
    printer.bold(false);
    printer.newLine();

    // Order Details
    printer.alignLeft();
    printer.println("Order #: " + order.orderNumber);
    printer.println("Date: " + moment().format('DD/MM/YYYY HH:mm'));
    printer.println("Customer: " + order.customerName);
    if (order.customerPhone) {
      printer.println("Phone: " + order.customerPhone);
    }
    printer.println("--------------------------------");

    // Items with prices
    order.items.forEach(item => {
      const itemTotal = (parseFloat(item.price) * item.quantity).toFixed(2);
      const itemLine = `${item.quantity}x ${item.name}`;
      const priceLine = `£${itemTotal}`;
      
      const maxWidth = 32;
      const padding = maxWidth - itemLine.length - priceLine.length;
      printer.println(itemLine + ' '.repeat(Math.max(1, padding)) + priceLine);
      
      if (item.selectedSize) {
        printer.println(`   (${item.selectedSize})`);
      }
    });

    printer.println("--------------------------------");

    // Totals
    const subtotal = order.items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    const deliveryFee = parseFloat(order.deliveryFee) || 0;
    const discount = parseFloat(order.discount) || 0;
    const total = subtotal + deliveryFee - discount;

    printer.println(`Subtotal:${' '.repeat(23)}£${subtotal.toFixed(2)}`);
    
    if (deliveryFee > 0) {
      printer.println(`Delivery Fee:${' '.repeat(19)}£${deliveryFee.toFixed(2)}`);
    }
    
    if (discount > 0) {
      printer.println(`Discount:${' '.repeat(22)}-£${discount.toFixed(2)}`);
    }
    
    printer.println("--------------------------------");
    printer.bold(true);
    printer.println(`TOTAL:${' '.repeat(25)}£${total.toFixed(2)}`);
    printer.bold(false);
    
    if (order.paymentMethod) {
      printer.println(`Payment: ${order.paymentMethod}`);
    }
    
    printer.println("--------------------------------");

    // Delivery Address
    if (order.deliveryAddress) {
      printer.println("Delivery Address:");
      printer.println(order.deliveryAddress);
      printer.println("--------------------------------");
    }

    // Footer
    printer.alignCenter();
    printer.println("Thank you for your order!");
    printer.println("Visit: www.indiyarestaurant.co.uk");
    printer.println("================================");
    printer.newLine();
    printer.newLine();

    // Cut paper
    printer.cut();

    return printer.getBuffer();
  } catch (error) {
    console.error('❌ Error generating bill receipt:', error);
    throw error;
  }
}

// Send data to printer
async function sendToPrinter(printerId, data) {
  const printer = PRINTERS[printerId];
  if (!printer || !printer.enabled) {
    throw new Error(`Printer ${printerId} not found or disabled`);
  }

  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    const timeout = 5000;

    socket.setTimeout(timeout);

    socket.on('connect', () => {
      console.log(`🔌 Connected to ${printer.name} (${printer.ip}:${printer.port})`);
      socket.write(data);
      socket.end();
    });

    socket.on('close', () => {
      console.log(`✅ Print job sent to ${printer.name}`);
      resolve({ success: true, printer: printer.name });
    });

    socket.on('timeout', () => {
      console.error(`⏰ Timeout connecting to ${printer.name}`);
      socket.destroy();
      reject(new Error(`Timeout connecting to ${printer.name}`));
    });

    socket.on('error', (error) => {
      console.error(`❌ Error connecting to ${printer.name}:`, error.message);
      reject(error);
    });

    socket.connect(printer.port, printer.ip);
  });
}

// API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Local Print Server is running',
    printers: PRINTERS
  });
});

// Print order (webhook from Vercel)
app.post('/print-order', async (req, res) => {
  try {
    const { order, printerType = 'both', webhookSecret } = req.body;

    // Verify webhook secret (optional security)
    if (process.env.WEBHOOK_SECRET && webhookSecret !== process.env.WEBHOOK_SECRET) {
      return res.status(401).json({ error: 'Invalid webhook secret' });
    }

    if (!order) {
      return res.status(400).json({ error: 'Order data required' });
    }

    console.log(`🖨️ Printing order ${order.orderNumber} to ${printerType} printer(s)`);

    const results = [];

    // Print to kitchen
    if (printerType === 'both' || printerType === 'kitchen') {
      try {
        const kitchenData = generateKitchenReceipt(order);
        const result = await sendToPrinter('kitchen', kitchenData);
        results.push({ printer: 'kitchen', ...result });
      } catch (error) {
        console.error('Kitchen print failed:', error.message);
        results.push({ printer: 'kitchen', success: false, error: error.message });
      }
    }

    // Print to bill desk
    if (printerType === 'both' || printerType === 'bill') {
      try {
        const billData = generateBillReceipt(order);
        const result = await sendToPrinter('bill', billData);
        results.push({ printer: 'bill', ...result });
      } catch (error) {
        console.error('Bill print failed:', error.message);
        results.push({ printer: 'bill', success: false, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Print jobs processed for order ${order.orderNumber}`,
      results
    });

  } catch (error) {
    console.error('❌ Print order error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test print
app.post('/test-print/:printerId', async (req, res) => {
  try {
    const { printerId } = req.params;
    
    if (!PRINTERS[printerId]) {
      return res.status(400).json({ error: 'Invalid printer ID' });
    }

    const testOrder = {
      orderNumber: 'TEST' + Date.now(),
      customerName: 'Test Customer',
      customerPhone: '01234 567890',
      items: [
        {
          name: 'Test Item',
          quantity: 1,
          price: '10.00',
          selectedSize: 'Medium'
        }
      ],
      deliveryFee: 2.50,
      discount: 0,
      paymentMethod: 'Test',
      deliveryAddress: '123 Test Street, Test City, TE5T 1NG'
    };

    let data;
    if (printerId === 'kitchen') {
      data = generateKitchenReceipt(testOrder);
    } else {
      data = generateBillReceipt(testOrder);
    }

    const result = await sendToPrinter(printerId, data);
    
    res.json({
      success: true,
      message: `Test print sent to ${printerId} printer`,
      result
    });

  } catch (error) {
    console.error('❌ Test print error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get printer status
app.get('/status', (req, res) => {
  res.json({
    printers: PRINTERS,
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🖨️ Local Print Server running on port ${PORT}`);
  console.log(`📍 Kitchen Printer: ${PRINTERS.kitchen.ip}:${PRINTERS.kitchen.port}`);
  console.log(`📍 Bill Desk Printer: ${PRINTERS.bill.ip}:${PRINTERS.bill.port}`);
  console.log(`🌐 Webhook URL: http://localhost:${PORT}/print-order`);
});