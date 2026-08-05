#!/usr/bin/env python3
"""Batch 3: remaining 34 items."""
import urllib.request, urllib.parse, json, ssl, time
from pathlib import Path

ITEMS_DIR = Path("/home/z/my-project/public/items")
UA = 'DayRWikiBot/1.0'

def api_req(params):
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    q = '&'.join(f'{k}={urllib.parse.quote(str(v))}' for k, v in params.items())
    url = f'https://dayr.wiki.gg/api.php?{q}'
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    try:
        resp = urllib.request.urlopen(req, context=ctx, timeout=15)
        return json.loads(resp.read())
    except:
        return {'error': 'err'}

def get_img(title):
    r = api_req({'action':'query','titles':title,'prop':'pageimages','format':'json','pithumbsize':300})
    for pid,pd in r.get('query',{}).get('pages',{}).items():
        if 'missing' in pd: continue
        th = pd.get('thumbnail',{})
        if th and 'source' in th: return th['source'], pd.get('pageimage','')
    return None, None

def search_img(q):
    r = api_req({'action':'query','list':'search','srsearch':q,'format':'json','srlimit':3})
    for s in r.get('query',{}).get('search',[]):
        u,f = get_img(s['title'])
        if u: return u,f,s['title']
    return None,None,None

def dl(url,dest):
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    try:
        resp = urllib.request.urlopen(req, context=ctx, timeout=20)
        data = resp.read()
        if not data[:8] == b'\x89PNG\r\n\x1a\n': return False
        with open(dest,'wb') as f: f.write(data)
        return True
    except: return False

def variations(iid):
    p = iid.split('_')
    v = ['_'.join(x.capitalize() for x in p)]
    if len(p)>1:
        v.append(p[0].capitalize()+' '+' '.join(x.lower() for x in p[1:]))
        v.append(' '.join(x.capitalize() for x in p))
    return v

def fix(iid):
    dest = ITEMS_DIR / f'{iid}.png'
    for t in variations(iid):
        u,f = get_img(t)
        if u:
            if dl(u,dest): return True,t,f
            time.sleep(0.3)
    u,f,st = search_img(iid.replace('_',' '))
    if u and dl(u,dest): return True,st,f
    return False,None,None

BATCH = [
    'rich_chowder','rifle_shell','roasted_chanterelle','rodkin',
    'rubber_parts','saucepan','schmeisser','simple_chowder',
    'sipuha','smoked_fatback','stale_pryanik','steel_knife',
    'stearin','strange_mushroom_yellow','survivor_s_cache',
    'svt_40_broken','tactical_armor','tangerine_seeds','tanning_mixture',
    'treats','uaz_452_broken','uaz_469_broken','vegetable_seeds',
    'witch_s_punch','gasoline_engine','kettlebell',
    'forward_s_stick','titanium_ore','handmade_cartridge',
    'handmade_needle','handmade_rocket','grenade_launcher_round',
    'stew_meat','antelope'
]
# Remove antelope (already done in batch 1)
BATCH = [x for x in BATCH if x != 'antelope']

ok=0; fail=0; failed=[]
for i,iid in enumerate(BATCH):
    print(f'[{i+1}/{len(BATCH)}] {iid}... ', end='', flush=True)
    s,t,f = fix(iid)
    if s: print(f'OK ({t} -> {f})'); ok+=1
    else: print('FAILED'); fail+=1; failed.append(iid)
    time.sleep(0.8)
print(f'\nDone: {ok} OK, {fail} FAILED')
if failed: print(f'Failed: {failed}')
