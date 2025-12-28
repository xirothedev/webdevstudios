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
