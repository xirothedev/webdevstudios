# WebDev Studios & Savi E-commerce Web App

This is a multi-theme web application featuring WebDev Studios club pages and Savi e-commerce platform, built with [Next.js](https://nextjs.org).

## Features

### WebDev Studios Pages (White Theme)

- **Modern Landing Page**: Clean, professional design with smooth animations
- **Optimized Images**: Local WebP images for fast loading with `object-contain` display
- **Scroll Animations**: Smooth scroll-triggered animations using motion/react
- **Mobile Navigation**: Animated hamburger menu with sidebar sliding from right
- **Logo**: SVG logo with responsive text display (hidden on mobile/tablet)
- **Enhanced UX/UI**: Improved typography, spacing, and visual hierarchy
- **Responsive Design**: Mobile-first approach with full responsiveness
- **Accessibility**: Proper alt texts and semantic HTML
- **Favicon & App Icons**: Complete favicon and app icon setup for all platforms (iOS, Android, Web)

### Savi E-commerce (Dark Theme)

- **Premium Landing Page**: Commerce landing page with 3D mockup and animations
- **Dark Mode**: Built-in dark theme with custom color scheme
- **Animations**: Smooth animations powered by motion/react
- **Component Library**: Reusable React components

## Getting Started

First, install dependencies:

```bash
pnpm install
```

Then, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- **Next.js 16**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS v4**: Utility-first CSS framework
- **motion/react**: Animation library (v12.23.26)
- **Lucide React**: Icon library
- **shadcn/ui**: UI component library

## Project Structure

```
src/
├── app/              # Next.js app directory
│   ├── layout.tsx    # Root layout
│   ├── page.tsx      # WebDev Studios home page
│   ├── about/        # About page
│   ├── shop/         # E-commerce landing page
│   └── globals.css   # Global styles
├── components/       # React components
│   ├── wds/          # WebDev Studios components
│   │   ├── Hero.tsx
│   │   ├── ContactGrid.tsx
│   │   ├── ClientsSection.tsx
│   │   ├── MissionSection.tsx
│   │   └── ...
│   ├── Navbar.tsx   # Dark theme navbar
│   ├── Hero.tsx     # Dark theme hero
│   ├── TrustSection.tsx
│   ├── FeaturesGrid.tsx
│   ├── SpotlightCard.tsx
│   └── Footer.tsx
└── lib/              # Utility functions
public/
├── image/            # Optimized images
│   ├── HeroImage.webp
│   ├── TonChiImage.webp
│   ├── KhachHangImage.webp
│   └── wds-logo.svg
├── icons/            # App icons and favicons
│   ├── android-chrome-*.png
│   ├── apple-icon.png
│   └── icon-*.png
├── favicon-32x32.png
└── site.webmanifest  # PWA manifest
scripts/
└── generate-icons.sh # Script to generate icons from SVG
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
