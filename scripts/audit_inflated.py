import psycopg2
import json

DATABASE_URL = "postgresql://neondb_owner:npg_emS5JCcNK7tW@ep-soft-mouse-acta9yhb-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

# Check specific items - column order: id(0), tipo(1), descricao(2), item(3), quantidade(4), valor(5), data(6), origem(7)
items = ['Bateria Quebrada', 'Moedas Velhas', 'Municao de Pistola', 'Municao de Pistola', 'Muniçao de Pistola']

for item in items:
    cur.execute("""
        SELECT id, tipo, descricao, item, quantidade, valor, data, origem
        FROM "CaixaRegistro" 
        WHERE item ILIKE %s
        ORDER BY data ASC
    """, (f"%{item}%",))
    rows = cur.fetchall()
    if rows:
        print(f"\n=== Item: {item} ===")
        print(f"Total registros: {len(rows)}")
        total_entrada = sum(r[4] for r in rows if r[1] == 'entrada')
        total_saida = sum(r[4] for r in rows if r[1] == 'saida')
        print(f"Total entrada: {total_entrada}")
        print(f"Total saida: {total_saida}")
        print(f"Saldo: {total_entrada - total_saida}")
        for r in rows:
            print(f"  ID:{r[0]} | {r[1]:7s} | qty:{r[4]:6d} | origem:{r[7]:30s} | {r[6]}")

# Also get full inventory summary
print("\n\n=== INVENTÁRIO COMPLETO ===")
cur.execute("""
    SELECT item, 
           SUM(CASE WHEN tipo='entrada' THEN quantidade ELSE 0 END) as total_entrada,
           SUM(CASE WHEN tipo='saida' THEN quantidade ELSE 0 END) as total_saida,
           SUM(CASE WHEN tipo='entrada' THEN quantidade ELSE -quantidade END) as saldo,
           COUNT(*) as total_registros
    FROM "CaixaRegistro"
    GROUP BY item
    ORDER BY saldo DESC
""")
rows = cur.fetchall()
for r in rows:
    print(f"{r[0]:40s} | entrada:{r[1]:8d} | saida:{r[2]:8d} | saldo:{r[3]:8d} | regs:{r[4]}")

conn.close()
