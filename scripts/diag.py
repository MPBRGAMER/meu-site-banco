import json, psycopg2
DB_URL = 'postgresql://neondb_owner:npg_p8Gh2dWDSKcz@ep-empty-term-acoe3q5m-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require'
with open('upload/Pasted Content_1787112930191.txt','r') as f: backup=json.load(f)
bc=backup['data'].get('caixa',[])
conn=psycopg2.connect(DB_URL)
cur=conn.cursor()
print('=== DIFERENCAS: BACKUP vs ATUAL ===')
bi={}
for c in bc:
    it=c['item']
    if it not in bi: bi[it]={'e':0,'s':0}
    if c['tipo']=='entrada': bi[it]['e']+=c['quantidade']
    else: bi[it]['s']+=c['quantidade']
diffs=[]
for item in sorted(bi.keys()):
    be=bi[item]['e']; bs2=bi[item]['s']
    cur.execute("SELECT COALESCE(SUM(CASE WHEN tipo='entrada' THEN quantidade ELSE 0 END),0), COALESCE(SUM(CASE WHEN tipo='saida' THEN quantidade ELSE 0 END),0) FROM \"CaixaRegistro\" WHERE item=%s",(item,))
    r=cur.fetchone(); ae=r[0]; as2=r[1]
    bsal=be-bs2; asal=ae-as2
    if bsal!=asal:
        diffs.append(item)
        print(f'  {item}: backup={bsal:+d} atual={asal:+d} (ent b={be} at={ae} / sai b={bs2} at={as2})')
print(f'\nItens com diferenca: {len(diffs)}')
# Itens negativos
print('\n=== NEGATIVOS ===')
cur.execute("SELECT item, COALESCE(SUM(CASE WHEN tipo='entrada' THEN quantidade ELSE 0 END),0), COALESCE(SUM(CASE WHEN tipo='saida' THEN quantidade ELSE 0 END),0) FROM \"CaixaRegistro\" GROUP BY item HAVING SUM(CASE WHEN tipo='entrada' THEN quantidade ELSE 0 END) < SUM(CASE WHEN tipo='saida' THEN quantidade ELSE 0 END)")
for r in cur.fetchall(): print(f'  {r[0]}: {r[1]-r[2]:+d}')
# Origens
print('\n=== ORIGENS ===')
cur.execute("SELECT origem, COUNT(*) FROM \"CaixaRegistro\" GROUP BY origem ORDER BY COUNT(*) DESC")
for r in cur.fetchall(): print(f'  {r[0]}: {r[1]}')
cur.execute("SELECT COUNT(*) FROM \"CaixaRegistro\"")
print(f'\nTotal caixa: {cur.fetchone()[0]}')
cur.close(); conn.close()
