import json, re, os

# Load existing prices
with open('/home/z/my-project/src/data/prices.json') as f:
    prices = json.load(f)

# Load wiki items
with open('/home/z/my-project/scripts/wiki-all-items.json') as f:
    wiki = json.load(f)

# Existing items map (id -> item data)
existing_map = {}
existing_names_lower = set()
for cat in prices['categories']:
    for item in cat['items']:
        existing_map[item['id']] = item
        existing_names_lower.add(item['name'].lower())

# Collect all wiki item names
to_id = lambda name: re.sub(r'[^a-z0-9]', '_', name.lower()).strip('_')

# Skip non-item pages
skip_words = ['mechanic', 'perk', 'quest', 'event ', 'location', 'camp ', 'trauma', 'disease', 'weather', 'enemy', 'stat ', 'tutorial', 'guide', 'achievement', 'disaster', 'biome', 'region', 'faction', 'vehicle', 'trader', 'building', 'workstation', 'crafting', 'cooking', 'page', 'category', 'template', 'module', 'gadget', 'main ', 'navigation', 'search', 'special', 'recent', 'help', 'community', 'project', 'portal', 'wikipedia', 'file', 'image', 'forum', 'thread', 'message wall', 'blog', 'user blog', 'user ', 'talk', 'about', 'contact', 'policy', 'copyright', 'general disclaimer', 'privacy', 'terms', 'cookie', 'accessibility', 'account', 'log in', 'create account', 'not logged in', 'contributions', 'preferences', 'log out', 'read', 'edit', 'view history', 'watch', 'add topic', 'reply', 'end of', 'contents', 'hide', 'show', 'move', 'protect', 'delete', 'undelete', 'what links', 'related changes', 'special page', 'printable', 'permanent link', 'page information', 'cite this page', 'url shortener', 'qr code', 'article', 'navigation menu', 'namespaces', 'variants', 'views', 'more', 'tools', 'in other projects', 'languages', 'search', 'go', 'navigation', 'search', 'power', 'screenshot', 'icon', 'logo', 'banner', 'notification', 'toolbar', 'sidebar', 'header', 'footer', 'menu', 'tab', 'button', 'link', 'external', 'internal', 'redlink', 'broken', 'redirect', 'shortcut', 'access key']

# Categorize wiki items
new_by_category = {}

def should_include(name):
    lower = name.lower()
    if lower in existing_names_lower:
        return False
    for sw in skip_words:
        if sw in lower:
            return False
    # Skip clearly non-item pages
    if lower.startswith('day r') or lower.startswith('all items') or lower.startswith('food/'):
        return False
    if lower in ['dayr', 'items', 'all items', 'combat mechanics', 'perks', 'main character', 'dugout', 'moroz\'s terem', 'inventory health', 'inventory survival']:
        return False
    return True

def guess_category(name, wiki_cat):
    lower = name.lower()
    # Determine the best category based on wiki category and name
    if wiki_cat in ['food']:
        if any(w in lower for w in ['seed', 'wheat', 'corn', 'potato', 'pumpkin', 'strawberry', 'cranberry', 'tangerine', 'apple', 'vegetable', 'dandelion', 'moss', 'grass', 'nettle', 'serrate', 'toothgrass', 'bamboo']):
            return 'herbs'
        if any(w in lower for w in ['tea', 'coffee', 'kvass', 'kompot', 'soda', 'pepsi', 'drink', 'juice', 'cordial', 'liqueur', 'wine', 'vodka', 'whiskey', 'champagne', 'moonshine', 'spirits', 'punch', 'cognac', 'energy']):
            return 'food'
        return 'food'
    if wiki_cat in ['material']:
        if any(w in lower for w in ['ammo', 'shell', 'cartridge', 'bullet', 'gunpowder', 'primer', 'explosive', 'grenade', 'molotov', 'bolt', 'mine']):
            return 'ammo'
        if any(w in lower for w in ['bandage', 'ointment', 'medicine', 'pill', 'antibiot', 'antidote', 'charcoal', 'alcohol', 'acid', 'potion', 'injector', 'serum', 'stimulator', 'tourniquet', 'splint', 'briocarmo', 'metocaine', 'lidia', 'chlorcist', 'antirad', 'detox', 'anesthetic', 'adsorbent', 'lidiacida', 'ir190', 'alphacelone']):
            return 'medicine'
        if any(w in lower for w in ['meat', 'fish', 'fat', 'bacon', 'caviar', 'lymph', 'gland', 'skin', 'leather', 'chitin', 'bone', 'egg', 'milk', 'honey', 'wax', 'salo']):
            return 'animal_products'
        return 'components'
    if wiki_cat in ['medicine']:
        return 'medicine'
    if wiki_cat in ['weapons']:
        if any(w in lower for w in ['ammo', 'shell', 'cartridge', 'bullet', 'gunpowder', 'primer', 'explosive', 'grenade', 'molotov', 'bolt', 'mine', 'magazine', 'clip']):
            return 'ammo'
        return 'weapons'
    if wiki_cat in ['equipment']:
        return 'equipment'
    if wiki_cat in ['tools']:
        return 'components'
    if wiki_cat in ['seeds']:
        return 'herbs'
    if wiki_cat in ['mushrooms']:
        return 'herbs'
    if wiki_cat in ['fishing']:
        return 'animal_products'
    if wiki_cat in ['fire']:
        return 'components'
    if wiki_cat in ['gas_mask']:
        return 'equipment'
    if wiki_cat in ['constructions']:
        return 'components'
    return 'components'

# Category emoji map for new categories
cat_emoji_map = {
    'food': '🍖',
    'herbs': '🌿', 
    'components': '⚙️',
    'medicine': '💊',
    'ammo': '🔫',
    'animal_products': '🦴',
    'weapons': '⚔️',
    'equipment': '👕',
}

# Process wiki items
for wiki_cat, items in wiki.items():
    for name in items:
        if not should_include(name):
            continue
        cat = guess_category(name, wiki_cat)
        if cat not in new_by_category:
            new_by_category[cat] = []
        item_id = to_id(name)
        if item_id in existing_map:
            continue
        new_by_category[cat].append({
            'id': item_id,
            'name': name,
            'steel': '?:?',
            'cement': '?:?',
            'rarity': 'common',
            'demand': 'medium',
            'notes': 'Preco pendente - reporte para ajudar!'
        })

# Now rebuild the full prices.json
category_order = ['food', 'herbs', 'components', 'medicine', 'ammo', 'animal_products', 'weapons', 'equipment']
category_names = {
    'food': '🍖 Comida, Bebidas e Ingredientes',
    'herbs': '🌿 Ervas, Sementes e Cogumelos',
    'components': '⚙️ Componentes e Materiais',
    'medicine': '💊 Medicamentos e Quimicos',
    'ammo': '🔫 Municoes e Explosivos',
    'animal_products': '🦴 Produtos Animais',
    'weapons': '⚔️ Armas',
    'equipment': '👕 Equipamentos e Armaduras',
}

# Build final categories
final_categories = []
for cat_id in category_order:
    cat_name = category_names.get(cat_id, cat_id)
    # Get existing items in this category
    existing_items = []
    for cat in prices['categories']:
        if cat['id'] == cat_id:
            existing_items = cat['items']
            break
    
    # Get new items for this category
    new_items = new_by_category.get(cat_id, [])
    
    # Combine: existing items first, then new ones
    all_items = existing_items + new_items
    
    if all_items:
        final_categories.append({
            'id': cat_id,
            'name': cat_name,
            'items': all_items
        })

# Keep any categories not in our order that existed before
existing_cat_ids = set(c['id'] for c in prices['categories'])
for cat in prices['categories']:
    if cat['id'] not in category_order:
        final_categories.append(cat)

result = {
    'metadata': {
        'version': '2026-08-05',
        'game_version': 'v.827+',
        'last_updated': '2026-08-05',
        'exchange_rate': '1 Aço ($) = 2 Cimentos (€)',
        'note': 'Preços baseados em pesquisa de comunidades (Reddit, Discord, Facebook, Foruns) - Mercado entre players. Itens com ?:? precisam de preços reportados pela comunidade.'
    },
    'categories': final_categories
}

# Stats
total = sum(len(c['items']) for c in final_categories)
with_price = sum(1 for c in final_categories for i in c['items'] if i['steel'] != '?:?')
without_price = total - with_price
print(f'Total items: {total}')
print(f'With prices: {with_price}')
print(f'Without prices (need reports): {without_price}')
for c in final_categories:
    wp = sum(1 for i in c['items'] if i['steel'] != '?:?')
    print(f'  {c["name"]}: {len(c["items"])} items ({wp} with prices)')

with open('/home/z/my-project/src/data/prices.json', 'w') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print(f'\nSaved to prices.json')
