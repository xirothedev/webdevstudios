<!-- dd7cc0ae-98c5-46ea-b00a-fe6c5ceebb48 74df534e-44d9-4184-95a3-6d6ef5bdae90 -->

# Integrate Achievements Page into Website

## Overview

Integrate the provided rewards/achievements page React component into the website structure. The component will be adapted to:

- Use existing `Navbar` and `Footer` components (remove custom ones from provided code)
- Convert `framer-motion` to `motion/react` (project standard)
- Follow the project's design system and Tailwind CSS v4 patterns
- Match existing code style (inline exports, import order, TypeScript types)
- Create reusable components for achievement sections
- Create data file for awards and stats
- Add navigation links to Navbar and Footer

## File Structure

```
apps/web/src/
├── app/
│   └── achievements/
│       └── page.tsx                    # Main achievements page
├── components/
│   └── achievements/
│       ├── AchievementHero.tsx         # Hero section component
│       ├── AchievementSection.tsx      # Section title component
│       ├── AchievementCard.tsx         # Award card component
│       └── TimelineYear.tsx            # Timeline year group component
└── data/
    └── achievements.tsx                # Achievements data (stats, awards)
```

## Implementation Steps

### 1. Create Achievements Data File

**File**: `apps/web/src/data/achievements.tsx`

- Define TypeScript interfaces:
  - `StatItem` - for STATS array items
  - `AwardItem` - for individual award items
  - `AwardYearGroup` - for year groups with awards
- Export arrays: `STATS`, `AWARDS`
- Use Lucide React icons (matching provided code)
- Follow existing data file patterns (like `partners.tsx`)

### 2. Create Reusable Components

#### AchievementHero Component

**File**: `apps/web/src/components/achievements/AchievementHero.tsx`

- Extract hero section from provided code
- Convert to use `motion/react` instead of `framer-motion`
- Include animated badge, title, description, and stats grid
- Use design system colors and spacing
- Props: None (uses data from achievements.tsx)

#### AchievementSection Component

**File**: `apps/web/src/components/achievements/AchievementSection.tsx`

- Extract `SectionTitle` component
- Convert to `motion/react`
- Props: `label`, `title`, `subtitle` (all optional)
- Use design system typography classes

#### AchievementCard Component

**File**: `apps/web/src/components/achievements/AchievementCard.tsx`

- Extract `AwardCard` component
- Convert to use `motion/react`
- Accept props: `item` (AwardItem), `index` (number)
- Use Tailwind classes matching design system (wds-accent, etc.)
- Inline export pattern

#### TimelineYear Component

**File**: `apps/web/src/components/achievements/TimelineYear.tsx`

- Extract `TimelineYear` component
- Convert to use `motion/react`
- Accept props: `year` (number), `items` (AwardItem[])
- Include year marker, connecting line, and awards grid
- Responsive design (mobile, tablet, desktop)

### 3. Create Main Achievements Page

**File**: `apps/web/src/app/achievements/page.tsx`

- Use existing `Navbar` component with `variant="dark"` (black background)
- Use existing `Footer` component with `variant="dark"`
- Structure:
  - Background effects (retro grid, glow orbs)
  - AchievementHero section
  - Awards Timeline section with TimelineYear components
  - Recognition Banner section (CTA)
- Convert all animations to `motion/react`
- Use `'use client'` directive (animations require client-side)
- Follow import order: side effects → node → external → relative

### 4. Adapt Styling

- Replace hardcoded colors with design system tokens:
  - `#F7931E` → `wds-accent`
  - `#000000` → `wds-background` or `bg-black`
  - `#FFFFFF` → `text-white` or `text-wds-text`
  - `#FFF8E1` → `wds-secondary` (if available)
- Use existing Tailwind utilities for:
  - Glassmorphism: `backdrop-blur-md bg-black/70`
  - Borders: `border-white/10`, `border-wds-accent/30`
  - Shadows: `shadow-wds-accent/30`
- Maintain responsive design (mobile-first)

### 5. Background Effects

- Retro grid pattern: Use inline styles (similar to partner page)
- Glow orbs: Use absolute positioned divs with blur effects
- Ensure effects don't interfere with content (z-index management)

### 6. Add Navigation Links

#### Update Navbar

**File**: `apps/web/src/components/Navbar.tsx`

- Add `{ label: 'Thành tích', href: '/achievements' }` to `navItems` array
- Place it after "Về chúng tôi" or in appropriate position

#### Update Footer

**File**: `apps/web/src/data/footer.ts`

- Add `{ label: 'Thành tích', href: '/achievements' }` to the 'VỀ CLB' section in `footerSections`

### 7. Recognition Banner Section

- Keep the CTA banner at the bottom
- Update button link to point to recruitment page (if exists) or contact
- Maintain gradient background and glow effects
- Convert animations to `motion/react`

### 8. TypeScript Types

- Define proper interfaces for all components
- Type all props correctly
- Use existing icon types from Lucide React
- Ensure no `any` types

### 9. Code Quality

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

- Extract reusable components to `components/achievements/`
- Keep page component clean and focused on layout
- Follow existing component patterns (like `partner/` components)

## Testing Checklist

- [ ] Page renders without errors
- [ ] Animations work correctly with motion/react
- [ ] Responsive design works (mobile, tablet, desktop)
- [ ] Navbar and Footer display correctly
- [ ] All achievement cards display with proper styling
- [ ] Timeline year markers and connecting lines display correctly
- [ ] Background effects don't interfere with content
- [ ] Navigation links work correctly
- [ ] TypeScript compilation passes
- [ ] Linting passes (`pnpm lint`)
- [ ] Code formatting correct (`pnpm format`)

## Files to Create

1. `apps/web/src/app/achievements/page.tsx` - Main page
2. `apps/web/src/components/achievements/AchievementHero.tsx` - Hero section
3. `apps/web/src/components/achievements/AchievementSection.tsx` - Section title
4. `apps/web/src/components/achievements/AchievementCard.tsx` - Award card
5. `apps/web/src/components/achievements/TimelineYear.tsx` - Timeline year group
6. `apps/web/src/data/achievements.tsx` - Achievements data

## Files to Modify

1. `apps/web/src/components/Navbar.tsx` - Add navigation link
2. `apps/web/src/data/footer.ts` - Add footer link

## Notes

- The provided code uses `framer-motion` but the project uses `motion/react` - all imports must be converted
- The achievements folder doesn't exist yet - we'll create the page there
- All user-facing text should remain in Vietnamese
- Code comments and documentation should be in English
- Follow the existing page patterns (like `about/page.tsx` and `partner/page.tsx`)
- The recognition banner CTA button should link to recruitment page or contact page

### To-dos

- [ ] Create achievements.tsx data file with STATS and AWARDS data, including TypeScript interfaces
- [ ] Create AchievementHero component with animated badge, title, description, and stats grid
- [ ] Create AchievementSection component for section titles with animations
- [ ] Create AchievementCard component for displaying individual awards with hover effects
- [ ] Create TimelineYear component for year groups with connecting lines and awards grid
- [ ] Create achievements/page.tsx with all sections, background effects, and proper layout
- [ ] Add 'Thành tích' navigation link to Navbar component
- [ ] Add 'Thành tích' link to Footer data file
- [ ] Test page functionality, run lint and format, fix any errors
