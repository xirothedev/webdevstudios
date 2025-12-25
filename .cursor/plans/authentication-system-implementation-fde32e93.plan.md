<!-- fde32e93-6387-4ee4-8baa-e7c10bf38e46 ae926cbb-435a-452c-9ecc-c4893c60e477 -->

# Authentication System Implementation Plan

## Overview

Implement a complete authentication system for the NestJS API following CQRS architecture pattern. The system will support:

- User registration and login
- Email verification via magic link
- Two-Factor Authentication (TOTP only)
- OAuth login (Google & GitHub) with popup flow
- Password reset functionality
- Session management with device tracking

## Architecture

The authentication module will follow CQRS pattern with the following structure:

```
src/auth/
├── commands/
│   ├── register/
│   ├── login/
│   ├── verify-email/
│   ├── enable-2fa/
│   ├── verify-2fa/
│   ├── oauth-callback/
│   └── reset-password/
├── queries/
│   ├── get-current-user/
│   └── get-sessions/
├── domain/
│   ├── user.entity.ts
│   └── session.entity.ts
├── infrastructure/
│   ├── user.repository.ts
│   ├── session.repository.ts
│   └── token.service.ts
├── strategies/
│   ├── jwt.strategy.ts
│   ├── google.strategy.ts
│   └── github.strategy.ts
├── guards/
│   ├── jwt-auth.guard.ts (already exists)
│   └── mfa.guard.ts
├── decorators/
│   ├── current-user.decorator.ts
│   └── public.decorator.ts (already exists)
├── dtos/
│   ├── register.dto.ts
│   ├── login.dto.ts
│   └── ...
└── auth.module.ts
```

## Implementation Steps

### Phase 1: Core Infrastructure

#### 1.1 Create Auth Module Structure

- Create `src/auth/auth.module.ts` with CQRS setup
- Import required modules: `CqrsModule`, `JwtModule`, `PassportModule`, `PrismaModule`, `MailModule`
- Configure Passport strategies (JWT, Google, GitHub)

#### 1.2 Create Repositories

- **File**: `src/auth/infrastructure/user.repository.ts`
  - Methods: `findByEmail()`, `findById()`, `create()`, `update()`, `verifyEmail()`
  - Use Prisma client for database operations

- **File**: `src/auth/infrastructure/session.repository.ts`
  - Methods: `create()`, `findByToken()`, `revoke()`, `findByUserId()`, `cleanupExpired()`
  - Handle session lifecycle

#### 1.3 Create Token Service

- **File**: `src/auth/infrastructure/token.service.ts`
  - Methods: `generateAccessToken()`, `generateRefreshToken()`, `verifyToken()`, `generateEmailVerificationToken()`, `generatePasswordResetToken()`
  - Use JWT for tokens, crypto for secure random tokens

#### 1.4 Create TOTP Service

- **File**: `src/auth/infrastructure/totp.service.ts`
  - Methods: `generateSecret()`, `generateQRCode()`, `verifyCode()`
  - Use `speakeasy` library for TOTP implementation

### Phase 2: Registration & Email Verification

#### 2.1 Register Command

- **File**: `src/auth/commands/register/register.command.ts`
  - Properties: `email`, `password`, `fullName`, `phone?`
  - Validation with class-validator

- **File**: `src/auth/commands/register/register.handler.ts`
  - Hash password with argon2
  - Create user with `emailVerified: false`
  - Generate email verification token
  - Send verification email via MailService
  - Return user ID

#### 2.2 Verify Email Command

- **File**: `src/auth/commands/verify-email/verify-email.command.ts`
  - Properties: `token` (from magic link)

- **File**: `src/auth/commands/verify-email/verify-email.handler.ts`
  - Verify token
  - Update user `emailVerified: true`
  - Optionally auto-login user

### Phase 3: Login & Session Management

#### 3.1 Login Command

- **File**: `src/auth/commands/login/login.command.ts`
  - Properties: `email`, `password`, `rememberMe?`

- **File**: `src/auth/commands/login/login.handler.ts`
  - Verify credentials
  - Check email verification status
  - Check if 2FA is enabled
  - Create session and device record
  - Generate access & refresh tokens
  - Return tokens and user info (or 2FA challenge if enabled)

#### 3.2 Session Management

- Track device information (user agent, IP, fingerprint)
- Store sessions in database
- Support refresh token rotation
- Implement session revocation

### Phase 4: Two-Factor Authentication (TOTP)

#### 4.1 Enable 2FA Command

- **File**: `src/auth/commands/enable-2fa/enable-2fa.command.ts`
  - Properties: `userId` (from current user)

- **File**: `src/auth/commands/enable-2fa/enable-2fa.handler.ts`
  - Generate TOTP secret
  - Create QR code URL
  - Store secret (encrypted) in UserMFAMethod
  - Generate backup codes
  - Return QR code and backup codes

#### 4.2 Verify 2FA Command

- **File**: `src/auth/commands/verify-2fa/verify-2fa.command.ts`
  - Properties: `code` (6-digit TOTP), `sessionId?` (for login flow)

- **File**: `src/auth/commands/verify-2fa/verify-2fa.handler.ts`
  - Verify TOTP code
  - If login flow: complete login, create session
  - If setup flow: mark MFA method as verified
  - Handle backup codes

#### 4.3 MFA Guard

- **File**: `src/auth/guards/mfa.guard.ts`
  - Check if user has 2FA enabled
  - Require 2FA verification for protected routes

### Phase 5: OAuth Integration (Google & GitHub)

#### 5.1 OAuth Strategies

- **File**: `src/auth/strategies/google.strategy.ts`
  - Configure Google OAuth 2.0
  - Extract user info from Google profile
  - Handle popup flow

- **File**: `src/auth/strategies/github.strategy.ts`
  - Configure GitHub OAuth
  - Extract user info from GitHub profile
  - Handle popup flow

#### 5.2 OAuth Callback Command

- **File**: `src/auth/commands/oauth-callback/oauth-callback.command.ts`
  - Properties: `provider` (GOOGLE | GITHUB), `code`, `state?`

- **File**: `src/auth/commands/oauth-callback/oauth-callback.handler.ts`
  - Exchange code for access token
  - Fetch user profile from provider
  - Check if ExternalAccount exists
  - If exists: login user
  - If not: create user + ExternalAccount
  - Create session
  - Return tokens

### Phase 6: Password Reset

#### 6.1 Request Password Reset Command

- **File**: `src/auth/commands/request-password-reset/request-password-reset.command.ts`
  - Properties: `email`

- **File**: `src/auth/commands/request-password-reset/request-password-reset.handler.ts`
  - Find user by email
  - Generate reset token
  - Send reset email with magic link
  - Store token with expiration

#### 6.2 Reset Password Command

- **File**: `src/auth/commands/reset-password/reset-password.command.ts`
  - Properties: `token`, `newPassword`

- **File**: `src/auth/commands/reset-password/reset-password.handler.ts`
  - Verify token
  - Hash new password
  - Update user password
  - Revoke all sessions (security)
  - Invalidate token

### Phase 7: Queries & Controllers

#### 7.1 Get Current User Query

- **File**: `src/auth/queries/get-current-user/get-current-user.query.ts`
- **File**: `src/auth/queries/get-current-user/get-current-user.handler.ts`
  - Return current authenticated user info

#### 7.2 Get Sessions Query

- **File**: `src/auth/queries/get-sessions/get-sessions.query.ts`
- **File**: `src/auth/queries/get-sessions/get-sessions.handler.ts`
  - Return all active sessions for current user

#### 7.3 Auth Controller

- **File**: `src/auth/auth.controller.ts`
  - Endpoints:
    - `POST /auth/register` - Register
    - `POST /auth/login` - Login
    - `GET /auth/verify-email/:token` - Verify email
    - `POST /auth/refresh` - Refresh token
    - `POST /auth/logout` - Logout
    - `GET /auth/me` - Get current user
    - `GET /auth/sessions` - Get sessions
    - `POST /auth/2fa/enable` - Enable 2FA
    - `POST /auth/2fa/verify` - Verify 2FA
    - `GET /auth/oauth/google` - Initiate Google OAuth
    - `GET /auth/oauth/github` - Initiate GitHub OAuth
    - `POST /auth/oauth/callback` - OAuth callback
    - `POST /auth/password/reset-request` - Request password reset
    - `POST /auth/password/reset` - Reset password

### Phase 8: Email Templates

#### 8.1 Email Templates

- **File**: `src/auth/templates/email-verification.hbs`
  - Magic link with token
  - Expiration notice

- **File**: `src/auth/templates/password-reset.hbs`
  - Reset link with token
  - Security notice

- **File**: `src/auth/templates/welcome.hbs`
  - Welcome message after registration

### Phase 9: DTOs & Validation

#### 9.1 Create DTOs

- `register.dto.ts` - Email, password, fullName, phone validation
- `login.dto.ts` - Email, password validation
- `verify-email.dto.ts` - Token validation
- `enable-2fa.dto.ts` - User ID validation
- `verify-2fa.dto.ts` - Code validation
- `oauth-callback.dto.ts` - Provider, code, state validation
- `reset-password.dto.ts` - Token, newPassword validation
- `request-password-reset.dto.ts` - Email validation

### Phase 10: Environment Variables

Add to `.env.example`:

```
# JWT
JWT_SECRET_KEY=...
JWT_ACCESS_TOKEN_EXPIRES_IN=3600
JWT_REFRESH_TOKEN_EXPIRES_IN=604800

# OAuth Google
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:4000/v1/auth/oauth/google/callback

# OAuth GitHub
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_CALLBACK_URL=http://localhost:4000/v1/auth/oauth/github/callback

# Email Verification
EMAIL_VERIFICATION_TOKEN_EXPIRES_IN=86400
PASSWORD_RESET_TOKEN_EXPIRES_IN=3600

# Frontend URLs
FRONTEND_URL=http://localhost:3000
EMAIL_VERIFICATION_URL=${FRONTEND_URL}/auth/verify-email
PASSWORD_RESET_URL=${FRONTEND_URL}/auth/reset-password
```

## Dependencies to Install

```bash
cd apps/api
pnpm add @nestjs/passport passport passport-jwt passport-google-oauth20 @nestjs-modules/mailer nodemailer
pnpm add -D @types/passport-jwt @types/passport-google-oauth20
pnpm add speakeasy qrcode argon2
pnpm add -D @types/speakeasy @types/qrcode
```

## Database Migrations

After implementation, run:

```bash
cd apps/api
pnpm prisma:migrate
```

## Testing Strategy

1. Unit tests for handlers
2. Integration tests for auth flows
3. E2E tests for complete authentication flows

## Security Considerations

1. **Password Hashing**: Use argon2 (already in dependencies)
2. **Token Security**: JWT with proper expiration, refresh token rotation
3. **Email Verification**: Required before login
4. **2FA**: Optional but recommended for sensitive operations
5. **Session Management**: Track devices, support revocation
6. **OAuth State**: Validate state parameter to prevent CSRF
7. **Rate Limiting**: Implement for login, register, password reset endpoints
8. **Token Storage**: Use httpOnly cookies for refresh tokens (optional)

## Files to Create/Modify

### New Files (30+ files)

- Auth module structure (commands, queries, handlers, DTOs)
- Strategies, guards, decorators
- Repositories, services
- Email templates

### Modified Files

- `apps/api/src/app.module.ts` - Already imports AuthModule (verify it exists)
- `apps/api/prisma/schema/auth.prisma` - Already has models (verify completeness)

## Success Criteria

- [ ] User can register with email/password
- [ ] User receives email verification link
- [ ] User can verify email and login
- [ ] User can login with email/password
- [ ] User can enable 2FA (TOTP)
- [ ] User can login with 2FA
- [ ] User can login with Google OAuth (popup)
- [ ] User can login with GitHub OAuth (popup)
- [ ] User can request password reset
- [ ] User can reset password with token
- [ ] Sessions are tracked and manageable
- [ ] All endpoints follow CQRS pattern
- [ ] All DTOs have proper validation
- [ ] Email templates are functional
- [ ] Security best practices are followed

### To-dos

- [ ] Tạo project-overview.mdc - Tổng quan dự án, tech stack, kiến trúc
- [ ] Tạo frontend-rules.mdc - Rules cho Next.js 16, React, Tailwind CSS v4
- [ ] Tạo database-rules.mdc - Rules cho Prisma schema, migrations
- [ ] Tạo development-workflow.mdc - Workflow, conventions, best practices
- [ ] Tạo monorepo-structure.mdc - Cấu trúc monorepo, Turborepo config
