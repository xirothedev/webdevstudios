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

import { BlogPostSeedData } from './types';

export const blogPost: BlogPostSeedData = {
  slug: 'nestjs-cqrs-pattern-guide',
  title: 'Mastering CQRS Pattern in NestJS',
  excerpt:
    'Learn how to implement the CQRS (Command Query Responsibility Segregation) pattern in NestJS to build scalable and maintainable applications.',
  content: `# Mastering CQRS Pattern in NestJS

The CQRS (Command Query Responsibility Segregation) pattern is a powerful architectural pattern that separates read and write operations. In this guide, we'll explore how to implement it in NestJS.

## Understanding CQRS

CQRS separates your application into two distinct sides:

- **Command Side**: Handles write operations (create, update, delete)
- **Query Side**: Handles read operations (get, list, search)

## Benefits of CQRS

1. **Scalability**: Scale read and write operations independently
2. **Performance**: Optimize each side for its specific purpose
3. **Maintainability**: Clear separation of concerns

## Implementation in NestJS

### Setting Up CQRS Module

\`\`\`typescript
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [CqrsModule],
})
export class AppModule {}
\`\`\`

### Creating a Command

\`\`\`typescript
export class CreateUserCommand {
  constructor(
    public readonly name: string,
    public readonly email: string,
  ) {}
}
\`\`\`

### Creating a Command Handler

\`\`\`typescript
@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(private readonly repository: UserRepository) {}

  async execute(command: CreateUserCommand): Promise<string> {
    const user = await this.repository.create({
      name: command.name,
      email: command.email,
    });
    return user.id;
  }
}
\`\`\`

## Best Practices

- Keep commands and queries simple
- Use DTOs for validation
- Implement proper error handling
- Consider event sourcing for complex scenarios

## Conclusion

CQRS is a powerful pattern that can significantly improve your application's architecture when implemented correctly.`,
  metaTitle: 'CQRS Pattern in NestJS - Complete Guide | WebDev Studios',
  metaDescription:
    'Learn how to implement the CQRS pattern in NestJS to build scalable and maintainable applications with clear separation of concerns.',
  isPublished: true,
};
