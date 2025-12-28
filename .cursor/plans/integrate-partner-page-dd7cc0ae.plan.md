<!-- dd7cc0ae-98c5-46ea-b00a-fe6c5ceebb48 998326b8-fa3d-4131-a468-3b96168b4b46 -->

# Integrate Partner Page into Website

## Overview

Integrate the provided partner page React component into the website structure. The component will be adapted to:

- Use existing `Navbar` and `Footer` components (remove custom ones from provided code)
- Convert `framer-motion` to `motion/react` (project standard)
- Follow the project's design system and Tailwind CSS v4 patterns
- Match existing code style (inline exports, import order, TypeScript types)
- Create reusable components for partner sections

## File Structure

```
apps/web/src/
├── app/
│   └── partner/
│       └── page.tsx                    # Main partner page
├── components/
│   └── partner/
│       ├── PartnerCard.tsx             # Reusable partner card component
│       ├── PartnerSection.tsx          # Section title component
│       └── PartnerHero.tsx             # Hero section component
└── data/
    └── partners.ts                      # Partner data (strategic, community, media)
```

## Implementation Steps

### 1. Create Partner Data File

**File**: `apps/web/src/data/partners.ts`

- Define TypeScript interfaces for partner types:
  - `StrategicPartner`, `CommunityPartner`, `MediaPartner`
- Export arrays: `STRATEGIC_PARTNERS`, `COMMUNITY_PARTNERS`, `MEDIA_PARTNERS`
- Use Lucide React icons (matching provided code)
- Follow existing data file patterns (like `generations.ts`)

### 2. Create Reusable Components

#### PartnerCard Component

**File**: `apps/web/src/components/partner/PartnerCard.tsx`

- Extract the `PartnerCard` component from provided code
- Convert to use `motion/react` instead of `framer-motion`
- Accept props: `partner`, `size` ('lg' | 'md' | 'sm')
- Use Tailwind classes matching design system (wds-accent, etc.)
- Inline export pattern

#### PartnerSection Component

**File**: `apps/web/src/components/partner/PartnerSection.tsx`

- Extract `SectionTitle` component
- Convert to `motion/react`
- Props: `label`, `title`, `subtitle` (all optional)
- Use design system typography classes

#### PartnerHero Component

**File**: `apps/web/src/components/partner/PartnerHero.tsx`

- Extract hero section from provided code
- Convert to `motion/react`
- Include animated badge, title, description, and CTA buttons
- Use design system colors and spacing

### 3. Create Main Partner Page

**File**: `apps/web/src/app/partner/page.tsx`

- Use existing `Navbar` component with `variant="dark"` (black background)
- Use existing `Footer` component with `variant="dark"`
- Structure:
  - Background effects (retro grid, glow orbs)
  - PartnerHero section
  - Strategic Partners section
  - Community Partners section
  - Media Partners section
  - CTA section
- Convert all animations to `motion/react`
- Use `'use client'` directive (animations require client-side)
- Follow import order: side effects → node → external → relative

### 4. Adapt Styling

- Replace hardcoded colors with design system tokens:
  - `#F7931E` → `wds-accent`
  - `#000000` → `wds-background` or `bg-black`
  - `#FFFFFF` → `text-white` or `text-wds-text`
  - `#FFF8E1` → `wds-secondary`
- Use existing Tailwind utilities for:
  - Glassmorphism: `glass` class (if available) or `backdrop-blur-md bg-black/70`
  - Borders: `border-white/10`, `border-wds-accent/30`
  - Shadows: `shadow-wds-accent/30`
- Maintain responsive design (mobile-first)

### 5. Background Effects

- Retro grid pattern: Use inline styles or CSS (similar to generation page)
- Glow orbs: Use absolute positioned divs with blur effects
- Ensure effects don't interfere with content (z-index management)

### 6. TypeScript Types

- Define proper interfaces for all components
- Type all props correctly
- Use existing icon types from Lucide React
- Ensure no `any` types

### 7. Code Quality

- Follow import order (simple-import-sort):
  1. Side effects
  2. Node built-ins
  3. External libraries
  4. Path aliases (@/)
  5. Relative imports

- Use inline exports (export at declaration)
- Add JSDoc comments for complex logic
- Ensure all text content is in Vietnamese (user-facing)
- Comments in English

## Key Adaptations

### Animation Library

- **From**: `import { motion } from 'framer-motion'`
- **To**: `import { motion } from 'motion/react'`

### Navigation/Footer

- **Remove**: Custom `Navbar` and `Footer` components from provided code
- **Use**: Existing `@/components/Navbar` and `@/components/Footer`
- **Pattern**:
  ```tsx
  <Navbar variant="dark" />;
  {
    /* page content */
  }
  <Footer variant="dark" />;
  ```

### Design Tokens

- Replace all hardcoded hex colors with Tailwind classes using design system
- Use existing spacing, typography, and border radius utilities

### Component Structure

- Extract reusable components to `components/partner/`
- Keep page component clean and focused on layout
- Follow existing component patterns (like `wds/` components)

## Testing Checklist

- [ ] Page renders without errors
- [ ] Animations work correctly with motion/react
- [ ] Responsive design works (mobile, tablet, desktop)
- [ ] Navbar and Footer display correctly
- [ ] All partner cards display with proper styling
- [ ] Background effects don't interfere with content
- [ ] TypeScript compilation passes
- [ ] Linting passes (`pnpm lint`)
- [ ] Code formatting correct (`pnpm format`)

## Files to Create

1. `apps/web/src/app/partner/page.tsx` - Main page
2. `apps/web/src/components/partner/PartnerCard.tsx` - Card component
3. `apps/web/src/components/partner/PartnerSection.tsx` - Section title
4. `apps/web/src/components/partner/PartnerHero.tsx` - Hero section
5. `apps/web/src/data/partners.ts` - Partner data

## Files to Modify

None (new feature, no existing files need modification)

## Notes

- The provided code uses `framer-motion` but the project uses `motion/react` - all imports must be converted
- The partner folder already exists but is empty - we'll create the page there
- All user-facing text should remain in Vietnamese
- Code comments and documentation should be in English
- Follow the existing page patterns (like `about/page.tsx` and `generation/page.tsx`)

### To-dos

- [ ] Create partners.ts data file with TypeScript interfaces and partner arrays (strategic, community, media)
- [ ] Create PartnerCard component with motion/react animations and size variants
- [ ] Create PartnerSection component for section titles with animations
- [ ] Create PartnerHero component with animated badge, title, and CTA buttons
- [ ] Create main partner page.tsx using existing Navbar/Footer, integrating all sections
- [ ] Replace hardcoded colors with design system tokens (wds-accent, wds-background, etc.)
- [ ] Implement retro grid pattern and glow orbs as background effects
- [ ] Ensure all TypeScript types are correct, no any types, proper interfaces
- [ ] Check import order, inline exports, linting, and formatting
