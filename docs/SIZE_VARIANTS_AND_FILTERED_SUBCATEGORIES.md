# Size Variants & Filtered Subcategories - Feature Guide

## 🎉 New Features Added

### 1. Category-Filtered Subcategories
Subcategories now filter based on the selected category, showing only relevant options.

### 2. Size Variants (Small, Medium, Large)
Menu items can now have multiple size options with different prices.

---

## Feature 1: Category-Filtered Subcategories

### How It Works

**Before**: All subcategories showed regardless of selected category
**After**: Only relevant subcategories show for each category

### Category → Subcategory Mapping

```
Mains
├── Tandoori Items
├── Rice
├── Curries
└── Breads

Lunch
├── Appetizers
└── Lunch Specials

Drinks
├── Hot Drinks
├── Cold Drinks
└── Beverages

Desserts
└── (No predefined subcategories)
```

### User Experience

1. **Select Category First**
   - Subcategory dropdown is disabled until category is selected
   - Shows message: "Select category first"

2. **Category Selected**
   - Subcategory dropdown becomes enabled
   - Shows only relevant subcategories for that category
   - Displays helper text: "Showing subcategories for: [Category Name]"

3. **Change Category**
   - Subcategory automatically resets
   - New relevant subcategories load

### Example Flow

```
Step 1: Select "Mains" category
        ↓
Step 2: Subcategory shows:
        - None
        - Tandoori Items
        - Rice
        - Curries
        - Breads
        - + Add New Subcategory

Step 3: Change to "Drinks" category
        ↓
Step 4: Subcategory resets and shows:
        - None
        - Hot Drinks
        - Cold Drinks
        - Beverages
        - + Add New Subcategory
```

---

## Feature 2: Size Variants

### What Are Size Variants?

Size variants allow a single menu item to have multiple size options (Small, Medium, Large) with different prices.

### Use Cases

Perfect for items like:
- **Pizzas**: Small (£8.99), Medium (£12.99), Large (£16.99)
- **Drinks**: Small (£2.99), Medium (£3.99), Large (£4.99)
- **Curries**: Small (£9.99), Medium (£13.99), Large (£17.99)
- **Portions**: Half (£6.99), Full (£11.99)

### How to Add Item with Variants

#### Step 1: Enable Variants
1. Open "Add Menu Item" dialog
2. Find "Multiple Sizes/Variants" checkbox
3. Check the box

#### Step 2: Set Variant Prices
Default variants appear:
- Small: [Enter price]
- Medium: [Enter price]
- Large: [Enter price]

#### Step 3: Customize (Optional)
- Change size names (e.g., "Half" instead of "Small")
- Add more sizes with "+ Add Another Size" button
- Leave prices empty for sizes you don't want

#### Step 4: Save
- At least one variant must have a price
- Item saves with all variants

### Database Structure

#### Without Variants
```javascript
{
  name: "Butter Chicken",
  price: 13.99,
  hasVariants: false
}
```

#### With Variants
```javascript
{
  name: "Butter Chicken",
  hasVariants: true,
  variants: [
    { size: "Small", price: 9.99 },
    { size: "Medium", price: 13.99 },
    { size: "Large", price: 17.99 }
  ]
}
```

### Display on Menu Page

#### Single Price Item
```
┌─────────────────────────────────┐
│ Butter Chicken                  │
│ Rich tomato curry...            │
│                         £13.99  │
└─────────────────────────────────┘
```

#### Variant Price Item (Menu Card)
```
┌─────────────────────────────────┐
│ Butter Chicken                  │
│ Rich tomato curry...            │
│                   From £9.99    │
└─────────────────────────────────┘
```

#### Variant Selection (Dish Dialog)
```
┌─────────────────────────────────┐
│ Butter Chicken                  │
│ Rich tomato curry...            │
│                                 │
│ Select Size:                    │
│ ○ Small         £9.99           │
│ ● Medium        £13.99          │
│ ○ Large         £17.99          │
│                                 │
│ Quantity: [-] 2 [+]             │
│ Total: £27.98                   │
│ [Add to Cart]                   │
└─────────────────────────────────┘
```

---

## Implementation Details

### Files Modified

#### 1. frontend/src/components/admin/AddMenuItemDialog.tsx

**Changes**:
- Added `hasVariants` checkbox
- Added `variants` state array
- Added variant input fields
- Added "Add Another Size" button
- Implemented category-filtered subcategories
- Updated submit handler to save variants

**New State**:
```typescript
const [variants, setVariants] = useState([
  { size: "Small", price: "" },
  { size: "Medium", price: "" },
  { size: "Large", price: "" },
]);
```

**Subcategory Filtering**:
```typescript
const predefinedSubcategories: Record<string, string[]> = {
  "Mains": ["Tandoori Items", "Rice", "Curries", "Breads"],
  "Lunch": ["Appetizers", "Lunch Specials"],
  "Drinks": ["Hot Drinks", "Cold Drinks", "Beverages"],
  "Desserts": []
};

const getSubcategoriesForCategory = (category: string) => {
  const predefined = predefinedSubcategories[category] || [];
  const existing = allSubcategories.find(s => s.category === category)?.subcategories || [];
  return [...new Set([...predefined, ...existing])];
};
```

#### 2. frontend/src/pages/Menu.tsx

**Changes**:
- Updated item display to show "From £X.XX" for variant items
- Shows minimum price from all variants
- Applied to both search results and category tabs
- Updated cart handling to include size information

**Display Logic**:
```typescript
{item.hasVariants && item.variants ? (
  <div className="text-right">
    <span className="text-xl md:text-2xl font-bold text-accent">
      From £{Math.min(...item.variants.map((v: any) => v.price)).toFixed(2)}
    </span>
  </div>
) : (
  <span className="text-xl md:text-2xl font-bold text-accent">
    £{item.price.toFixed(2)}
  </span>
)}
```

**Cart Handling**:
```typescript
const handleAddToCart = (dish: Dish, quantity: number) => {
  setCartItems(prevItems => {
    // For items with variants, include size in the comparison
    const itemKey = (dish as any).selectedSize 
      ? `${dish.name}-${(dish as any).selectedSize}` 
      : dish.name;
    
    const existingItemIndex = prevItems.findIndex(item => {
      const existingKey = item.selectedSize 
        ? `${item.name}-${item.selectedSize}` 
        : item.name;
      return existingKey === itemKey;
    });
    
    if (existingItemIndex > -1) {
      const newItems = [...prevItems];
      newItems[existingItemIndex].quantity += quantity;
      return newItems;
    }
    
    return [...prevItems, {
      name: dish.name,
      price: dish.price,
      quantity,
      image: dish.image,
      selectedSize: (dish as any).selectedSize,
    }];
  });
};
```

#### 3. frontend/src/components/DishDialog.tsx

**Changes**:
- Added size selection UI with radio buttons
- Shows all available sizes with prices
- Calculates total based on selected size
- Passes selected size to cart

**Size Selection UI**:
```typescript
{dish.hasVariants && dish.variants && dish.variants.length > 0 && (
  <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
    <Label className="text-base font-semibold">Select Size</Label>
    <RadioGroup 
      value={selectedVariant.toString()} 
      onValueChange={(value) => setSelectedVariant(parseInt(value))}
      className="space-y-2"
    >
      {dish.variants.map((variant, index) => (
        <div key={index} className="flex items-center space-x-3">
          <RadioGroupItem value={index.toString()} id={`variant-${index}`} />
          <Label 
            htmlFor={`variant-${index}`} 
            className="flex-1 flex items-center justify-between cursor-pointer py-2"
          >
            <span className="font-medium">{variant.size}</span>
            <span className="text-lg font-bold text-accent">£{variant.price.toFixed(2)}</span>
          </Label>
        </div>
      ))}
    </RadioGroup>
  </div>
)}
```

#### 4. frontend/src/components/CartSheet.tsx

**Changes**:
- Updated CartItem interface to include selectedSize
- Displays size information in cart
- Includes size in order data
- Appends size to item name in final order

**Cart Display**:
```typescript
<h4 className="font-semibold mb-2">
  {item.name}
  {item.selectedSize && (
    <span className="text-sm text-muted-foreground ml-2">({item.selectedSize})</span>
  )}
</h4>
```

---

## Usage Guide

### For Restaurant Staff

#### Adding Item with Single Price
1. Click "Add Menu Item"
2. Fill in name, description
3. Select category
4. Select subcategory (filtered by category)
5. Enter single price
6. Save

#### Adding Item with Multiple Sizes
1. Click "Add Menu Item"
2. Fill in name, description
3. Select category
4. Select subcategory (filtered by category)
5. **Check "Multiple Sizes/Variants"**
6. Enter prices for each size:
   - Small: £9.99
   - Medium: £13.99
   - Large: £17.99
7. (Optional) Click "+ Add Another Size" for more options
8. Save

#### Changing Category
- When you change category, subcategory automatically resets
- Select new subcategory from filtered list

---

## Validation Rules

### Subcategories
- ✅ Can be empty (None)
- ✅ Must belong to selected category
- ✅ Can add custom subcategory

### Variants
- ✅ At least one variant must have a price
- ✅ Size names can be customized
- ✅ Can have 2-10 variants
- ✅ Prices must be positive numbers

### Category Selection
- ✅ Must select category before subcategory
- ✅ Changing category resets subcategory

---

## Examples

### Example 1: Pizza with Sizes
```
Name: Margherita Pizza
Category: Mains
Subcategory: None
Has Variants: Yes
Variants:
  - Small (9"): £8.99
  - Medium (12"): £12.99
  - Large (15"): £16.99
```

### Example 2: Curry with Portions
```
Name: Chicken Tikka Masala
Category: Mains
Subcategory: Curries
Has Variants: Yes
Variants:
  - Half Portion: £7.99
  - Full Portion: £13.99
```

### Example 3: Drink Sizes
```
Name: Mango Lassi
Category: Drinks
Subcategory: Cold Drinks
Has Variants: Yes
Variants:
  - Small: £2.99
  - Medium: £3.99
  - Large: £4.99
```

### Example 4: Single Price Item
```
Name: Gulab Jamun
Category: Desserts
Subcategory: None
Has Variants: No
Price: £5.99
```

---

## Benefits

### Category-Filtered Subcategories
✅ **Cleaner Interface**: Only relevant options shown
✅ **Faster Selection**: Less scrolling through options
✅ **Fewer Errors**: Can't select wrong subcategory
✅ **Better Organization**: Clear category structure
✅ **Automatic Reset**: Prevents invalid combinations

### Size Variants
✅ **Flexible Pricing**: Different sizes, different prices
✅ **Single Item Management**: One item, multiple sizes
✅ **Clear Display**: Customers see all options
✅ **Easy Updates**: Change all sizes in one place
✅ **Better UX**: Customers can compare sizes

---

## Testing Checklist

### Subcategory Filtering
- [x] Subcategory disabled when no category selected
- [x] Subcategory shows correct options for Mains
- [x] Subcategory shows correct options for Lunch
- [x] Subcategory shows correct options for Drinks
- [x] Subcategory shows correct options for Desserts
- [x] Subcategory resets when category changes
- [x] Can add custom subcategory
- [x] Helper text shows current category

### Size Variants - Admin
- [x] Checkbox toggles variant mode
- [x] Default 3 variants appear
- [x] Can edit variant names
- [x] Can edit variant prices
- [x] Can add more variants
- [x] Validation prevents saving without prices

### Size Variants - Menu Display
- [x] Menu cards show "From £X.XX" for variant items
- [x] Single price items still work
- [x] Search results show "From" price
- [x] Category tabs show "From" price

### Size Variants - Dish Dialog
- [x] Size selection UI appears for variant items
- [x] Radio buttons show all sizes with prices
- [x] Can select different sizes
- [x] Total price updates based on selected size
- [x] Selected size passed to cart

### Size Variants - Cart
- [x] Cart shows item with size (e.g., "Butter Chicken (Medium)")
- [x] Same item with different sizes treated separately
- [x] Size information included in order
- [x] Order confirmation shows size

---

## Troubleshooting

### Subcategory Not Showing
**Problem**: Subcategory dropdown is empty
**Solution**: 
1. Make sure category is selected
2. Check if category has predefined subcategories
3. Try adding custom subcategory

### Variants Not Saving
**Problem**: Error when saving variants
**Solution**:
1. Ensure at least one variant has a price
2. Check prices are valid numbers
3. Verify all required fields are filled

### Wrong Subcategories Showing
**Problem**: Seeing subcategories from other categories
**Solution**:
1. Refresh the page
2. Re-select the category
3. Check database for correct category assignments

---

## Future Enhancements

### Possible Additions
1. **Variant Images**: Different image for each size
2. **Variant Descriptions**: Size-specific descriptions
3. **Combo Variants**: Mix and match options
4. **Quantity Limits**: Max orders per size
5. **Dynamic Subcategories**: Admin can manage mappings
6. **Bulk Edit**: Update multiple variants at once

---

## Summary

### What Changed
✅ Subcategories now filter by selected category
✅ Menu items can have multiple size variants
✅ Prices display correctly for both types
✅ Admin interface is more intuitive
✅ Better data organization

### Impact
- **For Admins**: Easier menu management
- **For Customers**: Clearer pricing options
- **For Business**: More flexible menu structure

---

**Version**: 2.2
**Date**: December 9, 2025
**Status**: ✅ Complete and Tested

### Recent Updates (v2.2)
- ✅ Menu cards now show "From £X.XX" instead of listing all prices
- ✅ Added size selection UI in dish dialog with radio buttons
- ✅ Cart properly handles items with different sizes
- ✅ Size information included in orders
- ✅ Same item with different sizes treated as separate cart items
