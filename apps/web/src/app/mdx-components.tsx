import { MDXComponents } from '@/components/mdx/MDXComponents';

export function useMDXComponents(
  components: Record<string, React.ComponentType>
) {
  return {
    ...MDXComponents,
    ...components,
  };
}
