# Summary of API Features Required for `/shop` Route

## 📋 Overview

This document lists all features in the frontend `/shop` route that need to be integrated with the backend API.

---

## 🏪 Route `/shop` (Shop Homepage)

**File:** `apps/web/src/app/shop/page.tsx`

### Current Features:

- Display Hero section
- Display TrustSection
- Display FeaturesGrid

### API Features Needed (if any):

1. **Featured Products List** (if dynamic)
   - **Endpoint:** `GET /api/products/featured`
   - **Purpose:** Get list of featured products to display in FeaturesGrid
   - **Priority:** Low (currently hardcoded)

---

## 📦 Route `/shop/[product-slug]` (Product Detail Page)

**Files:**

- `apps/web/src/app/shop/(shop)/ao-thun/page.tsx`
- `apps/web/src/app/shop/(shop)/pad-chuot/page.tsx`
- `apps/web/src/app/shop/(shop)/day-deo/page.tsx`
- `apps/web/src/app/shop/(shop)/moc-khoa/page.tsx`

**Note:** Product pages now use a shared `ProductPageContent` component located at `apps/web/src/app/shop/(shop)/ProductPageContent.tsx`

### API Features Needed:

#### 1. **Get Product Information** ⚠️ **PRIORITY: HIGH**

- **Endpoint:** `GET /api/products/:slug` or `GET /api/products/:id`
- **Purpose:** Get detailed product information (name, price, images, description, stock, sizes, rating, etc.)
- **Current:** Using static data from `@/data/products/*`
- **Code Location:**
  - Product pages: `apps/web/src/app/shop/(shop)/[product-slug]/page.tsx`
  - Shared component: `apps/web/src/app/shop/(shop)/ProductPageContent.tsx`
  - Product data fetching logic should be implemented in `ProductPageContent.tsx`
- **Changes Needed:** Fetch product data from API instead of importing static data

#### 2. **Add to Cart** ⚠️ **PRIORITY: HIGH**

- **Endpoint:** `POST /api/cart/add` or `POST /api/cart/items`
- **Purpose:** Add product to cart with size and quantity
- **Request body:**
  ```json
  {
    "productId": "ao-thun-wds",
    "slug": "ao-thun",
    "size": "M", // optional, only for products with sizes
    "quantity": 1,
    "price": 299000
  }
  ```
- **Current:** Only simulated with `setTimeout`, has TODO comment
- **Code Location:**
  - Component: `apps/web/src/app/shop/(shop)/ProductPageContent.tsx`
  - Add to cart logic should be implemented using the cart API hooks from `@/lib/api/hooks/use-cart`
- **Handling Needed:**
  - Success: Display success notification/toast
  - Error: Display error (out of stock, invalid, etc.)
  - Update cart count in Navbar (if available)

#### 3. **Buy Now** ⚠️ **PRIORITY: HIGH**

- **Endpoint:** `POST /api/orders/create` or `POST /api/checkout`
- **Purpose:** Create order immediately and redirect to checkout page
- **Request body:**
  ```json
  {
    "productId": "ao-thun-wds",
    "slug": "ao-thun",
    "size": "M", // optional
    "quantity": 1,
    "price": 299000
  }
  ```
- **Current:** Only `console.log`, has TODO comment
- **Code Location:**
  - Component: `apps/web/src/app/shop/(shop)/ProductPageContent.tsx`
  - Buy now logic should be implemented using the orders API hooks from `@/lib/api/hooks/use-orders`
- **Handling Needed:**
  - Create order/checkout session
  - Redirect to checkout page with order ID

#### 4. **Stock Check** ⚠️ **PRIORITY: MEDIUM**

- **Endpoint:** `GET /api/products/:id/stock` or in product detail response
- **Purpose:** Check real-time stock quantity
- **Current:** Using static `stock` from product data
- **Code Location:**
  - Component: `apps/web/src/app/shop/(shop)/ProductPageContent.tsx`
  - Stock data should be fetched from API using product hooks from `@/lib/api/hooks/use-products`
- **Handling Needed:**
  - Validate quantity does not exceed stock
  - Disable "Add to Cart" button if out of stock
  - Display "Out of Stock" message if stock = 0

#### 5. **Get Product Reviews/Ratings** ⚠️ **PRIORITY: MEDIUM**

- **Endpoint:** `GET /api/products/:id/reviews` or in product detail response
- **Purpose:** Get list of reviews and product rating
- **Current:** Using static `rating` from product data
- **Code Location:**
  - Component: `apps/web/src/app/shop/(shop)/ProductPageContent.tsx`
  - Rating data should be fetched from API using reviews hooks from `@/lib/api/hooks/use-reviews`
- **Handling Needed:**
  - Display average rating
  - Display number of reviews
  - Can be extended: Display detailed reviews list

#### 6. **Check Available Sizes** ⚠️ **PRIORITY: LOW**

- **Endpoint:** `GET /api/products/:id/sizes` or in product detail response
- **Purpose:** Check which sizes are in stock (if there is size-based stock logic)
- **Current:** Using static `sizes` array
- **Code Location:**
  - Component: `apps/web/src/app/shop/(shop)/ProductPageContent.tsx`
  - Size availability should be checked via product stock API from `@/lib/api/hooks/use-products`
- **Handling Needed:**
  - Disable sizes that are out of stock
  - Display "Out of Stock" badge for sizes without stock

---

## 🛒 Related Features (may be needed)

### 1. **Cart**

- **Endpoint:** `GET /api/cart` - Get list of items in cart
- **Endpoint:** `PUT /api/cart/items/:id` - Update quantity
- **Endpoint:** `DELETE /api/cart/items/:id` - Remove item from cart
- **Endpoint:** `GET /api/cart/count` - Get number of items (for badge in Navbar)

### 2. **Product Search**

- **Endpoint:** `GET /api/products/search?q=...` - Search products
- **Priority:** Low (no UI yet)

### 3. **Product Filtering**

- **Endpoint:** `GET /api/products?category=...&priceMin=...&priceMax=...` - Filter products
- **Priority:** Low (no UI yet)

---

## 📝 Technical Notes

### Files to Modify:

1. **Product Pages:**
   - `apps/web/src/app/shop/(shop)/ao-thun/page.tsx`
   - `apps/web/src/app/shop/(shop)/pad-chuot/page.tsx`
   - `apps/web/src/app/shop/(shop)/day-deo/page.tsx`
   - `apps/web/src/app/shop/(shop)/moc-khoa/page.tsx`
   - `apps/web/src/app/shop/(shop)/ProductPageContent.tsx` (shared component)

2. **Components:**
   - `apps/web/src/components/shop/ProductActions.tsx` - May need additional error handling
   - `apps/web/src/components/shop/ProductQuantitySelector.tsx` - Need to validate with stock from API
   - `apps/web/src/components/shop/ProductSizeSelector.tsx` - Need to disable out-of-stock sizes

3. **API Client:**
   - API client utilities are already available in `apps/web/src/lib/api/`
   - React Query hooks are already available in `apps/web/src/lib/api/hooks/`:
     - `use-products.ts` - Product data fetching
     - `use-cart.ts` - Cart operations
     - `use-orders.ts` - Order operations
     - `use-reviews.ts` - Review operations

### Error Handling Needed:

- **Network errors:** Display message "Cannot connect to server"
- **Validation errors:** Display error from API (out of stock, invalid size, etc.)
- **Authentication errors:** Redirect to login page if authentication required
- **Rate limiting:** Display message "Too many requests, please try again later"

### Loading States:

- Already have: `isAddingToCart` state in ProductActions
- Need to add: Loading state for product data fetch

---

## 🎯 Priority Summary

### **HIGH PRIORITY** (Need to implement immediately):

1. ✅ Get product information from API
2. ✅ Add to cart
3. ✅ Buy Now

### **MEDIUM PRIORITY** (Should have):

4. ⚠️ Real-time stock check
5. ⚠️ Get product reviews from API

### **LOW PRIORITY** (Can do later):

6. ℹ️ Check available sizes
7. ℹ️ Featured products list (if dynamic)
8. ℹ️ Product search and filtering

---

## 📌 TODO Comments in Code

**Note:** Product pages have been refactored to use a shared `ProductPageContent` component. TODO comments should be addressed in:

- `apps/web/src/app/shop/(shop)/ProductPageContent.tsx` - Main component handling all product page logic
- Individual product pages are now simple wrappers that pass the product slug to `ProductPageContent`

---

_Document automatically generated from frontend source code analysis - Updated: 2025_
