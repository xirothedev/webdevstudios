<!-- 9ea51448-aa05-478f-a748-9bf502f875d0 37478a8f-7519-4463-b88e-79ffb12cf8f5 -->

# Users Module Implementation Plan

## Overview

Tạo users module theo CQRS pattern để quản lý user profiles và admin operations. Module này sẽ tách biệt khỏi auth module (auth chỉ xử lý authentication, users xử lý user management).

## Key Requirements

- **Swagger Documentation**: Đầy đủ decorators cho tất cả DTOs và Controller
- **Privacy Controls**: Giới hạn dữ liệu public khi users khác tìm kiếm
- **Avatar Storage TODO**: Đánh dấu TODO cho S3/R2 Cloudflare implementation (plan tiếp theo)

## Architecture

### Module Structure

```
apps/api/src/users/
├── commands/
│   ├── update-profile/
│   │   ├── update-profile.command.ts
│   │   └── update-profile.handler.ts
│   ├── update-avatar/
│   │   ├── update-avatar.command.ts
│   │   └── update-avatar.handler.ts
│   ├── update-user/ (admin only)
│   │   ├── update-user.command.ts
│   │   └── update-user.handler.ts
│   └── delete-user/ (admin only)
│       ├── delete-user.command.ts
│       └── delete-user.handler.ts
├── queries/
│   ├── get-user-by-id/
│   │   ├── get-user-by-id.query.ts
│   │   ├── get-user-by-id.handler.ts
│   │   └── user.dto.ts (PublicUserDto, PrivateUserDto)
│   ├── list-users/ (admin only)
│   │   ├── list-users.query.ts
│   │   ├── list-users.handler.ts
│   │   └── list-users.dto.ts
│   └── search-users/
│       ├── search-users.query.ts
│       ├── search-users.handler.ts
│       └── search-users.dto.ts
├── dtos/
│   ├── update-profile.dto.ts
│   ├── update-avatar.dto.ts
│   ├── update-user.dto.ts (admin)
│   └── responses.dto.ts
├── guards/
│   └── roles.guard.ts (Admin guard)
├── decorators/
│   └── roles.decorator.ts (Roles decorator)
└── users.controller.ts
```

## Implementation Steps

### 1. Create Users Module Structure

- Tạo folder `apps/api/src/users/`
- Tạo `users.module.ts` với CQRSModule, PrismaModule
- Export UserRepository từ AuthModule để reuse

### 2. Create Role-Based Access Control

**File: `apps/api/src/users/guards/roles.guard.ts`**

- Guard để check user role (ADMIN only)
- Sử dụng JWT payload để lấy role
- Throw ForbiddenException nếu không phải admin

**File: `apps/api/src/users/decorators/roles.decorator.ts`**

- Decorator `@Roles()` để mark endpoints cần admin
- Sử dụng SetMetadata

### 3. Create DTOs với Swagger Decorators

**File: `apps/api/src/users/dtos/update-profile.dto.ts`**

- fullName (optional, string)
- phone (optional, string)
- Validation với class-validator
- **Swagger**: @ApiProperty với descriptions và examples

**File: `apps/api/src/users/dtos/update-avatar.dto.ts`**

- avatar (string, URL)
- Validation
- **Swagger**: @ApiProperty với description và example
- **Note**: TODO - S3/R2 Cloudflare storage implementation

**File: `apps/api/src/users/dtos/update-user.dto.ts`** (admin)

- fullName, phone, avatar, role (optional)
- Validation
- **Swagger**: @ApiProperty với descriptions và examples

**File: `apps/api/src/users/dtos/responses.dto.ts`**

- **PublicUserDto**: id, fullName, avatar (limited public data)
- **PrivateUserDto**: Tất cả fields (cho own profile hoặc admin)
- UserListResponseDto với pagination
- **Swagger**: Đầy đủ @ApiProperty cho tất cả fields

### 4. Create Commands (Write Operations)

#### Update Profile Command

**File: `apps/api/src/users/commands/update-profile/update-profile.command.ts`**

```typescript
export class UpdateProfileCommand {
  constructor(
    public readonly userId: string,
    public readonly fullName?: string,
    public readonly phone?: string
  ) {}
}
```

**File: `apps/api/src/users/commands/update-profile/update-profile.handler.ts`**

- Validate user exists
- Update user via UserRepository
- Return updated user data (PrivateUserDto)

#### Update Avatar Command

**File: `apps/api/src/users/commands/update-avatar/update-avatar.command.ts`**

```typescript
export class UpdateAvatarCommand {
  constructor(
    public readonly userId: string,
    public readonly avatar: string
  ) {}
}
```

**File: `apps/api/src/users/commands/update-avatar/update-avatar.handler.ts`**

- Validate avatar URL format
- **TODO**: Implement S3/R2 Cloudflare storage for avatar upload
  - Hiện tại: Accept avatar URL string
  - Future: Upload file → R2 Cloudflare → Return CDN URL
  - Image validation (size, format)
  - Image optimization/resizing
- Update avatar via UserRepository
- Return updated user

#### Update User Command (Admin)

**File: `apps/api/src/users/commands/update-user/update-user.command.ts`**

```typescript
export class UpdateUserCommand {
  constructor(
    public readonly targetUserId: string,
    public readonly fullName?: string,
    public readonly phone?: string,
    public readonly avatar?: string,
    public readonly role?: UserRole
  ) {}
}
```

**File: `apps/api/src/users/commands/update-user/update-user.handler.ts`**

- Validate target user exists
- Update user (admin có thể update role)
- Return updated user (PrivateUserDto)

#### Delete User Command (Admin)

**File: `apps/api/src/users/commands/delete-user/delete-user.command.ts`**

```typescript
export class DeleteUserCommand {
  constructor(public readonly userId: string) {}
}
```

**File: `apps/api/src/users/commands/delete-user/delete-user.handler.ts`**

- Validate user exists
- Soft delete hoặc hard delete (tùy business logic)
- Return success

### 5. Create Queries (Read Operations) với Privacy Logic

#### Get User By ID Query

**File: `apps/api/src/users/queries/get-user-by-id/get-user-by-id.query.ts`**

```typescript
export class GetUserByIdQuery {
  constructor(
    public readonly userId: string,
    public readonly requesterId?: string, // Current user ID
    public readonly requesterRole?: UserRole // Current user role
  ) {}
}
```

**File: `apps/api/src/users/queries/get-user-by-id/get-user-by-id.handler.ts`**

- Fetch user via UserRepository
- **Privacy Logic**:
  - Nếu requesterId === userId: Return PrivateUserDto (full data)
  - Nếu requesterRole === ADMIN: Return PrivateUserDto (full data)
  - Otherwise: Return PublicUserDto (limited: id, fullName, avatar only)
- Throw NotFoundException nếu không tìm thấy

**File: `apps/api/src/users/queries/get-user-by-id/user.dto.ts`**

- **PublicUserDto**: id, fullName, avatar (Swagger decorators)
- **PrivateUserDto**: Tất cả fields (Swagger decorators)

#### List Users Query (Admin)

**File: `apps/api/src/users/queries/list-users/list-users.query.ts`**

```typescript
export class ListUsersQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly role?: UserRole
  ) {}
}
```

**File: `apps/api/src/users/queries/list-users/list-users.handler.ts`**

- Pagination với Prisma
- Filter by role (optional)
- Return list + pagination metadata (PrivateUserDto cho admin)

**File: `apps/api/src/users/queries/list-users/list-users.dto.ts`**

- PaginationDto với Swagger decorators
- UserListResponseDto với Swagger decorators

#### Search Users Query

**File: `apps/api/src/users/queries/search-users/search-users.query.ts`**

```typescript
export class SearchUsersQuery {
  constructor(
    public readonly query: string,
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly requesterId?: string,
    public readonly requesterRole?: UserRole
  ) {}
}
```

**File: `apps/api/src/users/queries/search-users/search-users.handler.ts`**

- **Privacy Logic**:
  - Nếu requesterRole === ADMIN: Search by email và fullName, return PrivateUserDto
  - Otherwise (regular users): Search by fullName only, return PublicUserDto (limited data)
- Pagination
- Return results với appropriate DTO based on requester role

### 6. Create Controller với Swagger Documentation

**File: `apps/api/src/users/users.controller.ts`**

Endpoints với đầy đủ Swagger decorators:

- `PATCH /users/profile` - Update own profile (authenticated)
  - @ApiOperation với summary và description
  - @ApiBody với UpdateProfileDto
  - @ApiResponse (200, 401, 400)
  - @ApiBearerAuth

- `PATCH /users/avatar` - Update own avatar (authenticated)
  - @ApiOperation với summary và description
  - @ApiBody với UpdateAvatarDto
  - @ApiResponse (200, 401, 400)
  - @ApiBearerAuth
  - **Note**: TODO - S3/R2 Cloudflare upload

- `GET /users/me` - Get own profile (authenticated)
  - @ApiOperation với summary và description
  - @ApiResponse (200 với PrivateUserDto, 401)
  - @ApiBearerAuth

- `GET /users/:id` - Get user by ID (public hoặc authenticated)
  - @ApiOperation với summary và description
  - @ApiParam với description
  - @ApiResponse (200 với PublicUserDto hoặc PrivateUserDto, 404)
  - Privacy: Return limited data nếu không phải own profile hoặc admin

- `GET /users` - List users (admin only)
  - @ApiOperation với summary và description
  - @ApiQuery (page, limit, role) với descriptions
  - @ApiResponse (200, 401, 403)
  - @ApiBearerAuth
  - @Roles('ADMIN')

- `GET /users/search?q=...` - Search users (authenticated, limited for non-admin)
  - @ApiOperation với summary và description
  - @ApiQuery (q, page, limit) với descriptions
  - @ApiResponse (200, 401)
  - @ApiBearerAuth
  - Privacy: Regular users chỉ search by fullName, return limited data

- `PATCH /users/:id` - Update user (admin only)
  - @ApiOperation với summary và description
  - @ApiParam với description
  - @ApiBody với UpdateUserDto
  - @ApiResponse (200, 401, 403, 404)
  - @ApiBearerAuth
  - @Roles('ADMIN')

- `DELETE /users/:id` - Delete user (admin only)
  - @ApiOperation với summary và description
  - @ApiParam với description
  - @ApiResponse (200, 401, 403, 404)
  - @ApiBearerAuth
  - @Roles('ADMIN')

**Swagger Decorators cho Controller:**

- @ApiTags('Users')
- @ApiOperation() cho mỗi endpoint với summary và description
- @ApiResponse() cho success (200) và errors (400, 401, 403, 404, 500)
- @ApiBearerAuth() cho protected endpoints
- @ApiBody() cho POST/PATCH requests
- @ApiQuery() cho query parameters
- @ApiParam() cho path parameters
- @Roles() decorator cho admin endpoints

### 7. Update UserRepository (if needed)

- Thêm methods nếu cần: `findMany`, `search`, `delete`
- Hoặc tạo UserQueryRepository riêng cho read operations

### 8. Register Module

- Import UsersModule vào AppModule
- Export UserRepository từ AuthModule hoặc tạo UsersRepository riêng

## Privacy Controls

### Public User Data (khi users khác tìm kiếm)

- **Fields**: id, fullName, avatar
- **Không trả về**: email, phone, emailVerified, phoneVerified, mfaEnabled, createdAt, updatedAt, role

### Private User Data (own profile hoặc admin)

- **Fields**: Tất cả fields từ User model
- **Access**: Chỉ khi requesterId === userId hoặc requesterRole === ADMIN

### Search Limitations

- **Regular Users**: Chỉ search by fullName, return PublicUserDto
- **Admin**: Search by email và fullName, return PrivateUserDto

## Swagger Documentation Requirements

### DTOs

- Tất cả DTOs có @ApiProperty hoặc @ApiPropertyOptional
- Mỗi field có description và example
- Enum types được document đầy đủ
- Optional fields được đánh dấu đúng

### Controller

- @ApiTags('Users') cho controller
- @ApiOperation() cho mỗi endpoint với:
  - summary: Ngắn gọn
  - description: Chi tiết
- @ApiResponse() cho:
  - 200: Success với response DTO
  - 400: Bad Request
  - 401: Unauthorized
  - 403: Forbidden (admin only)
  - 404: Not Found
  - 500: Internal Server Error
- @ApiBearerAuth() cho protected endpoints
- @ApiBody() với DTO type cho POST/PATCH
- @ApiQuery() với descriptions cho query params
- @ApiParam() với descriptions cho path params

## Avatar Storage TODO

### Current Implementation

- Accept avatar URL string trong UpdateAvatarDto
- Validate URL format
- Store URL trong database

### Future Implementation (Next Plan)

- **S3/R2 Cloudflare Storage**:
  - File upload endpoint với multipart/form-data
  - Upload to R2 Cloudflare bucket
  - Image validation (size, format: jpg, png, webp)
  - Image optimization/resizing (thumbnails)
  - Return CDN URL
  - Delete old avatar khi upload mới

## Data Flow

### Update Profile Flow

```
Controller → CommandBus → UpdateProfileHandler → UserRepository → Database
```

### Get User By ID Flow (with Privacy)

```
Controller → QueryBus → GetUserByIdHandler → Check Privacy → Return PublicUserDto or PrivateUserDto
```

### Search Users Flow (with Privacy)

```
Controller → QueryBus → SearchUsersHandler → Check Role → Search (limited or full) → Return PublicUserDto or PrivateUserDto
```

## Security Considerations

- JWT authentication required cho tất cả endpoints (trừ public get user)
- Role-based authorization cho admin endpoints
- Validate user can only update own profile (trừ admin)
- Input validation với class-validator
- Sanitize user input
- Privacy controls để bảo vệ sensitive data

## Testing Considerations

- Unit tests cho handlers
- Integration tests cho endpoints
- Test role-based access control
- Test validation
- Test privacy controls (public vs private data)

## Dependencies

- Reuse UserRepository từ AuthModule (export)
- PrismaService từ PrismaModule
- JwtAuthGuard từ common/guards
- TransformInterceptor và HttpExceptionFilter (global)

## Notes

- Tách biệt auth module (authentication) và users module (user management)
- Follow CQRS pattern strictly
- Controllers chỉ dispatch commands/queries
- No business logic in controllers
- Return DTOs, not entities
- Privacy-first approach: Default to limited data, only return full data when authorized

## Future Enhancements (Next Plans)

- **Avatar Storage**: Implement S3/R2 Cloudflare storage
  - File upload endpoint
  - Image processing pipeline
  - CDN integration
- **Profile Visibility Settings**: Add profileVisibility field to User model
  - PUBLIC: Full name, avatar visible to everyone
  - PRIVATE: Only visible to admin and self

### To-dos

- [ ] Tạo users module structure và users.module.ts với CQRSModule, PrismaModule
- [ ] Tạo role-based access control: RolesGuard và Roles decorator
- [ ] Tạo DTOs: update-profile.dto.ts, update-avatar.dto.ts, update-user.dto.ts, responses.dto.ts với Swagger decorators
- [ ] Tạo Commands: UpdateProfileCommand, UpdateAvatarCommand, UpdateUserCommand, DeleteUserCommand với handlers
- [ ] Tạo Queries: GetUserByIdQuery, ListUsersQuery, SearchUsersQuery với handlers và DTOs
- [ ] Tạo UsersController với tất cả endpoints, Swagger decorators, và role guards
- [ ] Update UserRepository nếu cần thêm methods (findMany, search, delete)
- [ ] Register UsersModule vào AppModule và export UserRepository từ AuthModule
