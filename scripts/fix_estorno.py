#!/usr/bin/env python3
"""
Corrigir estornos errados de trocas banco que nunca tiveram caixa.
Limpar estornos incorretos e garantir que os valores de Gelo, Bateria, Massa e Agua Limpa estao corretos.
"""
import uuid
import psycopg2

DB_URL = "postgresql://neondb_owner:npg_p8Gh2dWDSKcz@ep-empty-term-acoe3q5m-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require"

conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

# 1. Listar TODOS os registros de caixa envolvidos nas trocas banco
print("=== REGISTROS ATUAIS (antes da correcao) ===")
items_to_check = ['Gelo', 'Bateria de Carro Quebrada', 'Massa', 'Agua Limpa']
for item in items_to_check:
    print(f'\n--- {item} ---')
    cur.execute('SELECT id, tipo, descricao, quantidade, origem, data FROM "CaixaRegistro" WHERE item = %s ORDER BY data ASC', (item,))
    rows = cur.fetchall()
    if not rows:
        print('  (vazio)')
        continue
    for r in rows:
        rid, tipo, desc, qtd, origem, data = r
        print(f'  [{tipo}] {qtd:+d} | {origem} | {desc[:70]}')

# 2. Remover estornos incorretos (de trocas que nunca tiveram caixa)
print('\n=== REMOVENDO ESTORNOS INCORRETOS ===')
cur.execute("SELECT id, tipo, item, quantidade, descricao FROM \"CaixaRegistro\" WHERE origem LIKE 'estorno_troca%'")
estornos = cur.fetchall()
for e in estornos:
    print(f'  Removendo: [{e[1]}] {e[3]:+d}x {e[2]} - {e[4][:60]}')
    cur.execute('DELETE FROM "CaixaRegistro" WHERE id = %s', (e[0],))
conn.commit()
print(f'  {len(estornos)} estornos removidos')

# 3. Remover as correcao duplicadas (do script anterior)
print('\n=== REMOVENDO CORRECOES DUPLICADAS ===')
cur.execute("SELECT id, tipo, item, quantidade, descricao FROM \"CaixaRegistro\" WHERE descricao LIKE '%(correcao)%'")
correcoes = cur.fetchall()
for c in correcoes:
    print(f'  Removendo: [{c[1]}] {c[3]:+d}x {c[2]} - {c[4][:60]}')
    cur.execute('DELETE FROM "CaixaRegistro" WHERE id = %s', (c[0],))
conn.commit()
print(f'  {len(correcoes)} correcoes removidas')

# 4. Verificar o que sobrou
print('\n=== REGISTROS APOS LIMPEZA ===')
for item in items_to_check:
    print(f'\n--- {item} ---')
    cur.execute('SELECT tipo, SUM(quantidade) FROM "CaixaRegistro" WHERE item = %s GROUP BY tipo ORDER BY tipo', (item,))
    rows = cur.fetchall()
    if not rows:
        print('  (vazio)')
        continue
    total_e = 0
    total_s = 0
    for r in rows:
        if r[0] == 'entrada': total_e += r[1]
        else: total_s += r[1]
        print(f'  {r[0]}: {r[1]}')
    print(f'  SALDO: {total_e - total_s:+d}')

# 5. Verificar as trocas banco existentes
print('\n=== TROCAS BANCO EXISTENTES ===')
cur.execute("SELECT id, \"itemEnviado\", \"quantidadeEnviada\", \"itemRecebido\", \"quantidadeRecebida\", data FROM \"TrocaRegistro\" WHERE \"tipoMembro\" = 'banco'")
banco_trocas = cur.fetchall()
for t in banco_trocas:
    print(f'  {t[5]} | {t[2]}x {t[1]} -> {t[4]}x {t[3]}')

# 6. Verificar se os caixa para trocas banco estao corretos
print('\n=== VERIFICANDO CAIXA PARA TROCAS BANCO ===')
for t in banco_trocas:
    tid, env, qtd_env, rec, qtd_rec, data = t
    cur.execute('SELECT tipo, SUM(quantidade) FROM "CaixaRegistro" WHERE origem = %s AND item = %s GROUP BY tipo', ('troca_banco', env))
    saida_env = cur.fetchone()
    cur.execute('SELECT tipo, SUM(quantidade) FROM "CaixaRegistro" WHERE origem = %s AND item = %s GROUP BY tipo', ('troca_banco', rec))
    entrada_rec = cur.fetchone()
    
    saida_ok = saida_env and saida_env[0] == 'saida' and saida_env[1] == qtd_env
    entrada_ok = entrada_rec and entrada_rec[0] == 'entrada' and entrada_rec[1] == qtd_rec
    
    status = 'OK' if (saida_ok and entrada_ok) else 'FALTANDO'
    print(f'  {qtd_env}x {env} -> {qtd_rec}x {rec}: {status}')
    if not saida_ok: print(f'    -> Falta saida de {qtd_env}x {env}')
    if not entrada_ok: print(f'    -> Falta entrada de {qtd_rec}x {rec}')

# 7. Criar qualquer registro que ainda falte
print('\n=== CRIANDO REGISTROS AINDA FALTANTES ===')
for t in banco_trocas:
    tid, env, qtd_env, rec, qtd_rec, data = t
    cur.execute('SELECT tipo, SUM(quantidade) FROM "CaixaRegistro" WHERE origem = %s AND item = %s GROUP BY tipo', ('troca_banco', env))
    saida_env = cur.fetchone()
    cur.execute('SELECT tipo, SUM(quantidade) FROM "CaixaRegistro" WHERE origem = %s AND item = %s GROUP BY tipo', ('troca_banco', rec))
    entrada_rec = cur.fetchone()
    
    saida_ok = saida_env and saida_env[0] == 'saida' and saida_env[1] == qtd_env
    entrada_ok = entrada_rec and entrada_rec[0] == 'entrada' and entrada_rec[1] == qtd_rec
    
    if not saida_ok:
        new_id = str(uuid.uuid4())
        cur.execute('INSERT INTO "CaixaRegistro" (id, tipo, descricao, item, quantidade, origem, data) VALUES (%s, %s, %s, %s, %s, %s, %s)',
            (new_id, 'saida', f'Troca interna banco: saiu {qtd_env}x {env}', env, qtd_env, 'troca_banco', data))
        print(f'  + SAIDA: {qtd_env}x {env}')
    if not entrada_ok:
        new_id = str(uuid.uuid4())
        cur.execute('INSERT INTO "CaixaRegistro" (id, tipo, descricao, item, quantidade, origem, data) VALUES (%s, %s, %s, %s, %s, %s, %s)',
            (new_id, 'entrada', f'Troca interna banco: entrou {qtd_rec}x {rec}', rec, qtd_rec, 'troca_banco', data))
        print(f'  + ENTRADA: {qtd_rec}x {rec}')

conn.commit()

# 8. Resultado final
print('\n=== ESTOQUE FINAL CORRIGIDO ===')
for item in items_to_check:
    cur.execute('SELECT COALESCE(SUM(CASE WHEN tipo=\'entrada\' THEN quantidade ELSE 0 END),0), COALESCE(SUM(CASE WHEN tipo=\'saida\' THEN quantidade ELSE 0 END),0) FROM "CaixaRegistro" WHERE item = %s', (item,))
    row = cur.fetchone()
    e, s = row
    print(f'  {item}: +{e} -{s} = {e - s:+d}')

cur.close()
conn.close()
print('\nPronto! Estoque corrigido.')
