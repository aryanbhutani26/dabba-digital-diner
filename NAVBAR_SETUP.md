# Navbar Setup Guide

## Add Navbar Items

The navbar items (Home, Menu, About, Services, Gallery, Contact) need to be added to the database.

### Option 1: Run the navbar seed script

```bash
cd server
npm run seed:navbar
```

This will add all 6 navbar items to your database.

### Option 2: Use the Admin Panel

1. Login as admin (admin@indiya.com / admin123)
2. Go to Admin Panel (`/admin`)
3. Navigate to "Navbar Items" section
4. Add items manually with:
   - Name: Home, Path: /, Sort Order: 1
   - Name: Menu, Path: /menu, Sort Order: 2
   - Name: About, Path: /about, Sort Order: 3
   - Name: Services, Path: /services, Sort Order: 4
   - Name: Gallery, Path: /gallery, Sort Order: 5
   - Name: Contact, Path: /contact, Sort Order: 6

## Verify Navbar Items

After adding the items, refresh your frontend and you should see all navigation links in the navbar.

## Current Features

- **Floating Cart Button**: The cart now floats in the bottom-right corner of the menu page
- **Dynamic Navbar**: Navbar items are fetched from the database and can be managed via admin panel
- **Responsive Design**: Works on mobile and desktop
