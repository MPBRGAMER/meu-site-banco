import psycopg2
import json
from collections import defaultdict

DATABASE_URL = "postgresql://neondb_owner:npg_emS5JCcNK7tW@ep-soft-mouse-acta9yhb-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Load backup
with open('/home/z/my-project/upload/Pasted Content_1787112930191.txt') as f:
    backup = json.load(f)
backup_caixa = backup['data']['caixa']

conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

# Get current DB entries
cur.execute('SELECT tipo, item, quantidade, origem, data FROM "CaixaRegistro" ORDER BY data ASC')
db_rows = cur.fetchall()

# Build backup inventory
backup_inv = defaultdict(lambda: {'entrada': 0, 'saida': 0, 'entries': []})
for c in backup_caixa:
    backup_inv[c['item']][c['tipo']] += c['quantidade']
    backup_inv[c['item']]['entries'].append(f"{c['tipo'][:3]} {c['quantidade']:>8d}  {c['origem']:30s}  {c['data'][:19]}")

# Build DB inventory
db_inv = defaultdict(lambda: {'entrada': 0, 'saida': 0, 'entries': []})
for r in db_rows:
    db_inv[r[1]][r[0]] += r[2]
    db_inv[r[1]]['entries'].append(f"{r[0][:3]} {r[2]:>8d}  {r[3]:30s}  {str(r[4])[:19]}")

# Find items with differences
all_items = sorted(set(list(backup_inv.keys()) + list(db_inv.keys())))

print("=== ITENS COM DIFERENÇA ENTRE BACKUP E DB ===")
print(f"{'Item':40s} | {'BKP ent':>8s} | {'BKP sai':>8s} | {'BKP sal':>8s} | {'DB ent':>8s} | {'DB sai':>8s} | {'DB sal':>8s} | {'DIFF':>8s}")
print("-" * 130)

for item in all_items:
    b = backup_inv[item]
    d = db_inv[item]
    b_sal = b['entrada'] - b['saida']
    d_sal = d['entrada'] - d['saida']
    diff = d_sal - b_sal
    if diff != 0:
        print(f"{item:40s} | {b['entrada']:8d} | {b['saida']:8d} | {b_sal:8d} | {d['entrada']:8d} | {d['saida']:8d} | {d_sal:8d} | {diff:+8d}")

# Show detailed entries for user's 3 problematic items
print("\n\n=== DETALHES: BATERIA DE CARRO QUEBRADA ===")
for e in db_inv['Bateria de Carro Quebrada']['entries']:
    print(f"  {e}")

print("\n=== DETALHES: MOEDAS VELHAS ===")
for e in db_inv['Moedas Velhas']['entries']:
    print(f"  {e}")

print("\n=== DETALHES: MUNIÇÃO DE PISTOLA ===")
for item_key in db_inv:
    if 'istola' in item_key.lower():
        print(f"\n--- {item_key} ---")
        for e in db_inv[item_key]['entries']:
            print(f"  {e}")

# Also check if there are entries in TrocaRegistro that affect these items
print("\n\n=== TROCAS NO BANCO (TrocaRegistro) ===")
cur.execute('SELECT id, "player", "itemEnviado", "quantidadeEnviada", "itemRecebido", "quantidadeRecebida", "tipoMembro", data FROM "TrocaRegistro" ORDER BY data ASC')
trocas = cur.fetchall()
print(f"Total trocas: {len(trocas)}")
for t in trocas:
    print(f"  {str(t[7])[:19]} | {t[1]:15s} | envia:{t[2]:30s} x{t[3]:>6d} | recebe:{t[4]:30s} x{t[5]:>6d} | {t[6]}")

conn.close()