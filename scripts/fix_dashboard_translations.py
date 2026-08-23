#!/usr/bin/env python3
"""Add missing Dashboard strings to each language dictionary in TranslationPopup.tsx."""

import re

FILE = "/home/z/my-project/user-project/src/components/banco/TranslationPopup.tsx"

with open(FILE, "r") as f:
    content = f.read()

# Define the missing strings per language
# ES needs: header strings + Chat
# FR, DE, RU need: header strings + Chat + Nenhum contribuinte
# IT, ZH_CN, ZH_TW, KO, JA, ID, TR need: header strings only

HEADER_STRINGS = {
    # Key: translation per language
    'ES': [
        ('"Day R Survival":', '"Day R Survival",'),
        ('"Posto de Trocas":', '"Puesto de Intercambio",'),
        ('"Posto de Trocas - Sobreviventes":', '"Puesto de Intercambio - Sobrevivientes",'),
        ('"POSTO DE TROCAS":', '"PUESTO DE INTERCAMBIO",'),
        ('"Sistema de gestao para sobreviventes":', '"Sistema de gestion para supervivientes",'),
        ('"Day R Survival - Posto de Trocas":', '"Day R Survival - Puesto de Intercambio",'),
        ('"Chat":', '"Chat",'),
    ],
    'FR': [
        ('"Day R Survival":', '"Day R Survival",'),
        ('"Posto de Trocas":', '"Poste d\'Echange",'),
        ('"Posto de Trocas - Sobreviventes":', '"Poste d\'Echange - Survivants",'),
        ('"POSTO DE TROCAS":', '"POSTE D\'ECHANGE",'),
        ('"Sistema de gestao para sobreviventes":', '"Systeme de gestion pour survivants",'),
        ('"Day R Survival - Posto de Trocas":', '"Day R Survival - Poste d\'Echange",'),
        ('"Chat":', '"Chat",'),
        ('"Nenhum contribuinte ainda. Contribua reportando precos na aba Tabela!":', '"Aucun contributeur pour le moment. Contribuez en signalant les prix dans l\'onglet Tableau !",'),
    ],
    'DE': [
        ('"Day R Survival":', '"Day R Survival",'),
        ('"Posto de Trocas":', '"Handelsposten",'),
        ('"Posto de Trocas - Sobreviventes":', '"Handelsposten - Überlebende",'),
        ('"POSTO DE TROCAS":', '"HANDELSPOSTEN",'),
        ('"Sistema de gestao para sobreviventes":', '"Verwaltungssystem für Überlebende",'),
        ('"Day R Survival - Posto de Trocas":', '"Day R Survival - Handelsposten",'),
        ('"Chat":', '"Chat",'),
        ('"Nenhum contribuinte ainda. Contribua reportando precos na aba Tabela!":', '"Noch keine Mitwirkenden. Tragen Sie bei, indem Sie Preise im Tab Preistabelle melden!",'),
    ],
    'RU': [
        ('"Day R Survival":', '"Day R Survival",'),
        ('"Posto de Trocas":', '"Торговый пост",'),
        ('"Posto de Trocas - Sobreviventes":', '"Торговый пост - Выжившие",'),
        ('"POSTO DE TROCAS":', '"ТОРГОВЫЙ ПОСТ",'),
        ('"Sistema de gestao para sobreviventes":', '"Система управления для выживших",'),
        ('"Day R Survival - Posto de Trocas":', '"Day R Survival - Торговый пост",'),
        ('"Chat":', '"Чат",'),
        ('"Nenhum contribuinte ainda. Contribua reportando precos na aba Tabela!":', '"Пока нет участников. Внесите свой вклад, сообщая цены на вкладке Таблица!",'),
    ],
    'IT': [
        ('"Day R Survival":', '"Day R Survival",'),
        ('"Posto de Trocas - Sobreviventes":', '"Posto di Scambio - Sopravvissuti",'),
        ('"POSTO DE TROCAS":', '"POSTO DI SCAMBIO",'),
        ('"Day R Survival - Posto de Trocas":', '"Day R Survival - Posto di Scambio",'),
    ],
    'ZH_CN': [
        ('"Day R Survival":', '"Day R Survival",'),
        ('"Posto de Trocas - Sobreviventes":', '"交易站 - 幸存者",'),
        ('"POSTO DE TROCAS":', '"交易站",'),
        ('"Day R Survival - Posto de Trocas":', '"Day R Survival - 交易站",'),
    ],
    'ZH_TW': [
        ('"Day R Survival":', '"Day R Survival",'),
        ('"Posto de Trocas - Sobreviventes":', '"交易站 - 倖存者",'),
        ('"POSTO DE TROCAS":', '"交易站",'),
        ('"Day R Survival - Posto de Trocas":', '"Day R Survival - 交易站",'),
    ],
    'KO': [
        ('"Day R Survival":', '"Day R Survival",'),
        ('"Posto de Trocas - Sobreviventes":', '"교환 스테이션 - 생존자",'),
        ('"POSTO DE TROCAS":', '"교환 스테이션",'),
        ('"Day R Survival - Posto de Trocas":', '"Day R Survival - 교환 스테이션",'),
    ],
    'JA': [
        ('"Day R Survival":', '"Day R Survival",'),
        ('"Posto de Trocas - Sobreviventes":', '"取引ステーション - サバイバー",'),
        ('"POSTO DE TROCAS":', '"取引ステーション",'),
        ('"Day R Survival - Posto de Trocas":', '"Day R Survival - 取引ステーション",'),
    ],
    'ID': [
        ('"Day R Survival":', '"Day R Survival",'),
        ('"Posto de Trocas - Sobreviventes":', '"Pos Pertukaran - Penyintas",'),
        ('"POSTO DE TROCAS":', '"POS PERTUKARAN",'),
        ('"Day R Survival - Posto de Trocas":', '"Day R Survival - Pos Pertukaran",'),
    ],
    'TR': [
        ('"Day R Survival":', '"Day R Survival",'),
        ('"Posto de Trocas - Sobreviventes":', '"Takas İstasyonu - Hayatta Kalanlar",'),
        ('"POSTO DE TROCAS":', '"TAKAS İSTASYONU",'),
        ('"Day R Survival - Posto de Trocas":', '"Day R Survival - Takas İstasyonu",'),
    ],
}

# Dictionary start line numbers (from rg output)
DICT_STARTS = {
    'ES': 1270, 'FR': 1558, 'DE': 1805, 'RU': 2039,
    'IT': 2274, 'ZH_CN': 2465, 'ZH_TW': 2656, 'KO': 2842,
    'JA': 3014, 'ID': 3185, 'TR': 3357,
}

lines = content.split('\n')

total_added = 0
for lang, entries in HEADER_STRINGS.items():
    start_line = DICT_STARTS[lang] - 1  # 0-indexed
    # Find the line after "const LANG: Record<string, string> = {"
    insert_idx = start_line + 1
    
    # Build the lines to insert (with header comment)
    insert_lines = ["  // ---- Page / Header ----"]
    for key, value in entries:
        insert_lines.append(f"  {key} {value}")
    
    # Insert the lines
    for i, line in enumerate(insert_lines):
        lines.insert(insert_idx + i, line)
    total_added += len(entries)
    print(f"Added {len(entries)} strings to {lang}")

# Write back
new_content = '\n'.join(lines)
with open(FILE, "w") as f:
    f.write(new_content)

print(f"\nTotal strings added: {total_added}")
