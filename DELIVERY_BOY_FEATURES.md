# Delivery Boy Features

## Account Page for Delivery Boys

When a delivery boy logs in and visits the Account page (`/account`), they see specialized tabs:

### 1. Profile Tab
- Basic information (Name, Email, Phone)
- **License Information section** with:
  - License Number field
  - Verification status badge

### 2. Vehicle Info Tab (Delivery Boys Only)
- **Vehicle Details:**
  - Vehicle Type (Bike/Scooter/Car)
  - Vehicle Number (Registration)
  - Vehicle Model
- **Documents Section:**
  - Driving License with verification status
  - Shows "Verified" or "Pending" badge

### 3. Deliveries Tab
- Shows delivery history instead of orders
- Lists all assigned deliveries

## Navbar Changes

### For Admins:
- ❌ **My Account button is hidden**
- ✅ Admin Panel button visible
- ✅ Delivery Panel button visible
- ✅ Sign Out button

### For Delivery Boys:
- ✅ **My Account button visible** (with vehicle info)
- ✅ Delivery Panel button visible
- ✅ Sign Out button

### For Regular Users:
- ✅ My Account button visible
- ✅ Sign Out button

## Database Fields

The following fields are stored in the users collection for delivery boys:

```javascript
{
  email: String,
  name: String,
  phone: String,
  role: 'delivery_boy',
  licenseNumber: String,
  vehicleType: String,
  vehicleNumber: String,
  vehicleModel: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Creating a Delivery Boy Account

1. Sign up as a regular user
2. Login as admin (admin@indiya.com / admin123)
3. Go to Admin Panel > Users
4. Find the user and change role to "Delivery Boy"
5. User can now login and update their vehicle information
