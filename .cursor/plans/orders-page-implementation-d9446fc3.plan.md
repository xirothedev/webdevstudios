<!-- d9446fc3-0c45-4ff5-b397-32048b89da17 04f40141-e858-4d90-95b0-7f3721b59010 -->

# Kế hoạch thiết kế trang Orders

## Tổng quan

Tạo trang danh sách đơn hàng (`/orders`) với các tính năng:

- Hiển thị danh sách đơn hàng với pagination
- Sử dụng Suspense Query để tối ưu UX
- Tuân thủ design system (dark theme, orange accent)
- Responsive design (mobile-first)
- Empty state và error handling

## Phân tích hiện trạng

### Backend API (đã có sẵn)

- `GET /orders?page=1&limit=10` - List orders với pagination
- Response: `{ orders: Order[], total: number }`
- File: `apps/api/src/orders/orders.controller.ts`

### Frontend hiện tại

- ✅ API client: `apps/web/src/lib/api/orders.ts` - có `listOrders()`
- ✅ Hooks: `apps/web/src/lib/api/hooks/use-orders.ts` - có `useOrders()` (regular query)
- ✅ Order detail page: `apps/web/src/app/orders/[id]/page.tsx`
- ❌ Thiếu: Orders list page (`/orders`)
- ❌ Thiếu: `useSuspenseOrders()` hook

### Pattern hiện tại

- Suspense pattern: `useSuspenseCart()`, `useSuspenseProduct()`
- Loading components: Skeleton với `animate-pulse`
- Design: Dark theme với glassmorphism

## Implementation Plan

### 1. Tạo Suspense Query Hook

**File**: `apps/web/src/lib/api/hooks/use-orders.ts`

- Thêm `useSuspenseOrders(page, limit)` hook
- Sử dụng `useSuspenseQuery` từ `@tanstack/react-query`
- Giữ nguyên `useOrders()` cho backward compatibility
- Query key: `orderKeys.list(page, limit)`

### 2. Tạo Orders List Page

**File**: `apps/web/src/app/orders/page.tsx`

- Server Component (default export)
- Layout: Navbar (dark) + Footer (dark)
- Wrapper: Suspense boundary với loading fallback
- Content: Client component `OrdersContent`

### 3. Tạo Orders Content Component

**File**: `apps/web/src/app/orders/OrdersContent.tsx` (hoặc inline trong page)

- Client Component (`'use client'`)
- Sử dụng `useSuspenseOrders()` hook
- State management: pagination (page, limit)
- Hiển thị:
  - Page header với title
  - Orders list (OrderCard components)
  - Pagination controls
  - Empty state (khi không có orders)
  - Error boundary (nếu cần)

### 4. Tạo Order Card Component

**File**: `apps/web/src/components/orders/OrderCard.tsx`

- Hiển thị thông tin đơn hàng:
  - Order code (link đến detail)
  - Status badge (PENDING, CONFIRMED, etc.)
  - Payment status
  - Order date
  - Total amount
  - Product items preview (tối đa 2-3 items)
  - Action buttons (View detail, Cancel nếu PENDING)
- Design: Card với `rounded-xl border border-white/10 bg-white/5`
- Hover effects: `hover:border-wds-accent/30`

### 5. Tạo Loading Component

**File**: `apps/web/src/app/orders/OrdersLoading.tsx`

- Skeleton loading cho orders list
- Hiển thị 3-4 skeleton cards
- Sử dụng `animate-pulse` với `bg-white/10`

### 6. Tạo Empty State Component

**File**: `apps/web/src/components/orders/OrdersEmpty.tsx` (optional, có thể inline)

- Icon (ShoppingBag hoặc Package từ lucide-react)
- Message: "Bạn chưa có đơn hàng nào"
- CTA button: "Tiếp tục mua sắm" → `/shop`

### 7. Tạo Pagination Component

**File**: `apps/web/src/components/orders/OrdersPagination.tsx` (hoặc sử dụng shadcn Pagination)

- Hiển thị: Previous, Page numbers, Next
- Disable Previous khi page = 1
- Disable Next khi page = lastPage
- Tính toán: `totalPages = Math.ceil(total / limit)`
- URL-based pagination (query params) hoặc state-based

## Design Specifications

### Color Scheme

- Background: `bg-wds-background` (black)
- Text: `text-wds-text` (white)
- Accent: `bg-wds-accent` (orange) cho CTAs
- Cards: `bg-white/5 border-white/10`

### Typography

- Page title: `text-3xl font-bold text-white`
- Order code: `text-lg font-semibold text-white`
- Status: Badge với màu tương ứng
- Price: `text-wds-accent font-bold`

### Layout

- Container: `mx-auto max-w-6xl px-6`
- Cards spacing: `gap-4` hoặc `gap-6`
- Section padding: `py-20` hoặc `pt-24 pb-20`

### Status Badges

- PENDING: Yellow/Orange
- CONFIRMED: Blue
- PROCESSING: Purple
- SHIPPING: Cyan
- DELIVERED: Green
- CANCELLED: Red
- RETURNED: Gray

## File Structure

```
apps/web/src/
├── app/
│   └── orders/
│       ├── page.tsx                    # Server component, layout
│       └── OrdersContent.tsx           # Client component, main content
├── components/
│   └── orders/
│       ├── OrderCard.tsx              # Order card component
│       ├── OrdersEmpty.tsx            # Empty state
│       └── OrdersPagination.tsx      # Pagination (optional)
└── lib/
    └── api/
        └── hooks/
            └── use-orders.ts          # Add useSuspenseOrders()
```

## API Integration

### Không cần thay đổi Backend

- API đã có sẵn và đầy đủ
- Endpoint: `GET /orders?page=1&limit=10`
- Response format đã đúng

### Frontend API

- Sử dụng `ordersApi.listOrders(page, limit)` từ `apps/web/src/lib/api/orders.ts`
- Không cần thay đổi API client

## Testing Checklist

- [ ] Orders list hiển thị đúng
- [ ] Pagination hoạt động (next/previous)
- [ ] Empty state hiển thị khi không có orders
- [ ] Loading state (skeleton) hiển thị đúng
- [ ] Order card link đến detail page
- [ ] Cancel button chỉ hiện khi status = PENDING
- [ ] Responsive trên mobile/tablet/desktop
- [ ] Error handling khi API fail
- [ ] Suspense boundary hoạt động đúng

## Notes

- Sử dụng Server Components khi có thể
- Client Components chỉ cho interactive parts
- Tuân thủ import order (simple-import-sort)
- Format code với Prettier
- TypeScript strict mode

### To-dos

- [ ] Thêm useSuspenseOrders hook vào apps/web/src/lib/api/hooks/use-orders.ts
- [ ] Tạo OrderCard component tại apps/web/src/components/orders/OrderCard.tsx
- [ ] Tạo OrdersEmpty component tại apps/web/src/components/orders/OrdersEmpty.tsx
- [ ] Tạo OrdersLoading component tại apps/web/src/app/orders/OrdersLoading.tsx
- [ ] Tạo OrdersContent client component tại apps/web/src/app/orders/OrdersContent.tsx
- [ ] Tạo orders page tại apps/web/src/app/orders/page.tsx với Suspense boundary
- [ ] Thêm pagination controls vào OrdersContent
- [ ] Test và fix linting/formatting errors
