#!/usr/bin/env python3
"""
Find potentially incorrect/invalid item images.
Checks: valid PNG header, file size, dimensions, corrupted files.
"""

import os
import struct
from pathlib import Path

ITEMS_DIR = Path("/home/z/my-project/public/items")

# PNG header bytes
PNG_HEADER = b'\x89PNG\r\n\x1a\n'

def is_valid_png(filepath):
    """Check if file has valid PNG header."""
    try:
        with open(filepath, 'rb') as f:
            header = f.read(8)
        return header == PNG_HEADER
    except:
        return False

def get_png_dimensions(filepath):
    """Extract PNG dimensions from IHDR chunk."""
    try:
        with open(filepath, 'rb') as f:
            # Skip PNG signature (8 bytes)
            f.read(8)
            # Read chunk length (4 bytes)
            length = struct.unpack('>I', f.read(4))[0]
            # Read chunk type (4 bytes)
            chunk_type = f.read(4)
            if chunk_type != b'IHDR':
                return None, None
            # Read width and height
            width = struct.unpack('>I', f.read(4))[0]
            height = struct.unpack('>I', f.read(4))[0]
            return width, height
    except:
        return None, None

def main():
    results = []
    
    png_files = sorted(ITEMS_DIR.glob("*.png"))
    print(f"Total PNG files: {len(png_files)}")
    print()
    
    # Categories
    not_png = []
    too_small = []  # < 500 bytes
    tiny_dims = []  # very small images like 1x1
    
    for f in png_files:
        size = f.stat().st_size
        name = f.stem
        
        # Check 1: Valid PNG header
        if not is_valid_png(f):
            not_png.append((name, size))
            continue
        
        # Check 2: File size too small (likely placeholder or error page)
        if size < 500:
            too_small.append((name, size))
            continue
        
        # Check 3: Get dimensions
        w, h = get_png_dimensions(f)
        if w is None:
            not_png.append((name, size))  # Can't read dimensions
            continue
        
        # Check 4: Suspiciously small dimensions (likely icons or error images)
        if w <= 2 or h <= 2:
            tiny_dims.append((name, size, w, h))
            continue
        
        # Check 5: Suspiciously large (could be HTML error pages saved as png)
        if size > 500000:  # > 500KB is suspicious for small item icons
            results.append((name, size, w, h, "SUSPICIOUSLY_LARGE"))
    
    print(f"=== NOT VALID PNG ({len(not_png)}) ===")
    for name, size in not_png:
        print(f"  {name}.png ({size} bytes)")
    
    print(f"\n=== TOO SMALL < 500 bytes ({len(too_small)}) ===")
    for name, size in too_small:
        print(f"  {name}.png ({size} bytes)")
    
    print(f"\n=== TINY DIMENSIONS <= 2px ({len(tiny_dims)}) ===")
    for name, size, w, h in tiny_dims:
        print(f"  {name}.png ({size} bytes, {w}x{h})")
    
    print(f"\n=== SUSPICIOUSLY LARGE > 500KB ({len(results)}) ===")
    for name, size, w, h, reason in results:
        print(f"  {name}.png ({size} bytes, {w}x{h}) - {reason}")
    
    total_bad = len(not_png) + len(too_small) + len(tiny_dims) + len(results)
    print(f"\n=== TOTAL PROBLEMATIC: {total_bad} ===")
    
    # Also check for items in prices.json that don't have images
    import json
    prices_path = Path("/home/z/my-project/src/data/prices.json")
    if prices_path.exists():
        with open(prices_path) as f:
            data = json.load(f)
        
        missing_images = []
        for cat in data.get('categories', []):
            for item in cat.get('items', []):
                img_path = ITEMS_DIR / f"{item['id']}.png"
                if not img_path.exists():
                    missing_images.append(item['id'])
        
        if missing_images:
            print(f"\n=== MISSING IMAGES (in prices.json but no file) ({len(missing_images)}) ===")
            for name in missing_images:
                print(f"  {name}.png")

if __name__ == "__main__":
    main()
