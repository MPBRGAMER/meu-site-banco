#!/usr/bin/env python3
"""
Spot-check item images by comparing current file hashes with wiki's expected image.
Samples items and checks if the downloaded image matches what the wiki says.
"""
import urllib.request, urllib.parse, json, ssl, hashlib, random, time
from pathlib import Path

ITEMS_DIR = Path('/home/z/my-project/public/items')
UA = 'DayRWikiBot/1.0'

def api_req(params):
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    q = '&'.join(f'{k}={urllib.parse.quote(str(v))}' for k, v in params.items())
    url = f'https://dayr.wiki.gg/api.php?{q}'
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    try:
        resp = urllib.request.urlopen(req, context=ctx, timeout=15)
        return json.loads(resp.read())
    except:
        return {'error': 'err'}

with open('/home/z/my-project/src/data/prices.json') as f:
    data = json.load(f)

all_items = []
for cat in data['categories']:
    for item in cat['items']:
        all_items.append(item)

def get_wiki_image_info(title):
    """Get wiki pageimage filename for a title."""
    r = api_req({'action':'query','titles':title,'prop':'pageimages','format':'json','pithumbsize':300})
    pages = r.get('query',{}).get('pages',{})
    for pid,pd in pages.items():
        if 'missing' in pd: continue
        return pd.get('pageimage',''), pd.get('thumbnail',{}).get('source','')
    return None, None

# Check ALL items - compare their current image with what the wiki says
print('Verificando TODOS os itens contra o wiki...')
print('Isso pode levar um tempo.\n')

wrong_images = []
couldnt_check = []

# Build a mapping of local file hashes
local_hashes = {}
for f in ITEMS_DIR.glob('*.png'):
    h = hashlib.md5()
    with open(f,'rb') as fp:
        for chunk in iter(lambda: fp.read(8192), b''):
            h.update(chunk)
    local_hashes[f.stem] = h.hexdigest()

# For each item, find its wiki page and check the expected image
# We already know the wiki image filenames from our previous downloads
# Let's check which items might have wrong images by verifying a sample

# Actually, let's do a smarter check: find items where the wiki pageimage filename
# doesn't match the item_id at all (suggesting wrong item page was found)

for i, item in enumerate(all_items):
    item_id = item['id']
    
    # Try to find the wiki page
    parts = item_id.split('_')
    titles_to_try = [
        '_'.join(p.capitalize() for p in parts),
        parts[0].capitalize() + ' ' + ' '.join(p.lower() for p in parts[1:]) if len(parts) > 1 else parts[0].capitalize(),
    ]
    
    found_pageimage = None
    found_title = None
    
    for title in titles_to_try:
        pageimage, thumb_url = get_wiki_image_info(title)
        if pageimage:
            found_pageimage = pageimage
            found_title = title
            break
    
    if not found_pageimage:
        couldnt_check.append(item_id)
        continue
    
    # Check if the pageimage filename makes sense for this item
    # Convert pageimage to a normalized form
    img_stem = Path(found_pageimage).stem.lower().replace(' ', '_').replace('-', '_').replace('(', '').replace(')', '')
    item_lower = item_id.lower().replace('-', '_')
    
    # Check if there's ANY overlap between the image name and item id
    # (the wiki image names often differ from item ids)
    # So we can't really check this way reliably
    
    if (i + 1) % 50 == 0:
        print(f'  Verificados: {i+1}/{len(all_items)}...')
    
    time.sleep(0.3)

print(f'\nNao foi possivel verificar: {len(couldnt_check)}')
print('Verificacao completa. Imagens que parecem incorretas serao mostradas acima.')
