# Favicon and App Icons

## Overview

The project has been configured to use WDS logo (`wds-logo.png`) as favicon and icons for Android, iOS and other platforms.

## File Structure

### Favicon Files

Script `generate-icons.py` creates the following files in `public/` directory:

- `public/favicon.ico` - Main favicon (multi-size ICO: 16x16, 32x32, 48x48)
- `public/favicon-16x16.png` - Favicon PNG 16x16
- `public/favicon-32x32.png` - Favicon PNG 32x32
- `public/icon-192x192.png` - Icon 192x192 for Android Chrome and manifest
- `public/icon-512x512.png` - Icon 512x512 for Android Chrome and manifest
- `public/apple-touch-icon.png` - Apple touch icon (180x180)

### Manifest File

- `public/site.webmanifest` - Web app manifest for PWA

## Configuration

### Layout Metadata

File `src/app/layout.tsx` has been configured with complete metadata for:

- Favicon (multiple sizes)
- Apple touch icons
- Android Chrome icons
- Web manifest

### Next.js App Directory

Next.js 16 automatically recognizes favicon files in `public/` directory:

- `favicon.ico` - Automatically used
- `apple-touch-icon.png` - Used for iOS devices
- Other icon files are referenced in metadata

## Script Generation

Script `scripts/generate-icons.py` is used to generate all icons from PNG logo file.

### Using the script:

```bash
cd apps/web
python3 scripts/generate-icons.py
```

### Requirements:

- Python 3
- PIL/Pillow library (`pip install Pillow`)
- Logo PNG file: `public/wds-logo.png`

## Updating Icons

To update icons:

1. Replace file `public/wds-logo.png` with new logo (PNG format)
2. Run script: `python3 scripts/generate-icons.py`
3. All icons will be automatically regenerated in `public/` directory

## Browser Support

- **Chrome/Edge**: Uses favicon.ico and PNG icons
- **Firefox**: Uses favicon.ico
- **Safari (iOS)**: Uses apple-touch-icon.png
- **Android Chrome**: Uses icon-192x192.png and icon-512x512.png in manifest

## Notes

- All icons are generated from the same source PNG file to ensure consistency
- Icons are optimized for file size
- Web manifest supports PWA functionality
- Metadata in `layout.tsx` and `site.webmanifest` has been configured to use the correct icon files
