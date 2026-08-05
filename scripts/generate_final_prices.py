#!/usr/bin/env python3
"""
Gera o prices.json final a partir dos resultados do wiki + traducoes PT-BR.
Mantem precos do JSON antigo quando disponiveis.
"""
import json, re, os

# Carregar resultados do wiki
with open("/home/z/my-project/scripts/wiki_results.json") as f:
    wiki_results = json.load(f)

# Carregar precos antigos (para manter precos conhecidos)
try:
    with open("/home/z/my-project/src/data/prices_old.json") as f:
        old_data = json.load(f)
    old_prices = {}
    for cat in old_data.get("categories", []):
        for item in cat["items"]:
            old_prices[item["id"]] = item
except:
    old_prices = {}

# Se ainda nao tem backup, usar o atual
if not old_prices:
    try:
        with open("/home/z/my-project/src/data/prices.json") as f:
            old_data = json.load(f)
        for cat in old_data.get("categories", []):
            for item in cat["items"]:
                old_prices[item["id"]] = item
    except:
        pass

# Mapeamento de categoria do wiki -> nosso ID de categoria
WIKI_CATEGORIES = {
    "Food": {"id": "food", "name": "Comida, Bebidas e Ingredientes"},
    "Seeds": {"id": "seeds_herbs", "name": "Sementes, Ervas e Cogumelos"},
    "Material": {"id": "materials", "name": "Materiais e Componentes"},
    "Medicine": {"id": "medicine", "name": "Medicamentos e Quimicos"},
    "Ammunition": {"id": "ammo", "name": "Municoes e Explosivos"},
    "Weapons": {"id": "weapons", "name": "Armas"},
    "Armor": {"id": "armor", "name": "Armaduras"},
    "Equipment": {"id": "equipment", "name": "Equipamentos"},
    "Tools": {"id": "tools", "name": "Ferramentas"},
    "Gas_mask": {"id": "gas_masks", "name": "Mascaras de Gas"},
}

# Precos antigos por wiki title (para mapear)
OLD_PRICE_MAP = {}
for item_id, item_data in old_prices.items():
    # Tentar varios formatos de matching
    OLD_PRICE_MAP[item_id] = item_data

# ===== TRADUCAO COMPLETA EN > PT-BR =====
# Muito grande, entao uso funcao de traducao automatica + dicionario para excecoes

EXCEPTIONS_PT = {
    # Comida
    "Amanita": "Amanita",
    "Apple": "Maca",
    "Apple Cordial": "Cordial de Maca",
    "Aqua Vitae": "Agua Vitae",
    "Bamboo Steamer": "Cesteiro de Bambu",
    "Beetle Juice": "Suco de Besouro",
    "Bio-energy Drink": "Bioenergetico",
    "Blini": "Blini",
    "Boiled Egg": "Ovo Cozido",
    "Boiled condensed milk": "Leite Condensado Cozido",
    "Boiled corn": "Milho Cozido",
    "Bowl of rice": "Tigela de Arroz",
    "Bread": "Pao",
    "Buckwheat": "Trigo-sarraceno",
    "Buckwheat grains": "Graos de Trigo-sarraceno",
    "Bunny Treat": "Guloseima de Coelho",
    "Cabbage roll": "Rolinho de Repolho",
    "Cake": "Bolo",
    "Cake napoleon": "Bolo Napoleao",
    "Candy apple": "Maca do Amor",
    "Candy Cane": "Bengala Doce",
    "Canned Beans": "Feijao Enlatado",
    "Canned Water": "Agua Enlatada",
    "Canned beef": "Carne Enlatada",
    "Canned pork": "Porco Enlatado",
    "Canned porridge": "Papas Enlatadas",
    "Caustic Distillate": "Destilado Caustico",
    "Caviar": "Caviar",
    "Caviar sandwich": "Sanduiche de Caviar",
    "Champagne": "Champanhe",
    "Cheese": "Queijo",
    "Chicken kiev": "Frango Kiev",
    "Chocolate": "Chocolate",
    "Chocolate Bar": "Barra de Chocolate",
    "Chocolate Bunny": "Coelho de Chocolate",
    "Clean Water": "Agua Limpa",
    "Coffee": "Cafe",
    "Cold coffee": "Cafe Frio",
    "Cold tea": "Cha Frio",
    "ComCon-3 Paste": "Pasta ComCon-3",
    "Cooked Buckwheat": "Trigo-sarraceno Cozido",
    "Coulibiac": "Coulibiac",
    "Dandelion Tea": "Cha de Dente-de-leao",
    "Dried fish": "Peixe Seco",
    "Dried meat": "Carne Seca",
    "Energy Drink": "Energetico",
    "Fried egg": "Ovo Frito",
    "Fried fish": "Peixe Frito",
    "Fried meat": "Carne Frita",
    "Fried rat meat": "Carne de Rato Frita",
    "Fried snake": "Cobra Frita",
    "Fried tainted meat": "Carne Contaminada Frita",
    "Glowberry wine": "Vinho de Glowberry",
    "Glowberry cordial": "Cordial de Glowberry",
    "Hearty chowder": "Caldo Sustancioso",
    "Hot coffee": "Cafe Quente",
    "Hot tea": "Cha Quente",
    "Ice Cream": "Sorvete",
    "Infected Dried Fish": "Peixe Seco Infectado",
    "King of Jokers": "Rei dos Coringas",
    "Kholodets": "Kholodets",
    "Knock-Off Energy Drink": "Energetico Falsificado",
    "Mashed potatoes": "Pure de Batatas",
    "Meat cutlet": "Bife de Carne",
    "Meat rissole": "Risole de Carne",
    "Minced Meat": "Carne Moida",
    "Mushroom pasta": "Macarrao com Cogumelos",
    "Mushroom soup": "Sopa de Cogumelos",
    "Olivier salad": "Salada Olivier",
    "Pancakes": "Panquecas",
    "Pelmeni": "Pelmeni",
    "Pepsi": "Pepsi",
    "Pie": "Torta",
    "Pilaf": "Pilaf",
    "Pizza": "Pizza",
    "Pumpkin Soup": "Sopa de Abobora",
    "Ration pack": "Racao",
    "Raw meat": "Carne Crua",
    "Red wine": "Vinho Tinto",
    "Rice wine": "Vinho de Arroz",
    "Roasted Chanterelle": "Cantarela Assada",
    "Rotten fish": "Peixe Podre",
    "Rotten meat": "Carne Podre",
    "Rotten porridge": "Papas Podres",
    "Rusk": "Biscoito Duro",
    "Rusks": "Biscoitos Duros",
    "Salo": "Salo",
    "Salted fish": "Peixe Salgado",
    "Shashlik": "Churrasco Espetado",
    "Shchi": "Shchi",
    "Simple chowder": "Caldo Simples",
    "Smoked salo": "Salo Defumado",
    "Snake snack": "Petisco de Cobra",
    "Spice": "Especiaria",
    "Spooky Energy Drink": "Energetico Assustador",
    "Stale Pryanik": "Pryanik Velho",
    "Stewed meat": "Carne Cozida",
    "Strawberry cake": "Bolo de Morango",
    "Stuffed cabbage": "Repolho Recheado",
    "Sugar Beet": "Beterraba Aucareira",
    "Sushi": "Sushi",
    "Tailed Rissole": "Risole de Carne",
    "Tula Pryanik": "Pryanik de Tula",
    "Ukha": "Ukha",
    "Vegetables": "Legumes",
    # Componentes
    "Aluminum": "Aluminio",
    "Aluminum Scrap": "Sucata de Aluminio",
    "Armor Plate": "Placa de Blindagem",
    "Barrel": "Barril",
    "Battery": "Bateria",
    "Bellows": "Fole",
    "Black coal": "Carvao Negro",
    "Bone glue": "Cola de Osso",
    "Brick": "Tijolo",
    "Can": "Lata",
    "Charcoal": "Carvao Vegetal",
    "Cloth": "Tecido",
    "Coal": "Carvao Preto",
    "Copper Scrap": "Sucata de Cobre",
    "Diesel": "Diesel",
    "Electrical cable": "Cabo Eletrico",
    "Electrical tape": "Fita Isolante",
    "Electrodes": "Eletrodos",
    "Fabric": "Tecido",
    "Firewood": "Lenha",
    "Flint": "Pederneira",
    "Gasoline": "Gasolina",
    "Iron Scrap": "Sucata de Ferro",
    "Iron pipe": "Cano de Ferro",
    "Lead": "Chumbo",
    "Machine oil": "Oleo de Maquina",
    "Machine parts": "Pecas de Maquina",
    "Metal plate": "Placa de Metal",
    "Nails": "Pregos",
    "Plank": "Prancha",
    "Rags": "Trapos",
    "Rope": "Corda",
    "Rubber": "Borracha",
    "Saltpeter": "Salitre",
    "Sandpaper": "Lixa",
    "Scrap metal": "Sucata Metalica",
    "Screws": "Parafuso",
    "Soap": "Sabao",
    "Soap powder": "Sabao em Po",
    "Spring": "Mola",
    "Sulfur": "Enxofre",
    "Titanium Alloy": "Liga de Titanio",
    "Titanium ore": "Minerio de Titanio",
    "Tires": "Pneus",
    "Wire": "Fio",
    # Medicamentos
    "Acid gland": "Glandula Acida",
    "Activated Charcoal": "Carvao Ativado",
    "Alcohol": "Alcool",
    "Antidote": "Antidoto",
    "Antibiotics": "Antibioticos",
    "Biotonic": "Biotonico",
    "Cigarettes": "Cigarros",
    "Cuban cigar": "Charuto Cubano",
    "Energy potion": "Pocao Energizante",
    "First Aid Kit": "Kit de Primeiros Socorros",
    "Healing ointment": "Unguento Curativo",
    "Homemade wine": "Vinho Caseiro",
    "Kvass": "Kvass",
    "Moonshine": "Aguardente",
    "Painkillers": "Analgésico",
    "Poison": "Veneno",
    "Russian cigarettes": "Cigarros Russos",
    "Sulfuric acid": "Acido Sulfurico",
    "Vodka": "Vodka",
    "Whiskey": "Usque",
    # Municao
    "Blank Cartridge": "Cartucho em Branco",
    "Crossbow bolt": "Virote de Besta",
    "Empty pistol cartridge": "Cartucho de Pistola Vazio",
    "Empty shotgun cartridge": "Cartucho de Espingarda Vazio",
    "Gunpowder": "Polvora",
    "Handmade cartridge": "Cartucho Artesanal",
    "Molotov": "Coquetel Molotov",
    "Plastic explosive": "Explosivo Plastico",
    "Powder grenade": "Granada de Polvora",
    "Primer": "Espoleta",
    "Stun grenade": "Granada Atordoeadora",
    "Training ammo": "Municao de Treinamento",
    # Sementes
    "Apple seeds": "Sementes de Maca",
    "Corn seeds": "Sementes de Milho",
    "Pumpkin seeds": "Sementes de Abobora",
    "Strawberry seed": "Semente de Morango",
    "Tangerine seeds": "Sementes de Tangerina",
    "Wheat seeds": "Sementes de Trigo",
    # Cogumelos
    "Chanterelle": "Cantarela",
    "Fly agaric": "Agario-das-moscas",
    "Moss": "Musgo",
    "Radioactive mushroom": "Cogumelo Radioativo",
    # Animais
    "Chitin": "Quitina",
    "Contaminated meat": "Carne Contaminada",
    "Fatty meat": "Carne Gorda",
    "Mutant meat": "Carne Mutante",
    "Raw bacon": "Toucinho Cru",
    "Raw fish": "Peixe Cru",
    "Raw skin": "Pele Crua",
    "Snake meat": "Carne de Cobra",
    "Thick skin": "Pele Grossa",
    "Tough meat": "Carne Dura",
    "Wax": "Cera",
    "Lymph": "Linfa",
    "Bones": "Ossos",
    "Fresh bones": "Ossos Frescos",
    "Quality skin": "Pele de Qualidade",
    "Ground meat": "Carne Moida",
    # Armaduras
    "Ceramic bulletproof vest": "Colete Balistico Ceramico",
    "Chinese bulletproof vest": "Colete Balistico Chines",
    "Combined armor": "Armadura Combinada",
    "Leather Armor": "Armadura de Couro",
    "Modern bulletproof vest": "Colete Balistico Moderno",
    "Tactical Armor": "Armadura Tatica",
    "Iron Armor": "Armadura de Ferro",
    "Steel armor": "Armadura de Aco",
    "Bulletproof vest": "Colete Balistico",
    "Homemade Bulletproof Vest": "Colete Balistico Artesanal",
    "Army Bulletproof Vest": "Colete Balistico Militar",
    "Kevlar Vest": "Colete Kevlar",
    "Bone Vest": "Colete de Osso",
    "Primitive Bulletproof Vest": "Colete Balistico Primitivo",
    "Progress Bulletproof Vest": "Colete Balistico Progresso",
    "T-800 Bulletproof Vest": "Colete Balistico T-800",
    "Reinforced Uniform": "Uniforme Reforçado",
    "Military uniform": "Uniforme Militar",
    "Field Uniform": "Uniforme de Campo",
    "Normal clothes": "Roupa Normal",
    "Handmade clothes": "Roupa Artesanal",
    "Ghillie Suit": "Traje de Camuflagem",
    "Chemical suit": "Traje Quimico",
    # Equipamentos
    "Battery flashlight": "Lanterna a Bateria",
    "Dust mask": "Mascara de Poeira",
    "Ermak backpack": "Mochila Ermak",
    "GP-5 gas mask": "Mascara de Gas GP-5",
    "GP-7 gas mask": "Mascara de Gas GP-7",
    "GP-2000 Gas Mask": "Mascara de Gas GP-2000",
    "GP-4 gas mask": "Mascara de Gas GP-4",
    "PMG gas mask": "Mascara de Gas PMG",
    "Ionica Gas Mask": "Mascara de Gas Ionica",
    "MM-1 Gas Mask": "Mascara de Gas MM-1",
    "Old Faithful Gas Mask": "Mascara de Gas Fiel Velha",
    "Iron Gas Mask": "Mascara de Gas de Ferro",
    "Homemade respirator": "Respirador Artesanal",
    "Respirator": "Respirador",
    "Tourist backpack": "Mochila de Turista",
    "Highway backpack": "Mochila de Estrada",
    "Butcher's Backpack": "Mochila do Acougueiro",
    "Medical Backpack": "Mochila Medica",
    "Refrigerator Backpack": "Mochila Geladeira",
    "Rucksack": "Mochila Grande",
    "Schoolbag": "Lancheira",
    "Sack": "Saco",
    "Demon mask": "Mascara de Demônio",
    "Plague Doctor's Mask": "Mascara do Medico da Peste",
    "Scarf of 18 Provinces": "Cachecol das 18 Provincias",
    "Prospector's armor": "Armadura do Prospetor",
    "Smuggler's Armor": "Armadura do Contrabandista",
    "Hunter's Garb": "Traje do Cacador",
    "Master's Garb": "Traje do Mestre",
    "FATUM E-93": "FATUM E-93",
    "Highway Armor": "Armadura de Estrada",
    "Arctic Armor": "Armadura Artica",
    "Invisibility Cloak": "Manta de Invisibilidade",
    "Tattered clothes": "Roupa Esfarrapada",
}

def translate_title(title):
    if title in EXCEPTIONS_PT:
        return EXCEPTIONS_PT[title]
    # Nomes proprios do jogo mantidos como estao
    game_names = {"Pepsi", "Sushi", "Pizza", "Kvass", "Kompot", "Blini", "Pelmeni",
    "Shchi", "Ukha", "Kholodets", "Pilaf", "Salo", "Coulibiac", "Shashlik",
    "Borscht", "Okroshka", "Varenyky", "Pampushky", "Solyanka", "Rassolnik"}
    if title in game_names:
        return title
    return title  # Para o resto, manter o nome original

def title_to_id(title):
    return re.sub(r'[^a-z0-9]+', '_', title.lower()).strip('_')

# ===== CONSTRUIR CATEGORIAS =====
# Mapear item -> categoria baseada nos resultados
# Os resultados ja tem a categoria info do script v1

# Carregar dados de categorias do script v1
CATEGORIES_V1 = {
    "food": "Comida, Bebidas e Ingredientes",
    "seeds": "Sementes",
    "mushrooms_herbs": "Cogumelos e Ervas",
    "materials": "Materiais e Componentes",
    "medicine": "Medicamentos",
    "ammo": "Municoes e Explosivos",
    "weapons": "Armas",
    "armor": "Armaduras",
    "equipment": "Equipamentos",
    "tools": "Ferramentas",
    "gas_masks": "Mascaras de Gas",
}

# Ler mapeamento de categorias do v1
import json as jj
# Os resultados wiki_results tem os itens organizados por categoria
# Vou recategorizar baseado no que foi buscado

# Reconstruir categorizacao
# Primeiro, mapear cada wiki title para sua categoria
item_cat = {}
for title, info in wiki_results.items():
    if not info.get("success"): continue
    # Detectar categoria pelo titulo
    # (ja foi separado pelo v1, entao usamos o arquivo de categorias)
    pass

# Vou recategorizar com base em regras
FOOD_WORDS = ['water','tea','coffee','wine','vodka','whiskey','beer','kvass','kompot',
             'chocolate','cheese','egg','bread','meat','fish','soup','cake','pie',
             'rice','pasta','mushroom','berry','fruit','apple','strawberry','sugar',
             'salt','flour','buckwheat','corn','potato','pumpkin','honey','milk',
             'canned','sausage','candy','champagne','caviar','jam','jelly','sushi',
             'pizza','blini','pelmeni','porridge','chowder','roll','bun','treat',
             'snack','condensed','roux','gruel','stew','cutlet','rissole',
             'kholodets','shchi','ukha','pilaf','shawarma','chicken','duck',
             'bacon','salo','shashlik','borsch','cabbage','stale','pryanik',
             'coulibiac','beet','beverage','drink','cordial','liqueur','moonshine',
             'energy drink','bio-energy','pepsi','cola','soda','cigarette','cigar',
             'herb','dandelion','amanita','chanterelle','fly_agaric','moss',
             'mold','nettle','broadleaf','vegetable','seed','seedling']

SEED_WORDS = ['seed','seedling','wheat seed','corn seed','potato seed','apple seed',
             'pumpkin seed','strawberry seed','tangerine seed','mysterious fruit seed']

MAT_WORDS = ['steel','cement','iron','lead','copper','aluminum','scrap','saltpeter',
            'sulfur','charcoal','coal','firewood','stick','log','board','brick',
            'flint','tape','nail','screw','spring','wire','metal','soap','sandpaper',
            'bone glue','fabric','rag','thread','rope','leather','can','spark',
            'tire','machine part','electrical part','gun part','gas mask filter',
            'autoc','chainsaw motor','car battery','engine','machine oil','diesel',
            'gasoline','titanium','rubber','plank','pipe','electrode','barrel',
            'helmet','alloy','ore','carburetor','filter','belt','chain','gear',
            'hinge','latch','lock','key','bottle','jar','pot','pan','bucket',
            'tarp','paper','glass','stone','clay','sand','cement','powder']

MED_WORDS = ['bandage','ointment','briocarmo','metocaine','lidiacida','antibiotic',
            'painkiller','chlorcistamine','ir190','antirad','charcoal','alcohol',
            'sulfuric','acid','potion','poison','antidote','injector','vitae',
            'stimulant','biotonic','toothgrass','plantain','belladonna']

AMMO_WORDS = ['ammo','cartridge','shell','bullet','gunpowder','primer','explosive',
            'grenade','molotov','bolt','rocket','dynamite','c4','mine','bomb',
            'plastic explosive']

WEAPON_WORDS = ['rifle','shotgun','pistol','revolver','smg','machine gun','crossbow',
              'bow','spear','axe','machete','knife','sword','bat','club',
              'flamethrower','launcher','blaster','gun','musket','saber','scythe']

ARMOR_WORDS = ['armor','armour','vest','bulletproof','suit','helmet','shield',
              'mask','gas mask','respirator']

EQUIP_WORDS = ['backpack','bag','sack','knapsack','rucksack','schoolbag','lantern',
              'flashlight','torch','lighter','candle','cloak','beard','costume',
              'garb','uniform','clothes','talisman','set']

TOOL_WORDS = ['shovel','crowbar','hacksaw','needle','anvil','workbench','stove',
             'furnace','extractor','generator','smelter','mill','filter','purifier',
             'welder','blowtorch','bellows','bucket','fishing rod','rod','reel',
             'chimney','well','greenhouse','tool kit']

MASK_WORDS = ['gas mask','respirator','mask','gp-','pmg','mm-1','ionica','dust mask']


def classify_item(title):
    t = title.lower()
    # Mascaras primeiro (sao equip mas merecem categoria propria)
    if any(w in t for w in MASK_WORDS): return "gas_masks"
    if any(w in t for w in SEED_WORDS): return "seeds_herbs"
    if any(w in t for w in AMMO_WORDS): return "ammo"
    if any(w in t for w in TOOL_WORDS): return "tools"
    if any(w in t for w in MED_WORDS): return "medicine"
    if any(w in t for w in WEAPON_WORDS): return "weapons"
    if any(w in t for w in ARMOR_WORDS): return "armor"
    if any(w in t for w in EQUIP_WORDS): return "equipment"
    if any(w in t for w in FOOD_WORDS): return "food"
    if any(w in t for w in MAT_WORDS): return "materials"
    return "materials"  # fallback


def get_old_price(item_id, wiki_title):
    """Tenta achar preco antigo"""
    # Por ID direto
    if item_id in old_prices:
        p = old_prices[item_id]
        return {"steel": p.get("steel","?:?"), "cement": p.get("cement","?:?"),
                "rarity": p.get("rarity","common"), "demand": p.get("demand","medium"),
                "notes": p.get("notes","")}
    # Por titulo wiki normalizado
    norm = wiki_title.lower().replace(" ","_")
    if norm in old_prices:
        p = old_prices[norm]
        return {"steel": p.get("steel","?:?"), "cement": p.get("cement","?:?"),
                "rarity": p.get("rarity","common"), "demand": p.get("demand","medium"),
                "notes": p.get("notes","")}
    return None


# ===== GERAR JSON FINAL =====
cat_data = {}

for title, info in wiki_results.items():
    if not info.get("success"): continue
    
    item_id = info["id"]
    img_path = info["img"]
    cat_id = classify_item(title)
    
    if cat_id not in cat_data:
        cat_data[cat_id] = []
    
    pt_name = translate_title(title)
    old = get_old_price(item_id, title)
    
    item = {
        "id": item_id,
        "name": pt_name,
        "img": img_path,
        "steel": old["steel"] if old else "?:?",
        "cement": old["cement"] if old else "?:?",
        "rarity": old["rarity"] if old else "common",
        "demand": old["demand"] if old else "medium",
        "notes": old["notes"] if old else "",
    }
    
    # Verificar duplicata de ID
    existing = next((i for i in cat_data[cat_id] if i["id"] == item_id), None)
    if existing:
        continue  # pular duplicata
    
    cat_data[cat_id].append(item)

# Ordenar itens por nome em cada categoria
for k in cat_data:
    cat_data[k].sort(key=lambda x: x["name"])

# Montar categorias finais
CAT_NAMES = {
    "food": "Comida, Bebidas e Ingredientes",
    "seeds_herbs": "Sementes, Ervas e Cogumelos",
    "materials": "Materiais e Componentes",
    "medicine": "Medicamentos e Quimicos",
    "ammo": "Municoes e Explosivos",
    "weapons": "Armas",
    "armor": "Armaduras",
    "equipment": "Equipamentos",
    "tools": "Ferramentas",
    "gas_masks": "Mascaras de Gas",
}

categories = []
for cat_id, items in cat_data.items():
    if not items: continue
    categories.append({
        "id": cat_id,
        "name": CAT_NAMES.get(cat_id, cat_id),
        "items": items,
    })

# Ordenar categorias
CAT_ORDER = ["food","seeds_herbs","materials","medicine","ammo","weapons","armor","equipment","tools","gas_masks"]
cat_order_map = {c: i for i, c in enumerate(CAT_ORDER)}
categories.sort(key=lambda x: cat_order_map.get(x["id"], 99))

output = {
    "metadata": {
        "version": "2026-08-05-v2",
        "game_version": "v.827+",
        "last_updated": "2026-08-05",
        "exchange_rate": "1 Aco ($) = 2 Cimentos (€)",
        "note": "Itens e imagens do wiki oficial (dayr.wiki.gg). Nomes em PT-BR. Precos atualizados pela comunidade.",
        "source": "dayr.wiki.gg",
    },
    "categories": categories,
}

# Verificar duplicatas de ID
all_ids = []
for cat in categories:
    for item in cat["items"]:
        all_ids.append(item["id"])

from collections import Counter
dups = {k: v for k, v in Counter(all_ids).items() if v > 1}
if dups:
    print(f"ATENCAO: {len(dups)} IDs duplicados!")
    for k, v in list(dups.items())[:5]:
        print(f"  {k}: {v}x")

# Salvar
with open("/home/z/my-project/src/data/prices.json", "w") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

total = sum(len(c["items"]) for c in categories)
print(f"\nPrices.json gerado: {total} itens em {len(categories)} categorias")
for cat in categories:
    print(f"  {cat['name']}: {len(cat['items'])} itens")

# Salvar backup do JSON antigo se ainda nao tem
import shutil
if not os.path.exists("/home/z/my-project/src/data/prices_old.json"):
    print("\nAVISO: Salve o JSON antigo como prices_old.json se precisar reter precos")
