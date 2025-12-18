# Quick Start Guide - Menu Improvements

## 🚀 Getting Started

### 1. Seed the Database with New Menu Structure

Run this command from the `backend` directory:

```bash
cd backend
npm run seed:menu
```

This will:
- Clear existing menu items
- Add 30+ sample items across all 4 categories
- Set up subcategories (Tandoori Items, Rice, Curries, etc.)
- Initialize lunch menu settings
- Display a summary of what was added

### 2. Start the Servers

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### 3. Test the Features

#### A. View the Menu
1. Navigate to `http://localhost:5173/menu`
2. You should see 4 tabs: **Mains**, **Lunch**, **Drinks**, **Desserts**
3. Click on **Mains** - items are grouped by subcategory:
   - Tandoori Items
   - Rice
   - Curries
   - Breads
4. Each subcategory has an elegant heading

#### B. Test Lunch Menu Toggle
1. Sign in as admin (or create admin account)
2. Go to Admin Panel → **General Settings** tab
3. Scroll to **"Lunch Menu Availability"**
4. Toggle the switch to **OFF**
5. Go back to Menu page
6. Click **Lunch** tab
7. You should see:
   - ✅ "Lunch Service Unavailable" message
   - ✅ Items grayed out
   - ✅ Cannot click on items

#### C. Check Logo Display
1. **Navbar**: Logo appears in top-left (circular)
2. **Footer**: Logo appears in brand section (circular)
3. **Auth Page**: Logo appears at top (circular)

#### D. Add New Menu Item with Subcategory
1. Go to Admin Panel → **Menu** tab
2. Click **"Add Menu Item"**
3. Fill in:
   - Name: "Chicken Korma"
   - Description: "Mild curry with cream and nuts"
   - Price: 13.99
   - Category: **Mains**
   - Subcategory: **Curries**
   - Allergens: Dairy, Nuts
4. Upload an image (optional)
5. Click **"Create Item"**
6. Go to Menu page → Mains tab
7. Item should appear under "Curries" heading

## 📋 Feature Checklist

### Logo Integration
- [ ] Logo visible in Navbar (circular)
- [ ] Logo visible in Footer (circular)
- [ ] Logo visible in Auth page (circular)
- [ ] Logo responsive on mobile

### Menu Categories
- [ ] 4 main tabs visible: Mains, Lunch, Drinks, Desserts
- [ ] Tabs in correct order
- [ ] Items grouped by subcategory
- [ ] Subcategory headings styled elegantly

### Lunch Menu Control
- [ ] Toggle switch in General Settings
- [ ] Toggle updates immediately
- [ ] Disabled state shows message
- [ ] Items grayed out when disabled
- [ ] Cannot click disabled items
- [ ] Other categories still work

### Admin Interface
- [ ] Can add items with subcategory
- [ ] Can edit items and change subcategory
- [ ] Subcategory dropdown has predefined options
- [ ] Can add custom subcategory
- [ ] Search works across categories

## 🎨 Customization

### Change Logo
Replace the file at:
```
frontend/src/assets/indiya-logo.jpg
```

### Add More Subcategories
Edit these files:
- `frontend/src/components/admin/AddMenuItemDialog.tsx`
- `frontend/src/components/admin/EditMenuItemDialog.tsx`

Add to the SelectContent:
```tsx
<SelectItem value="Your Subcategory">Your Subcategory</SelectItem>
```

### Customize Disabled Message
Edit `frontend/src/pages/Menu.tsx`, find:
```tsx
<h3 className="text-2xl font-semibold mb-2 text-muted-foreground">
  Lunch Service Unavailable
</h3>
<p className="text-muted-foreground max-w-md mx-auto">
  Your custom message here
</p>
```

### Change Category Order
Edit `frontend/src/pages/Menu.tsx`, find:
```tsx
const mainCategories = ['Mains', 'Lunch', 'Drinks', 'Desserts'];
```

## 🐛 Troubleshooting

### Logo Not Showing
**Problem**: Logo doesn't appear
**Solution**: 
1. Check if `frontend/src/assets/indiya-logo.jpg` exists
2. Try clearing browser cache
3. Check browser console for errors

### Subcategories Not Grouping
**Problem**: Items not grouped by subcategory
**Solution**:
1. Check database - items should have `subcategory` field
2. Run seed script again: `npm run seed:menu`
3. Refresh the page

### Lunch Toggle Not Working
**Problem**: Toggle doesn't disable lunch menu
**Solution**:
1. Check backend is running
2. Check browser console for API errors
3. Verify you're logged in as admin
4. Check database for `lunch_menu_enabled` setting

### Items Still Clickable When Disabled
**Problem**: Can still click lunch items when disabled
**Solution**:
1. Check if `pointer-events-none` class is applied
2. Verify `lunchEnabled` state is false
3. Check category name is exactly "Lunch" (case-sensitive)

## 📱 Mobile Testing

Test on mobile devices or use browser dev tools:
1. Logo should scale appropriately
2. Category tabs should scroll horizontally
3. Subcategory headings should be readable
4. Disabled message should be centered
5. Items should stack vertically

## 🎯 Production Deployment

Before deploying:
1. ✅ Test all features thoroughly
2. ✅ Add real menu items (replace sample data)
3. ✅ Upload actual restaurant logo
4. ✅ Test on multiple devices
5. ✅ Check all images load correctly
6. ✅ Verify lunch toggle works
7. ✅ Test with real users

## 📞 Support

If you encounter issues:
1. Check the `MENU_IMPROVEMENTS.md` documentation
2. Review code comments in modified files
3. Check browser console for errors
4. Verify database connection
5. Ensure all dependencies are installed

## 🎉 Success!

If everything works:
- ✅ Logo appears throughout the site
- ✅ Menu has 4 organized categories
- ✅ Items grouped by subcategory with elegant headings
- ✅ Lunch menu can be toggled on/off
- ✅ Disabled state looks professional
- ✅ Admin interface is intuitive

**Congratulations! Your menu system is now fully upgraded!** 🎊
