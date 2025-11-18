# Admin User Management Guide

## Creating Delivery Boys

Admins can now create delivery boy accounts directly from the Admin Panel.

### Steps to Create a Delivery Boy:

1. Login as admin (admin@indiya.com / admin123)
2. Go to Admin Panel (`/admin`)
3. Click on the **"Users"** tab
4. Click **"Add Delivery Boy"** button
5. Fill in the form:
   - **Full Name**: Delivery boy's name
   - **Email**: Login email (must be unique)
   - **Password**: Login password (minimum 6 characters)
   - **Phone Number**: Contact number
6. Click **"Create Delivery Boy"**

The delivery boy can now login with their email and password.

## User Management Features

### View All Users
The Users tab shows all registered users with:
- Name and email
- Role badge (User / Delivery Boy / Admin)
- Phone number (if provided)

### Change User Roles
Use the dropdown menu to change any user's role:
- **User**: Regular customer
- **Delivery Boy**: Can access delivery panel and manage deliveries
- **Admin**: Full access to admin panel

### Delete Users
Click the trash icon to permanently delete a user account.

## Delivery Boy Account Features

Once created, delivery boys can:
1. Login with their credentials
2. Access their account page to add:
   - License number
   - Vehicle type (Bike/Scooter/Car)
   - Vehicle registration number
   - Vehicle model
3. Access the Delivery Panel to:
   - View assigned orders
   - Update order status
   - Track deliveries with GPS

## API Endpoints

### Create Delivery Boy
```
POST /api/users/delivery-boy
Authorization: Bearer <admin_token>

Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+91 98765 43210"
}
```

### Update User Role
```
PATCH /api/users/:userId/role
Authorization: Bearer <admin_token>

Body:
{
  "role": "delivery_boy" | "user" | "admin"
}
```

### Delete User
```
DELETE /api/users/:userId
Authorization: Bearer <admin_token>
```

## Security Notes

- Only admins can create delivery boy accounts
- Passwords are hashed using bcrypt before storage
- Email addresses must be unique
- Minimum password length is 6 characters
