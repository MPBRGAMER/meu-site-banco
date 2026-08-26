#!/usr/bin/env python3
"""Batch check items against wiki to find wrong categories and non-transferable items."""
import json, urllib.request, urllib.parse, ssl, time, sys

def api_req(params):
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    q = '&'.join(f'{k}={urllib.parse.quote(str(v))}' for k, v in params.items())
    url = f'https://dayr.wiki.gg/api.php?{q}'
    req = urllib.request.Request(url, headers={'User-Agent': 'DayRWikiBot/1.0'})
    try:
        resp = urllib.request.urlopen(req, context=ctx, timeout=15)
        return json.loads(resp.read())
    except Exception as e:
        return {'error': str(e)}

SPECIAL_TITLES = {
    'flesh': 'Flesh',
    'grouse': 'Grouse',
    'smuggler_s_flask': "Smuggler's Flask",
    'gp_2000_gas_mask': 'GP-2000 Gas Mask',
    'mosin_nagant_broken': 'Mosin-Nagant rifle (broken)',
    'uaz_452_broken': 'UAZ-452 (Broken)',
    'cypress_smg': 'Cypress SMG',
    'f1_grenade': 'F-1 Grenade',
    'rgd_5_grenade': 'RGD-5 Grenade',
    'm1895_nagant': 'M1895 Nagant',
    'pp_91_kedr': 'PP-91 Kedr',
    'sks_rifle': 'SKS rifle',
    'ak_47': 'AK-47', 'ak_74': 'AK-74', 'rpk_74': 'RPK-74',
    'saiga_12': 'Saiga-12', 'vss_vintorez': 'VSS Vintorez', 'as_val': 'AS Val',
    'gp_25': 'GP-25', 'pb_pistol': 'PB Pistol', 'tt_pistol': 'TT Pistol',
    'apb_pistol': 'APB Pistol', 'fort_12': 'Fort-12', 'mp_443': 'MP-443',
    'mp5': 'MP5', 'benelli_m3': 'Benelli M3', 'mp_153': 'MP-153',
    'mr_133': 'MR-133', 'mp_5k': 'MP5K', 'remington_870': 'Remington 870',
    'saiga_9': 'Saiga-9', 'ks_23': 'KS-23', 'toz_34': 'TOZ-34',
    'uaz_469_broken': 'UAZ-469 (Broken)',
    'akm_c': 'AKM-C', 'd_eagle': 'Desert Eagle', 'rpg_vesuvius': 'RPG Vesuvius',
    'rpo_m_eye_of_the_storm': 'RPO-M Eye of the Storm',
    'collector': 'Collector', 'ksyukha': 'Ksyukha',
    'pkm_broken': 'PKM (Broken)', 'pps_43_broken': 'PPS-43 (Broken)',
    'ppsh_41_broken': 'PPSh-41 (Broken)', 'rpk_74_broken': 'RPK-74 (Broken)',
    'svd_broken': 'SVD (Broken)', 'svt_40_broken': 'SVT-40 (Broken)',
    'tt_33_broken': 'TT-33 (Broken)',
    'makarov_handgun_broken': 'Makarov handgun (broken)',
    'mosin_nagant_rifle_broken': 'Mosin-Nagant rifle (broken)',
    'nagant_revolver_broken': 'Nagant revolver (broken)',
    'sniper_s_mosin': 'Sniper\'s Mosin',
    'hunter_s_rifle': 'Hunter\'s Rifle',
    'jack_o_launcher': 'Jack O\' Launcher',
    'storm_snowball_launcher': 'Storm Snowball Launcher',
    'lmg_qilin': 'LMG Qilin',
    'pk_7_62_kraken': 'PK 7.62 Kraken',
    'borchevik_flamethrower': 'Borschevik Flamethrower',
    'aqua_filter': 'Aqua Filter',
    'sewer_entrance': 'Sewer Entrance',
    'improved_sewer_entrance': 'Improved Sewer Entrance',
    'water_purifier': 'Water Purifier',
    'improved_water_purifier': 'Improved Water Purifier',
    'handmade_wooden_cart': 'Handmade Wooden Cart',
    'improved_wooden_cart': 'Improved Wooden Cart',
    'wooden_cart': 'Wooden Cart',
    'military_first_aid_kit': 'Military First Aid Kit',
    'borschevik_flamethrower': 'Borschevik Flamethrower',
}

def get_title(item_id):
    if item_id in SPECIAL_TITLES:
        return SPECIAL_TITLES[item_id]
    parts = item_id.split('_')
    return '_'.join(p.capitalize() for p in parts)

def variations(item_id):
    if item_id in SPECIAL_TITLES:
        return [SPECIAL_TITLES[item_id]]
    parts = item_id.split('_')
    v = ['_'.join(x.capitalize() for x in parts)]
    if len(parts) > 1:
        v.append(parts[0].capitalize() + ' ' + ' '.join(x.lower() for x in parts[1:]))
        v.append(' '.join(x.capitalize() for x in parts))
    return v

def get_wiki_info(item_id):
    """Get wiki page info for an item."""
    for title in variations(item_id):
        r = api_req({
            'action': 'query', 'titles': title,
            'prop': 'pageimages|info|categories',
            'format': 'json', 'pithumbsize': 100,
            'inprop': 'url', 'cllimit': 50
        })
        pages = r.get('query', {}).get('pages', {})
        for pid, pd in pages.items():
            if 'missing' in pd:
                continue
            cats = [c.get('title', '').replace('Category:', '') for c in pd.get('categories', [])]
            page_url = pd.get('fullurl', '')
            page_title = pd.get('title', '')
            img = pd.get('thumbnail', {}).get('source', '')
            return {
                'found': True,
                'wiki_title': page_title,
                'wiki_url': page_url,
                'img_url': img,
                'categories': cats,
                'searched_title': title
            }
    # Try search as last resort
    r = api_req({'action': 'query', 'list': 'search', 'srsearch': item_id.replace('_', ' '), 'srlimit': 3, 'format': 'json'})
    for hit in r.get('query', {}).get('search', []):
        stitle = hit['title']
        r2 = api_req({
            'action': 'query', 'titles': stitle,
            'prop': 'pageimages|info|categories',
            'format': 'json', 'pithumbsize': 100,
            'inprop': 'url', 'cllimit': 50
        })
        for pid, pd in r2.get('query', {}).get('pages', {}).items():
            if 'missing' in pd:
                continue
            cats = [c.get('title', '').replace('Category:', '') for c in pd.get('categories', [])]
            return {
                'found': True,
                'wiki_title': pd.get('title', ''),
                'wiki_url': pd.get('fullurl', ''),
                'img_url': pd.get('thumbnail', {}).get('source', ''),
                'categories': cats,
                'searched_title': f'SEARCH: {stitle}'
            }
    return {'found': False}

# Category mapping
WIKI_CAT_TO_OURS = {
    'Weapons': 'weapons', 'Ammunition': 'ammo', 'Armor': 'armor',
    'Equipment': 'equipment', 'Food': 'food', 'Resources': 'resources',
    'Materials': 'resources', 'Medicine': 'medicine', 'Medicine Items': 'medicine',
    'Backpacks': 'equipment', 'Vehicles': 'equipment', 'Tools': 'equipment',
    'Assault rifle': 'weapons', 'Shotgun': 'weapons', 'Pistol': 'weapons',
    'SMG': 'weapons', 'Sniper rifle': 'weapons', 'Melee Weapons': 'weapons',
    'Throwable': 'weapons', 'Explosives': 'weapons', 'Event weapons': 'weapons',
    'Event food': 'food', 'Event Items': None,
    'Clothing': 'armor',
}

IGNORE_CATS = {'All Items', 'Items', 'Equipment'}

def determine_wiki_category(wiki_cats):
    """Determine what our category should be based on wiki categories."""
    for cat in wiki_cats:
        if cat in IGNORE_CATS:
            continue
        if cat in WIKI_CAT_TO_OURS:
            mapped = WIKI_CAT_TO_OURS[cat]
            if mapped:
                return mapped
    return None

with open('/home/z/my-project/src/data/prices.json') as f:
    data = json.load(f)

# Collect all items
all_items = []
for cat in data['categories']:
    for item in cat['items']:
        all_items.append({**item, '_cat_id': cat['id'], '_cat_name': cat['name']})

print(f'Total items: {len(all_items)}')

# Check each item against wiki
wrong_cat = []
not_found = []
event_items = []
results = []  # (item_id, name, our_cat, wiki_url, wiki_cats)

for i, item in enumerate(all_items):
    iid = item['id']
    info = get_wiki_info(iid)
    result = {
        'id': iid, 'name': item['name'],
        'our_cat': item['_cat_id'],
        'wiki_url': info.get('wiki_url', ''),
        'wiki_title': info.get('wiki_title', ''),
        'wiki_cats': info.get('categories', []),
        'found': info.get('found', False)
    }
    results.append(result)
    
    if not info.get('found'):
        not_found.append(f"{iid} ({item['name']}) in {item['_cat_name']}")
    else:
        wiki_cats = info.get('categories', [])
        is_event = 'Event Items' in wiki_cats
        wiki_cat = determine_wiki_category(wiki_cats)
        
        if is_event:
            event_items.append(f"{iid} ({item['name']}) in {item['_cat_name']} | wiki_cats: {wiki_cats}")
        
        if wiki_cat and wiki_cat != item['_cat_id']:
            wrong_cat.append(f"{iid} ({item['name']}) in {item['_cat_name']} -> should be {wiki_cat} | wiki: {info.get('wiki_title','')}")
    
    if (i + 1) % 20 == 0:
        print(f'Checked {i+1}/{len(all_items)}...', flush=True)
    time.sleep(0.15)  # Rate limiting

print(f'\n=== WRONG CATEGORY ({len(wrong_cat)} items) ===')
for w in wrong_cat:
    print(f'  {w}')

print(f'\n=== NOT FOUND ON WIKI ({len(not_found)} items) ===')
for n in not_found:
    print(f'  {n}')

print(f'\n=== EVENT ITEMS ({len(event_items)} items) ===')
for e in event_items:
    print(f'  {e}')

# Save results for further processing
with open('/home/z/my-project/scripts/audit_results.json', 'w') as f:
    json.dump(results, f, indent=2, ensure_ascii=False)
print(f'\nSaved audit results to audit_results.json')
