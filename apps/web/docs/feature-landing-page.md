# Feature: Landing Pages

## Overview

A multi-theme website built with Next.js, featuring:

- **WebDev Studios pages**: Clean white theme with orange accents
- **Shop/Commerce page**: Modern dark theme with smooth animations and 3D dashboard mockup

## Routes

- `/` - WebDev Studios home page (white theme)
- `/about` - About page with history, vision, mission (white theme)
- `/shop` - Commerce/Savi landing page (dark theme)

## Components

### WebDev Studios Components (White Theme)

#### WDSHeader

- Sticky navigation bar with white background
- Logo with orange accent badge
- Navigation menu with active state detection
- Navigation items: Trang chủ, Về chúng tôi, Shop, Thế hệ, WDS chia sẻ, FAQ
- "Đăng nhập" button with orange accent
- Uses shadcn/ui NavigationMenu component

#### WDSHero

- Large heading with orange accent color
- Descriptive subtitle
- "Đọc thêm" button
- Team collaboration image from Unsplash

#### WDSContactGrid

- 6 contact information cards
- Icons and contact details
- Responsive grid layout

#### WDSClientsSection

- Clients/Partners section
- Heading and description
- "Đọc thêm" button
- Team meeting image from Unsplash

#### WDSMissionSection

- Mission/Values section
- Heading and description
- "Đọc thêm" button
- Team discussion image from Unsplash

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

- Animated badge announcing "SaviOS 2.0"
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
- Framer Motion animations for entrance effects

## Dependencies

- `framer-motion`: Animation library
- `lucide-react`: Icon library
- `next`: Framework
- `react`: UI library
- `tailwindcss`: Styling (v4)
- `@radix-ui/react-navigation-menu`: Navigation menu primitives
- `class-variance-authority`: Component variants
- `clsx`: Class name utility
- `tailwind-merge`: Tailwind class merging utility

### shadcn/ui Components

- `navigation-menu`: Navigation menu component with dropdown support

## Usage

The website can be accessed by running:

```bash
pnpm dev
```

Then navigate to:

- `http://localhost:3000` - WebDev Studios home page
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

Update navigation items in `src/components/wds/Header.tsx`:

```typescript
const navItems = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Về chúng tôi', href: '/about' },
  { label: 'Shop', href: '/shop' },
  // ... more items
];
```

### Animations

Modify Framer Motion props in components or add new animations in `src/lib/animations.ts`.

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
