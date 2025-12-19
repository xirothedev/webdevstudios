module.exports = {
  'apps/api/**/*.{ts,tsx,js,jsx,mjs}': (filenames) => {
    // Use eslint with explicit config - no need to cd
    return [
      `pnpm -C apps/api exec eslint --config eslint.config.mjs --fix --max-warnings=0 ${filenames.join(' ')}`,
      `pnpm -C apps/api exec prettier --write ${filenames.join(' ')}`,
    ];
  },
  'apps/web/**/*.{ts,tsx,js,jsx,mjs}': (filenames) => {
    return [
      `pnpm -C apps/web exec eslint --config eslint.config.mjs --fix --max-warnings=0 ${filenames.join(' ')}`,
      `pnpm -C apps/web exec prettier --write ${filenames.join(' ')}`,
    ];
  },
  '*.{json,md,yml,yaml,css,scss}': (filenames) => {
    // Ignore lock files
    const files = filenames.filter((file) => !file.includes('pnpm-lock.yaml'));
    if (files.length === 0) return [];
    return `pnpm exec prettier --write ${files.join(' ')}`;
  },
};
