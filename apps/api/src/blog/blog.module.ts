/**
 * Copyright (c) 2026 Xiro The Dev <lethanhtrung.trungle@gmail.com>
 *
 * Source Available License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to:
 * - View and study the Software for educational purposes
 * - Fork this repository on GitHub for personal reference
 * - Share links to this repository
 *
 * THE FOLLOWING ARE PROHIBITED:
 * - Using the Software in production or commercial applications
 * - Copying substantial portions of the Software into other projects
 * - Distributing modified versions of the Software
 * - Removing or altering copyright notices
 *
 * For commercial licensing or usage permissions, contact: lethanhtrung.trungle@gmail.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Storage
import { StorageModule } from '../storage/storage.module';
// Controller
import { BlogController } from './blog.controller';
// Commands
import { CreateBlogPostHandler } from './commands/create-post/create-post.handler';
import { DeleteBlogPostHandler } from './commands/delete-post/delete-post.handler';
import { PublishBlogPostHandler } from './commands/publish-post/publish-post.handler';
import { UpdateBlogPostHandler } from './commands/update-post/update-post.handler';
// Repository
import { BlogRepository } from './infrastructure/blog.repository';
// Queries
import { GetBlogPostByIdHandler } from './queries/get-post-by-id/get-post-by-id.handler';
import { GetBlogPostBySlugHandler } from './queries/get-post-by-slug/get-post-by-slug.handler';
import { ListBlogPostsHandler } from './queries/list-posts/list-posts.handler';
import { SearchBlogPostsHandler } from './queries/search-posts/search-posts.handler';

const CommandHandlers = [
  CreateBlogPostHandler,
  UpdateBlogPostHandler,
  DeleteBlogPostHandler,
  PublishBlogPostHandler,
];

const QueryHandlers = [
  ListBlogPostsHandler,
  GetBlogPostBySlugHandler,
  GetBlogPostByIdHandler,
  SearchBlogPostsHandler,
];

@Module({
  imports: [CqrsModule, StorageModule],
  controllers: [BlogController],
  providers: [...CommandHandlers, ...QueryHandlers, BlogRepository],
  exports: [BlogRepository],
})
export class BlogModule {}
