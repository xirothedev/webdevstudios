#!/bin/bash

# Script to generate favicon and app icons from SVG
# Requires ImageMagick (convert command)

SVG_SOURCE="/home/xiro/workspace/savi-ecommerce-fullstack-turborepo/apps/web/public/image/wds-logo.svg"
APP_DIR="/home/xiro/workspace/savi-ecommerce-fullstack-turborepo/apps/web/src/app"
PUBLIC_DIR="/home/xiro/workspace/savi-ecommerce-fullstack-turborepo/apps/web/public"

echo "Generating favicon and app icons from $SVG_SOURCE"

# Create directories if they don't exist
mkdir -p "$APP_DIR"
mkdir -p "$PUBLIC_DIR/icons"

# Generate favicon.ico (multi-size ICO file)
echo "Generating favicon.ico..."
convert "$SVG_SOURCE" -resize 16x16 "$APP_DIR/favicon-16.png"
convert "$SVG_SOURCE" -resize 32x32 "$APP_DIR/favicon-32.png"
convert "$SVG_SOURCE" -resize 48x48 "$APP_DIR/favicon-48.png"
convert "$APP_DIR/favicon-16.png" "$APP_DIR/favicon-32.png" "$APP_DIR/favicon-48.png" "$APP_DIR/favicon.ico"
rm "$APP_DIR/favicon-16.png" "$APP_DIR/favicon-32.png" "$APP_DIR/favicon-48.png"

# Generate icon.png (various sizes for Next.js)
echo "Generating icon.png files..."
convert "$SVG_SOURCE" -resize 16x16 "$APP_DIR/icon-16.png"
convert "$SVG_SOURCE" -resize 32x32 "$APP_DIR/icon-32.png"
convert "$SVG_SOURCE" -resize 96x96 "$APP_DIR/icon-96.png"
convert "$SVG_SOURCE" -resize 192x192 "$APP_DIR/icon-192.png"
convert "$SVG_SOURCE" -resize 512x512 "$APP_DIR/icon-512.png"

# Generate apple-icon.png (180x180 for iOS)
echo "Generating apple-icon.png..."
convert "$SVG_SOURCE" -resize 180x180 "$APP_DIR/apple-icon.png"
convert "$SVG_SOURCE" -resize 180x180 "$PUBLIC_DIR/icons/apple-icon.png"

# Generate Android Chrome icons
echo "Generating Android Chrome icons..."
convert "$SVG_SOURCE" -resize 192x192 "$PUBLIC_DIR/icons/android-chrome-192x192.png"
convert "$SVG_SOURCE" -resize 512x512 "$PUBLIC_DIR/icons/android-chrome-512x512.png"

# Generate favicon.png (32x32 for general use)
echo "Generating favicon.png..."
convert "$SVG_SOURCE" -resize 32x32 "$PUBLIC_DIR/favicon-32x32.png"

# Generate site.webmanifest compatible icons
echo "Generating manifest icons..."
convert "$SVG_SOURCE" -resize 192x192 "$PUBLIC_DIR/icons/icon-192x192.png"
convert "$SVG_SOURCE" -resize 512x512 "$PUBLIC_DIR/icons/icon-512x512.png"

echo "Icon generation complete!"
echo "Files created:"
echo "  - $APP_DIR/favicon.ico"
echo "  - $APP_DIR/icon-*.png"
echo "  - $APP_DIR/apple-icon.png"
echo "  - $PUBLIC_DIR/icons/android-chrome-*.png"
echo "  - $PUBLIC_DIR/favicon-32x32.png"

