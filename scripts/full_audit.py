import psycopg2
import json

DATABASE_URL = "postgresql://neondb_owner:npg_emS5JCcNK7tW@ep-soft-mouse-acta9yhb-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Load backup caixa IDs
with open('/home/z/my-project/upload/Pasted Content_1787112930191.txt') as f:
    backup = json.load(f)
backup_caixa = backup['data']['caixa']
backup_ids = set(c['id'] for c in backup_caixa)
print(f"Backup caixa entries: {len(backup_caixa)}")
print(f"Backup caixa IDs: {len(backup_ids)}")

conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

# Get all current caixa entries
cur.execute("SELECT id, tipo, descricao, item, quantidade, valor, data, origem FROM \"CaixaRegistro\" ORDER BY data ASC")
all_rows = cur.fetchall()
print(f"\nCurrent DB caixa entries: {len(all_rows)}")

# Find extra entries (not in backup)
extra_entries = []
for r in all_rows:
    if r[0] not in backup_ids:
        extra_entries.append(r)

print(f"\nExtra entries (NOT in backup): {len(extra_entries)}")
for r in extra_entries:
    print(f"  ID:{r[0]} | {r[1]:7s} | {r[3]:30s} | qty:{r[4]:6d} | origem:{r[7]:40s} | {r[6]}")

# Also show what the backup SAIDA entries look like in the current DB
print("\n\n=== Checking if backup saida entries exist in DB ===")
backup_saida_ids = [c['id'] for c in backup_caixa if c['tipo'] == 'saida']
print(f"Backup saida entries: {len(backup_saida_ids)}")
for sid in backup_saida_ids:
    cur.execute('SELECT id, tipo, item, quantidade, origem FROM "CaixaRegistro" WHERE id = %s', (sid,))
    row = cur.fetchone()
    if row:
        print(f"  FOUND: {row[0][:20]}... | {row[1]} | {row[2]} | {row[3]} | {row[4]}")
    else:
        print(f"  MISSING: {sid}")

# Calculate what the CORRECT inventory should be (backup only)
print("\n\n=== CORRECT INVENTORY (backup entries only) ===")
from collections import defaultdict
correct = defaultdict(lambda: {'entrada': 0, 'saida': 0})
for c in backup_caixa:
    item = c['item']
    if c['tipo'] == 'entrada':
        correct[item]['entrada'] += c['quantidade']
    else:
        correct[item]['saida'] += c['quantidade']

for item in sorted(correct.keys(), key=lambda x: correct[x]['entrada'] - correct[x]['saida'], reverse=True):
    saldo = correct[item]['entrada'] - correct[item]['saida']
    if saldo > 0:
        print(f"{item:40s} | ent:{correct[item]['entrada']:8d} | sai:{correct[item]['saida']:8d} | saldo:{saldo:8d}")

# Now compare with current DB
print("\n\n=== CURRENT DB INVENTORY vs CORRECT (backup) ===")
cur.execute("""
    SELECT item, 
           SUM(CASE WHEN tipo='entrada' THEN quantidade ELSE 0 END) as total_entrada,
           SUM(CASE WHEN tipo='saida' THEN quantidade ELSE 0 END) as total_saida,
           SUM(CASE WHEN tipo='entrada' THEN quantidade ELSE -quantidade END) as saldo
    FROM "CaixaRegistro"
    GROUP BY item
    ORDER BY saldo DESC
""")
db_rows = cur.fetchall()
db_inv = {r[0]: {'entrada': r[1], 'saida': r[2], 'saldo': r[3]} for r in db_rows}

# Show differences
print(f"{'Item':40s} | {'Backup':>10s} | {'DB atual':>10s} | {'Diferença':>10s}")
print("-" * 80)
all_items = sorted(set(list(correct.keys()) + list(db_inv.keys())))
for item in all_items:
    b_saldo = correct.get(item, {'entrada': 0, 'saida': 0})['entrada'] - correct.get(item, {'entrada': 0, 'saida': 0})['saida']
    d_saldo = db_inv.get(item, {'saldo': 0})['saldo']
    diff = d_saldo - b_saldo
    if diff != 0:
        print(f"{item:40s} | {b_saldo:10d} | {d_saldo:10d} | {diff:+10d}")

conn.close()