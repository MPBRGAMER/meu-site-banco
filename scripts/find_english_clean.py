#!/usr/bin/env python3
"""
Find items that are CLEARLY in English (not proper nouns or loanwords).
Proper nouns (weapon names, Russian food, brands) should stay as-is.
"""

import json, re
from pathlib import Path

with open('/home/z/my-project/src/data/prices.json') as f:
    data = json.load(f)

all_items = []
for cat in data['categories']:
    for item in cat['items']:
        all_items.append({**item, 'cat': cat['name'], 'cat_id': cat['id']})

# These are EXPLICITLY English names that need translation
ENGLISH_WORDS = {
    'rice grains': 'Graos de Arroz',
    'stew meat': 'Carne para Ensopado',
    'pineapple': 'Abacaxi',
    'corn': 'Milho',
    'egg': 'Ovo',
    'flour': 'Farinha',
    'honey': 'Mel',
    'milk': 'Leite',
    'sugar': 'Acucar',
    'salt': 'Sal',
    'tea': 'Cha',
    'jam': 'Geleia',
    'fat': 'Gordura',
    'iron': 'Ferro',
    'steel': 'Aco',
    'cement': 'Cimento',
    'wheat': 'Trigo',
    'nail': 'Prego',
    'can': 'Lata',
    'threads': 'Linhas',
    'matches': 'Fosforos',
    'lighter': 'Isqueiro',
    'tangerine': 'Tangerina',
    'pistol ammo': 'Municao de Pistola',
    'rifle ammo': 'Municao de Rifle',
    'chitin spear': 'Lanca de Quitina',
    'forged knife': 'Faca Forjada',
    'butterfly knife': 'Faca Borboleta',
    'sewing needle': 'Agulha de Costura',
    'chitin armor': 'Armadura de Quitina',
    'nailed box': 'Caixa Pregada',
    'dragon scale': 'Escama de Dragao',
    'support box': 'Caixa de Suporte',
    'spark plug': 'Vela de Ignicao',
    'pkm (broken)': 'PKM (Quebrado)',
}

# Find items with names matching English words/phrases
print('ITENS CLARAMENTE EM INGLES:')
print('=' * 60)

found = []
for item in all_items:
    name_lower = item['name'].lower().strip()
    if name_lower in ENGLISH_WORDS:
        found.append(item)
        pt_name = ENGLISH_WORDS[name_lower]
        print(f'  [{item["cat_id"]}] "{item["name"]}" -> "{pt_name}" (id: {item["id"]})')

# Also check for partial English patterns
print(f'\nTotal encontrado: {len(found)}')

# Now check for items that have English words but weren't caught
# (names containing common English words as part of a longer name)
print('\n' + '=' * 60)
print('ITENS COM NOMES PARCIALMENTE EM INGLES:')
print('=' * 60)

partial_english = []
english_patterns = [
    (r'(?i)\bPistol Ammo\b', 'Municao de Pistola'),
    (r'(?i)\bRifle Ammo\b', 'Municao de Rifle'),
    (r'(?i)\bChitin spear\b', 'Lanca de Quitina'),
    (r'(?i)\bForged knife\b', 'Faca Forjada'),
    (r'(?i)\bButterfly knife\b', 'Faca Borboleta'),
    (r'(?i)\bSewing needle\b', 'Agulha de Costura'),
    (r'(?i)\bChitin armor\b', 'Armadura de Quitina'),
    (r'(?i)\bNailed box\b', 'Caixa Pregada'),
    (r'(?i)\bDragon scale\b', 'Escama de Dragao'),
    (r'(?i)\bSupport box\b', 'Caixa de Suporte'),
    (r'(?i)\bSpark plug\b', 'Vela de Ignicao'),
    (r'(?i)\bPKM \(broken\)', 'PKM (Quebrado)'),
    (r'(?i)\bTube Rifle\b', 'Rifle de Tubo'),
]

for item in all_items:
    for pattern, translation in english_patterns:
        if re.search(pattern, item['name']):
            partial_english.append((item, translation))
            print(f'  [{item["cat_id"]}] "{item["name"]}" -> "{translation}" (id: {item["id"]})')
            break

print(f'\nTotal parcial: {len(partial_english)}')
