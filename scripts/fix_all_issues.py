#!/usr/bin/env python3
"""
Comprehensive fix for ALL issues:
1. Pineapple = F-1 grenade (move to ammo, rename)
2. Massive category reorganization
3. Remove non-tradeable items
"""
import json, os
from pathlib import Path

PRICES_PATH = Path('/home/z/my-project/src/data/prices.json')
ITEMS_DIR = Path('/home/z/my-project/public/items')

with open(PRICES_PATH) as f:
    data = json.load(f)

# Build item lookup
all_items = {}
for cat in data['categories']:
    for item in cat['items']:
        all_items[item['id']] = item

# ============================================
# 1. FIX PINEAPPLE = F-1 GRENADE
# ============================================
if 'pineapple' in all_items:
    all_items['pineapple']['name'] = 'Granada F-1 (Abacaxi)'
    print('pineapple -> Granada F-1 (Abacaxi)')

# ============================================
# 2. MASSIVE CATEGORY REORGANIZATION
# ============================================
# Mapping: item_id -> correct category_id
MOVES = {
    # --- WEAPONS currently in Materiais -> Armas ---
    'akm_c': 'weapons',
    'abakan': 'weapons',
    'all_in': 'weapons',
    'alphacelone': 'weapons',
    'biathlon_84': 'weapons',
    'bingo': 'weapons',
    'blackjack': 'weapons',
    'cho_ko_nu': 'weapons',
    'crouching_tiger': 'weapons',
    'cybermitten': 'weapons',
    'd_eagle': 'weapons',
    'degtyar': 'weapons',
    'double_barrel': 'weapons',
    'dragon_s_roar': 'weapons',
    'ea_spectrum': 'weapons',
    'erebus_273': 'weapons',
    'fatum_e_93': 'weapons',
    'fear': 'weapons',
    'fist_of_the_sky': 'weapons',
    'flying_spaghetti_monster': 'weapons',
    'forward_s_stick': 'weapons',
    'gangster': 'weapons',
    'gehenna': 'weapons',
    'gigawattor': 'weapons',
    'guandao': 'weapons',
    'hidden_dragon': 'weapons',
    'iceberg': 'weapons',
    'icicle_thrower': 'weapons',
    'infernal_coal': 'weapons',
    'infernal_prophet': 'weapons',
    'iron_felix': 'weapons',
    'joker': 'weapons',
    'joy': 'weapons',
    'kalash_m': 'weapons',
    'kalash_s': 'weapons',
    'law_guardian': 'weapons',
    'lmg_qilin': 'weapons',
    'lotus_of_death': 'weapons',
    'makar': 'weapons',
    'mauser': 'weapons',
    'mayhem': 'weapons',
    'midas': 'weapons',
    'mosinka': 'weapons',
    'murmur': 'weapons',
    'nagant': 'weapons',
    'pas_weaver': 'weapons',
    'pepperbox': 'weapons',
    'pk_7_62_kraken': 'weapons',
    'posh': 'weapons',
    'revenge': 'weapons',
    'rpg_vesuvius': 'weapons',
    'rpo_m_eye_of_the_storm': 'weapons',
    'sabre': 'weapons',
    'sanguinary_masha': 'weapons',
    'schmeisser': 'weapons',
    'shmel': 'weapons',
    'shock_bludgeon': 'weapons',
    'sipuha': 'weapons',
    'skorpion': 'weapons',
    'sniper_s_mosin': 'weapons',
    'stake_thrower': 'weapons',
    'stecha': 'weapons',
    'sudayev': 'weapons',
    'svetka': 'weapons',
    'svyokr': 'weapons',
    'ulcer_amr': 'weapons',
    'vector_a': 'weapons',
    'vintorez': 'weapons',
    'witch_s_punch': 'weapons',
    'wolfsbane_1': 'weapons',
    # Broken weapons -> Armas
    'pkm_broken': 'weapons',
    'pps_43_broken': 'weapons',
    'ppsh_41_broken': 'weapons',
    'rpk_74_broken': 'weapons',
    'svd_broken': 'weapons',
    'svt_40_broken': 'weapons',
    'tt_33_broken': 'weapons',

    # --- FOOD currently in Materiais -> food ---
    'flesh': 'food',
    'ice_cream': 'food',
    'fried_snake': 'food',
    'olivier_salad': 'food',
    'grouse': 'food',
    'trophy_cognac': 'food',
    'smoked_fatback': 'food',
    'tangerine': 'food',

    # --- FOOD currently in Equipamentos -> food ---
    'cabbage_roll': 'food',

    # --- FOOD currently in Medicamentos (herbs) -> food ---
    'nettle': 'food',
    'moss': 'food',

    # --- MATERIALS currently in Comida -> materials ---
    'bamboo_steamer': 'materials',
    'mushroom_with_eyes': 'materials',

    # --- Materials/Herbs currently in Comida -> seeds (herbs/mushrooms) ---
    'stearin': 'materials',

    # --- Strange mushrooms (ingredients) in Comida -> materials ---
    'strange_mushroom_black': 'materials',
    'strange_mushroom_blue': 'materials',
    'strange_mushroom_green': 'materials',
    'strange_mushroom_light_blue': 'materials',
    'strange_mushroom_red': 'materials',
    'strange_mushroom_violet': 'materials',
    'strange_mushroom_white': 'materials',
    'strange_mushroom_yellow': 'materials',

    # --- Pineapple (F-1 grenade) from Comida -> ammo ---
    'pineapple': 'ammo',

    # --- Medicine currently in Materiais -> medicine ---
    'bioblocade_inhaler': 'medicine',
    'bye_bye_rad': 'medicine',
    'healing_salve': 'medicine',
    'comcon_3_paste': 'medicine',
    'pill_of_immortality': 'medicine',

    # --- Medicine/chemical currently in Materiais -> medicine ---
    'caustic_distillate': 'medicine',

    # --- Herb currently in Medicamentos -> seeds ---
    'broadleaf_plantain': 'food',  # Tanchagem is a cooking ingredient

    # --- Material currently in Medicamentos -> materials ---
    'acid_gland': 'materials',

    # --- Ammo/weapon currently in Armas -> ammo ---
    'shotgun_round': 'ammo',
    'homemade_rocket_launcher': 'weapons',  # It's a weapon

    # --- Misc items currently in Armas -> correct category ---
    'rainbow_easter_egg': 'food',  # Easter egg item

    # --- Tools currently in Materiais -> tools ---
    'chainsaw': 'tools',
    'chainsaw_motor': 'tools',
    'crane': 'tools',
    'electric_motor': 'tools',
    'gasoline_engine': 'tools',
    'welder': 'tools',  # Already in tools actually

    # --- Equipment currently in Materiais -> equipment ---
    'kettlebell': 'equipment',
    'motorcycle_spare_parts': 'materials',
    'transport_repair_kit': 'tools',
    'vehicle_repair_kit': 'tools',
    'weapon_box': 'materials',
    'weapon_repair_kit': 'tools',
    'collector': 'weapons',  # Weapon

    # --- Food/Drink currently in Materiais -> food ---
    'rusks': 'food',
    'infected_rusk': 'food',
    'ration_pack': 'food',
    'expeditionary_ration': 'food',

    # --- Broken vehicles -> materials (they're vehicle parts) ---
    'gaz_24_broken': 'materials',
    'kamaz_broken': 'materials',
    'uaz_452_broken': 'materials',
    'uaz_469_broken': 'materials',
    'vaz_2101_broken': 'materials',
    'zaz_968_broken': 'materials',
    'zil_130_broken': 'materials',

    # --- Explosives/Throwable in Materiais -> ammo ---
    'chinese_fireworks': 'ammo',
    'termite': 'ammo',

    # --- Materials currently in Armas (batteries/parts) -> materials ---
    'broken_car_battery': 'materials',
    'car_battery': 'materials',
    'nuclear_battery': 'materials',

    # --- Equipment in Armas -> equipment ---
    'battery_flashlight': 'equipment',

    # --- Chemistry set in Equipamentos -> tools ---
    'chemistry_set': 'tools',
    'chitin_torch': 'tools',

    # --- Medicamento in Municoes -> medicine ---
    'chlorcystamine': 'medicine',

    # --- Material in Municoes -> materials ---
    'vial_of_amine': 'materials',

    # --- Food ingredients from Sementes -> food ---
    'radioactive_mushroom': 'materials',
    'amanita': 'materials',  # Mushroom ingredient (can be poisonous)
    'blood_mold': 'materials',
    'chanterelle': 'food',  # Edible mushroom
    'roasted_chanterelle': 'food',
    'mushroom_pasta': 'food',
    'mushroom_soup': 'food',

    # --- Drink currently in Materiais -> food ---
    'smuggler_s_flask': 'food',
}

# ============================================
# 3. NON-TRADEABLE ITEMS TO REMOVE
# ============================================
NON_TRADEABLE = [
    'forward_s_stick',  # Quest reward - not tradeable
    'iron_felix',       # Quest reward - not tradeable
]

print(f'\n=== MOVENDO ITENS ENTRE CATEGORIAS ===')
cat_map = {c['id']: c for c in data['categories']}
moved_count = 0

for item_id, target_cat_id in MOVES.items():
    if item_id not in all_items:
        continue
    if item_id in NON_TRADEABLE:
        continue  # Will be removed

    item = all_items[item_id]
    # Find which category currently has this item
    for cat in data['categories']:
        for i, it in enumerate(cat['items']):
            if it['id'] == item_id and cat['id'] != target_cat_id:
                cat['items'].pop(i)
                cat_map[target_cat_id]['items'].append(it)
                moved_count += 1
                if moved_count <= 30:
                    print(f'  {item_id}: {cat["id"]} -> {target_cat_id}')
                break

print(f'  ... total movidos: {moved_count}')

print(f'\n=== REMOVENDO ITENS NAO TRANSFERIVEIS ===')
removed = 0
for item_id in NON_TRADEABLE:
    for cat in data['categories']:
        for i, it in enumerate(cat['items']):
            if it['id'] == item_id:
                cat['items'].pop(i)
                # Remove image too
                img = ITEMS_DIR / f'{item_id}.png'
                if img.exists():
                    img.unlink()
                print(f'  REMOVIDO: {item_id} ({it["name"]})')
                removed += 1
                break
    if item_id in all_items:
        del all_items[item_id]

print(f'  Total removidos: {removed}')

# ============================================
# SAVE
# ============================================
with open(PRICES_PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f'\n=== RESULTADO FINAL ===')
total = 0
for cat in data['categories']:
    n = len(cat['items'])
    total += n
    print(f'  {cat["name"]}: {n}')
print(f'  TOTAL: {total}')
