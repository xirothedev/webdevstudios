const path = require('node:path');

const repoRoot = __dirname;

const shellQuote = (value) => `"${value.replace(/(["\\$`])/g, '\\$1')}"`;

const toRootFiles = (filenames) =>
  filenames.map((file) =>
    path.relative(repoRoot, path.isAbsolute(file) ? file : path.join(repoRoot, file)),
  );

module.exports = {
  'apps/api/**/*.{ts,tsx,js,jsx,mjs}': (filenames) => {
    const files = filenames.filter((file) => !file.includes('eslint.config.mjs'));
    if (files.length === 0) return [];
    const rootFiles = toRootFiles(files).map(shellQuote);
    return [
      `bun --bun node_modules/.bin/oxlint --fix ${rootFiles.join(' ')}`,
      `bun --bun node_modules/.bin/prettier --write ${rootFiles.join(' ')}`,
    ];
  },
  'apps/web/**/*.{ts,tsx,js,jsx,mjs}': (filenames) => {
    // Filter out eslint.config.mjs and other config files
    const files = filenames.filter((file) => !file.includes('eslint.config.mjs'));
    if (files.length === 0) return [];
    const rootFiles = toRootFiles(files).map(shellQuote);
    return [
      `bun --bun apps/web/node_modules/.bin/eslint --config apps/web/eslint.config.mjs --fix ${rootFiles.join(
        ' ',
      )}`,
      `bun --bun apps/web/node_modules/.bin/prettier --write ${rootFiles.join(' ')}`,
    ];
  },
  '*.{json,md,yml,yaml,css,scss}': (filenames) => {
    // Ignore lock files and docs
    const files = toRootFiles(filenames).filter(
      (file) => !file.includes('bun.lock') && !file.endsWith('.md'),
    );
    if (files.length === 0) return [];
    return `bun --bun node_modules/.bin/prettier --write ${files.map(shellQuote).join(' ')}`;
  },
};
