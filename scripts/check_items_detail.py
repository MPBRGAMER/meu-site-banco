import psycopg2
import json
from collections import defaultdict

DATABASE_URL = "postgresql://neondb_owner:npg_emS5JCcNK7tW@ep-soft-mouse-acta9yhb-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

print('--- Doador Bateria ---')
cur.execute("""SELECT id, nome, item, quantidade, data FROM \"Doador\" WHERE item ILIKE '%Bateria%'""")
for r in cur.fetchall():
    print(f'  {r[0][:25]} | {r[1]:15s} | {r[3]:>8d} | {r[4]}')

print('\n--- Doador Munição/Pistola ---')
cur.execute("""SELECT id, nome, item, quantidade, data FROM \"Doador\" 
    WHERE item ILIKE '%istola%' OR item ILIKE '%Muni%'""")
for r in cur.fetchall():
    print(f'  {r[0][:25]} | {r[1]:15s} | {r[2]:40s} | {r[3]:>8d} | {r[4]}')

print('\n--- Caixa Munição/Pistola ---')
cur.execute("""SELECT tipo, item, quantidade, origem, data FROM \"CaixaRegistro\" 
    WHERE item ILIKE '%istola%' OR item ILIKE '%Muni%'
    ORDER BY data""")
for r in cur.fetchall():
    print(f'  {r[0]:7s} | {r[1]:40s} | {r[2]:>8d} | {str(r[4])[:19]} | {r[3]}')

print('\n--- INVENTÁRIO FINAL (após correção) ---')
cur.execute("""
    SELECT item, 
           SUM(CASE WHEN tipo='entrada' THEN quantidade ELSE 0 END) as ent,
           SUM(CASE WHEN tipo='saida' THEN quantidade ELSE 0 END) as sai,
           SUM(CASE WHEN tipo='entrada' THEN quantidade ELSE -quantidade END) as saldo
    FROM "CaixaRegistro"
    GROUP BY item
    HAVING ABS(SUM(CASE WHEN tipo='entrada' THEN quantidade ELSE -quantidade END)) > 0
    ORDER BY saldo DESC
""")
for r in cur.fetchall():
    if r[3] > 0:
        print(f'{r[0]:40s} | ent:{r[1]:8d} | sai:{r[2]:8d} | saldo:{r[3]:8d}')

conn.close()
