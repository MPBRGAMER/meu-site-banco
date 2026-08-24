import uuid
import psycopg2

DB_URL = "postgresql://neondb_owner:npg_emS5JCcNK7tW@ep-soft-mouse-acta9yhb-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

# Verificar estado atual da Agua Limpa
cur.execute('SELECT id, tipo, descricao, quantidade, origem FROM "CaixaRegistro" WHERE item = %s', ('Água Limpa',))
rows = cur.fetchall()
print(f'Registros atuais de Agua Limpa: {len(rows)}')
for r in rows:
    print(f'  [{r[1]}] {r[3]:+d} | {r[4]} | {r[2]}')

# Verificar trocas banco
cur.execute("SELECT id, \"itemEnviado\", \"quantidadeEnviada\", \"itemRecebido\", \"quantidadeRecebida\", data FROM \"TrocaRegistro\" WHERE \"tipoMembro\" = 'banco'")
for t in cur.fetchall():
    tid, env, qe, rec, qr, data = t
    print(f'Troca banco: {qe}x {env} -> {qr}x {rec}')
    
    # Verificar se existe saida do itemEnviado com origem troca_banco
    cur.execute('SELECT id, tipo, quantidade FROM "CaixaRegistro" WHERE origem = %s AND item = %s AND tipo = %s', ('troca_banco', env, 'saida'))
    saida = cur.fetchone()
    cur.execute('SELECT id, tipo, quantidade FROM "CaixaRegistro" WHERE origem = %s AND item = %s AND tipo = %s', ('troca_banco', rec, 'entrada'))
    entrada = cur.fetchone()
    
    print(f'  Saidas troca_banco de {env}: {saida}')
    print(f'  Entradas troca_banco de {rec}: {entrada}')
    
    if not saida:
        new_id = str(uuid.uuid4())
        cur.execute('INSERT INTO "CaixaRegistro" (id, tipo, descricao, item, quantidade, origem, data) VALUES (%s, %s, %s, %s, %s, %s, %s)',
            (new_id, 'saida', f'Troca interna banco: saiu {qe}x {env}', env, qe, 'troca_banco', data))
        print(f'  CRIADA saida: {qe}x {env}')
    if not entrada:
        new_id = str(uuid.uuid4())
        cur.execute('INSERT INTO "CaixaRegistro" (id, tipo, descricao, item, quantidade, origem, data) VALUES (%s, %s, %s, %s, %s, %s, %s)',
            (new_id, 'entrada', f'Troca interna banco: entrou {qr}x {rec}', rec, qr, 'troca_banco', data))
        print(f'  CRIADA entrada: {qr}x {rec}')

conn.commit()

# Resultado final
print('\n=== ESTOQUE FINAL ===')
for item in ['Gelo', 'Bateria de Carro Quebrada', 'Massa', 'Agua Limpa']:
    cur.execute('SELECT COALESCE(SUM(CASE WHEN tipo=\'entrada\' THEN quantidade ELSE 0 END),0), COALESCE(SUM(CASE WHEN tipo=\'saida\' THEN quantidade ELSE 0 END),0) FROM "CaixaRegistro" WHERE item = %s', (item,))
    e, s = cur.fetchone()
    print(f'  {item}: +{e} -{s} = {e-s:+d}')

cur.close()
conn.close()
print('Pronto!')
