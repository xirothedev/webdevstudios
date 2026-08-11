import { Injectable } from '@nestjs/common';
import { BlogRepository } from '../infrastructure/blog.repository';

// ponytail: service layer introduced as part of CQRS → Services refactor
// This is the initial skeleton. Business logic will be migrated from commands/queries handlers here.
@Injectable()
export class BlogService {
  constructor(private readonly blogRepository: BlogRepository) {}

  // Service methods will be filled as handlers are migrated
}
