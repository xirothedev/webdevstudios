# WebDev Studios Color Palette

Color palette extracted from https://www.webdevstudios.org/

## Primary Colors

### Background

- **Black**: `#000000` / `rgb(0, 0, 0)`
  - Main background color of the website
  - Used for main background

### Text

- **White**: `#FFFFFF` / `rgb(255, 255, 255)`
  - Main text color
  - Used for all text on black background

### Accent

- **Vibrant Orange**: `#F7931E` / `rgb(247, 147, 30)`
  - Main accent color
  - Used for logo, buttons, and important elements
  - Creates emphasis on black background

### Secondary Background

- **Light Creamy Yellow**: `#FFF8E1` / `rgb(255, 248, 225)`
  - Secondary background color for illustrations
  - Used for decorative elements

## CSS Variables

Added to `globals.css`:

```css
:root {
  --wds-black: #000000;
  --wds-white: #ffffff;
  --wds-orange: #f7931e;
  --wds-cream: #fff8e1;
}
```

## Tailwind Theme Colors

Added to `@theme inline`:

```css
--color-wds-background: #000000;
--color-wds-text: #ffffff;
--color-wds-accent: #f7931e;
--color-wds-secondary: #fff8e1;
```

## Usage

### In CSS

```css
background-color: var(--wds-black);
color: var(--wds-white);
border-color: var(--wds-orange);
```

### In Tailwind Classes

```tsx
<div className="bg-wds-background text-wds-text">
  <button className="bg-wds-accent</button>
</div>
```

### Or use hex values directly

```tsx
<div className="bg-wds-backgroundround text-wds-text">
  <button className="bg-wds-accent">Click me</button>
</div>
```

## Colors by Role

| Role                 | Color  | Hex       | RGB                  |
| -------------------- | ------ | --------- | -------------------- |
| Main Background      | Black  | `#000000` | `rgb(0, 0, 0)`       |
| Main Text            | White  | `#FFFFFF` | `rgb(255, 255, 255)` |
| Accent/CTA           | Orange | `#F7931E` | `rgb(247, 147, 30)`  |
| Secondary Background | Cream  | `#FFF8E1` | `rgb(255, 248, 225)` |

## Notes

- This color palette is suitable for dark theme
- Orange accent creates good contrast on black background
- Cream color is used for illustrations and decorative elements
- Ensures sufficient contrast ratio for accessibility (WCAG AA)
