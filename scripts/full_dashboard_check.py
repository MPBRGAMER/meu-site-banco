#!/usr/bin/env python3
"""Comprehensive check: extract ALL Dashboard-reachable text from TranslationPopup.tsx
for each language, comparing against the exact strings used in DashboardTab.tsx."""

import re

FILE = "/home/z/my-project/user-project/src/components/banco/TranslationPopup.tsx"

# Every string that appears in DashboardTab.tsx as a static text node
DASHBOARD_TEXTS = [
    # Header
    "Posto de Trocas",
    "Sistema de gestao para sobreviventes",
    # Stats cards
    "Empréstimos Pendentes",
    "Empréstimos Pagos",
    "Investidores Ativos",
    "Trocas Realizadas",
    "Compras & Vendas",
    "Registros no Caixa",
    "Doadores",
    "Leilões Ativos",
    "Sorteios Ativos",
    # Active events
    "Eventos Ativos",
    "Lotérica",
    # Rankings
    "Top 10 Doadores",
    "Nenhum doador cadastrado.",
    "Top 10 Investidores",
    "Nenhum investidor cadastrado.",
    "Top 10 Contribuintes",
    "Nenhum contribuinte ainda. Contribua reportando precos na aba Tabela!",
    # Inventory
    "Estoque do Banco",
    "Nenhum item encontrado.",
    "Estoque vazio.",
    # Cash movements
    "Movimentos do Caixa",
    "Nenhum registro ainda.",
    # Loading
    "Carregando dados do banco...",
    # Words used standalone in text nodes (after fix)
    "desde",
    "contribuicoes",
    "registros",
]

# Also strings used in the HEADER component (BancoLayout) and tab bar that are visible on Dashboard
HEADER_TEXTS = [
    "POSTO DE TROCAS",
    "Posto de Trocas - Sobreviventes",
    "Day R Survival - Posto de Trocas",
    "Day R Survival",
    "Chat",  # tab name
    "Tabela",  # tab name
    "Empréstimos",  # tab name
    "Trocas",  # tab name
    "Doadores",  # tab name
    "Leilões",  # tab name
    "Sorteios",  # tab name
    "Lotérica",  # tab name
    "Investidores",  # tab name
    "Config Trocas",  # tab name
    "Estoque & Caixa",  # tab name
    "Dashboard",  # tab name
]

ALL_TEXTS = list(dict.fromkeys(DASHBOARD_TEXTS + HEADER_TEXTS))

with open(FILE, "r") as f:
    content = f.read()

LANGUAGES = ["EN", "ES", "FR", "DE", "RU", "IT", "ZH_CN", "ZH_TW", "KO", "JA", "ID", "TR"]

for lang in LANGUAGES:
    # Find the dictionary by counting braces
    pattern = rf"^const {lang}: Record<string, string> = \{{"
    match = re.search(pattern, content, re.MULTILINE)
    if not match:
        print(f"\n=== {lang}: DICTIONARY NOT FOUND ===")
        continue
    
    start = match.start()
    brace_count = 0
    end = start
    for i in range(match.end() - 1, len(content)):
        if content[i] == '{':
            brace_count += 1
        elif content[i] == '}':
            brace_count -= 1
            if brace_count == 0:
                end = i + 1
                break
    
    dict_content = content[start:end]
    
    missing = []
    for s in ALL_TEXTS:
        escaped = re.escape(s)
        if not re.search(rf'"{escaped}"\s*:', dict_content):
            missing.append(s)
    
    if missing:
        print(f"\n=== {lang}: {len(missing)} MISSING ===")
        for m in missing:
            print(f"  - \"{m}\"")
    else:
        print(f"\n=== {lang}: ALL {len(ALL_TEXTS)} STRINGS PRESENT ===")
