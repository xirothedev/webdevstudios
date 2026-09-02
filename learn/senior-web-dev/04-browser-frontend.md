# L4 — Browser & frontend foundations

## 4.1 Critical rendering path

HTML parse → dựng DOM; CSS (render-blocking) → dựng CSSOM; ghép → render tree → layout (vị trí/kích thước) → paint (vẽ pixel) → composite (GPU ghép layer).

Ví dụ: `<link rel=stylesheet>` ở head chặn render — browser không vẽ gì cho tới khi CSSOM xong (nếu vẽ trước = flash của style sai). JS ở head không defer chặn PARSER (nó có thể document.write).

## 4.2 Reflow vs repaint vs composite

- reflow (layout lại): đổi width/height/top/left, đọc `offsetHeight` sau khi ghi style
- repaint: đổi màu, shadow — không đổi hình học
- composite-only: `transform: scale()`, `opacity` — chạy trên compositor thread, không chạm layout/paint

```js
// layout thrashing — đọc/ghi xen kẽ từng dòng = N lần reflow
rows.forEach(r => { r.style.height = r.offsetHeight * 2 + 'px'; });
// fix: đọc hết, rồi ghi hết
const hs = rows.map(r => r.offsetHeight);
rows.forEach((r, i) => r.style.height = hs[i] * 2 + 'px');
```
`will-change: transform` tạo layer riêng NHƯNG ăn GPU memory — thêm bừa = slower, không faster.

## 4.3 Script loading

```html
<script src="analytics.js" defer></script>  <!-- chạy sau parse, theo thứ tự -->
<script src="feature.js" async></script>    <!-- tải song song, chạy ngay khi xong — KHÔNG đảm bảo thứ tự -->
<script type="module">…</script>            <!-- mặc định là defer -->
```
Inline handler trong module: `el.addEventListener` trong code, không `onclick=""` trong HTML (CSP, L8/L11).

## 4.4 Core Web Vitals — mỗi cái kể được 3 nguyên nhân

**LCP** ( Largest Contentful Paint < 2.5s): ① server chậm (TTFB) ② ảnh LCP lazy-load sai (`loading=lazy` trên ảnh đầu trang = tự phá) ③ font/text render chậm.
**INP** (< 200ms): task JS > 50ms trên main thread; click handler gọi code nặng đồng bộ; hydration của Next làm đóng băng main thread. Fix: `useTransition`, `scheduler.yield`, đẩy Web Worker.
**CLS** (< 0.1): ① ảnh không có width/height ② banner chèn trên nội dung ③ `font-display: swap` làm text nhảy — fix bằng `size-adjust`.

## 4.5 Resource loading

```html
<link rel="preload" as="font" href="/f.woff2" crossorigin>  <!-- font đang chặn text -->
<link rel="preconnect" href="https://api.example.com">       <!-- trả trước DNS+TLS -->
<img src="/hero.jpg" fetchpriority="high" width=1200 height=630>  <!-- LCP candidate: KHÔNG lazy -->
<img src="/below.jpg" loading="lazy" width=800 height=600>          <!-- dưới fold: lazy đúng -->
<img srcset="/s.jpg 400w, /m.jpg 800w" sizes="(max-width:600px) 100vw, 800w">
```
Quy tắc một câu: LCP element = `fetchpriority=high` + `priority` (Next), mọi thứ khác lazy/prefetch.

## 4.6 Storage

| | dung lượng | async | gửi lên server? | dùng khi |
|---|---|---|---|---|
| cookie | ~4KB | sync | CÓ, mỗi request | session token (HttpOnly) |
| localStorage | ~5MB | sync, chặn main thread | không | theme, flag không nhạy |
| IndexedDB | hàng trăm MB | async | không | offline data, file lớn |
| Cache API | lớn | async | không | service worker cache response |

Cấm: JWT vào localStorage (XSS đọc sạch) — token nằm cookie HttpOnly hoặc memory.

## 4.7 Accessibility

```html
<button onClick={submit}>Gửi</button>        <!-- free: focus, Enter/Space, aria -->
<div onClick={submit}>Gửi</div>              <!-- phải tự thêm tabindex, role, keydown — never -->
<input id="q" aria-describedby="q-hint"><div id="q-hint">Ít nhất 8 ký tự</div>
```
Focus management: mở dialog → focus vào phần tử đầu; đóng → trả focus về nút mở (`<dialog>` + `showModal()` làm sẵn cả hai).

## 4.8 Security browser

```http
Content-Security-Policy: default-src 'self'; script-src 'nonce-{R}'
```
```html
<script nonce="{R}">…</script>   <!-- inline chỉ chạy khi đúng nonce — Next tự sinh khi bật CSP -->
```
`unsafe-inline` = CSP để trang trí. X-Frame-Options cũ → `frame-ancestors 'none'`. `<a target=_blank>` → `rel="noopener"` (trang mới không giữ `window.opener`).

## 4.9 Navigation

History API: `pushState` đổi URL không reload — React Router build trên `popstate`.
PRG (Post/Redirect/Get): sau POST → redirect 303 → GET. Refresh không resubmit form. Server Actions của Next làm đúng pattern này mặc định.

## 4.10 Modern APIs nên biết mặt

`<dialog>` native (backdrop, ESC, focus trap), popover API, anchor positioning (`anchor-name` + `position-anchor` — tooltip không cần JS tính toạ độ), container queries (`@container (min-width: 40rem)`), `:has()` ("parent selector": `form:has(:invalid)`), View Transitions API, `Intl.DateTimeFormat`/`Intl.NumberFormat` cho i18n khỏi thư viện.
