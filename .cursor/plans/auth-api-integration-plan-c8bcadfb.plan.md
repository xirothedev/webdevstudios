<!-- c8bcadfb-35b8-4fd4-ab55-faf05d646cd7 f4b21232-1fbd-4615-8ad8-e7a89bc898a8 -->

# Kế hoạch implement các tính năng Auth còn lại

## Tổng quan

Backend đã có đầy đủ endpoints:

- ✅ Login/Register - Đã implement
- ✅ OAuth - Đã implement
- ✅ Verify Email - Đã implement
- ❌ Forgot Password (Request Reset) - Cần implement
- ❌ Reset Password - Cần implement
- ❌ 2FA Verification (Login flow) - Cần implement
- ❌ 2FA Enable (Settings) - Có thể làm sau
- ❌ Sessions Management - Có thể làm sau

## Các tính năng cần implement

### 1. Forgot Password Flow

- User nhập email → Gửi request reset password
- Backend gửi email với reset token
- User click link trong email → Redirect về reset password page

### 2. Reset Password Flow

- User nhập token (từ URL) và password mới
- Submit → Backend verify token và update password
- Redirect về login page

### 3. 2FA Verification Flow

- User login với 2FA enabled → Redirect đến 2FA page
- User nhập 6-digit code từ authenticator app
- Verify → Complete login

## Các bước thực hiện

### Phase 0: Fix Login Redirect Bug

#### 0.1. Fix useRedirect Hook (`apps/web/src/lib/api/hooks/use-auth.ts`)

- Vấn đề: `useRedirect()` đang return `'/'` làm default ngay cả khi không có `redirect_url` trong query params
- Giải pháp: Chỉ return `'/'` khi thực sự cần redirect, không nên default về `/` khi user đang ở auth pages
- Thay đổi: `getRedirectUrl()` chỉ return `redirectUrl` nếu có, không default về `/`
- Cập nhật `useLogin` và `useRegister` để chỉ redirect khi có `redirectUrl` thực sự

#### 0.2. Fix Login Success Redirect (`apps/web/src/lib/api/hooks/use-auth.ts`)

- **Vấn đề**: Login thành công luôn redirect về `redirectUrl || '/'` ngay cả khi không có redirectUrl, dẫn đến tự động redirect về home page mà chưa hề đăng nhập
- **Giải pháp**:
- Chỉ redirect khi có `redirectUrl` rõ ràng từ query params
- Nếu không có `redirectUrl`, chỉ invalidate queries và show success message, không redirect
- User có thể tự quyết định đi đâu sau khi login thành công (có thể thêm button "Đi đến trang chủ" nếu muốn)

#### 0.3. Fix Register Success Redirect (`apps/web/src/lib/api/hooks/use-auth.ts`)

- **Vấn đề**: Tương tự như login, register cũng có thể có vấn đề redirect
- **Giải pháp**: Áp dụng logic tương tự như login - chỉ redirect khi có `redirectUrl`, nếu không thì redirect về login page (vì register xong cần verify email)

### Phase 1: Forgot Password & Reset Password

#### 1.1. Cập nhật Types (`apps/web/src/types/auth.types.ts`)

- Thêm `RequestPasswordResetRequest` interface
- Thêm `ResetPasswordRequest` interface
- Thêm `RequestPasswordResetResponse` interface
- Thêm `ResetPasswordResponse` interface

#### 1.2. Mở rộng Auth API Client (`apps/web/src/lib/api/auth.api.ts`)

- Thêm `requestPasswordReset(email: string)` function
- Thêm `resetPassword(token: string, newPassword: string)` function

#### 1.3. Tạo Auth Hooks (`apps/web/src/lib/api/hooks/use-auth.ts`)

- Thêm `useRequestPasswordReset()` hook
- Thêm `useResetPassword()` hook

#### 1.4. Tạo Forgot Password Page (`apps/web/src/app/auth/forgot-password/page.tsx`)

- Form với email input
- Validation với Zod
- Sử dụng `useRequestPasswordReset` hook
- Show success message sau khi submit
- Link quay lại login page

#### 1.5. Tạo Reset Password Page (`apps/web/src/app/auth/reset-password/page.tsx`)

- Read token từ query params
- Form với password và confirm password inputs
- Validation với Zod (password match, min length)
- Sử dụng `useResetPassword` hook
- Show success message và redirect về login
- Handle error cases (invalid/expired token)

### Phase 2: 2FA Verification

#### 2.1. Cập nhật Types (`apps/web/src/types/auth.types.ts`)

- Thêm `Verify2FARequest` interface
- Thêm `Verify2FAResponse` interface
- Thêm `Enable2FAResponse` interface (cho tương lai)

#### 2.2. Mở rộng Auth API Client (`apps/web/src/lib/api/auth.api.ts`)

- Thêm `verify2FA(code: string, sessionId?: string)` function

#### 2.3. Tạo Auth Hooks (`apps/web/src/lib/api/hooks/use-auth.ts`)

- Thêm `useVerify2FA()` hook
- Cập nhật `useLogin` để handle 2FA redirect (đã có sẵn)

#### 2.4. Tạo 2FA Verification Page (`apps/web/src/app/auth/2fa/page.tsx`)

- Form với 6-digit code input
- Auto-focus và auto-submit khi đủ 6 digits
- Sử dụng `useVerify2FA` hook
- Read `sessionId` từ query params hoặc store trong sessionStorage
- Show loading state
- Handle success: Invalidate queries, redirect về home
- Handle error: Show error message, allow retry

### Phase 3: Optional Features (Có thể làm sau)

#### 3.1. Sessions Management

- GET /auth/sessions endpoint
- Display active sessions
- Allow revoke sessions

#### 3.2. 2FA Enable (Settings)

- POST /auth/2fa/enable endpoint
- Display QR code
- Show backup codes
- Verify setup

## Files cần tạo/sửa

### Files mới:

- `apps/web/src/app/auth/forgot-password/page.tsx` - Forgot password form
- `apps/web/src/app/auth/reset-password/page.tsx` - Reset password form với token
- `apps/web/src/app/auth/2fa/page.tsx` - 2FA verification form

### Files cần sửa:

- `apps/web/src/types/auth.types.ts` - Thêm password reset và 2FA types
- `apps/web/src/lib/api/auth.api.ts` - Thêm password reset và 2FA API functions
- `apps/web/src/lib/api/hooks/use-auth.ts` - Thêm password reset và 2FA hooks
- `apps/web/src/app/auth/login/page.tsx` - Thêm link "Quên mật khẩu?"

## Auth Flows

**Forgot Password Flow:**

1. User click "Quên mật khẩu?" trên login page
2. Redirect đến `/auth/forgot-password`
3. User nhập email → Submit
4. Show success message: "Vui lòng kiểm tra email để reset mật khẩu"
5. Backend gửi email với reset link: `${SITE_URL}/auth/reset-password?token=...`
6. User click link → Redirect về reset password page

**Reset Password Flow:**

1. User vào `/auth/reset-password?token=...`
2. Read token từ query params
3. User nhập password mới và confirm
4. Submit → Backend verify token và update password
5. Show success message → Redirect về login page

**2FA Verification Flow:**

1. User login với 2FA enabled
2. `useLogin` detect `requires2FA: true`
3. Redirect đến `/auth/2fa?sessionId=...` (nếu có)
4. User nhập 6-digit code
5. Submit → Backend verify code
6. Success → Set cookies, invalidate queries, redirect về home

## UI/UX Considerations

### Forgot Password Page:

- Simple form với email input
- Success state: Show message với icon
- Link quay lại login
- Consistent với login/signup design (glass-card style)

### Reset Password Page:

- Form với password và confirm password
- Show token validation error nếu invalid
- Success state: Show message và auto-redirect
- Consistent với login/signup design

### 2FA Page:

- 6-digit code input (có thể dùng 6 separate inputs hoặc 1 input với pattern)
- Auto-focus và auto-submit khi đủ 6 digits
- Loading state khi verifying
- Error state với retry option
- Link "Quay lại đăng nhập" nếu user muốn cancel

## Security Considerations

1. **Token Validation**: Reset password token chỉ valid một lần và có expiration
2. **Rate Limiting**: Backend đã handle rate limiting cho password reset requests
3. **2FA Code**: 6-digit code có expiration time (thường 30 giây)
4. **Session ID**: 2FA verification cần sessionId để link với login attempt

## Dependencies

Không cần thêm dependencies mới, sử dụng:

- `@tanstack/react-query` (đã có)
- `react-hook-form` với `zodResolver` (đã có)
- `zod` (đã có)
- `sonner` cho toast (đã có)
- `next/navigation` (đã có)

### To-dos

- [ ] Cập nhật auth.types.ts với password reset types
- [ ] Thêm requestPasswordReset và resetPassword functions vào auth.api.ts
- [ ] Tạo useRequestPasswordReset và useResetPassword hooks
- [ ] Tạo forgot password page với form và validation
- [ ] Tạo reset password page với token validation
- [ ] Thêm link Quên mật khẩu? vào login page
- [ ] Cập nhật auth.types.ts với 2FA types
- [ ] Thêm verify2FA function vào auth.api.ts
- [ ] Tạo useVerify2FA hook
- [ ] Tạo 2FA verification page với 6-digit code input
- [ ] Test tất cả auth flows: forgot password, reset password, 2FA
