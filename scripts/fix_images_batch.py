#!/usr/bin/env python3
"""Batch 1: Fix first 33 items."""
import urllib.request, urllib.parse, json, ssl, time, struct, hashlib, sys
from pathlib import Path

ITEMS_DIR = Path("/home/z/my-project/public/items")
UA = 'DayRWikiBot/1.0'

def api_request(params):
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    query = '&'.join(f'{k}={urllib.parse.quote(str(v))}' for k, v in params.items())
    url = f'https://dayr.wiki.gg/api.php?{query}'
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    try:
        resp = urllib.request.urlopen(req, context=ctx, timeout=15)
        return json.loads(resp.read())
    except:
        return {'error': 'timeout'}

def get_page_image(title):
    result = api_request({
        'action': 'query', 'titles': title,
        'prop': 'pageimages', 'format': 'json', 'pithumbsize': 300
    })
    pages = result.get('query', {}).get('pages', {})
    for pid, pd in pages.items():
        if 'missing' in pd:
            continue
        th = pd.get('thumbnail', {})
        if th and 'source' in th:
            return th['source'], pd.get('pageimage', '')
    return None, None

def search_and_get_image(query):
    result = api_request({
        'action': 'query', 'list': 'search',
        'srsearch': query, 'format': 'json', 'srlimit': 3
    })
    for r in result.get('query', {}).get('search', []):
        url, fn = get_page_image(r['title'])
        if url:
            return url, fn, r['title']
    return None, None, None

def download_image(url, dest):
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    try:
        resp = urllib.request.urlopen(req, context=ctx, timeout=20)
        data = resp.read()
        if not data[:8] == b'\x89PNG\r\n\x1a\n':
            return False
        with open(dest, 'wb') as f:
            f.write(data)
        return True
    except:
        return False

def id_to_variations(item_id):
    parts = item_id.split('_')
    vars = []
    # PascalCase_
    vars.append('_'.join(p.capitalize() for p in parts))
    # Sentence case with space
    if len(parts) > 1:
        vars.append(parts[0].capitalize() + ' ' + ' '.join(p.lower() for p in parts[1:]))
    # Title case with space
    vars.append(' '.join(p.capitalize() for p in parts))
    return vars

def fix_item(item_id):
    dest = ITEMS_DIR / f'{item_id}.png'
    for title in id_to_variations(item_id):
        url, fn = get_page_image(title)
        if url:
            if download_image(url, dest):
                return True, title, fn
            time.sleep(0.3)
    # Search fallback
    url, fn, st = search_and_get_image(item_id.replace('_', ' '))
    if url:
        if download_image(url, dest):
            return True, st, fn
    return False, None, None

# Items to fix (batch 1: first 33)
BATCH = [
    '7_62x25mm_tt_shell', 'antelope', 'antibiotics', 'apple_seeds',
    'armor_plate', 'army_bulletproof_vest', 'blank', 'blank_cartridge',
    'boiled_condensed_milk', 'broadleaf_plantain', 'cabbage_roll', 'cake',
    'caviar_sandwich', 'chanterelle', 'chemistry_set', 'coulibiac',
    'cuban_cigar', 'cypress_smg', 'degtyar', 'double_barrel',
    'dried_meat', 'dust_mask', 'electric_motor', 'field_uniform',
    'fire_brick', 'first_aid_kit', 'flashlight_10', 'flashlight_20',
    'flashlight_30', 'flying_spaghetti_monster', 'forged_knife',
    'fried_snake', 'grilled_meat'
]

ok = 0
fail = 0
failed = []
for i, item_id in enumerate(BATCH):
    print(f'[{i+1}/{len(BATCH)}] {item_id}... ', end='', flush=True)
    success, title, fn = fix_item(item_id)
    if success:
        print(f'OK ({title} -> {fn})')
        ok += 1
    else:
        print('FAILED')
        fail += 1
        failed.append(item_id)
    time.sleep(0.8)

print(f'\nDone: {ok} OK, {fail} FAILED')
if failed:
    print(f'Failed: {failed}')
