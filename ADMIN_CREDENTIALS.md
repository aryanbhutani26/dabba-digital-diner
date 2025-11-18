# Admin Credentials

## Default Admin Account

**Email:** `admin@indiya.com`  
**Password:** `admin123`

## Reset Admin Password

If you're unable to login with the admin credentials, run:

```bash
cd server
npm run reset-admin
```

This will reset the admin password to `admin123`.

## Features Available to Admin

- **Admin Panel** (`/admin`): Full dashboard with analytics and management
- **User Management**: View, edit roles, and delete users
- **Delivery Boy Management**: Assign delivery boys to orders
- **Order Management**: View all orders and their status
- **Content Management**: Edit navbar items, coupons, menu items, and site settings
- **Analytics**: View revenue, top dishes, and delivery performance

## Other Test Accounts

You can create regular user accounts through the sign-up form or use Google Sign-In.

To create a delivery boy account:
1. Sign up as a regular user
2. Login as admin
3. Go to Admin Panel > Users
4. Change the user's role to "Delivery Boy"
