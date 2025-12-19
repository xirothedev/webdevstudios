export default {
  // JavaScript/TypeScript files
  '*.{js,jsx,ts,tsx}': (filenames) => {
    const files = filenames.join(' ');
    return [
      `pnpm exec eslint --fix ${files}`,
      `pnpm exec prettier --write ${files}`,
    ];
  },
  // JSON, Markdown, YAML, CSS files
  '*.{json,md,yml,yaml,css,scss}': (filenames) => {
    // Ignore lock files
    const files = filenames
      .filter((file) => !file.includes('pnpm-lock.yaml'))
      .join(' ');
    if (!files) return [];
    return [`pnpm exec prettier --write ${files}`];
  },
};
