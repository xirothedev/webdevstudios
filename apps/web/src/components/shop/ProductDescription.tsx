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

'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

interface ProductDescriptionProps {
  markdown: string;
}

/**
 * Reusable markdown components styled for shop theme
 * Reuses patterns from mdx-components.tsx but adapted for shop context
 */
const markdownComponents = {
  h1: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className={`mb-4 text-2xl font-semibold text-white ${className ?? ''}`.trim()}
      {...props}
    />
  ),
  h2: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className={`mt-6 mb-3 text-xl font-semibold text-white ${className ?? ''}`.trim()}
      {...props}
    />
  ),
  h3: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className={`mt-4 mb-2 text-lg font-semibold text-white ${className ?? ''}`.trim()}
      {...props}
    />
  ),
  p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className={`mb-4 leading-relaxed text-white/80 ${className ?? ''}`.trim()}
      {...props}
    />
  ),
  ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      className={`mb-4 ml-6 list-disc space-y-2 text-white/80 ${className ?? ''}`.trim()}
      {...props}
    />
  ),
  ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol
      className={`mb-4 ml-6 list-decimal space-y-2 text-white/80 ${className ?? ''}`.trim()}
      {...props}
    />
  ),
  li: ({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className={`${className ?? ''}`.trim()} {...props} />
  ),
  strong: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <strong
      className={`font-semibold text-white ${className ?? ''}`.trim()}
      {...props}
    />
  ),
  em: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <em
      className={`text-white/90 italic ${className ?? ''}`.trim()}
      {...props}
    />
  ),
  a: ({
    className,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      className={`text-wds-accent hover:text-wds-accent/80 underline transition-colors ${className ?? ''}`.trim()}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  hr: ({ className, ...props }: React.HTMLAttributes<HTMLHRElement>) => (
    <hr
      className={`my-6 border-white/10 ${className ?? ''}`.trim()}
      {...props}
    />
  ),
  code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <code
      className={`rounded bg-white/10 px-1.5 py-0.5 text-sm text-white/90 ${className ?? ''}`.trim()}
      {...props}
    />
  ),
  pre: ({ className, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className={`mb-4 overflow-x-auto rounded-lg bg-white/5 p-4 text-sm text-white/90 ${className ?? ''}`.trim()}
      {...props}
    />
  ),
  blockquote: ({
    className,
    ...props
  }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className={`border-wds-accent/50 mb-4 border-l-4 bg-white/5 pl-4 text-white/70 italic ${className ?? ''}`.trim()}
      {...props}
    />
  ),
  img: ({ className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img
      className={`mb-4 rounded-lg ${className ?? ''}`.trim()}
      loading="lazy"
      {...props}
    />
  ),
  table: ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="mb-4 overflow-x-auto">
      <table
        className={`w-full border-collapse border border-white/10 ${className ?? ''}`.trim()}
        {...props}
      />
    </div>
  ),
  thead: ({
    className,
    ...props
  }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className={`bg-white/5 ${className ?? ''}`.trim()} {...props} />
  ),
  tbody: ({
    className,
    ...props
  }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <tbody className={className} {...props} />
  ),
  tr: ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr
      className={`border-b border-white/10 ${className ?? ''}`.trim()}
      {...props}
    />
  ),
  th: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      className={`border border-white/10 px-4 py-2 text-left font-semibold text-white ${className ?? ''}`.trim()}
      {...props}
    />
  ),
  td: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td
      className={`border border-white/10 px-4 py-2 text-white/80 ${className ?? ''}`.trim()}
      {...props}
    />
  ),
};

export function ProductDescription({ markdown }: ProductDescriptionProps) {
  if (!markdown) {
    return null;
  }

  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={markdownComponents}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
