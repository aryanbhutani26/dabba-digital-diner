# Urgent Fixes Required

## Issues Identified:

### 1. Map Zoom Resetting Every Few Seconds
**Problem**: Map recreates completely on every data fetch (every 10 seconds)
**Location**: `frontend/src/components/LiveMap.tsx`
**Fix**: Prevent map recreation, only update markers

### 2. Restaurant Location
**Problem**: Using Bangalore coordinates
**Current**: `{ latitude: 12.9352, longitude: 77.6245 }`
**Required**: `180 High Street, Orpington, BR6 0JW, United Kingdom`
**Coordinates**: `{ latitude: 51.3727, longitude: 0.0985 }`

### 3. Address Display Error
**Problem**: Addresses stored as objects `{address, coordinates}` but rendered as strings
**Error**: "Objects are not valid as a React child"
**Location**: Account page, CartSheet
**Fix**: Extract `.address` property when displaying

### 4. User Location Detection
**Problem**: Showing Bangalore instead of actual location
**Fix**: Use browser geolocation API properly

### 5. Menu Items Data Error
**Problem**: `menuItemsData.find is not a function`
**Location**: Index.tsx or Admin page
**Fix**: Ensure data is array before using `.find()`

---

## Priority Fixes:

I'll create the fixes now. These are critical for production.
