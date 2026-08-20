import psycopg2
from datetime import datetime
import uuid

DATABASE_URL = "postgresql://neondb_owner:npg_p8Gh2dWDSKcz@ep-empty-term-acoe3q5m-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require"

conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

# The 2 missing doacoes from DARK07
missing = [
    {
        'id': 'cmsjvi8z7006is601kpbum4mm',
        'nome': 'DARK07',
        'item': 'Moedas Velhas',
        'quantidade': 10000,
        'data': datetime(2026, 8, 8, 4, 28, 12, 403000),
    },
    {
        'id': 'cmsjviwh1006js601sji79mot',
        'nome': 'DARK07',
        'item': 'Moedas Velhas',
        'quantidade': 10000,
        'data': datetime(2026, 8, 8, 4, 28, 42, 853000),
    },
]

for m in missing:
    entry_id = str(uuid.uuid4())
    cur.execute('''
        INSERT INTO "CaixaRegistro" (id, tipo, descricao, item, quantidade, valor, data, origem)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    ''', (
        entry_id,
        'entrada',
        f'Doação de {m["nome"]}',
        m['item'],
        m['quantidade'],
        None,
        m['data'],
        f'doacao:{m["id"]}',
    ))
    print(f'Created: {entry_id} | {m["item"]} x{m["quantidade"]} | doacao:{m["id"]}')

conn.commit()

# Verify
print('\n=== VERIFICAÇÃO ===')
cur.execute('''SELECT item, SUM(quantidade) as total FROM "CaixaRegistro" WHERE item ILIKE '%%Moeda%%' GROUP BY item''')
for r in cur.fetchall():
    print(f'{r[0]}: {r[1]}')

conn.close()
print('\nPronto! As 2 doações faltantes foram adicionadas ao CaixaRegistro.')
