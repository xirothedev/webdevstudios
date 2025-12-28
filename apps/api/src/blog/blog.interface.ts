import { BlogPost, BlogTag } from '@generated/prisma';

export type BlogPostWithRelations = BlogPost & {
  author: {
    id: string;
    fullName: string | null;
    avatar: string | null;
  };
  tags: BlogTag[];
};
