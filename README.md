# WebDev Studios E-commerce Platform

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-Source%20Available-orange.svg)
[![GitHub Sponsors](https://img.shields.io/github/sponsors/xirothedev?logo=github&style=flat&color=ea4aaa)](https://github.com/sponsors/xirothedev)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![Bun](https://img.shields.io/badge/Bun-%3E%3D1.3.14-orange.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black.svg)
![NestJS](https://img.shields.io/badge/NestJS-11.x-ea2845.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)
![Turborepo](https://img.shields.io/badge/Turborepo-2.x-EF4444.svg)
![Prisma](https://img.shields.io/badge/Prisma-7.2.0-2D3748.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-336791.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38B2AC.svg)

A fullstack monorepo e-commerce platform built with Next.js 16 and NestJS 11, featuring a modern tech stack and comprehensive features for both customers and administrators.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Backend Features](#backend-features)
- [Frontend Features](#frontend-features)
- [Getting Started](#getting-started)
- [Development](#development)
- [Project Structure](#project-structure)

## 🎯 Project Overview

WebDev Studios E-commerce Platform is a monorepo fullstack application built with:

- **Frontend**: Next.js 16 (App Router) with TypeScript, Tailwind CSS v4, and motion/react
- **Backend**: NestJS 11 with a controller → service → repository architecture, PostgreSQL, and Prisma ORM
- **Monorepo**: Turborepo for efficient build and development workflows
- **Runtime & Package Manager**: Bun 1.3.x

The platform serves as both a showcase website for WebDev Studios club and an e-commerce store selling 4 fixed products: T-shirt, Mouse Pad, Lanyard, and Keychain.

## 🛠 Tech Stack

### Frontend (`apps/web`)

- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS v4
- **Animations**: motion/react v12.23.26
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **State Management**: React Server Components (RSC-first), TanStack Query
- **API Client**: Axios
- **Forms**: React Hook Form with Zod validation
- **Rich Text Editor**: Tiptap with Markdown support
- **Calendar**: react-big-calendar
- **Charts**: Recharts
- **Notifications**: Sonner

### Backend (`apps/api`)

- **Framework**: NestJS 11.x
- **Language**: TypeScript 5.7.3
- **Architecture**: Controller → Service → Repository per module
- **Database**: PostgreSQL with Prisma 7.2.0
- **Authentication**: JWT with Passport.js
- **OAuth**: Google OAuth 2.0, GitHub OAuth
- **2FA**: TOTP (Time-based One-Time Password) with Speakeasy
- **Validation**: class-validator, class-transformer
- **Caching**: Redis (ioredis)
- **Email**: Nodemailer with @nestjs-modules/mailer
- **File Storage**: Cloudflare R2 (S3-compatible) with AWS SDK v3
- **Image Processing**: Sharp
- **Payment**: PayOS integration
- **API Documentation**: Swagger/OpenAPI
- **Rate Limiting**: @nestjs/throttler with Redis storage
- **Security**: CSRF protection, Helmet, CORS

### DevOps & Tools

- **Monorepo**: Turborepo 2.x
- **Runtime & Package Manager**: Bun 1.3.14
- **Linting**: ESLint 9.x
- **Formatting**: Prettier 3.x
- **Git Hooks**: Husky + lint-staged

## 🏗 Architecture

### Monorepo Structure

```
webdevstudios/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # NestJS backend
├── docs/             # Documentation
├── .cursor/rules/    # Cursor IDE rules
└── package.json      # Root workspace config
```

### Backend Architecture

Each module follows the same layout: `<module>/{controller, module, services/, repo/, dto/, types}`.

- **Controllers**: API endpoints; validate via DTOs and delegate to services
- **Services**: Business logic; own transaction boundaries
- **Repos**: The only persistence surface (`<Entity>Repo`, class-as-contract); domain-verb methods, no raw Prisma in services
- **DTOs**: Request validation (`dto/`); response row shapes in `<module>.types.ts`

### Frontend Architecture

- **App Router**: Next.js 16 App Router with Server Components
- **Server Components First**: Prefer Server Components, use Client Components only when needed
- **Component Structure**:
  - `components/ui/` - shadcn/ui base components
  - `components/wds/` - WebDev Studios specific components
  - `components/shop/` - E-commerce components
  - `components/admin/` - Admin panel components

## 🔧 Backend Features

### Authentication & Authorization (`/v1/auth`)

- ✅ **User Registration**: Email/password registration with email verification
- ✅ **User Login**: Email/password authentication with JWT tokens
- ✅ **OAuth Integration**:
  - Google OAuth 2.0
  - GitHub OAuth
- ✅ **Two-Factor Authentication (2FA)**:
  - TOTP-based 2FA with QR code generation
  - Backup codes generation
  - 2FA verification for login
- ✅ **Password Reset**:
  - Request password reset via email
  - Reset password with token
- ✅ **Email Verification**: Email verification on registration
- ✅ **Token Management**:
  - Access token (15 minutes)
  - Refresh token (7-30 days, configurable)
  - Token refresh endpoint
- ✅ **Session Management**:
  - Multiple active sessions support
  - Session tracking (IP address, user agent)
  - Logout (single session or all sessions)
- ✅ **Current User**: Get authenticated user information

### User Management (`/v1/users`)

- ✅ **Profile Management**:
  - Update own profile (fullName, phone)
  - Get own profile (full data)
- ✅ **Avatar Upload**:
  - Upload avatar image (jpg, png, webp, max 5MB)
  - Automatic image optimization (resize to 400x400px, convert to WebP)
  - Cloudflare R2 storage integration
  - Auto-delete old avatar
- ✅ **User Lookup**:
  - Get user by ID (public data for regular users, full data for own profile/admin)
  - Privacy-aware user data (PublicUserDto vs PrivateUserDto)
- ✅ **User Search**:
  - Search users by query
  - Regular users: search by fullName, receive public data
  - Admin: search by email/fullName, receive full data
- ✅ **Admin User Management** (Admin only):
  - List all users (paginated, filterable by role)
  - Update any user
  - Delete user

### Products (`/v1/products`)

- ✅ **Product Listing**: List all published products with stock information
- ✅ **Product Details**: Get product by slug with stock information
- ✅ **Stock Management**:
  - Get product stock information
  - Filter by size for products with sizes (S, M, L, XL)
- ✅ **Admin Product Management** (Admin only):
  - Update product information (name, description, price, badge, publish status)
  - Update product stock
  - Update product size stocks (bulk update for products with sizes)
- ✅ **4 Fixed Products**:
  - Áo Thun (T-shirt) - with sizes (S, M, L, XL)
  - Pad Chuột (Mouse Pad)
  - Dây Đeo (Lanyard)
  - Móc Khóa (Keychain)

### Shopping Cart (`/v1/cart`)

- ✅ **Get Cart**: Get authenticated user's cart with all items
- ✅ **Add to Cart**:
  - Add product to cart
  - Validate stock before adding
  - Size required for products with sizes
- ✅ **Update Cart Item**: Update cart item quantity with stock validation
- ✅ **Remove from Cart**: Remove item from cart
- ✅ **Clear Cart**: Remove all items from cart

### Orders (`/v1/orders`)

- ✅ **Create Order**:
  - Create order from cart
  - Validate stock
  - Calculate shipping fee
  - Deduct stock on order creation
- ✅ **List User Orders**: Get paginated list of orders for authenticated user
- ✅ **Get Order by ID**: Get order details (owner or admin only)
- ✅ **Cancel Order**:
  - Cancel PENDING orders only
  - Restore stock on cancellation
- ✅ **Admin Order Management** (Admin only):
  - List all orders (paginated, filterable by status)
  - Update order status (PENDING, CONFIRMED, PROCESSING, SHIPPING, DELIVERED, CANCELLED, RETURNED)

### Payments (`/v1/payments`)

- ✅ **Create Payment Link**: Create PayOS payment link for order
- ✅ **Payment Webhook**: Receive and process PayOS webhook notifications
- ✅ **Verify Payment**: Verify payment status by transaction code
- ✅ **Admin Transaction Management** (Admin only):
  - List all payment transactions (paginated, filterable by status)

### Reviews (`/v1/products/:slug/reviews`)

- ✅ **Create Review**:
  - Create review for product
  - User must have purchased the product
  - Rating (1-5 stars) and comment
- ✅ **Get Product Reviews**: Get paginated reviews for a product
- ✅ **Update Review**: Update own review
- ✅ **Delete Review**: Delete review (Admin only)

### Events (`/v1/events`)

- ✅ **List Events**: List all events with optional filters (startDate, endDate, types)
- ✅ **Get Event by ID**: Get single event details
- ✅ **Admin Event Management** (Admin only):
  - Create event
  - Update event
  - Delete event
- ✅ **Event Types**: WORKSHOP, MEETUP, COMPETITION, OTHER

### Storage (`/v1/storage`)

- ✅ **Cloudflare R2 Integration**:
  - Upload files to R2
  - Download files from R2
  - Delete files from R2
- ✅ **Image Optimization**:
  - Automatic image resizing
  - WebP conversion
  - File validation (type, size)
- ✅ **File Validation**:
  - File type validation (jpg, png, webp)
  - File size validation (max 5MB)
  - Custom validation pipe

### Common Features

- ✅ **CSRF Protection**: CSRF token generation and validation
- ✅ **Rate Limiting**:
  - Short: 3 requests/second
  - Medium: 20 requests/10 seconds
  - Long: 100 requests/minute
  - Redis-based storage
  - Custom throttling for specific endpoints (2FA, OAuth, password reset)
- ✅ **Security Logging**: Log security-related events
- ✅ **Request/Response Transformation**: Standardized API responses
- ✅ **Global Exception Handling**: Centralized error handling
- ✅ **Swagger Documentation**: Auto-generated API documentation at `/v1/docs`
- ✅ **CORS**: Configurable CORS settings
- ✅ **Session Management**: Express session with Redis (optional)

## 🎨 Frontend Features

### Public Pages

- ✅ **Home Page** (`/`):
  - Hero section with animations
  - Contact grid
  - Clients section
  - Mission section
  - Stats section
- ✅ **About Page** (`/about`):
  - About hero section
  - About sections with club information
- ✅ **Shop Page** (`/shop`):
  - Product listing
  - Product grid with images
  - Product cards with hover effects
- ✅ **Product Detail Pages** (`/shop/:slug`):
  - Product information
  - Product images
  - Size selection (for products with sizes)
  - Stock information
  - Add to cart functionality
  - Product description (Markdown support)
  - Product reviews
- ✅ **FAQ Page** (`/faq`): Frequently asked questions
- ✅ **Legal Pages** (`/(legal)/*`): Terms, Privacy Policy, etc.

### Authentication Pages

- ✅ **Login Page** (`/auth/login`):
  - Email/password login
  - OAuth login (Google, GitHub)
  - Remember me option
  - 2FA verification (if enabled)
- ✅ **Register Page** (`/auth/register`):
  - User registration form
  - Email verification flow
- ✅ **Password Reset** (`/auth/password-reset`):
  - Request password reset
  - Reset password with token

### User Account Pages (`/account`)

- ✅ **Profile Page** (`/account/profile`):
  - View profile information
  - Update profile (fullName, phone)
  - Upload avatar
- ✅ **Settings Page** (`/account/settings`):
  - Account settings
  - 2FA management
  - Session management
  - Security settings

### Shopping Features

- ✅ **Shopping Cart** (`/cart`):
  - View cart items
  - Update quantities
  - Remove items
  - Proceed to checkout
- ✅ **Checkout Page** (`/checkout`):
  - Shipping address form
  - Order summary
  - Payment integration
- ✅ **Orders Page** (`/orders`):
  - List user orders
  - Order details
  - Order status tracking
  - Cancel order (if PENDING)

### Admin Panel (`/admin`)

- ✅ **Admin Dashboard** (`/admin`):
  - Overview statistics
  - Recent orders
  - Recent users
  - Quick actions
- ✅ **Products Management** (`/admin/products`):
  - List all products
  - Create/Edit product
  - Update product information
  - Update stock
  - Update size stocks
  - Rich text editor for product description (Tiptap with Markdown)
- ✅ **Orders Management** (`/admin/orders`):
  - List all orders
  - Filter by status
  - Update order status
  - View order details
- ✅ **Users Management** (`/admin/users`):
  - List all users
  - Search users
  - Update user information
  - Delete user
  - Filter by role
- ✅ **Transactions Management** (`/admin/transactions`):
  - List all payment transactions
  - Filter by status
  - View transaction details
- ✅ **Events Management** (`/calendar`):
  - Calendar view of events
  - Create/Edit/Delete events
  - Event filtering

### UI Components

- ✅ **Navigation**:
  - Responsive navbar
  - Light/Dark theme variants
  - User menu with dropdown
  - Cart drawer
- ✅ **Product Components**:
  - Product card
  - Product grid
  - Product info
  - Product description (Markdown renderer)
  - Size selector
  - Stock indicator
- ✅ **Cart Components**:
  - Cart drawer
  - Cart item
  - Cart summary
- ✅ **Admin Components**:
  - Admin layout
  - Product editor (with Tiptap Markdown editor)
  - Data tables
  - Charts and statistics
- ✅ **Forms**:
  - React Hook Form integration
  - Zod validation
  - Form error handling
- ✅ **Notifications**: Sonner toast notifications
- ✅ **Loading States**: Skeleton loaders, loading spinners
- ✅ **Error States**: Error messages, error boundaries

### Technical Features

- ✅ **SEO Optimization**:
  - Metadata management
  - Structured data (JSON-LD)
  - Sitemap generation
  - Robots.txt
- ✅ **Image Optimization**:
  - Next.js Image component
  - WebP format
  - Responsive images
- ✅ **Responsive Design**:
  - Mobile-first approach
  - Responsive layouts
  - Touch-friendly interactions
- ✅ **Accessibility**:
  - ARIA labels
  - Keyboard navigation
  - Screen reader support
- ✅ **Performance**:
  - Server Components
  - Code splitting
  - Lazy loading
  - Image optimization
- ✅ **State Management**:
  - React Server Components
  - TanStack Query for client state
  - Context API for global state (Auth, Cart)
- ✅ **CSRF Protection**: CSRF token initialization and management

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- Bun >= 1.3.14
- PostgreSQL database
- Redis (optional, for caching and rate limiting)
- Cloudflare R2 account (for file storage)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd webdevstudios
```

2. **Install dependencies**

```bash
bun install
```

3. **Setup environment variables**

**Backend** (`apps/api/.env`):

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/webdevstudios"

# JWT
JWT_SECRET_KEY="your-secret-key"
JWT_ACCESS_TOKEN_EXPIRES_IN=900000

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# CORS
CORS_ORIGIN=http://localhost:3000

# Session
SESSION_SECRET="your-session-secret"

# OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# Cloudflare R2
R2_ACCOUNT_ID="your-r2-account-id"
R2_ACCESS_KEY_ID="your-r2-access-key-id"
R2_SECRET_ACCESS_KEY="your-r2-secret-access-key"
R2_BUCKET_NAME="your-bucket-name"
R2_PUBLIC_URL="https://your-bucket.r2.dev"

# PayOS
PAYOS_CLIENT_ID="your-payos-client-id"
PAYOS_API_KEY="your-payos-api-key"
PAYOS_CHECKSUM_KEY="your-payos-checksum-key"

# Swagger (Production)
SWAGGER_USERNAME="admin"
SWAGGER_PASSWORD="password"
```

**Frontend** (`apps/web/.env.local`):

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000/v1
```

4. **Setup database**

```bash
cd apps/api
bun run prisma:migrate
bun run prisma:generate
bun run prisma:seed
```

5. **Start development servers**

```bash
# From root directory
bun run dev
```

This will start:

- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- API Docs: http://localhost:4000/v1/docs

## 💻 Development

### Available Scripts

**Root level:**

```bash
bun run dev          # Start all apps in development mode
bun run build        # Build all apps
bun run lint         # Lint all apps
bun run format       # Format code with Prettier
bun run clean        # Clean build artifacts
```

**Frontend** (`apps/web`):

```bash
bun run dev          # Start Next.js dev server
bun run build        # Build for production
bun run start        # Start production server
bun run lint         # Run ESLint
bun run format       # Format code
```

**Backend** (`apps/api`):

```bash
bun run dev              # Start NestJS dev server (watch mode)
bun run build            # Build for production
bun run start            # Start production server
bun run lint             # Run ESLint
bun run prisma:migrate   # Run database migrations
bun run prisma:generate  # Generate Prisma Client
bun run prisma:studio    # Open Prisma Studio
bun run prisma:seed      # Seed database
```

### Code Quality

- **Linting**: ESLint with Next.js and NestJS configs
- **Formatting**: Prettier with Tailwind plugin
- **Type Checking**: TypeScript strict mode
- **Import Sorting**: simple-import-sort (automatic)

### Git Workflow

- **Commit Messages**: `[TYPE] - Description`
  - Types: `feat`, `fix`, `chore`, `refactor`, `docs`, `style`
- **Pre-commit Hooks**: Husky + lint-staged
  - Auto-format code
  - Lint check

## 📁 Project Structure

```
webdevstudios/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/            # App Router pages
│   │   │   ├── components/     # React components
│   │   │   ├── lib/            # Utilities
│   │   │   ├── contexts/       # React contexts
│   │   │   └── types/          # TypeScript types
│   │   ├── public/             # Static assets
│   │   └── package.json
│   └── api/                    # NestJS backend
│       ├── src/
│       │   ├── auth/           # Authentication module
│       │   ├── users/          # User management
│       │   ├── products/       # Products module
│       │   ├── cart/           # Shopping cart
│       │   ├── orders/         # Orders management
│       │   ├── payments/       # Payment processing
│       │   ├── reviews/        # Product reviews
│       │   ├── events/         # Events management
│       │   ├── storage/        # File storage (R2)
│       │   ├── common/        # Shared utilities
│       │   ├── prisma/         # Prisma client & module
│       │   ├── redis/          # Redis service
│       │   ├── mail/           # Email service
│       │   └── main.ts         # Entry point
│       ├── prisma/
│       │   └── schema/         # Prisma schema files
│       └── package.json
├── docs/                       # Documentation
├── .cursor/
│   └── rules/                  # Cursor IDE rules
├── package.json                # Root workspace config
├── bun.lock                    # Bun lockfile
├── turbo.json                  # Turborepo config
└── README.md                    # This file
```

## 📝 Notes

- **Product Schema**: Optimized for 4 fixed products. If expansion is needed, consider rebuilding the schema.
- **Service/Repo Pattern**: Business logic lives in services; repos are the only persistence surface; controllers stay thin.
- **Server Components First**: Frontend prioritizes Server Components, use `'use client'` only when necessary.
- **Type Safety**: TypeScript strict mode, avoid `any`, use enums for constants.
- **Code Quality**: Always run `bun run lint` and `bun run format` after coding.

## 📄 License

Source Available License - Copyright (c) 2026 Xiro The Dev

This project is licensed under a Source Available License. See [LICENSE.md](LICENSE.md) for details.

**Permissions:**

- ✅ View and study for educational purposes
- ✅ Fork for personal reference
- ✅ Share links to this repository

**Prohibited:**

- ❌ Using in production or commercial applications
- ❌ Copying substantial portions into other projects
- ❌ Distributing modified versions

For commercial licensing inquiries, please contact: lethanhtrung.trungle@gmail.com

## 💝 Support

If you find this project helpful, please consider:

- ⭐ **Starring** this repository
- 🐛 **Reporting** bugs or suggesting features
- 💰 **Sponsoring** the project via [GitHub Sponsors](https://github.com/sponsors/xirothedev)

[![GitHub Sponsors](https://img.shields.io/github/sponsors/xirothedev?logo=github&style=for-the-badge&color=ea4aaa)](https://github.com/sponsors/xirothedev)

## 👥 Contributors

- **Xiro The Dev** - [@xirothedev](https://github.com/xirothedev) - Creator & Maintainer

See [CONTRIBUTING.md](.github/CONTRIBUTING.md) for how to contribute.

---

For more detailed documentation, see the `docs/` folder.
