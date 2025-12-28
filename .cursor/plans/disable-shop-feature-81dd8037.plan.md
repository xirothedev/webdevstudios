<!-- 81dd8037-9024-4146-9c75-497f2bd42b45 c7bfaa6d-d594-454d-9457-2a9ba480020b -->

# Disable Shop Feature - Redirect to 404

## Overview

Disable all e-commerce related pages by redirecting them to 404, and remove all shop navigation links from the UI.

## Scope

- **Pages to disable**: `/shop/*`, `/cart`, `/checkout`, `/orders/*`, `/payments/*`
- **Method**: Use Next.js `notFound()` to trigger 404 page
- **Navigation**: Remove shop links from Navbar and Footer
- **Sitemap**: Remove shop routes from sitemap

## Implementation Steps

### 1. Disable Shop Pages

Replace content of shop pages with `notFound()` call:

- `apps/web/src/app/shop/page.tsx` - Main shop page
- `apps/web/src/app/shop/(shop)/ao-thun/page.tsx` - Product pages
- `apps/web/src/app/shop/(shop)/moc-khoa/page.tsx`
- `apps/web/src/app/shop/(shop)/day-deo/page.tsx`
- `apps/web/src/app/shop/(shop)/pad-chuot/page.tsx`

### 2. Disable E-commerce Pages

Replace content with `notFound()`:

- `apps/web/src/app/cart/page.tsx` - Cart page
- `apps/web/src/app/checkout/page.tsx` - Checkout page
- `apps/web/src/app/orders/page.tsx` - Orders listing
- `apps/web/src/app/orders/[id]/page.tsx` - Order detail (if exists)
- `apps/web/src/app/payments/[id]/page.tsx` - Payment page (if exists)
- `apps/web/src/app/payments/cancel/page.tsx` - Payment cancel page

### 3. Remove Shop Navigation Links

Update `apps/web/src/components/Navbar.tsx`:

- Remove `{ label: 'Shop', href: '/shop' }` from main navigation
- Remove entire `shopItems` array and related dropdown menu

### 4. Remove Shop Footer Links

Update `apps/web/src/data/footer.ts`:

- Remove or empty the "SẢN PHẨM" section that contains shop product links

### 5. Update Sitemap

Update `apps/web/src/app/sitemap.ts`:

- Remove `/shop` route from sitemap

### 6. Remove Shop References in Other Components

Update components that link to shop:

- `apps/web/src/components/FeaturesGrid.tsx` - Remove or disable product links
- `apps/web/src/components/Hero.tsx` - Remove shop image references (if any)
- `apps/web/src/app/not-found.tsx` - Remove shop link from 404 page suggestions

### 7. Disable FloatingCartButton

Update `apps/web/src/app/shop/layout.tsx`:

- Remove `<FloatingCartButton />` since shop is disabled

## Files to Modify

### Pages (Redirect to 404)

- `apps/web/src/app/shop/page.tsx`
- `apps/web/src/app/shop/(shop)/ao-thun/page.tsx`
- `apps/web/src/app/shop/(shop)/moc-khoa/page.tsx`
- `apps/web/src/app/shop/(shop)/day-deo/page.tsx`
- `apps/web/src/app/shop/(shop)/pad-chuot/page.tsx`
- `apps/web/src/app/cart/page.tsx`
- `apps/web/src/app/checkout/page.tsx`
- `apps/web/src/app/orders/page.tsx`

### Navigation & UI

- `apps/web/src/components/Navbar.tsx`
- `apps/web/src/data/footer.ts`
- `apps/web/src/app/shop/layout.tsx`
- `apps/web/src/components/FeaturesGrid.tsx`
- `apps/web/src/components/Hero.tsx`
- `apps/web/src/app/not-found.tsx`

### Configuration

- `apps/web/src/app/sitemap.ts`

## Implementation Pattern

For each page, replace content with:

```typescript
import { notFound } from 'next/navigation';

export default function PageName() {
  notFound();
}
```

This will trigger Next.js 404 page automatically.

## Notes

- Shop components in `src/components/shop/` will remain but unused
- API endpoints remain unchanged (only frontend is disabled)
- Users accessing shop URLs will see 404 page
- Navigation and footer will no longer show shop links

### To-dos

- [ ] Replace shop pages (main + 4 product pages) with notFound() redirect
- [ ] Replace cart, checkout, orders pages with notFound() redirect
- [ ] Remove shop links from Navbar component
- [ ] Remove shop product links from Footer data
- [ ] Remove /shop route from sitemap
- [ ] Remove shop links from FeaturesGrid, Hero, and not-found pages
- [ ] Remove FloatingCartButton from shop layout
