import psycopg2
import json

DATABASE_URL = "postgresql://neondb_owner:npg_p8Gh2dWDSKcz@ep-empty-term-acoe3q5m-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require"

conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

# First, get ALL caixa entries with full details
cur.execute("""
    SELECT id, "tipo", "item", quantidade, "origem", "descricao", "createdAt", "updatedAt"
    FROM "CaixaRegistro"
    ORDER BY "createdAt" ASC
""")
rows = cur.fetchall()

print(f"Total de registros no CaixaRegistro: {len(rows)}")
print()

# Group by item
from collections import defaultdict
items = defaultdict(lambda: {"entrada": [], "saida": [], "total_entrada": 0, "total_saida": 0})

for row in rows:
    rid, tipo, item, qtd, origem, desc, created, updated = row
    key = f"{'E' if tipo == 'entrada' else 'S'}|{qtd}|{origem or 'N/A'}|{created.strftime('%Y-%m-%d %H:%M') if created else 'N/A'}"
    if tipo == "entrada":
        items[item]["entrada"].append(key)
        items[item]["total_entrada"] += qtd
    else:
        items[item]["saida"].append(key)
        items[item]["total_saida"] += qtd

# Show all items with their entries
print("=== TODOS OS ITENS NO CAIXA ===")
for item, data in sorted(items.items()):
    saldo = data["total_entrada"] - data["total_saida"]
    print(f"\n{'='*60}")
    print(f"ITEM: {item} | Saldo: {saldo} (Entrada: {data['total_entrada']}, Saida: {data['total_saida']})")
    print(f"  ENTRADAS ({len(data['entrada'])}):")
    for e in data["entrada"]:
        print(f"    {e}")
    print(f"  SAIDAS ({len(data['saida'])}):")
    for s in data["saida"]:
        print(f"    {s}")

# Specifically show the problematic items
print(f"\n\n{'#'*60}")
print("ITENS PROBLEMATICOS ESPECIFICOS:")
print(f"{'#'*60}")
for prob_item in ["Bateria Quebrada", "Moedas Velhas", "Municao de Pistola", "Munição de Pistola", "Trapos", "Lixa"]:
    for item in items:
        if prob_item.lower() in item.lower():
            data = items[item]
            saldo = data["total_entrada"] - data["total_saida"]
            print(f"\n{item}: Saldo={saldo}, Entradas={data['total_entrada']}, Saidas={data['total_saida']}")
            print(f"  Entradas: {data['entrada']}")
            print(f"  Saidas: {data['saida']}")

cur.close()
conn.close()