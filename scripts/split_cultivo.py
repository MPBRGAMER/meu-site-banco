import json

with open('/home/z/my-project/src/data/prices.json', 'r') as f:
    data = json.load(f)

# Find the cultivo category and split it
new_categories = []
sementes_ids = {'potato_seeds', 'strawberry_seed', 'pumpkin_seeds', 'apple_seeds', 'corn_seeds', 'tangerine_seeds', 'wheat_seeds', 'vegetable_seeds'}
ervas_ids = {'moss', 'nettle', 'broadleaf_plantain'}

for cat in data['categories']:
    if cat['id'] == 'cultivo':
        sementes_items = [i for i in cat['items'] if i['id'] in sementes_ids]
        ervas_items = [i for i in cat['items'] if i['id'] in ervas_ids]
        cultivo_items = [i for i in cat['items'] if i['id'] not in sementes_ids and i['id'] not in ervas_ids]

        new_categories.append({
            'id': 'sementes',
            'name': 'Sementes',
            'items': sementes_items
        })
        new_categories.append({
            'id': 'ervas',
            'name': 'Ervas',
            'items': ervas_items
        })
        new_categories.append({
            'id': 'cultivo',
            'name': 'Cultivo',
            'items': cultivo_items
        })
    else:
        new_categories.append(cat)

data['categories'] = new_categories
data['metadata']['version'] = '2026-08-31-v3-sementes-ervas-cultivo-split'
data['metadata']['note'] = 'Sementes, Ervas e Cultivo separados. Cogumelos ja existia. Itens e imagens do wiki oficial (dayr.wiki.gg). Nomes em PT-BR.'

with open('/home/z/my-project/src/data/prices.json', 'w') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

# Verify
for c in data['categories'][:5]:
    print(f'{c["id"]} -> {c["name"]} ({len(c["items"])} items)')
print(f'... total categories: {len(data["categories"])}')
