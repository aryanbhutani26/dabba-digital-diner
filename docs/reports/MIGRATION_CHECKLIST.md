# Migration Checklist

Use this checklist to track your migration progress from Supabase to MongoDB.

## Setup Phase

- [ ] MongoDB Atlas account created
- [ ] Cluster created and configured
- [ ] Database user created
- [ ] IP whitelist configured
- [ ] Connection string obtained
- [ ] Backend `.env` file configured
- [ ] Frontend `.env` file configured
- [ ] Backend dependencies installed (`cd server && npm install`)
- [ ] Database seeded (`npm run seed`)
- [ ] Setup verified (`npm run check`)

## Backend API

- [x] Express server created
- [x] MongoDB connection configured
- [x] Authentication routes (`/api/auth`)
- [x] Coupons routes (`/api/coupons`)
- [x] Navbar routes (`/api/navbar`)
- [x] Menu routes (`/api/menu`)
- [x] Settings routes (`/api/settings`)
- [x] JWT middleware
- [x] Admin authorization middleware
- [x] CORS configured
- [x] Error handling
- [ ] Input validation added
- [ ] Rate limiting added
- [ ] Logging implemented

## Frontend Updates

### Core Files
- [x] API client created (`src/lib/api.ts`)
- [x] `useAuth` hook updated
- [x] Environment variables configured

### Components
- [x] `Navbar.tsx` - Updated to use API
- [ ] `Footer.tsx` - Check if needs update
- [ ] `CartSheet.tsx` - Check if needs update
- [ ] `DishDialog.tsx` - Check if needs update
- [x] `ThemeToggle.tsx` - No update needed

### Admin Components
- [x] `EditCouponDialog.tsx` - Updated to use API
- [x] `EditMenuItemDialog.tsx` - Updated to use API
- [x] `EditNavItemDialog.tsx` - Updated to use API

### Pages
- [x] `Index.tsx` - Updated to use API
- [ ] `Menu.tsx` - Update to use API
- [ ] `About.tsx` - Check if needs update
- [ ] `Services.tsx` - Check if needs update
- [ ] `Contact.tsx` - Check if needs update
- [ ] `Reservations.tsx` - Check if needs update
- [ ] `Gallery.tsx` - Check if needs update
- [x] `Auth.tsx` - Updated to use API
- [x] `Admin.tsx` - Updated to use API
- [x] `NotFound.tsx` - No update needed

## Testing

- [ ] Backend server starts successfully
- [ ] Frontend connects to backend
- [ ] User can sign up
- [ ] User can sign in
- [ ] User can sign out
- [ ] Admin can access admin routes
- [ ] Regular user cannot access admin routes
- [ ] Coupons display on homepage
- [ ] Navbar items load correctly
- [ ] Menu items display
- [ ] Settings work correctly
- [ ] All CRUD operations work
- [ ] Error handling works
- [ ] Token refresh works
- [ ] Protected routes work

## Cleanup

- [ ] Remove Supabase dependencies
  - [ ] Remove `@supabase/supabase-js` from package.json
  - [ ] Delete `src/integrations/supabase/` folder
  - [ ] Remove Supabase env variables from `.env`
- [ ] Remove unused imports
- [ ] Update documentation
- [ ] Remove old migration files (if any)

## Production Deployment

### Backend
- [ ] Choose hosting platform (Railway, Render, Heroku, etc.)
- [ ] Set up production environment variables
- [ ] Configure production MongoDB connection
- [ ] Update CORS for production domain
- [ ] Enable HTTPS
- [ ] Set up monitoring/logging
- [ ] Configure auto-scaling (if needed)
- [ ] Set up CI/CD pipeline
- [ ] Deploy backend
- [ ] Test production API

### Frontend
- [ ] Update `VITE_API_URL` to production API
- [ ] Build production bundle
- [ ] Deploy to hosting (Vercel, Netlify, etc.)
- [ ] Test production frontend
- [ ] Verify API connection
- [ ] Test all features in production

## Security Hardening

- [ ] Change JWT_SECRET to strong random string
- [ ] Update CORS to specific origins
- [ ] Add rate limiting
- [ ] Add input validation
- [ ] Add request sanitization
- [ ] Enable HTTPS only
- [ ] Add security headers
- [ ] Implement password strength requirements
- [ ] Add account lockout after failed attempts
- [ ] Add email verification (optional)
- [ ] Add 2FA (optional)

## Performance Optimization

- [ ] Add MongoDB indexes
- [ ] Implement caching
- [ ] Optimize queries
- [ ] Add pagination
- [ ] Compress responses
- [ ] Optimize images
- [ ] Add CDN for static assets
- [ ] Monitor performance
- [ ] Set up database backups

## Documentation

- [x] QUICKSTART.md created
- [x] MONGODB_MIGRATION.md created
- [x] ARCHITECTURE.md created
- [x] MIGRATION_SUMMARY.md created
- [x] MIGRATION_CHECKLIST.md created
- [ ] API documentation created
- [ ] Update README.md
- [ ] Add inline code comments
- [ ] Create deployment guide

## Optional Enhancements

- [ ] Add real-time features (Socket.io)
- [ ] Add file upload (Cloudinary, S3)
- [ ] Add email service (SendGrid, Mailgun)
- [ ] Add payment integration (Stripe)
- [ ] Add analytics
- [ ] Add error tracking (Sentry)
- [ ] Add admin dashboard
- [ ] Add user profiles
- [ ] Add order management
- [ ] Add reservation system
- [ ] Add reviews/ratings

## Notes

Use this space to track issues, decisions, or important information:

```
Date: ___________
Issue: 
Solution:

Date: ___________
Issue:
Solution:

Date: ___________
Issue:
Solution:
```

## Progress Summary

- **Setup**: ___% complete
- **Backend**: ___% complete
- **Frontend**: ___% complete
- **Testing**: ___% complete
- **Deployment**: ___% complete
- **Overall**: ___% complete

## Estimated Timeline

- Setup: 1-2 hours
- Backend API: ✅ Complete
- Frontend Updates: 4-6 hours
- Testing: 2-3 hours
- Deployment: 2-4 hours
- **Total**: 10-15 hours

## Resources

- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Express.js Docs](https://expressjs.com/)
- [JWT.io](https://jwt.io/)
- [MongoDB Node Driver](https://mongodb.github.io/node-mongodb-native/)
- [QUICKSTART.md](./QUICKSTART.md)
- [MONGODB_MIGRATION.md](./MONGODB_MIGRATION.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
