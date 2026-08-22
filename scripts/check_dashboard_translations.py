#!/usr/bin/env python3
"""Check which Dashboard strings are missing from each language dictionary."""

import re

DASHBOARD_STRINGS = [
    "Posto de Trocas",
    "Sistema de gestao para sobreviventes",
    "Empréstimos Pendentes",
    "Empréstimos Pagos",
    "Investidores Ativos",
    "Trocas Realizadas",
    "Compras & Vendas",
    "Registros no Caixa",
    "Doadores",
    "Leilões Ativos",
    "Sorteios Ativos",
    "Eventos Ativos",
    "Lotérica",
    "Top 10 Doadores",
    "Nenhum doador cadastrado.",
    "Top 10 Investidores",
    "Nenhum investidor cadastrado.",
    "desde",
    "Top 10 Contribuintes",
    "Nenhum contribuinte ainda. Contribua reportando precos na aba Tabela!",
    "contribuicoes",
    "Estoque do Banco",
    "Buscar item...",
    "Nenhum item encontrado.",
    "Estoque vazio.",
    "Movimentos do Caixa",
    "registros",
    "Nenhum registro ainda.",
    "Carregando dados do banco...",
    # Header strings
    "POSTO DE TROCAS",
    "Posto de Trocas - Sobreviventes",
    "Day R Survival - Posto de Trocas",
    "Day R Survival",
    # Tab names that appear in dashboard
    "Dashboard",
    "Chat",
    "Tabela",
    "Empréstimos",
    "Trocas",
    "Investidores",
    "Config Trocas",
    "Estoque & Caixa",
    # Common
    "Carregando...",
    "total",
]

with open("/home/z/my-project/user-project/src/components/banco/TranslationPopup.tsx", "r") as f:
    content = f.read()

LANGUAGES = ["ES", "FR", "DE", "RU", "IT", "ZH_CN", "ZH_TW", "KO", "JA", "ID", "TR"]

for lang in LANGUAGES:
    # Find the start of this dictionary
    pattern = rf"^const {lang}: Record<string, string> = \{{"
    match = re.search(pattern, content, re.MULTILINE)
    if not match:
        print(f"\n=== {lang}: DICTIONARY NOT FOUND ===")
        continue
    
    # Find the end of this dictionary (matching closing brace)
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
    for s in DASHBOARD_STRINGS:
        # Check if this exact key exists in the dictionary
        escaped = re.escape(s)
        # Look for the key as a string key in the dict
        if re.search(rf'"{escaped}"\s*:', dict_content):
            continue
        else:
            missing.append(s)
    
    if missing:
        print(f"\n=== {lang}: {len(missing)} MISSING ===")
        for m in missing:
            print(f"  - \"{m}\"")
    else:
        print(f"\n=== {lang}: ALL DASHBOARD STRINGS PRESENT ===")
