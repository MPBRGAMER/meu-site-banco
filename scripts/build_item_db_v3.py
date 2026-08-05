#!/usr/bin/env python3
"""
Versao final: busca imagem cujo nome bate com o titulo da pagina.
Se nao achar, pega a primeira que nao seja UI/icon.
"""
import json, os, re, urllib.request, urllib.parse, concurrent.futures, sys

WIKI_API = "https://dayr.wiki.gg/api.php"
IMG_DIR = "/home/z/my-project/public/items"

os.makedirs(IMG_DIR, exist_ok=True)

# Nomes de arquivos que sao UI/icone, NAO o item
SKIP_FILES = {
    "advice.png", "craft.png", "iconbackground.png",
    "destroy.png", "drop.png", "pickup.png", "wear.png", "sew.png",
    "es.png", "forge.png",
    "expert melee.png", "expert assault rifle.png", "expert shotgun.png",
    "expert rifle.png", "expert pistol.png", "expert crossbow.png",
    "aim effect icon.png", "attack damage icon.png",
    "chinese lantern icon.png", "icon quest.png", "icon point.png",
    "luck (effect).png", "backpack-0.png",
}

# Itens que nao sao trocaveis (adicionar mais)
SKIP_TITLES = {
    # Tools/workstations
    "Axe (tool)", "Chemistry set (tool)", "Chemistry lab",
    "Crowbar (tool)", "Hacksaw (tool)", "Knife (tool)",
    "Saucepan (tool)", "Sewing needle (tool)", "Shovel (tool)", "Tool kit (tool)",
    # Construcoes
    "Terrarium", "Biosynthesizer", "Chemical Reactor",
    # Itens duplicados com versao tool
    "Sapper shovel", "Reykjavik Chainsaw", "Searcher's Flashlight",
    # Status/condicoes
    "Naked", "Player Outfit",
    # Nao sao itens reais
    "Stalk Glowstick", "Quads Glowstick", "Polar Axe",
    "Taiga Machete", "Titanium Tools", "Steel tools", "Rusted tools",
    "Smuggler's Lantern", "Delta G Radio", "Gerin Flycatcher",
    "Powerful flashlight", "Superfilter", "Homemade Explosive",
    "Floodlight", "Iron Anvil", "Steel Anvil", "Blowtorch",
    "Handmade primus stove", "Primus stove", "Thermonuclear Camping Stove",
    # Ferramentas de pesca
    "Handmade fishing rod", "Sturdy Fishing Rod", "Great fishing rod",
    # Lançadores de granada (nao sao trocaveis?)
    "Thermodiffusive Grenade Launcher", "Rocket-Propelled Grenade Launcher",
    # Luminarias/velas
    "Merry Lantern", "14k Lantern", "Paper Lantern", "Tin can candle",
    "Sparkler", "Toxic lamp", "Spotlight", "Wolf Talisman",
    "Pumpkin Chump", "Witch's Quill", "Vintage lighter",
    "Handmade lighter", "Torch", "Santa's Flask", "Santa's Staff",
    # Equipamentos nao-trocaveis
    "Chemistry lab", "Rusted tools", "Steel tools", "Titanium Tools",
    # Armas eventuais
    "Bad Santa", "Rudolph", "Ho Ho Ho", "Snowman Ball",
    "Punch-in-the-Box", "Santa's Coat", "Bunny Costume",
    "Demon Guise", "Cotton-wool Beard", "Lazy Elf", "Magic Sweater",
    "Black-and-Red", "Racer Set", "Scarf of 18 Provinces",
    # Outros
    '"Silage'" Mincer", "Bait", "Crowbar", "Axe", "Shovel",
    "Hacksaw", "Knife", "Sack", "Schoolbag", "Knapsack",
    "Biocontainer", "Liquidator Special Forces Armor",
    "Special Ops Tactical Vest", "EkRan protective suit",
    "Rocket-Propelled Grenade Launcher", "Thermodiffusive Grenade Launcher",
    "Frosthorn", "Yamal",
}

def wiki_api_query(params):
    url = WIKI_API + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": "DayRPriceDB/1.0"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read())

def get_item_image(page_title):
    """Estrategia: 1) imagem com nome igual ao titulo, 2) primeira que nao seja UI"""
    try:
        data = wiki_api_query({
            "action": "query",
            "titles": page_title,
            "prop": "images",
            "imlimit": "15",
            "format": "json",
        })
        pages = data.get("query", {}).get("pages", {})
        for pid, page in pages.items():
            if pid == "-1": return None
            imgs = page.get("images", [])
            title_lower = page_title.lower()
            
            # Estrategia 1: imagem cujo nome bate com o titulo
            for img in imgs:
                ft = img["title"].replace("File:", "")
                ft_lower = ft.lower()
                # Comparar sem extensao
                ft_name = ft_lower.replace(".png", "").replace(".jpg", "")
                if ft_name == title_lower or ft_name == title_lower.replace(" ", "_"):
                    return ft
            
            # Estrategia 2: primeira imagem que nao seja UI
            for img in imgs:
                ft = img["title"].replace("File:", "")
                ft_lower = ft.lower()
                if ft_lower in SKIP_FILES: continue
                if ft_lower.endswith(".svg"): continue
                if ft_lower.endswith(".gif"): continue
                if "effect icon" in ft_lower: continue
                if " icon" in ft_lower: continue
                if ft_lower.startswith("icon"): continue
                return ft
    except:
        pass
    return None

def get_image_direct_url(file_title):
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
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "DayRPriceDB/1.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
            if len(data) < 100: return False
            with open(filepath, "wb") as f:
                f.write(data)
        return True
    except:
        return False

def title_to_id(title):
    return re.sub(r'[^a-z0-9]+', '_', title.lower()).strip('_')

def title_to_filename(title):
    return title_to_id(title) + ".png"

def process_item(title):
    item_id = title_to_id(title)
    fname = title_to_filename(title)
    local_path = os.path.join(IMG_DIR, fname)
    
    if os.path.exists(local_path) and os.path.getsize(local_path) > 100:
        return (title, item_id, True, f"/items/{fname}")
    
    file_title = get_item_image(title)
    if not file_title:
        return (title, item_id, False, None)
    
    direct_url = get_image_direct_url(file_title)
    if not direct_url:
        return (title, item_id, False, None)
    
    success = download_image(direct_url, local_path)
    if success and os.path.exists(local_path) and os.path.getsize(local_path) > 100:
        return (title, item_id, True, f"/items/{fname}")
    
    if os.path.exists(local_path):
        os.remove(local_path)
    return (title, item_id, False, None)

# Carregar resultados anteriores
with open("/home/z/my-project/scripts/wiki_results.json") as f:
    results = json.load(f)

# Filtrar: so processar itens que falharam E sao trocaveis
failed_titles = []
for t, r in results.items():
    if r["success"]: continue
    if t in SKIP_TITLES: continue
    failed_titles.append(t)

print(f"Tentando {len(failed_titles)} itens restantes...")

downloaded = 0
still_failed = []

with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
    futures = {executor.submit(process_item, t): t for t in failed_titles}
    for future in concurrent.futures.as_completed(futures):
        t = futures[future]
        try:
            title, item_id, success, img_path = future.result()
            results[title] = {"id": item_id, "img": img_path, "success": success}
            if success:
                downloaded += 1
            else:
                still_failed.append(t)
            done = downloaded + len(still_failed)
            if done % 30 == 0:
                print(f"  {done}/{len(failed_titles)} ({downloaded} ok)...", flush=True)
        except:
            results[t] = {"id": title_to_id(t), "img": None, "success": False}
            still_failed.append(t)

print(f"\n+{downloaded} imagens baixadas")

# Remover itens nao-trocaveis do resultado final
final_results = {t: r for t, r in results.items() if t not in SKIP_TITLES}

with open("/home/z/my-project/scripts/wiki_results.json", "w") as f:
    json.dump(final_results, f, ensure_ascii=False, indent=2)

total_ok = sum(1 for r in final_results.values() if r["success"])
total_fail = sum(1 for r in final_results.values() if not r["success"])
print(f"Total final: {total_ok} com imagem, {total_fail} sem")

if still_failed:
    print(f"\nAinda sem imagem ({len(still_failed)}):")
    for t in sorted(still_failed):
        print(f"  {t}")
