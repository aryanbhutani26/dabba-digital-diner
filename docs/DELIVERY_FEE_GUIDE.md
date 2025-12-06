# Delivery Fee Configuration Guide

## Overview

The delivery fee is now fully configurable from the Admin Panel. This allows you to easily adjust the delivery charge without modifying any code.

---

## How to Configure Delivery Fee

### Step 1: Access Admin Panel

1. Log in to your admin account
2. Navigate to the **Admin Panel**
3. Click on the **General** tab

### Step 2: Update Delivery Fee

1. Scroll to the **Delivery Fee** section
2. You'll see an input field showing the current delivery fee
3. Enter the new delivery fee amount (e.g., 50.00, 75.50, 100.00)
4. Click **Update Delivery Fee** button
5. You'll see a success message confirming the update

---

## Where Delivery Fee is Applied

The delivery fee you set will automatically be applied in:

### 1. Shopping Cart
- Displayed in the cart summary
- Shows as a separate line item
- Included in the total calculation

### 2. Checkout Process
- Added to the order total
- Shown before payment
- Included in payment amount

### 3. Order Confirmation
- Displayed in order details
- Shown in order summary
- Included in receipt

### 4. Order Tracking
- Visible in order breakdown
- Part of total amount paid

### 5. Admin Order Management
- Shown in order details
- Tracked for delivery boy earnings
- Included in revenue analytics

---

## Default Delivery Fee

- **Default Value**: £50.00
- This is used if no custom fee is set
- Automatically applied to all new orders

---

## How It Works Technically

### Backend Storage
```javascript
{
  "key": "delivery_fee",
  "value": 50.00
}
```

Stored in the `site_settings` collection in MongoDB.

### Frontend Fetching
The cart automatically fetches the current delivery fee when loaded:
- Fetches from `/api/settings/delivery_fee`
- Updates in real-time
- Falls back to £50 if fetch fails

### Calculation
```
Total = Subtotal - Discount + Delivery Fee
```

---

## Examples

### Example 1: Standard Delivery
```
Subtotal: £150.00
Discount: -£15.00 (10% coupon)
Delivery Fee: £50.00
-------------------
Total: £185.00
```

### Example 2: Premium Delivery
```
Subtotal: £200.00
Discount: £0.00
Delivery Fee: £100.00
-------------------
Total: £300.00
```

### Example 3: Free Delivery Promotion
```
Subtotal: £250.00
Discount: £0.00
Delivery Fee: £0.00
-------------------
Total: £250.00
```

---

## Best Practices

### 1. Competitive Pricing
- Research competitor delivery fees
- Consider your delivery radius
- Factor in fuel and driver costs

### 2. Promotional Strategies
- Set to £0.00 for free delivery promotions
- Reduce fee during slow periods
- Increase for peak hours if needed

### 3. Communication
- Clearly display delivery fee in cart
- Mention in marketing materials
- Update website if fee changes significantly

### 4. Regular Review
- Monitor customer feedback
- Track order completion rates
- Adjust based on costs and demand

---

## Common Scenarios

### Scenario 1: Free Delivery Weekend
1. Go to Admin Panel → General
2. Set Delivery Fee to `0.00`
3. Click Update
4. Promote on social media
5. Remember to restore normal fee after weekend

### Scenario 2: Increased Fuel Costs
1. Calculate new delivery cost
2. Update fee in Admin Panel
3. Notify customers via email/social media
4. Update website banner if needed

### Scenario 3: Zone-Based Pricing
Currently, the system uses a single delivery fee for all orders. For zone-based pricing:
- Set the fee to your most common zone
- Manually adjust orders for special zones
- Consider custom development for automatic zone detection

---

## Troubleshooting

### Problem: Delivery fee not updating in cart

**Solutions**:
1. Refresh the cart page
2. Clear browser cache
3. Check that you clicked "Update Delivery Fee"
4. Verify backend server is running

### Problem: Old fee still showing

**Solutions**:
1. Close and reopen the cart
2. Hard refresh (Ctrl+F5 or Cmd+Shift+R)
3. Check browser console for errors
4. Verify database was updated

### Problem: Fee showing as £50 when it should be different

**Solutions**:
1. Check that the setting was saved in Admin Panel
2. Verify the API endpoint is working
3. Check for JavaScript errors in console
4. Ensure you're not in a cached session

---

## Technical Details

### API Endpoints

**Get Delivery Fee**
```
GET /api/settings/delivery_fee
```

**Update Delivery Fee**
```
PUT /api/settings/delivery_fee
Body: { "value": 50.00 }
```

### Database Schema
```javascript
{
  _id: ObjectId,
  key: "delivery_fee",
  value: 50.00,
  updatedAt: Date
}
```

---

## Future Enhancements

Potential features for future development:

1. **Zone-Based Pricing**
   - Different fees for different areas
   - Automatic calculation based on postcode

2. **Time-Based Pricing**
   - Higher fees during peak hours
   - Lower fees during off-peak times

3. **Order Value Thresholds**
   - Free delivery over £X
   - Reduced fee for large orders

4. **Distance-Based Calculation**
   - Calculate fee based on actual distance
   - Integration with mapping services

5. **Delivery Fee Schedules**
   - Set different fees for different days
   - Automatic switching based on schedule

---

## Support

If you need help with delivery fee configuration:
1. Check this guide first
2. Review the troubleshooting section
3. Check browser console for errors
4. Contact technical support if issues persist

---

## Summary

✅ Delivery fee is fully configurable from Admin Panel  
✅ Updates apply immediately to all new orders  
✅ Displayed consistently across the entire website  
✅ Easy to change for promotions or cost adjustments  
✅ No code changes required  

Keep your delivery fee competitive and adjust as needed to maintain profitability while providing value to customers!
