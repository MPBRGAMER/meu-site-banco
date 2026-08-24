import psycopg2
from collections import defaultdict

DATABASE_URL = "postgresql://neondb_owner:npg_emS5JCcNK7tW@ep-soft-mouse-acta9yhb-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

# Get ALL doadores with their IDs
cur.execute('SELECT id, nome, item, quantidade, data FROM "Doador" ORDER BY data ASC')
doador_entries = cur.fetchall()
print(f'Total doadores: {len(doador_entries)}')

# Get ALL caixa entries with doacao origem
cur.execute('''SELECT origem, item, quantidade, data FROM "CaixaRegistro" WHERE origem ILIKE 'doacao%%' ORDER BY data ASC''')
caixa_entries = cur.fetchall()

# Build a set of (origem, item, quantidade, approx_time) for quick lookup
caixa_matched = set()

# First pass: match by exact origem (doacao:playerId)
for d in doador_entries:
    doador_id = d[0]
    target_origem = f'doacao:{doador_id}'
    for c in caixa_entries:
        if c[0] == target_origem and c[1] == d[2] and c[2] == d[3]:
            caixa_matched.add(d[0])
            break

# Second pass: for unmatched, try generic 'doacao' origem with same item/qty within 5 seconds
for d in doador_entries:
    if d[0] in caixa_matched:
        continue
    for c in caixa_entries:
        if c[0] == 'doacao' and c[1] == d[2] and c[2] == d[3]:
            time_diff = abs((c[3] - d[4]).total_seconds())
            if time_diff < 5:
                caixa_matched.add(d[0])
                break

# Find missing
missing = [d for d in doador_entries if d[0] not in caixa_matched]
print(f'\nDoações SEM entrada no CaixaRegistro: {len(missing)}')
for m in missing:
    print(f'  {m[0]:25s} | {m[1]:15s} | {m[2]:40s} | {m[3]:>8d} | {m[4]}')

# Group by item
by_item = defaultdict(int)
for m in missing:
    by_item[m[2]] += m[3]

if by_item:
    print(f'\nResumo por item:')
    for item, total in sorted(by_item.items(), key=lambda x: -x[1]):
        print(f'  {item:40s} | faltando: {total:>10d}')

conn.close()
