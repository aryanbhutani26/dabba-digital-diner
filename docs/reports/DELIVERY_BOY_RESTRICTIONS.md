# Delivery Boy Access Restrictions

## Overview

Delivery boys have a restricted interface that only shows relevant features for their role.

## What Delivery Boys Can Access

### ✅ Allowed Pages
1. **Delivery Dashboard** (`/delivery`)
   - View assigned orders
   - Update order status
   - Track deliveries with GPS
   - View delivery statistics

2. **My Account** (`/account`)
   - Update personal information
   - Add/edit license number
   - Manage vehicle information
   - View delivery history

3. **Auth Page** (`/auth`)
   - Login/Logout functionality

### ❌ Restricted Pages

Delivery boys are automatically redirected to `/delivery` if they try to access:
- Home page (`/`)
- Menu page (`/menu`)
- About page (`/about`)
- Services page (`/services`)
- Contact page (`/contact`)
- Reservations page (`/reservations`)
- Gallery page (`/gallery`)
- Track Order page (`/track-order`)
- Order Confirmation page (`/order-confirmation`)
- Admin Panel (`/admin`)

## Navbar for Delivery Boys

### Desktop View
- **My Account** button (User icon)
- **Delivery Dashboard** button (Package icon)
- **Sign Out** button (Logout icon)

### Mobile View
- **My Account** link
- **Delivery Dashboard** link
- **Sign Out** button

**Hidden Elements:**
- All navigation menu items (Home, Menu, About, etc.)
- "Book a Table" button
- Restaurant branding still visible

## Login Behavior

When a delivery boy logs in:
1. They are automatically redirected to `/delivery` (Delivery Dashboard)
2. If they try to access restricted pages, they are redirected back to `/delivery`
3. They see a simplified navbar with only relevant options

## Implementation Details

### Route Protection
- `DeliveryBoyRedirect` component wraps restricted routes
- Checks user role on mount and navigation
- Automatically redirects delivery boys to `/delivery`

### Navbar Logic
- Conditionally renders menu items based on `isDeliveryBoy` flag
- Hides navigation links and "Book a Table" button
- Shows only account and delivery dashboard buttons

### Auth Redirect
- After successful login, checks user role
- Delivery boys → `/delivery`
- Other users → `/`

## Testing

### As Delivery Boy:
1. Login with delivery boy credentials
2. Should land on `/delivery` page
3. Try navigating to `/menu` → redirected to `/delivery`
4. Navbar should only show: Account, Delivery Dashboard, Sign Out

### As Regular User:
1. Login with regular user credentials
2. Should land on `/` (home page)
3. Can access all pages normally
4. Navbar shows all menu items

### As Admin:
1. Login with admin credentials
2. Should land on `/` (home page)
3. Can access all pages including admin panel
4. Navbar shows all items plus admin button (no account button)

## Creating Delivery Boys

Admins can create delivery boy accounts from:
- Admin Panel → Users tab → "Add Delivery Boy" button

New delivery boys receive:
- Email (login username)
- Password (set by admin)
- Phone number
- Role: `delivery_boy`

They can then login and update their vehicle information.
