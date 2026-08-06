#!/usr/bin/env python3
"""MEGA FIX - Part 1: Data corrections (remove, rename, fix wikiLinks)."""
import json, os

PRICES_PATH = '/home/z/my-project/src/data/prices.json'
IMG_DIR = '/home/z/my-project/public/items'

with open(PRICES_PATH) as f:
    data = json.load(f)

# ══════════════════════════════════════════
# REMOVE SET
# ══════════════════════════════════════════
REMOVE = set()

# Food
for i in ['ration_pack','expeditionary_ration','flesh','grouse','smuggler_s_flask']:
    REMOVE.add(i)

# Medicine
for i in ['antidote','stimulant','poisoned_flask','bioblocade_inhaler',
           'injector','pill_of_immortality','protection_potion']:
    REMOVE.add(i)

# Ammo
for i in ['chinese_fireworks','grenade_launcher_round','pyrolytic_grenade','pineapple']:
    REMOVE.add(i)

# Materials
for i in ['nuclear_battery','rubber','survivor_s_cache','high_performance_capacitor',
           'cpe_leader','diesel','dragon_scale','gasoline','titanium_alloy','titanium_ore',
           'silage_mincer','rubber_parts','diy_nets','glue_tape',
           'gaz_24_broken','kamaz_broken','uaz_452_broken','uaz_469_broken',
           'vaz_2101_broken','zaz_968_broken','zil_130_broken',
           'nailed_box','support_box','weapon_box','can','antelope','ave_maria',
           'sr_delirium','toxigen','bryocarm','catalysis_e']:
    REMOVE.add(i)

# Tools
for i in ['chimney','rodkin','welder','chitin_torch',
           'weapon_repair_kit','transport_repair_kit','vehicle_repair_kit',
           'crane','electric_motor','gasoline_engine','chainsaw']:
    REMOVE.add(i)

# ALL gas masks except filter
for i in ['comfortable_gas_mask','demon_mask','old_faithful_gas_mask',
           'gp_2000_gas_mask','gp_4_gas_mask','gp_5_gas_mask','gp_7_gas_mask',
           'ionica_gas_mask','mm_1_gas_mask','pmg_gas_mask','iron_gas_mask',
           'dust_mask','plague_doctor_s_mask','respirator','homemade_respirator']:
    REMOVE.add(i)

# ALL armor
for i in ['arctic_armor','combined_armor','tactical_armor','steel_armor','leather_armor',
           'highway_armor','iron_armor','smuggler_s_armor','prospector_s_armor',
           'armored_uniform','armorpiercer','bs_4_power_armor','chitin_armor',
           'kevlar_vest','bone_vest','ghost_suit','armor_plate','polar_armor',
           'tank_armor','tester_armor','chemical_suit','ghillie_suit',
           'bulletproof_vest','homemade_bulletproof_vest','ceramic_bulletproof_vest',
           'chinese_bulletproof_vest','army_bulletproof_vest','modern_bulletproof_vest',
           'primitive_bulletproof_vest','progress_bulletproof_vest','t_800_bulletproof_vest']:
    REMOVE.add(i)

# Equipment: no lanterns, clothes, backpacks
for i in ['flashlight_10','flashlight_20','flashlight_30','battery_flashlight',
           'glutton_s_bag','invisibility_cloak',
           'ermak_backpack','refrigerator_backpack','rucksack','medical_backpack',
           'tourist_backpack','butcher_s_backpack',
           'handmade_clothes','tattered_clothes','normal_clothes',
           'hunter_s_garb','master_s_garb','military_uniform',
           'reinforced_uniform','field_uniform']:
    REMOVE.add(i)

# Weapon removes - user specified
for i in ['alphacelone','butterfly_knife','fear','joy','chitin_spear',
           'lotus_of_death','sabre','wolfsbane_1']:
    REMOVE.add(i)

# Weapons to KEEP (everything else in weapons gets removed)
WEAPONS_KEEP = {
    'makarov_handgun_broken','mosin_nagant_rifle_broken','nagant_revolver_broken',
    'pkm_broken','pps_43_broken','ppsh_41_broken','rpk_74_broken',
    'svd_broken','svt_40_broken','tt_33_broken',
    'flint_knife','forged_knife','kitchen_knife',
    'rusted_axe','steel_axe','titanium_axe',
    'steel_knife','titanium_knife',
    'strong_bat','blackjack','shock_bludgeon',
    'flying_spaghetti_monster','witch_s_punch',
}

# Remove all weapons NOT in keep list
for cat in data['categories']:
    if cat['id'] == 'weapons':
        for item in cat['items']:
            if item['id'] not in WEAPONS_KEEP:
                REMOVE.add(item['id'])

# ══════════════════════════════════════════
# NAME FIXES
# ══════════════════════════════════════════
NAME_FIXES = {
    'cranberry': 'Amora',
    'pasta': 'Massa',
    'canned_porridge': 'Mingau Enlatado',
    'rotten_porridge': 'Mingau Podre',
    'blood_mold': 'Mofo Sangrento',
    'black_coal': 'Carvao Preto',
    'vial_of_amine': 'Frasco de "...amina"',
    'stew_meat': 'Carne Ensopada',
    'witch_s_punch': 'Ponche de Bruxa',
    'whiskey': 'Usque',
    'broadleaf_plantain': 'Orelha-de-veado',
    'plank': 'Tabua',
    'scrap_metal': 'Sucata de Metal',
}

# ══════════════════════════════════════════
# WIKILINK FIXES
# ══════════════════════════════════════════
WIKI_FIXES = {
    # Food
    'cooked_rice': 'https://dayr.wiki.gg/wiki/Cooked_rice',
    'fried_potato': 'https://dayr.wiki.gg/wiki/Fried_potato',
    'bio_energy_drink': 'https://dayr.wiki.gg/wiki/Bio-energy_Drink',
    'infected_rusk': 'https://dayr.wiki.gg/wiki/Infected_rusk',
    'gingerbread': 'https://dayr.wiki.gg/wiki/Gingerbread',
    'strawberry_cake': 'https://dayr.wiki.gg/wiki/Strawberry_cake',
    'cold_coffee': 'https://dayr.wiki.gg/wiki/Cold_coffee',
    'hot_coffee': 'https://dayr.wiki.gg/wiki/Hot_coffee',
    'simple_chowder': 'https://dayr.wiki.gg/wiki/Simple_chowder',
    'hearty_chowder': 'https://dayr.wiki.gg/wiki/Hearty_chowder',
    'fried_tainted_meat': 'https://dayr.wiki.gg/wiki/Fried_tainted_meat',
    'fried_mutant_meat': 'https://dayr.wiki.gg/wiki/Fried_mutant_meat',
    'fried_rat_meat': 'https://dayr.wiki.gg/wiki/Fried_rat_meat',
    'canned_beef': 'https://dayr.wiki.gg/wiki/Canned_beef',
    'fried_fatty_meat': 'https://dayr.wiki.gg/wiki/Fried_fatty_meat',
    'stew_meat': 'https://dayr.wiki.gg/wiki/Stew_meat',
    'salted_meat': 'https://dayr.wiki.gg/wiki/Salted_meat',
    'dried_meat': 'https://dayr.wiki.gg/wiki/Dried_meat',
    'cold_tea': 'https://dayr.wiki.gg/wiki/Cold_tea',
    'hot_tea': 'https://dayr.wiki.gg/wiki/Hot_tea',
    'fried_snake': 'https://dayr.wiki.gg/wiki/Fried_snake',
    'energy_drink': 'https://dayr.wiki.gg/wiki/Energy_drink',
    'rice_grains': 'https://dayr.wiki.gg/wiki/Rice_grains',
    'buckwheat_grains': 'https://dayr.wiki.gg/wiki/Buckwheat_grains',
    'rotten_vegetables': 'https://dayr.wiki.gg/wiki/Rotten_vegetables',
    'boiled_condensed_milk': 'https://dayr.wiki.gg/wiki/Boiled_condensed_milk',
    'candy_apple': 'https://dayr.wiki.gg/wiki/Candy_apple',
    'mushroom_pasta': 'https://dayr.wiki.gg/wiki/Mushroom_pasta',
    'fried_egg': 'https://dayr.wiki.gg/wiki/Fried_egg',
    'canned_porridge': 'https://dayr.wiki.gg/wiki/Canned_porridge',
    'rotten_porridge': 'https://dayr.wiki.gg/wiki/Rotten_porridge',
    'fresh_fish': 'https://dayr.wiki.gg/wiki/Fresh_fish',
    'fried_fish': 'https://dayr.wiki.gg/wiki/Fried_fish',
    'rotten_fish': 'https://dayr.wiki.gg/wiki/Rotten_fish',
    'dried_fish': 'https://dayr.wiki.gg/wiki/Dried_fish',
    'canned_pork': 'https://dayr.wiki.gg/wiki/Canned_pork',
    'cabbage_roll': 'https://dayr.wiki.gg/wiki/Cabbage_roll',
    'mushroom_soup': 'https://dayr.wiki.gg/wiki/Mushroom_soup',
    'bowl_of_rice': 'https://dayr.wiki.gg/wiki/Bowl_of_rice',
    'rice_wine': 'https://dayr.wiki.gg/wiki/Rice_wine',
    'red_wine': 'https://dayr.wiki.gg/wiki/Red_wine',
    # Materials
    'diluted_spirits': 'https://dayr.wiki.gg/wiki/Diluted_spirits',
    'car_battery': 'https://dayr.wiki.gg/wiki/Car_battery',
    'broken_car_battery': 'https://dayr.wiki.gg/wiki/Broken_car_battery',
    'mushroom_with_eyes': 'https://dayr.wiki.gg/wiki/Mushroom_with_eyes',
    'strange_mushroom_yellow': 'https://dayr.wiki.gg/wiki/Strange_Mushroom_(Yellow)',
    'strange_mushroom_light_blue': 'https://dayr.wiki.gg/wiki/Strange_Mushroom_(Light_Blue)',
    'strange_mushroom_blue': 'https://dayr.wiki.gg/wiki/Strange_Mushroom_(Blue)',
    'strange_mushroom_white': 'https://dayr.wiki.gg/wiki/Strange_Mushroom_(White)',
    'strange_mushroom_black': 'https://dayr.wiki.gg/wiki/Strange_Mushroom_(Black)',
    'strange_mushroom_green': 'https://dayr.wiki.gg/wiki/Strange_Mushroom_(Green)',
    'strange_mushroom_red': 'https://dayr.wiki.gg/wiki/Strange_Mushroom_(Red)',
    'strange_mushroom_violet': 'https://dayr.wiki.gg/wiki/Strange_Mushroom_(Violet)',
    'radioactive_mushroom': 'https://dayr.wiki.gg/wiki/Radioactive_mushroom',
    'bone_glue': 'https://dayr.wiki.gg/wiki/Bone_glue',
    'c_3_cologne': 'https://dayr.wiki.gg/wiki/C-3_Cologne',
    'iron_pipe': 'https://dayr.wiki.gg/wiki/Iron_pipe',
    'acid_gland': 'https://dayr.wiki.gg/wiki/Acid_gland',
    'ir_190': 'https://dayr.wiki.gg/wiki/IR-190',
    'tanning_mixture': 'https://dayr.wiki.gg/wiki/Tanning_mixture',
    'fresh_bones': 'https://dayr.wiki.gg/wiki/Fresh_bones',
    'iron_pot': 'https://dayr.wiki.gg/wiki/Iron_pot',
    'steel_pot': 'https://dayr.wiki.gg/wiki/Steel_pot',
    'titanium_pot': 'https://dayr.wiki.gg/wiki/Titanium_pot',
    'assault_rifle_parts': 'https://dayr.wiki.gg/wiki/Assault_rifle_parts',
    'machine_gun_parts': 'https://dayr.wiki.gg/wiki/Machine_gun_parts',
    'pistol_parts': 'https://dayr.wiki.gg/wiki/Pistol_parts',
    'revolver_parts': 'https://dayr.wiki.gg/wiki/Revolver_parts',
    'rifle_parts': 'https://dayr.wiki.gg/wiki/Rifle_parts',
    'motorcycle_spare_parts': 'https://dayr.wiki.gg/wiki/Motorcycle_spare_parts',
    'king_of_jokers': 'https://dayr.wiki.gg/wiki/King_of_Jokers',
    'scrap_metal': 'https://dayr.wiki.gg/wiki/Scrap_metal',
    'fire_brick': 'https://dayr.wiki.gg/wiki/Fire_brick',
    'raw_fatback': 'https://dayr.wiki.gg/wiki/Raw_fatback',
    'black_coal': 'https://dayr.wiki.gg/wiki/Black_coal',
    # Medicine
    'bye_bye_rad': 'https://dayr.wiki.gg/wiki/Bye-Bye_Rad',
    'activated_charcoal': 'https://dayr.wiki.gg/wiki/Activated_charcoal',
    'lidiacide_34': 'https://dayr.wiki.gg/wiki/Lidiacide-34',
    'comcon_3_paste': 'https://dayr.wiki.gg/wiki/ComCon-3_Paste',
    # Ammo
    'lead_bullet': 'https://dayr.wiki.gg/wiki/Lead_bullet',
    'handmade_cartridge': 'https://dayr.wiki.gg/wiki/Handmade_cartridge',
    'assault_rifle_shell': 'https://dayr.wiki.gg/wiki/Assault_rifle_shell',
    'pistol_shell': 'https://dayr.wiki.gg/wiki/Pistol_shell',
    'revolver_shell': 'https://dayr.wiki.gg/wiki/Revolver_shell',
    'rifle_shell': 'https://dayr.wiki.gg/wiki/Rifle_shell',
    'plastic_explosives': 'https://dayr.wiki.gg/wiki/Plastic_explosives',
    'handmade_rocket': 'https://dayr.wiki.gg/wiki/Handmade_rocket',
    'crossbow_bolt': 'https://dayr.wiki.gg/wiki/Crossbow_bolt',
    'crossbow_bolt_poison': 'https://dayr.wiki.gg/wiki/Crossbow_bolt_(poison)',
    # Weapons
    'flint_knife': 'https://dayr.wiki.gg/wiki/Flint_knife',
    'forged_knife': 'https://dayr.wiki.gg/wiki/Forged_knife',
    'steel_axe': 'https://dayr.wiki.gg/wiki/Steel_axe',
    'rusted_axe': 'https://dayr.wiki.gg/wiki/Rusted_axe',
    'flying_spaghetti_monster': 'https://dayr.wiki.gg/wiki/Flying_spaghetti_monster',
    'nagant_revolver_broken': 'https://dayr.wiki.gg/wiki/Nagant_Revolver_(Broken)',
    'witch_s_punch': "https://dayr.wiki.gg/wiki/Witch's_punch",
    # Tools
    'handmade_needle': 'https://dayr.wiki.gg/wiki/Handmade_needle',
    'steel_needle': 'https://dayr.wiki.gg/wiki/Steel_needle',
    'rusted_needle': 'https://dayr.wiki.gg/wiki/Rusted_needle',
    'chemistry_set': 'https://dayr.wiki.gg/wiki/Chemistry_set',
    'steel_shovel': 'https://dayr.wiki.gg/wiki/Steel_shovel',
    'rusted_shovel': 'https://dayr.wiki.gg/wiki/Rusted_shovel',
    'steel_crowbar': 'https://dayr.wiki.gg/wiki/Steel_crowbar',
    'titanium_crowbar': 'https://dayr.wiki.gg/wiki/Titanium_crowbar',
    'rusted_hacksaw': 'https://dayr.wiki.gg/wiki/Rusted_hacksaw',
    'vial_of_amine': "https://dayr.wiki.gg/wiki/Vial_of_\"...amine\"",
    'titanium_shovel': 'https://dayr.wiki.gg/wiki/Titanium_shovel',
}

# Seed wikiLinks: format is https://dayr.wiki.gg/wiki/{seedname}_seeds
SEED_LINKS = {
    'potato_seeds': 'Potato_seeds',
    'strawberry_seed': 'Strawberry_seeds',
    'pumpkin_seeds': 'Pumpkin_seeds',
    'apple_seeds': 'Apple_seeds',
    'corn_seeds': 'Corn_seeds',
    'tangerine_seeds': 'Tangerine_seeds',
    'wheat_seeds': 'Wheat_seeds',
    'vegetable_seeds': 'Vegetable_seeds',
}
for sid, stitle in SEED_LINKS.items():
    WIKI_FIXES[sid] = f'https://dayr.wiki.gg/wiki/{stitle}'

# ══════════════════════════════════════════
# APPLY ALL CHANGES
# ══════════════════════════════════════════
removed_count = 0
name_fix_count = 0
link_fix_count = 0

# Remove categories that will be empty or have 1 item
cats_to_remove = set()
cat_item_counts = {}
for cat in data['categories']:
    after = [it for it in cat['items'] if it['id'] not in REMOVE]
    cat_item_counts[cat['id']] = len(after)

# gas_masks will only have filter -> merge into materials
# armor will be empty -> remove
# equipment will only have lighter, kettlebell -> merge into tools

for cat in data['categories']:
    before = len(cat['items'])
    cat['items'] = [it for it in cat['items'] if it['id'] not in REMOVE]
    removed_count += before - len(cat['items'])

    for item in cat['items']:
        # Fix names
        if item['id'] in NAME_FIXES:
            old = item['name']
            item['name'] = NAME_FIXES[item['id']]
            name_fix_count += 1
            if old != item['name']:
                print(f'  NAME: {item["id"]}: "{old}" -> "{item["name"]}"')

        # Fix wikiLinks
        if item['id'] in WIKI_FIXES:
            item['wikiLink'] = WIKI_FIXES[item['id']]
            link_fix_count += 1

# Move gas_mask_filter to materials
for cat in data['categories']:
    if cat['id'] == 'gas_masks':
        filter_item = None
        for i, item in enumerate(cat['items']):
            if item['id'] == 'gas_mask_filter':
                filter_item = cat['items'].pop(i)
                break
        if filter_item:
            for mc in data['categories']:
                if mc['id'] == 'materials':
                    mc['items'].append(filter_item)
                    print(f'  MOVED: gas_mask_filter -> materials')
                    break

# Move lighter, kettlebell from equipment to tools
equip_keep = ['lighter', 'kettlebell']
for cat in data['categories']:
    if cat['id'] == 'equipment':
        to_move = [it for it in cat['items'] if it['id'] in equip_keep]
        cat['items'] = [it for it in cat['items'] if it['id'] not in equip_keep]
        for mc in data['categories']:
            if mc['id'] == 'tools':
                mc['items'].extend(to_move)
                for it in to_move:
                    print(f'  MOVED: {it["id"]} -> tools')
                break

# Remove empty categories
remaining_cats = []
for cat in data['categories']:
    if len(cat['items']) > 0:
        remaining_cats.append(cat)
    else:
        print(f'  REMOVED EMPTY CATEGORY: {cat["id"]}')
data['categories'] = remaining_cats

# Update metadata
data['metadata']['version'] = '2026-08-06-v3'
data['metadata']['last_updated'] = '2026-08-06'

total = sum(len(c['items']) for c in data['categories'])
print(f'\n=== SUMMARY ===')
print(f'Removed: {removed_count} items')
print(f'Name fixes: {name_fix_count}')
print(f'WikiLink fixes: {link_fix_count}')
print(f'Total remaining: {total} items')
for cat in data['categories']:
    print(f'  {cat["id"]:15s} ({cat["name"]}): {len(cat["items"])} items')

with open(PRICES_PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
print(f'\nSaved {PRICES_PATH}')

# Clean up orphan images
orphan_count = 0
for rid in REMOVE:
    img_path = os.path.join(IMG_DIR, f'{rid}.png')
    if os.path.exists(img_path):
        os.remove(img_path)
        orphan_count += 1
print(f'Removed {orphan_count} orphan images')
