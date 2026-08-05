#!/usr/bin/env python3
"""
Analyze all item images to find potential issues:
1. Missing images (in prices.json but no file)
2. Duplicate images (same content = wrong item)
3. Unusual dimensions (not square or too large)
"""

import os
import struct
import hashlib
from pathlib import Path
from collections import Counter

ITEMS_DIR = Path("/home/z/my-project/public/items")
PRICES_PATH = Path("/home/z/my-project/src/data/prices.json")

def get_png_dimensions(filepath):
    try:
        with open(filepath, 'rb') as f:
            f.read(8)  # Skip PNG signature
            length = struct.unpack('>I', f.read(4))[0]
            chunk_type = f.read(4)
            if chunk_type != b'IHDR':
                return None, None
            width = struct.unpack('>I', f.read(4))[0]
            height = struct.unpack('>I', f.read(4))[0]
            return width, height
    except:
        return None, None

def get_file_hash(filepath):
    h = hashlib.md5()
    with open(filepath, 'rb') as f:
        for chunk in iter(lambda: f.read(8192), b''):
            h.update(chunk)
    return h.hexdigest()

def main():
    import json
    with open(PRICES_PATH) as f:
        data = json.load(f)
    
    # Get all item IDs
    all_item_ids = set()
    for cat in data.get('categories', []):
        for item in cat.get('items', []):
            all_item_ids.add(item['id'])
    
    # Analyze all PNG files
    png_files = sorted(ITEMS_DIR.glob("*.png"))
    
    # Hash map to find duplicates
    hash_map = {}  # hash -> [filenames]
    # Dimension stats
    dim_stats = Counter()
    unusual_dims = []
    # Non-square images
    non_square = []
    
    for f in png_files:
        h = get_file_hash(f)
        if h not in hash_map:
            hash_map[h] = []
        hash_map[h].append(f.stem)
        
        w, height = get_png_dimensions(f)
        if w and height:
            dim_key = f"{w}x{height}"
            dim_stats[dim_key] += 1
            
            # Check non-square (allow 1px difference)
            if abs(w - height) > 1:
                non_square.append((f.stem, w, height, f.stat().st_size))
            
            # Check unusually large
            if w > 128 or height > 128:
                unusual_dims.append((f.stem, w, height, f.stat().st_size))
    
    # Report duplicates
    print("=== DUPLICATE IMAGES (same file content) ===")
    dup_count = 0
    for h, names in sorted(hash_map.items(), key=lambda x: -len(x[1])):
        if len(names) > 1:
            dup_count += 1
            print(f"  Hash {h[:12]}... ({len(names)} files): {', '.join(names)}")
    print(f"  Total duplicate groups: {dup_count}")
    
    # Report non-square
    print(f"\n=== NON-SQUARE IMAGES ({len(non_square)}) ===")
    for name, w, h, size in non_square:
        print(f"  {name}.png ({w}x{h}, {size} bytes)")
    
    # Report unusual dims
    print(f"\n=== UNUSUALLY LARGE DIMENSIONS > 128px ({len(unusual_dims)}) ===")
    for name, w, h, size in unusual_dims:
        print(f"  {name}.png ({w}x{h}, {size} bytes)")
    
    # Dimension distribution
    print(f"\n=== DIMENSION DISTRIBUTION (top 10) ===")
    for dim, count in dim_stats.most_common(10):
        print(f"  {dim}: {count} images")
    
    # Missing images
    missing = []
    for item_id in sorted(all_item_ids):
        if not (ITEMS_DIR / f"{item_id}.png").exists():
            missing.append(item_id)
    
    if missing:
        print(f"\n=== MISSING IMAGES ({len(missing)}) ===")
        for name in missing:
            print(f"  {name}.png")
    
    # Orphan images (in dir but not in prices.json)
    orphan = []
    for f in png_files:
        if f.stem not in all_item_ids:
            orphan.append(f.stem)
    if orphan:
        print(f"\n=== ORPHAN IMAGES (not in prices.json) ({len(orphan)}) ===")
        for name in orphan:
            print(f"  {name}.png")
    
    # Total summary
    print(f"\n=== SUMMARY ===")
    print(f"  Items in prices.json: {len(all_item_ids)}")
    print(f"  Image files: {len(png_files)}")
    print(f"  Missing: {len(missing)}")
    print(f"  Orphans: {len(orphan)}")
    print(f"  Duplicate groups: {dup_count}")
    print(f"  Non-square: {len(non_square)}")
    print(f"  Unusually large: {len(unusual_dims)}")

if __name__ == "__main__":
    main()