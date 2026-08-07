#!/usr/bin/env python3
"""Download correct images for items user specifically flagged."""
import urllib.request, urllib.parse, json, ssl, os, time
from PIL import Image
from io import BytesIO

IMG_DIR = '/home/z/my-project/public/items'

def api_req(params):
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    q = '&'.join(f'{k}={urllib.parse.quote(str(v))}' for k, v in params.items())
    url = f'https://dayr.wiki.gg/api.php?{q}'
    req = urllib.request.Request(url, headers={'User-Agent': 'DayRWikiBot/1.0'})
    resp = urllib.request.urlopen(req, context=ctx, timeout=15)
    return json.loads(resp.read())

def dl(url, dest):
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    req = urllib.request.Request(url, headers={'User-Agent': 'DayRWikiBot/1.0'})
    resp = urllib.request.urlopen(req, context=ctx, timeout=20)
    data = resp.read()
    if data[:4] == b'\x89PNG':
        with open(dest, 'wb') as f:
            f.write(data)
        return True
    elif data[:2] == b'\xff\xd8':
        img = Image.open(BytesIO(data)).convert('RGBA')
        img.save(dest, 'PNG')
        return True
    return False

def get_img_url(title):
    r = api_req({'action':'query','titles':title,'prop':'pageimages','format':'json','pithumbsize':300})
    for pid, pd in r.get('query',{}).get('pages',{}).items():
        if 'missing' in pd: continue
        th = pd.get('thumbnail',{})
        if th and 'source' in th: return th['source']
    return None

# Items with specific file names from user
IMAGE_ITEMS = [
    # user: "Analgésico tem que mudar a imagem... imagem correta Tidocycline.png"
    ('painkiller', 'Tidocycline'),
    # user: "Veneno so tem que bota a imagem correta... Poison-1.png"
    ('poison', 'Poison-1'),
    # user: "Motor de Motosserra a imagem correta Small_engine.png"
    ('chainsaw_motor', 'Small_engine'),
    # user: "Vela de Ignicao so tem que mudar a imagem que fico feio com esse fundo branco!"
    ('spark_plug', 'Spark_plug'),
    # Also fix iron_pipe which user said has wrong image
    ('iron_pipe', 'Iron_pipe'),
]

def get_file_url(filename):
    """Get direct URL for a specific file on the wiki."""
    r = api_req({'action':'query','titles':'File:'+filename,'prop':'imageinfo','format':'json','iiprop':'url'})
    for pid, pd in r.get('query',{}).get('pages',{}).items():
        if 'missing' in pd: return None
        ii = pd.get('imageinfo',[])
        if ii: return ii[0].get('url')
    return None

downloaded = 0
failed = 0

for item_id, file_prefix in IMAGE_ITEMS:
    dest = os.path.join(IMG_DIR, f'{item_id}.png')
    
    # First try direct file URL
    url = get_file_url(file_prefix + '.png')
    if not url:
        url = get_file_url(file_prefix + '.jpg')
    
    if url:
        print(f'{item_id}: Got file URL: {url[:80]}...')
        if dl(url, dest):
            downloaded += 1
            print(f'  OK: {item_id}')
        else:
            failed += 1
            print(f'  FAILED download: {item_id}')
    else:
        # Fallback: get from wiki page image
        parts = item_id.split('_')
        title = '_'.join(p.capitalize() for p in parts)
        url = get_img_url(title)
        if url:
            if dl(url, dest):
                downloaded += 1
                print(f'  OK (fallback): {item_id}')
            else:
                failed += 1
                print(f'  FAILED: {item_id}')
        else:
            failed += 1
            print(f'  NO IMAGE: {item_id}')
    
    time.sleep(0.4)

print(f'\nDownloaded: {downloaded}, Failed: {failed}')
