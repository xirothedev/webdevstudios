import type { MDXComponents } from 'mdx/types';
import React from 'react';

import { LastUpdated } from '@/components/legal/last-updated';

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement>;

function createHeading(level: 1 | 2 | 3) {
  const Component = ({ children, id, className, ...rest }: HeadingProps) => {
    const tagMap: Record<1 | 2 | 3, 'h1' | 'h2' | 'h3'> = {
      1: 'h1',
      2: 'h2',
      3: 'h3',
    };
    const Tag = tagMap[level];
    const text =
      typeof children === 'string'
        ? children
        : React.Children.toArray(children).join(' ');
    const generatedId = id ?? (typeof text === 'string' ? slugify(text) : '');

    const base =
      level === 1
        ? 'scroll-mt-28 text-xl font-semibold text-wds-text'
        : level === 2
          ? 'scroll-mt-28 pt-6 text-lg font-semibold text-wds-text'
          : 'scroll-mt-28 pt-4 text-sm font-semibold tracking-wide text-neutral-200';

    return (
      <Tag
        id={generatedId || undefined}
        className={`${base} ${className ?? ''}`.trim()}
        {...rest}
      >
        {children}
      </Tag>
    );
  };

  return Component;
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    LastUpdated,
    h1: createHeading(1),
    h2: createHeading(2),
    h3: createHeading(3),
    p: ({ className, ...props }) => (
      <p
        className={`text-sm leading-relaxed text-neutral-200 ${className ?? ''}`.trim()}
        {...props}
      />
    ),
    ul: ({ className, ...props }) => (
      <ul
        className={`ml-4 list-disc space-y-1.5 text-sm text-neutral-200 ${className ?? ''}`.trim()}
        {...props}
      />
    ),
    ol: ({ className, ...props }) => (
      <ol
        className={`ml-4 list-decimal space-y-1.5 text-sm text-neutral-200 ${className ?? ''}`.trim()}
        {...props}
      />
    ),
    li: ({ className, children, ...props }) => (
      <li className={`${className ?? ''}`.trim()} {...props}>
        {children}
      </li>
    ),
    strong: ({ className, ...props }) => (
      <strong
        className={`text-wds-text font-semibold ${className ?? ''}`.trim()}
        {...props}
      />
    ),
    em: ({ className, ...props }) => (
      <em className={`text-neutral-300 ${className ?? ''}`.trim()} {...props} />
    ),
    hr: ({ className, ...props }) => (
      <hr
        className={`my-8 border-white/10 ${className ?? ''}`.trim()}
        {...props}
      />
    ),
    ...components,
  };
}
