import fetch from 'node-fetch';

class POSIntegrationService {
  constructor() {
    this.posServerUrl = process.env.POS_SERVER_URL;
    this.posApiKey = process.env.POS_API_KEY;
    this.posUsername = process.env.POS_USERNAME;
    this.posPassword = process.env.POS_PASSWORD;
    this.enabled = process.env.ENABLE_POS_INTEGRATION === 'true';
    
    console.log('🏪 POS Integration Service initialized');
    console.log(`📡 POS Server: ${this.posServerUrl || 'Not configured'}`);
    console.log(`🔌 Integration: ${this.enabled ? 'Enabled' : 'Disabled'}`);
  }

  // Method 1: REST API Integration (most common)
  async sendToRestAPI(order, printerType = 'both') {
    try {
      const printData = {
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        items: order.items,
        total: order.totalAmount || order.total,
        deliveryAddress: order.deliveryAddress,
        specialInstructions: order.specialInstructions,
        printerType: printerType, // 'kitchen', 'bill', or 'both'
        timestamp: new Date().toISOString()
      };

      const response = await fetch(`${this.posServerUrl}/print`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.posApiKey ? `Bearer ${this.posApiKey}` : undefined,
          'X-API-Key': this.posApiKey || undefined,
          // Add other headers as needed
        },
        body: JSON.stringify(printData),
        timeout: 10000 // 10 second timeout
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ POS print request successful for order ${order.orderNumber}`);
        return {
          success: true,
          message: 'Print request sent to POS system',
          posResponse: result
        };
      } else {
        throw new Error(`POS server responded with ${response.status}: ${response.statusText}`);
      }

    } catch (error) {
      console.error(`❌ POS print request failed for order ${order.orderNumber}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Method 2: Raw TCP Socket (for direct printer communication)
  async sendToTCPSocket(order, printerType = 'both') {
    const net = await import('net');
    
    return new Promise((resolve, reject) => {
      const socket = new net.Socket();
      const timeout = 5000;

      // Generate ESC/POS data (reuse existing logic)
      const { thermalPrinterService } = require('./thermalPrinterService.js');
      let printData;
      
      if (printerType === 'kitchen') {
        printData = thermalPrinterService.generateKitchenReceipt(order);
      } else {
        printData = thermalPrinterService.generateBillReceipt(order);
      }

      socket.setTimeout(timeout);

      socket.on('connect', () => {
        console.log(`🔌 Connected to POS system at ${this.posServerUrl}`);
        socket.write(printData);
        socket.end();
      });

      socket.on('close', () => {
        console.log(`✅ Print data sent to POS system for order ${order.orderNumber}`);
        resolve({
          success: true,
          message: 'Print data sent to POS system'
        });
      });

      socket.on('timeout', () => {
        console.error(`⏰ Timeout connecting to POS system`);
        socket.destroy();
        reject(new Error('Timeout connecting to POS system'));
      });

      socket.on('error', (error) => {
        console.error(`❌ Error connecting to POS system:`, error.message);
        reject(error);
      });

      // Parse URL to get host and port
      const url = new URL(this.posServerUrl);
      socket.connect(parseInt(url.port) || 9100, url.hostname);
    });
  }

  // Method 3: HTTP POST with custom format
  async sendCustomFormat(order, printerType = 'both') {
    try {
      // Custom format based on client's POS requirements
      const customData = this.formatForClientPOS(order, printerType);

      const response = await fetch(this.posServerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          // Or 'text/plain', 'application/xml', etc. based on POS requirements
          'Authorization': this.getAuthHeader(),
        },
        body: customData,
        timeout: 10000
      });

      if (response.ok) {
        console.log(`✅ Custom POS request successful for order ${order.orderNumber}`);
        return {
          success: true,
          message: 'Print request sent to POS system'
        };
      } else {
        throw new Error(`POS server responded with ${response.status}`);
      }

    } catch (error) {
      console.error(`❌ Custom POS request failed:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Format data according to client's POS system requirements
  formatForClientPOS(order, printerType) {
    // This will be customized based on client's POS API format
    // Examples of common formats:

    // Format 1: URL-encoded form data
    const formData = new URLSearchParams();
    formData.append('order_number', order.orderNumber);
    formData.append('customer_name', order.customerName);
    formData.append('items', JSON.stringify(order.items));
    formData.append('total', order.totalAmount || order.total);
    formData.append('printer_type', printerType);
    return formData.toString();

    // Format 2: XML (uncomment if needed)
    /*
    return `<?xml version="1.0"?>
    <print_request>
      <order_number>${order.orderNumber}</order_number>
      <customer_name>${order.customerName}</customer_name>
      <total>${order.totalAmount || order.total}</total>
      <printer_type>${printerType}</printer_type>
      <items>
        ${order.items.map(item => `
          <item>
            <name>${item.name}</name>
            <quantity>${item.quantity}</quantity>
            <price>${item.price}</price>
          </item>
        `).join('')}
      </items>
    </print_request>`;
    */

    // Format 3: Plain text (uncomment if needed)
    /*
    return `ORDER:${order.orderNumber}
CUSTOMER:${order.customerName}
TOTAL:${order.totalAmount || order.total}
PRINTER:${printerType}
ITEMS:${order.items.map(item => `${item.quantity}x${item.name}`).join(',')}`;
    */
  }

  // Get authentication header based on POS system requirements
  getAuthHeader() {
    if (this.posApiKey) {
      return `Bearer ${this.posApiKey}`;
    } else if (this.posUsername && this.posPassword) {
      const credentials = Buffer.from(`${this.posUsername}:${this.posPassword}`).toString('base64');
      return `Basic ${credentials}`;
    }
    return null;
  }

  // Main print method - automatically chooses the right integration method
  async printOrder(order, printerType = 'both') {
    if (!this.enabled) {
      console.log('ℹ️ POS integration disabled, skipping');
      return {
        success: true,
        message: 'POS integration disabled'
      };
    }

    if (!this.posServerUrl) {
      console.error('❌ POS server URL not configured');
      return {
        success: false,
        error: 'POS server URL not configured'
      };
    }

    console.log(`🏪 Sending print request to POS system for order ${order.orderNumber}`);

    try {
      // Try different integration methods based on configuration
      const integrationMethod = process.env.POS_INTEGRATION_METHOD || 'rest';

      switch (integrationMethod) {
        case 'rest':
          return await this.sendToRestAPI(order, printerType);
        case 'tcp':
          return await this.sendToTCPSocket(order, printerType);
        case 'custom':
          return await this.sendCustomFormat(order, printerType);
        default:
          return await this.sendToRestAPI(order, printerType);
      }

    } catch (error) {
      console.error('❌ POS integration error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Test connection to POS system
  async testConnection() {
    if (!this.posServerUrl) {
      throw new Error('POS server URL not configured');
    }

    try {
      const testOrder = {
        orderNumber: 'TEST' + Date.now(),
        customerName: 'Test Customer',
        customerPhone: '01234567890',
        items: [{
          name: 'Test Item',
          quantity: 1,
          price: 10.00
        }],
        totalAmount: 10.00
      };

      const result = await this.printOrder(testOrder, 'kitchen');
      return result;

    } catch (error) {
      throw new Error(`POS connection test failed: ${error.message}`);
    }
  }

  // Get POS system status
  getStatus() {
    return {
      enabled: this.enabled,
      serverUrl: this.posServerUrl,
      hasApiKey: !!this.posApiKey,
      hasCredentials: !!(this.posUsername && this.posPassword),
      integrationMethod: process.env.POS_INTEGRATION_METHOD || 'rest'
    };
  }
}

// Singleton instance
const posIntegrationService = new POSIntegrationService();

export { posIntegrationService };