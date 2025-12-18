# Bug Fix - Empty Select Value Error

## Issue
When trying to add a menu item in the Admin panel, the following error occurred:

```
Error: A <Select.Item /> must have a value prop that is not an empty string. 
This is because the Select value can be set to an empty string to clear the 
selection and show the placeholder.
```

## Root Cause
The subcategory dropdown had a `<SelectItem value="">None</SelectItem>` which is not allowed by Radix UI Select component. Empty strings cannot be used as values in Radix UI Select.

## Solution
Changed the "None" option to use `value="none"` instead of an empty string, and updated the logic to convert "none" back to an empty string when saving.

## Files Fixed

### 1. frontend/src/components/admin/AddMenuItemDialog.tsx
**Changes**:
- Changed `<SelectItem value="">None</SelectItem>` to `<SelectItem value="none">None</SelectItem>`
- Updated `onValueChange` handler to check for "none" value
- Updated `value` prop to use `formData.subcategory || "none"` as fallback
- When "none" is selected, sets subcategory to empty string

**Before**:
```tsx
<SelectItem value="">None</SelectItem>
```

**After**:
```tsx
<SelectItem value="none">None</SelectItem>
// And in the handler:
if (value === "none") {
  setFormData({ ...formData, subcategory: "" });
}
```

### 2. frontend/src/components/admin/EditMenuItemDialog.tsx
**Changes**:
- Changed `<SelectItem value="">None</SelectItem>` to `<SelectItem value="none">None</SelectItem>`
- Updated `value` prop to use `formData.subcategory || "none"` as fallback
- Updated `onValueChange` to convert "none" back to empty string

**Before**:
```tsx
<SelectItem value="">None</SelectItem>
value={formData.subcategory}
```

**After**:
```tsx
<SelectItem value="none">None</SelectItem>
value={formData.subcategory || "none"}
onValueChange={(value) => setFormData({ 
  ...formData, 
  subcategory: value === "none" ? "" : value 
})}
```

## Testing
After the fix:
1. ✅ Open Admin Panel → Menu tab
2. ✅ Click "Add Menu Item"
3. ✅ Dialog opens without errors
4. ✅ Subcategory dropdown works
5. ✅ Can select "None" option
6. ✅ Can select other subcategories
7. ✅ Can add custom subcategory
8. ✅ Menu item saves correctly

## Impact
- **Breaking Changes**: None
- **Data Migration**: Not required
- **Backward Compatibility**: Fully compatible
- **User Impact**: None (transparent fix)

## Status
✅ **Fixed and Tested**

The error is now resolved and the Add Menu Item dialog works correctly!
