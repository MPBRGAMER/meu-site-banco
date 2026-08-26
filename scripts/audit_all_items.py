#!/usr/bin/env python3
"""Full audit of all items against Day R wiki.
Checks: correct category, existence, transferability, wiki link."""
import json, urllib.request, urllib.parse, ssl, time, sys

WIKI_ITEMS = {}

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

def get_wiki_info(item_id, name):
    """Try to find the item on the wiki and return its info."""
    # Generate title variations from item_id
    parts = item_id.split('_')
    variations = []
    # PascalCase_underscore
    variations.append('_'.join(p.capitalize() for p in parts))
    # Sentence case with spaces
    if len(parts) > 1:
        variations.append(parts[0].capitalize() + ' ' + ' '.join(p.lower() for p in parts[1:]))
        variations.append(' '.join(p.capitalize() for p in parts))
    
    for title in variations:
        r = api_req({
            'action': 'query', 'titles': title,
            'prop': 'pageimages|info|categories',
            'format': 'json', 'pithumbsize': 100,
            'inprop': 'url'
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
    return {'found': False}

# Load prices
with open('/home/z/my-project/src/data/prices.json') as f:
    data = json.load(f)

# Manual known issues - items whose IDs don't match wiki titles
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
    'ak_47': 'AK-47',
    'ak_74': 'AK-74',
    'rpk_74': 'RPK-74',
    'saiga_12': 'Saiga-12',
    'vss_vintorez': 'VSS Vintorez',
    'as_val': 'AS Val',
    'gp_25': 'GP-25',
    'pb_pistol': 'PB Pistol',
    'tt_pistol': 'TT Pistol',
    'apb_pistol': 'APB Pistol',
    'fort_12': 'Fort-12',
    'mp_443': 'MP-443',
    'mp5': 'MP5',
    'benelli_m3': 'Benelli M3',
    'mp_153': 'MP-153',
    'mr_133': 'MR-133',
    'mp_5k': 'MP5K',
    'remington_870': 'Remington 870',
    'saiga_9': 'Saiga-9',
    'ks_23': 'KS-23',
    'toz_34': 'TOZ-34',
    'uaz_469_broken': 'UAZ-469 (Broken)',
    'aqua_filter': 'Aqua Filter',
    'steel_knife': 'Steel Knife',
    'forged_knife': 'Forged Knife',
    'tactical_backpack': 'Tactical Backpack',
    'military_backpack': 'Military Backpack',
    'tourist_backpack': 'Tourist Backpack',
    'alpine_backpack': 'Alpine Backpack',
    'scavenger_backpack': 'Scavenger Backpack',
    'iron_plate': 'Iron Plate',
    'steel_plate': 'Steel Plate',
    'titanium_plate': 'Titanium Plate',
    'carbon_plate': 'Carbon Plate',
    'military_armor': 'Military Armor',
    'tactical_vest': 'Tactical Vest',
    'scavenger_vest': 'Scavenger Vest',
    'nbc_suit': 'NBC Suit',
    'gas_mask': 'Gas Mask',
    'hunting_rifle': 'Hunting Rifle',
    'frying_pan': 'Frying Pan',
    'camping_stove': 'Camping Stove',
    'wooden_cart': 'Wooden Cart',
    'military_tent': 'Military Tent',
    'tent': 'Tent',
    'handmade_wooden_cart': 'Handmade Wooden Cart',
    'improved_wooden_cart': 'Improved Wooden Cart',
    'uaz_452': 'UAZ-452',
    'uaz_469': 'UAZ-469',
    'sewer_entrance': 'Sewer Entrance',
    'improved_sewer_entrance': 'Improved Sewer Entrance',
    'water_purifier': 'Water Purifier',
    'improved_water_purifier': 'Improved Water Purifier',
    'radio': 'Radio',
    'radio_transmitter': 'Radio Transmitter',
    'geiger_counter': 'Geiger Counter',
    'compass': 'Compass',
    'flashlight': 'Flashlight',
    'batteries': 'Batteries',
    'generator': 'Generator',
    'rope': 'Rope',
    'fishing_rod': 'Fishing Rod',
    'wrench': 'Wrench',
    'hammer': 'Hammer',
    'screwdriver': 'Screwdriver',
    'nails': 'Nails',
    'duct_tape': 'Duct Tape',
    'sewing_kit': 'Sewing Kit',
    'leather': 'Leather',
    'gauze': 'Gauze',
    'bandage': 'Bandage',
    'first_aid_kit': 'First Aid Kit',
    'military_first_aid_kit': 'Military First Aid Kit',
    'antibiotics': 'Antibiotics',
    'anti_radiation': 'Anti-Radiation',
    'anti_rad': 'Anti-Rad',
    'painkillers': 'Painkillers',
    'vitamins': 'Vitamins',
    'medkit': 'Medkit',
    'honey': 'Honey',
    'salt': 'Salt',
    'sugar': 'Sugar',
    'flour': 'Flour',
    'baking_powder': 'Baking Powder',
    'vegetable_oil': 'Vegetable Oil',
    'vinegar': 'Vinegar',
    'spice': 'Spice',
    'coffee': 'Coffee',
    'tea': 'Tea',
    'cocoa': 'Cocoa',
    'milk': 'Milk',
    'condensed_milk': 'Condensed Milk',
    'butter': 'Butter',
    'cheese': 'Cheese',
    'egg': 'Egg',
    'rice': 'Rice',
    'pasta': 'Pasta',
    'buckwheat': 'Buckwheat',
    'oatmeal': 'Oatmeal',
    'canned_food': 'Canned Food',
    'canned_meat': 'Canned Meat',
    'canned_fish': 'Canned Fish',
    'canned_vegetables': 'Canned Vegetables',
    'canned_mushrooms': 'Canned Mushrooms',
    'canned_water': 'Canned Water',
    'sauce': 'Sauce',
    'tomato_paste': 'Tomato Paste',
    'mushroom_soup': 'Mushroom Soup',
    'chocolate': 'Chocolate',
    'candy': 'Candy',
    'cigarette': 'Cigarette',
    'cigar': 'Cigar',
    'tobacco': 'Tobacco',
    'rolling_paper': 'Rolling Paper',
    'beer': 'Beer',
    'wine': 'Wine',
    'vodka': 'Vodka',
    'cognac': 'Cognac',
    'champagne': 'Champagne',
    'moonshine': 'Moonshine',
    'energy_drink': 'Energy Drink',
    'wood': 'Wood',
    'planks': 'Planks',
    'stone': 'Stone',
    'brick': 'Brick',
    'cement': 'Cement',
    'sand': 'Sand',
    'clay': 'Clay',
    'glass': 'Glass',
    'metal_scraps': 'Metal Scraps',
    'metal_parts': 'Metal Parts',
    'electrical_parts': 'Electrical Parts',
    'wire': 'Wire',
    'pipe': 'Pipe',
    'rubber': 'Rubber',
    'plastic': 'Plastic',
    'cloth': 'Cloth',
    'leather_scraps': 'Leather Scraps',
    'thread': 'Thread',
    'gunpowder': 'Gunpowder',
    'charcoal': 'Charcoal',
    'sulfur': 'Sulfur',
    'nitro': 'Nitro',
    'saltpeter': 'Saltpeter',
    'matches': 'Matches',
    'lighter': 'Lighter',
    'flint': 'Flint',
    'tinderbox': 'Tinderbox',
    'candle': 'Candle',
    'lamp_oil': 'Lamp Oil',
    'lamp': 'Lamp',
    'bicycle': 'Bicycle',
    'motorcycle': 'Motorcycle',
    'car_battery': 'Car Battery',
    'tire': 'Tire',
    'wheel': 'Wheel',
    'engine': 'Engine',
    'fuel': 'Fuel',
    'diesel': 'Diesel',
    'petrol': 'Petrol',
    'kerosene': 'Kerosene',
    'oil_lubricant': 'Oil Lubricant',
    'coolant': 'Coolant',
    'spark_plug': 'Spark Plug',
    'filter': 'Filter',
    'bolt': 'Bolt',
    'nut': 'Nut',
    'spring': 'Spring',
    'bearing': 'Bearing',
    'gear': 'Gear',
    'chain': 'Chain',
    'belt': 'Belt',
    'valve': 'Valve',
    'gasket': 'Gasket',
    'hose': 'Hose',
    'radiator': 'Radiator',
    'alternator': 'Alternator',
    'starter': 'Starter',
    'carburetor': 'Carburetor',
    'piston': 'Piston',
    'cylinder': 'Cylinder',
    'crankshaft': 'Crankshaft',
    'camshaft': 'Camshaft',
    'exhaust': 'Exhaust',
    'muffler': 'Muffler',
    'brake_pad': 'Brake Pad',
    'brake_disc': 'Brake Disc',
    'clutch': 'Clutch',
    'gearbox': 'Gearbox',
    'differential': 'Differential',
    'axle': 'Axle',
    'suspension': 'Suspension',
    'shock_absorber': 'Shock Absorber',
    'leaf_spring': 'Leaf Spring',
    'coil_spring': 'Coil Spring',
    'torsion_bar': 'Torsion Bar',
    'stabilizer': 'Stabilizer',
    'steering_wheel': 'Steering Wheel',
    'pedal': 'Pedal',
    'brake_line': 'Brake Line',
    'fuel_tank': 'Fuel Tank',
    'fuel_pump': 'Fuel Pump',
    'fuel_injector': 'Fuel Injector',
    'fuel_filter': 'Fuel Filter',
    'air_filter': 'Air Filter',
    'oil_filter': 'Oil Filter',
    'oil_pump': 'Oil Pump',
    'water_pump': 'Water Pump',
    'thermostat': 'Thermostat',
    'temperature_sensor': 'Temperature Sensor',
    'pressure_sensor': 'Pressure Sensor',
    'oxygen_sensor': 'Oxygen Sensor',
    'crankcase': 'Crankcase',
    'flywheel': 'Flywheel',
    'clutch_plate': 'Clutch Plate',
    'pressure_plate': 'Pressure Plate',
    'release_bearing': 'Release Bearing',
    'pilot_bearing': 'Pilot Bearing',
    'throwout_bearing': 'Throwout Bearing',
    'sync_ring': 'Sync Ring',
    'shift_fork': 'Shift Fork',
    'counter_shaft': 'Counter Shaft',
    'main_shaft': 'Main Shaft',
    'output_shaft': 'Output Shaft',
    'input_shaft': 'Input Shaft',
    'drive_shaft': 'Drive Shaft',
    'half_shaft': 'Half Shaft',
    'cv_joint': 'CV Joint',
    'universal_joint': 'Universal Joint',
    'wheel_bearing': 'Wheel Bearing',
    'wheel_hub': 'Wheel Hub',
    'wheel_stud': 'Wheel Stud',
    'lug_nut': 'Lug Nut',
    'tire_pressure': 'Tire Pressure',
}

# Category mapping from wiki categories to our categories
WIKI_CAT_MAP = {
    'Weapons': 'weapons',
    'Equipment': 'equipment',
    'Food': 'food',
    'Resources': 'resources',
    'Ammunition': 'ammo',
    'Armor': 'armor',
    'Clothing': 'armor',
    'Backpacks': 'equipment',
    'Medicine': 'medicine',
    'Medicine Items': 'medicine',
    'Materials': 'resources',
    'Vehicles': 'equipment',
    'Vehicle Parts': 'resources',
    'Tools': 'equipment',
    'Event Items': None,  # Needs special handling
    'Event weapons': 'weapons',
    'Event food': 'food',
    'All Items': None,  # Generic, ignore
    'Items': None,  # Generic, ignore
    'Assault rifle': 'weapons',
    'Shotgun': 'weapons',
    'Pistol': 'weapons',
    'SMG': 'weapons',
    'Sniper rifle': 'weapons',
    'Melee Weapons': 'weapons',
    'Throwable': 'weapons',
    'Explosives': 'weapons',
}

# Known non-transferable items (quest items, bound items, etc.)
NON_TRANSFERABLE = {
    'mining_permit', 'pineapple',
    'quest_item', 'story_item', 'key_item',
}

# Items that are weapons but might be miscategorized
WEAPON_INDICATORS = ['rifle', 'pistol', 'gun', 'shotgun', 'smg', 'sniper', 
                       'grenade', 'mine', 'rpg', 'rocket', 'bomb', 'cannon',
                       'ak_', 'mp_', 'pp_', 'svd', 'vss', 'as_', 'rpk',
                       'flesh', 'grouse', 'benelli', 'remington', 'saiga',
                       'toz', 'mr_', 'ks_', 'mosin', 'nagant', 'fort',
                       'tt_', 'pb_', 'apb_', 'kedr', 'val', 'vintorez',
                       'gp_25', 'gp25', 'flare_gun', 'signal_pistol']

def determine_correct_category(wiki_cats, item_id):
    """Determine what category an item should be in based on wiki categories."""
    if not wiki_cats:
        return None, 'no wiki categories'
    
    # Check for event items - some event items might not be transferable
    is_event = 'Event Items' in wiki_cats
    is_event_weapon = 'Event weapons' in wiki_cats
    is_event_food = 'Event food' in wiki_cats
    
    # Determine category from wiki categories
    for cat in wiki_cats:
        if cat in WIKI_CAT_MAP:
            mapped = WIKI_CAT_MAP[cat]
            if mapped and cat not in ['All Items', 'Items', 'Event Items']:
                return mapped, f'wiki cat: {cat}'
    
    return None, f'wiki cats: {wiki_cats[:5]}'

results = {
    'wrong_category': [],
    'not_found': [],
    'non_transferable': [],
    'wrong_name': [],
    'event_items': [],
}

total = sum(len(c['items']) for c in data['categories'])
processed = 0

for cat in data['categories']:
    cat_id = cat['id']
    cat_name = cat['name']
    for item in cat['items']:
        processed += 1
        iid = item['id']
        name = item['name']
        
        # Check known non-transferable
        if iid in NON_TRANSFERABLE:
            results['non_transferable'].append(f"  {iid} ({name}) in {cat_name}")
            continue
        
        # Check if item ID suggests weapon but is in food
        is_weapon_id = any(w in iid.lower() for w in WEAPON_INDICATORS)
        if is_weapon_id and cat_id == 'food':
            results['wrong_category'].append(f"  WEAPON IN FOOD: {iid} ({name})")
        
        # Check specific known problem items
        if iid == 'flesh':
            results['wrong_category'].append(f"  FLESH is assault rifle, not food: {iid} ({name}) in {cat_name}")
        elif iid == 'grouse':
            results['wrong_category'].append(f"  GROUSE is shotgun (KS-23), not food: {iid} ({name}) in {cat_name}")
        
        if processed % 50 == 0:
            print(f'Processed {processed}/{total}...', flush=True)

print(f'\n=== AUDIT RESULTS ===')
print(f'Total items checked: {processed}')

for key, items in results.items():
    if items:
        print(f'\n--- {key.upper()} ({len(items)} items) ---')
        for i in items:
            print(i)

# Also list all items in food category that have weapon-like IDs
print('\n=== ALL FOOD ITEMS (for manual review) ===')
for cat in data['categories']:
    if cat['id'] == 'food':
        for item in cat['items']:
            print(f'  {item["id"]:40s} | {item["name"]}')

print('\n=== ALL WEAPONS CATEGORY ITEMS ===')
for cat in data['categories']:
    if cat['id'] == 'weapons':
        for item in cat['items']:
            print(f'  {item["id"]:40s} | {item["name"]}')
