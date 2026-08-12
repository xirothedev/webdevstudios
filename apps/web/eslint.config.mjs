import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

export default defineConfig([
  tseslint.configs.recommended,
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'import/no-duplicates': ['error', { 'prefer-inline': true }],
    },
  },
  {
    // ponytail: client-only random decorations — server render must stay empty
    // to avoid hydration mismatch; lazy useState init would change SSR output.
    files: ['**/src/app/not-found.tsx', '**/src/app/generation/page.tsx'],
    rules: {
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    // ponytail: async server components catch data-fetching errors with
    // try/catch + notFound()/fallback (Next.js RSC pattern); error boundaries
    // do not apply to server-component data paths.
    files: ['**/src/app/blog/**/page.tsx', '**/src/components/blog/BlogPostContentMDX.tsx'],
    rules: {
      'react-hooks/error-boundaries': 'off',
    },
  },
  prettier,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
])
