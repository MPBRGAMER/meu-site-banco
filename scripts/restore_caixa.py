#!/usr/bin/env python3
"""
Restaurar caixa do backup + adicionar so as 2 trocas banco novas.
"""
import json
import uuid
import psycopg2

DB_URL = 'postgresql://neondb_owner:npg_emS5JCcNK7tW@ep-soft-mouse-acta9yhb-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

with open('upload/Pasted Content_1787112930191.txt','r') as f:
    backup = json.load(f)

backup_caixa = backup['data'].get('caixa', [])
print(f'Backup tem {len(backup_caixa)} registros de caixa')

conn = psycopg2.connect(DB_URL, connect_timeout=10)
cur = conn.cursor()

# 1. Limpar TUDO do CaixaRegistro
cur.execute('SELECT COUNT(*) FROM "CaixaRegistro"')
old_count = cur.fetchone()[0]
print(f'Apagando {old_count} registros atuais...')
cur.execute('DELETE FROM "CaixaRegistro"')
conn.commit()
print('Limpo!')

# 2. Re-importar os 245 do backup
print(f'Importando {len(backup_caixa)} registros do backup...')
for c in backup_caixa:
    new_id = str(uuid.uuid4())
    cur.execute(
        'INSERT INTO "CaixaRegistro" (id, tipo, descricao, item, quantidade, valor, origem, data) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)',
        (new_id, c['tipo'], c['descricao'], c['item'], c['quantidade'], c.get('valor'), c['origem'], c['data'])
    )
conn.commit()
print('Backup importado!')

# 3. Adicionar as 2 trocas banco novas (de hoje)
print('Adicionando trocas banco de hoje...')

# Troca 1: 100000x Massa -> 100000x Bateria de Carro Quebrada
cur.execute("SELECT id FROM \"TrocaRegistro\" WHERE \"tipoMembro\"='banco' AND \"itemEnviado\"='Massa'")
t1 = cur.fetchone()
if t1:
    cur.execute("SELECT \"itemEnviado\", \"quantidadeEnviada\", \"itemRecebido\", \"quantidadeRecebida\", data FROM \"TrocaRegistro\" WHERE id=%s", (t1[0],))
    r = cur.fetchone()
    if r:
        env, qe, rec, qr, data = r
        # Verificar se ja existe
        cur.execute("SELECT COUNT(*) FROM \"CaixaRegistro\" WHERE origem='troca_banco' AND item=%s AND tipo='saida'", (env,))
        if cur.fetchone()[0] == 0:
            cur.execute('INSERT INTO "CaixaRegistro" (id,tipo,descricao,item,quantidade,origem,data) VALUES (%s,%s,%s,%s,%s,%s,%s)',
                (str(uuid.uuid4()), 'saida', f'Troca interna banco: saiu {qe}x {env}', env, qe, 'troca_banco', data))
            print(f'  + SAIDA: {qe}x {env}')
        cur.execute("SELECT COUNT(*) FROM \"CaixaRegistro\" WHERE origem='troca_banco' AND item=%s AND tipo='entrada'", (rec,))
        if cur.fetchone()[0] == 0:
            cur.execute('INSERT INTO "CaixaRegistro" (id,tipo,descricao,item,quantidade,origem,data) VALUES (%s,%s,%s,%s,%s,%s,%s)',
                (str(uuid.uuid4()), 'entrada', f'Troca interna banco: entrou {qr}x {rec}', rec, qr, 'troca_banco', data))
            print(f'  + ENTRADA: {qr}x {rec}')

# Troca 2: 10000x Agua Limpa -> 10000x Gelo
cur.execute("SELECT id FROM \"TrocaRegistro\" WHERE \"tipoMembro\"='banco' AND \"itemEnviado\" LIKE '%%Agua%%'")
t2 = cur.fetchone()
if t2:
    cur.execute("SELECT \"itemEnviado\", \"quantidadeEnviada\", \"itemRecebido\", \"quantidadeRecebida\", data FROM \"TrocaRegistro\" WHERE id=%s", (t2[0],))
    r = cur.fetchone()
    if r:
        env, qe, rec, qr, data = r
        cur.execute("SELECT COUNT(*) FROM \"CaixaRegistro\" WHERE origem='troca_banco' AND item=%s AND tipo='saida'", (env,))
        if cur.fetchone()[0] == 0:
            cur.execute('INSERT INTO "CaixaRegistro" (id,tipo,descricao,item,quantidade,origem,data) VALUES (%s,%s,%s,%s,%s,%s,%s)',
                (str(uuid.uuid4()), 'saida', f'Troca interna banco: saiu {qe}x {env}', env, qe, 'troca_banco', data))
            print(f'  + SAIDA: {qe}x {env}')
        cur.execute("SELECT COUNT(*) FROM \"CaixaRegistro\" WHERE origem='troca_banco' AND item=%s AND tipo='entrada'", (rec,))
        if cur.fetchone()[0] == 0:
            cur.execute('INSERT INTO "CaixaRegistro" (id,tipo,descricao,item,quantidade,origem,data) VALUES (%s,%s,%s,%s,%s,%s,%s)',
                (str(uuid.uuid4()), 'entrada', f'Troca interna banco: entrou {qr}x {rec}', rec, qr, 'troca_banco', data))
            print(f'  + ENTRADA: {qr}x {rec}')

conn.commit()

# 4. Verificar resultado final
print(f'\nTotal final: {len(backup_caixa) + 4} registros')
cur.execute('SELECT COUNT(*) FROM "CaixaRegistro"')
print(f'Banco: {cur.fetchone()[0]} registros')

print('\n=== ESTOQUE FINAL ===')
cur.execute('''SELECT item, 
    COALESCE(SUM(CASE WHEN tipo=\'entrada\' THEN quantidade ELSE 0 END),0) as e,
    COALESCE(SUM(CASE WHEN tipo=\'saida\' THEN quantidade ELSE 0 END),0) as s
    FROM "CaixaRegistro" 
    GROUP BY item 
    HAVING (COALESCE(SUM(CASE WHEN tipo=\'entrada\' THEN quantidade ELSE 0 END),0) - 
           COALESCE(SUM(CASE WHEN tipo=\'saida\' THEN quantidade ELSE 0 END),0)) != 0
    ORDER BY item''')
for r in cur.fetchall():
    print(f'  {r[0]}: {r[1]-r[2]:+d}')

# Negativos
cur.execute('''SELECT item FROM "CaixaRegistro" 
    GROUP BY item 
    HAVING COALESCE(SUM(CASE WHEN tipo=\'entrada\' THEN quantidade ELSE 0 END),0) < 
           COALESCE(SUM(CASE WHEN tipo=\'saida\' THEN quantidade ELSE 0 END),0)''')
neg = cur.fetchall()
print(f'\nNegativos: {len(neg)}')
for r in neg: print(f'  {r[0]}')

cur.close(); conn.close()
print('\nPronto!')
