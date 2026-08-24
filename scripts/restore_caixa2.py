#!/usr/bin/env python3
import json, uuid, psycopg2
from psycopg2.extras import execute_values

DB_URL = 'postgresql://neondb_owner:npg_emS5JCcNK7tW@ep-soft-mouse-acta9yhb-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

with open('upload/Pasted Content_1787112930191.txt','r') as f:
    backup = json.load(f)
bc = backup['data'].get('caixa', [])

conn = psycopg2.connect(DB_URL, connect_timeout=10)
cur = conn.cursor()

# Re-importar backup em lote
rows = []
for c in bc:
    rows.append((str(uuid.uuid4()), c['tipo'], c['descricao'], c['item'], c['quantidade'], c.get('valor'), c['origem'], c['data']))

execute_values(cur,
    'INSERT INTO "CaixaRegistro" (id,tipo,descricao,item,quantidade,valor,origem,data) VALUES %s',
    rows)
conn.commit()
print(f'Importados {len(rows)} registros do backup')

# Troca banco 1: Massa -> Bateria de Carro Quebrada
cur.execute('SELECT "quantidadeEnviada","itemEnviado","quantidadeRecebida","itemRecebido",data FROM "TrocaRegistro" WHERE "tipoMembro"=' + "'banco' ORDER BY data")
for r in cur.fetchall():
    qe,env,qr,rec,data = r
    cur.execute('INSERT INTO "CaixaRegistro" (id,tipo,descricao,item,quantidade,origem,data) VALUES (%s,%s,%s,%s,%s,%s,%s)',
        (str(uuid.uuid4()),'saida',f'Troca interna banco: saiu {qe}x {env}',env,qe,'troca_banco',data))
    cur.execute('INSERT INTO "CaixaRegistro" (id,tipo,descricao,item,quantidade,origem,data) VALUES (%s,%s,%s,%s,%s,%s,%s)',
        (str(uuid.uuid4()),'entrada',f'Troca interna banco: entrou {qr}x {rec}',rec,qr,'troca_banco',data))
    print(f'  + {qe}x {env} -> {qr}x {rec}')

conn.commit()

# Verificar
print(f'\nTotal: {len(bc)+4} registros esperados')
cur.execute('SELECT COUNT(*) FROM "CaixaRegistro"')
print(f'Banco: {cur.fetchone()[0]}')

cur.execute('''SELECT item, SUM(CASE WHEN tipo=\'entrada\' THEN quantidade ELSE 0 END),
    SUM(CASE WHEN tipo=\'saida\' THEN quantidade ELSE 0 END)
    FROM "CaixaRegistro" GROUP BY item
    HAVING SUM(CASE WHEN tipo=\'entrada\' THEN quantidade ELSE 0 END) < SUM(CASE WHEN tipo=\'saida\' THEN quantidade ELSE 0 END)''')
neg = cur.fetchall()
print(f'Negativos: {len(neg)}')
for r in neg: print(f'  {r[0]}: {r[1]-r[2]:+d}')

cur.close(); conn.close()
print('Pronto!')
