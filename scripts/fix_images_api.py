#!/usr/bin/env python3
"""
Fix item images by using the Day R wiki MediaWiki API.
For each item:
1. Try multiple title variations via the API
2. Get the page's main image via pageimages prop
3. Download the correct image
"""

import urllib.request
import json
import ssl
import os
import sys
import time
import struct
import hashlib
from pathlib import Path
from collections import Counter

ITEMS_DIR = Path("/home/z/my-project/public/items")
PRICES_PATH = Path("/home/z/my-project/src/data/prices.json")
UA = 'DayRWikiBot/1.0 (https://github.com/dayr-wiki-tool; info@dayr-tool.example)'

def api_request(params):
    """Make a MediaWiki API request."""
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    query = '&'.join(f'{k}={urllib.parse.quote(str(v))}' for k, v in params.items())
    url = f'https://dayr.wiki.gg/api.php?{query}'
    
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    try:
        resp = urllib.request.urlopen(req, context=ctx, timeout=15)
        return json.loads(resp.read())
    except Exception as e:
        return {'error': str(e)}

def get_page_image(title):
    """
    Get the main image for a wiki page.
    Returns (image_url, pageimage_filename) or (None, None)
    """
    import urllib.parse
    result = api_request({
        'action': 'query',
        'titles': title,
        'prop': 'pageimages',
        'format': 'json',
        'pithumbsize': 300
    })
    
    if 'error' in result:
        return None, None
    
    pages = result.get('query', {}).get('pages', {})
    for page_id, page_data in pages.items():
        if 'missing' in page_data:
            continue
        thumbnail = page_data.get('thumbnail', {})
        if thumbnail and 'source' in thumbnail:
            return thumbnail['source'], page_data.get('pageimage', '')
    return None, None

def search_wiki(query):
    """Search the wiki for a page title."""
    result = api_request({
        'action': 'query',
        'list': 'search',
        'srsearch': query,
        'format': 'json',
        'srlimit': 5
    })
    
    if 'error' in result:
        return []
    
    return [r['title'] for r in result.get('query', {}).get('search', [])]

def id_to_title_variations(item_id):
    """Generate possible wiki title variations from an item ID."""
    parts = item_id.split('_')
    variations = []
    
    # PascalCase with underscores: Canned_Water
    pascal = '_'.join(p.capitalize() for p in parts)
    variations.append(pascal)
    
    # Sentence case with space: Canned water
    if len(parts) > 1:
        sentence_space = parts[0].capitalize() + ' ' + ' '.join(p.lower() for p in parts[1:])
        variations.append(sentence_space)
    
    # Sentence case with underscores: Canned_water
    if len(parts) > 1:
        sentence_us = parts[0].capitalize() + '_' + '_'.join(p.lower() for p in parts[1:])
        variations.append(sentence_us)
    
    # Title case with space: Canned Water
    title_space = ' '.join(p.capitalize() for p in parts)
    variations.append(title_space)
    
    # Try with singular last word
    if len(parts) > 1:
        singular_parts = parts[:-1] + [parts[-1].rstrip('s')]
        pascal_sg = '_'.join(p.capitalize() for p in singular_parts)
        variations.append(pascal_sg)
        sentence_sg = singular_parts[0].capitalize() + ' ' + ' '.join(p.lower() for p in singular_parts[1:])
        variations.append(sentence_sg)
    
    # Try removing numbers prefix (e.g., 7_62x25mm_tt_shell)
    # Just add original as-is
    variations.append(item_id)
    
    return variations

def download_image(url, dest_path):
    """Download an image from URL to dest_path. Returns True on success."""
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    try:
        resp = urllib.request.urlopen(req, context=ctx, timeout=20)
        data = resp.read()
        
        # Verify it's a PNG
        if not data[:8] == b'\x89PNG\r\n\x1a\n':
            return False
        
        with open(dest_path, 'wb') as f:
            f.write(data)
        return True
    except:
        return False

def get_current_hash(filepath):
    """Get MD5 hash of a file."""
    h = hashlib.md5()
    with open(filepath, 'rb') as f:
        for chunk in iter(lambda: f.read(8192), b''):
            h.update(chunk)
    return h.hexdigest()

def find_duplicate_groups():
    """Find groups of items with identical images."""
    hash_map = {}
    for f in ITEMS_DIR.glob('*.png'):
        h = get_current_hash(f)
        if h not in hash_map:
            hash_map[h] = []
        hash_map[h].append(f.stem)
    
    groups = []
    for h, names in hash_map.items():
        if len(names) > 1:
            groups.append(names)
    return groups

def get_missing_images():
    """Find items in prices.json that don't have image files."""
    with open(PRICES_PATH) as f:
        data = json.load(f)
    
    all_ids = set()
    for cat in data.get('categories', []):
        for item in cat.get('items', []):
            all_ids.add(item['id'])
    
    missing = []
    for item_id in sorted(all_ids):
        if not (ITEMS_DIR / f'{item_id}.png').exists():
            missing.append(item_id)
    return missing

def fix_item(item_id, force=False):
    """
    Try to download the correct image for an item.
    Returns (success, wiki_title, image_url)
    """
    dest = ITEMS_DIR / f'{item_id}.png'
    
    # Generate title variations and try each
    variations = id_to_title_variations(item_id)
    
    for title in variations:
        img_url, pageimage = get_page_image(title)
        if img_url:
            if download_image(img_url, dest):
                return True, title, pageimage
            time.sleep(0.5)
    
    # If all variations failed, try search
    search_query = item_id.replace('_', ' ')
    search_results = search_wiki(search_query)
    
    for result_title in search_results[:3]:
        img_url, pageimage = get_page_image(result_title)
        if img_url:
            if download_image(img_url, dest):
                return True, result_title, pageimage
            time.sleep(0.5)
    
    return False, None, None

def main():
    import urllib.parse
    
    # Collect all items that need fixing
    duplicate_groups = find_duplicate_groups()
    missing = get_missing_images()
    
    # Build list of items to fix (all from duplicate groups + missing)
    items_to_fix = set(missing)
    for group in duplicate_groups:
        for item_id in group:
            items_to_fix.add(item_id)
    
    items_to_fix = sorted(items_to_fix)
    print(f'Total items to fix: {len(items_to_fix)}')
    print(f'  From duplicate groups: {sum(len(g) for g in duplicate_groups)}')
    print(f'  Missing images: {len(missing)}')
    print()
    
    # Process items
    success_count = 0
    fail_count = 0
    failed_items = []
    
    for i, item_id in enumerate(items_to_fix):
        print(f'[{i+1}/{len(items_to_fix)}] {item_id}... ', end='', flush=True)
        
        success, wiki_title, pageimage = fix_item(item_id)
        
        if success:
            print(f'OK (wiki: {wiki_title}, file: {pageimage})')
            success_count += 1
        else:
            print(f'FAILED')
            fail_count += 1
            failed_items.append(item_id)
        
        # Rate limiting - be gentle with the wiki
        time.sleep(1.0)
    
    print(f'\n=== RESULTS ===')
    print(f'Success: {success_count}')
    print(f'Failed: {fail_count}')
    if failed_items:
        print(f'\nFailed items: {failed_items}')

if __name__ == '__main__':
    main()
