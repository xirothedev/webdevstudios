<!-- cc80284c-2712-408f-ba3e-6a2b44b0ad28 c3b664c5-34c9-44c8-9e44-8e7e938953eb -->

# Blog Feature with Hybrid Storage (PostgreSQL + R2)

## Selected Storage Solution: Option 2 - Hybrid Storage

**Decision: Use Hybrid Storage (PostgreSQL + R2)**

### Architecture Overview

- **PostgreSQL**: Stores metadata, searchable excerpt, and content URL
- **Cloudflare R2**: Stores full markdown content as files
- **Benefits**:
  - Better performance for large content
  - Reduced database size
  - CDN caching capabilities
  - Version history support (multiple files)
  - Easier content backup/export

## Database Schema (Hybrid Storage)

### Prisma Schema Design

```prisma
model BlogPost {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String   @db.VarChar(255)

  // Content stored in R2
  contentUrl  String   // R2 URL to markdown file (e.g., "blog/posts/{id}/content.md")
  contentSize Int?     // File size in bytes (for monitoring)

  // Searchable excerpt (stored in DB for full-text search)
  excerpt     String?  @db.VarChar(500)

  // Cover image (also in R2)
  coverImage  String?  // R2 URL to cover image

  authorId    String
  author      User     @relation(fields: [authorId], references: [id])

  // Metadata
  isPublished Boolean  @default(false)
  publishedAt DateTime?
  viewCount   Int      @default(0)

  // SEO
  metaTitle       String? @db.VarChar(255)
  metaDescription String? @db.VarChar(500)

  // Relations
  tags            BlogTag[]
  comments        BlogComment[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([slug])
  @@index([isPublished, publishedAt])
  @@index([authorId])
  @@fulltext([title, excerpt]) // Full-text search on title and excerpt
  @@map("blog_posts")
}

model BlogTag {
  id   String @id @default(cuid())
  name String @unique @db.VarChar(50)
  slug String @unique @db.VarChar(50)

  posts BlogPost[]

  @@map("blog_tags")
}

model BlogComment {
  id        String   @id @default(cuid())
  content   String   @db.Text
  postId    String
  post      BlogPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])

  parentId  String? // For nested comments
  parent    BlogComment? @relation("CommentReplies", fields: [parentId], references: [id])
  replies   BlogComment[] @relation("CommentReplies")

  isApproved Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([postId])
  @@index([authorId])
  @@map("blog_comments")
}
```

### R2 File Structure

```
blog/
├── posts/
│   ├── {postId}/
│   │   ├── content.md          # Main markdown content
│   │   ├── content-v1.md       # Version history (optional)
│   │   └── content-v2.md
│   └── {postId2}/
│       └── content.md
└── images/
    ├── covers/
    │   └── {postId}-cover.webp
    └── inline/
        └── {postId}-{imageId}.webp
```

## Content Management Flow

### Create Post Flow

1. User writes content in MarkdownEditor
2. Extract excerpt from content (first 500 chars)
3. Upload markdown content to R2: `blog/posts/{postId}/content.md`
4. Store metadata + contentUrl in PostgreSQL
5. Return post with contentUrl

### Read Post Flow

1. Query PostgreSQL for metadata
2. Fetch markdown content from R2 using contentUrl
3. Return combined data to frontend
4. Frontend renders with ReactMarkdown

### Update Post Flow

1. Upload new markdown to R2 (same or new URL)
2. Update contentUrl if changed
3. Update excerpt if content changed
4. Update metadata in PostgreSQL

### Delete Post Flow

1. Delete from PostgreSQL (cascade deletes comments/tags)
2. Delete content file from R2
3. Delete cover image from R2 (if exists)

## Implementation Plan

### Phase 1: Database Schema & Backend API

#### 1.1 Create Prisma Schema

- **File**: `apps/api/prisma/schema/blog.prisma`
- Add BlogPost model with `contentUrl` (R2 URL) and `excerpt` (for search)
- Add BlogTag, BlogComment models
- Add relation to User model
- Add full-text search index on title and excerpt
- Run migration

#### 1.2 Extend Storage Service

- **File**: `apps/api/src/storage/storage.service.ts`
- Add `uploadBlogContent(postId: string, content: string): Promise<string>` - Upload markdown, return URL
- Add `getBlogContent(contentUrl: string): Promise<string>` - Fetch markdown content
- Add `deleteBlogContent(contentUrl: string): Promise<void>` - Delete content file
- Add `uploadBlogCoverImage(postId: string, file: Express.Multer.File): Promise<string>` - Upload cover image
- Handle R2 file paths: `blog/posts/{postId}/content.md`

#### 1.3 Backend Module Structure (CQRS)

```
apps/api/src/blog/
├── blog.module.ts
├── blog.controller.ts
├── commands/
│   ├── create-post/
│   │   ├── create-post.command.ts
│   │   ├── create-post.handler.ts
│   │   └── create-post.dto.ts
│   ├── update-post/
│   ├── delete-post/
│   ├── publish-post/
│   └── create-comment/
├── queries/
│   ├── list-posts/
│   ├── get-post-by-slug/
│   ├── get-post-by-id/
│   └── search-posts/
├── dtos/
│   ├── blog-post.dto.ts
│   ├── create-post.dto.ts
│   └── update-post.dto.ts
└── domain/
    └── blog-post.entity.ts
```

#### 1.4 API Endpoints

- `GET /v1/blog/posts` - List published posts (paginated, filterable) - Returns metadata only
- `GET /v1/blog/posts/:slug` - Get post by slug - Fetches content from R2, returns full post
- `POST /v1/blog/posts` - Create post (Admin/Author) - Uploads content to R2, stores metadata in DB
- `PATCH /v1/blog/posts/:id` - Update post (Admin/Author) - Updates R2 content and metadata
- `DELETE /v1/blog/posts/:id` - Delete post (Admin) - Deletes from DB and R2
- `POST /v1/blog/posts/:id/publish` - Publish post (Admin)
- `GET /v1/blog/posts/search?q=...` - Search posts (full-text search on title/excerpt)
- `POST /v1/blog/posts/:id/comments` - Add comment
- `GET /v1/blog/posts/:id/comments` - Get comments
- `POST /v1/blog/posts/:id/cover-image` - Upload cover image (Admin/Author)

### Phase 2: Frontend Implementation

#### 2.1 Blog Pages

- **File**: `apps/web/src/app/blog/page.tsx` - Blog listing page (Server Component)
- **File**: `apps/web/src/app/blog/[slug]/page.tsx` - Blog post detail page (Server Component)
- **File**: `apps/web/src/app/admin/blog/page.tsx` - Admin blog management
- **File**: `apps/web/src/app/admin/blog/[id]/page.tsx` - Admin blog editor

#### 2.2 Blog Components

- **File**: `apps/web/src/components/blog/BlogPostCard.tsx` - Post card component
- **File**: `apps/web/src/components/blog/BlogPostContent.tsx` - Post content renderer (reuse ProductDescription pattern)
- **File**: `apps/web/src/components/blog/BlogPostList.tsx` - Post list component
- **File**: `apps/web/src/components/admin/BlogEditor.tsx` - Admin editor (reuse MarkdownEditor)

#### 2.3 API Client

- **File**: `apps/web/src/lib/api/blog.ts` - Blog API client functions
- Functions: `getBlogPosts()`, `getBlogPostBySlug()`, `createBlogPost()`, `updateBlogPost()`, etc.

#### 2.4 Reuse Existing Components

- Use `MarkdownEditor` from `apps/web/src/components/ui/markdown-editor.tsx`
- Adapt `ProductDescription` pattern for blog content rendering
- Reuse admin layout patterns

### Phase 3: Image Handling

#### 3.1 Cover Image Upload

- Use extended storage service `uploadBlogCoverImage()` method
- Store image URL in `coverImage` field (R2 URL)
- Optimize images (resize, WebP conversion) via existing storage service
- Store in R2: `blog/images/covers/{postId}-cover.webp`

#### 3.2 Inline Images in Content

- **Recommended**: Store images in R2, use markdown image syntax `![alt](url)`
- Image upload component in editor that:
  1. Uploads image to R2: `blog/images/inline/{postId}-{imageId}.webp`
  2. Inserts markdown syntax: `![alt](r2-public-url)` into editor
  3. Editor handles the markdown automatically

- Images are referenced in markdown content stored in R2

### Phase 4: SEO & Performance

#### 4.1 SEO Features

- Dynamic metadata generation for blog posts
- Open Graph tags
- Structured data (Article schema)
- Sitemap generation for blog posts

#### 4.2 Performance

- Server-side rendering for blog posts
- Image optimization with Next.js Image
- Pagination for blog listing
- Full-text search with PostgreSQL
- Cache R2 content in Redis (optional, for frequently accessed posts)
- Cache metadata queries with TTL: 1 hour for published posts, 5 minutes for drafts

### Phase 5: Error Handling & Validation

#### 5.1 Error Handling

- **R2 Upload Failure**: Rollback PostgreSQL transaction
- **R2 Fetch Failure**: Return error, log for monitoring
- **Content Not Found**: Return 404, handle gracefully
- **Large Content**: Validate size before upload (max 10MB recommended)

#### 5.2 Validation

- Validate markdown content format
- Validate excerpt length (max 500 chars)
- Validate slug uniqueness
- Validate cover image format and size

## Files to Create/Modify

### Backend

- `apps/api/prisma/schema/blog.prisma` - New schema file (with contentUrl field)
- `apps/api/src/blog/` - New module directory (CQRS pattern)
- `apps/api/src/storage/storage.service.ts` - Extend with blog content methods
- `apps/api/src/app.module.ts` - Import BlogModule

### Frontend

- `apps/web/src/app/blog/page.tsx` - Blog listing page
- `apps/web/src/app/blog/[slug]/page.tsx` - Blog post detail page
- `apps/web/src/app/admin/blog/page.tsx` - Admin blog management
- `apps/web/src/app/admin/blog/[id]/page.tsx` - Admin blog editor
- `apps/web/src/components/blog/` - Blog components directory
- `apps/web/src/components/admin/BlogEditor.tsx` - Admin editor (uses MarkdownEditor)
- `apps/web/src/lib/api/blog.ts` - Blog API client functions

### Documentation

- Update README.md with blog feature
- Add blog API documentation
- Document R2 file structure and content management flow

## Key Implementation Details

### Content Upload Process

1. Generate post ID (cuid)
2. Create R2 path: `blog/posts/{postId}/content.md`
3. Upload markdown content to R2
4. Extract excerpt (first 500 chars, strip markdown)
5. Store in PostgreSQL: `contentUrl`, `excerpt`, metadata
6. Return post with contentUrl

### Content Retrieval Process

1. Query PostgreSQL for post metadata
2. If content needed, fetch from R2 using `contentUrl`
3. Combine metadata + content
4. Return to frontend
5. Frontend renders with ReactMarkdown

### Transaction Safety

- Use database transactions for create/update operations
- If R2 upload fails, rollback database changes
- If database update fails, delete uploaded R2 file
- Ensure atomicity between DB and R2 operations

### To-dos

- [ ] Research existing markdown editor and storage patterns
- [ ] Design Prisma schema for blog posts (choose storage option)
- [ ] Create blog module with CQRS pattern (commands/queries)
- [ ] Create blog listing and detail pages
- [ ] Create admin blog editor using existing MarkdownEditor
- [ ] Implement cover image upload and inline image support
- [ ] Add SEO metadata and structured data for blog posts
