## Feature: FeaturesGrid (WebDev Studios Merch Collection)

### Description

`FeaturesGrid` is a section introducing merch products with glassmorphism + 3D parallax style on the website:

- WebDev Studios T-shirt (`ao-thun.webp`)
- WebDev Studios Badge (`huy-hieu.webp`)
- WebDev Studios Lanyard (`day-deo.webp`)
- WebDev Studios Limited Edition Mouse Pad (`pad-chuot.webp`)

### UI/UX Details

- Glass card with blurred border, backdrop-blur, gradient overlay and shimmer.
- Uses `motion/react` for effects:
  - Light 3D tilt based on mouse position (GlassCard wrapper).
  - Hover scale / translate Y / rotate for product image blocks.
- Product images use `next/image` with `fill` for optimization and maintaining aspect ratio.

### Changes in This Session

- Increased hero image block size for WDS t-shirt:
  - Changed from `h-52 w-72` to larger size, responsive by breakpoint (`h-60 w-80`, `md:h-72 md:w-104`, `lg:h-80 lg:w-120`).
  - Stronger hover: `scale: 1.12`, `y: -16`, `rotate: -2`, increased `translateZ` for more prominent effect.
  - Enhanced glow/background gradient and drop-shadow to make image stand out from background.
- Updated alignment between image and content:
  - WebDev Studios Badge card: title & description correctly describe badge (`huy-hieu.webp`).
  - WebDev Studios Lanyard card: title & description correctly describe lanyard (`day-deo.webp`), full-width image for clear preview.
  - WebDev Studios Limited Edition Mouse Pad card: title correctly describes limited mouse pad (`pad-chuot.webp`).

### Related Files

- `apps/web/src/components/FeaturesGrid.tsx`

### Env vars

- This feature does not require separate env vars. No new changes for `.env.example`.
