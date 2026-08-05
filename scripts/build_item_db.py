#!/usr/bin/env python3
"""
Script completo para reconstruir a base de dados de itens do Day R:
1. Busca itens no wiki via API de categorias
2. Para cada item, pega a imagem via API
3. Baixa as imagens para /public/items/
4. Gera prices.json com nomes PT-BR e caminhos de imagem
"""
import json, os, re, time, urllib.request, urllib.parse, concurrent.futures, sys

WIKI_API = "https://dayr.wiki.gg/api.php"
IMG_DIR = "/home/z/my-project/public/items"
OUTPUT_JSON = "/home/z/my-project/src/data/prices.json"

os.makedirs(IMG_DIR, exist_ok=True)

# Categorias do wiki com itens trocaveis entre players
CATEGORIES = [
    {"id": "food", "name": "Comida, Bebidas e Ingredientes", "wiki_cat": "Food", "emoji": "meat"},
    {"id": "seeds", "name": "Sementes", "wiki_cat": "Seeds", "emoji": "seed"},
    {"id": "mushrooms_herbs", "name": "Cogumelos e Ervas", "wiki_cat": "Mushrooms", "emoji": "mushroom"},
    {"id": "materials", "name": "Materiais e Componentes", "wiki_cat": "Material", "emoji": "material"},
    {"id": "medicine", "name": "Medicamentos", "wiki_cat": "Medicine", "emoji": "medicine"},
    {"id": "ammo", "name": "Municao", "wiki_cat": "Ammunition", "emoji": "ammo"},
    {"id": "weapons", "name": "Armas", "wiki_cat": "Weapons", "emoji": "weapon"},
    {"id": "armor", "name": "Armaduras", "wiki_cat": "Armor", "emoji": "armor"},
    {"id": "equipment", "name": "Equipamentos", "wiki_cat": "Equipment", "emoji": "equip"},
    {"id": "tools", "name": "Ferramentas", "wiki_cat": "Tools", "emoji": "tool"},
    {"id": "gas_masks", "name": "Mascaras de Gas", "wiki_cat": "Gas_mask", "emoji": "mask"},
]

# Itens que NAO sao trocaveis entre players (construcoes, status, etc)
NON_TRADEABLE = {
    # Itens de construcao/estrutura
    "Brick house", "Wooden house", "Hut", "Cellar", "Greenhouse",
    "Brick oven", "Draw well", "Water purifier", "Biosynthesizer",
    "Chemical Reactor", "Chemistry Lab", "Extractor", "Generator",
    "Smelter", "Steelmaking furnace", "Workbench", "Biodetector",
    "Drying rack", "Hand mill", "Water Filter", "Tent (Pitched)",
    "Tent (taken down)", "Forge chimney", "Rice Field",
    # Veiculos desmontados
    "ZIL-130 (Disassembled)", "KamAZ (Disassembled)",
    "ZAZ-968 (Disassembled)", "GAZ-24 (Disassembled)",
    "GAZ-66 (Disassembled)", "VAZ-2101 (Disassembled)",
    "UAZ-452 (Disassembled)", "UAZ-469 (Disassembled)",
    # Status/doencas (nao sao itens fisicos)
    "Blindness", "Bleeding", "Food Poisoning", "Dysentery",
    "Radiation", "Poisoning", "Blood Poisoning", "Parasitic Worms",
    "Food poisoning", "Dysentery", "Fever", "Infection",
    "Low Temperature", "High Temperature", "Thirst", "Hunger",
    "Overweight", "Underweight", "Toxicity", "Drowsiness",
    # Itens de quest/evento
    "Blueprint", "Chinese coin", "Business Claus's Card",
    "Combat Mechanics", "Fishing Mechanics", "Crafting Mechanics",
    "Game Updates", "Daily reward",
    # Outros
    "Biofuel", "Biomass", "Battery", "Nuclear Battery",
    "Nuclear reactor part", "Ice", "Fire", "Source of fire",
    "Christmas tree", "Pets", "Paper", "Dusty book",
    "Furniture", "Tarp", "GrowFast", "Fairy dust",
    # Peças de veículos (nao sao itens de inventario normal)
    "Bicycle Spare Parts", "Motorcycle Spare Parts",
    "Auto spare parts", "Mi-8 parts",
}

# Itens que sao ferramentas/workstations (sufixo __tool no nosso JSON antigo)
TOOL_SUFFIX = [
    "(tool)", "(Taken down)", "(Pitched)", "(broken)", "(Broken)",
]

def is_tradeable(title):
    if title in NON_TRADEABLE: return False
    if title.startswith("Category:"): return False
    if "Mechanics" in title: return False
    return True

def wiki_api_query(params):
    url = WIKI_API + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": "DayRPriceDB/1.0"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read())

def get_category_items(cat_title):
    items = []
    cmcontinue = None
    while True:
        params = {
            "action": "query",
            "list": "categorymembers",
            "cmtitle": f"Category:{cat_title}",
            "cmlimit": "500",
            "format": "json",
        }
        if cmcontinue:
            params["cmcontinue"] = cmcontinue
        try:
            data = wiki_api_query(params)
        except Exception as e:
            print(f"  API error for {cat_title}: {e}", file=sys.stderr)
            break
        members = data.get("query", {}).get("categorymembers", [])
        for m in members:
            title = m["title"]
            if is_tradeable(title):
                items.append(title)
        cmcontinue = data.get("continue", {}).get("cmcontinue")
        if not cmcontinue:
            break
    return items

def get_image_url(page_title):
    """Usa a API para pegar a URL da imagem principal de uma pagina"""
    try:
        data = wiki_api_query({
            "action": "query",
            "titles": page_title,
            "prop": "images",
            "imlimit": "5",
            "format": "json",
        })
        pages = data.get("query", {}).get("pages", {})
        for pid, page in pages.items():
            imgs = page.get("images", [])
            for img in imgs:
                title = img["title"]  # ex: "File:Flint_knife.png"
                # Pular imagens que nao sao o icone do item
                if "icon" in title.lower(): continue
                if "background" in title.lower(): continue
                if "old" in title.lower() and "Old" not in page_title: continue
                if "recipe" in title.lower(): continue
                if "craft" in title.lower(): continue
                if "map" in title.lower(): continue
                if "ui" in title.lower(): continue
                if title.lower().endswith(".svg"): continue
                if "advantage" in title.lower(): continue
                if "disadvantage" in title.lower(): continue
                if "clock" in title.lower(): continue
                # Primeira imagem valida = icone do item
                return title.replace("File:", "")
    except Exception as e:
        pass
    return None

def get_image_direct_url(file_title):
    """Pega a URL direta da imagem via API de imageinfo"""
    try:
        data = wiki_api_query({
            "action": "query",
            "titles": f"File:{file_title}",
            "prop": "imageinfo",
            "iiprop": "url",
            "format": "json",
        })
        pages = data.get("query", {}).get("pages", {})
        for pid, page in pages.items():
            infos = page.get("imageinfo", [])
            if infos:
                return infos[0]["url"]
    except:
        pass
    return None

def download_image(url, filepath):
    """Baixa imagem e salva localmente"""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "DayRPriceDB/1.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            with open(filepath, "wb") as f:
                f.write(resp.read())
        return True
    except Exception as e:
        return False

def title_to_id(title):
    """Converte titulo do wiki para ID: 'Flint Knife' -> 'flint_knife'"""
    return re.sub(r"[^a-z0-9]+", "_", title.lower()).strip("_")

def title_to_filename(title):
    """Converte titulo para nome de arquivo: 'Flint Knife' -> 'flint_knife.png'"""
    return title_to_id(title) + ".png"

# ============ FASE 1: Coletar todos os itens das categorias ============
print("=== FASE 1: Coletando itens do wiki ===")
all_items_by_cat = {}
all_titles = set()

for cat in CATEGORIES:
    print(f"  Buscando {cat['wiki_cat']}...", end=" ", flush=True)
    items = get_category_items(cat["wiki_cat"])
    # Remover duplicatas entre categorias
    new_items = []
    for item in items:
        if item not in all_titles:
            all_titles.add(item)
            new_items.append(item)
    all_items_by_cat[cat["id"]] = {
        "category": cat,
        "items": new_items,
    }
    print(f"{len(new_items)} itens (unicos)")

total_unique = sum(len(v["items"]) for v in all_items_by_cat.values())
print(f"\nTotal de itens unicos: {total_unique}")

# ============ FASE 2: Baixar imagens ============
print("\n=== FASE 2: Baixando imagens ===")

def process_item(title):
    """Processa um item: pega URL da imagem e baixa"""
    item_id = title_to_id(title)
    local_path = os.path.join(IMG_DIR, title_to_filename(title))
    
    # Se ja existe, pular
    if os.path.exists(local_path) and os.path.getsize(local_path) > 100:
        return (title, item_id, True, f"/items/{title_to_filename(title)}")
    
    # Buscar nome do arquivo de imagem
    file_title = get_image_url(title)
    if not file_title:
        return (title, item_id, False, None)
    
    # Pegar URL direta
    direct_url = get_image_direct_url(file_title)
    if not direct_url:
        return (title, item_id, False, None)
    
    # Baixar
    success = download_image(direct_url, local_path)
    if success and os.path.exists(local_path) and os.path.getsize(local_path) > 100:
        return (title, item_id, True, f"/items/{title_to_filename(title)}")
    
    # Limpar arquivo invalido
    if os.path.exists(local_path):
        os.remove(local_path)
    return (title, item_id, False, None)

# Coletar todos os itens unicos com suas categorias
item_cat_map = {}  # title -> cat_id
for cat_id, data in all_items_by_cat.items():
    for title in data["items"]:
        if title not in item_cat_map:
            item_cat_map[title] = cat_id

all_titles_list = list(item_cat_map.keys())
print(f"  Processando {len(all_titles_list)} itens...")

results = {}
downloaded = 0
failed = 0
batch_size = 5

with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
    futures = {}
    for i, title in enumerate(all_titles_list):
        futures[executor.submit(process_item, title)] = title
        if (i + 1) % batch_size == 0:
            for future in concurrent.futures.as_completed(futures):
                t = futures[future]
                try:
                    title, item_id, success, img_path = future.result()
                    results[title] = {"id": item_id, "img": img_path, "success": success}
                    if success: downloaded += 1
                    else: failed += 1
                    if downloaded % 20 == 0:
                        print(f"    {downloaded}/{len(all_titles_list)} imagens baixadas...", flush=True)
                except Exception as e:
                    results[t] = {"id": title_to_id(t), "img": None, "success": False}
                    failed += 1
            futures = {}
    
    # Processar restante
    for future in concurrent.futures.as_completed(futures):
        t = futures[future]
        try:
            title, item_id, success, img_path = future.result()
            results[title] = {"id": item_id, "img": img_path, "success": success}
            if success: downloaded += 1
            else: failed += 1
        except:
            results[t] = {"id": title_to_id(t), "img": None, "success": False}
            failed += 1

print(f"  Resultado: {downloaded} baixadas, {failed} sem imagem")

# Salvar resultados intermediarios
with open("/home/z/my-project/scripts/wiki_results.json", "w") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print("\nResultados salvos em wiki_results.json")
print(f"\nItens sem imagem (precisam de busca manual):")
no_img = [t for t, r in results.items() if not r["success"]]
for t in no_img[:30]:
    print(f"  {t}")
if len(no_img) > 30:
    print(f"  ... e mais {len(no_img) - 30}")
