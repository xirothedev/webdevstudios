<!-- c8bcadfb-35b8-4fd4-ab55-faf05d646cd7 49069ee0-0d08-4ad9-b358-abf96af21533 -->

# Kế hoạch tích hợp API Authentication với OAuth Popup Flow

## Tổng quan

Backend đã có đầy đủ endpoints cho authentication:

- Login/Register (đã có hooks)
- OAuth (Google & GitHub) - backend xử lý toàn bộ flow
- Refresh token - cần implement
- Logout/Current user (đã có hooks)

Frontend cần:

- Login/Signup pages với forms (đã có)
- OAuth popup flow (mới)
- Redirect URL handling từ query params (mới)
- Hook tái sử dụng cho OAuth và redirect logic (mới)

## OAuth Popup Flow

1. User click OAuth button → Mở popup window với `${API_URL}/auth/oauth/{provider}`
2. Popup redirect đến OAuth provider (Google/GitHub)
3. OAuth provider callback về `${API_URL}/auth/oauth/{provider}/callback`
4. Backend xử lý, set cookies, và redirect về frontend callback page
5. Callback page (trong popup) gửi message về parent window và tự đóng
6. Parent window nhận message → Reload page → Redirect về `redirect_url` (nếu có)

## Các bước thực hiện

### 1. Tạo OAuth Callback Page (`apps/web/src/app/auth/oauth/callback/page.tsx`)

Tạo page để handle OAuth callback trong popup:

- Page này sẽ được load trong popup window
- Backend redirect về đây sau khi OAuth thành công
- Page gửi `postMessage` về parent window với success status
- Tự động đóng popup sau khi gửi message
- Handle error cases (gửi error message về parent)

**Lưu ý**: Backend cần redirect về `${FRONTEND_URL}/auth/oauth/callback` thay vì home page

### 2. Tạo useOAuth Hook (`apps/web/src/lib/api/hooks/use-auth.ts`)

Tạo hook để handle OAuth popup flow:

- `useOAuth()` hook:
  - Mở popup window với OAuth URL
  - Listen `message` event từ popup
  - Handle success: Invalidate queries, show toast, redirect
  - Handle error: Show error toast
  - Cleanup: Remove event listeners khi unmount

### 3. Tạo useRedirect Hook (`apps/web/src/lib/api/hooks/use-auth.ts` hoặc file riêng)

Tạo hook để handle redirect URL:

- `useRedirect()` hook:
  - Read `redirect_url` từ query params (useSearchParams)
  - Return redirect function
  - Default redirect về home (`/`) nếu không có `redirect_url`
  - Validate redirect URL (chỉ cho phép internal URLs, tránh open redirect)

### 4. Cập nhật SocialButton Component (`apps/web/src/components/auth/SocialButton.tsx`)

Cập nhật để sử dụng OAuth popup:

- Thêm `onClick` handler gọi `useOAuth` hook
- Pass `redirect_url` từ current page query params
- Handle loading state (disable button khi popup đang mở)

### 5. Tích hợp vào Login Page (`apps/web/src/app/auth/login/page.tsx`)

- Sử dụng `useRedirect` hook để get redirect URL
- Pass redirect URL vào `useOAuth` hook
- Sau khi login thành công, redirect về `redirect_url` hoặc home

### 6. Tích hợp vào Register Page (`apps/web/src/app/auth/signup/page.tsx`)

- Sử dụng `useRedirect` hook để get redirect URL
- Pass redirect URL vào `useOAuth` hook
- Sau khi register thành công, redirect về `redirect_url` hoặc login page

### 7. Cập nhật Login/Register Hooks (`apps/web/src/lib/api/hooks/use-auth.ts`)

Cập nhật `useLogin` và `useRegister`:

- Accept `redirectUrl` parameter
- Redirect về `redirectUrl` sau khi success (thay vì hardcode)

### 8. Cập nhật Types (`apps/web/src/types/auth.types.ts`)

Thêm types:

- `RefreshTokenRequest` và `RefreshTokenResponse`
- OAuth provider type: `'google' | 'github'`

### 9. Mở rộng Auth API Client (`apps/web/src/lib/api/auth.api.ts`)

Thêm function:

- `refreshToken(refreshToken?: string)` - Refresh access token

### 10. Cập nhật API Client Interceptor (`apps/web/src/lib/api-client.ts`)

Thêm logic tự động refresh token:

- Intercept 401 responses
- Tự động gọi refresh token API
- Retry original request với token mới
- Handle refresh token expiration (redirect to login)

## Auth Flows

**Login Flow:**

- Form submit → `useLogin(redirectUrl)` → API call → Handle response → Redirect về `redirectUrl` hoặc home
- OAuth: Click button → Popup → OAuth flow → Popup đóng → Reload → Redirect về `redirect_url`

**Register Flow:**

- Form submit → `useRegister(redirectUrl)` → API call → Show success → Redirect về `redirectUrl` hoặc login
- OAuth: Click button → Popup → OAuth flow → Popup đóng → Reload → Redirect về `redirect_url`

**OAuth Popup Flow:**

1. Click button → `useOAuth(provider, redirectUrl)` → Mở popup
2. Popup: Backend OAuth flow → Redirect về `/auth/oauth/callback`
3. Callback page: Gửi `postMessage` → Đóng popup
4. Parent: Nhận message → Invalidate queries → Reload → Redirect về `redirectUrl`

## Files cần tạo/sửa

### Files mới:

- `apps/web/src/app/auth/oauth/callback/page.tsx` - OAuth callback handler trong popup

### Files cần sửa:

- `apps/web/src/types/auth.types.ts` - Thêm refresh token và OAuth types
- `apps/web/src/lib/api/auth.api.ts` - Thêm refresh token function
- `apps/web/src/lib/api-client.ts` - Thêm refresh token interceptor
- `apps/web/src/lib/api/hooks/use-auth.ts` - Thêm `useOAuth` và `useRedirect` hooks, cập nhật `useLogin` và `useRegister`
- `apps/web/src/components/auth/SocialButton.tsx` - Thêm onClick handler với popup flow
- `apps/web/src/app/auth/login/page.tsx` - Tích hợp redirect URL logic
- `apps/web/src/app/auth/signup/page.tsx` - Tích hợp redirect URL logic

## Kiến trúc Flow

```
┌─────────────┐
│   Frontend  │
│   Button    │
└──────┬──────┘
       │ Click → useOAuth()
       ▼
┌──────────────┐
│ Open Popup   │
│ window.open()│
└──────┬───────┘
       │
       ▼
┌──────────────┐      ┌─────────────┐
│ Popup:       │ ───▶ │   Google/   │
│ Backend      │      │   GitHub    │
│ /auth/oauth/ │      │   OAuth     │
│ {provider}   │      └──────┬──────┘
└──────────────┘             │
                             ▼
                    ┌──────────────┐
                    │   Provider   │
                    │   Callback   │
                    └──────┬──────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Backend      │
                    │ /auth/oauth/ │
                    │ {provider}/  │
                    │  callback    │
                    └──────┬──────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Set Cookies  │
                    │ + Redirect   │
                    │ to Frontend  │
                    │ /auth/oauth/ │
                    │ callback     │
                    └──────┬──────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Callback Page│
                    │ (in Popup)    │
                    └──────┬──────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ postMessage  │
                    │ to Parent    │
                    │ + Close Popup│
                    └──────┬──────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Parent Window│
                    │ Receive Msg  │
                    └──────┬──────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Invalidate   │
                    │ Queries      │
                    │ + Reload     │
                    │ + Redirect   │
                    │ to redirect_ │
                    │ url          │
                    └──────────────┘
```

## Lưu ý quan trọng

1. **Popup Window**:
   - Size: ~500x600px, centered
   - Features: `width=500,height=600,left=...,top=...,resizable=yes,scrollbars=yes`
   - Check popup blocked: Handle nếu browser block popup

2. **PostMessage Security**:
   - Verify `event.origin` trước khi xử lý message
   - Chỉ accept messages từ frontend origin
   - Message format: `{ type: 'oauth-success' | 'oauth-error', data?: any }`

3. **Redirect URL Validation**:
   - Chỉ cho phép internal URLs (same origin)
   - Tránh open redirect vulnerability
   - Default về `/` nếu invalid

4. **Backend Redirect URL**:
   - Backend cần redirect về `${FRONTEND_URL}/auth/oauth/callback` thay vì home
   - Có thể pass `redirect_url` trong state parameter của OAuth flow

5. **Cookies**: Backend đã set httpOnly cookies, sẽ tự động có sau khi reload

6. **Error Handling**:
   - Popup errors → Gửi error message về parent
   - Network errors → Show toast
   - User cancels OAuth → Popup đóng, không làm gì

## Dependencies

Không cần thêm dependencies mới, sử dụng:

- `@tanstack/react-query` (đã có)
- `axios` (đã có)
- `next/navigation` (đã có)
- `sonner` cho toast (đã có)
- Browser APIs: `window.open`, `window.postMessage`, `window.addEventListener`

### To-dos

- [ ] Cập nhật auth.types.ts với OAuth và refresh token types
- [ ] Thêm OAuth và refresh token functions vào auth.api.ts
- [ ] Thêm automatic refresh token logic vào api-client.ts interceptor
- [ ] Tạo useOAuth và useRefreshToken hooks trong use-auth.ts
- [ ] Kết nối OAuth buttons với useOAuth hook trong SocialButton.tsx
- [ ] Tạo OAuth callback page để handle OAuth redirect từ backend
- [ ] Test tất cả auth flows: login, register, OAuth, refresh token
