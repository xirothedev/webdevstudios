#!/usr/bin/env node
/**
 * Script to convert all PNG images in public directory to WebP format
 *
 * Usage:
 *   pnpm tsx scripts/convert-png-to-webp.ts
 *   pnpm tsx scripts/convert-png-to-webp.ts --delete-original
 *   pnpm tsx scripts/convert-png-to-webp.ts --quality 90
 */

import { readdir, stat, unlink } from 'fs/promises';
import { basename, join } from 'path';
import sharp from 'sharp';

interface ConvertOptions {
  deleteOriginal: boolean;
  quality: number;
  skipFiles: string[];
}

const DEFAULT_OPTIONS: ConvertOptions = {
  deleteOriginal: false,
  quality: 85,
  skipFiles: [
    // Favicons và icons đặc biệt nên giữ PNG
    'favicon.ico',
    'favicon-16x16.png',
    'favicon-32x32.png',
    'apple-touch-icon.png',
    'icon-192x192.png',
    'icon-512x512.png',
  ],
};

async function getAllPngFiles(
  dir: string,
  fileList: string[] = []
): Promise<string[]> {
  const files = await readdir(dir);

  for (const file of files) {
    const filePath = join(dir, file);
    const fileStat = await stat(filePath);

    if (fileStat.isDirectory()) {
      await getAllPngFiles(filePath, fileList);
    } else if (file.endsWith('.png')) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

async function convertPngToWebp(
  pngPath: string,
  options: ConvertOptions
): Promise<void> {
  const fileName = basename(pngPath);

  // Skip files in skip list
  if (options.skipFiles.includes(fileName)) {
    console.log(`⏭️  Skipping ${pngPath} (in skip list)`);
    return;
  }

  const webpPath = pngPath.replace(/\.png$/i, '.webp');

  try {
    // Get original file size
    const originalStats = await stat(pngPath);
    const originalSize = originalStats.size;

    // Convert to WebP
    await sharp(pngPath).webp({ quality: options.quality }).toFile(webpPath);

    // Get converted file size
    const webpStats = await stat(webpPath);
    const webpSize = webpStats.size;
    const savedBytes = originalSize - webpSize;
    const savedPercent = ((savedBytes / originalSize) * 100).toFixed(1);

    console.log(
      `✅ Converted: ${pngPath}\n   → ${webpPath}\n   📊 ${formatBytes(originalSize)} → ${formatBytes(webpSize)} (saved ${savedPercent}%)`
    );

    // Delete original if option is set
    if (options.deleteOriginal) {
      await unlink(pngPath);
      console.log(`   🗑️  Deleted original: ${pngPath}`);
    }
  } catch (error) {
    console.error(`❌ Error converting ${pngPath}:`, error);
    throw error;
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

async function main() {
  const args = process.argv.slice(2);
  const options: ConvertOptions = {
    ...DEFAULT_OPTIONS,
    deleteOriginal: args.includes('--delete-original'),
  };

  // Parse quality option
  const qualityIndex = args.indexOf('--quality');
  if (qualityIndex !== -1 && args[qualityIndex + 1]) {
    const quality = parseInt(args[qualityIndex + 1], 10);
    if (!isNaN(quality) && quality > 0 && quality <= 100) {
      options.quality = quality;
    }
  }

  const publicDir = join(process.cwd(), 'public');
  console.log(`🔍 Scanning for PNG files in: ${publicDir}\n`);

  const pngFiles = await getAllPngFiles(publicDir);
  console.log(`📦 Found ${pngFiles.length} PNG file(s)\n`);

  if (pngFiles.length === 0) {
    console.log('✨ No PNG files found. Nothing to convert!');
    return;
  }

  console.log('🚀 Starting conversion...\n');
  console.log(`Options:`);
  console.log(`  - Quality: ${options.quality}`);
  console.log(`  - Delete original: ${options.deleteOriginal ? 'Yes' : 'No'}`);
  console.log(`  - Skip files: ${options.skipFiles.join(', ')}\n`);

  let successCount = 0;
  let errorCount = 0;
  let totalOriginalSize = 0;
  let totalWebpSize = 0;

  for (const pngFile of pngFiles) {
    try {
      const originalStats = await stat(pngFile);
      totalOriginalSize += originalStats.size;

      await convertPngToWebp(pngFile, options);

      const webpPath = pngFile.replace(/\.png$/i, '.webp');
      const webpStats = await stat(webpPath);
      totalWebpSize += webpStats.size;

      successCount++;
    } catch (error) {
      errorCount++;
      console.error(`Failed to convert ${pngFile}:`, error);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Conversion Summary:');
  console.log(`  ✅ Success: ${successCount}`);
  console.log(`  ❌ Errors: ${errorCount}`);
  console.log(`  📦 Total original size: ${formatBytes(totalOriginalSize)}`);
  console.log(`  📦 Total WebP size: ${formatBytes(totalWebpSize)}`);
  const totalSaved = totalOriginalSize - totalWebpSize;
  const totalSavedPercent =
    totalOriginalSize > 0
      ? ((totalSaved / totalOriginalSize) * 100).toFixed(1)
      : '0';
  console.log(
    `  💾 Total saved: ${formatBytes(totalSaved)} (${totalSavedPercent}%)`
  );
  console.log('='.repeat(60));
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
