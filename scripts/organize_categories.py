import json

with open('/home/z/my-project/src/data/prices.json', 'r') as f:
    data = json.load(f)

# Order of importance for a survival game economy
importance_order = [
    'armas',         # Weapons - most valuable
    'municoes',      # Ammo - essential
    'explosivos',    # Explosives - rare/valuable
    'medicamentos',  # Medicine - essential
    'comida',        # Food - essential
    'bebidas',       # Drinks - essential
    'ingredientes',  # Ingredients - cooking/crafting
    'materiais',     # Materials - crafting
    'componentes',   # Components - crafting
    'ferramentas',   # Tools - useful
    'quimicos',      # Chemicals - crafting
    'cogumelos',     # Mushrooms - foraging
    'cultivo',       # Crops - farming
    'sementes',      # Seeds - farming
    'ervas',         # Herbs - foraging
]

# Sort categories by importance order
cat_map = {c['id']: c for c in data['categories']}
sorted_categories = []
for cat_id in importance_order:
    if cat_id in cat_map:
        cat = cat_map[cat_id]
        # Sort items alphabetically by name
        cat['items'] = sorted(cat['items'], key=lambda i: i['name'].lower())
        sorted_categories.append(cat)

# Add any categories not in the importance list
existing_ids = set(importance_order)
for c in data['categories']:
    if c['id'] not in existing_ids:
        c['items'] = sorted(c['items'], key=lambda i: i['name'].lower())
        sorted_categories.append(c)

data['categories'] = sorted_categories
data['metadata']['version'] = '2026-08-31-v4-ordered'
data['metadata']['note'] = 'Categorias por importancia + itens em ordem alfabetica. Itens e imagens do wiki oficial (dayr.wiki.gg). Nomes em PT-BR.'

with open('/home/z/my-project/src/data/prices.json', 'w') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

# Verify
for c in data['categories']:
    print(f'{c["id"]:15s} -> {c["name"]:20s} ({len(c["items"]):2d} itens)')
    for i in c['items'][:3]:
        print(f'  {i["name"]}')
    if len(c['items']) > 3:
        print(f'  ... +{len(c["items"])-3} mais')
    print()
