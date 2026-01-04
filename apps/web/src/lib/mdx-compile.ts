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

import rehypeShiki from '@shikijs/rehype';
import type { MDXComponents } from 'mdx/types';
import { compileMDX } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';

/**
 * Compile markdown string to MDX component (RSC)
 * Uses Shiki for syntax highlighting with catppuccin-macchiato theme
 * Returns compiled MDX content that can be rendered directly
 */
export async function compileMarkdownToMDX(
  markdown: string,
  components?: MDXComponents
) {
  try {
    console.log(
      'compileMarkdownToMDX: Starting compilation, markdown length:',
      markdown.length
    );

    const { content } = await compileMDX({
      source: markdown,
      components,
      options: {
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            [
              rehypeShiki,
              {
                theme: 'catppuccin-macchiato',
              },
            ],
          ],
        },
      },
    });

    console.log('compileMarkdownToMDX: Compilation successful');

    return content;
  } catch (error) {
    console.error('Error compiling markdown to MDX:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      });
    }
    throw error;
  }
}
