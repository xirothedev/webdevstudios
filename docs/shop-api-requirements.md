# Tổng hợp các tính năng cần call API ở route `/shop`

## 📋 Tổng quan

Tài liệu này liệt kê tất cả các tính năng trong frontend route `/shop` cần tích hợp với API backend.

---

## 🏪 Route `/shop` (Trang chủ shop)

**File:** `apps/web/src/app/shop/page.tsx`

### Tính năng hiện tại:

- Hiển thị Hero section
- Hiển thị TrustSection
- Hiển thị FeaturesGrid

### Tính năng cần API (nếu có):

1. **Danh sách sản phẩm nổi bật** (nếu muốn dynamic)
   - **Endpoint:** `GET /api/products/featured`
   - **Mục đích:** Lấy danh sách sản phẩm nổi bật để hiển thị trong FeaturesGrid
   - **Priority:** Thấp (hiện tại đang hardcode)

---

## 📦 Route `/shop/[product-slug]` (Trang chi tiết sản phẩm)

**Files:**

- `apps/web/src/app/shop/ao-thun/page.tsx`
- `apps/web/src/app/shop/pad-chuot/page.tsx`
- `apps/web/src/app/shop/day-deo/page.tsx`
- `apps/web/src/app/shop/moc-khoa/page.tsx`

### Tính năng cần API:

#### 1. **Lấy thông tin sản phẩm** ⚠️ **PRIORITY: CAO**

- **Endpoint:** `GET /api/products/:slug` hoặc `GET /api/products/:id`
- **Mục đích:** Lấy thông tin chi tiết sản phẩm (name, price, images, description, stock, sizes, rating, etc.)
- **Hiện tại:** Đang dùng static data từ `@/data/products/*`
- **Vị trí code:**
  ```22:27:apps/web/src/app/shop/ao-thun/page.tsx
  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsAddingToCart(false);
    // TODO: Add to cart logic
  };
  ```
- **Cần thay đổi:** Fetch product data từ API thay vì import static data

#### 2. **Thêm vào giỏ hàng** ⚠️ **PRIORITY: CAO**

- **Endpoint:** `POST /api/cart/add` hoặc `POST /api/cart/items`
- **Mục đích:** Thêm sản phẩm vào giỏ hàng với size và quantity
- **Request body:**
  ```json
  {
    "productId": "ao-thun-wds",
    "slug": "ao-thun",
    "size": "M", // optional, chỉ có với sản phẩm có size
    "quantity": 1,
    "price": 299000
  }
  ```
- **Hiện tại:** Chỉ simulate với `setTimeout`, có TODO comment
- **Vị trí code:**
  ```22:28:apps/web/src/app/shop/ao-thun/page.tsx
  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsAddingToCart(false);
    // TODO: Add to cart logic
  };
  ```
- **Cần xử lý:**
  - Success: Hiển thị notification/toast thành công
  - Error: Hiển thị lỗi (hết hàng, không hợp lệ, etc.)
  - Update cart count trong Navbar (nếu có)

#### 3. **Mua ngay (Buy Now)** ⚠️ **PRIORITY: CAO**

- **Endpoint:** `POST /api/orders/create` hoặc `POST /api/checkout`
- **Mục đích:** Tạo đơn hàng ngay lập tức và chuyển đến trang checkout
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
- **Hiện tại:** Chỉ `console.log`, có TODO comment
- **Vị trí code:**
  ```30:33:apps/web/src/app/shop/ao-thun/page.tsx
  const handleBuyNow = () => {
    // TODO: Buy now logic
    console.log('Buy now:', { size: selectedSize, quantity });
  };
  ```
- **Cần xử lý:**
  - Tạo order/checkout session
  - Redirect đến trang checkout với order ID

#### 4. **Kiểm tra tồn kho (Stock Check)** ⚠️ **PRIORITY: TRUNG BÌNH**

- **Endpoint:** `GET /api/products/:id/stock` hoặc trong response của product detail
- **Mục đích:** Kiểm tra số lượng tồn kho real-time
- **Hiện tại:** Dùng static `stock` từ product data
- **Vị trí code:**
  ```92:97:apps/web/src/app/shop/ao-thun/page.tsx
  <ProductQuantitySelector
    quantity={quantity}
    onIncrease={increaseQuantity}
    onDecrease={decreaseQuantity}
    stock={aoThunProduct.stock}
  />
  ```
- **Cần xử lý:**
  - Validate quantity không vượt quá stock
  - Disable nút "Thêm vào giỏ" nếu hết hàng
  - Hiển thị thông báo "Hết hàng" nếu stock = 0

#### 5. **Lấy đánh giá sản phẩm (Reviews/Ratings)** ⚠️ **PRIORITY: TRUNG BÌNH**

- **Endpoint:** `GET /api/products/:id/reviews` hoặc trong response của product detail
- **Mục đích:** Lấy danh sách đánh giá và rating của sản phẩm
- **Hiện tại:** Dùng static `rating` từ product data
- **Vị trí code:**
  ```74:79:apps/web/src/app/shop/ao-thun/page.tsx
  <ProductInfo
    name={aoThunProduct.name}
    rating={aoThunProduct.rating}
    price={aoThunProduct.price}
    description={aoThunProduct.description}
    priceNote="Giá đã bao gồm VAT. Miễn phí vận chuyển cho đơn hàng trên 500.000₫"
  />
  ```
- **Cần xử lý:**
  - Hiển thị rating trung bình
  - Hiển thị số lượng đánh giá
  - Có thể mở rộng: Hiển thị danh sách reviews chi tiết

#### 6. **Kiểm tra size có sẵn** ⚠️ **PRIORITY: THẤP**

- **Endpoint:** `GET /api/products/:id/sizes` hoặc trong response của product detail
- **Mục đích:** Kiểm tra size nào còn hàng (nếu có logic stock theo size)
- **Hiện tại:** Dùng static `sizes` array
- **Vị trí code:**
  ```83:89:apps/web/src/app/shop/ao-thun/page.tsx
  {aoThunProduct.hasSizes && aoThunProduct.sizes && (
    <ProductSizeSelector
      sizes={aoThunProduct.sizes}
      selectedSize={selectedSize}
      onSizeChange={setSelectedSize}
    />
  )}
  ```
- **Cần xử lý:**
  - Disable size không còn hàng
  - Hiển thị badge "Hết hàng" cho size không có stock

---

## 🛒 Tính năng liên quan (có thể cần)

### 1. **Giỏ hàng (Cart)**

- **Endpoint:** `GET /api/cart` - Lấy danh sách items trong giỏ
- **Endpoint:** `PUT /api/cart/items/:id` - Cập nhật quantity
- **Endpoint:** `DELETE /api/cart/items/:id` - Xóa item khỏi giỏ
- **Endpoint:** `GET /api/cart/count` - Lấy số lượng items (cho badge trong Navbar)

### 2. **Tìm kiếm sản phẩm**

- **Endpoint:** `GET /api/products/search?q=...` - Tìm kiếm sản phẩm
- **Priority:** Thấp (chưa có UI)

### 3. **Lọc sản phẩm**

- **Endpoint:** `GET /api/products?category=...&priceMin=...&priceMax=...` - Lọc sản phẩm
- **Priority:** Thấp (chưa có UI)

---

## 📝 Ghi chú kỹ thuật

### Các file cần chỉnh sửa:

1. **Product Pages:**
   - `apps/web/src/app/shop/ao-thun/page.tsx`
   - `apps/web/src/app/shop/pad-chuot/page.tsx`
   - `apps/web/src/app/shop/day-deo/page.tsx`
   - `apps/web/src/app/shop/moc-khoa/page.tsx`

2. **Components:**
   - `apps/web/src/components/shop/ProductActions.tsx` - Có thể cần thêm error handling
   - `apps/web/src/components/shop/ProductQuantitySelector.tsx` - Cần validate với stock từ API
   - `apps/web/src/components/shop/ProductSizeSelector.tsx` - Cần disable size hết hàng

3. **API Client:**
   - Cần tạo API client utilities (có thể trong `apps/web/src/lib/api/` hoặc `apps/web/src/services/`)

### Error Handling cần có:

- **Network errors:** Hiển thị thông báo "Không thể kết nối đến server"
- **Validation errors:** Hiển thị lỗi từ API (hết hàng, size không hợp lệ, etc.)
- **Authentication errors:** Redirect đến trang login nếu cần đăng nhập
- **Rate limiting:** Hiển thị thông báo "Quá nhiều request, vui lòng thử lại sau"

### Loading States:

- Đã có: `isAddingToCart` state trong ProductActions
- Cần thêm: Loading state cho product data fetch

---

## 🎯 Tóm tắt Priority

### **PRIORITY CAO** (Cần implement ngay):

1. ✅ Lấy thông tin sản phẩm từ API
2. ✅ Thêm vào giỏ hàng
3. ✅ Mua ngay (Buy Now)

### **PRIORITY TRUNG BÌNH** (Nên có):

4. ⚠️ Kiểm tra tồn kho real-time
5. ⚠️ Lấy đánh giá sản phẩm từ API

### **PRIORITY THẤP** (Có thể làm sau):

6. ℹ️ Kiểm tra size có sẵn
7. ℹ️ Danh sách sản phẩm nổi bật (nếu muốn dynamic)
8. ℹ️ Tìm kiếm và lọc sản phẩm

---

## 📌 TODO Comments trong code

Các TODO comments cần được xử lý:

1. `apps/web/src/app/shop/ao-thun/page.tsx:27` - `// TODO: Add to cart logic`
2. `apps/web/src/app/shop/ao-thun/page.tsx:31` - `// TODO: Buy now logic`
3. `apps/web/src/app/shop/pad-chuot/page.tsx:24` - `// TODO: Add to cart logic`
4. `apps/web/src/app/shop/pad-chuot/page.tsx:28` - `// TODO: Buy now logic`
5. `apps/web/src/app/shop/day-deo/page.tsx:24` - `// TODO: Add to cart logic`
6. `apps/web/src/app/shop/day-deo/page.tsx:28` - `// TODO: Buy now logic`
7. `apps/web/src/app/shop/moc-khoa/page.tsx:24` - `// TODO: Add to cart logic`
8. `apps/web/src/app/shop/moc-khoa/page.tsx:28` - `// TODO: Buy now logic`

---

_Tài liệu được tạo tự động từ phân tích source code frontend - Cập nhật: 2025_
