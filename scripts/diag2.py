import json, psycopg2
DB_URL = 'postgresql://neondb_owner:npg_emS5JCcNK7tW@ep-soft-mouse-acta9yhb-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
with open('upload/Pasted Content_1787112930191.txt','r') as f: backup=json.load(f)
bc=backup['data'].get('caixa',[])
conn=psycopg2.connect(DB_URL, connect_timeout=10)
conn.autocommit = True
cur=conn.cursor()

# Contar total
cur.execute('SELECT COUNT(*) FROM "CaixaRegistro"')
print(f'Total caixa registros: {cur.fetchone()[0]}')

# Origens
cur.execute("SELECT origem, COUNT(*) FROM \"CaixaRegistro\" GROUP BY origem ORDER BY COUNT(*) DESC")
for r in cur.fetchall(): print(f'  {r[0]}: {r[1]}')

# Negativos
cur.execute("SELECT item FROM \"CaixaRegistro\" WHERE tipo='saida' GROUP BY item HAVING SUM(quantidade) > (SELECT COALESCE(SUM(quantidade),0) FROM \"CaixaRegistro\" c2 WHERE c2.item=\"CaixaRegistro\".item AND c2.tipo='entrada')")
neg=cur.fetchall()
print(f'\nNegativos: {len(neg)}')
for r in neg: print(f'  {r[0]}')

cur.close(); conn.close()
