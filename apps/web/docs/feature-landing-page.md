# Feature: Landing Page

## Overview

A premium commerce landing page built with Next.js, featuring a modern dark theme, smooth animations, and a 3D dashboard mockup.

## Components

### Navbar

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

- `.retro-grid`: Grid pattern background with radial mask
- `.tilt-card`: 3D perspective transform
- `.glass`: Glassmorphism effect with backdrop blur

### Color Scheme

- Primary: `#08090a` (dark background)
- Card: `#0f1011` (slightly lighter)
- Border: `#23252a` (subtle borders)
- Accent: `#6366f1` (indigo)

### Animations

- `shimmer`: 2s linear infinite
- `beam`: 4s linear infinite
- Framer Motion animations for entrance effects

## Dependencies

- `framer-motion`: Animation library
- `lucide-react`: Icon library
- `next`: Framework
- `react`: UI library
- `tailwindcss`: Styling

## Usage

The landing page is the default route (`/`) and can be accessed by running:

```bash
pnpm dev
```

Then navigate to `http://localhost:3000`.

## Customization

### Colors

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

Edit component files in `src/components/` to update text, links, and features.

### Animations

Modify Framer Motion props in components or add new animations in `src/lib/animations.ts`.

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires CSS backdrop-filter support for glassmorphism
- Requires CSS transforms support for 3D effects
