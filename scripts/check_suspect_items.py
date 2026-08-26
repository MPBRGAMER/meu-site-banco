#!/usr/bin/env python3
"""Quick check of suspect items against the wiki."""
import json, urllib.request, urllib.parse, ssl, time

def api_req(params):
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    q = '&'.join(f'{k}={urllib.parse.quote(str(v))}' for k, v in params.items())
    url = f'https://dayr.wiki.gg/api.php?{q}'
    req = urllib.request.Request(url, headers={'User-Agent': 'DayRWikiBot/1.0'})
    resp = urllib.request.urlopen(req, context=ctx, timeout=15)
    return json.loads(resp.read())

SPECIAL = {
    'flesh': 'Flesh', 'grouse': 'Grouse',
    'smuggler_s_flask': "Smuggler's Flask",
    'smuggler_s_armor': "Smuggler's Armor",
    'trophy_cognac': 'Trophy Cognac',
    'knock_off_energy_drink': 'Knock-off Energy Drink',
    'spooky_energy_drink': 'Spooky Energy Drink',
    'holiday_energy_drink': 'Holiday Energy Drink',
    'smuggled_energy_drink': 'Smuggled Energy Drink',
    'chinese_energy_drink': 'Chinese Energy Drink',
    'borschevik_flamethrower': 'Borschevik Flamethrower',
    'collector': 'Collector', 'ksyukha': 'Ksyukha',
    'golden_easter_egg': 'Golden Easter Egg',
    'rainbow_easter_egg': 'Rainbow Easter Egg',
    'easter_egg': 'Easter Egg', 'easter_cake': 'Easter Cake',
    'chocolate_bunny': 'Chocolate Bunny', 'candy_cane': 'Candy Cane',
    'bunny_treat': 'Bunny Treat',
    'stale_pryanik': 'Stale Pryanik',
    'cuban_cigar': 'Cuban Cigar',
    'rat_meat': 'Rat Meat', 'snake_meat': 'Snake Meat',
    'broadleaf_plantain': 'Broadleaf Plantain', 'moss': 'Moss', 'nettle': 'Nettle',
    'saltpeter': 'Saltpeter',
    'peking_duck': 'Peking Duck', 'sushi': 'Sushi',
    'shashlik': 'Shashlik', 'shawarma': 'Shawarma',
    'pelmeni': 'Pelmeni', 'kholodets': 'Kholodets',
    'shchi': 'Shchi', 'ukha': 'Ukha',
    'coulibiac': 'Coulibiac', 'pilaf': 'Pilaf',
    'olivier_salad': 'Olivier Salad',
    'cabbage_roll': 'Cabbage Roll',
    'beetle_juice': 'Beetle Juice',
    'kvass': 'Kvass',
    'chanterelle': 'Chanterelle',
    'cranberry': 'Cranberry', 'strawberry': 'Strawberry',
    'tangerine': 'Tangerine', 'pumpkin': 'Pumpkin', 'apple': 'Apple',
    'beetle_juice': 'Beetle Juice',
    # Broken weapons in ammo
    'pkm_broken': 'PKM (Broken)', 'pps_43_broken': 'PPS-43 (Broken)',
    'ppsh_41_broken': 'PPSh-41 (Broken)', 'rpk_74_broken': 'RPK-74 (Broken)',
    'svd_broken': 'SVD (Broken)', 'svt_40_broken': 'SVT-40 (Broken)',
    'tt_33_broken': 'TT-33 (Broken)',
    # Broken weapons in weapons
    'makarov_handgun_broken': 'Makarov handgun (broken)',
    'mosin_nagant_rifle_broken': 'Mosin-Nagant rifle (broken)',
    'nagant_revolver_broken': 'Nagant revolver (broken)',
}

def check(title):
    r = api_req({'action':'query','titles':title,'prop':'pageimages|info|categories',
                 'format':'json','pithumbsize':100,'inprop':'url','cllimit':50})
    for pid, pd in r.get('query',{}).get('pages',{}).items():
        if 'missing' in pd:
            return None
        cats = [c.get('title','').replace('Category:','') for c in pd.get('categories',[])]
        return {
            'title': pd.get('title',''),
            'url': pd.get('fullurl',''),
            'cats': cats,
            'img': pd.get('thumbnail',{}).get('source','')
        }
    return None

# Items to check - suspects
suspects = [
    # From food that might be wrong
    ('flesh', 'Carne', 'food'),
    ('grouse', 'Galo-da-serra', 'food'),
    ('smuggler_s_flask', 'Frasco do Contrabandista', 'food'),
    ('trophy_cognac', 'Conhaque Trofeu', 'food'),
    ('knock_off_energy_drink', 'Energetico Falsificado', 'food'),
    ('spooky_energy_drink', 'Energetico Assustador', 'food'),
    ('holiday_energy_drink', 'Energetico de Feriado', 'food'),
    ('smuggled_energy_drink', 'Energético Contrabandeado', 'food'),
    ('chinese_energy_drink', 'Energético Chinês', 'food'),
    ('golden_easter_egg', 'Ovo de Páscoa Dourado', 'food'),
    ('rainbow_easter_egg', 'Ovo de Pascoa Arco-Iris', 'food'),
    ('easter_egg', 'Ovo de Páscoa', 'food'),
    ('easter_cake', 'Bolo de Páscoa', 'food'),
    ('chocolate_bunny', 'Coelho de Chocolate', 'food'),
    ('candy_cane', 'Bengala Doce', 'food'),
    ('bunny_treat', 'Guloseima de Coelho', 'food'),
    ('stale_pryanik', 'Pryanik Velho', 'food'),
    ('cuban_cigar', 'Charuto Cubano', 'food'),
    ('broadleaf_plantain', 'Tanchagem', 'food'),
    ('moss', 'Musgo', 'food'),
    ('nettle', 'Urtiga', 'food'),
    ('saltpeter', 'Salitre', 'food'),
    ('beetle_juice', 'Suco de Besouro', 'food'),
    ('kvass', 'Kvass', 'food'),
    # From ammo that might be weapons
    ('pkm_broken', 'PKM (Quebrado)', 'ammo'),
    ('pps_43_broken', 'PPS-43 (Quebrado)', 'ammo'),
    ('ppsh_41_broken', 'PPSh-41 (Quebrado)', 'ammo'),
    ('rpk_74_broken', 'RPK-74 (Quebrado)', 'ammo'),
    ('svd_broken', 'SVD (Quebrado)', 'ammo'),
    ('svt_40_broken', 'SVT-40 (Quebrado)', 'ammo'),
    ('tt_33_broken', 'TT-33 (Quebrado)', 'ammo'),
    # From weapons that might be ammo
    ('homemade_rocket_launcher', 'Lancador de Foguetes Artesanal', 'weapons'),
    # Other suspects from all categories
    ('smuggler_s_armor', 'Armadura do Contrabandista', 'armor'),
]

print('Checking suspect items against wiki...')
print('='*80)

for iid, name, cur_cat in suspects:
    title = SPECIAL.get(iid)
    if not title:
        parts = iid.split('_')
        title = '_'.join(p.capitalize() for p in parts)
    info = check(title)
    if info:
        # Determine expected category from wiki
        wiki_expected = None
        weapon_cats = {'Weapons', 'Assault rifle', 'Shotgun', 'Pistol', 'SMG', 
                       'Sniper rifle', 'Melee Weapons', 'Throwable', 'Explosives',
                       'Event weapons'}
        ammo_cats = {'Ammunition'}
        armor_cats = {'Armor', 'Clothing'}
        food_cats = {'Food', 'Event food'}
        equip_cats = {'Equipment', 'Backpacks', 'Tools', 'Vehicles'}
        med_cats = {'Medicine', 'Medicine Items'}
        res_cats = {'Resources', 'Materials'}
        
        for c in info['cats']:
            if c in weapon_cats: wiki_expected = 'weapons'
            elif c in ammo_cats: wiki_expected = 'ammo'
            elif c in armor_cats: wiki_expected = 'armor'
            elif c in food_cats: wiki_expected = 'food'
            elif c in equip_cats: wiki_expected = 'equipment'
            elif c in med_cats: wiki_expected = 'medicine'
            elif c in res_cats: wiki_expected = 'resources'
        
        is_event = 'Event Items' in info['cats']
        status = ''
        if wiki_expected and wiki_expected != cur_cat:
            status = f' *** WRONG CAT: should be {wiki_expected} ***'
        if is_event:
            status += ' [EVENT]'
        
        print(f'{iid:35s} | {name:30s} | cur: {cur_cat:10s} | wiki: {info["title"]:35s} | cats: {info["cats"][:6]}{status}')
    else:
        print(f'{iid:35s} | {name:30s} | cur: {cur_cat:10s} | NOT FOUND ON WIKI ***')
    time.sleep(0.2)
