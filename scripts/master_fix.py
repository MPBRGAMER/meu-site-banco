#!/usr/bin/env python3
"""
Master fix script: Remove wrong items, fix categories, fix names, download correct images, add wikiLinks.
"""
import json, urllib.request, urllib.parse, ssl, time, os, shutil, hashlib
from PIL import Image
from io import BytesIO

PRICES_PATH = '/home/z/my-project/src/data/prices.json'
IMG_DIR = '/home/z/my-project/public/items'

def api_req(params):
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    q = '&'.join(f'{k}={urllib.parse.quote(str(v))}' for k, v in params.items())
    url = f'https://dayr.wiki.gg/api.php?{q}'
    req = urllib.request.Request(url, headers={'User-Agent': 'DayRWikiBot/1.0'})
    resp = urllib.request.urlopen(req, context=ctx, timeout=15)
    return json.loads(resp.read())

def dl(url, dest):
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    req = urllib.request.Request(url, headers={'User-Agent': 'DayRWikiBot/1.0'})
    resp = urllib.request.urlopen(req, context=ctx, timeout=20)
    data = resp.read()
    # Check if it's a valid image
    if data[:4] == b'\x89PNG':
        with open(dest, 'wb') as f:
            f.write(data)
        return True
    elif data[:2] == b'\xff\xd8':  # JPG
        img = Image.open(BytesIO(data))
        img.save(dest, 'PNG')
        return True
    else:
        print(f'    Not an image: {data[:20]}')
        return False

def get_img_and_url(title):
    """Get wiki image URL and page URL for a given title."""
    r = api_req({
        'action': 'query', 'titles': title,
        'prop': 'pageimages|info',
        'format': 'json', 'pithumbsize': 300,
        'inprop': 'url'
    })
    for pid, pd in r.get('query', {}).get('pages', {}).items():
        if 'missing' in pd:
            continue
        th = pd.get('thumbnail', {})
        img_url = th.get('source', '') if th else ''
        page_url = pd.get('fullurl', '')
        return img_url, page_url
    return None, None

def search_and_get(item_id, query=None):
    """Search wiki for an item and return (img_url, page_url)."""
    if not query:
        query = item_id.replace('_', ' ')
    r = api_req({'action': 'query', 'list': 'search', 'srsearch': query, 'srlimit': 3, 'format': 'json'})
    for hit in r.get('query', {}).get('search', []):
        img_url, page_url = get_img_and_url(hit['title'])
        if img_url:
            return img_url, page_url, hit['title']
    return None, None, None

SPECIAL_TITLES = {
    'flesh': 'Flesh',
    'grouse': 'Grouse',
    'smuggler_s_flask': "Smuggler's Flask",
    'smuggler_s_armor': "Smuggler's Armor",
    'gp_2000_gas_mask': 'GP-2000 Gas Mask',
    'mosin_nagant_broken': 'Mosin-Nagant rifle (broken)',
    'uaz_452_broken': 'UAZ-452 (Broken)',
    'cypress_smg': 'Cypress SMG',
    'f1_grenade': 'F-1 Grenade', 'rgd_5_grenade': 'RGD-5 Grenade',
    'm1895_nagant': 'M1895 Nagant', 'pp_91_kedr': 'PP-91 Kedr',
    'sks_rifle': 'SKS rifle', 'ak_47': 'AK-47', 'ak_74': 'AK-74',
    'rpk_74': 'RPK-74', 'saiga_12': 'Saiga-12', 'vss_vintorez': 'VSS Vintorez',
    'as_val': 'AS Val', 'gp_25': 'GP-25', 'pb_pistol': 'PB Pistol',
    'tt_pistol': 'TT Pistol', 'apb_pistol': 'APB Pistol', 'fort_12': 'Fort-12',
    'mp_443': 'MP-443', 'mp5': 'MP5', 'benelli_m3': 'Benelli M3',
    'mp_153': 'MP-153', 'mr_133': 'MR-133', 'mp_5k': 'MP5K',
    'remington_870': 'Remington 870', 'saiga_9': 'Saiga-9', 'ks_23': 'KS-23',
    'toz_34': 'TOZ-34', 'uaz_469_broken': 'UAZ-469 (Broken)',
    'akm_c': 'AKM-C', 'd_eagle': 'Desert Eagle',
    'rpg_vesuvius': 'RPG Vesuvius',
    'rpo_m_eye_of_the_storm': 'RPO-M Eye of the Storm',
    'collector': 'Collector', 'ksyukha': 'Ksyukha',
    'pkm_broken': 'PKM (broken)', 'pps_43_broken': 'PPS-43 (broken)',
    'ppsh_41_broken': 'PPSh-41 (broken)', 'rpk_74_broken': 'RPK-74 (broken)',
    'svd_broken': 'SVD (broken)', 'svt_40_broken': 'SVT-40 (broken)',
    'tt_33_broken': 'TT-33 (Broken)',
    'makarov_handgun_broken': 'Makarov handgun (broken)',
    'mosin_nagant_rifle_broken': 'Mosin-Nagant rifle (broken)',
    'nagant_revolver_broken': 'Nagant revolver (broken)',
    'sniper_s_mosin': "Sniper's Mosin",
    'hunter_s_rifle': "Hunter's Rifle",
    'jack_o_launcher': "Jack O' Launcher",
    'storm_snowball_launcher': 'Storm Snowball Launcher',
    'lmg_qilin': 'LMG Qilin', 'pk_7_62_kraken': 'PK 7.62 Kraken',
    'borchevik_flamethrower': 'Borschevik Flamethrower',
    'aqua_filter': 'Aqua Filter',
    'sewer_entrance': 'Sewer Entrance',
    'improved_sewer_entrance': 'Improved Sewer Entrance',
    'water_purifier': 'Water Purifier',
    'improved_water_purifier': 'Improved Water Purifier',
    'handmade_wooden_cart': 'Handmade Wooden Cart',
    'improved_wooden_cart': 'Improved Wooden Cart',
    'military_first_aid_kit': 'Military First Aid Kit',
    'trophy_cognac': 'Trophy Cognac',
    'stale_pryanik': 'Stale Pryanik',
    'knock_off_energy_drink': 'Knock-Off Energy Drink',
    'chinese_energy_drink': 'Chinese energy drink',
    'broadleaf_plantain': 'Broadleaf plantain',
    'homemade_rocket_launcher': 'Homemade rocket launcher',
    'cuban_cigar': 'Cuban Cigar',
    'beetle_juice': 'Beetle Juice',
    'shashlik': 'Shashlik', 'shawarma': 'Shawarma',
    'pelmeni': 'Pelmeni', 'kholodets': 'Kholodets',
    'shchi': 'Shchi', 'ukha': 'Ukha',
    'coulibiac': 'Coulibiac', 'pilaf': 'Pilaf',
    'olivier_salad': 'Olivier Salad', 'cabbage_roll': 'Cabbage Roll',
    'chanterelle': 'Chanterelle', 'cranberry': 'Cranberry',
    'strawberry': 'Strawberry', 'tangerine': 'Tangerine',
    'pumpkin': 'Pumpkin', 'apple': 'Apple',
    'peking_duck': 'Peking Duck', 'sushi': 'Sushi',
    'golden_easter_egg': 'Golden Easter Egg',
    'rainbow_easter_egg': 'Rainbow Easter Egg',
    'easter_egg': 'Easter Egg', 'easter_cake': 'Easter Cake',
    'chocolate_bunny': 'Chocolate Bunny', 'candy_cane': 'Candy Cane',
    'bunny_treat': 'Bunny Treat',
    'spooky_energy_drink': 'Spooky Energy Drink',
    'holiday_energy_drink': 'Holiday Energy Drink',
    'smuggled_energy_drink': 'Smuggled Energy Drink',
    'bio_energy_drink': 'Bio Energy Drink',
    'energy_drink': 'Energy Drink',
}

def get_wiki_title(item_id):
    if item_id in SPECIAL_TITLES:
        return SPECIAL_TITLES[item_id]
    parts = item_id.split('_')
    return '_'.join(p.capitalize() for p in parts)

def get_wiki_url(item_id, wiki_title=None):
    """Get the wiki page URL for an item."""
    if not wiki_title:
        wiki_title = get_wiki_title(item_id)
    # URL encode the title properly
    encoded = urllib.parse.quote(wiki_title.replace(' ', '_'))
    return f'https://dayr.wiki.gg/wiki/{encoded}'

# ======================= LOAD DATA =======================
with open(PRICES_PATH) as f:
    data = json.load(f)

# Build category lookup
cat_map = {}
for i, cat in enumerate(data['categories']):
    cat_map[cat['id']] = i

# ======================= 1. REMOVE ITEMS =======================
REMOVED_IDS = {'pineapple'}  # Not a real item, just a nickname for F-1 grenade

removed_count = 0
for cat in data['categories']:
    before = len(cat['items'])
    cat['items'] = [it for it in cat['items'] if it['id'] not in REMOVED_IDS]
    removed_count += before - len(cat['items'])

# Also remove orphan images
for rid in REMOVED_IDS:
    img_path = os.path.join(IMG_DIR, f'{rid}.png')
    if os.path.exists(img_path):
        os.remove(img_path)
        print(f'Removed image: {img_path}')

print(f'Removed {removed_count} items: {REMOVED_IDS}')

# ======================= 2. MOVE ITEMS BETWEEN CATEGORIES =======================
# (from_category, item_id) -> to_category
MOVES = {
    # Flesh: assault rifle (event weapon) -> weapons
    ('food', 'flesh'): 'weapons',
    # Grouse: shotgun (KS-23) -> weapons
    ('food', 'grouse'): 'weapons',
    # Saltpeter: material -> materials
    ('food', 'saltpeter'): 'materials',
    # Nettle: material (plant) -> materials
    ('food', 'nettle'): 'materials',
    # Broadleaf plantain: material (plant/health) -> materials
    ('food', 'broadleaf_plantain'): 'materials',
    # Smuggler's Armor: event item with Equipment cat on wiki -> equipment
    ('armor', 'smuggler_s_armor'): 'equipment',
    # Broken weapons: materials on wiki -> materials
    ('ammo', 'pkm_broken'): 'materials',
    ('ammo', 'pps_43_broken'): 'materials',
    ('ammo', 'ppsh_41_broken'): 'materials',
    ('ammo', 'rpk_74_broken'): 'materials',
    ('ammo', 'svd_broken'): 'materials',
    ('ammo', 'svt_40_broken'): 'materials',
    ('ammo', 'tt_33_broken'): 'materials',
}

# Fix names for moved items
NAME_FIXES = {
    'flesh': 'Flesh',  # Keep original English name - it's a gun name
    'grouse': 'Grouse',  # Keep original - it's a gun name (KS-23)
    'nettle': 'Urtiga',
    'saltpeter': 'Salitre',
    'broadleaf_plantain': 'Tanchagem',
    'smuggler_s_armor': 'Armadura do Contrabandista',
}

move_count = 0
items_to_move = []

for (from_cat_id, item_id), to_cat_id in MOVES.items():
    from_idx = cat_map.get(from_cat_id)
    to_idx = cat_map.get(to_cat_id)
    if from_idx is None or to_idx is None:
        print(f'WARNING: Category not found for move {from_cat_id}->{to_cat_id}')
        continue
    
    from_items = data['categories'][from_idx]['items']
    to_items = data['categories'][to_idx]['items']
    
    found = None
    for i, item in enumerate(from_items):
        if item['id'] == item_id:
            found = from_items.pop(i)
            break
    
    if found:
        # Fix name if needed
        if item_id in NAME_FIXES:
            found['name'] = NAME_FIXES[item_id]
        to_items.append(found)
        move_count += 1
        print(f'Moved {item_id} ({found["name"]}): {from_cat_id} -> {to_cat_id}')
    else:
        print(f'WARNING: Item {item_id} not found in {from_cat_id}')

print(f'Moved {move_count} items between categories')

# ======================= 3. FIX NAMES =======================
# Additional name fixes for items staying in their categories
EXTRA_NAME_FIXES = {
    'cuban_cigar': 'Charuto Cubano',
    'trophy_cognac': 'Conhaque Trofeu',
    'smuggler_s_flask': "Frasco do Contrabandista",
}

for cat in data['categories']:
    for item in cat['items']:
        if item['id'] in EXTRA_NAME_FIXES:
            old = item['name']
            item['name'] = EXTRA_NAME_FIXES[item['id']]
            print(f'Fixed name: {item["id"]}: "{old}" -> "{item["name"]}"')

# ======================= 4. ADD WIKILINKS & FIX IMAGES =======================
print(f'\nAdding wikiLinks and fixing images...')

# Items that need image re-download (known wrong images)
NEEDS_NEW_IMAGE = {'flesh', 'grouse'}

downloaded = 0
failed = 0
no_wiki = 0

for cat in data['categories']:
    for item in cat['items']:
        iid = item['id']
        
        # Add wikiLink
        wiki_title = get_wiki_title(iid)
        wiki_url = get_wiki_url(iid, wiki_title)
        item['wikiLink'] = wiki_url
        
        # Check if image needs re-download
        img_path = os.path.join(IMG_DIR, f'{iid}.png')
        needs_download = (
            iid in NEEDS_NEW_IMAGE or 
            not os.path.exists(img_path)
        )
        
        if needs_download:
            # Try to get image from wiki
            img_url = None
            page_url = None
            
            # Try special title first
            if iid in SPECIAL_TITLES:
                img_url, page_url = get_img_and_url(SPECIAL_TITLES[iid])
            
            if not img_url:
                # Try variations
                parts = iid.split('_')
                for title in [
                    '_'.join(p.capitalize() for p in parts),
                    parts[0].capitalize() + ' ' + ' '.join(p.lower() for p in parts[1:]) if len(parts) > 1 else '',
                    ' '.join(p.capitalize() for p in parts),
                ]:
                    if not title:
                        continue
                    img_url, page_url = get_img_and_url(title)
                    if img_url:
                        break
            
            if not img_url:
                # Try search
                img_url, page_url, search_title = search_and_get(iid)
                if img_url and page_url:
                    item['wikiLink'] = page_url
            
            if img_url:
                if dl(img_url, img_path):
                    downloaded += 1
                    print(f'  Downloaded: {iid} -> {img_path}')
                else:
                    failed += 1
                    print(f'  FAILED download: {iid}')
                time.sleep(0.3)
            else:
                no_wiki += 1
                print(f'  No wiki image: {iid}')

print(f'\n=== IMAGE SUMMARY ===')
print(f'Downloaded: {downloaded}')
print(f'Failed: {failed}')
print(f'No wiki image: {no_wiki}')

# ======================= 5. SAVE =======================
# Update metadata
data['metadata']['version'] = '2026-08-06-v1'
data['metadata']['last_updated'] = '2026-08-06'
data['metadata']['note'] = 'Itens e imagens do wiki oficial (dayr.wiki.gg). Nomes em PT-BR. WikiLinks incluidos.'

total = sum(len(c['items']) for c in data['categories'])
print(f'\nTotal items after fixes: {total}')
for cat in data['categories']:
    print(f'  {cat["id"]:15s} ({cat["name"]}): {len(cat["items"])} items')

with open(PRICES_PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f'\nSaved {PRICES_PATH}')
print('DONE!')
