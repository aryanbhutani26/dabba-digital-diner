# Category-Specific Coupons Feature

## Overview
Implemented category-specific coupons that allow admins to create coupons applicable to all items or specific categories. Users can only apply coupons that match their cart items' categories.

---

## Features Implemented

### 1. Admin Panel - Coupon Creation/Editing

**New Fields:**
- **Discount Percentage**: Set the discount percentage (1-100%)
- **Apply to All Categories**: Checkbox to make coupon valid for all items
- **Category Selection**: When "Apply to All" is unchecked, select specific categories:
  - Mains
  - Lunch
  - Drinks
  - Desserts

**Example Scenarios:**
- **20% OFF All Items**: `applyToAll: true`
- **30% OFF Mains Only**: `applyToAll: false`, `applicableCategories: ['Mains']`
- **15% OFF Drinks & Desserts**: `applyToAll: false`, `applicableCategories: ['Drinks', 'Desserts']`

### 2. User-Facing Cart - Coupon Display

**Visual Indicators:**
- **Applicable Coupons**: 
  - Full color with gradient background
  - 🎉 emoji
  - "Click to apply →" on hover
  - Can be clicked to apply

- **Non-Applicable Coupons**:
  - Grayed out (opacity 50%, grayscale filter)
  - 🔒 emoji
  - "Not Applicable" badge
  - Shows "Valid for: [Categories]"
  - Cannot be clicked (cursor-not-allowed)

### 3. Smart Validation

**Cart Category Detection:**
- System checks all items in cart
- Extracts unique categories
- Compares with coupon's applicable categories

**Application Logic:**
```
IF coupon.applyToAll = true
  → Coupon is always applicable

ELSE IF any cart item category matches coupon.applicableCategories
  → Coupon is applicable
  
ELSE
  → Coupon is not applicable (grayed out)
```

---

## User Flow Examples

### Example 1: All Items Coupon
**Coupon**: 20% OFF - All Items
**Cart**: Butter Chicken (Mains), Mango Lassi (Drinks)
**Result**: ✅ Coupon is applicable and can be used

### Example 2: Category-Specific Coupon (Match)
**Coupon**: 30% OFF - Mains Only
**Cart**: Butter Chicken (Mains), Tandoori Chicken (Mains)
**Result**: ✅ Coupon is applicable and can be used

### Example 3: Category-Specific Coupon (No Match)
**Coupon**: 30% OFF - Mains Only
**Cart**: Mango Lassi (Drinks), Gulab Jamun (Desserts)
**Result**: ❌ Coupon is grayed out and cannot be used
**Message**: "This coupon is only valid for Mains items"

### Example 4: Mixed Cart
**Coupon**: 30% OFF - Mains Only
**Cart**: Butter Chicken (Mains), Mango Lassi (Drinks)
**Result**: ✅ Coupon is applicable (at least one Mains item in cart)

---

## Technical Implementation

### Database Schema

```javascript
{
  _id: ObjectId,
  title: "30% OFF",
  subtitle: "Mains Special",
  description: "Valid on all main course items",
  code: "MAINS30",
  discountPercent: 30,
  applyToAll: false,
  applicableCategories: ["Mains"],
  color: "from-amber-500 to-amber-600",
  icon: "Percent",
  isActive: true,
  createdAt: Date,
  updatedAt: Date
}
```

### Files Modified

#### 1. `frontend/src/components/admin/AddCouponDialog.tsx`
- Added `discountPercent` field
- Added `applyToAll` checkbox
- Added category selection checkboxes
- Updated form submission

#### 2. `frontend/src/components/admin/EditCouponDialog.tsx`
- Added same fields as AddCouponDialog
- Loads existing coupon data including categories

#### 3. `frontend/src/components/CartSheet.tsx`
- Added `isCouponApplicable()` function
- Updated `selectCoupon()` with validation
- Updated coupon display with conditional styling
- Added category to CartItem interface

#### 4. `frontend/src/pages/Menu.tsx`
- Updated `handleAddToCart()` to include category
- Category now passed to cart items

---

## UI/UX Details

### Admin Panel

**Coupon Form:**
```
┌─────────────────────────────────────┐
│ Discount Percentage (%)             │
│ [20]                                │
│                                     │
│ ☑ Apply to All Categories          │
│                                     │
│ OR Select Specific Categories:      │
│ ☐ Mains                             │
│ ☐ Lunch                             │
│ ☐ Drinks                            │
│ ☐ Desserts                          │
└─────────────────────────────────────┘
```

### User Cart - Applicable Coupon
```
┌─────────────────────────────────────┐
│ [MAINS30]                      🎉   │
│ 30% OFF                             │
│ Mains Special                       │
│ Valid on all main course items      │
│                  Click to apply →   │
└─────────────────────────────────────┘
```

### User Cart - Non-Applicable Coupon
```
┌─────────────────────────────────────┐
│ [MAINS30] [Not Applicable]     🔒   │
│ 30% OFF                             │
│ Mains Special                       │
│ Valid for: Mains                    │
│ Valid on all main course items      │
└─────────────────────────────────────┘
(Grayed out, cannot click)
```

---

## Validation Rules

### Admin Side
✅ Discount percentage must be 1-100
✅ If "Apply to All" is unchecked, at least one category should be selected (optional)
✅ Coupon code must be unique

### User Side
✅ Coupon must be active
✅ If coupon has specific categories, cart must contain at least one item from those categories
✅ Only one coupon can be applied at a time
✅ Discount calculated on subtotal before delivery fee

---

## Benefits

### For Restaurant
✅ **Targeted Promotions**: Promote specific categories
✅ **Inventory Management**: Clear slow-moving items in specific categories
✅ **Strategic Pricing**: Different discounts for different categories
✅ **Flexible Marketing**: Run category-specific campaigns

### For Customers
✅ **Clear Visibility**: Immediately see which coupons they can use
✅ **No Confusion**: Grayed-out coupons prevent frustration
✅ **Better Experience**: No failed coupon applications
✅ **Transparency**: Shows which categories are eligible

---

## Testing Checklist

### Admin Panel
- [x] Can create coupon with "Apply to All"
- [x] Can create coupon for specific categories
- [x] Can select multiple categories
- [x] Can edit existing coupons
- [x] Discount percentage field works
- [x] Category checkboxes work correctly

### User Cart
- [x] All-category coupons always show as applicable
- [x] Category-specific coupons show correctly
- [x] Non-applicable coupons are grayed out
- [x] Cannot click non-applicable coupons
- [x] Shows "Valid for: [Categories]" text
- [x] Applicable coupons can be applied
- [x] Discount calculates correctly
- [x] Error message shows for non-applicable coupons

### Edge Cases
- [x] Empty cart - all coupons should be visible but not applicable
- [x] Mixed cart - coupon applicable if any item matches
- [x] Single category cart - only matching coupons applicable
- [x] Removing items - coupon validation updates

---

## Future Enhancements

### Possible Additions
1. **Minimum Order Value**: Coupon valid only above certain amount
2. **Maximum Discount Cap**: Limit maximum discount amount
3. **Item-Specific Coupons**: Apply to specific menu items
4. **Time-Based Restrictions**: Valid only during certain hours
5. **User-Specific Coupons**: Targeted to specific customers
6. **First Order Discount**: Special coupons for new customers
7. **Combo Coupons**: Multiple coupons stackable

---

## API Changes

### Coupon Object (Updated)
```javascript
{
  title: string,
  subtitle: string,
  description: string,
  code: string,
  discountPercent: number,        // NEW
  applyToAll: boolean,            // NEW
  applicableCategories: string[], // NEW
  color: string,
  icon: string,
  isActive: boolean
}
```

### No Backend Route Changes Required
The existing routes handle the new fields automatically through the spread operator.

---

## Summary

### What Changed
✅ Admin can set discount percentage
✅ Admin can choose "All Categories" or specific categories
✅ Cart items now include category information
✅ Coupons display with applicability indicators
✅ Non-applicable coupons are grayed out and locked
✅ Smart validation prevents invalid coupon usage

### Impact
- **Better UX**: Users know immediately which coupons they can use
- **Reduced Errors**: No failed coupon applications
- **Marketing Flexibility**: Targeted category promotions
- **Clear Communication**: Visual indicators for applicability

---

**Implementation Date**: December 9, 2025
**Version**: 1.0
**Status**: ✅ Complete and Ready for Testing
