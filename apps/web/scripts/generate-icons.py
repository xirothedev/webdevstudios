#!/usr/bin/env python3
"""
Generate favicon.ico and touch icons from logo.png
Creates multiple sizes for SEO and mobile support
"""

from PIL import Image
import os
import sys

def create_ico(input_path, output_path, sizes=[16, 32, 48]):
    """Create ICO file with multiple sizes"""
    try:
        # Open the original image
        img = Image.open(input_path)
        
        # Convert RGBA to RGB if needed (ICO doesn't support transparency well)
        if img.mode == 'RGBA':
            # Create white background
            rgb_img = Image.new('RGB', img.size, (255, 255, 255))
            rgb_img.paste(img, mask=img.split()[3])  # Use alpha channel as mask
            img = rgb_img
        
        # Create ICO with multiple sizes
        icons = []
        for size in sizes:
            resized = img.resize((size, size), Image.Resampling.LANCZOS)
            icons.append(resized)
        
        # Save as ICO
        icons[0].save(output_path, format='ICO', sizes=[(s, s) for s in sizes])
        print(f"✓ Created {output_path} with sizes: {sizes}")
        return True
    except Exception as e:
        print(f"✗ Error creating ICO: {e}")
        return False

def create_png_icon(input_path, output_path, size):
    """Create PNG icon at specific size"""
    try:
        img = Image.open(input_path)
        
        # Resize maintaining aspect ratio, then crop to square
        img.thumbnail((size, size), Image.Resampling.LANCZOS)
        
        # Create square canvas
        square_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        
        # Center the image
        x_offset = (size - img.size[0]) // 2
        y_offset = (size - img.size[1]) // 2
        square_img.paste(img, (x_offset, y_offset), img if img.mode == 'RGBA' else None)
        
        square_img.save(output_path, format='PNG', optimize=True)
        print(f"✓ Created {output_path} ({size}x{size})")
        return True
    except Exception as e:
        print(f"✗ Error creating {output_path}: {e}")
        return False

def main():
    # Paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    web_dir = os.path.dirname(script_dir)
    public_dir = os.path.join(web_dir, 'public')
    logo_path = os.path.join(public_dir, 'wds-logo.png')
    
    if not os.path.exists(logo_path):
        print(f"✗ Logo not found at {logo_path}")
        sys.exit(1)
    
    print(f"Generating icons from {logo_path}...")
    print()
    
    # Create favicon.ico
    ico_path = os.path.join(public_dir, 'favicon.ico')
    create_ico(logo_path, ico_path, sizes=[16, 32, 48])
    
    # Create touch icons for different devices
    touch_icons = [
        (180, 'apple-touch-icon.png'),      # Apple devices
        (192, 'icon-192x192.png'),          # Android Chrome
        (512, 'icon-512x512.png'),          # Android Chrome (large)
        (32, 'favicon-32x32.png'),          # Standard favicon
        (16, 'favicon-16x16.png'),          # Standard favicon (small)
    ]
    
    for size, filename in touch_icons:
        output_path = os.path.join(public_dir, filename)
        create_png_icon(logo_path, output_path, size)
    
    print()
    print("✓ All icons generated successfully!")
    print()
    print("Generated files:")
    print("  - favicon.ico (16x16, 32x32, 48x48)")
    print("  - apple-touch-icon.png (180x180)")
    print("  - icon-192x192.png")
    print("  - icon-512x512.png")
    print("  - favicon-32x32.png")
    print("  - favicon-16x16.png")

if __name__ == '__main__':
    main()