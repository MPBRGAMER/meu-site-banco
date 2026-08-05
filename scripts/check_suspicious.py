#!/usr/bin/env python3
"""Check suspicious items for correct images and tradeability."""
import urllib.request, urllib.parse, json, ssl, time
from pathlib import Path

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

# Check suspicious items - their wiki pages and images
SUSPICIOUS = [
    ('pineapple', 'Abacaxi', ['Pineapple', 'Pineapple (food)']),
    ('antelope', 'Antilope', ['Antelope', 'Antelope (material)']),
    ('sipuha', 'Sipuha', ['Sipuha']),
    ('dust_mask', 'Mascara de Poeira', ['Dust mask']),
    ('lead_bullet', 'Bala de Chumbo', ['Lead bullet']),
    ('rifle_shell', 'Cartucho de Rifle', ['Rifle shell']),
]

for item_id, pt_name, titles in SUSPICIOUS:
    print(f'=== {item_id} ({pt_name}) ===')
    for title in titles:
        r = api_req({
            'action': 'query', 'titles': title,
            'prop': 'pageimages', 'format': 'json', 'pithumbsize': 300
        })
        pages = r.get('query', {}).get('pages', {})
        for pid, pd in pages.items():
            if 'missing' in pd:
                print(f'  {title}: MISSING')
                continue
            pi = pd.get('pageimage', '')
            print(f'  Wiki: {pd["title"]} -> arquivo: {pi}')
            break
    time.sleep(0.5)
    print()

# Now check tradeability via wiki search for "non-tradable" or "bound"
print('=== VERIFICANDO ITENS NAO TRANSFERIVEIS NO WIKI ===')
for q in ['non-tradeable', 'bound item', 'quest item', 'cannot be traded']:
    r = api_req({'action': 'query', 'list': 'search', 'srsearch': q, 'format': 'json', 'srlimit': 5})
    results = r.get('query', {}).get('search', [])
    if results:
        print(f'Busca "{q}":')
        for s in results[:3]:
            print(f'  {s["title"]}')
    time.sleep(0.5)
