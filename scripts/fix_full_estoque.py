#!/usr/bin/env python3
"""
Diagnostico completo: comparar backup com banco atual e corrigir estoque.
"""
import json
import uuid
import psycopg2

DB_URL = "postgresql://neondb_owner:npg_emS5JCcNK7tW@ep-soft-mouse-acta9yhb-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Carregar backup
with open('/home/z/my-project/upload/Pasted Content_1787112930191.txt', 'r') as f:
    backup = json.load(f)
backup_caixa = backup['data'].get('caixa', [])
backup_trocas = backup['data'].get('trocas', [])

conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

# 1. Estado atual no banco
print("=== CAIXA ATUAL NO BANCO (total de registros) ===")
cur.execute('SELECT COUNT(*) FROM "CaixaRegistro"')
print(f"  Total: {cur.fetchone()[0]} registros")

# 2. Listar TODOS os registros por item
print("\n=== ESTOQUE ATUAL (todos os itens com movimentacao) ===")
cur.execute('''
    SELECT item, 
           COALESCE(SUM(CASE WHEN tipo='entrada' THEN quantidade ELSE 0 END), 0) as ent,
           COALESCE(SUM(CASE WHEN tipo='saida' THEN quantidade ELSE 0 END), 0) as sai
    FROM "CaixaRegistro" 
    GROUP BY item 
    HAVING SUM(CASE WHEN tipo='entrada' THEN quantidade ELSE 0 END) != SUM(CASE WHEN tipo='saida' THEN quantidade ELSE 0 END)
    ORDER BY item
''')
rows = cur.fetchall()
print(f"  Itens com saldo diferente de zero: {len(rows)}")
for r in rows:
    saldo = r[1] - r[2]
    print(f"    {r[0]}: +{r[1]} -{r[2]} = {saldo:+d}")

# 3. Comparar backup vs banco para cada item do backup
print("\n=== COMPARACAO: BACKUP vs BANCO ATUAL ===")
backup_inventory = {}
for c in backup_caixa:
    item = c['item']
    if item not in backup_inventory:
        backup_inventory[item] = {'entrada': 0, 'saida': 0}
    if c['tipo'] == 'entrada':
        backup_inventory[item]['entrada'] += c['quantidade']
    else:
        backup_inventory[item]['saida'] += c['quantidade']

# Itens que DEVEM ter saldo diferente de zero no backup
print(f"  Itens com saldo no backup: {len(backup_inventory)}")
diferencas = []
for item in sorted(backup_inventory.keys()):
    b_e = backup_inventory[item]['entrada']
    b_s = backup_inventory[item]['saida']
    b_saldo = b_e - b_s
    
    cur.execute('''
        SELECT COALESCE(SUM(CASE WHEN tipo='entrada' THEN quantidade ELSE 0 END), 0),
               COALESCE(SUM(CASE WHEN tipo='saida' THEN quantidade ELSE 0 END), 0)
        FROM "CaixaRegistro" WHERE item = %s
    ''', (item,))
    row = cur.fetchone()
    a_e, a_s = row
    a_saldo = a_e - a_s
    
    if b_saldo != a_saldo:
        diferencas.append((item, b_e, b_s, b_saldo, a_e, a_s, a_saldo))
        print(f"  DIFERENCA: {item}")
        print(f"    Backup:  +{b_e} -{b_s} = {b_saldo:+d}")
        print(f"    Atual:   +{a_e} -{a_s} = {a_saldo:+d}")

# 4. Verificar itens negativos
print("\n=== ITENS COM SALDO NEGATIVO ===")
cur.execute('''
    SELECT item, 
           COALESCE(SUM(CASE WHEN tipo='entrada' THEN quantidade ELSE 0 END), 0) as ent,
           COALESCE(SUM(CASE WHEN tipo='saida' THEN quantidade ELSE 0 END), 0) as sai
    FROM "CaixaRegistro" 
    GROUP BY item 
    HAVING SUM(CASE WHEN tipo='entrada' THEN quantidade ELSE 0 END) < SUM(CASE WHEN tipo='saida' THEN quantidade ELSE 0 END)
    ORDER BY item
''')
negativos = cur.fetchall()
for r in negativos:
    saldo = r[1] - r[2]
    print(f"  {r[0]}: {saldo:+d}")

# 5. Verificar origens dos registros
print("\n=== DISTRIBUICAO POR ORIGEM ===")
cur.execute('SELECT origem, COUNT(*), SUM(quantidade) FROM "CaixaRegistro" GROUP BY origem ORDER BY COUNT(*) DESC')
for r in cur.fetchall():
    print(f"  {r[0]}: {r[1]} registros (total: {r[2]})")

# 6. Verificar se existem registros com origem='troca' (do backup antigo)
print("\n=== REGISTROS COM ORIGEM='troca' (backup antigo) ===")
cur.execute("SELECT id, tipo, descricao, item, quantidade, origem FROM \"CaixaRegistro\" WHERE origem = 'troca'")
old_troca = cur.fetchall()
print(f"  Encontrados: {len(old_troca)}")
for o in old_troca[:5]:
    print(f"    [{o[1]}] {o[4]}x {o[3]} | {o[5]} | {o[2][:50]}")
if len(old_troca) > 5:
    print(f"    ... e mais {len(old_troca)-5}")

cur.close()
conn.close()
print("\nDiagnostico completo!")
