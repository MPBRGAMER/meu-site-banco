#!/usr/bin/env python3
"""
Versao melhorada: baixa imagens dos itens que falharam na primeira tentativa.
Toma a PRIMEIRA imagem .png da pagina (menos .svg, .gif de UI).
"""
import json, os, re, urllib.request, urllib.parse, concurrent.futures, sys

WIKI_API = "https://dayr.wiki.gg/api.php"
IMG_DIR = "/home/z/my-project/public/items"

os.makedirs(IMG_DIR, exist_ok=True)

def wiki_api_query(params):
    url = WIKI_API + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": "DayRPriceDB/1.0"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read())

def get_first_image(page_title):
    """Pega a primeira imagem valida da pagina"""
    try:
        data = wiki_api_query({
            "action": "query",
            "titles": page_title,
            "prop": "images",
            "imlimit": "10",
            "format": "json",
        })
        pages = data.get("query", {}).get("pages", {})
        for pid, page in pages.items():
            if pid == "-1": return None  # pagina nao existe
            imgs = page.get("images", [])
            for img in imgs:
                title = img["title"].replace("File:", "")
                tl = title.lower()
                # Pular nao-imagens
                if tl.endswith(".svg"): continue
                if tl.endswith(".gif"): continue
                if tl.endswith(".jpg"): continue
                if tl.endswith(".webp"): continue
                # Pilar imagens de UI/icone de fundo
                if "iconbackground" in tl: continue
                if "clock.png" == tl: continue
                if "advice.png" == tl: continue
                if "combat" in tl and "mechanics" in tl: continue
                # Pular imagens especificas de crafting/recipe
                if "_craft_" in tl: continue
                if "_recipe" in tl: continue
                return title
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
    
    file_title = get_first_image(title)
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

# Filtrar itens que falharam e sao reais (nao construcoes/status)
NON_TRADEABLE_EXTRA = {
    "Food/Spreadsheet", "Cooking recipe", "Fishing Mechanics",
    "Crafting Mechanics", "Combat Mechanics", "Broken bicycle",
    "Broken bav-485", "Broken vehicles", "Broken Mosin-Nagant",
    "Broken mi-8", "Broken motorcycle", "DP-27 (broken)",
    "Disassembled motorcycle", "Charcoal pile (burning)",
    "Charcoal pile (burned)", "AKS-74U (broken)", "APS (Broken)",
    "Broken Gas Engine", "Broken Diesel Engine",
}

failed_titles = [t for t, r in results.items() if not r["success"] and t not in NON_TRADEABLE_EXTRA]
print(f"Tentando baixar imagens para {len(failed_titles)} itens que falharam...")

downloaded = 0
still_failed = 0

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
                still_failed += 1
            if (downloaded + still_failed) % 50 == 0:
                print(f"  {downloaded + still_failed}/{len(failed_titles)} processados ({downloaded} ok)...", flush=True)
        except:
            results[t] = {"id": title_to_id(t), "img": None, "success": False}
            still_failed += 1

print(f"\nResultado: +{downloaded} baixadas, {still_failed} ainda sem imagem")

# Remover itens nao-trocaveis
clean_results = {t: r for t, r in results.items() if t not in NON_TRADEABLE_EXTRA}

with open("/home/z/my-project/scripts/wiki_results.json", "w") as f:
    json.dump(clean_results, f, ensure_ascii=False, indent=2)

total_ok = sum(1 for r in clean_results.values() if r["success"])
total_fail = sum(1 for r in clean_results.values() if not r["success"])
print(f"Total: {total_ok} com imagem, {total_fail} sem imagem")

if total_fail > 0:
    print(f"\nAinda sem imagem:")
    for t, r in clean_results.items():
        if not r["success"]:
            print(f"  {t}")
