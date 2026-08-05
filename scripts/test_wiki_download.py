#!/usr/bin/env python3
"""
Test downloading a single item image from the Day R wiki.
Pattern: https://dayr.wiki.gg/wiki/{PascalCase_Name}#/media/File:{PascalCase_Name}.png
The # is a fragment - actual page is https://dayr.wiki.gg/wiki/{PascalCase_Name}
We need to parse the page HTML to find the actual image URL.
"""

import urllib.request
import re
import ssl

# Test with canned_water -> Canned_Water
item_id = "canned_water"
wiki_name = item_id.replace("_", " ").title().replace(" ", "_")  # Canned_Water
wiki_url = f"https://dayr.wiki.gg/wiki/{wiki_name}"

print(f"Item ID: {item_id}")
print(f"Wiki name: {wiki_name}")
print(f"Wiki URL: {wiki_url}")

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request(wiki_url, headers={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
})

try:
    response = urllib.request.urlopen(req, context=ctx, timeout=15)
    html = response.read().decode('utf-8', errors='replace')
    print(f"Page loaded: {len(html)} bytes")
    
    # Look for image file references
    # Pattern 1: File:{Name}.png in the page
    file_refs = re.findall(r'File:([A-Za-z0-9_\.\-]+\.png)', html, re.IGNORECASE)
    print(f"File references found: {file_refs[:10]}")
    
    # Pattern 2: img src with actual URLs
    img_urls = re.findall(r'<img[^>]+src="([^"]+)"', html)
    print(f"Img src URLs ({len(img_urls)} total):")
    for url in img_urls[:15]:
        print(f"  {url}")
    
    # Pattern 3: Look for the main item image (usually in infobox)
    # Day R wiki typically uses an infobox with the item image
    # The actual file URL is usually at /wiki/Special:FilePath/{filename}
    filepath_refs = re.findall(r'href="(/wiki/Special:FilePath/[^"]+)"', html)
    print(f"\nSpecial:FilePath refs: {filepath_refs[:10]}")
    
    # Pattern 4: Direct image URLs in data-src or srcset
    data_srcs = re.findall(r'data-src="([^"]+)"', html)
    print(f"\nData-src URLs ({len(data_srcs)} total):")
    for url in data_srcs[:10]:
        print(f"  {url}")
        
except Exception as e:
    print(f"Error: {e}")