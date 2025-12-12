import { thermalPrinterService } from './thermalPrinterService.js';
import { posIntegrationService } from './posIntegrationService.js';

class HybridPrintingService {
  constructor() {
    this.isVercelDeployment = process.env.VERCEL || process.env.NODE_ENV === 'production';
    this.localPrintServerUrl = process.env.LOCAL_PRINT_SERVER_URL || 'http://localhost:3001';
    this.webhookSecret = process.env.WEBHOOK_SECRET;
    this.usePOSIntegration = process.env.ENABLE_POS_INTEGRATION === 'true';
  }

  async printOrder(order, printerType = 'both') {
    try {
      // Priority 1: Use existing POS system if configured
      if (this.usePOSIntegration) {
        console.log('🏪 Using existing POS system for printing');
        return await posIntegrationService.printOrder(order, printerType);
      }
      
      // Priority 2: Vercel deployment with local print server
      if (this.isVercelDeployment) {
        console.log('🌐 Using local print server for Vercel deployment');
        return await this.sendToLocalPrintServer(order, printerType);
      } 
      
      // Priority 3: Development with direct thermal printer service
      console.log('🔧 Using direct thermal printer service for development');
      return await thermalPrinterService.printOrder(order, printerType);
      
    } catch (error) {
      console.error('❌ Hybrid printing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendToLocalPrintServer(order, printerType) {
    try {
      console.log(`🌐 Sending print request to local server: ${this.localPrintServerUrl}`);
      
      const response = await fetch(`${this.localPrintServerUrl}/print-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order,
          printerType,
          webhookSecret: this.webhookSecret
        }),
        timeout: 10000 // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`Local print server responded with ${response.status}`);
      }

      const result = await response.json();
      
      console.log(`✅ Local print server response:`, result);
      
      return {
        success: true,
        message: result.message,
        results: result.results
      };

    } catch (error) {
      console.error('❌ Failed to reach local print server:', error.message);
      
      // Fallback: Log the order for manual printing
      console.log(`📋 MANUAL PRINT REQUIRED - Order #${order.orderNumber}:`);
      console.log(`   Customer: ${order.customerName}`);
      console.log(`   Phone: ${order.customerPhone}`);
      console.log(`   Items: ${order.items.length} items`);
      console.log(`   Total: £${order.total}`);
      
      return {
        success: false,
        error: `Local print server unreachable: ${error.message}`,
        fallback: 'Order logged for manual printing'
      };
    }
  }

  async testPrint(printerId) {
    try {
      if (this.isVercelDeployment) {
        const response = await fetch(`${this.localPrintServerUrl}/test-print/${printerId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            webhookSecret: this.webhookSecret
          })
        });

        if (!response.ok) {
          throw new Error(`Local print server responded with ${response.status}`);
        }

        return await response.json();
      } else {
        // Development mode - handle printer connection errors gracefully
        try {
          const result = await thermalPrinterService.testPrint(printerId);
          return {
            success: true,
            message: `Test print sent to ${printerId} printer`,
            result
          };
        } catch (printerError) {
          console.log(`⚠️ Printer ${printerId} unreachable in development:`, printerError.message);
          return {
            success: false,
            error: `Printer ${printerId} is not reachable: ${printerError.message}`,
            development: true
          };
        }
      }
    } catch (error) {
      console.error('❌ Test print error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  getPrinterStatus() {
    if (this.isVercelDeployment) {
      // Production mode - return mock printer status for UI
      return {
        kitchen: {
          name: 'Kitchen Printer',
          ip: 'Local Print Server',
          port: 3001,
          status: 'online',
          enabled: true,
          lastCheck: new Date(),
          errorCount: 0,
          successCount: 0
        },
        bill: {
          name: 'Bill Desk Printer', 
          ip: 'Local Print Server',
          port: 3001,
          status: 'online',
          enabled: true,
          lastCheck: new Date(),
          errorCount: 0,
          successCount: 0
        }
      };
    } else {
      return thermalPrinterService.getPrinterStatus();
    }
  }

  getQueueStatus() {
    if (this.isVercelDeployment) {
      return {
        queueLength: 0,
        isProcessing: false,
        pendingJobs: 0,
        processingJobs: 0
      };
    } else {
      return thermalPrinterService.getQueueStatus();
    }
  }
}

// Singleton instance
const hybridPrintingService = new HybridPrintingService();

export { hybridPrintingService };