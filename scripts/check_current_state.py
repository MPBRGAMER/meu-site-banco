import psycopg2
import json

DATABASE_URL = "postgresql://neondb_owner:npg_emS5JCcNK7tW@ep-soft-mouse-acta9yhb-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

# Total entries
print("=== ESTADO ATUAL DO DB ===")
cur.execute('SELECT COUNT(*) FROM "CaixaRegistro"')
print(f"Total CaixaRegistro: {cur.fetchone()[0]}")

# Check the 3 specific items the user mentioned
items_to_check = [
    'Bateria de Carro Quebrada',
    'Moedas Velhas', 
    'Munição de Pistola',
    'Municao de Pistola',
]

print("\n=== ITENS MENCIONADOS PELO USUÁRIO ===")
for item in items_to_check:
    cur.execute('''
        SELECT tipo, SUM(quantidade), COUNT(*), array_agg(origem ORDER BY data)
        FROM "CaixaRegistro" 
        WHERE item = %s
        GROUP BY tipo
    ''', (item,))
    rows = cur.fetchall()
    if rows:
        total = sum(r[1] if r[0] == 'entrada' else -r[1] for r in rows)
        print(f"\n{item} => SALDO: {total}")
        for r in rows:
            print(f"  {r[0]}: {r[1]} ({r[2]} regs) origens: {r[3]}")

# Show ALL entries sorted by date DESC (most recent first) to see newest entries
print("\n\n=== ÚLTIMAS 20 ENTRADAS (mais recentes) ===")
cur.execute('SELECT tipo, item, quantidade, origem, data FROM "CaixaRegistro" ORDER BY data DESC LIMIT 20')
for r in cur.fetchall():
    print(f"  {str(r[4])[:19]} | {r[0]:7s} | {r[1]:30s} | {r[2]:>8d} | {r[3]}")

# Full inventory top 20
print("\n\n=== ESTOQUE COMPLETO (top 30 por saldo) ===")
cur.execute('''
    SELECT item, 
           SUM(CASE WHEN tipo='entrada' THEN quantidade ELSE 0 END) as ent,
           SUM(CASE WHEN tipo='saida' THEN quantidade ELSE 0 END) as sai,
           SUM(CASE WHEN tipo='entrada' THEN quantidade ELSE -quantidade END) as saldo
    FROM "CaixaRegistro"
    GROUP BY item
    HAVING SUM(CASE WHEN tipo='entrada' THEN quantidade ELSE -quantidade END) != 0
    ORDER BY saldo DESC
    LIMIT 30
''')
for r in cur.fetchall():
    print(f"{r[0]:40s} | ent:{r[1]:8d} | sai:{r[2]:8d} | saldo:{r[3]:8d}")

conn.close()