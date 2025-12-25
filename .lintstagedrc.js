module.exports = {
  'apps/api/**/*.{ts,tsx,js,jsx,mjs}': (filenames) => {
    // Filter out eslint.config.mjs and other config files
    const files = filenames.filter(
      (file) => !file.includes('eslint.config.mjs')
    );
    if (files.length === 0) return [];
    // Use eslint with explicit config - no need to cd
    return [
      `pnpm -C apps/api exec eslint --config eslint.config.mjs --fix --max-warnings=0 ${files.join(' ')}`,
      `pnpm -C apps/api exec prettier --write ${files.join(' ')}`,
    ];
  },
  'apps/web/**/*.{ts,tsx,js,jsx,mjs}': (filenames) => {
    // Filter out eslint.config.mjs and other config files
    const files = filenames.filter(
      (file) => !file.includes('eslint.config.mjs')
    );
    if (files.length === 0) return [];
    return [
      `pnpm -C apps/web exec eslint --config eslint.config.mjs --fix --max-warnings=0 ${files.join(' ')}`,
      `pnpm -C apps/web exec prettier --write ${files.join(' ')}`,
    ];
  },
  '*.{json,md,yml,yaml,css,scss}': (filenames) => {
    // Ignore lock files
    const files = filenames.filter((file) => !file.includes('pnpm-lock.yaml'));
    if (files.length === 0) return [];
    return `pnpm exec prettier --write ${files.join(' ')}`;
  },
};
