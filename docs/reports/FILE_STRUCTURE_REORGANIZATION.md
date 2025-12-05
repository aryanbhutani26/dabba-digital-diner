# 📁 File Structure Reorganization Plan

## Current Structure Issues

1. ❌ All pages in one flat directory
2. ❌ Mixed authentication logic
3. ❌ No clear separation of concerns
4. ❌ Admin components scattered
5. ❌ No services layer
6. ❌ API calls mixed with components

## Proposed New Structure

### Frontend (`src/`)

```
src/
├── assets/                      # Static assets
│   ├── images/                  # Images
│   └── icons/                   # Icons
│
├── components/                  # Reusable components
│   ├── common/                  # Shared components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── ScrollToTop.tsx
│   │   └── ThemeToggle.tsx
│   │
│   ├── maps/                    # Map components
│   │   ├── LiveMap.tsx
│   │   └── MapMarker.tsx
│   │
│   ├── orders/                  # Order components
│   │   ├── OrderCard.tsx
│   │   ├── OrderTimeline.tsx
│   │   └── OrderDetails.tsx
│   │
│   ├── auth/                    # Auth components
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   ├── OTPInput.tsx
│   │   └── GoogleAuthButton.tsx
│   │
│   └── ui/                      # UI primitives (shadcn)
│       └── ...
│
├── features/                    # Feature-based modules
│   ├── admin/                   # Admin feature
│   │   ├── components/
│   │   │   ├── AddCouponDialog.tsx
│   │   │   ├── EditCouponDialog.tsx
│   │   │   └── ...
│   │   ├── pages/
│   │   │   └── AdminDashboard.tsx
│   │   └── hooks/
│   │       └── useAdminData.tsx
│   │
│   ├── delivery/                # Delivery feature
│   │   ├── components/
│   │   │   ├── DeliveryCard.tsx
│   │   │   └── LocationTracker.tsx
│   │   ├── pages/
│   │   │   ├── DeliveryDashboard.tsx
│   │   │   └── TrackOrder.tsx
│   │   └── hooks/
│   │       └── useDeliveryTracking.tsx
│   │
│   └── restaurant/              # Restaurant feature
│       ├── components/
│       │   ├── MenuCard.tsx
│       │   └── CouponCard.tsx
│       └── pages/
│           ├── Home.tsx
│           ├── Menu.tsx
│           └── About.tsx
│
├── services/                    # API services
│   ├── api/
│   │   ├── client.ts           # Base API client
│   │   ├── auth.service.ts     # Auth API calls
│   │   ├── orders.service.ts   # Orders API calls
│   │   ├── menu.service.ts     # Menu API calls
│   │   └── admin.service.ts    # Admin API calls
│   │
│   └── external/
│       ├── google-auth.ts      # Google OAuth
│       └── maps.ts             # Maps integration
│
├── hooks/                       # Global hooks
│   ├── useAuth.tsx
│   ├── useToast.ts
│   └── useMobile.tsx
│
├── lib/                         # Utilities
│   ├── utils.ts
│   ├── constants.ts
│   └── validators.ts
│
├── types/                       # TypeScript types
│   ├── auth.types.ts
│   ├── order.types.ts
│   ├── menu.types.ts
│   └── index.ts
│
├── routes/                      # Route configuration
│   ├── AppRoutes.tsx
│   ├── PrivateRoute.tsx
│   └── AdminRoute.tsx
│
├── App.tsx
├── main.tsx
└── index.css
```

### Backend (`server/`)

```
server/
├── config/                      # Configuration
│   ├── db.js
│   ├── auth.js
│   └── constants.js
│
├── middleware/                  # Middleware
│   ├── auth.js
│   ├── validation.js
│   ├── errorHandler.js
│   └── rateLimiter.js
│
├── routes/                      # API routes
│   ├── v1/                      # API version 1
│   │   ├── auth.routes.js
│   │   ├── orders.routes.js
│   │   ├── menu.routes.js
│   │   ├── admin.routes.js
│   │   └── index.js
│   └── index.js
│
├── controllers/                 # Route controllers
│   ├── auth.controller.js
│   ├── orders.controller.js
│   ├── menu.controller.js
│   └── admin.controller.js
│
├── services/                    # Business logic
│   ├── auth.service.js
│   ├── otp.service.js
│   ├── email.service.js
│   ├── orders.service.js
│   └── location.service.js
│
├── models/                      # Data models
│   ├── user.model.js
│   ├── order.model.js
│   ├── menu.model.js
│   └── coupon.model.js
│
├── utils/                       # Utilities
│   ├── jwt.util.js
│   ├── otp.util.js
│   ├── validators.util.js
│   └── helpers.js
│
├── scripts/                     # Utility scripts
│   ├── seed.js
│   ├── seed-orders.js
│   └── check-setup.js
│
├── tests/                       # Tests
│   ├── auth.test.js
│   └── orders.test.js
│
├── .env
├── .env.example
├── package.json
└── server.js
```

## Benefits of New Structure

### ✅ Frontend Benefits

1. **Feature-based organization**
   - Easy to find related code
   - Better code splitting
   - Clearer ownership

2. **Separation of concerns**
   - Components only handle UI
   - Services handle API calls
   - Hooks handle state logic

3. **Better scalability**
   - Add new features easily
   - No file name conflicts
   - Clear dependencies

4. **Improved maintainability**
   - Easier to navigate
   - Logical grouping
   - Better for teams

### ✅ Backend Benefits

1. **MVC-like pattern**
   - Routes → Controllers → Services
   - Clear data flow
   - Easy to test

2. **Reusable services**
   - Business logic separated
   - Can be used by multiple controllers
   - Easier to maintain

3. **Better error handling**
   - Centralized error middleware
   - Consistent error responses
   - Easier debugging

4. **API versioning**
   - Support multiple API versions
   - Backward compatibility
   - Gradual migrations

## Migration Strategy

### Phase 1: Backend Reorganization (Priority)
1. Create new folder structure
2. Move routes to controllers
3. Extract business logic to services
4. Add validation middleware
5. Update imports

### Phase 2: Frontend Reorganization
1. Create feature folders
2. Move pages to features
3. Extract API calls to services
4. Create shared components
5. Update imports

### Phase 3: Add New Features
1. Google OAuth
2. OTP Authentication
3. Enhanced validation
4. Better error handling

## Implementation Notes

### Don't Break Existing Code
- Keep old files until migration complete
- Test each module after moving
- Update imports gradually
- Use git branches

### Backward Compatibility
- Keep API endpoints same
- Don't change response formats
- Maintain database schema
- Update documentation

## Next Steps

1. ✅ Review this plan
2. ⏳ Implement backend reorganization
3. ⏳ Implement frontend reorganization
4. ⏳ Add Google OAuth
5. ⏳ Add OTP authentication
6. ⏳ Update documentation
7. ⏳ Test everything

---

**Note:** This is a comprehensive reorganization. We can implement it gradually without breaking existing functionality.

**Recommendation:** Start with backend reorganization first, then frontend, then add new auth features.
