# Deployment Instructions

## 🚀 Step-by-Step Deployment Guide

### Prerequisites
- Backend server running (Node.js)
- Frontend development server or build
- MongoDB database connected
- Admin account created

---

## Phase 1: Database Setup

### Step 1: Seed the Menu
```bash
cd backend
npm run seed:menu
```

**What this does:**
- Clears existing menu items
- Adds 30+ sample items with proper structure
- Sets up all 4 categories (Mains, Lunch, Drinks, Desserts)
- Creates subcategories (Tandoori Items, Rice, Curries, etc.)
- Initializes lunch menu setting (enabled by default)

**Expected Output:**
```
🔄 Connecting to database...
✅ MongoDB Connected Successfully
🗑️  Clearing existing menu items...
📝 Inserting sample menu items...
✅ Successfully inserted 30 menu items!
⚙️  Setting up lunch menu configuration...
✅ Lunch menu setting initialized!

📊 Menu Summary:
   Desserts: 4 items
   Drinks: 5 items
   Lunch: 4 items
   Mains: 17 items

🎉 Menu seeding completed successfully!
```

### Step 2: Verify Database
Check your MongoDB database:
- Collection: `menu_items` should have ~30 items
- Collection: `site_settings` should have `lunch_menu_enabled` entry

---

## Phase 2: Backend Deployment

### Step 1: Verify Backend Changes
Files modified:
- ✅ `backend/routes/menu.js` - Returns lunch status
- ✅ `backend/routes/settings.js` - Handles settings
- ✅ `backend/package.json` - Added seed script

### Step 2: Test Backend API
```bash
# Start backend
cd backend
npm run dev

# Test menu endpoint
curl http://localhost:5000/api/menu

# Expected response:
{
  "items": [...],
  "lunchEnabled": true
}
```

### Step 3: Test Settings Endpoint
```bash
# Get lunch setting
curl http://localhost:5000/api/settings/lunch_menu_enabled

# Expected response:
{
  "key": "lunch_menu_enabled",
  "value": true
}
```

---

## Phase 3: Frontend Deployment

### Step 1: Verify Frontend Changes
Files modified:
- ✅ `frontend/src/pages/Menu.tsx` - Subcategories & lunch toggle
- ✅ `frontend/src/pages/Admin.tsx` - General settings
- ✅ `frontend/src/components/Navbar.tsx` - Logo
- ✅ `frontend/src/components/Footer.tsx` - Logo
- ✅ `frontend/src/pages/Auth.tsx` - Logo
- ✅ `frontend/src/components/admin/AddMenuItemDialog.tsx` - Subcategory
- ✅ `frontend/src/components/admin/EditMenuItemDialog.tsx` - Subcategory

### Step 2: Build Frontend
```bash
cd frontend
npm run build
```

### Step 3: Test Frontend Locally
```bash
cd frontend
npm run dev
```

Visit: `http://localhost:5173`

---

## Phase 4: Testing Checklist

### Logo Tests
- [ ] Navigate to homepage
- [ ] Check navbar - logo visible and circular
- [ ] Scroll to footer - logo visible and circular
- [ ] Go to `/auth` - logo visible and circular
- [ ] Test on mobile - logo scales properly
- [ ] Test hover effect on navbar logo

### Menu Tests
- [ ] Go to `/menu`
- [ ] See 4 tabs: Mains, Lunch, Drinks, Desserts
- [ ] Click Mains tab
- [ ] Items grouped by subcategory (Tandoori Items, Rice, etc.)
- [ ] Subcategory headings styled with gradient
- [ ] Click each tab - all categories work
- [ ] Search functionality works
- [ ] Click a dish - detail dialog opens

### Lunch Toggle Tests
- [ ] Log in as admin
- [ ] Go to Admin Panel
- [ ] Click General Settings tab
- [ ] Find "Lunch Menu Availability" section
- [ ] Toggle is ON by default
- [ ] Toggle to OFF
- [ ] Go to Menu page
- [ ] Click Lunch tab
- [ ] See "Lunch Service Unavailable" message
- [ ] Items are grayed out
- [ ] Cannot click lunch items
- [ ] Other tabs still work
- [ ] Toggle back to ON
- [ ] Lunch items work again

### Admin Menu Management Tests
- [ ] Go to Admin Panel → Menu tab
- [ ] Click "Add Menu Item"
- [ ] See Category dropdown with 4 options
- [ ] See Subcategory dropdown
- [ ] Select "Mains" category
- [ ] Select "Curries" subcategory
- [ ] Fill in all fields
- [ ] Upload image
- [ ] Create item
- [ ] Item appears in menu
- [ ] Item grouped under "Curries" heading
- [ ] Edit the item
- [ ] Change subcategory
- [ ] Save changes
- [ ] Item moves to new subcategory group

### Mobile Responsive Tests
- [ ] Test on phone (or use browser dev tools)
- [ ] Logo scales appropriately
- [ ] Category tabs scroll horizontally
- [ ] Items stack vertically
- [ ] Subcategory headings readable
- [ ] Disabled lunch message centered
- [ ] Admin panel usable on mobile

---

## Phase 5: Production Deployment

### Option A: Deploy to Vercel (Frontend)

1. **Push to GitHub**:
```bash
git add .
git commit -m "Add menu improvements: logo, categories, lunch toggle"
git push origin main
```

2. **Deploy Frontend**:
- Go to Vercel dashboard
- Import your repository
- Set build command: `cd frontend && npm run build`
- Set output directory: `frontend/dist`
- Add environment variables:
  - `VITE_API_URL` = your backend URL
- Deploy

3. **Verify Deployment**:
- Visit your Vercel URL
- Test all features
- Check browser console for errors

### Option B: Deploy to Railway/Render (Backend)

1. **Prepare Backend**:
```bash
# Ensure .env is in .gitignore
# Create .env.example with required variables
```

2. **Deploy**:
- Connect your repository
- Set environment variables:
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `PORT`
  - `FRONTEND_URL`
- Deploy

3. **Run Seed Script**:
```bash
# SSH into your server or use platform CLI
npm run seed:menu
```

### Option C: Deploy to VPS

1. **Upload Files**:
```bash
scp -r backend user@your-server:/var/www/restaurant
scp -r frontend/dist user@your-server:/var/www/restaurant/public
```

2. **Install Dependencies**:
```bash
ssh user@your-server
cd /var/www/restaurant/backend
npm install --production
```

3. **Run Seed**:
```bash
npm run seed:menu
```

4. **Start Services**:
```bash
# Using PM2
pm2 start server.js --name restaurant-api
pm2 save
```

---

## Phase 6: Post-Deployment

### Step 1: Verify Production
- [ ] Visit production URL
- [ ] Test all features from checklist above
- [ ] Check browser console for errors
- [ ] Test on multiple devices
- [ ] Test on multiple browsers

### Step 2: Update Real Data
1. Log in as admin
2. Go to Menu tab
3. Replace sample items with real menu items
4. Upload actual dish photos
5. Set correct prices
6. Add accurate allergen information

### Step 3: Replace Logo
1. Prepare your logo:
   - Square format (200x200px minimum)
   - High quality
   - Clear on light and dark backgrounds
2. Replace file: `frontend/src/assets/indiya-logo.jpg`
3. Rebuild and redeploy frontend

### Step 4: Configure Lunch Hours
1. Decide on lunch service hours
2. Create a routine:
   - Enable lunch menu at start of lunch service
   - Disable when lunch service ends
3. Train staff on using the toggle

---

## Phase 7: Monitoring

### What to Monitor
- [ ] Menu items loading correctly
- [ ] Lunch toggle working
- [ ] Logo displaying on all pages
- [ ] No console errors
- [ ] API response times
- [ ] Database queries

### Common Issues & Solutions

**Issue**: Logo not showing
- **Solution**: Check image path, clear browser cache

**Issue**: Subcategories not grouping
- **Solution**: Verify `subcategory` field in database

**Issue**: Lunch toggle not working
- **Solution**: Check API connection, verify admin permissions

**Issue**: Items not graying out when lunch disabled
- **Solution**: Check CSS classes, verify category name is "Lunch"

---

## Phase 8: Backup

### Before Going Live
```bash
# Backup database
mongodump --uri="your-mongodb-uri" --out=backup-$(date +%Y%m%d)

# Backup code
git tag -a v2.0 -m "Menu improvements release"
git push origin v2.0
```

### Regular Backups
- Set up automated daily database backups
- Keep code in version control
- Document any custom changes

---

## Phase 9: Training

### Train Staff On:
1. **Adding Menu Items**:
   - Show how to add new dishes
   - Explain category and subcategory selection
   - Demonstrate image upload

2. **Managing Lunch Menu**:
   - Show where the toggle is
   - Explain when to use it
   - Demonstrate the customer view

3. **Editing Items**:
   - How to update prices
   - How to change descriptions
   - How to move items between categories

### Create Quick Reference Guide
- Print out CLIENT_README.md
- Highlight key sections
- Keep near computer for easy reference

---

## Phase 10: Go Live!

### Final Checklist
- [ ] Database seeded
- [ ] Backend deployed and running
- [ ] Frontend deployed and accessible
- [ ] All tests passed
- [ ] Real menu items added
- [ ] Logo replaced with actual logo
- [ ] Staff trained
- [ ] Backup created
- [ ] Monitoring in place
- [ ] Documentation accessible

### Announcement
1. Update website banner (if any)
2. Inform customers of new menu layout
3. Highlight improved organization
4. Mention lunch availability feature

---

## 🎉 Success Criteria

Your deployment is successful when:
- ✅ Logo appears on all pages
- ✅ Menu has 4 organized categories
- ✅ Items grouped by subcategory
- ✅ Lunch toggle works perfectly
- ✅ Admin can manage menu easily
- ✅ Customers can browse menu smoothly
- ✅ Mobile experience is excellent
- ✅ No errors in console
- ✅ Staff knows how to use features

---

## 📞 Support

If you encounter issues during deployment:

1. Check the documentation:
   - `MENU_IMPROVEMENTS.md` - Technical details
   - `QUICK_START_GUIDE.md` - Setup guide
   - `VISUAL_CHANGES_GUIDE.md` - Visual reference
   - `CLIENT_README.md` - User guide

2. Common commands:
```bash
# Restart backend
npm run dev

# Rebuild frontend
npm run build

# Re-seed database
npm run seed:menu

# Check logs
pm2 logs restaurant-api
```

3. Verify environment:
- Node.js version: 18+
- MongoDB connection
- Environment variables set
- Ports not blocked

---

## 🔄 Rollback Plan

If something goes wrong:

1. **Restore Database**:
```bash
mongorestore --uri="your-mongodb-uri" backup-20251208
```

2. **Revert Code**:
```bash
git revert HEAD
git push origin main
```

3. **Redeploy Previous Version**:
- Use your platform's rollback feature
- Or deploy from previous git tag

---

**Deployment Date**: _____________
**Deployed By**: _____________
**Version**: 2.0
**Status**: Ready for Production

Good luck with your deployment! 🚀
