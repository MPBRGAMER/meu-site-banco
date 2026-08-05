#!/usr/bin/env python3
"""Fix remaining English item names to PT-BR."""

import json
from pathlib import Path

PRICES_PATH = Path('/home/z/my-project/src/data/prices.json')

with open(PRICES_PATH) as f:
    data = json.load(f)

# Build item lookup by id
item_map = {}
for cat in data['categories']:
    for item in cat['items']:
        item_map[item['id']] = item

# Translations: id -> PT-BR name
TRANSLATIONS = {
    'corn': 'Milho',
    'egg': 'Ovo',
    'flour': 'Farinha',
    'honey': 'Mel',
    'jam': 'Geleia',
    'milk': 'Leite',
    'pineapple': 'Abacaxi',
    'rice_grains': 'Graos de Arroz',
    'salt': 'Sal',
    'stew_meat': 'Carne para Ensopado',
    'sugar': 'Acucar',
    'tea': 'Cha',
    'cement': 'Cimento',
    'dragon_scale': 'Escama de Dragao',
    'fat': 'Gordura',
    'iron': 'Ferro',
    'matches': 'Fosforos',
    'nail': 'Prego',
    'nailed_box': 'Caixa Pregada',
    'pkm_broken': 'PKM (Quebrado)',
    'spark_plug': 'Vela de Ignicao',
    'steel': 'Aco',
    'support_box': 'Caixa de Suporte',
    'tangerine': 'Tangerina',
    'threads': 'Linhas',
    'wheat': 'Trigo',
    'pistol_ammo': 'Municao de Pistola',
    'rifle_ammo': 'Municao de Rifle',
    'butterfly_knife': 'Faca Borboleta',
    'chitin_spear': 'Lanca de Quitina',
    'forged_knife': 'Faca Forjada',
    'chitin_armor': 'Armadura de Quitina',
    'lighter': 'Isqueiro',
    'sewing_needle': 'Agulha de Costura',
    'tube_rifle': 'Rifle de Tubo',
}

changed = 0
for item_id, new_name in TRANSLATIONS.items():
    if item_id in item_map:
        old_name = item_map[item_id]['name']
        if old_name != new_name:
            item_map[item_id]['name'] = new_name
            print(f'  {item_id}: "{old_name}" -> "{new_name}"')
            changed += 1
    else:
        print(f'  {item_id}: NOT FOUND')

print(f'\nTotal traduzidos: {changed}')

with open(PRICES_PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print('prices.json salvo!')
