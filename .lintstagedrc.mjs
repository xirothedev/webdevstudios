function getAppDir(file) {
  if (file.startsWith('apps/web/')) return 'apps/web';
  if (file.startsWith('apps/api/')) return 'apps/api';
  return null;
}

export default {
  // JavaScript/TypeScript files
  '*.{js,jsx,ts,tsx}': (filenames) => {
    const commands = [];
    
    // Group files by app and root
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
      commands.push(`pnpm -C ${appDir} exec eslint --fix ${files.join(' ')}`);
    });
    
    // Run prettier for each app (to use correct config)
    Object.entries(filesByApp).forEach(([appDir, files]) => {
      commands.push(`pnpm -C ${appDir} exec prettier --write ${files.join(' ')}`);
    });
    
    // Run prettier for root files
    if (rootFiles.length > 0) {
      commands.push(`pnpm exec prettier --write ${rootFiles.join(' ')}`);
    }
    
    return commands;
  },
  // JSON, Markdown, YAML, CSS files
  '*.{json,md,yml,yaml,css,scss}': (filenames) => {
    // Ignore lock files
    const files = filenames.filter((file) => !file.includes('pnpm-lock.yaml'));
    if (files.length === 0) return [];
    
    const commands = [];
    const filesByApp = {};
    const rootFiles = [];
    
    files.forEach((file) => {
      const appDir = getAppDir(file);
      if (appDir) {
        if (!filesByApp[appDir]) filesByApp[appDir] = [];
        filesByApp[appDir].push(file);
      } else {
        rootFiles.push(file);
      }
    });
    
    // Run prettier for each app
    Object.entries(filesByApp).forEach(([appDir, files]) => {
      commands.push(`pnpm -C ${appDir} exec prettier --write ${files.join(' ')}`);
    });
    
    // Run prettier for root files
    if (rootFiles.length > 0) {
      commands.push(`pnpm exec prettier --write ${rootFiles.join(' ')}`);
    }
    
    return commands;
  },
};
