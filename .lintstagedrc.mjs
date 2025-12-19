import path from 'path';

function getAppDir(file) {
  if (file.startsWith('apps/web/')) return 'apps/web';
  if (file.startsWith('apps/api/')) return 'apps/api';
  return null;
}

export default {
  // JavaScript/TypeScript files
  '*.{js,jsx,ts,tsx}': (filenames) => {
    const commands = [];

    // Group files by app
    const filesByApp = {};
    const rootFiles = [];

    filenames.forEach((file) => {
      const appDir = getAppDir(file);
      if (appDir) {
        if (!filesByApp[appDir]) filesByApp[appDir] = [];
        filesByApp[appDir].push(file);
      } else {
        rootFiles.push(file);
      }
    });

    // Run eslint for each app
    Object.entries(filesByApp).forEach(([appDir, files]) => {
      commands.push({
        command: `cd ${appDir} && npx eslint --fix ${files.map((f) => `"${f}"`).join(' ')}`,
        cwd: process.cwd(),
      });
    });

    // Run prettier for all files
    commands.push(
      `npx prettier --write ${filenames.map((f) => `"${f}"`).join(' ')}`
    );

    return commands;
  },
  // JSON, Markdown, YAML, CSS files
  '*.{json,md,yml,yaml,css,scss}': (filenames) => {
    // Ignore lock files
    const files = filenames.filter((file) => !file.includes('pnpm-lock.yaml'));
    if (files.length === 0) return [];
    return [`npx prettier --write ${files.map((f) => `"${f}"`).join(' ')}`];
  },
};
