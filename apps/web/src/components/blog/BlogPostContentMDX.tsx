import { useMDXComponents } from '@/app/mdx-components';
import { compileMarkdownToMDX } from '@/lib/mdx-compile';

interface BlogPostContentMDXProps {
  content: string;
}

/**
 * Blog post content renderer using MDX (RSC)
 * Compiles markdown to MDX with Shiki syntax highlighting
 * Uses compileMDX for RSC rendering
 */
export async function BlogPostContentMDX({ content }: BlogPostContentMDXProps) {
  if (!content) {
    console.warn('BlogPostContentMDX: No content provided');
    return null;
  }

  try {
    console.log(
      'BlogPostContentMDX: Compiling content, length:',
      content.length
    );

    // Get MDX components first
    const components = useMDXComponents({});

    // Compile markdown to MDX content (RSC) with components
    const mdxContent = await compileMarkdownToMDX(content, components);

    console.log('BlogPostContentMDX: Compiled successfully');

    return (
      <div className="prose prose-invert max-w-none [&_pre]:bg-transparent! [&_pre]:text-inherit! [&_pre_code]:text-inherit!">
        {mdxContent}
      </div>
    );
  } catch (error) {
    console.error('BlogPostContentMDX: Error rendering content', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      });
    }
    // Fallback: render plain text
    return (
      <div className="prose prose-invert max-w-none">
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-red-400">
          <p className="mb-2 font-semibold">Error rendering content:</p>
          <pre className="text-sm whitespace-pre-wrap">
            {error instanceof Error ? error.message : String(error)}
          </pre>
        </div>
        <div className="mt-4">
          <p className="text-wds-text/70 mb-2">Raw content (fallback):</p>
          <pre className="text-wds-text bg-wds-accent/5 rounded-lg p-4 text-sm whitespace-pre-wrap">
            {content.substring(0, 500)}
            {content.length > 500 ? '...' : ''}
          </pre>
        </div>
      </div>
    );
  }
}
