# L6 — Next.js (App Router)

## 6.1 Rendering spectrum

| Kiểu | dữ liệu dựng ở đâu | revalidate | chọn khi |
|---|---|---|---|
| SSG | build time | không bao giờ | blog, docs |
| ISR | build + nền | `revalidate: 3600` hoặc by-tag | trang sản phẩm (ngàn trang, đổi chậm) |
| SSR | mỗi request | luôn | trang cá nhân hoá, có auth |
| CSR | browser | tuỳ client | dashboard sau login, SEO không cần |
| PPR | tĩnh + hole streaming | lai | trang có phần chung + phần theo user |

Một trang có CẢ hai phần: marketing (tĩnh) + giỏ hàng (động) → static shell + Suspense hole cho phần động (đây là bản chất PPR).

## 6.2 App Router routing

```
app/
├── layout.tsx            # giữ nguyên khi route con đổi — không remount
├── loading.tsx           # Suspense fallback tự động cho cấp này
├── (marketing)/page.tsx  # route group: không tạo URL segment
├── dashboard/page.tsx
└── @modal/(.)photos/[id]/route.ts  # intercepting route: modal không navigation mới
```
Parallel routes (`@slot`) render nhiều layout song song; intercepting route (`(.)`) bắt link nội bộ để hiển thị modal thay vì sang trang.

## 6.3 Server vs Client components

```tsx
// page.tsx (server) — code này KHÔNG xuống browser: query, secret đều an toàn
import 'server-only';
export default async function Page() {
  const products = await db.product.findMany();   // Prisma chạy thẳng
  return <ProductList products={products} onBuy={addToCart} />; // props phải serialize được
}
// 'use client' ở ĐÂU thì JS bundle bắt đầu từ ĐÓ
```
Boundary rules: Server component KHÔNG dùng `useState`, không chạy `onClick`. props truyền xuống là snapshot tại thời điểm render server — không phải reactive binding.

Quy tắc tổ chức: giữ "use client" càng sâu càng tốt; page là server → push tương tác xuống lá.

## 6.4 Server Actions

```tsx
<form action={async (formData) => {
  'use server';
  const data = createOrderSchema.parse(formData.get('q') ?? '');  // validate như public API
  await createOrder(data);
  revalidateTag('orders');
  redirect('/orders');
}}>
  <input name="q" />
</form>
```
Server Action = POST endpoint công khai đội lốt form. Interview điểm cao: nói rõ nó phải auth + rate-limit + validate y hệt REST. Progressive enhancement: form gửi được khi JS chưa load.

## 6.5 Caching layers — chỗ 90% hiểu sai

4 tầng, từ trong ra ngoài:
1. **Data Cache**: kết quả `fetch()` được cache XUYÊN request (next build, ISR, action revalidate) — `unstable_cache` cache cho hàm không phải fetch
2. **Full Route Cache**: cả rendered HTML của route tĩnh — cache lúc build, chỉ cho route không động (không dùng `cookies()`/`headers()`)
3. **Router Cache** (client): router giữ route đã visit trong session (SPA nav nhanh, quay lại instant)
4. CDN/browser headers bạn tự đặt

Next 15 đổi default: `fetch` không còn cache tự động (default `no-store`) — nói được chi tiết tiết đổi này = biết trend.
`revalidatePath('/p/1')` vs `revalidateTag('product:1')` vs `cacheLife/profile`: độ hạt của tag nhỏ hơn, là cách chính xác cho "1 sản phẩm đổi, đừng dựng lại 1000 trang khác".

## 6.6 Data fetching

```tsx
// trong 1 request: các await tuần tự = TTFB cộng dồn → dùng Suspense để stream sớm
export default function Page() {
  return <Suspense fallback={<Skeleton/>}><Banner/></Suspense>  // banner render ngay
         <Suspense fallback={...}><Recommends/></Suspense>       // chậm → stream sau
}
```
Cùng level nhiều fetch độc lập: `await Promise.all([a, b])` hoặc để mỗi component tự await. Dedupe chỉ ăn trong CÙNG request khi URL+options giống hệt.

## 6.7 Middleware

```ts
export const config = { matcher: '/((?!_next/|api/).*)' };  // trừ asset — chạy middleware cho asset = tiền triệu mỗi ngày
export function middleware(req: NextRequest) {
  const locale = req.cookies.get('lng') ?? req.headers.get('accept-language');
  return NextResponse.rewrite(new URL(`/${locale}${req.nextUrl.pathname}`, req.url));
}
```
Middleware chạy edge runtime, MỖI request, trước cache. Đừng query DB trong middleware — thêm 1 round-trip mọi asset.

## 6.8 next/image & next/font

```tsx
<Image src="/p.jpg" width={800} height={600} priority alt="..."/>
// width/height trên image => browser reserve chỗ => CLS = 0 (chính là 4.4)
// src=/p.jpg 800w, .../p.jpg?w=384 384w... tự sinh từ config image
// next/font: fetch font lúc build, self-host, font-display: swap + size-adjust tự động => không layout shift
```
Trade-off: `qualities` config để chặn abuse (image optimizer là endpoint chạy code — nếu mở mọi URL ngoài = SSRF + CPU DoS → bật `remotePatterns` chặt).

## 6.9 Streaming & dynamic import

```tsx
const HeavyChart = dynamic(() => import('./HeavyChart'), { ssr: false });
// ssr:false = client-only. Dùng khi component CẦN window/chart lib.
// LƯU Ý: ssr:true mặc định — dùng dynamic cho component nặng nhưng CÓ SSR mới đáng.
// Dynamic không phải công cụ "tối ưu" nếu component không lớn: bundle đã split tự nhiên theo route.
```

## 6.10 Error handling

`error.tsx` = error boundary cho cấp segment, `global-error.tsx` khi cả root layout hỏng, `not-found.tsx` + `notFound()` throw. Server error không lộ message — `error.digest` (hash) để trace log.

## 6.11 i18n

`next-intl`: middleware locale detect → `[locale]` segment → message catalog JSON per-locale. Cache: `Cache-Control` phải `Vary: Accept-Language` hoặc encode locale trong URL (đổi URL = cache key khác — an toàn hơn Vary). Org rule: không hardcode string trong component.

## 6.12 Deploy & cache trên serverless

ISR cache mặc định nằm TRÊN instance. 10 lambda → mỗi lambda cache riêng → user A thấy trang revalidate, user B thấy trang cũ. Fix: `use cache` + cache handler (Redis/S3) để cache tầng data dùng chung, hoặc tự nhận "chấp nhận được" — trade-off nói được = điểm.

## 6.13 Migration Pages → App Router

| Pages | App tương đương |
|---|---|
| `getStaticProps` | RSC + `export const revalidate` |
| `getServerSideProps` | RSC `await` |
| `_app.tsx` | `app/layout.tsx` |
| `next/head` | metadata export |
| `useRouter` (pages) | từ `next/navigation`, API khác (`push` → `router.push`, query phải qua `useSearchParams` + Suspense — vì nó đọc ở runtime) |

**Check cuối tầng:** vẽ đường đi request: Edge middleware → cache hit/miss → RSC render (Promise chain, Suspense boundary) → HTML+RSC payload → hydration. Nói rõ tầng nào trả HTML, tầng nào trả payload.
