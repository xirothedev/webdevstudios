# Hướng dẫn khôi phục tính năng Calendar

## Tổng quan

Tài liệu này hướng dẫn cách khôi phục lại tính năng Calendar đã bị disable bằng cách redirect về 404. Trang calendar (`/calendar`) đã được thay thế bằng `notFound()` redirect.

## Danh sách các file đã thay đổi

### 1. Calendar Pages

- `apps/web/src/app/calendar/page.tsx`

### 2. Navigation

- `apps/web/src/components/Navbar.tsx`

## Hướng dẫn khôi phục từng file

### 1. Khôi phục Calendar Page

#### `apps/web/src/app/calendar/page.tsx`

**Thay thế:**

```typescript
import { notFound } from 'next/navigation';

export default function CalendarPage() {
  notFound();
}
```

**Bằng:**

```typescript
import { CalendarContainer } from '@/components/calendar/CalendarContainer';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="light" />
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
            Lịch sự kiện
          </h1>
          <p className="mt-2 text-base text-gray-600 sm:text-lg">
            Xem tất cả các sự kiện, workshop và hoạt động của WebDev Studios
          </p>
        </div>
        <CalendarContainer />
      </div>
      <Footer variant="light" />
    </div>
  );
}
```

### 2. Khôi phục Navigation Links

#### `apps/web/src/components/Navbar.tsx`

**Thêm lại vào `navItems` array:**

```typescript
const navItems = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Về chúng tôi', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Lịch sự kiện', href: '/calendar' }, // ← Thêm lại dòng này
  { label: 'Thế hệ', href: '/generation' },
  { label: 'WDS chia sẻ', href: '/share' },
  { label: 'FAQ', href: '/faq' },
];
```

## Cách khôi phục nhanh bằng Git

Nếu bạn đã commit code trước khi disable calendar, có thể khôi phục nhanh bằng git:

```bash
# 1. Tìm commit hash trước khi disable calendar
git log --oneline --all --grep="disable calendar" -i

# 2. Xem danh sách file đã thay đổi
git diff <commit-before-disable> <commit-after-disable> --name-only

# 3. Khôi phục từng file cụ thể
git checkout <commit-before-disable> -- apps/web/src/app/calendar/page.tsx
git checkout <commit-before-disable> -- apps/web/src/components/Navbar.tsx

# 4. Hoặc khôi phục tất cả files trong một lần
git checkout <commit-before-disable> -- apps/web/src/app/calendar/
git checkout <commit-before-disable> -- apps/web/src/components/Navbar.tsx
```

## Checklist khôi phục

Sau khi khôi phục, kiểm tra:

- [ ] Calendar page hoạt động (`/calendar`)
- [ ] Navigation menu hiển thị "Lịch sự kiện" link
- [ ] CalendarContainer component hiển thị đúng
- [ ] Events được load và hiển thị
- [ ] Filter và search hoạt động (nếu có)
- [ ] Event details modal hoạt động (nếu có)
- [ ] Không có linter errors
- [ ] Test tất cả flows: view events, filter events, view event details

## Lưu ý

1. **Calendar Components**: Các components trong `src/components/calendar/` vẫn còn và không bị ảnh hưởng:
   - `CalendarContainer.tsx`
   - `EventFilter.tsx`
   - `EventDetailsModal.tsx`
   - `calendar.css`

2. **API Integration**: Đảm bảo backend API vẫn hoạt động và có thể xử lý các requests từ calendar component.

3. **Dependencies**: Đảm bảo tất cả dependencies cần thiết vẫn được cài đặt:
   - Calendar library (nếu có)
   - Date handling libraries
   - Các hooks từ `@/lib/api/hooks/` liên quan đến events

4. **Layout**: Calendar layout (`apps/web/src/app/calendar/layout.tsx`) vẫn còn và không cần thay đổi.

5. **Sitemap**: Nếu cần, thêm `/calendar` vào sitemap:
   ```typescript
   const routes = [
     '',
     '/about',
     '/calendar', // ← Thêm lại nếu cần
     '/faq',
     // ...
   ];
   ```

## Testing

Sau khi khôi phục, test kỹ:

- [ ] Load calendar page
- [ ] Display events correctly
- [ ] Filter events by date/type
- [ ] View event details
- [ ] Navigation from calendar page
- [ ] Responsive design (mobile, tablet, desktop)

## Liên hệ

Nếu gặp vấn đề khi khôi phục, kiểm tra:

1. Git history để xem code gốc
2. Backend API logs để debug
3. Browser console để xem frontend errors
4. Calendar components có đầy đủ dependencies
