<!-- 5b662329-dacb-46f2-9ffb-6b58f8a9da93 c7eba81c-e30a-431e-a8d0-6bdea22b621f -->

# Chiến lược triển khai: Đặt hàng, Hiển thị tồn kho, và Review

## Phân tích hiện trạng

### Frontend (`apps/web`)

- **Shop Pages**: Đã có 4 product pages (`ao-thun`, `pad-chuot`, `day-deo`, `moc-khoa`) với: - `ProductActions`: Nút "Thêm vào giỏ hàng" và "Mua ngay" (chưa có logic thực tế) - `ProductQuantitySelector`: Chọn số lượng (hardcoded max=10, chưa check stock) - `ProductSizeSelector`: Chọn size cho áo thun (chưa check stock theo size) - `ProductInfo`: Hiển thị rating (hardcoded từ data) - Data tĩnh từ `@/data/products/*` (chưa fetch từ API)

### Backend (`apps/api`)

- **Database Schema**: Đã có đầy đủ: - `Product` với `stock`, `hasSizes`, `ratingValue`, `ratingCount` - `ProductSizeStock` cho quản lý stock theo size (áo thun) - `Cart` và `CartItem` cho giỏ hàng - `Order` và `OrderItem` cho đơn hàng - `Review` cho đánh giá sản phẩm
- **Module Structure**: Chưa có modules cho `products`, `orders`, `cart`, `reviews`
- **CQRS Pattern**: Đã áp dụng trong `users` module, cần áp dụng tương tự

## Chiến lược triển khai

### Phase 1: Backend - Products Module

#### 1.1 Products Module Structure

```
apps/api/src/products/
├── products.module.ts
├── products.controller.ts
├── commands/
│   ├── update-product-stock/
│   └── update-product-rating/
├── queries/
│   ├── get-product-by-slug/
│   ├── list-products/
│   └── get-product-stock/
├── dtos/
│   ├── product.dto.ts
│   └── stock.dto.ts
└── infrastructure/
    └── product.repository.ts
```

#### 1.2 API Endpoints

- `GET /products` - List all products (public)
- `GET /products/:slug` - Get product by slug với stock info
- `GET /products/:slug/stock` - Get stock info (theo size nếu có)
- `PATCH /products/:id/stock` - Update stock (Admin only)

#### 1.3 Key Features

- Query product với stock real-time từ database
- Tính toán stock theo size cho áo thun
- Aggregate rating từ reviews table
- Return stock status (in stock, low stock, out of stock)

### Phase 2: Backend - Cart Module

#### 2.1 Cart Module Structure

```
apps/api/src/cart/
├── cart.module.ts
├── cart.controller.ts
├── commands/
│   ├── add-to-cart/
│   ├── update-cart-item/
│   ├── remove-from-cart/
│   └── clear-cart/
├── queries/
│   └── get-cart/
└── dtos/
    └── cart.dto.ts
```

#### 2.2 API Endpoints

- `GET /cart` - Get user's cart (authenticated)
- `POST /cart/items` - Add item to cart
- `PATCH /cart/items/:id` - Update cart item quantity
- `DELETE /cart/items/:id` - Remove item from cart
- `DELETE /cart` - Clear cart

#### 2.3 Key Features

- Validate stock trước khi add to cart
- Check stock theo size cho áo thun
- Prevent adding out-of-stock items
- Auto-merge items với cùng product + size

### Phase 3: Backend - Orders Module

#### 3.1 Orders Module Structure

```
apps/api/src/orders/
├── orders.module.ts
├── orders.controller.ts
├── commands/
│   ├── create-order/
│   ├── update-order-status/
│   └── cancel-order/
├── queries/
│   ├── get-order-by-id/
│   ├── list-orders/
│   └── get-order-history/
└── dtos/
    └── order.dto.ts
```

#### 3.2 API Endpoints

- `POST /orders` - Create order from cart (authenticated)
- `GET /orders/:id` - Get order details (owner or admin)
- `GET /orders` - List user's orders (authenticated)
- `PATCH /orders/:id/status` - Update order status (Admin only)
- `PATCH /orders/:id/cancel` - Cancel order (owner only, nếu status = PENDING)

#### 3.3 Key Features

- Create order từ cart items
- Validate và reserve stock khi tạo order
- Deduct stock sau khi order confirmed
- Generate order code (VD: #ORD-1234)
- Snapshot product data vào OrderItem
- Calculate shipping fee (miễn phí > 500k)
- Update stock sau khi order confirmed

### Phase 4: Backend - Reviews Module

#### 4.1 Reviews Module Structure

```
apps/api/src/reviews/
├── reviews.module.ts
├── reviews.controller.ts
├── commands/
│   ├── create-review/
│   ├── update-review/
│   └── delete-review/
├── queries/
│   ├── get-product-reviews/
│   └── get-user-review/
└── dtos/
    └── review.dto.ts
```

#### 4.2 API Endpoints

- `POST /products/:slug/reviews` - Create review (authenticated, chỉ user đã mua)
- `GET /products/:slug/reviews` - Get product reviews (public, paginated)
- `PATCH /reviews/:id` - Update own review
- `DELETE /reviews/:id` - Delete own review
- `GET /reviews/me` - Get user's reviews

#### 4.3 Key Features

- Validate user đã mua sản phẩm trước khi review
- Auto-update product rating khi có review mới
- Recalculate `ratingValue` và `ratingCount` trên Product
- Pagination cho reviews list

### Phase 5: Frontend - API Integration

#### 5.1 API Client Functions

Tạo `apps/web/src/lib/api/products.ts`, `api/cart.ts`, `api/orders.ts`, `api/reviews.ts`:

- Type-safe API functions sử dụng `apiClient`
- Error handling
- TypeScript types matching backend DTOs

#### 5.2 Product Pages Updates

- Replace hardcoded data với API calls
- Fetch real-time stock từ API
- Display stock status (còn hàng, sắp hết, hết hàng)
- Disable add to cart nếu out of stock
- Show stock theo size cho áo thun

#### 5.3 Cart Integration

- Implement `handleAddToCart` với API call
- Show cart count badge trên Navbar
- Create cart page (`/cart`) để xem và edit cart
- Real-time stock validation khi add to cart

#### 5.4 Checkout Flow

- Create checkout page (`/checkout`)
- Form nhập shipping address
- Review order summary
- Create order API call
- Order confirmation page (`/orders/:id`)

#### 5.5 Reviews Display

- Component `ProductReviews` để hiển thị reviews
- Component `ReviewForm` để submit review (chỉ hiện sau khi đã mua)
- Show average rating từ API
- Pagination cho reviews list

## Data Flow

### Order Placement Flow

```
User clicks "Mua ngay" / "Thêm vào giỏ"
  ↓
Frontend: Validate stock (optional check)
  ↓
API: POST /cart/items (validate stock, add to cart)
  ↓
User navigates to /checkout
  ↓
API: POST /orders (create order, reserve stock)
  ↓
Backend: Deduct stock, create Order + OrderItems
  ↓
Frontend: Redirect to /orders/:id (confirmation)
```

### Stock Display Flow

```
Product Page loads
  ↓
API: GET /products/:slug (includes stock info)
  ↓
Frontend: Display stock status
  - In stock: Show "Còn lại: X sản phẩm"
  - Low stock (< 5): Show warning
  - Out of stock: Disable add to cart
  ↓
For áo thun: GET /products/:slug/stock?size=M
  ↓
Display stock per size
```

### Review Flow

```
User views product
  ↓
API: GET /products/:slug/reviews (paginated)
  ↓
Frontend: Display reviews list
  ↓
User (who purchased) can submit review
  ↓
API: POST /products/:slug/reviews
  ↓
Backend: Create review, recalculate product rating
  ↓
Frontend: Refresh reviews list
```

## Technical Considerations

### Stock Management

- **Real-time validation**: Check stock trước khi add to cart và create order
- **Size-based stock**: Áo thun cần check `ProductSizeStock` table
- **Stock reservation**: Reserve stock khi tạo order (PENDING), deduct khi CONFIRMED
- **Concurrency**: Sử dụng database transactions để tránh race condition

### Error Handling

- **Out of stock**: Return 409 Conflict với message rõ ràng
- **Invalid size**: Return 400 Bad Request
- **Cart validation**: Validate cart items trước khi checkout
- **Order cancellation**: Restore stock nếu cancel order

### Performance

- **Caching**: Cache product data (Redis) với TTL ngắn
- **Pagination**: Paginate reviews list
- **Optimistic updates**: Frontend có thể optimistic update cart UI

### Security

- **Authentication**: Cart và Orders cần authentication
- **Authorization**: User chỉ có thể xem/edit cart/orders của mình
- **Review validation**: Chỉ user đã mua mới được review
- **Stock updates**: Chỉ admin mới được update stock

## Implementation Order

1. **Backend Products Module** - Foundation cho tất cả features
2. **Backend Cart Module** - Cần cho order placement
3. **Backend Orders Module** - Core feature đặt hàng
4. **Backend Reviews Module** - Độc lập, có thể làm song song
5. **Frontend API Integration** - Connect frontend với backend
6. **Frontend Cart & Checkout** - Complete order flow
7. **Frontend Reviews** - Display và submit reviews

## Files to Create/Modify

### Backend

- `apps/api/src/products/` - New module
- `apps/api/src/cart/` - New module
- `apps/api/src/orders/` - New module
- `apps/api/src/reviews/` - New module
- `apps/api/src/app.module.ts` - Import new modules

### Frontend

- `apps/web/src/lib/api/products.ts` - Product API client
- `apps/web/src/lib/api/cart.ts` - Cart API client
- `apps/web/src/lib/api/orders.ts` - Orders API client
- `apps/web/src/lib/api/reviews.ts` - Reviews API client
- `apps/web/src/app/cart/page.tsx` - Cart page
- `apps/web/src/app/checkout/page.tsx` - Checkout page
- `apps/web/src/app/orders/[id]/page.tsx` - Order detail page
- `apps/web/src/components/shop/ProductReviews.tsx` - Reviews component
- `apps/web/src/components/shop/ReviewForm.tsx` - Review form component
- `apps/web/src/app/shop/*/page.tsx` - Update để fetch từ API
- `apps/web/src/components/shop/ProductActions.tsx` - Connect với cart API
- `apps/web/src/components/shop/ProductQuantitySelector.tsx` - Validate với stock
- `apps/web/src/components/shop/ProductSizeSelector.tsx` - Show stock per size

## Testing Checklist

- [ ] Product API returns correct stock info
- [ ] Cart add/update/remove works correctly
- [ ] Stock validation prevents adding out-of-stock items
- [ ] Order creation reserves and deducts stock
- [ ] Order cancellation restores stock
- [ ] Reviews can only be created by users who purchased
- [ ] Product rating updates correctly when review added
- [ ] Frontend displays stock status correctly
- [ ] Checkout flow completes successfully
- [ ] Error handling shows user-friendly messages

### To-dos

- [ ] Create Products module với CQRS pattern: queries (get-product-by-slug, list-products, get-product-stock), commands (update-stock), repository, DTOs, controller
- [ ] Create Cart module với CQRS: commands (add-to-cart, update-item, remove-item, clear-cart), queries (get-cart), repository, DTOs, controller với stock validation
- [ ] Create Orders module với CQRS: commands (create-order, update-status, cancel-order), queries (get-order, list-orders), repository, DTOs, controller với stock reservation và deduction
- [ ] Create Reviews module với CQRS: commands (create-review, update-review, delete-review), queries (get-product-reviews), repository, DTOs, controller với purchase validation và auto-update product rating
- [ ] Create API client functions: products.ts, cart.ts, orders.ts, reviews.ts với type-safe functions và error handling
- [ ] Update product pages (ao-thun, pad-chuot, day-deo, moc-khoa) để fetch data từ API, display real-time stock, validate stock khi add to cart
- [ ] Create cart page (/cart) và checkout page (/checkout) với order creation flow, shipping address form, order summary
- [ ] Create ProductReviews component và ReviewForm component, integrate vào product pages, display reviews với pagination
- [ ] Update ProductActions, ProductQuantitySelector, ProductSizeSelector để integrate với cart API và stock validation
