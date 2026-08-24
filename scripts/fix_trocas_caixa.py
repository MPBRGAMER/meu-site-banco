#!/usr/bin/env python3
"""
Corrigir estoque: remover caixa antigos errados e criar os corretos para todas as trocas.
"""
import uuid
import psycopg2

DB_URL = "postgresql://neondb_owner:npg_emS5JCcNK7tW@ep-soft-mouse-acta9yhb-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

# 1. Remover todos os registros antigos do Caixa com origem='troca' (do backup, estavam errados)
print("=== REMOVENDO REGISTROS ANTIGOS ERRADOS DO CAIXA ===")
cur.execute("SELECT id, tipo, descricao, item, quantidade, origem FROM \"CaixaRegistro\" WHERE origem = 'troca'")
old = cur.fetchall()
print(f"  Encontrados {len(old)} registros antigos com origem='troca':")
for o in old:
    print(f"    [{o[1]}] {o[4]}x {o[3]} - {o[2]}")
    cur.execute('DELETE FROM "CaixaRegistro" WHERE id = %s', (o[0],))
print(f"  Removidos!")
conn.commit()

# 2. Buscar todas as trocas
print("\n=== TROCAS REGISTRADAS ===")
cur.execute('SELECT id, player, "itemEnviado", "quantidadeEnviada", "itemRecebido", "quantidadeRecebida", "tipoMembro", data FROM "TrocaRegistro" ORDER BY data ASC')
trocas = cur.fetchall()
print(f"Total: {len(trocas)} trocas\n")

# 3. Buscar caixa existentes com origem troca_banco
cur.execute("SELECT id, tipo, item, quantidade FROM \"CaixaRegistro\" WHERE origem = 'troca_banco'")
existing_banco = cur.fetchall()
print(f"Registros troca_banco ja existentes: {len(existing_banco)}")
for e in existing_banco:
    print(f"  [{e[1]}] {e[3]}x {e[2]}")

# 4. Para cada troca, verificar se os registros corretos existem e criar os faltantes
print("\n=== CRIANDO REGISTROS FALTANTES ===")
criados = 0

for t in trocas:
    tid, player, env, qtd_env, rec, qtd_rec, tipo, data = t
    
    # Pular as 2 trocas banco que ja foram corrigidas pelo deploy
    if tipo == "banco":
        # Verificar se ja tem os registros
        cur.execute("""
            SELECT tipo, item FROM "CaixaRegistro" 
            WHERE origem = 'troca_banco' AND item = %s
        """, (env,))
        has_saida_banco = cur.fetchone()
        
        cur.execute("""
            SELECT tipo, item FROM "CaixaRegistro" 
            WHERE origem = 'troca_banco' AND item = %s
        """, (rec,))
        has_entrada_banco = cur.fetchone()
        
        if has_saida_banco and has_entrada_banco:
            print(f"  OK [banco] {qtd_env}x {env} -> {qtd_rec}x {rec} (ja existe)")
            continue
    
    # Criar registros para trocas que faltam
    if tipo == "banco":
        # Troca interna do banco
        if not has_saida_banco:
            new_id = str(uuid.uuid4())
            cur.execute("""
                INSERT INTO "CaixaRegistro" (id, tipo, descricao, item, quantidade, origem, data)
                VALUES (%s, 'saida', %s, %s, %s, 'troca_banco', %s)
            """, (new_id, f"Troca interna banco: saiu {qtd_env}x {env} (correcao)", env, qtd_env, data))
            print(f"  + SAIDA: {qtd_env}x {env}")
            criados += 1
        if not has_entrada_banco:
            new_id = str(uuid.uuid4())
            cur.execute("""
                INSERT INTO "CaixaRegistro" (id, tipo, descricao, item, quantidade, origem, data)
                VALUES (%s, 'entrada', %s, %s, %s, 'troca_banco', %s)
            """, (new_id, f"Troca interna banco: entrou {qtd_rec}x {rec} (correcao)", rec, qtd_rec, data))
            print(f"  + ENTRADA: {qtd_rec}x {rec}")
            criados += 1
    else:
        # Troca com player: player envia item (banco recebe), banco envia item (banco perde)
        new_id1 = str(uuid.uuid4())
        new_id2 = str(uuid.uuid4())
        cur.execute("""
            INSERT INTO "CaixaRegistro" (id, tipo, descricao, item, quantidade, origem, data)
            VALUES (%s, 'entrada', %s, %s, %s, %s, %s)
        """, (new_id1, f"Troca de {player}: recebeu {qtd_env}x {env} (correcao)", env, qtd_env, f"troca:{player}", data))
        cur.execute("""
            INSERT INTO "CaixaRegistro" (id, tipo, descricao, item, quantidade, origem, data)
            VALUES (%s, 'saida', %s, %s, %s, %s, %s)
        """, (new_id2, f"Troca para {player}: entregou {qtd_rec}x {rec} (correcao)", rec, qtd_rec, f"troca:{player}", data))
        print(f"  + ENTRADA: {qtd_env}x {env} (de {player})")
        print(f"  + SAIDA: {qtd_rec}x {rec} (para {player})")
        criados += 2

conn.commit()
print(f"\n  Total de registros criados: {criados}")

# 5. Mostrar estoque atual dos itens envolvidos nas trocas
print("\n=== ESTOQUE ATUAL (itens envolvidos nas trocas) ===")
all_items = set()
for t in trocas:
    all_items.add(t[2])
    all_items.add(t[4])

for item in sorted(all_items):
    cur.execute("""
        SELECT 
            COALESCE(SUM(CASE WHEN tipo = 'entrada' THEN quantidade ELSE 0 END), 0),
            COALESCE(SUM(CASE WHEN tipo = 'saida' THEN quantidade ELSE 0 END), 0)
        FROM "CaixaRegistro" WHERE item = %s
    """, (item,))
    row = cur.fetchone()
    entrada, saida = row
    saldo = entrada - saida
    print(f"  {item}: +{entrada} -{saida} = {saldo}")

cur.close()
conn.close()
print("\nPronto!")
