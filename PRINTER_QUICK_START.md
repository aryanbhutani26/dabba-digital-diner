# Printer Setup - Quick Start Guide

## For Restaurant Staff

### What This Does
When a customer places an order online, **TWO receipts print automatically**:
1. **Kitchen Printer** - Shows what to cook
2. **Bill Desk Printer** - Shows complete invoice

**No buttons to click. No manual printing. Completely automatic!**

---

## Setup Steps (One-Time)

### Step 1: Connect Your Printers

1. Plug in both printers to your computer/server
2. Install printer drivers (usually comes with printer CD or download from manufacturer)
3. Make sure both printers work (print a test page from Windows/Mac settings)

### Step 2: Find Printer Names

**On Windows:**
1. Press Windows key
2. Type "Printers"
3. Click "Printers & Scanners"
4. Write down the exact names of both printers

Example:
- Kitchen printer might be: `HP LaserJet Kitchen`
- Bill desk printer might be: `Epson TM-T88 BillDesk`

**On Mac:**
1. Open System Preferences
2. Click "Printers & Scanners"
3. Write down printer names

### Step 3: Update Configuration

1. Open the file: `backend/.env`
2. Find these lines:
```
KITCHEN_PRINTER_NAME=Kitchen_Printer
BILL_DESK_PRINTER_NAME=BillDesk_Printer
```
3. Replace with your actual printer names:
```
KITCHEN_PRINTER_NAME=HP LaserJet Kitchen
BILL_DESK_PRINTER_NAME=Epson TM-T88 BillDesk
```
4. Save the file
5. Restart your server

### Step 4: Test Printers

Ask your developer to run these commands or use the admin panel:

**Test Kitchen Printer:**
```bash
curl -X POST http://localhost:5000/api/printers/test/kitchen \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Test Bill Desk Printer:**
```bash
curl -X POST http://localhost:5000/api/printers/test/billDesk \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

If test pages print, you're all set! ✅

---

## How It Works

### When Customer Places Order:

```
Customer clicks "Place Order"
         ↓
Payment processes
         ↓
🖨️ Kitchen printer prints automatically
🖨️ Bill desk printer prints automatically
         ↓
Customer sees confirmation
```

**Total time: 2-3 seconds**

---

## What Prints Where

### Kitchen Printer 🍳
```
================================
       KITCHEN ORDER
================================

Order #: ORD000123
Time: 2:30 PM
Customer: John Doe
Phone: 07123456789

ITEMS TO PREPARE:
1. Butter Chicken (Medium) - 2x
2. Garlic Naan - 4x

Total Items: 6

Delivery Address:
123 Main Street, London
================================
```

**Purpose**: Kitchen staff know what to cook

### Bill Desk Printer 💰
```
================================
     YOUR RESTAURANT NAME
================================

INVOICE

Order #: ORD000123
Customer: John Doe
Phone: 07123456789

ITEMS:
2x Butter Chicken (Medium) - £27.98
4x Garlic Naan - £11.96

Subtotal: £39.94
Discount: -£3.99
Delivery: £5.00
TOTAL: £40.95

Payment: STRIPE - PAID
================================
```

**Purpose**: Complete invoice for records and delivery

---

## Troubleshooting

### Problem: Nothing Prints

**Check:**
1. Are printers turned on?
2. Do printers have paper?
3. Are printer names correct in `.env` file?
4. Did you restart server after changing `.env`?

**Solution:**
- Check printer names match exactly (case-sensitive!)
- Run test print commands
- Check server console for error messages

### Problem: Only One Printer Works

**Check:**
- Is the other printer online?
- Does it have paper/ink?
- Is it connected properly?

**Solution:**
- Test each printer individually
- Check printer queue for stuck jobs
- Restart the printer

### Problem: Prints But Wrong Format

**Check:**
- Is it printing to the correct printer?
- Kitchen receipt should go to kitchen
- Invoice should go to bill desk

**Solution:**
- Swap printer names in `.env` if they're reversed

---

## Manual Reprint (If Needed)

If a receipt didn't print or got lost:

1. Go to Admin Panel
2. Find the order
3. Click "Reprint"
4. Choose which printer (Kitchen, Bill Desk, or Both)

Or ask developer to run:
```bash
curl -X POST http://localhost:5000/api/printers/reprint/ORD000123 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"printerType": "both"}'
```

---

## Daily Checklist

### Start of Day:
- [ ] Turn on both printers
- [ ] Check paper levels
- [ ] Print test page from each printer
- [ ] Check server is running

### During Service:
- [ ] Monitor printers for paper jams
- [ ] Refill paper as needed
- [ ] Check receipts are printing clearly

### End of Day:
- [ ] Printers can stay on or turn off
- [ ] Server should stay running for online orders

---

## Benefits

### For Kitchen Staff:
✅ Instant order notification
✅ Clear item list with quantities
✅ No need to check computer
✅ Can start cooking immediately

### For Bill Desk:
✅ Complete invoice ready
✅ Payment confirmation included
✅ Easy to file for records
✅ Ready for delivery driver

### For Management:
✅ No manual printing needed
✅ Automatic paper trail
✅ Faster order processing
✅ Reduced errors

---

## Support

### Need Help?

**Common Issues:**
- Printer not found → Check printer name spelling
- Nothing prints → Check printer is online
- Wrong printer → Swap names in config

**Contact Developer If:**
- Test prints don't work after checking everything
- Server shows error messages
- Need to add more printers
- Want to customize receipt format

---

## Important Notes

⚠️ **Printer Names Must Match Exactly**
- Case-sensitive: `Kitchen_Printer` ≠ `kitchen_printer`
- Include spaces if printer name has spaces
- No typos!

⚠️ **Restart Server After Changes**
- Any change to `.env` requires server restart
- Otherwise changes won't take effect

⚠️ **Keep Printers On During Service**
- Printers should be ready at all times
- Turn off only when restaurant is closed

✅ **Automatic = No Action Needed**
- Once set up, printing is completely automatic
- No buttons to click
- No manual steps
- Just works!

---

**Setup Time**: 10-15 minutes (one-time)
**Daily Maintenance**: 2 minutes (check paper)
**Manual Work**: Zero (fully automatic)

🎉 **Enjoy automatic printing!**
