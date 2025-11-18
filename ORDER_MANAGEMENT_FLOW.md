# Order Management Flow

## Complete Order Lifecycle

### 1. Customer Places Order 🛒

**What Happens:**
- Customer adds items to cart
- Selects delivery address
- Clicks "Proceed to Checkout"
- Mock payment is processed instantly
- Order is created with status: `pending`

**Order Details Captured:**
- Order number (auto-generated: ORD000001, ORD000002, etc.)
- Customer name
- Customer phone
- Delivery address
- Items ordered
- Total amount (including ₹50 delivery fee)
- Payment status: `paid`
- Order status: `pending`

### 2. Admin Receives Notification 🔔

**Admin Panel Features:**
- **Auto-refresh**: Checks for new orders every 30 seconds
- **New Order Badge**: Red badge on "Orders" tab showing count of pending orders
- **Toast Notification**: "New Orders! You have X new orders waiting for assignment"

**Admin Can See:**
- Order number
- Customer name, phone, and address
- Items ordered and total amount
- Order timestamp
- "NEW" badge for pending orders

### 3. Admin Assigns Delivery Boy 👨‍💼

**Assignment Process:**
1. Admin opens the "Orders" tab
2. Finds pending order
3. Clicks dropdown: "Assign to Delivery Boy"
4. Selects delivery boy from list (shows name and phone)
5. Order status changes to: `assigned`
6. Timestamp recorded: `assignedAt`

**What Happens:**
- Order is linked to delivery boy via `deliveryBoyId`
- Status changes from `pending` → `assigned`
- Success notification: "Order assigned to delivery boy. They will be notified."

### 4. Delivery Boy Receives Notification 📱

**Delivery Dashboard Features:**
- **Auto-refresh**: Checks for new assignments every 30 seconds
- **Toast Notification**: Shows order details immediately
  - "New Delivery Assigned!"
  - Order number
  - Customer name
  - Delivery address

**Delivery Boy Can See:**
- All assigned orders in their dashboard
- Customer details:
  - Name
  - Phone number (clickable to call)
  - Full delivery address
- Order items and total amount
- Current order status

### 5. Delivery Boy Updates Status 📦

**Status Flow:**
1. **Assigned** → Initial state after admin assignment
2. **Picked Up** → Delivery boy picks up order from restaurant
3. **Out for Delivery** → On the way to customer (GPS tracking starts)
4. **Delivered** → Order successfully delivered

**Each Status Update:**
- Records timestamp (pickedUpAt, outForDeliveryAt, deliveredAt)
- Updates GPS location (for out_for_delivery status)
- Visible to customer on tracking page
- Visible to admin in order management

### 6. Customer Tracks Order 🗺️

**Tracking Features:**
- Real-time status updates
- Live map showing delivery location
- Estimated arrival time
- Order timeline with timestamps
- Delivery boy contact option (when out for delivery)

## Technical Implementation

### Database Schema

```javascript
Order {
  _id: ObjectId,
  orderNumber: String,        // "ORD000001"
  userId: String,             // Customer ID
  customerName: String,
  customerPhone: String,
  deliveryAddress: String,
  items: Array,
  totalAmount: Number,
  deliveryFee: Number,        // ₹50
  paymentMethod: String,      // "mock"
  paymentStatus: String,      // "paid"
  status: String,             // "pending", "assigned", "picked_up", "out_for_delivery", "delivered"
  deliveryBoyId: String,      // Assigned delivery boy
  currentLocation: Object,    // { latitude, longitude }
  createdAt: Date,
  assignedAt: Date,
  pickedUpAt: Date,
  outForDeliveryAt: Date,
  deliveredAt: Date,
  updatedAt: Date
}
```

### API Endpoints

#### Create Order
```
POST /api/orders
Authorization: Bearer <user_token>

Body: {
  items: Array,
  deliveryAddress: String,
  customerName: String,
  customerPhone: String,
  totalAmount: Number,
  paymentMethod: "mock"
}

Response: {
  orderId: String,
  orderNumber: String,
  message: "Order placed successfully"
}
```

#### Assign Delivery Boy (Admin Only)
```
PATCH /api/orders/:orderId/assign
Authorization: Bearer <admin_token>

Body: {
  deliveryBoyId: String
}

Response: {
  message: "Order assigned successfully",
  deliveryBoyName: String
}
```

#### Get My Deliveries (Delivery Boy)
```
GET /api/orders/my-deliveries
Authorization: Bearer <delivery_boy_token>

Response: Array of assigned orders
```

#### Update Order Status
```
PATCH /api/orders/:orderId/status
Authorization: Bearer <delivery_boy_token>

Body: {
  status: String,
  location: { latitude, longitude } // Optional
}
```

## Notifications System

### Admin Notifications
- **Trigger**: New order created (status: pending)
- **Frequency**: Every 30 seconds (auto-refresh)
- **Display**: 
  - Badge count on Orders tab
  - Toast notification with count
  - Visual "NEW" badge on order card

### Delivery Boy Notifications
- **Trigger**: Order assigned by admin
- **Frequency**: Every 30 seconds (auto-refresh)
- **Display**:
  - Toast notification with full details
  - Order appears in "Assigned" section
  - Customer details immediately visible

### Customer Notifications
- **Order Confirmation**: Immediate after checkout
- **Status Updates**: Real-time on tracking page
- **Delivery Updates**: Via tracking page refresh

## Auto-Refresh Intervals

- **Admin Panel**: 30 seconds
- **Delivery Dashboard**: 30 seconds
- **Customer Tracking**: 10 seconds

## Status Colors

- **Pending**: Yellow (⚠️ NEW)
- **Assigned**: Blue
- **Picked Up**: Purple
- **Out for Delivery**: Orange
- **Delivered**: Green

## Testing the Flow

### 1. Place Order as Customer
```bash
1. Login as regular user
2. Add items to cart
3. Select delivery address
4. Checkout with mock payment
5. Note the order number
```

### 2. Check Admin Panel
```bash
1. Login as admin
2. Go to Admin Panel → Orders tab
3. Should see new order with "NEW" badge
4. Should see notification toast
```

### 3. Assign Delivery Boy
```bash
1. Find pending order
2. Select delivery boy from dropdown
3. Confirm assignment
4. Order status changes to "assigned"
```

### 4. Check Delivery Dashboard
```bash
1. Login as delivery boy
2. Go to Delivery Dashboard
3. Should see notification toast
4. Order appears with customer details
5. Can update status through workflow
```

### 5. Track Order as Customer
```bash
1. Go to order confirmation page
2. Click "Track Order"
3. See real-time status updates
4. View delivery location on map
```

## Future Enhancements

- Push notifications (browser/mobile)
- SMS notifications to customer
- Email confirmations
- Real-time WebSocket updates
- Delivery boy rating system
- Order cancellation flow
- Refund management
