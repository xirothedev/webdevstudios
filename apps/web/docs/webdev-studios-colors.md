# WebDev Studios Color Palette

Bảng màu được lấy từ trang web https://www.webdevstudios.org/

## Màu chính

### Background

- **Black**: `#000000` / `rgb(0, 0, 0)`
  - Màu nền chính của trang web
  - Sử dụng cho background chính

### Text

- **White**: `#FFFFFF` / `rgb(255, 255, 255)`
  - Màu chữ chính
  - Sử dụng cho tất cả text trên nền đen

### Accent

- **Vibrant Orange**: `#F7931E` / `rgb(247, 147, 30)`
  - Màu nhấn chính
  - Sử dụng cho logo, buttons, và các elements quan trọng
  - Tạo điểm nhấn trên nền đen

### Secondary Background

- **Light Creamy Yellow**: `#FFF8E1` / `rgb(255, 248, 225)`
  - Màu nền phụ cho illustrations
  - Sử dụng cho các elements decorative

## CSS Variables

Đã được thêm vào `globals.css`:

```css
:root {
  --wds-black: #000000;
  --wds-white: #ffffff;
  --wds-orange: #f7931e;
  --wds-cream: #fff8e1;
}
```

## Tailwind Theme Colors

Đã được thêm vào `@theme inline`:

```css
--color-wds-background: #000000;
--color-wds-text: #ffffff;
--color-wds-accent: #f7931e;
--color-wds-secondary: #fff8e1;
```

## Cách sử dụng

### Trong CSS

```css
background-color: var(--wds-black);
color: var(--wds-white);
border-color: var(--wds-orange);
```

### Trong Tailwind Classes

```tsx
<div className="bg-wds-background text-wds-text">
  <button className="bg-wds-accent</button>
</div>
```

### Hoặc sử dụng trực tiếp hex values

```tsx
<div className="bg-wds-backgroundround text-wds-text">
  <button className="bg-wds-accent">Click me</button>
</div>
```

## Màu sắc theo vai trò

| Vai trò          | Màu    | Hex       | RGB                  |
| ---------------- | ------ | --------- | -------------------- |
| Background chính | Black  | `#000000` | `rgb(0, 0, 0)`       |
| Text chính       | White  | `#FFFFFF` | `rgb(255, 255, 255)` |
| Accent/CTA       | Orange | `#F7931E` | `rgb(247, 147, 30)`  |
| Background phụ   | Cream  | `#FFF8E1` | `rgb(255, 248, 225)` |

## Ghi chú

- Bảng màu này phù hợp cho dark theme
- Orange accent tạo contrast tốt trên nền đen
- Cream color được sử dụng cho các illustrations và decorative elements
- Đảm bảo contrast ratio đủ cho accessibility (WCAG AA)
