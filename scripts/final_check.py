import psycopg2
import json
from collections import defaultdict

DATABASE_URL = "postgresql://neondb_owner:npg_emS5JCcNK7tW@ep-soft-mouse-acta9yhb-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

# Check ALL entries for the 3 items + any items with "Moeda" or "istola"
print("=== TODOS OS REGISTROS DE CAIXA (items com nome parecido) ===")
cur.execute('''
    SELECT tipo, item, quantidade, origem, data 
    FROM "CaixaRegistro" 
    WHERE item ILIKE '%%Bateria%%' OR item ILIKE '%%Moeda%%' OR item ILIKE '%%istola%%' OR item ILIKE '%%Muni%%'
    ORDER BY item, data ASC
''')
for r in cur.fetchall():
    print(f"  {r[1]:40s} | {r[0]:7s} | {r[2]:>8d} | {r[3]:30s} | {str(r[4])[:19]}")

# Check TrocaRegistro for items given/received that affect these
print("\n=== TROCAS que envolvem esses itens ===")
cur.execute('''
    SELECT "player", "itemEnviado", "quantidadeEnviada", "itemRecebido", "quantidadeRecebida", "tipoMembro", data
    FROM "TrocaRegistro"
    WHERE "itemEnviado" ILIKE '%%Bateria%%' OR "itemRecebido" ILIKE '%%Bateria%%'
       OR "itemEnviado" ILIKE '%%Moeda%%' OR "itemRecebido" ILIKE '%%Moeda%%'
       OR "itemEnviado" ILIKE '%%istola%%' OR "itemRecebido" ILIKE '%%istola%%'
       OR "itemEnviado" ILIKE '%%Muni%%' OR "itemRecebido" ILIKE '%%Muni%%'
    ORDER BY data ASC
''')
for r in cur.fetchall():
    print(f"  {str(r[6])[:19]} | {r[0]:15s} | envia:{r[1]:30s} x{r[2]:>6d} | recebe:{r[3]:30s} x{r[4]:>6d} | {r[5]}")

# Check if the addTroca API also creates lucro entries (check API route)
print("\n=== TOTAL CAIXA REGISTROS: ===")
cur.execute('SELECT COUNT(*) FROM "CaixaRegistro"')
print(f"Total: {cur.fetchone()[0]}")

# Show all entries with origem containing 'troca'
print("\n=== TODOS OS REGISTROS COM ORIGEM 'troca' ===")
cur.execute('''
    SELECT tipo, item, quantidade, origem, data 
    FROM "CaixaRegistro" 
    WHERE origem ILIKE '%%troca%%'
    ORDER BY data ASC
''')
for r in cur.fetchall():
    print(f"  {str(r[4])[:19]} | {r[0]:7s} | {r[1]:30s} | {r[2]:>8d} | {r[3]}")

conn.close()