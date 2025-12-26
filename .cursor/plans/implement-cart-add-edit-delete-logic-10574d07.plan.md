<!-- 10574d07-b7e9-4884-8818-fd8721060a25 f5abccd2-5dec-4a94-ba7d-498e8473d7e8 -->

# Implement Cart Add/Edit/Delete Logic in Frontend

## Current State

- **Backend APIs**: Fully implemented (add, update, delete, clear, get cart)
- **Frontend Hooks**: `useAddToCart`, `useUpdateCartItem`, `useRemoveFromCart`, `useClearCart` are ready
- **Cart Page**: Update and remove functionality already working
- **Product Pages**: All 4 pages have mock `handleAddToCart` with TODO comments

## Implementation Plan

### 1. Update Product Pages with Real Add-to-Cart Logic

Replace mock implementations in all 4 product pages:

#### 1.1 Áo thun page (`apps/web/src/app/shop/ao-thun/page.tsx`)

- Import `useAddToCart` hook
- Replace mock `handleAddToCart` with real implementation
- Pass `productId`, `size` (selectedSize), and `quantity` to mutation
- Remove local `isAddingToCart` state, use `mutation.isPending` instead
- Add validation: ensure size is selected, quantity > 0, quantity <= stock
- Handle errors (already handled by hook with toast notifications)

#### 1.2 Pad chuột page (`apps/web/src/app/shop/pad-chuot/page.tsx`)

- Import `useAddToCart` hook
- Replace mock `handleAddToCart` with real implementation
- Pass `productId` and `quantity` (no size needed)
- Remove local `isAddingToCart` state, use `mutation.isPending` instead
- Add validation: quantity > 0, quantity <= stock

#### 1.3 Dây đeo page (`apps/web/src/app/shop/day-deo/page.tsx`)

- Same as Pad chuột (no size)

#### 1.4 Móc khóa page (`apps/web/src/app/shop/moc-khoa/page.tsx`)

- Same as Pad chuột (no size)

### 2. Implementation Details

**For products with sizes (Áo thun):**

```typescript
const addToCartMutation = useAddToCart();

const handleAddToCart = async () => {
  if (!product) return;

  // Validation
  if (!selectedSize) {
    toast.error('Vui lòng chọn size');
    return;
  }

  if (quantity <= 0 || quantity > selectedSizeStock) {
    toast.error('Số lượng không hợp lệ');
    return;
  }

  addToCartMutation.mutate({
    productId: product.id,
    size: selectedSize,
    quantity,
  });
};
```

**For products without sizes:**

```typescript
const addToCartMutation = useAddToCart();

const handleAddToCart = async () => {
  if (!product) return;

  // Validation
  if (quantity <= 0 || quantity > product.stock) {
    toast.error('Số lượng không hợp lệ');
    return;
  }

  addToCartMutation.mutate({
    productId: product.id,
    quantity,
  });
};
```

**Update ProductActions component usage:**

- Replace `isAddingToCart={isAddingToCart}` with `isAddingToCart={addToCartMutation.isPending}`
- Remove local `isAddingToCart` state

### 3. Cart Page (Already Working)

The cart page at `apps/web/src/app/cart/page.tsx` already has:

- ✅ Update quantity functionality (`useUpdateCartItem`)
- ✅ Remove item functionality (`useRemoveFromCart`)
- ✅ Proper loading states
- ✅ Error handling

No changes needed for cart page.

## Files to Modify

1. `apps/web/src/app/shop/ao-thun/page.tsx` - Add to cart with size
2. `apps/web/src/app/shop/pad-chuot/page.tsx` - Add to cart without size
3. `apps/web/src/app/shop/day-deo/page.tsx` - Add to cart without size
4. `apps/web/src/app/shop/moc-khoa/page.tsx` - Add to cart without size

## Testing Checklist

- [ ] Add to cart from Áo thun page (with size selection)
- [ ] Add to cart from Pad chuột page (no size)
- [ ] Add to cart from Dây đeo page (no size)
- [ ] Add to cart from Móc khóa page (no size)
- [ ] Validation: Cannot add with invalid quantity
- [ ] Validation: Cannot add Áo thun without selecting size
- [ ] Toast notifications appear on success/error
- [ ] Loading state shows during API call
- [ ] Cart updates immediately after adding
- [ ] Update quantity in cart page works
- [ ] Remove item from cart page works

## Notes

- The `useAddToCart` hook already handles:
  - API call
  - Cache invalidation (refetches cart)
  - Success toast notification
  - Error toast notification
- No need to manually manage cart state - TanStack Query handles it
- All error handling is done by the hook

### To-dos

- [ ] Implement add-to-cart logic in ao-thun page with size handling
- [ ] Implement add-to-cart logic in pad-chuot page (no size)
- [ ] Implement add-to-cart logic in day-deo page (no size)
- [ ] Implement add-to-cart logic in moc-khoa page (no size)
