# Hướng dẫn khôi phục tính năng Shop

## Tổng quan

Tài liệu này hướng dẫn cách khôi phục lại toàn bộ tính năng shop đã bị disable bằng cách redirect về 404. Tất cả các trang shop, cart, checkout, orders, và payments đã được thay thế bằng `notFound()` redirect.

## Danh sách các file đã thay đổi

### 1. Shop Pages

- `apps/web/src/app/shop/page.tsx`
- `apps/web/src/app/shop/(shop)/ao-thun/page.tsx`
- `apps/web/src/app/shop/(shop)/moc-khoa/page.tsx`
- `apps/web/src/app/shop/(shop)/day-deo/page.tsx`
- `apps/web/src/app/shop/(shop)/pad-chuot/page.tsx`

### 2. E-commerce Pages

- `apps/web/src/app/cart/page.tsx`
- `apps/web/src/app/checkout/page.tsx`
- `apps/web/src/app/orders/page.tsx`
- `apps/web/src/app/orders/[id]/page.tsx`
- `apps/web/src/app/payments/[orderId]/page.tsx`
- `apps/web/src/app/payments/cancel/page.tsx`
- `apps/web/src/app/payments/return/page.tsx`

### 3. Navigation & UI Components

- `apps/web/src/components/Navbar.tsx`
- `apps/web/src/data/footer.ts`
- `apps/web/src/components/FeaturesGrid.tsx`
- `apps/web/src/components/Hero.tsx`
- `apps/web/src/app/not-found.tsx`
- `apps/web/src/app/shop/layout.tsx`

### 4. Configuration

- `apps/web/src/app/sitemap.ts`

## Hướng dẫn khôi phục từng file

### 1. Khôi phục Shop Pages

#### `apps/web/src/app/shop/page.tsx`

**Thay thế:**

```typescript
import { notFound } from 'next/navigation';

export default function ShopPage() {
  notFound();
}
```

**Bằng:**

```typescript
import { FeaturesGrid } from '@/components/FeaturesGrid';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { Navbar } from '@/components/Navbar';
import { TrustSection } from '@/components/TrustSection';

export default function ShopPage() {
  return (
    <div className="bg-wds-background text-wds-text selection:bg-wds-accent/30 selection:text-wds-text min-h-screen">
      <Navbar />
      <Hero />
      <TrustSection />
      <FeaturesGrid />
      <Footer />
    </div>
  );
}
```

#### `apps/web/src/app/shop/(shop)/ao-thun/page.tsx`

**Thay thế:**

```typescript
import { notFound } from 'next/navigation';

export default function AoThunPage() {
  notFound();
}
```

**Bằng:**

```typescript
'use client';

import { ProductPageContent } from '../ProductPageContent';

export default function AoThunPage() {
  return <ProductPageContent productSlug="ao-thun" productName="Áo thun" />;
}
```

#### `apps/web/src/app/shop/(shop)/moc-khoa/page.tsx`

**Thay thế:**

```typescript
import { notFound } from 'next/navigation';

export default function MocKhoaPage() {
  notFound();
}
```

**Bằng:**

```typescript
'use client';

import { ProductPageContent } from '../ProductPageContent';

export default function MocKhoaPage() {
  return <ProductPageContent productSlug="moc-khoa" productName="Móc khóa" />;
}
```

#### `apps/web/src/app/shop/(shop)/day-deo/page.tsx`

**Thay thế:**

```typescript
import { notFound } from 'next/navigation';

export default function DayDeoPage() {
  notFound();
}
```

**Bằng:**

```typescript
'use client';

import { ProductPageContent } from '../ProductPageContent';

export default function DayDeoPage() {
  return <ProductPageContent productSlug="day-deo" productName="Dây đeo" />;
}
```

#### `apps/web/src/app/shop/(shop)/pad-chuot/page.tsx`

**Thay thế:**

```typescript
import { notFound } from 'next/navigation';

export default function PadChuotPage() {
  notFound();
}
```

**Bằng:**

```typescript
'use client';

import { ProductPageContent } from '../ProductPageContent';

export default function PadChuotPage() {
  return <ProductPageContent productSlug="pad-chuot" productName="Pad chuột" />;
}
```

### 2. Khôi phục E-commerce Pages

#### `apps/web/src/app/cart/page.tsx`

**Thay thế:**

```typescript
import { notFound } from 'next/navigation';

export default function CartPage() {
  notFound();
}
```

**Bằng:**

```typescript
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';

import { CartContent } from './CartContent';

export default function CartPage() {
  return (
    <div className="bg-wds-background text-wds-text min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-7xl px-6">
          <CartContent />
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

#### `apps/web/src/app/checkout/page.tsx`

**Lưu ý:** File này rất dài (425 dòng). Để khôi phục, bạn cần:

1. Xem git history để lấy code gốc:

   ```bash
   git log --oneline --all -- apps/web/src/app/checkout/page.tsx
   git show <commit-hash>:apps/web/src/app/checkout/page.tsx > checkout-page-backup.tsx
   ```

2. Hoặc tạo lại file với nội dung từ component `CheckoutPage` đầy đủ với:
   - Form validation với Zod
   - Shipping address form
   - Order summary
   - Payment integration
   - Buy Now và From Cart modes

#### `apps/web/src/app/orders/page.tsx`

**Thay thế:**

```typescript
import { notFound } from 'next/navigation';

export default function OrdersPage() {
  notFound();
}
```

**Bằng:**

```typescript
import { Suspense } from 'react';

import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';

import { OrdersContent } from './OrdersContent';
import { OrdersLoading } from './OrdersLoading';

export default function OrdersPage() {
  return (
    <div className="bg-wds-background text-wds-text min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-6xl px-6">
          <Suspense fallback={<OrdersLoading />}>
            <OrdersContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

#### `apps/web/src/app/orders/[id]/page.tsx`

**Lưu ý:** File này cũng dài (211 dòng). Để khôi phục:

1. Xem git history:

   ```bash
   git log --oneline --all -- apps/web/src/app/orders/[id]/page.tsx
   git show <commit-hash>:apps/web/src/app/orders/[id]/page.tsx > order-detail-backup.tsx
   ```

2. Hoặc tạo lại với:
   - Order detail display
   - Order status và payment status
   - Shipping address display
   - Order items list
   - Cancel order functionality
   - Payment button

#### `apps/web/src/app/payments/[orderId]/page.tsx`

**Lưu ý:** File này dài (176 dòng). Khôi phục từ git history hoặc tạo lại với:

- Order summary display
- Payment link creation
- PayOS integration
- Payment status handling

#### `apps/web/src/app/payments/cancel/page.tsx`

**Thay thế:**

```typescript
import { notFound } from 'next/navigation';

export default function PaymentCancelPage() {
  notFound();
}
```

**Bằng:**

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';

export default function PaymentCancelPage() {
  const router = useRouter();

  useEffect(() => {
    // Get pending order ID from localStorage
    const pendingOrderId = localStorage.getItem('pendingOrderId');
    if (pendingOrderId) {
      // Clear localStorage
      localStorage.removeItem('pendingOrderId');
      localStorage.removeItem(`paymentUrl_${pendingOrderId}`);

      // Redirect to order detail page after 3 seconds
      setTimeout(() => {
        router.push(`/orders/${pendingOrderId}`);
      }, 3000);
    }
  }, [router]);

  return (
    <div className="bg-wds-background text-wds-text min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h1 className="mb-4 text-3xl font-bold text-white">
            Thanh toán đã bị hủy
          </h1>
          <p className="mb-8 text-white/60">
            Bạn đã hủy quá trình thanh toán. Đơn hàng của bạn vẫn được lưu và
            bạn có thể thanh toán lại bất cứ lúc nào.
          </p>
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => {
                const pendingOrderId = localStorage.getItem('pendingOrderId');
                if (pendingOrderId) {
                  router.push(`/orders/${pendingOrderId}`);
                } else {
                  router.push('/orders');
                }
              }}
              className="bg-wds-accent hover:bg-wds-accent/90 font-semibold text-black"
            >
              Xem đơn hàng
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/shop')}
              className="border-white/10 text-white/80 hover:bg-white/5"
            >
              Tiếp tục mua sắm
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

#### `apps/web/src/app/payments/return/page.tsx`

**Thay thế:**

```typescript
import { notFound } from 'next/navigation';

export default function PaymentReturnPage() {
  notFound();
}
```

**Bằng:**

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useOrders } from '@/lib/api/hooks/use-orders';

export default function PaymentReturnPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const { data: ordersData, refetch } = useOrders(1, 10);

  useEffect(() => {
    // Check payment status by refetching orders
    const checkPaymentStatus = async () => {
      await refetch();
      setIsChecking(false);

      // Find the most recent order
      const recentOrder = ordersData?.orders[0];
      if (recentOrder) {
        // Clear localStorage
        localStorage.removeItem('pendingOrderId');
        localStorage.removeItem(`paymentUrl_${recentOrder.id}`);

        // Redirect to order detail page
        setTimeout(() => {
          router.push(`/orders/${recentOrder.id}`);
        }, 2000);
      }
    };

    checkPaymentStatus();
  }, [refetch, ordersData, router]);

  return (
    <div className="bg-wds-background text-wds-text min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          {isChecking ? (
            <>
              <h1 className="mb-4 text-3xl font-bold text-white">
                Đang xác nhận thanh toán...
              </h1>
              <p className="text-white/60">
                Vui lòng đợi trong giây lát, chúng tôi đang kiểm tra trạng thái
                thanh toán của bạn.
              </p>
            </>
          ) : (
            <>
              <h1 className="mb-4 text-3xl font-bold text-white">
                Thanh toán thành công!
              </h1>
              <p className="mb-8 text-white/60">
                Cảm ơn bạn đã thanh toán. Đơn hàng của bạn đang được xử lý.
              </p>
              <Button
                onClick={() => {
                  const recentOrder = ordersData?.orders[0];
                  if (recentOrder) {
                    router.push(`/orders/${recentOrder.id}`);
                  } else {
                    router.push('/orders');
                  }
                }}
                className="bg-wds-accent hover:bg-wds-accent/90 font-semibold text-black"
              >
                Xem đơn hàng
              </Button>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

### 3. Khôi phục Navigation & UI Components

#### `apps/web/src/components/Navbar.tsx`

**Thêm lại vào `navItems` array:**

```typescript
const navItems = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Về chúng tôi', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Shop', href: '/shop' }, // ← Thêm lại dòng này
  { label: 'Lịch sự kiện', href: '/calendar' },
  { label: 'Thế hệ', href: '/generation' },
  { label: 'WDS chia sẻ', href: '/share' },
  { label: 'FAQ', href: '/faq' },
];
```

**Thêm lại `shopItems` array:**

```typescript
const shopItems = [
  { label: 'Tất cả sản phẩm', href: '/shop' },
  { label: 'Áo thun', href: '/shop/ao-thun' },
  { label: 'Móc khóa', href: '/shop/moc-khoa' },
  { label: 'Dây đeo', href: '/shop/day-deo' },
  { label: 'Pad chuột', href: '/shop/pad-chuot' },
];
```

**Thêm lại shop dropdown menu trong NavigationMenu:**

```typescript
<NavigationMenu className="hidden md:flex">
  <NavigationMenuList className="gap-2">
    {/* Shop dropdown - only show on shop page or when variant is dark */}
    {(isDark || pathname === '/shop') && (
      <NavigationMenuItem>
        <NavigationMenuTrigger className="h-8 bg-transparent text-xs font-medium text-white/70!">
          Sản phẩm
        </NavigationMenuTrigger>
        <NavigationMenuContent className="bg-card/95 backdrop-blur-md">
          <ul className="grid w-[200px] gap-1 p-2">
            {shopItems.map((item) => (
              <li key={item.href}>
                <NavigationMenuLink asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'hover:text-wds-accent block rounded-sm px-3 py-2 text-xs transition-colors select-none hover:bg-white/5',
                      isDark ? 'text-white/70' : 'text-gray-600'
                    )}
                  >
                    {item.label}
                  </Link>
                </NavigationMenuLink>
              </li>
            ))}
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
    )}

    {/* Main navigation items */}
    {/* ... rest of nav items ... */}
  </NavigationMenuList>
</NavigationMenu>
```

**Thêm lại "Xem sản phẩm" button (trong desktop view):**

```typescript
{isDark ? (
  <>
    <Link
      href="/auth/login"
      className={cn(
        'hidden text-xs font-medium transition-colors sm:block',
        'hover:text-wds-accent',
        isDark
          ? 'text-white/70'
          : 'text-gray-600 hover:text-black'
      )}
    >
      Đăng nhập
    </Link>
    <Link
      href="/shop"
      className="focus:ring-wds-accent relative hidden h-8 overflow-hidden rounded-full p-px focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:outline-none sm:inline-flex"
    >
      <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#ffffff_0%,#f7931e_50%,#ffffff_100%)]" />
      <span className="bg-wds-accent hover:bg-wds-accent/90 inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full px-3 py-1 text-xs font-medium text-black backdrop-blur-3xl transition-colors">
        Xem sản phẩm
        <ChevronRight className="ml-1 h-3 w-3" />
      </span>
    </Link>
  </>
) : (
  // ... rest of code
)}
```

**Thêm lại "Xem sản phẩm" button (trong mobile menu):**

```typescript
{isDark && (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{
      delay: navItems.length * 0.1 + 0.1,
      duration: 0.3,
    }}
  >
    <Link
      href="/shop"
      onClick={() => setIsMobileMenuOpen(false)}
      className="border-wds-accent text-wds-accent hover:bg-wds-accent/10 flex w-full items-center justify-center gap-2 rounded-lg border-2 bg-transparent px-4 py-3 text-base font-medium transition-colors"
    >
      Xem sản phẩm
      <ChevronRight className="h-4 w-4" />
    </Link>
  </motion.div>
)}
```

**Thêm lại imports:**

```typescript
import { ChevronRight, Menu, X } from 'lucide-react';
// ... other imports ...
import {
  NavigationMenu,
  NavigationMenuContent, // ← Thêm lại
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger, // ← Thêm lại
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
```

#### `apps/web/src/data/footer.ts`

**Thêm lại section "SẢN PHẨM":**

```typescript
export const footerSections: FooterSection[] = [
  {
    title: 'SẢN PHẨM', // ← Thêm lại section này
    links: [
      { label: 'Áo thun', href: '/shop/ao-thun' },
      { label: 'Móc khóa', href: '/shop/moc-khoa' },
      { label: 'Dây đeo', href: '/shop/day-deo' },
      { label: 'Pad chuột', href: '/shop/pad-chuot' },
    ],
  },
  {
    title: 'VỀ CLB',
    links: [
      { label: 'Về chúng tôi', href: '/about' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Thế hệ', href: '/generation' },
    ],
  },
  {
    title: 'ĐIỀU KHOẢN',
    links: [
      { label: 'Điều khoản sử dụng', href: '/terms' },
      { label: 'Chính sách quyền riêng tư', href: '/privacy' },
      { label: 'Chính sách đổi trả', href: '/refund' },
    ],
  },
];
```

#### `apps/web/src/components/FeaturesGrid.tsx`

**Thêm lại Link wrappers cho product images:**

1. **Áo thun card:**

```typescript
<div className="relative flex justify-end">
  <Link href="/shop/ao-thun" className="cursor-pointer">
    <motion.div
      className="relative h-60 w-80 md:h-72 md:w-104 lg:h-80 lg:w-120"
      whileHover={{ scale: 1.12, y: -16, rotate: -2 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      style={{
        translateZ: 70,
      }}
    >
      <div className="from-wds-accent/40 via-wds-accent/15 absolute inset-0 bg-linear-to-t to-transparent blur-3xl" />
      <Image
        src="/shop/ao-thun.webp"
        alt="Áo thun WebDev Studios"
        fill
        sizes="(max-width: 768px) 320px, (max-width: 1024px) 416px, 480px"
        className="relative z-10 object-contain drop-shadow-[0_25px_60px_rgba(0,0,0,0.8)]"
      />
    </motion.div>
  </Link>
</div>
```

2. **Móc khóa card:**

```typescript
<Link href="/shop/moc-khoa" className="cursor-pointer">
  <motion.div
    className="relative mx-auto h-40 w-40"
    whileHover={{ scale: 1.1, rotate: 5 }}
    transition={{ duration: 0.3 }}
    style={{ translateZ: 40 }}
  >
    <div className="absolute inset-0 bg-linear-to-t from-purple-500/30 to-transparent blur-2xl" />
    <Image
      src="/shop/moc-khoa.webp"
      alt="Móc khóa WebDev Studios"
      fill
      className="relative z-10 object-contain drop-shadow-xl"
      sizes="160px"
    />
  </motion.div>
</Link>
```

3. **Dây đeo card:**

```typescript
<Link href="/shop/day-deo" className="cursor-pointer">
  <motion.div
    className="relative h-44 w-full"
    whileHover={{ scale: 1.06, y: -8 }}
    transition={{ duration: 0.3 }}
    style={{ translateZ: 40 }}
  >
    <div className="absolute inset-0 bg-linear-to-t from-emerald-500/30 to-transparent blur-2xl" />
    <Image
      src="/shop/day-deo.webp"
      alt="Dây đeo WebDev Studios"
      fill
      className="relative z-10 object-contain drop-shadow-xl"
      sizes="320px"
    />
  </motion.div>
</Link>
```

4. **Pad chuột card:**

```typescript
<Link
  href="/shop/pad-chuot"
  className="hidden cursor-pointer sm:block"
>
  <motion.div
    className="relative h-56 w-56"
    whileHover={{ scale: 1.08, rotate: 360 }}
    transition={{ duration: 0.6, ease: 'easeInOut' }}
    style={{ translateZ: 60 }}
  >
    <div className="absolute inset-0 bg-linear-to-t from-amber-500/40 via-orange-500/20 to-transparent blur-3xl" />
    <motion.div
      className="absolute inset-0 rounded-full border border-amber-400/30"
      animate={{ rotate: 360 }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
    <Image
      src="/shop/pad-chuot.webp"
      alt="Pad chuột WebDev Studios Limited Edition"
      fill
      className="relative z-10 object-contain drop-shadow-2xl"
      sizes="224px"
    />
  </motion.div>
</Link>
```

**Thêm lại import:**

```typescript
import Link from 'next/link';
```

#### `apps/web/src/components/Hero.tsx`

**Thêm lại background image:**

```typescript
import Image from 'next/image';

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-32 pb-20">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/shop/ao-thun.webp"
          alt="Background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Dark Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/60"></div>
      </div>
      {/* ... rest of component ... */}
    </section>
  );
}
```

#### `apps/web/src/app/not-found.tsx`

**Thêm lại shop link button:**

```typescript
<Link
  href="/shop"
  className="group border-wds-accent/30 text-wds-accent hover:border-wds-accent hover:bg-wds-accent/10 relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full border-2 bg-transparent px-6 py-3 text-base font-semibold transition-all"
>
  <Search className="h-5 w-5" />
  <span>Khám phá Shop</span>
</Link>
```

**Thêm lại shop link trong suggestions:**

```typescript
{[
  { label: 'Trang chủ', href: '/' },
  { label: 'Về chúng tôi', href: '/about' },
  { label: 'Shop', href: '/shop' }, // ← Thêm lại dòng này
  { label: 'Thế hệ', href: '/generation' },
  { label: 'FAQ', href: '/faq' },
].map((item, index) => (
  // ... rest of code
))}
```

**Thêm lại import:**

```typescript
import { ArrowLeft, Home, Search } from 'lucide-react';
```

#### `apps/web/src/app/shop/layout.tsx`

**Thêm lại FloatingCartButton:**

```typescript
import type { Metadata } from 'next';

import { FloatingCartButton } from '@/components/shop/FloatingCartButton';
import { createPageMetadata, SEO_IMAGES } from '@/lib/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'E-commerce Platform',
  description:
    'Khám phá nền tảng thương mại điện tử hiện đại với giao diện đẹp mắt và trải nghiệm người dùng tuyệt vời.',
  path: '/shop',
  image: SEO_IMAGES['/shop'],
  keywords: [
    'E-commerce',
    'Thương mại điện tử',
    'E-commerce platform',
    'Mua sắm online',
  ],
});

export default function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <FloatingCartButton />
    </>
  );
}
```

### 4. Khôi phục Configuration

#### `apps/web/src/app/sitemap.ts`

**Thêm lại `/shop` route:**

```typescript
const routes = [
  '',
  '/about',
  '/shop', // ← Thêm lại dòng này
  '/faq',
  '/generation',
  '/share',
  '/blog',
];
```

## Cách khôi phục nhanh bằng Git

Nếu bạn đã commit code trước khi disable shop, có thể khôi phục nhanh bằng git:

```bash
# 1. Tìm commit hash trước khi disable shop
git log --oneline --all --grep="disable shop" -i

# 2. Xem danh sách file đã thay đổi
git diff <commit-before-disable> <commit-after-disable> --name-only

# 3. Khôi phục từng file cụ thể
git checkout <commit-before-disable> -- apps/web/src/app/shop/page.tsx
git checkout <commit-before-disable> -- apps/web/src/app/cart/page.tsx
# ... và các file khác

# 4. Hoặc khôi phục tất cả files trong một lần
git checkout <commit-before-disable> -- apps/web/src/app/shop/
git checkout <commit-before-disable> -- apps/web/src/app/cart/
git checkout <commit-before-disable> -- apps/web/src/app/checkout/
git checkout <commit-before-disable> -- apps/web/src/app/orders/
git checkout <commit-before-disable> -- apps/web/src/app/payments/
git checkout <commit-before-disable> -- apps/web/src/components/Navbar.tsx
git checkout <commit-before-disable> -- apps/web/src/data/footer.ts
git checkout <commit-before-disable> -- apps/web/src/components/FeaturesGrid.tsx
git checkout <commit-before-disable> -- apps/web/src/components/Hero.tsx
git checkout <commit-before-disable> -- apps/web/src/app/not-found.tsx
git checkout <commit-before-disable> -- apps/web/src/app/shop/layout.tsx
git checkout <commit-before-disable> -- apps/web/src/app/sitemap.ts
```

## Checklist khôi phục

Sau khi khôi phục, kiểm tra:

- [ ] Tất cả shop pages hoạt động (`/shop`, `/shop/ao-thun`, etc.)
- [ ] Cart page hoạt động (`/cart`)
- [ ] Checkout page hoạt động (`/checkout`)
- [ ] Orders pages hoạt động (`/orders`, `/orders/[id]`)
- [ ] Payment pages hoạt động (`/payments/[orderId]`, `/payments/cancel`, `/payments/return`)
- [ ] Navigation menu hiển thị shop links
- [ ] Footer hiển thị shop product links
- [ ] FeaturesGrid có clickable product links
- [ ] Hero component có background image
- [ ] 404 page có shop link
- [ ] FloatingCartButton hiển thị trên shop pages
- [ ] Sitemap bao gồm `/shop` route
- [ ] Không có linter errors
- [ ] Test tất cả flows: add to cart, checkout, payment, order tracking

## Lưu ý

1. **Checkout và Orders detail pages**: Các file này rất dài và phức tạp. Nên khôi phục từ git history thay vì tạo lại từ đầu.

2. **API Integration**: Đảm bảo backend API vẫn hoạt động và có thể xử lý các requests từ frontend.

3. **Environment Variables**: Kiểm tra các biến môi trường liên quan đến payment (PayOS) vẫn còn hợp lệ.

4. **Dependencies**: Đảm bảo tất cả dependencies cần thiết vẫn được cài đặt:
   - `@hookform/resolvers`
   - `react-hook-form`
   - `zod`
   - `sonner`
   - Các hooks từ `@/lib/api/hooks/`

5. **Testing**: Sau khi khôi phục, test kỹ toàn bộ flow:
   - Browse products
   - Add to cart
   - Checkout
   - Payment
   - Order tracking

## Liên hệ

Nếu gặp vấn đề khi khôi phục, kiểm tra:

1. Git history để xem code gốc
2. Backend API logs để debug
3. Browser console để xem frontend errors
