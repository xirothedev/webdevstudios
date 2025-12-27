<!-- 59e533da-f1b6-41a2-b2aa-7031c6648ad2 a527eab5-03ba-4d0e-ab88-a8b850ac31d1 -->

# Kế hoạch thiết kế và code trang /account/profile

## Tổng quan

Trang `/account/profile` cho phép người dùng xem và chỉnh sửa thông tin cá nhân:

- **Thông tin cơ bản**: Họ tên (fullName), Số điện thoại (phone)
- **Ảnh đại diện**: Upload và cập nhật avatar
- **Thông tin hiển thị**: Email (read-only), trạng thái xác thực email/phone

## Kiến trúc

### File Structure

```
apps/web/src/
├── app/
│   └── account/
│       └── profile/
│           └── page.tsx              # Main profile page
├── lib/
│   └── api/
│       ├── users.api.ts              # Users API client (NEW)
│       └── hooks/
│           └── use-user.ts           # User hooks (NEW)
└── components/
    └── account/
        ├── ProfileForm.tsx           # Profile edit form (NEW)
        └── AvatarUpload.tsx           # Avatar upload component (NEW)
```

## Implementation Details

### 1. API Client & Hooks

#### `apps/web/src/lib/api/users.api.ts` (NEW)

- `getUserProfile()`: GET `/users/me` - Lấy thông tin profile
- `updateProfile(data)`: PATCH `/users/profile` - Cập nhật fullName, phone
- `updateAvatar(file)`: PATCH `/users/avatar` - Upload avatar (FormData)

#### `apps/web/src/lib/api/hooks/use-user.ts` (NEW)

- `useUserProfile()`: Query hook để lấy profile
- `useUpdateProfile()`: Mutation hook để cập nhật profile
- `useUpdateAvatar()`: Mutation hook để upload avatar

### 2. Components

#### `apps/web/src/components/account/ProfileForm.tsx` (NEW)

Form component với các trường:

- **Full Name**: Input text (required, max 100 chars)
- **Phone**: Input text (optional, max 15 chars)
- **Email**: Display only (read-only, từ user data)
- **Email Verified**: Badge hiển thị trạng thái xác thực
- **Phone Verified**: Badge hiển thị trạng thái xác thực

Validation:

- Full Name: Required, 1-100 characters
- Phone: Optional, max 15 characters, format validation

#### `apps/web/src/components/account/AvatarUpload.tsx` (NEW)

Component upload avatar với:

- Hiển thị avatar hiện tại (hoặc initials nếu không có)
- Button "Thay đổi ảnh" để trigger file input
- Preview ảnh trước khi upload
- Loading state khi đang upload
- Error handling

### 3. Page Component

#### `apps/web/src/app/account/profile/page.tsx` (NEW)

Server Component hoặc Client Component với:

- Layout: White theme (giống generation page)
- Navbar: `variant="light"`
- Footer: `variant="light"`
- Section structure:
  - Hero section với title "Hồ sơ của tôi"
  - Profile form section
  - Avatar upload section

## Design Specifications

### Layout

- **Background**: White (`bg-white`)
- **Container**: `max-w-4xl mx-auto px-6`
- **Spacing**: `py-20` cho hero, `py-16` cho content sections

### Typography

- **Page Title**: `text-3xl sm:text-4xl font-black text-balance text-black`
- **Section Labels**: `text-wds-accent text-sm font-semibold tracking-wide uppercase`
- **Form Labels**: `text-sm font-semibold text-gray-900`
- **Helper Text**: `text-xs text-gray-500`

### Form Styling

- **Input Fields**: Light theme styling
  - Border: `border-gray-300`
  - Background: `bg-white`
  - Focus: `focus:border-wds-accent focus:ring-wds-accent/20`
  - Text: `text-gray-900`
- **Buttons**:
  - Primary: `bg-wds-accent text-black hover:bg-wds-accent/90`
  - Secondary: `border border-gray-300 text-gray-700 hover:bg-gray-50`

### Avatar Section

- **Avatar Container**: `rounded-full` với shadow
- **Size**: `h-32 w-32` (desktop), `h-24 w-24` (mobile)
- **Upload Button**: Outline style với icon

### Badges (Verification Status)

- **Verified**: Green badge với check icon
- **Unverified**: Gray badge với info icon

## API Integration

### Endpoints Used

1. `GET /users/me` - Lấy profile (đã có trong authApi, nhưng cần tách ra usersApi)
2. `PATCH /users/profile` - Cập nhật profile
3. `PATCH /users/avatar` - Upload avatar (multipart/form-data)

### Error Handling

- Hiển thị toast notifications cho success/error
- Validation errors hiển thị inline dưới mỗi field
- Network errors hiển thị generic message

## State Management

- Sử dụng React Query (`@tanstack/react-query`) cho data fetching
- Form state: React Hook Form (nếu cần) hoặc useState đơn giản
- Optimistic updates cho better UX

## Responsive Design

- **Mobile**: Single column, stacked form fields
- **Tablet**: Single column với spacing lớn hơn
- **Desktop**: Two-column layout cho avatar và form (optional)

## Accessibility

- Proper labels cho tất cả form fields
- ARIA labels cho buttons
- Keyboard navigation support
- Focus indicators rõ ràng
- Error messages accessible

## Testing Considerations

- Test form validation
- Test file upload (avatar)
- Test error states
- Test loading states
- Test responsive layout

## Dependencies

### New Dependencies (nếu cần)

- `react-hook-form` (optional, nếu muốn form validation mạnh hơn)
- `zod` (optional, cho schema validation)

### Existing Dependencies

- `@tanstack/react-query` - Đã có
- `sonner` - Đã có (toast notifications)
- `lucide-react` - Đã có (icons)
- `next/image` - Đã có (image optimization)

## Implementation Order

1. **API Layer**: Tạo `users.api.ts` và `use-user.ts` hooks
2. **Components**: Tạo `AvatarUpload.tsx` và `ProfileForm.tsx`
3. **Page**: Tạo `page.tsx` và integrate components
4. **Styling**: Apply design system, test responsive
5. **Polish**: Add loading states, error handling, animations

## Notes

- Input component hiện tại styled cho dark theme, cần tạo variant light hoặc override styles
- Có thể tái sử dụng `UserAvatar` component cho avatar display
- Cần tách `getCurrentUser` từ `authApi` sang `usersApi` để consistency
- Avatar upload cần handle file validation (size, type) ở frontend trước khi gửi lên server

### To-dos

- [ ] Tạo users.api.ts với các methods: getUserProfile, updateProfile, updateAvatar
- [ ] Tạo use-user.ts hooks: useUserProfile, useUpdateProfile, useUpdateAvatar với React Query
- [ ] Tạo AvatarUpload component với preview, file input, và upload logic
- [ ] Tạo ProfileForm component với form fields (fullName, phone) và validation
- [ ] Tạo page.tsx với layout, integrate ProfileForm và AvatarUpload components
- [ ] Apply design system (light theme), responsive design, và accessibility features
- [ ] Thêm error handling, loading states, và toast notifications
