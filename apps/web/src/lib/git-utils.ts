/**
 * Copyright (c) 2026 Xiro The Dev <lethanhtrung.trungle@gmail.com>
 *
 * Source Available License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to:
 * - View and study the Software for educational purposes
 * - Fork this repository on GitHub for personal reference
 * - Share links to this repository
 *
 * THE FOLLOWING ARE PROHIBITED:
 * - Using the Software in production or commercial applications
 * - Copying substantial portions of the Software into other projects
 * - Distributing modified versions of the Software
 * - Removing or altering copyright notices
 *
 * For commercial licensing or usage permissions, contact: lethanhtrung.trungle@gmail.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

/* eslint-disable @typescript-eslint/no-require-imports */
import { execSync } from 'child_process';
import { join } from 'path';

/**
 * Gets the last commit date for a specific file
 * @param filePath - Relative path from project root
 * @returns ISO date string (to be formatted by component with locale)
 */
export function getFileCommitDate(filePath: string): string {
  try {
    // Try to find the project root (where .git folder is)
    const projectRoot = findProjectRoot();
    const fullPath = join(projectRoot, filePath);

    // Get the last commit date for the file
    const command = `git log -1 --format=%ci -- "${fullPath}"`;
    const dateString = execSync(command, {
      encoding: 'utf-8',
      cwd: projectRoot,
      stdio: ['pipe', 'pipe', 'pipe'],
    })
      .toString()
      .trim();

    if (!dateString) {
      // If no commit found, try to get file modification date
      return getFileModificationDate(fullPath);
    }

    // Return ISO date string for formatting with locale
    return new Date(dateString).toISOString();
  } catch {
    // Fallback to file modification date if git command fails
    return getFileModificationDate(join(process.cwd(), filePath));
  }
}

/**
 * Finds the project root by looking for .git folder
 */
function findProjectRoot(): string {
  const fs = require('fs');
  const path = require('path');
  let currentDir = process.cwd();

  // Walk up the directory tree to find .git folder
  while (currentDir !== path.dirname(currentDir)) {
    const gitPath = path.join(currentDir, '.git');
    if (fs.existsSync(gitPath)) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }

  // Fallback to current working directory
  return process.cwd();
}

/**
 * Gets the file modification date as fallback
 * @param filePath - Absolute or relative file path
 * @returns ISO date string (to be formatted by component with locale)
 */
function getFileModificationDate(filePath: string): string {
  try {
    const fs = require('fs');
    const path = require('path');
    // If path is not absolute, make it relative to cwd
    const fullPath = path.isAbsolute(filePath)
      ? filePath
      : path.join(process.cwd(), filePath);
    const stats = fs.statSync(fullPath);
    // Return ISO date string for formatting with locale
    return stats.mtime.toISOString();
  } catch {
    // Ultimate fallback to current date
    return new Date().toISOString();
  }
}
