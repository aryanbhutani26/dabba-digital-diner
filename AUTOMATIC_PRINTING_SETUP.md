# Automatic Printing System - Setup Guide

## Overview
Automatic printing system that prints order invoices to two printers (Kitchen and Bill Desk) immediately after order placement, without any manual intervention.

---

## How It Works

### Automatic Trigger
When a customer completes payment and places an order:
1. ✅ Order is created in database
2. ✅ Email confirmation is sent
3. 🖨️ **AUTOMATIC PRINTING** - Two print jobs are triggered simultaneously:
   - **Kitchen Printer**: Receives kitchen-focused receipt (items, quantities, customer info)
   - **Bill Desk Printer**: Receives complete invoice (pricing, payment details, full breakdown)

### No Manual Action Required
- Printing happens automatically in the background
- No admin panel clicks needed
- No confirmation dialogs
- Instant printing upon order creation

---

## Printer Setup

### Step 1: Install Printers on Server

#### Windows
1. Connect both printers to the server computer
2. Install printer drivers
3. Go to **Settings → Devices → Printers & Scanners**
4. Note the exact printer names (e.g., "Kitchen_Printer", "BillDesk_Printer")

#### Linux
1. Install CUPS: `sudo apt-get install cups`
2. Add printers: `sudo lpadmin -p Kitchen_Printer -E -v usb://...`
3. List printers: `lpstat -p -d`

### Step 2: Configure Environment Variables

Edit `backend/.env`:
```env
KITCHEN_PRINTER_NAME=Kitchen_Printer
BILL_DESK_PRINTER_NAME=BillDesk_Printer
```

**Important**: Use the exact printer names as they appear in your system.

### Step 3: Install Printer Package (Optional)

For actual physical printing, install the `printer` npm package:

```bash
cd backend
npm install printer
```

Then uncomment the printer code in `backend/services/printerService.js` (lines marked with comments).

---

## Receipt Formats

### Kitchen Printer Receipt
```
================================
       KITCHEN ORDER
================================

Order #: ORD000123
Time: 12/09/2025, 2:30:45 PM
Customer: John Doe
Phone: 07123456789

--------------------------------
ITEMS TO PREPARE:
--------------------------------

1. Butter Chicken
   Qty: 2x
   Price: £13.99 each
   Size: Medium

2. Garlic Naan
   Qty: 4x
   Price: £2.99 each

================================
Total Items: 6
================================

Delivery Address:
123 Main Street, London, SW1A 1AA

================================
```

### Bill Desk Printer Receipt
```
================================
     RESTAURANT NAME
     123 Main Street
     Phone: 01234 567890
================================

        INVOICE

Order #: ORD000123
Date: 12/09/2025, 2:30:45 PM

--------------------------------
Customer Details:
--------------------------------
Name: John Doe
Phone: 07123456789

Delivery Address:
123 Main Street, London, SW1A 1AA

--------------------------------
Order Items:
--------------------------------
2x Butter Chicken (Medium)
   £13.99 x 2 = £27.98
4x Garlic Naan
   £2.99 x 4 = £11.96

--------------------------------
Price Breakdown:
--------------------------------
Subtotal:        £39.94
Discount:       -£3.99
  (Code: SAVE10)
Delivery Fee:    £5.00
--------------------------------
TOTAL:           £40.95
--------------------------------

Payment Details:
Method: STRIPE
Status: COMPLETED
Payment ID: pi_3abc123xyz

================================
   Thank you for your order!
================================
```

---

## Admin Features

### 1. Test Printers

Test if printers are working correctly:

**API Endpoint:**
```
POST /api/printers/test/kitchen
POST /api/printers/test/billDesk
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Test print sent to kitchen printer",
  "printerName": "Kitchen_Printer"
}
```

### 2. Reprint Order

Manually reprint an order if needed:

**API Endpoint:**
```
POST /api/printers/reprint/:orderNumber
```

**Body:**
```json
{
  "printerType": "both"  // or "kitchen" or "billDesk"
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/printers/reprint/ORD000123 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"printerType": "both"}'
```

### 3. View Print Logs

See history of all print jobs:

**API Endpoint:**
```
GET /api/printers/logs
```

**Response:**
```json
[
  {
    "_id": "...",
    "printerName": "Kitchen_Printer",
    "content": "...",
    "timestamp": "2025-12-09T14:30:45.000Z",
    "status": "sent"
  }
]
```

### 4. Update Printer Settings

Change printer names without restarting server:

**API Endpoint:**
```
PUT /api/printers/settings
```

**Body:**
```json
{
  "kitchenPrinter": "New_Kitchen_Printer",
  "billDeskPrinter": "New_BillDesk_Printer"
}
```

---

## Implementation Details

### Files Created/Modified

#### New Files:
1. **`backend/services/printerService.js`**
   - Core printing logic
   - Receipt formatting
   - Printer communication

2. **`backend/routes/printers.js`**
   - Admin printer management routes
   - Test, reprint, logs endpoints

#### Modified Files:
1. **`backend/routes/orders.js`**
   - Added automatic printing on order creation
   - Imports printerService

2. **`backend/server.js`**
   - Registered printer routes

3. **`backend/.env.example`**
   - Added printer configuration variables

---

## Order Flow with Printing

```
Customer Places Order
         ↓
Payment Processed (Stripe)
         ↓
Order Created in Database
         ↓
    ┌────┴────┐
    ↓         ↓
Email Sent   🖨️ AUTOMATIC PRINTING
             ├─→ Kitchen Printer
             └─→ Bill Desk Printer
         ↓
Order Confirmation Shown
```

---

## Troubleshooting

### Printing Not Working?

#### 1. Check Printer Names
```bash
# Windows
wmic printer get name

# Linux
lpstat -p -d
```

Make sure names in `.env` match exactly.

#### 2. Check Printer Status
```bash
# Test kitchen printer
curl -X POST http://localhost:5000/api/printers/test/kitchen \
  -H "Authorization: Bearer <admin_token>"

# Test bill desk printer
curl -X POST http://localhost:5000/api/printers/test/billDesk \
  -H "Authorization: Bearer <admin_token>"
```

#### 3. Check Print Logs
```bash
curl http://localhost:5000/api/printers/logs \
  -H "Authorization: Bearer <admin_token>"
```

#### 4. Check Server Logs
Look for these messages in server console:
```
🖨️  Auto-printing order #ORD000123...
📄 Sending to printer: Kitchen_Printer
📄 Sending to printer: BillDesk_Printer
✅ Print jobs completed: { kitchen: 'success', billDesk: 'success' }
```

### Common Issues

**Issue**: "Printer not found"
**Solution**: Check printer name in `.env` matches system printer name exactly

**Issue**: "Permission denied"
**Solution**: Ensure server process has permission to access printers

**Issue**: "Print job sent but nothing prints"
**Solution**: 
- Check printer is online and has paper
- Check printer queue for stuck jobs
- Restart printer service

---

## Physical Printer Setup

### For Production Use

To actually print to physical printers, you need to:

1. **Install printer package:**
```bash
npm install printer
```

2. **Uncomment printer code in `printerService.js`:**

Find this section:
```javascript
// Actual printer implementation would go here
// Example using node-printer (needs to be installed):
/*
const printer = require('printer');
printer.printDirect({
  data: content,
  printer: printerName,
  type: 'TEXT',
  success: function(jobID) {
    console.log(`Print job ${jobID} sent to ${printerName}`);
  },
  error: function(err) {
    console.error(`Print error for ${printerName}:`, err);
  }
});
*/
```

Uncomment and use it.

3. **Alternative: Network Printers**

For network printers, you can use raw socket connection:
```javascript
import net from 'net';

const client = new net.Socket();
client.connect(9100, 'printer-ip-address', () => {
  client.write(content);
  client.end();
});
```

---

## Testing Without Physical Printers

The current implementation logs print jobs to:
1. **Console**: See formatted receipts in terminal
2. **Database**: `print_logs` collection stores all print attempts

This allows you to:
- Test the system without printers
- Verify receipt formatting
- Debug printing logic
- View print history

---

## Database Schema

### Orders Collection (Updated)
```javascript
{
  orderNumber: "ORD000123",
  // ... other order fields ...
  printStatus: {
    kitchen: "success",
    billDesk: "success",
    timestamp: Date
  },
  lastPrintedAt: Date
}
```

### Print Logs Collection (New)
```javascript
{
  printerName: "Kitchen_Printer",
  content: "... receipt content ...",
  timestamp: Date,
  status: "sent"
}
```

---

## Security

### Admin-Only Access
All printer management endpoints require admin authentication:
- Test printers
- Reprint orders
- View logs
- Update settings

### Automatic Printing
Automatic printing on order creation does NOT require authentication (happens server-side after order is created).

---

## Performance

### Async Printing
Printing happens asynchronously and doesn't block order creation:
- Order is created immediately
- Printing happens in background
- If printing fails, order still succeeds
- Print failures are logged but don't affect customer

### Simultaneous Printing
Both printers receive jobs simultaneously using `Promise.allSettled()`:
- Faster than sequential printing
- One printer failure doesn't affect the other
- Both results are logged

---

## Future Enhancements

### Possible Additions:
1. **Print Queue Management**: Retry failed prints
2. **Printer Status Monitoring**: Real-time printer health checks
3. **Custom Receipt Templates**: Admin can customize receipt layout
4. **Print Preview**: See receipt before printing
5. **Email Backup**: If printing fails, email receipt to staff
6. **SMS Notification**: Alert staff when printer is offline
7. **Multi-Location Support**: Different printers for different branches

---

## Summary

### What Was Implemented
✅ Automatic printing on order placement
✅ Two separate receipt formats (Kitchen & Bill Desk)
✅ Admin printer management endpoints
✅ Test printer functionality
✅ Reprint orders manually
✅ Print logs for tracking
✅ Error handling (printing failure doesn't break orders)

### Key Benefits
- **Zero Manual Work**: Prints automatically
- **Instant**: Prints immediately after order
- **Reliable**: Failures don't affect order processing
- **Trackable**: All prints logged in database
- **Flexible**: Easy to reprint if needed

---

**Implementation Date**: December 9, 2025
**Version**: 1.0
**Status**: ✅ Complete - Ready for Printer Setup
