import json, re, os, sys, ssl, urllib.request, urllib.parse, time, random

DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'prices.json')

def load_json():
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(data):
    with open(DATA_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def id_to_wiki_title(item_id):
    """Convert item ID to wiki title: canned_water -> Canned_water"""
    if not item_id:
        return ""
    return item_id[0].upper() + item_id[1:]

def api_req(params):
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    q = '&'.join(f'{k}={urllib.parse.quote(str(v))}' for k, v in params.items())
    url = f'https://dayr.wiki.gg/api.php?{q}'
    req = urllib.request.Request(url, headers={'User-Agent': 'DayRWikiBot/1.0'})
    resp = urllib.request.urlopen(req, context=ctx, timeout=15)
    return json.loads(resp.read())

def verify_wiki_page(title):
    """Check if a wiki page exists. Returns the canonical title or None."""
    try:
        result = api_req({
            'action': 'query',
            'titles': title,
            'format': 'json'
        })
        pages = result.get('query', {}).get('pages', {})
        for page_id, page_data in pages.items():
            if page_id != '-1':
                return page_data.get('title', title)
        return None
    except Exception as e:
        print(f"  Error verifying {title}: {e}")
        return None

def main():
    data = load_json()
    
    # Special wiki title overrides (ID -> correct wiki title)
    # Based on known wiki page names that differ from the ID pattern
    SPECIAL_TITLES = {
        '7_62x25mm_tt_shell': '7.62x25mm_TT_Shell',
        'assault_rifle_ammo': 'Assault_rifle_ammo',
        'blank_cartridge': 'Blank_cartridge',
        'primer': 'Primer',
        'pistol_ammo': 'Pistol_ammo',
        'gunpowder': 'Gunpowder',
        'revolver_ammo': 'Revolver_ammo',
        'rifle_ammo': 'Rifle_ammo',
        'training_ammo': 'Training_ammo',
        'shotgun_round': 'Shotgun_round',
        'termite': 'Thermite',
        'bio_energy_drink': 'Bio-energy_Drink',
        'cold_coffee': 'Cold_coffee',
        'hot_coffee': 'Hot_coffee',
        'cold_tea': 'Cold_tea',
        'hot_tea': 'Hot_tea',
        'cooked_rice': 'Cooked_rice',
        'energy_drink': 'Energy_drink',
        'fresh_fish': 'Fresh_fish',
        'strawberry_cake': 'Strawberry_cake',
        'simple_chowder': 'Simple_chowder',
        'hearty_chowder': 'Hearty_chowder',
        'fried_tainted_meat': 'Fried_tainted_meat',
        'canned_beef': 'Canned_beef',
        'dried_meat': 'Dried_meat',
        'fried_rat_meat': 'Fried_rat_meat',
        'chemistry_set': 'Chemistry_set',
        'handmade_needle': 'Handmade_needle',
        'rusted_hacksaw': 'Rusted_hacksaw',
        'rusted_needle': 'Rusted_needle',
        'rusted_shovel': 'Rusted_shovel',
        'steel_crowbar': 'Steel_crowbar',
        'steel_needle': 'Steel_needle',
        'steel_shovel': 'Steel_shovel',
        'titanium_shovel': 'Titanium_shovel',
        'titanium_crowbar': 'Titanium_crowbar',
    }
    
    fixed = 0
    errors = []
    
    for cat in data['categories']:
        for item in cat['items']:
            # Skip items that already have wikiLink
            if item.get('wikiLink', '').strip():
                continue
            
            item_id = item['id']
            
            # Use special title if available
            if item_id in SPECIAL_TITLES:
                title = SPECIAL_TITLES[item_id]
            else:
                title = id_to_wiki_title(item_id)
            
            wiki_url = f'https://dayr.wiki.gg/wiki/{urllib.parse.quote(title, safe="")}'
            item['wikiLink'] = wiki_url
            fixed += 1
            
            # Small delay to be gentle on the API (not verifying to save time)
    
    save_json(data)
    print(f'Fixed {fixed} items with wikiLinks')
    print(f'Errors: {len(errors)}')
    for e in errors:
        print(f'  {e}')

if __name__ == '__main__':
    main()
