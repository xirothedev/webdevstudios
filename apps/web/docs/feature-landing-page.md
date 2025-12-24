# Feature: Landing Pages

## Overview

A multi-theme website built with Next.js, featuring:

- **WebDev Studios pages**: Clean white theme with orange accents
- **Shop/Commerce page**: Modern dark theme with smooth animations and 3D dashboard mockup

## Routes

- `/` - WebDev Studios home page (white theme)
- `/about` - About page with history, vision, mission (white theme)
- `/shop` - E-commerce landing page (dark theme)

## Components

### WebDev Studios Components (White Theme)

#### Navbar (Light Theme for WDS)

- Sticky navigation bar with white background
- Logo: `wds-logo.svg` (SVG format)
- Mobile/Tablet: Logo only (text hidden)
- Desktop: Logo + "WebDev Studios" text (from `lg:` breakpoint)
- Navigation menu with active state detection (desktop only)
- Navigation items: Trang chủ, Về chúng tôi, Shop, Thế hệ, WDS chia sẻ, FAQ
- "Đăng nhập" button with orange accent
- Uses shadcn/ui NavigationMenu component for desktop
- **Mobile Menu**:
  - Hamburger/Close button with rotate animation
  - Sidebar slides from right with spring animation
  - Nav items fade in with staggered delay
  - Backdrop overlay with fade effect
  - Auto-close on navigation or backdrop click

#### WDSHeader

- Sticky navigation bar with white background
- Logo: `wds-logo.svg` (SVG format)
- Navigation menu with active state detection
- Navigation items: Trang chủ, Về chúng tôi, Shop, Thế hệ, WDS chia sẻ, FAQ
- "Đăng nhập" button with orange accent
- Uses shadcn/ui NavigationMenu component

#### WDSHero

- Large heading with orange accent color and gradient text effect
- Descriptive subtitle with improved typography
- "Đọc thêm" button with hover animations and gradient overlay
- Local `HeroImage.webp` image (optimized WebP format)
- Smooth fade-in and scale animations using motion/react
- Decorative background blur elements with animated scale effects
- Enhanced responsive design
- Optimized image loading with priority and proper sizes
- Image display: `object-contain` to show full image without cropping

#### WDSContactGrid

- Section header with title and description
- 6 contact information cards with hover effects
- Icons with gradient backgrounds and hover animations
- Staggered entrance animations for cards
- Enhanced visual feedback on interactions
- Decorative background elements
- Responsive grid layout

#### WDSClientsSection

- Clients/Partners section with improved title
- Heading with accent underline decoration
- Enhanced description text
- "Đọc thêm" button with hover effects
- Local `KhachHangImage.webp` image (optimized WebP format)
- Scroll-triggered fade-in animations (from left/right)
- Decorative background elements
- Image display: `object-contain` to show full image without cropping

#### WDSMissionSection

- Mission/Values section with gradient background
- Heading with accent underline decoration
- Enhanced description text
- "Đọc thêm" button with border hover effect
- Local `TonChiImage.webp` image (optimized WebP format)
- Scroll-triggered fade-in animations (from left/right)
- Decorative background elements
- Image display: `object-contain` to show full image without cropping

#### WDSAboutHero

- Large orange heading: "KHƠI NGUỒN - SÁNG TẠO - NẮM BẮT"
- English slogan: "Your idea - Your code - Your adventure"
- Vietnamese description

#### WDSAboutSections

- 5 content sections with icons:
  - Tiểu sử (History) - Clock icon
  - Định hướng (Direction) - Compass icon
  - Tầm nhìn (Vision) - Mountain icon
  - Sứ mệnh (Mission) - Telescope icon
  - Phạm vi hoạt động (Scope) - Settings icon
- Responsive 2-column layout
- Each section has icon, title, and description

#### WDSFooter

- Logo and company name
- Contact information
- Navigation links
- Social media links

### Shop/Commerce Components (Dark Theme)

#### Navbar

- Fixed navigation bar with glassmorphism effect
- Responsive menu items
- "Start Trial" button with animated border
- Logo with icon

### Hero Section

- Animated badge announcing "WDS Platform 2.0"
- Large gradient heading
- Descriptive subtitle
- 3D dashboard mockup with:
  - Browser window chrome
  - Revenue metrics
  - Animated bar chart
  - Dashboard widgets

### Trust Section

- Four trust badges:
  - Secure Payment
  - Global Shipping
  - 7-Day Returns
  - Instant Support
- Hover effects on each badge

### Features Grid (Bento Layout)

- **Flash Sale Engine**: Large card with countdown timer mockup
- **Real-time Inventory**: Card with animated bar chart
- **Signature Series**: Card with user avatars
- **Deep Analytics**: Card with analytics mockup

All feature cards use the `SpotlightCard` component with mouse tracking spotlight effect.

### Footer

- Company branding
- Links organized by category:
  - Product (Changelog, Documentation)
  - Company (Careers, Legal)
  - Connect (Twitter, GitHub)

## Styling

### Custom CSS Classes

- `.retro-grid`: Grid pattern background with radial mask (dark theme)
- `.tilt-card`: 3D perspective transform (dark theme)
- `.glass`: Glassmorphism effect with backdrop blur (dark theme)

### Color Schemes

#### WebDev Studios (White Theme)

- Background: `#FFFFFF` (white)
- Text: `#000000` (black)
- Accent: `#F7931E` (vibrant orange)
- Secondary: `#FFF8E1` (light cream)
- CSS Variables: `--wds-black`, `--wds-white`, `--wds-orange`, `--wds-cream`
- Tailwind Classes: `bg-wds-background`, `text-wds-text`, `bg-wds-accent`, `bg-wds-secondary`

#### Shop/Commerce (Dark Theme)

- Primary: `#08090a` (dark background)
- Card: `#0f1011` (slightly lighter)
- Border: `#23252a` (subtle borders)
- Accent: `#6366f1` (indigo)

### Animations

- `shimmer`: 2s linear infinite (dark theme)
- `beam`: 4s linear infinite (dark theme)
- motion/react animations for entrance effects:
  - **Hero Section**: Fade-in up and scale animations with decorative blur animations
  - **Mission Section**: Scroll-triggered fade-in from left/right
  - **Clients Section**: Scroll-triggered fade-in animations
  - **Contact Grid**: Staggered card animations with fade-in
  - **Buttons**: Hover animations with gradient overlays and arrow movement
  - **Icons**: Scale and rotate animations on hover
  - **Mobile Menu**:
    - Hamburger/Close button rotate animation
    - Sidebar slide from right with spring physics
    - Nav items staggered fade-in from right
    - Backdrop fade animation
- All animations use `whileInView` for performance optimization
- Animation library: `motion/react` (migrated from framer-motion)

## Dependencies

- `motion`: Animation library (v12.23.26) - migrated from framer-motion
- `lucide-react`: Icon library
- `next`: Framework (v16.1.0)
- `react`: UI library (v19.2.3)
- `tailwindcss`: Styling (v4)
- `tw-animate-css`: Tailwind CSS v4 compatible animation utilities
- `@radix-ui/react-navigation-menu`: Navigation menu primitives
- `class-variance-authority`: Component variants
- `clsx`: Class name utility
- `tailwind-merge`: Tailwind class merging utility

### shadcn/ui Components

- `navigation-menu`: Navigation menu component with dropdown support

## Images

### WebDev Studios Landing Page Images

All images are stored in `public/image/` directory:

- `HeroImage.webp` - Hero section image (optimized WebP format)
- `TonChiImage.webp` - Mission section image (optimized WebP format)
- `KhachHangImage.webp` - Clients section image (optimized WebP format)
- `wds-logo.svg` - WebDev Studios logo (SVG format, used in Navbar, Footer, Header)

All images are optimized using Next.js Image component with:

- Proper `sizes` attribute for responsive loading
- `priority` flag for above-the-fold images
- Quality optimization (90%)
- Proper alt texts for accessibility
- `object-contain` display mode to show full image without cropping

## Usage

The website can be accessed by running:

```bash
pnpm dev
```

Then navigate to:

- `http://localhost:3000` - WebDev Studios home page (with improved UX/UI)
- `http://localhost:3000/about` - About page
- `http://localhost:3000/shop` - Shop/Commerce landing page

## Customization

### Colors

#### WebDev Studios Theme

Update colors in `src/app/globals.css`:

```css
@theme inline {
  --color-wds-background: #ffffff;
  --color-wds-text: #000000;
  --color-wds-accent: #f7931e;
  --color-wds-secondary: #fff8e1;
}
```

#### Shop/Commerce Theme

Update colors in `src/app/globals.css`:

```css
:root {
  --background: #08090a;
  --card: #0f1011;
  --border: #23252a;
  --accent: #6366f1;
}
```

### Content

- **WebDev Studios pages**: Edit component files in `src/components/wds/` to update text, links, and features
- **Shop/Commerce page**: Edit component files in `src/components/` to update text, links, and features

### Navigation

Update navigation items in `src/components/Navbar.tsx` or `src/components/wds/Header.tsx`:

```typescript
const navItems = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Về chúng tôi', href: '/about' },
  { label: 'Shop', href: '/shop' },
  // ... more items
];
```

### Animations

Modify motion/react props in components or add new animations in `src/lib/animations.ts`.

**Mobile Menu Animation**:

- Hamburger button uses `AnimatePresence` with rotate animation
- Sidebar uses spring physics for smooth slide animation
- Nav items use staggered fade-in with delay based on index

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires CSS backdrop-filter support for glassmorphism (dark theme)
- Requires CSS transforms support for 3D effects (dark theme)
- Responsive design works on mobile, tablet, and desktop

## File Structure

```
src/
├── app/
│   ├── page.tsx              # WebDev Studios home page
│   ├── about/
│   │   └── page.tsx         # About page
│   ├── shop/
│   │   └── page.tsx         # Shop/Commerce landing page
│   └── globals.css          # Global styles with theme colors
├── components/
│   ├── ui/
│   │   └── navigation-menu.tsx  # shadcn/ui navigation component
│   ├── wds/                 # WebDev Studios components
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── AboutHero.tsx
│   │   ├── AboutSections.tsx
│   │   ├── ContactGrid.tsx
│   │   ├── ClientsSection.tsx
│   │   ├── MissionSection.tsx
│   │   └── Footer.tsx
│   ├── Navbar.tsx           # Dark theme navbar (for shop)
│   ├── Hero.tsx             # Dark theme hero (for shop)
│   ├── TrustSection.tsx
│   ├── FeaturesGrid.tsx
│   ├── SpotlightCard.tsx
│   └── Footer.tsx
└── lib/
    ├── utils.ts             # cn() utility for class merging
    └── animations.ts        # (empty, reserved for future use)
```
