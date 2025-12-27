# Frontend Design Concept

## Overview

This project is the official platform for **WebDev Studios** - a student web development club at the University of Information Technology (UIT), Vietnam National University Ho Chi Minh City. The design system reflects a modern, tech-forward aesthetic that balances professionalism with creative energy.

## Brand Identity

### Who is WebDev Studios?

WebDev Studios is:

- **Educational**: A student club focused on web development learning
- **Professional**: Clean aesthetic suitable for academic and industry contexts
- **Tech-Focused**: Developer-oriented visual language
- **Community-Driven**: Emphasis on collaboration, learning, and growth

### Core Values

- **Khởi nguồn** - Initiate
- **Sáng tạo** - Create
- **Nắm bắt** - Seize opportunities

## Color Palette

The design system uses a high-contrast dark theme with vibrant orange accents.

### Primary Colors

| Role       | Color  | Hex       | RGB                  | Tailwind Class      |
| ---------- | ------ | --------- | -------------------- | ------------------- |
| Background | Black  | `#000000` | `rgb(0, 0, 0)`       | `bg-wds-background` |
| Text       | White  | `#FFFFFF` | `rgb(255, 255, 255)` | `text-wds-text`     |
| Accent/CTA | Orange | `#F7931E` | `rgb(247, 147, 30)`  | `bg-wds-accent`     |
| Secondary  | Cream  | `#FFF8E1` | `rgb(255, 248, 225)` | `bg-wds-secondary`  |

### CSS Variables

```css
:root {
  --wds-black: #000000;
  --wds-white: #ffffff;
  --wds-orange: #f7931e;
  --wds-cream: #fff8e1;
}
```

### Tailwind Theme Colors

```css
@theme inline {
  --color-wds-background: #000000;
  --color-wds-text: #ffffff;
  --color-wds-accent: #f7931e;
  --color-wds-secondary: #fff8e1;
}
```

## Typography

### Font Family

- **Primary**: Inter (via Google Fonts)
- **Fallback**: system-ui, -apple-system, sans-serif

### Scale

| Size | Class       | Usage                           |
| ---- | ----------- | ------------------------------- |
| XS   | `text-xs`   | 0.75rem - Labels, captions      |
| SM   | `text-sm`   | 0.875rem - Supporting text      |
| Base | `text-base` | 1rem - Body text                |
| LG   | `text-lg`   | 1.125rem - Emphasized body      |
| XL   | `text-xl`   | 1.25rem - Subheadings           |
| 2XL  | `text-2xl`  | 1.5rem - Section titles         |
| 3XL  | `text-3xl`  | 1.875rem - Page titles (mobile) |
| 4XL  | `text-4xl`  | 2.25rem - Page titles (desktop) |

### Typography Utilities

```tsx
// Balanced text for headings
'text-balance';

// Pretty text for descriptions
'text-pretty';

// Uppercase tracking for labels
'uppercase tracking-wide';
```

## Visual Language

### Core Visual Elements

1. **Dark Theme First** - Black backgrounds create dramatic contrast
2. **Vibrant Orange Accents** - High-contrast CTAs and highlights
3. **Glassmorphism** - Frosted glass effects on navigation and overlays
4. **Grid Patterns** - Retro-style background textures
5. **Smooth Animations** - Micro-interactions throughout

### Border Radius

| Class          | Value  | Usage             |
| -------------- | ------ | ----------------- |
| `rounded-full` | 9999px | Buttons, pills    |
| `rounded-2xl`  | 1rem   | Cards, containers |
| `rounded-3xl`  | 1.5rem | Large cards       |

### Shadows

```tsx
// Orange shadow for accent elements
'shadow-wds-accent/30';

// Colored shadows on hover
'hover:shadow-wds-accent/20';
```

## Component Architecture

### Component Layers

```
┌─────────────────────────────────────┐
│          Application Layer          │
├─────────────────────────────────────┤
│         Page Components             │
│  (Hero, About, Features, FAQ, etc.) │
├─────────────────────────────────────┤
│         Layout Components           │
│     (Navbar, Footer, Sidebar)      │
├─────────────────────────────────────┤
│          UI Components              │
│  (shadcn/ui + Custom WDS components)│
├─────────────────────────────────────┤
│          Base Components            │
│       (Button, Input, etc.)        │
└─────────────────────────────────────┘
```

### Component Variants

Using **Class Variance Authority (CVA)** for variant management:

```typescript
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-full font-semibold transition',
  {
    variants: {
      variant: {
        default: 'bg-wds-accent text-black hover:bg-wds-accent/90',
        outline:
          'border border-wds-accent text-wds-accent hover:bg-wds-accent/10',
        ghost: 'text-wds-accent hover:bg-wds-accent/10',
      },
      size: {
        default: 'px-4 py-2 text-sm',
        sm: 'px-3 py-1.5 text-xs',
        lg: 'px-6 py-3 text-base',
      },
    },
  }
);
```

## Design Patterns

### Buttons

```tsx
// Primary CTA button
<Link
  href="/contact"
  className="bg-wds-accent hover:bg-wds-accent/90 shadow-wds-accent/30 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-black transition hover:shadow-md"
>
  Contact Us
</Link>

// Outline button
<Link
  href="/about"
  className="border-wds-accent text-wds-accent hover:bg-wds-accent/10 inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition"
>
  Learn More
</Link>
```

### Cards

```tsx
<article className="group bg-wds-accent/10 border-wds-accent/30 hover:border-wds-accent/60 shadow-wds-accent/10 hover:shadow-wds-accent/20 relative flex flex-col gap-3 rounded-2xl border px-5 py-4 transition-shadow duration-200">
  <h2 className="text-base leading-snug font-semibold text-black">
    Card Title
  </h2>
  <p className="text-sm leading-relaxed text-gray-700">
    Card description text goes here.
  </p>
</article>
```

### Glassmorphism Navigation

```tsx
<Navbar className="glass" variant="light" />
```

## Animation System

### Built-in Animations

```css
@keyframes shimmer {
  from {
    background-position: 0 0;
  }
  to {
    background-position: -200% 0;
  }
}

@keyframes beam {
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}
```

### Transition Utilities

| Duration | Class          | Usage                |
| -------- | -------------- | -------------------- |
| 100ms    | `duration-100` | Fast hover states    |
| 200ms    | `duration-200` | Standard transitions |
| 500ms    | `duration-500` | Slow, smooth effects |

### Interactive Elements

```tsx
// Hover with color transition
'transition-colors duration-200 hover:bg-wds-accent/90';

// Hover with shadow
'transition-shadow duration-200 hover:shadow-md';

// Group hover effects
'group hover:border-wds-accent/60';
```

## Background Effects

### Retro Grid Pattern

```css
.retro-grid {
  background-size: 40px 40px;
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  mask-image: radial-gradient(
    ellipse 60% 50% at 50% 0%,
    #000 70%,
    transparent 100%
  );
}
```

### Interactive Grid Pattern

```tsx
<InteractiveGridPattern
  className="mask-[radial-gradient(500px_circle_at_center,white,transparent)]"
  width={20}
  height={20}
  squares={[80, 80]}
  squaresClassName="hover:fill-wds-accent/40"
/>
```

### Gradient Backgrounds

```tsx
// Vertical gradient
'bg-linear-to-b from-white via-white to-wds-secondary/30';

// Radial gradient mask
'mask-[radial-gradient(400px_circle_at_center,white,transparent)]';
```

## Layout System

### Container

```tsx
<div className="mx-auto max-w-6xl px-6">{/* Content */}</div>
```

### Grid

```tsx
// Responsive grid
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
  {/* Items */}
</div>
```

### Flex

```tsx
// Center aligned
<div className="flex flex-col items-center justify-center">
  {/* Content */}
</div>

// Space between
<div className="flex flex-col gap-10 sm:flex-row sm:items-center sm:justify-between">
  {/* Content */}
</div>
```

## Page Structure

### Standard Page Layout

```tsx
export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar variant="light" />

      <section className="relative overflow-hidden">
        {/* Optional background pattern */}
        <div className="mx-auto max-w-6xl px-6 py-20">{/* Page content */}</div>
      </section>

      <Footer variant="light" />
    </div>
  );
}
```

### Section Pattern

```tsx
<section className="to-wds-secondary/30 relative overflow-hidden bg-linear-to-b from-white via-white">
  <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 pt-20 pb-16">
    {/* Section header */}
    <div className="flex flex-col gap-4 text-center">
      <span className="text-wds-accent text-sm font-semibold tracking-wide uppercase">
        Label
      </span>
      <h1 className="text-3xl leading-tight font-bold text-balance text-black sm:text-4xl">
        Section Title
      </h1>
      <p className="text-base text-pretty text-gray-600 sm:text-lg">
        Section description goes here.
      </p>
    </div>

    {/* Section content */}
  </div>
</section>
```

## Responsive Design

### Breakpoints

| Breakpoint | Width  | Usage         |
| ---------- | ------ | ------------- |
| Base       | 0px    | Mobile first  |
| sm         | 640px  | Small tablets |
| md         | 768px  | Tablets       |
| lg         | 1024px | Small laptops |
| xl         | 1280px | Desktops      |

### Responsive Patterns

```tsx
// Responsive text
'text-base sm:text-lg';

// Responsive grid
'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3';

// Responsive flex direction
'flex flex-col sm:flex-row';

// Responsive spacing
'gap-4 md:gap-6 lg:gap-8';
```

## Accessibility

### Focus States

```tsx
// Outline ring on focus
'focus:outline-none focus:ring-2 focus:ring-wds-accent/50';

// Visible focus indicator
'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wds-accent';
```

### Color Contrast

All color combinations meet WCAG AA standards:

- Black background + White text: 21:1 contrast
- Orange accent + Black text: 11:1 contrast
- White background + Black text: 21:1 contrast

### Semantic HTML

```tsx
// Use semantic elements
<article>  {/* For self-contained content */}
<section>  {/* For thematic grouping */}
<nav>      {/* For navigation */}
<header>   {/* For page/section headers */}
<footer>   {/* For page/section footers */}
```

## Performance

### Image Optimization

```tsx
import Image from 'next/image';

<Image
  src="/image.webp"
  alt="Description"
  width={800}
  height={600}
  className="rounded-2xl"
/>;
```

### Best Practices

- Use WebP format for images
- Implement lazy loading for below-the-fold content
- Use Next.js Image component for automatic optimization
- Minimize client-side JavaScript
- Leverage CSS for animations instead of JS

## File Structure

```
apps/web/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── (routes)/     # Page routes
│   │   ├── globals.css   # Global styles
│   │   └── layout.tsx    # Root layout
│   ├── components/       # React components
│   │   ├── ui/          # shadcn/ui components
│   │   ├── wds/         # WDS-specific components
│   │   ├── Navbar.tsx   # Navigation
│   │   └── Footer.tsx   # Footer
│   └── lib/             # Utilities
│       └── utils.ts     # Helper functions
├── docs/                # Documentation
├── public/              # Static assets
└── tailwind.config.ts   # Tailwind configuration
```

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **UI Library**: shadcn/ui + custom components
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion + tw-animate-css
- **Icons**: Lucide React
- **Fonts**: Inter (Google Fonts)
- **TypeScript**: Full type safety

## Design Principles

1. **Consistency First** - Use design tokens, not magic numbers
2. **Mobile First** - Design for smallest screens first
3. **Accessibility Always** - WCAG AA compliance minimum
4. **Performance Matters** - Optimize images, minimize JS
5. **Semantic HTML** - Use proper elements for structure
6. **Purposeful Animation** - Animate with intent, not for decoration

---

**Last Updated**: 2025-12-23

**Maintained by**: WebDev Studios Team
