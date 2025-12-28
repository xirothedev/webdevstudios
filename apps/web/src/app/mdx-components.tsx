import type { MDXComponents } from 'mdx/types';
import Image from 'next/image';

/**
 * MDX components for blog posts
 * Custom styling for markdown elements
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Headings
    h1: ({ className, ...props }) => (
      <h1
        className={`text-wds-text mt-8 mb-4 text-3xl font-semibold first:mt-0 ${className ?? ''}`.trim()}
        {...props}
      />
    ),
    h2: ({ className, ...props }) => (
      <h2
        className={`text-wds-text mt-6 mb-3 text-2xl font-semibold ${className ?? ''}`.trim()}
        {...props}
      />
    ),
    h3: ({ className, ...props }) => (
      <h3
        className={`text-wds-text mt-4 mb-2 text-xl font-semibold ${className ?? ''}`.trim()}
        {...props}
      />
    ),
    h4: ({ className, ...props }) => (
      <h4
        className={`text-wds-text mt-3 mb-2 text-lg font-semibold ${className ?? ''}`.trim()}
        {...props}
      />
    ),

    // Paragraphs
    p: ({ className, ...props }) => (
      <p
        className={`text-wds-text/90 mb-4 text-base leading-7 ${className ?? ''}`.trim()}
        {...props}
      />
    ),

    // Lists
    ul: ({ className, ...props }) => (
      <ul
        className={`text-wds-text/80 mb-4 ml-6 list-disc space-y-2 ${className ?? ''}`.trim()}
        {...props}
      />
    ),
    ol: ({ className, ...props }) => (
      <ol
        className={`text-wds-text/80 mb-4 ml-6 list-decimal space-y-2 ${className ?? ''}`.trim()}
        {...props}
      />
    ),
    li: ({ className, ...props }) => (
      <li className={`${className ?? ''}`.trim()} {...props} />
    ),

    // Links
    a: ({ className, ...props }) => (
      <a
        className={`text-wds-accent hover:text-wds-accent/80 underline ${className ?? ''}`.trim()}
        {...props}
      />
    ),

    // Code blocks - Shiki will handle these
    pre: ({ className, ...props }) => (
      <pre
        className={`border-wds-accent/20 mb-4 overflow-x-auto rounded-lg border ${className ?? ''}`.trim()}
        {...props}
      />
    ),
    code: ({ className, ...props }) => {
      // Check if this is inline code or code block
      const isCodeBlock = className?.includes('language-');
      if (isCodeBlock) {
        // Code block - Shiki will handle styling
        return <code className={className} {...props} />;
      }
      // Inline code
      return (
        <code
          className={`text-wds-text rounded px-1.5 py-0.5 text-sm ${className ?? ''}`.trim()}
          {...props}
        />
      );
    },

    // Blockquote
    blockquote: ({ className, ...props }) => (
      <blockquote
        className={`border-wds-accent/50 text-wds-text/80 my-4 border-l-4 pl-4 italic ${className ?? ''}`.trim()}
        {...props}
      />
    ),

    // Images
    img: ({ src, alt, ...props }) => {
      if (!src) return null;
      // If it's a relative path or external URL, use Next.js Image
      if (src.startsWith('http') || src.startsWith('/')) {
        return (
          <Image
            src={src}
            alt={alt || ''}
            width={800}
            height={600}
            className="my-4 rounded-lg"
            {...props}
          />
        );
      }
      // Fallback to regular img tag
      return <img src={src} alt={alt} className="my-4 rounded-lg" {...props} />;
    },

    // Horizontal rule
    hr: ({ className, ...props }) => (
      <hr
        className={`border-wds-accent/30 my-8 ${className ?? ''}`.trim()}
        {...props}
      />
    ),

    // Tables
    table: ({ className, ...props }) => (
      <table
        className={`border-wds-accent/30 mb-4 w-full border-collapse border ${className ?? ''}`.trim()}
        {...props}
      />
    ),
    thead: ({ className, ...props }) => (
      <thead
        className={`bg-wds-accent/10 ${className ?? ''}`.trim()}
        {...props}
      />
    ),
    tbody: ({ className, ...props }) => (
      <tbody className={className} {...props} />
    ),
    tr: ({ className, ...props }) => (
      <tr
        className={`border-wds-accent/30 border-b ${className ?? ''}`.trim()}
        {...props}
      />
    ),
    th: ({ className, ...props }) => (
      <th
        className={`border-wds-accent/30 text-wds-text border px-4 py-2 text-left font-semibold ${className ?? ''}`.trim()}
        {...props}
      />
    ),
    td: ({ className, ...props }) => (
      <td
        className={`border-wds-accent/30 text-wds-text/80 border px-4 py-2 ${className ?? ''}`.trim()}
        {...props}
      />
    ),

    // Strong and emphasis
    strong: ({ className, ...props }) => (
      <strong
        className={`text-wds-text font-semibold ${className ?? ''}`.trim()}
        {...props}
      />
    ),
    em: ({ className, ...props }) => (
      <em className={`italic ${className ?? ''}`.trim()} {...props} />
    ),

    // Spread any other components
    ...components,
  };
}
