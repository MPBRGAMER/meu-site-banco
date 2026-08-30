import re

with open('src/lib/spellcheck-dicts.ts', 'r') as f:
    content = f.read()

# Add missing ES entries
es_add = '''  "tq": "te quiero",
  "tkm": "te quiero mucho",
  "xq": "por qué",
  "pk": "por qué",
  "dnd": "donde",
  "bn": "bien",
  "xfa": "por favor",
  "xfavor": "por favor",
  "npi": "ni puta idea",
  "salu2": "saludos",
  "bss": "besos",
  "ms": "más",
  "dl": "del",
  "tmbn": "también",
  "q": "que",
  "d": "de",
  "tas": "estás",
  "sta": "está",
  "taba": "estaba",
  "bno": "bueno",
  "na": "nada",
  "vbs": "vamos",
  "nada": "nada",
  "pa": "para",
  "xa": "para",
  "kk": "kk",
  "jajaja": "jajaja",
  "jaja": "jaja",
  "lmao": "lmao",
  "xd": "xd",
  " tq": "te quiero",
  " tqm": "te quiero mucho",
  " xq": "por qué",
'''

# Add before a known ES entry
content = content.replace('  "q": "que",', es_add + '  "q": "que",')

# Add missing FR entries  
fr_add = '''  "ca": "ça",
  "mdr": "mort de rire",
  "ptdr": "pété de rire",
  "slt": "salut",
  "bjr": "bonjour",
  "bsr": "bonsoir",
  "a+": "à bientôt",
  "ch": "chat",
  "nn": "non",
  "ms": "mais",
  "dc": "donc",
  "pr": "pour",
  "pcq": "parce que",
  "pck": "parce que",
  "g": "j'ai",
  "jai": "j'ai",
  "jsui": "je suis",
  "jpp": "j'en peux plus",
  "bcp": "beaucoup",
  "qqn": "quelqu'un",
  "tjs": "toujours",
  "mm": "même",
  "prk": "pourquoi",
  "pkoi": "pourquoi",
  "ds": "dans",
  "stp": "s'il te plaît",
  "stpm": "s'il te plaît",
  "b1": "bien",
  "ok": "ok",
  "kk": "kk",
  "xd": "xd",
  "lol": "lol",
  "xv": "je ne vois pas",
  "kezako": "qu'est-ce que c'est",
  "tjr": "toujours",
'''

content = content.replace('  "c": "c\'est",', fr_add + '  "c": "c\'est",', 1)

with open('src/lib/spellcheck-dicts.ts', 'w') as f:
    f.write(content)

print('Done: Added missing ES/FR entries')
