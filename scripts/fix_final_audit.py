#!/usr/bin/env python3
"""
Final audit and fix:
1. Remaining English names
2. Wrong category placements
3. Check tradeability
"""
import json, re
from pathlib import Path

PRICES_PATH = Path('/home/z/my-project/src/data/prices.json')

with open(PRICES_PATH) as f:
    data = json.load(f)

# Build lookups
item_map = {}  # id -> item dict
cat_items = {}  # cat_id -> [items]
for cat in data['categories']:
    cat_items[cat['id']] = cat['items']
    for item in cat['items']:
        item_map[item['id']] = item
        item['_cat_id'] = cat['id']

# 1. Fix remaining English names
MORE_TRANSLATIONS = {
    'potato': 'Batata',
    'pumpkin': 'Abobora',
    'svd_broken': 'SVD (Quebrado)',
}

# 2. Fix typos
TYPOS = {
    'battery_flashlight': 'Lanterna com Bateria',  # was "Lanterha"
}

# 3. Fix wrong translations
WRONG_TRANSLATIONS = {
    'double_barrel': 'Escopeta de Cano Duplo',  # was "Estopa" (wadding)
}

print('=== CORRIGINDO NOMES ===')
for item_id, new_name in {**MORE_TRANSLATIONS, **TYPOS, **WRONG_TRANSLATIONS}.items():
    if item_id in item_map:
        old = item_map[item_id]['name']
        if old != new_name:
            item_map[item_id]['name'] = new_name
            print(f'  {item_id}: "{old}" -> "{new_name}"')

# 4. Items in wrong categories - fix
# Bulletproof vests are in ammo but should be in armor
BP_VESTS = [
    'bulletproof_vest', 'homemade_bulletproof_vest', 'ceramic_bulletproof_vest',
    'chinese_bulletproof_vest', 'army_bulletproof_vest', 'modern_bulletproof_vest',
    'primitive_bulletproof_vest', 'progress_bulletproof_vest', 't_800_bulletproof_vest'
]

# Items in weapons that should be elsewhere
MISPLACED = {
    'broken_car_battery': 'materials',
    'car_battery': 'materials',
    'battery_flashlight': 'equipment',
    'bowl_of_rice': 'food',
    'nuclear_battery': 'materials',
    'pistol_parts': 'materials',
    'revolver_parts': 'materials',
    'rifle_parts': 'materials',
    'assault_rifle_parts': 'materials',
    'machine_gun_parts': 'materials',
}

print('\n=== CORRIGINDO CATEGORIAS ===')

# Move bulletproof vests from ammo to armor
ammo_items = cat_items.get('ammo', [])
armor_items = cat_items.get('armor', [])

for vest_id in BP_VESTS:
    for i, item in enumerate(ammo_items):
        if item['id'] == vest_id:
            ammo_items.pop(i)
            armor_items.append(item)
            item['_cat_id'] = 'armor'
            print(f'  {vest_id}: ammo -> armor')
            break

# Move misplaced items from weapons to correct categories
weapons_items = cat_items.get('weapons', [])

for item_id, target_cat in MISPLACED.items():
    for cat in data['categories']:
        for i, item in enumerate(cat['items']):
            if item['id'] == item_id and cat['id'] != target_cat:
                cat['items'].pop(i)
                cat_items[target_cat].append(item)
                item['_cat_id'] = target_cat
                print(f'  {item_id}: {cat["id"]} -> {target_cat}')
                break

# 5. Check for potentially non-tradeable items
print('\n=== VERIFICACAO DE TRANSFERIBILIDADE ===')

# In Day R, these items are typically NOT tradeable between players:
NON_TRADEABLE = []

# Mining permits are character-bound quest items
if 'mining_permit' in item_map:
    NON_TRADEABLE.append(('mining_permit', 'Licenca de Mineracao', 'Item de missao - vinculado ao personagem'))

# Broken vehicles - actually these ARE tradeable in Day R
# Event items - these ARE tradeable

if NON_TRADEABLE:
    print(f'Itens NAO transferiveis encontrados ({len(NON_TRADEABLE)}):')
    for item_id, name, reason in NON_TRADEABLE:
        print(f'  REMOVER: {item_id} ({name}) - {reason}')
    
    # Remove them from categories
    for item_id, _, _ in NON_TRADEABLE:
        for cat in data['categories']:
            cat['items'] = [i for i in cat['items'] if i['id'] != item_id]
    
    # Also remove orphan images
    import os
    for item_id, _, _ in NON_TRADEABLE:
        img_path = Path(f'/home/z/my-project/public/items/{item_id}.png')
        if img_path.exists():
            img_path.unlink()
            print(f'  Imagem removida: {img_path}')
else:
    print('  Todos os itens parecem ser transferiveis.')

# Save
with open(PRICES_PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

# Final count
total = sum(len(cat['items']) for cat in data['categories'])
print(f'\nTotal de itens final: {total}')
for cat in data['categories']:
    print(f'  {cat["name"]}: {len(cat["items"])} itens')
