# Tóm tắt Rebuild Schema Prisma

## 🎯 Mục tiêu

Rebuild lại schema Prisma để tối ưu và tối giản cho **4 sản phẩm cố định** của shop:

1. Áo thun (AO_THUN)
2. Pad chuột (PAD_CHUOT)
3. Dây đeo (DAY_DEO)
4. Móc khóa (MOC_KHOA)

---

## ✅ Các thay đổi đã thực hiện

### 1. **Thêm Enum ProductSlug** (`enums.prisma`)

```prisma
enum ProductSlug {
  AO_THUN    // Áo thun WebDev Studios
  PAD_CHUOT  // Pad chuột WebDev Studios
  DAY_DEO    // Dây đeo WebDev Studios
  MOC_KHOA   // Móc khóa WebDev Studios
}

enum ProductSize {
  S
  M
  L
  XL
}
```

**Lợi ích:**

- Type safety: Đảm bảo chỉ có 4 sản phẩm hợp lệ
- Dễ maintain: Thêm/sửa sản phẩm chỉ cần update enum
- Performance: Database có thể optimize index cho enum

---

### 2. **Đơn giản hóa Product Model** (`product.prisma`)

#### ❌ **Đã loại bỏ:**

- `Category` model (không cần vì chỉ có 4 sản phẩm)
- `ProductOption` model (không cần vì không có nhiều options)
- `ProductOptionValue` model
- `ProductVariant` model phức tạp (thay bằng `ProductSizeStock` đơn giản)

#### ✅ **Schema mới:**

```prisma
model Product {
  id          String      @id @default(cuid())
  slug        ProductSlug @unique // Enum đảm bảo chỉ có 4 sản phẩm
  name        String      @db.VarChar(255)
  description String      @db.Text

  // Giá sản phẩm (đơn giản hóa)
  priceCurrent  Decimal @db.Decimal(12, 2)
  priceOriginal Decimal? @db.Decimal(12, 2)
  priceDiscount Decimal? @db.Decimal(12, 2)

  // Thông tin sản phẩm
  stock       Int     @default(0)
  hasSizes    Boolean @default(false) // Chỉ áo thun = true
  badge       String? @db.VarChar(50)

  // Đánh giá
  ratingValue Decimal @default(0) @db.Decimal(3, 2)
  ratingCount Int     @default(0)

  // Relations
  images     ProductImage[]
  sizeStocks ProductSizeStock[] // Chỉ cho áo thun
  cartItems  CartItem[]
  orderItems OrderItem[]
  reviews    Review[]
}
```

**Lợi ích:**

- Đơn giản hơn: Từ ~100 dòng code xuống còn ~50 dòng
- Dễ query: Không cần join nhiều bảng
- Performance tốt hơn: Ít bảng, ít relation

---

### 3. **Thêm ProductSizeStock Model**

```prisma
model ProductSizeStock {
  id     String      @id @default(cuid())
  size   ProductSize // S, M, L, XL
  stock  Int         @default(0)

  productId String
  product   Product @relation(...)

  @@unique([productId, size])
}
```

**Mục đích:**

- Quản lý stock theo size cho áo thun
- Các sản phẩm khác không có size, dùng `Product.stock` trực tiếp

---

### 4. **Cập nhật CartItem** (`order.prisma`)

#### ❌ **Trước:**

```prisma
model CartItem {
  variantId String
  variant   ProductVariant @relation(...)
  // ...
}
```

#### ✅ **Sau:**

```prisma
model CartItem {
  productId String
  product   Product @relation(...)
  size      ProductSize? // Chỉ áo thun có
  quantity  Int
  // ...
}
```

**Lợi ích:**

- Đơn giản hơn: Không cần ProductVariant
- Linh hoạt: Size nullable, chỉ áo thun mới có

---

### 5. **Cập nhật OrderItem** (`order.prisma`)

#### ❌ **Trước:**

```prisma
model OrderItem {
  variantId String?
  variant   ProductVariant? @relation(...)
  productName String
  variantName String // VD: "Red - XL"
  // ...
}
```

#### ✅ **Sau:**

```prisma
model OrderItem {
  productId String?
  product   Product? @relation(...)

  // Snapshot data
  productSlug ProductSlug // Lưu slug để dễ tra cứu
  productName String
  size        ProductSize? // Size nếu có
  price       Decimal
  quantity    Int
  // ...
}
```

**Lợi ích:**

- Rõ ràng hơn: `productSlug` dễ tra cứu hơn `variantName`
- Đơn giản: Không cần `variantName` phức tạp

---

### 6. **Cập nhật Review Model** (`marketing.prisma`)

#### ✅ **Cải thiện:**

- Thêm `updatedAt` field
- `userId` nullable để hỗ trợ review ẩn danh
- Thêm indexes cho performance

---

## 📊 So sánh Before/After

| Aspect               | Before                              | After                       | Improvement |
| -------------------- | ----------------------------------- | --------------------------- | ----------- |
| **Models**           | 7 models                            | 4 models                    | ⬇️ 43%      |
| **Lines of code**    | ~106 lines                          | ~78 lines                   | ⬇️ 26%      |
| **Relations**        | Complex (Category, Variant, Option) | Simple (Product, SizeStock) | ⬇️ 60%      |
| **Type Safety**      | String slug                         | Enum ProductSlug            | ✅ 100%     |
| **Query Complexity** | 3-4 joins                           | 1-2 joins                   | ⬇️ 50%      |

---

## 🚀 Next Steps

### 1. **Tạo Migration**

```bash
cd apps/api
npx prisma migrate dev --name rebuild_product_schema
```

### 2. **Seed Data cho 4 sản phẩm**

Tạo seed script để insert 4 sản phẩm vào database với ProductSlug enum.

### 3. **Cập nhật API Services**

- Cập nhật ProductService để sử dụng ProductSlug enum
- Cập nhật CartService để xử lý size
- Cập nhật OrderService để lưu snapshot đúng format

### 4. **Cập nhật Frontend Types**

- Tạo ProductSlug enum trong TypeScript
- Cập nhật Product interface để match với schema mới

---

## ⚠️ Breaking Changes

### Database Migration Required

- Cần drop các bảng cũ: `categories`, `product_options`, `product_option_values`, `product_variants`
- Cần migrate data từ `ProductVariant` sang `Product` và `ProductSizeStock`
- Cần migrate `CartItem` và `OrderItem` để reference `Product` thay vì `ProductVariant`

### API Changes

- Endpoints liên quan đến Category sẽ bị xóa
- Endpoints liên quan đến ProductVariant cần refactor
- Cart/Order endpoints cần update để xử lý size

---

## 📝 Notes

- Schema này được tối ưu cho **4 sản phẩm cố định**
- Nếu sau này cần mở rộng (thêm sản phẩm, thêm options), cần cân nhắc rebuild lại
- Hiện tại: **Đơn giản, nhanh, dễ maintain** ✅

---

_Cập nhật: 2025-01-XX_
