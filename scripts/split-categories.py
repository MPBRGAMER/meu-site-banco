import json, copy, os, re

SRC = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'prices.json')
DST = SRC

with open(SRC, 'r', encoding='utf-8') as f:
    data = json.load(f)

old_cats = data['categories']
all_ids = set()
for c in old_cats:
    for item in c['items']:
        all_ids.add(item['id'])

# ─── Use ITEM ID (not name) for matching to avoid false positives ──
def id_in(item, keywords):
    s = item['id'].lower()
    return any(k in s for k in keywords)

def name_in(item, keywords):
    s = item['name'].lower()
    return any(re.search(r'\\b' + re.escape(k) + r'\\b', s) for k in keywords)

# ─── SPLIT food (151) → Comida + Bebidas + Ingredientes + Cultivo ─────
food_items = [c for c in old_cats if c['id'] == 'food'][0]['items']

# EXPLICIT: items that go to Cultivo (raw crops/farming products)
cultivo_from_food_ids = {
    'wheat', 'corn', 'potato', 'pumpkin', 'apple', 'strawberry',
    'tangerine', 'cranberry', 'vegetables', 'rotten_vegetables',
    'buckwheat_grains', 'rice_grains', 'broadleaf_plantain', 'moss', 'nettle',
}

# EXPLICIT: items that go to Bebidas (drinks)
bebidas_ids = {
    'canned_water', 'clean_water', 'dirty_water', 'toxic_water',
    'moonshine', 'coffee', 'cold_coffee', 'hot_coffee',
    'cold_tea', 'hot_tea', 'dandelion_tea', 'tea',
    'champagne', 'homemade_wine', 'red_wine', 'rice_wine', 'mulled_wine',
    'vodka', 'whiskey', 'trophy_cognac', 'pepsi',
    'energy_drink', 'bio_energy_drink', 'chinese_energy_drink',
    'spooky_energy_drink', 'knock_off_energy_drink', 'holiday_energy_drink',
    'smuggled_energy_drink', 'kvass', 'beetle_juice', 'apple_cordial',
}

# EXPLICIT: items that go to Ingredientes (raw cooking materials)
ingredientes_ids = {
    'flour', 'sugar', 'salt', 'saltpeter', 'egg', 'honey', 'jam',
    'fat', 'raw_fatback', 'smoked_fatback', 'spice',
    'milk', 'condensed_milk', 'boiled_condensed_milk',
    'fatty_meat', 'dried_meat', 'salted_meat', 'fresh_fish',
    'salted_fish', 'dried_fish', 'infected_dried_fish',
}

bebidas_items = []
comida_items = []
ingredientes_items = []
cultivo_from_food = []

for item in food_items:
    iid = item['id']
    if iid in cultivo_from_food_ids:
        cultivo_from_food.append(item)
    elif iid in bebidas_ids:
        bebidas_items.append(item)
    elif iid in ingredientes_ids:
        ingredientes_items.append(item)
    else:
        comida_items.append(item)

# ─── seeds_herbs (8) → all go to Cultivo ────────────────────────────
seeds_items = [c for c in old_cats if c['id'] == 'seeds_herbs'][0]['items']

# ─── SPLIT materials (89) → Materiais + Componentes + Cogumelos ──────
materials_items = [c for c in old_cats if c['id'] == 'materials'][0]['items']

cogumelos_ids = {
    'mushroom_with_eyes', 'strange_mushroom_black', 'strange_mushroom_blue',
    'strange_mushroom_green', 'strange_mushroom_light_blue',
    'strange_mushroom_red', 'strange_mushroom_violet',
    'strange_mushroom_white', 'strange_mushroom_yellow',
    'radioactive_mushroom', 'amanita', 'blood_mold',
}

componentes_ids = {
    'electrical_cable', 'wire', 'spark_plug', 'motorcycle_spare_parts',
    'spare_weapon_parts', 'car_battery', 'broken_car_battery',
    'pistol_parts', 'revolver_parts', 'rifle_parts',
    'assault_rifle_parts', 'machine_gun_parts', 'gas_mask_filter',
    'iron_pot', 'saucepan', 'rusted_saucepan', 'steel_pot', 'titanium_pot',
}

# Items from materials that belong in Quimicos (chemical items misplaced in materials)
quimicos_from_mat_ids = {
    'acid_gland', 'vial_of_amine', 'stearin', 'sulfur', 'diluted_spirits',
}

# Items from materials that belong elsewhere
medicamentos_from_mat_ids = {
    'first_aid_kit', 'ir_190',
}

cultivo_from_mat_ids = {
    'wheat',
}

cogumelos_items = [i for i in materials_items if i['id'] in cogumelos_ids]
componentes_items = [i for i in materials_items if i['id'] in componentes_ids]
quimicos_from_mat = [i for i in materials_items if i['id'] in quimicos_from_mat_ids]
medicamentos_from_mat = [i for i in materials_items if i['id'] in medicamentos_from_mat_ids]
cultivo_from_mat = [i for i in materials_items if i['id'] in cultivo_from_mat_ids]
exclude_from_materiais = cogumelos_ids | componentes_ids | quimicos_from_mat_ids | medicamentos_from_mat_ids | cultivo_from_mat_ids
materiais_items = [i for i in materials_items if i['id'] not in exclude_from_materiais]

# Move chanterelle from food/comida to Cogumelos
chanterelle_from_comida = [i for i in comida_items if i['id'] in ('chanterelle', 'roasted_chanterelle')]
comida_items = [i for i in comida_items if i['id'] not in ('chanterelle', 'roasted_chanterelle')]
cogumelos_items.extend(chanterelle_from_comida)

# Move acidoemitter back to quimicos from medicine (it's a chemical emitter)
medicine_items_all = [c for c in old_cats if c['id'] == 'medicine'][0]['items']
acidoemitter = [i for i in medicine_items_all if i['id'] == 'acidoemitter']

# ─── SPLIT medicine (21) → Medicamentos + Quimicos ──────────────────
quimicos_ids = {
    'acidoemitter', 'alcohol', 'sulfur', 'sulfuric_acid', 'poison',
    'caustic_distillate', 'chlorcystamine', 'lidiacide_34',
    'acid_gland', 'vial_of_amine', 'stearin',
}

quimicos_items = [i for i in medicine_items_all if i['id'] in quimicos_ids]
medicamentos_items = [i for i in medicine_items_all if i['id'] not in quimicos_ids]
quimicos_items.extend(quimicos_from_mat)
medicamentos_items.extend(medicamentos_from_mat)

# ─── SPLIT ammo (21) → Municoes + Explosivos ────────────────────────
ammo_items = [c for c in old_cats if c['id'] == 'ammo'][0]['items']

explosivos_ids = {'plastic_explosives', 'handmade_rocket', 'gunpowder', 'termite'}
explosivos_items = [i for i in ammo_items if i['id'] in explosivos_ids]
municoes_items = [i for i in ammo_items if i['id'] not in explosivos_ids]

# ─── Keep weapons, tools ─────────────────────────────────────────────
weapons_items = [c for c in old_cats if c['id'] == 'weapons'][0]['items']
tools_items = [c for c in old_cats if c['id'] == 'tools'][0]['items']

# ─── ASSEMBLE Cultivo ───────────────────────────────────────────────
cultivo_items = seeds_items + cultivo_from_food + cultivo_from_mat

# ─── Verify ──────────────────────────────────────────────────────────
new_categories = [
    { 'id': 'cultivo', 'name': 'Cultivo', 'items': cultivo_items },
    { 'id': 'comida', 'name': 'Comida', 'items': comida_items },
    { 'id': 'bebidas', 'name': 'Bebidas', 'items': bebidas_items },
    { 'id': 'ingredientes', 'name': 'Ingredientes', 'items': ingredientes_items },
    { 'id': 'materiais', 'name': 'Materiais', 'items': materiais_items },
    { 'id': 'componentes', 'name': 'Componentes', 'items': componentes_items },
    { 'id': 'medicamentos', 'name': 'Medicamentos', 'items': medicamentos_items },
    { 'id': 'quimicos', 'name': 'Quimicos', 'items': quimicos_items },
    { 'id': 'municoes', 'name': 'Municoes', 'items': municoes_items },
    { 'id': 'explosivos', 'name': 'Explosivos', 'items': explosivos_items },
    { 'id': 'cogumelos', 'name': 'Cogumelos', 'items': cogumelos_items },
    { 'id': 'armas', 'name': 'Armas', 'items': weapons_items },
    { 'id': 'ferramentas', 'name': 'Ferramentas', 'items': tools_items },
]

total_items = sum(len(c['items']) for c in new_categories)
all_new_ids = []
for c in new_categories:
    for i in c['items']:
        all_new_ids.append(i['id'])

print(f'New total: {total_items} (original: {len(all_ids)})')
print(f'All IDs match: {sorted(all_new_ids) == sorted(all_ids)}')
missing = set(all_ids) - set(all_new_ids)
extra = set(all_new_ids) - set(all_ids)
if missing: print(f'MISSING: {missing}')
if extra: print(f'EXTRA: {extra}')

print('\n=== NEW CATEGORIES ===')
for c in new_categories:
    print(f'  {c["id"]:20s} | {c["name"]:20s} | {len(c["items"]):4d} itens')

if total_items == len(all_ids) and not missing and not extra:
    data['categories'] = new_categories
    data['metadata']['version'] = '2026-08-31-v2-categories-split'
    data['metadata']['note'] = 'Categorias separadas + Cultivo adicionado. Itens e imagens do wiki oficial (dayr.wiki.gg). Nomes em PT-BR.'
    with open(DST, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f'\nWritten to {DST}')
else:
    print('\nERROR: Item count mismatch! Not writing.')
