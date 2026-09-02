import sqlite3, os
os.chdir('/home/z/my-project')
conn = sqlite3.connect('db/custom.db')
cur = conn.cursor()

cur.execute("SELECT itemId, name, categoryId, action, datetime(data/1000, 'unixepoch') as dt FROM ItemOverride WHERE action = 'add' ORDER BY data DESC")
rows = cur.fetchall()
print(f'Itens adicionados (action=add): {len(rows)}')
for r in rows:
    print(f'  {r[0]} | {r[1]} | cat:{r[2]} | {r[4]}')

cur.execute('SELECT action, COUNT(*) FROM ItemOverride GROUP BY action')
print(f'\nTotais por acao: {cur.fetchall()}')

# All overrides
cur.execute('SELECT COUNT(*) FROM ItemOverride')
print(f'Total geral de overrides: {cur.fetchone()[0]}')

conn.close()
