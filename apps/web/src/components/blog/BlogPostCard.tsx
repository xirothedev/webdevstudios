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

import Image from 'next/image';
import Link from 'next/link';

import { BlogPost } from '@/lib/api/blog';

interface BlogPostCardProps {
  post: BlogPost;
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group border-wds-accent/30 bg-wds-background hover:border-wds-accent/50 flex h-full flex-col overflow-hidden rounded-lg border transition-all hover:shadow-lg"
    >
      {post.coverImage && (
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      <div className="flex h-full flex-col p-6">
        <div className="flex-1">
          <h2 className="text-wds-text group-hover:text-wds-accent mb-2 text-xl font-semibold transition-colors">
            {post.title}
          </h2>

          {post.excerpt && (
            <p className="text-wds-text/70 mb-4 line-clamp-3 text-sm">
              {post.excerpt}
            </p>
          )}
        </div>

        <div className="text-wds-text/50 mt-auto flex items-center justify-between text-xs">
          <span>{post.author.fullName || 'Anonymous'}</span>
          {post.publishedAt && (
            <span>
              {new Date(post.publishedAt).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
