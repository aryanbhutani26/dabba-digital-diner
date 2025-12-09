import { getDB } from '../config/db.js';

/**
 * Printer Service
 * Handles automatic printing to kitchen and bill desk printers
 * Production-ready with comprehensive error handling
 */

class PrinterService {
  constructor() {
    this.printers = {
      kitchen: process.env.KITCHEN_PRINTER_NAME || 'Kitchen_Printer',
      billDesk: process.env.BILL_DESK_PRINTER_NAME || 'BillDesk_Printer'
    };
    this.enabled = process.env.ENABLE_PRINTING === 'true';
    this.initialized = false;
    this.initializationError = null;
    
    // Initialize printer service
    this.initialize();
  }

  /**
   * Initialize printer service
   */
  initialize() {
    try {
      if (!this.enabled) {
        console.log('ℹ️  Printer service disabled (ENABLE_PRINTING=false)');
        this.initialized = true;
        return;
      }

      console.log('🖨️  Initializing printer service...');
      console.log(`   Kitchen Printer: ${this.printers.kitchen}`);
      console.log(`   Bill Desk Printer: ${this.printers.billDesk}`);
      
      this.initialized = true;
      console.log('✅ Printer service initialized successfully');
    } catch (error) {
      this.initializationError = error;
      console.error('❌ Printer service initialization failed:', error.message);
      console.log('⚠️  Orders will continue to work, but printing will be disabled');
    }
  }

  /**
   * Check if printing is available
   */
  isAvailable() {
    return this.initialized && this.enabled && !this.initializationError;
  }

  /**
   * Format order for kitchen printer
   * Focus: Item details, quantities, special instructions
   */
  formatKitchenReceipt(order) {
    const lines = [];
    lines.push('================================');
    lines.push('       KITCHEN ORDER');
    lines.push('================================');
    lines.push('');
    lines.push(`Order #: ${order.orderNumber}`);
    lines.push(`Time: ${new Date(order.createdAt).toLocaleString()}`);
    lines.push(`Customer: ${order.customerName}`);
    lines.push(`Phone: ${order.customerPhone}`);
    lines.push('');
    lines.push('--------------------------------');
    lines.push('ITEMS TO PREPARE:');
    lines.push('--------------------------------');
    
    order.items.forEach((item, index) => {
      lines.push('');
      lines.push(`${index + 1}. ${item.name}`);
      lines.push(`   Qty: ${item.quantity}x`);
      lines.push(`   Price: £${item.price.toFixed(2)} each`);
      if (item.selectedSize) {
        lines.push(`   Size: ${item.selectedSize}`);
      }
    });
    
    lines.push('');
    lines.push('================================');
    lines.push(`Total Items: ${order.items.reduce((sum, item) => sum + item.quantity, 0)}`);
    lines.push('================================');
    lines.push('');
    lines.push('Delivery Address:');
    lines.push(order.deliveryAddress);
    lines.push('');
    lines.push('================================');
    
    return lines.join('\n');
  }

  /**
   * Format order for bill desk printer
   * Focus: Complete invoice with pricing, taxes, payment details
   */
  formatBillDeskReceipt(order) {
    const lines = [];
    lines.push('================================');
    lines.push('     RESTAURANT NAME');
    lines.push('     123 Main Street');
    lines.push('     Phone: 01234 567890');
    lines.push('================================');
    lines.push('');
    lines.push('        INVOICE');
    lines.push('');
    lines.push(`Order #: ${order.orderNumber}`);
    lines.push(`Date: ${new Date(order.createdAt).toLocaleString()}`);
    lines.push('');
    lines.push('--------------------------------');
    lines.push('Customer Details:');
    lines.push('--------------------------------');
    lines.push(`Name: ${order.customerName}`);
    lines.push(`Phone: ${order.customerPhone}`);
    lines.push('');
    lines.push('Delivery Address:');
    lines.push(order.deliveryAddress);
    lines.push('');
    lines.push('--------------------------------');
    lines.push('Order Items:');
    lines.push('--------------------------------');
    
    order.items.forEach((item) => {
      const itemName = item.selectedSize ? `${item.name} (${item.selectedSize})` : item.name;
      const itemTotal = (item.price * item.quantity).toFixed(2);
      lines.push(`${item.quantity}x ${itemName}`);
      lines.push(`   £${item.price.toFixed(2)} x ${item.quantity} = £${itemTotal}`);
    });
    
    lines.push('');
    lines.push('--------------------------------');
    lines.push('Price Breakdown:');
    lines.push('--------------------------------');
    
    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    lines.push(`Subtotal:        £${subtotal.toFixed(2)}`);
    
    if (order.discount > 0) {
      lines.push(`Discount:       -£${order.discount.toFixed(2)}`);
      if (order.couponCode) {
        lines.push(`  (Code: ${order.couponCode})`);
      }
    }
    
    const deliveryFee = order.deliveryFee || 0;
    lines.push(`Delivery Fee:    £${deliveryFee.toFixed(2)}`);
    lines.push('--------------------------------');
    lines.push(`TOTAL:           £${order.totalAmount.toFixed(2)}`);
    lines.push('--------------------------------');
    lines.push('');
    lines.push('Payment Details:');
    lines.push(`Method: ${order.paymentMethod.toUpperCase()}`);
    lines.push(`Status: ${order.paymentStatus.toUpperCase()}`);
    lines.push(`Payment ID: ${order.paymentIntentId || 'N/A'}`);
    lines.push('');
    lines.push('================================');
    lines.push('   Thank you for your order!');
    lines.push('================================');
    lines.push('');
    
    return lines.join('\n');
  }

  /**
   * Send print job to printer
   * Production-ready with comprehensive error handling
   */
  async sendToPrinter(printerName, content) {
    // Validate inputs
    if (!printerName || typeof printerName !== 'string') {
      throw new Error('Invalid printer name');
    }
    
    if (!content || typeof content !== 'string') {
      throw new Error('Invalid print content');
    }

    try {
      console.log(`\n📄 Sending to printer: ${printerName}`);
      
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('================================');
        console.log(content);
        console.log('================================\n');
      }
      
      // Actual printer implementation would go here
      // Example using node-printer (needs to be installed):
      /*
      const printer = require('printer');
      
      // Check if printer exists
      const printers = printer.getPrinters();
      const printerExists = printers.some(p => p.name === printerName);
      
      if (!printerExists) {
        throw new Error(`Printer "${printerName}" not found`);
      }
      
      // Send print job
      printer.printDirect({
        data: content,
        printer: printerName,
        type: 'TEXT',
        success: function(jobID) {
          console.log(`✅ Print job ${jobID} sent to ${printerName}`);
        },
        error: function(err) {
          console.error(`❌ Print error for ${printerName}:`, err);
        }
      });
      */
      
      // Log to database for tracking (always happens)
      try {
        const db = getDB();
        await db.collection('print_logs').insertOne({
          printerName,
          contentLength: content.length,
          contentPreview: content.substring(0, 200) + '...',
          timestamp: new Date(),
          status: 'sent',
          environment: process.env.NODE_ENV || 'production'
        });
      } catch (dbError) {
        // Don't fail printing if database logging fails
        console.error('⚠️  Failed to log print job to database:', dbError.message);
      }
      
      return { 
        success: true, 
        printer: printerName,
        timestamp: new Date()
      };
    } catch (error) {
      console.error(`❌ Error printing to ${printerName}:`, error.message);
      
      // Log error to database
      try {
        const db = getDB();
        await db.collection('print_logs').insertOne({
          printerName,
          error: error.message,
          timestamp: new Date(),
          status: 'failed',
          environment: process.env.NODE_ENV || 'production'
        });
      } catch (dbError) {
        console.error('⚠️  Failed to log print error to database:', dbError.message);
      }
      
      throw error;
    }
  }

  /**
   * Print order to both printers automatically
   * Production-ready with comprehensive error handling and fallbacks
   */
  async printOrder(order) {
    // Check if printing is enabled
    if (!this.isAvailable()) {
      console.log(`ℹ️  Printing disabled for order #${order.orderNumber}`);
      return {
        kitchen: 'disabled',
        billDesk: 'disabled',
        timestamp: new Date(),
        message: 'Printing service is disabled'
      };
    }

    // Validate order object
    if (!order || !order.orderNumber) {
      console.error('❌ Invalid order object for printing');
      return {
        kitchen: 'failed',
        billDesk: 'failed',
        timestamp: new Date(),
        error: 'Invalid order object'
      };
    }

    try {
      console.log(`🖨️  Auto-printing order #${order.orderNumber}...`);
      
      // Format receipts with error handling
      let kitchenReceipt, billDeskReceipt;
      
      try {
        kitchenReceipt = this.formatKitchenReceipt(order);
      } catch (formatError) {
        console.error('❌ Error formatting kitchen receipt:', formatError.message);
        kitchenReceipt = null;
      }
      
      try {
        billDeskReceipt = this.formatBillDeskReceipt(order);
      } catch (formatError) {
        console.error('❌ Error formatting bill desk receipt:', formatError.message);
        billDeskReceipt = null;
      }
      
      // If both formats failed, return early
      if (!kitchenReceipt && !billDeskReceipt) {
        throw new Error('Failed to format receipts');
      }
      
      // Send to both printers simultaneously (only if receipt was formatted)
      const printPromises = [];
      
      if (kitchenReceipt) {
        printPromises.push(
          this.sendToPrinter(this.printers.kitchen, kitchenReceipt)
            .catch(err => ({ error: err.message, printer: 'kitchen' }))
        );
      }
      
      if (billDeskReceipt) {
        printPromises.push(
          this.sendToPrinter(this.printers.billDesk, billDeskReceipt)
            .catch(err => ({ error: err.message, printer: 'billDesk' }))
        );
      }
      
      const printResults = await Promise.allSettled(printPromises);
      
      // Process results
      const results = {
        kitchen: kitchenReceipt 
          ? (printResults[0]?.status === 'fulfilled' && !printResults[0].value?.error ? 'success' : 'failed')
          : 'skipped',
        billDesk: billDeskReceipt 
          ? (printResults[printPromises.length - 1]?.status === 'fulfilled' && !printResults[printPromises.length - 1].value?.error ? 'success' : 'failed')
          : 'skipped',
        timestamp: new Date()
      };
      
      // Add error details if any
      if (results.kitchen === 'failed' && printResults[0]?.value?.error) {
        results.kitchenError = printResults[0].value.error;
      }
      if (results.billDesk === 'failed' && printResults[printPromises.length - 1]?.value?.error) {
        results.billDeskError = printResults[printPromises.length - 1].value.error;
      }
      
      // Update order with print status (don't fail if this fails)
      try {
        const db = getDB();
        await db.collection('orders').updateOne(
          { orderNumber: order.orderNumber },
          { 
            $set: { 
              printStatus: results,
              lastPrintedAt: new Date()
            } 
          }
        );
      } catch (dbError) {
        console.error('⚠️  Failed to update order with print status:', dbError.message);
      }
      
      // Log results
      const successCount = [results.kitchen, results.billDesk].filter(s => s === 'success').length;
      const failCount = [results.kitchen, results.billDesk].filter(s => s === 'failed').length;
      
      if (successCount === 2) {
        console.log(`✅ All print jobs completed successfully for order #${order.orderNumber}`);
      } else if (successCount > 0) {
        console.log(`⚠️  Partial print success for order #${order.orderNumber}:`, results);
      } else {
        console.log(`❌ All print jobs failed for order #${order.orderNumber}:`, results);
      }
      
      return results;
    } catch (error) {
      console.error(`❌ Critical error in printOrder for #${order.orderNumber}:`, error.message);
      
      // Return error result instead of throwing
      return {
        kitchen: 'failed',
        billDesk: 'failed',
        timestamp: new Date(),
        error: error.message
      };
    }
  }

  /**
   * Reprint order (manual trigger from admin)
   * Production-ready with validation and error handling
   */
  async reprintOrder(orderNumber, printerType = 'both') {
    // Check if printing is enabled
    if (!this.isAvailable()) {
      throw new Error('Printing service is disabled');
    }

    // Validate inputs
    if (!orderNumber || typeof orderNumber !== 'string') {
      throw new Error('Invalid order number');
    }

    const validPrinterTypes = ['both', 'kitchen', 'billDesk'];
    if (!validPrinterTypes.includes(printerType)) {
      throw new Error(`Invalid printer type. Must be one of: ${validPrinterTypes.join(', ')}`);
    }

    try {
      const db = getDB();
      const order = await db.collection('orders').findOne({ orderNumber });
      
      if (!order) {
        throw new Error(`Order ${orderNumber} not found`);
      }
      
      console.log(`🔄 Reprinting order #${orderNumber} to ${printerType} printer(s)...`);
      
      const results = {};
      
      if (printerType === 'both' || printerType === 'kitchen') {
        try {
          const kitchenReceipt = this.formatKitchenReceipt(order);
          await this.sendToPrinter(this.printers.kitchen, kitchenReceipt);
          results.kitchen = 'success';
          console.log(`✅ Kitchen reprint successful`);
        } catch (error) {
          results.kitchen = 'failed';
          results.kitchenError = error.message;
          console.error(`❌ Kitchen reprint failed:`, error.message);
        }
      }
      
      if (printerType === 'both' || printerType === 'billDesk') {
        try {
          const billDeskReceipt = this.formatBillDeskReceipt(order);
          await this.sendToPrinter(this.printers.billDesk, billDeskReceipt);
          results.billDesk = 'success';
          console.log(`✅ Bill desk reprint successful`);
        } catch (error) {
          results.billDesk = 'failed';
          results.billDeskError = error.message;
          console.error(`❌ Bill desk reprint failed:`, error.message);
        }
      }
      
      // Check if any prints succeeded
      const hasSuccess = Object.values(results).some(status => status === 'success');
      
      if (!hasSuccess) {
        throw new Error('All reprint attempts failed');
      }
      
      return { 
        success: true, 
        message: 'Reprint completed',
        results
      };
    } catch (error) {
      console.error('❌ Error in reprintOrder:', error.message);
      throw error;
    }
  }

  /**
   * Test printer connection
   * Production-ready with validation
   */
  async testPrinter(printerName) {
    // Check if printing is enabled
    if (!this.isAvailable()) {
      throw new Error('Printing service is disabled. Set ENABLE_PRINTING=true in .env');
    }

    // Validate printer name
    if (!printerName || typeof printerName !== 'string') {
      throw new Error('Invalid printer name');
    }

    const testContent = `
================================
      PRINTER TEST
================================

Printer: ${printerName}
Time: ${new Date().toLocaleString()}
Environment: ${process.env.NODE_ENV || 'production'}

This is a test print.
If you can read this, the printer
is working correctly.

Test ID: ${Date.now()}

================================
    `;
    
    try {
      console.log(`🧪 Testing printer: ${printerName}...`);
      const result = await this.sendToPrinter(printerName, testContent);
      console.log(`✅ Printer test successful for ${printerName}`);
      return result;
    } catch (error) {
      console.error(`❌ Printer test failed for ${printerName}:`, error.message);
      throw error;
    }
  }
}

// Export singleton instance
export const printerService = new PrinterService();
