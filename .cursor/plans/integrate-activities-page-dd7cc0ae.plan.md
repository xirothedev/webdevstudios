<!-- c5f308b5-83b5-4f35-8195-53ce99e35286 6d4a2949-2eea-4611-8b9e-178364842dcc -->

# Integrate Activities Page into Website

## Overview

Integrate the provided activities/events page React component into the website structure. The component will be adapted to:

- Use existing `Navbar` and `Footer` components (remove custom ones from provided code)
- Convert `framer-motion` to `motion/react` (project standard)
- Follow the project's design system and Tailwind CSS v4 patterns
- Match existing code style (inline exports, import order, TypeScript types)
- Create reusable components for activity sections
- Create data file for activities and categories
- Add navigation links to Navbar and Footer
- Implement search and filter functionality

## File Structure

```
apps/web/src/
├── app/
│   └── activities/
│       └── page.tsx                    # Main activities page
├── components/
│   └── activities/
│       ├── ActivityHero.tsx             # Hero section component
│       ├── ActivityCard.tsx            # Activity card component
│       ├── FilterButton.tsx             # Filter button component
│       ├── ActivityFilters.tsx         # Filters and search section
│       └── NewsletterCTA.tsx           # Newsletter subscription CTA
└── data/
    └── activities.tsx                  # Activities data (categories, activities)
```

## Implementation Steps

### 1. Create Activities Data File

**File**: `apps/web/src/data/activities.tsx`

- Define TypeScript interfaces:
  - `Category` - for CATEGORIES array items
  - `Activity` - for individual activity items
- Export arrays: `CATEGORIES`, `ACTIVITIES`
- Use Lucide React icons (matching provided code)
- Follow existing data file patterns (like `achievements.tsx`)

### 2. Create Reusable Components

#### ActivityHero Component

**File**: `apps/web/src/components/activities/ActivityHero.tsx`

- Extract hero section from provided code
- Convert to use `motion/react` instead of `framer-motion`
- Include animated badge, title, and description
- Use design system colors and spacing
- Props: None (static content)

#### ActivityCard Component

**File**: `apps/web/src/components/activities/ActivityCard.tsx`

- Extract `ActivityCard` component
- Convert to use `motion/react`
- Accept props: `activity` (Activity), `index` (number)
- Include image, category badge, date, location, attendees, description
- Use Tailwind classes matching design system (wds-accent, etc.)
- Handle image with Next.js Image component (optimization)
- Inline export pattern

#### FilterButton Component

**File**: `apps/web/src/components/activities/FilterButton.tsx`

- Extract `FilterButton` component
- Convert to use `motion/react` (if needed)
- Accept props: `active` (boolean), `onClick` (function), `icon` (ReactNode), `children` (ReactNode)
- Use design system colors for active/inactive states
- Inline export pattern

#### ActivityFilters Component

**File**: `apps/web/src/components/activities/ActivityFilters.tsx`

- Extract filters and search section
- Accept props: `activeCategory`, `setActiveCategory`, `searchQuery`, `setSearchQuery`, `categories`
- Include filter buttons and search input
- Sticky positioning for better UX
- Use design system colors

#### NewsletterCTA Component

**File**: `apps/web/src/components/activities/NewsletterCTA.tsx`

- Extract newsletter subscription section
- Convert to use `motion/react`
- Placeholder form (no API integration)
- Use design system colors
- Props: None (static content)

### 3. Create Main Activities Page

**File**: `apps/web/src/app/activities/page.tsx`

- Use existing `Navbar` component with `variant="dark"` (black background)
- Use existing `Footer` component with `variant="dark"`
- Structure:
  - Background effects (retro grid)
  - ActivityHero section
  - ActivityFilters section (sticky)
  - Activities grid with ActivityCard components
  - NewsletterCTA section
- Implement search and filter state management
- Use `useState` for `activeCategory` and `searchQuery`
- Filter activities based on category and search query
- Convert all animations to `motion/react`
- Use `'use client'` directive (state and animations require client-side)
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

- Retro grid pattern: Use inline styles (similar to achievements/partner pages)
- Ensure effects don't interfere with content (z-index management)

### 6. Add Navigation Links

#### Update Navbar

**File**: `apps/web/src/components/Navbar.tsx`

- Add `{ label: 'Hoạt động', href: '/activities' }` to `navItems` array
- Place it after "Thành tích" or in appropriate position

#### Update Footer

**File**: `apps/web/src/data/footer.ts`

- Add `{ label: 'Hoạt động', href: '/activities' }` to the 'VỀ CLB' section in `footerSections`

### 7. Image Optimization

- Replace `<img>` tags with Next.js `Image` component
- Use placeholder images or handle missing images gracefully
- Add proper alt text for accessibility

### 8. Search and Filter Logic

- Implement client-side filtering:
  - Filter by category (all, academic, community, event)
  - Filter by search query (title matching)
  - Show empty state when no results
- Use `AnimatePresence` from `motion/react` for smooth transitions

### 9. TypeScript Types

- Define proper interfaces for all components
- Type all props correctly
- Use existing icon types from Lucide React
- Ensure no `any` types

### 10. Code Quality

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

- **From**: `import { motion, AnimatePresence } from 'framer-motion'`
- **To**: `import { motion, AnimatePresence } from 'motion/react'`

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

### Image Handling

- **From**: `<img src={activity.image} />`
- **To**: `<Image src={activity.image} alt={activity.title} />` (Next.js Image component)

### Design Tokens

- Replace all hardcoded hex colors with Tailwind classes using design system
- Use existing spacing, typography, and border radius utilities

### Component Structure

- Extract reusable components to `components/activities/`
- Keep page component clean and focused on layout and state management
- Follow existing component patterns (like `achievements/` and `partner/` components)

## Testing Checklist

- [ ] Page renders without errors
- [ ] Animations work correctly with motion/react
- [ ] Responsive design works (mobile, tablet, desktop)
- [ ] Navbar and Footer display correctly
- [ ] All activity cards display with proper styling
- [ ] Filter buttons work correctly
- [ ] Search functionality works
- [ ] Empty state displays when no results
- [ ] Images load correctly (or show placeholder)
- [ ] Background effects don't interfere with content
- [ ] Navigation links work correctly
- [ ] TypeScript compilation passes
- [ ] Linting passes (`pnpm lint`)
- [ ] Code formatting correct (`pnpm format`)

## Files to Create

1. `apps/web/src/app/activities/page.tsx` - Main page
2. `apps/web/src/components/activities/ActivityHero.tsx` - Hero section
3. `apps/web/src/components/activities/ActivityCard.tsx` - Activity card
4. `apps/web/src/components/activities/FilterButton.tsx` - Filter button
5. `apps/web/src/components/activities/ActivityFilters.tsx` - Filters and search
6. `apps/web/src/components/activities/NewsletterCTA.tsx` - Newsletter CTA
7. `apps/web/src/data/activities.tsx` - Activities data

## Files to Modify

1. `apps/web/src/components/Navbar.tsx` - Add navigation link
2. `apps/web/src/data/footer.ts` - Add footer link
3. `apps/web/src/lib/api-client.ts` - Add `/activities` to public routes

## Notes

- The provided code uses `framer-motion` but the project uses `motion/react` - all imports must be converted
- The activities folder doesn't exist yet - we'll create the page there
- All user-facing text should remain in Vietnamese
- Code comments and documentation should be in English
- Follow the existing page patterns (like `achievements/page.tsx` and `partner/page.tsx`)
- Newsletter form is placeholder only - no API integration needed
- Images should use Next.js Image component for optimization
- Filter and search are client-side only (no API calls)

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
