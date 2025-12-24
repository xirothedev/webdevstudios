import type { MDXComponents } from 'mdx/types';

import { LastUpdated } from '@/components/legal/last-updated';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    LastUpdated,
    ...components,
  };
}
