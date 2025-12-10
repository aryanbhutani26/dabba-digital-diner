import { ThermalPrinter, PrinterTypes, CharacterSet, BreakLine } from 'node-thermal-printer';
import net from 'net';
import ping from 'ping';
import moment from 'moment';
import { EventEmitter } from 'events';
import { ObjectId } from 'mongodb';
import { printJobManager } from './printJobManager.js';

class ThermalPrinterService extends EventEmitter {
  constructor() {
    super();
    this.printers = new Map();
    this.printQueue = [];
    this.isProcessingQueue = false;
    this.connectionPool = new Map();
    this.healthCheckInterval = null;
    this.retryAttempts = 3;
    this.retryDelay = 1000; // Start with 1 second
    
    this.initializePrinters();
    this.startHealthChecking();
    this.startQueueProcessor();
  }

  initializePrinters() {
    const printers = [
      {
        id: 'kitchen',
        name: 'Kitchen Printer',
        ip: process.env.KITCHEN_PRINTER_IP || '192.168.1.100',
        port: parseInt(process.env.KITCHEN_PRINTER_PORT) || 9100,
        mac: process.env.KITCHEN_PRINTER_MAC || '',
        type: 'kitchen',
        priority: 1,
        enabled: process.env.KITCHEN_PRINTER_ENABLED !== 'false',
        status: 'unknown',
        lastCheck: null,
        errorCount: 0,
        successCount: 0
      },
      {
        id: 'bill',
        name: 'Bill Desk Printer',
        ip: process.env.BILL_PRINTER_IP || '192.168.1.101',
        port: parseInt(process.env.BILL_PRINTER_PORT) || 9100,
        mac: process.env.BILL_PRINTER_MAC || '',
        type: 'bill',
        priority: 2,
        enabled: process.env.BILL_PRINTER_ENABLED !== 'false',
        status: 'unknown',
        lastCheck: null,
        errorCount: 0,
        successCount: 0
      }
    ];

    printers.forEach(printer => {
      this.printers.set(printer.id, printer);
    });

    console.log('🖨️ Thermal printers initialized:', Array.from(this.printers.keys()));
  }

  // ESC/POS Receipt Generator
  generateKitchenReceipt(order) {
    const printer = new ThermalPrinter({
      type: PrinterTypes.EPSON,
      interface: 'tcp://localhost:9100', // Will be overridden
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

  generateBillReceipt(order) {
    const printer = new ThermalPrinter({
      type: PrinterTypes.EPSON,
      interface: 'tcp://localhost:9100', // Will be overridden
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
        
        // Print item name and price on same line
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

  // Network Communication
  async sendToPrinter(printerId, data) {
    const printer = this.printers.get(printerId);
    if (!printer || !printer.enabled) {
      throw new Error(`Printer ${printerId} not found or disabled`);
    }

    return new Promise((resolve, reject) => {
      const socket = new net.Socket();
      const timeout = parseInt(process.env.PRINTER_TIMEOUT) || 5000;
      let isResolved = false;
      let isConnected = false;

      socket.setTimeout(timeout);

      socket.on('connect', () => {
        console.log(`🔌 Connected to ${printer.name} (${printer.ip}:${printer.port})`);
        isConnected = true;
        socket.write(data);
        socket.end();
      });

      socket.on('close', () => {
        if (isConnected && !isResolved) {
          console.log(`✅ Print job sent to ${printer.name}`);
          printer.successCount++;
          printer.status = 'online';
          isResolved = true;
          resolve({ success: true, printer: printer.name });
        } else if (!isResolved) {
          // Socket closed without successful connection
          console.error(`❌ Connection to ${printer.name} closed without success`);
          printer.errorCount++;
          printer.status = 'offline';
          isResolved = true;
          reject(new Error(`Connection to ${printer.name} failed`));
        }
      });

      socket.on('timeout', () => {
        if (!isResolved) {
          console.error(`⏰ Timeout connecting to ${printer.name}`);
          socket.destroy();
          printer.errorCount++;
          printer.status = 'timeout';
          isResolved = true;
          reject(new Error(`Timeout connecting to ${printer.name}`));
        }
      });

      socket.on('error', (error) => {
        if (!isResolved) {
          console.error(`❌ Error connecting to ${printer.name}:`, error.message);
          printer.errorCount++;
          printer.status = 'error';
          isResolved = true;
          reject(error);
        }
      });

      // Connect to printer
      socket.connect(printer.port, printer.ip);
    });
  }

  // Print Queue Management with Job Manager Integration
  async addPrintJob(order, printerType = 'both') {
    const jobs = [];
    
    if (printerType === 'both' || printerType === 'kitchen') {
      const kitchenData = this.generateKitchenReceipt(order);
      const kitchenJob = printJobManager.createJob(
        order._id || order.orderNumber,
        order.orderNumber,
        'kitchen',
        'kitchen',
        kitchenData,
        1 // Higher priority for kitchen
      );
      jobs.push(kitchenJob);
      this.printQueue.push(kitchenJob);
    }
    
    if (printerType === 'both' || printerType === 'bill') {
      const billData = this.generateBillReceipt(order);
      const billJob = printJobManager.createJob(
        order._id || order.orderNumber,
        order.orderNumber,
        'bill',
        'bill',
        billData,
        2 // Lower priority for bill
      );
      jobs.push(billJob);
      this.printQueue.push(billJob);
    }

    // Sort queue by priority
    this.printQueue.sort((a, b) => a.priority - b.priority);

    console.log(`📋 Added ${jobs.length} print job(s) for order ${order.orderNumber}`);
    
    // Emit event for monitoring
    this.emit('jobAdded', { jobs, order });
    
    return jobs.map(job => job.id);
  }

  // Queue Processor
  startQueueProcessor() {
    setInterval(async () => {
      if (!this.isProcessingQueue && this.printQueue.length > 0) {
        await this.processQueue();
      }
    }, 1000); // Check every second
  }

  async processQueue() {
    if (this.isProcessingQueue) return;
    
    this.isProcessingQueue = true;
    
    try {
      // Sort by priority (kitchen first)
      this.printQueue.sort((a, b) => a.priority - b.priority);
      
      const job = this.printQueue.shift();
      if (!job) {
        this.isProcessingQueue = false;
        return;
      }

      console.log(`🔄 Processing print job: ${job.id}`);
      printJobManager.updateJobStatus(job.id, 'processing');

      try {
        await this.sendToPrinter(job.printerId, job.data);
        printJobManager.updateJobStatus(job.id, 'completed');
        
        console.log(`✅ Print job completed: ${job.id}`);
        this.emit('jobCompleted', job);
        
      } catch (error) {
        console.error(`❌ Print job failed: ${job.id}`, error.message);
        printJobManager.updateJobStatus(job.id, 'failed', error.message);

        // Retry logic with exponential backoff
        if (job.attempts < job.maxAttempts) {
          const delay = this.retryDelay * Math.pow(2, job.attempts - 1);
          console.log(`🔄 Retrying job ${job.id} in ${delay}ms (attempt ${job.attempts + 1}/${job.maxAttempts})`);
          
          setTimeout(() => {
            if (printJobManager.retryJob(job.id)) {
              this.printQueue.unshift(job); // Add back to front of queue
            }
          }, delay);
        } else {
          console.error(`💀 Print job permanently failed: ${job.id}`);
          this.emit('jobFailed', job);
        }
      }
    } catch (error) {
      console.error('❌ Queue processor error:', error);
    } finally {
      this.isProcessingQueue = false;
    }
  }

  // Health Checking
  startHealthChecking() {
    this.healthCheckInterval = setInterval(async () => {
      await this.checkAllPrinters();
    }, 30000); // Check every 30 seconds
  }

  async checkAllPrinters() {
    for (const [printerId, printer] of this.printers) {
      if (!printer.enabled) continue;
      
      try {
        const isAlive = await this.pingPrinter(printer.ip);
        printer.status = isAlive ? 'online' : 'offline';
        printer.lastCheck = new Date();
        
        if (!isAlive) {
          console.warn(`⚠️ Printer ${printer.name} is offline`);
          this.emit('printerOffline', printer);
        }
      } catch (error) {
        printer.status = 'error';
        printer.lastCheck = new Date();
        console.error(`❌ Health check failed for ${printer.name}:`, error.message);
      }
    }
  }

  async pingPrinter(ip) {
    try {
      const result = await ping.promise.probe(ip, { timeout: 3 });
      return result.alive;
    } catch (error) {
      return false;
    }
  }

  // Public API
  async printOrder(order, printerType = 'both') {
    try {
      console.log(`🖨️ Printing order ${order.orderNumber} to ${printerType} printer(s)`);
      
      if (!process.env.ENABLE_PRINTING || process.env.ENABLE_PRINTING === 'false') {
        console.log('ℹ️ Printing disabled, skipping print job');
        return { success: true, message: 'Printing disabled' };
      }

      const jobIds = await this.addPrintJob(order, printerType);
      
      return {
        success: true,
        jobIds,
        message: `Print jobs queued for order ${order.orderNumber}`
      };
    } catch (error) {
      console.error('❌ Print order error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async testPrint(printerId) {
    const printer = this.printers.get(printerId);
    if (!printer) {
      throw new Error(`Printer ${printerId} not found`);
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

    if (printerId === 'kitchen') {
      const data = this.generateKitchenReceipt(testOrder);
      return await this.sendToPrinter(printerId, data);
    } else {
      const data = this.generateBillReceipt(testOrder);
      return await this.sendToPrinter(printerId, data);
    }
  }

  getPrinterStatus() {
    const status = {};
    for (const [id, printer] of this.printers) {
      status[id] = {
        name: printer.name,
        ip: printer.ip,
        port: printer.port,
        status: printer.status,
        enabled: printer.enabled,
        lastCheck: printer.lastCheck,
        errorCount: printer.errorCount,
        successCount: printer.successCount
      };
    }
    return status;
  }

  // Reset printer statistics
  resetPrinterStats() {
    for (const [id, printer] of this.printers) {
      printer.errorCount = 0;
      printer.successCount = 0;
      printer.status = 'unknown';
      printer.lastCheck = null;
    }
    console.log('🔄 Printer statistics reset');
  }

  getQueueStatus() {
    return {
      queueLength: this.printQueue.length,
      isProcessing: this.isProcessingQueue,
      pendingJobs: this.printQueue.filter(job => job.status === 'pending').length,
      processingJobs: this.printQueue.filter(job => job.status === 'processing').length
    };
  }

  // Cleanup
  destroy() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    // Close any open connections
    for (const connection of this.connectionPool.values()) {
      if (connection && !connection.destroyed) {
        connection.destroy();
      }
    }
    
    console.log('🖨️ Thermal printer service destroyed');
  }
}

// Singleton instance
const thermalPrinterService = new ThermalPrinterService();

export { thermalPrinterService };