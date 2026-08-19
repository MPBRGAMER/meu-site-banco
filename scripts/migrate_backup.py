#!/usr/bin/env python3
"""
Migra dados do backup JSON (dayr-banco-backup-v1) para o Neon PostgreSQL.
"""

import json
import sys

try:
    import psycopg2
    from psycopg2.extras import execute_values
except ImportError:
    print("Instalando psycopg2...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "psycopg2-binary", "-q"])
    import psycopg2
    from psycopg2.extras import execute_values

DB_URL = "postgresql://neondb_owner:npg_p8Gh2dWDSKcz@ep-empty-term-acoe3q5m-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require"

BACKUP_FILE = "/home/z/my-project/upload/Pasted Content_1787112930191.txt"


def connect():
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = False
    return conn


def safe_date(val):
    """Converte string ISO para datetime, ou retorna None."""
    if val is None:
        return None
    return val


def migrate():
    # Carregar backup
    with open(BACKUP_FILE, "r", encoding="utf-8") as f:
        backup = json.load(f)

    data = backup.get("data", {})
    print(f"Backup carregado: {backup.get('format')} de {backup.get('exportedAt')}")

    conn = connect()
    cur = conn.cursor()
    total_inserted = 0

    try:
        # === Investidor (6 registros) ===
        rows = data.get("investidores", [])
        if rows:
            values = [(r["id"], r["nome"], r["dataEntrada"], r["status"], r.get("observacao"), r.get("ordem", 0)) for r in rows]
            execute_values(cur, """
                INSERT INTO \"Investidor\" (id, nome, \"dataEntrada\", status, observacao, ordem)
                VALUES %s
                ON CONFLICT (id) DO NOTHING
            """, values)
            print(f"  Investidor: {len(rows)} registros")
            total_inserted += len(rows)

        # === TabelaTroca (25 registros) ===
        rows = data.get("tabelasTroca", [])
        if rows:
            values = [(r["id"], r["itemBase"], r["quantidadeBase"], r["itemResultado"], r["quantidadeResultado"], r.get("categoria")) for r in rows]
            execute_values(cur, """
                INSERT INTO \"TabelaTroca\" (id, \"itemBase\", \"quantidadeBase\", \"itemResultado\", \"quantidadeResultado\", categoria)
                VALUES %s
                ON CONFLICT (id) DO NOTHING
            """, values)
            print(f"  TabelaTroca: {len(rows)} registros")
            total_inserted += len(rows)

        # === TrocaRegistro (18 registros) ===
        rows = data.get("trocas", [])
        if rows:
            values = [(r["id"], r["player"], r["itemEnviado"], r["quantidadeEnviada"], r["itemRecebido"], r["quantidadeRecebida"], r["tipoMembro"], r["taxaAplicada"], r["lucroBanco"], r["data"]) for r in rows]
            execute_values(cur, """
                INSERT INTO \"TrocaRegistro\" (id, player, \"itemEnviado\", \"quantidadeEnviada\", \"itemRecebido\", \"quantidadeRecebida\", \"tipoMembro\", \"taxaAplicada\", \"lucroBanco\", data)
                VALUES %s
                ON CONFLICT (id) DO NOTHING
            """, values)
            print(f"  TrocaRegistro: {len(rows)} registros")
            total_inserted += len(rows)

        # === CompraVenda (9 registros) ===
        rows = data.get("comprasVendas", [])
        if rows:
            values = [(r["id"], r["tipo"], r["player"], r["item"], r["quantidade"], r.get("itemPagamento"), r["valor"], r["data"], r.get("observacao")) for r in rows]
            execute_values(cur, """
                INSERT INTO \"CompraVenda\" (id, tipo, player, item, quantidade, \"itemPagamento\", valor, data, observacao)
                VALUES %s
                ON CONFLICT (id) DO NOTHING
            """, values)
            print(f"  CompraVenda: {len(rows)} registros")
            total_inserted += len(rows)

        # === CaixaRegistro (245 registros) ===
        rows = data.get("caixa", [])
        if rows:
            values = [(r["id"], r["tipo"], r["descricao"], r["item"], r["quantidade"], r.get("valor"), r["data"], r["origem"]) for r in rows]
            execute_values(cur, """
                INSERT INTO \"CaixaRegistro\" (id, tipo, descricao, item, quantidade, valor, data, origem)
                VALUES %s
                ON CONFLICT (id) DO NOTHING
            """, values)
            print(f"  CaixaRegistro: {len(rows)} registros")
            total_inserted += len(rows)

        # === Doador (212 registros) ===
        rows = data.get("doadores", [])
        if rows:
            values = [(r["id"], r["nome"], r["item"], r["quantidade"], r["data"], r.get("ordem", 0)) for r in rows]
            execute_values(cur, """
                INSERT INTO \"Doador\" (id, nome, item, quantidade, data, ordem)
                VALUES %s
                ON CONFLICT (id) DO NOTHING
            """, values)
            print(f"  Doador: {len(rows)} registros")
            total_inserted += len(rows)

        # === Emprestimo (0 registros) ===
        rows = data.get("emprestimos", [])
        if rows:
            values = [(r["id"], r["player"], r["item"], r["quantidade"], r["dataEmprestimo"], r.get("tipoMembro", "comum"), r.get("status", "pendente"), r.get("dataPagamento"), r.get("itemPagamento"), r.get("quantidadePaga")) for r in rows]
            execute_values(cur, """
                INSERT INTO \"Emprestimo\" (id, player, item, quantidade, \"dataEmprestimo\", \"tipoMembro\", status, \"dataPagamento\", \"itemPagamento\", \"quantidadePaga\")
                VALUES %s
                ON CONFLICT (id) DO NOTHING
            """, values)
            print(f"  Emprestimo: {len(rows)} registros")
            total_inserted += len(rows)

        # === PriceReport (16 registros) ===
        rows = data.get("priceReports", [])
        if rows:
            values = [(r["id"], r["itemId"], r["itemName"], r["nickname"], r["steelQty"], r["steelPrice"], r["cementQty"], r["cementPrice"], r["data"]) for r in rows]
            execute_values(cur, """
                INSERT INTO \"PriceReport\" (id, \"itemId\", \"itemName\", nickname, \"steelQty\", \"steelPrice\", \"cementQty\", \"cementPrice\", data)
                VALUES %s
                ON CONFLICT (id) DO NOTHING
            """, values)
            print(f"  PriceReport: {len(rows)} registros")
            total_inserted += len(rows)

        # === ChatMensagem (6 registros) ===
        rows = data.get("chatMensagens", [])
        if rows:
            values = [(r["id"], r["canal"], r.get("salaId"), r["autor"], r["conteudo"], r["data"], r.get("isAdmin", False)) for r in rows]
            execute_values(cur, """
                INSERT INTO \"ChatMensagem\" (id, canal, \"salaId\", autor, conteudo, data, \"isAdmin\")
                VALUES %s
                ON CONFLICT (id) DO NOTHING
            """, values)
            print(f"  ChatMensagem: {len(rows)} registros")
            total_inserted += len(rows)

        # === Leilao (0 registros) ===
        rows = data.get("leiloes", [])
        if rows:
            values = [(r["id"], r["donoItem"], r["nomeItem"], r.get("imagemUrl"), r["quantidade"], r["valorInicial"], r["moedaAceita"], r.get("taxaCasa", 15), r.get("status", "ativo"), r["dataCriacao"], r["dataExpiracao"], r.get("dataUltimoLance"), r.get("vencedor"), r.get("valorVencedor"), r.get("tipoMembroVencedor"), r.get("tipoOrigem", "comum")) for r in rows]
            execute_values(cur, """
                INSERT INTO \"Leilao\" (id, \"donoItem\", \"nomeItem\", \"imagemUrl\", quantidade, \"valorInicial\", \"moedaAceita\", \"taxaCasa\", status, \"dataCriacao\", \"dataExpiracao\", \"dataUltimoLance\", vencedor, \"valorVencedor\", \"tipoMembroVencedor\", \"tipoOrigem\")
                VALUES %s
                ON CONFLICT (id) DO NOTHING
            """, values)
            print(f"  Leilao: {len(rows)} registros")
            total_inserted += len(rows)

        # === Lance (0 registros) ===
        rows = data.get("lances", [])
        if rows:
            values = [(r["id"], r["leilaoId"], r["jogador"], r["valor"], r["data"]) for r in rows]
            execute_values(cur, """
                INSERT INTO \"Lance\" (id, \"leilaoId\", jogador, valor, data)
                VALUES %s
                ON CONFLICT (id) DO NOTHING
            """, values)
            print(f"  Lance: {len(rows)} registros")
            total_inserted += len(rows)

        # === Sorteio (0 registros) ===
        rows = data.get("sorteios", [])
        if rows:
            values = [(r["id"], r["nomeItem"], r["quantidade"], r["duracaoMinutos"], r.get("status", "ativo"), r["dataCriacao"], r.get("dataFim"), r.get("ganhador")) for r in rows]
            execute_values(cur, """
                INSERT INTO \"Sorteio\" (id, \"nomeItem\", quantidade, \"duracaoMinutos\", status, \"dataCriacao\", \"dataFim\", ganhador)
                VALUES %s
                ON CONFLICT (id) DO NOTHING
            """, values)
            print(f"  Sorteio: {len(rows)} registros")
            total_inserted += len(rows)

        # === ParticipanteSorteio (0 registros) ===
        rows = data.get("participantesSorteio", [])
        if rows:
            values = [(r["id"], r["sorteioId"], r["jogador"], r["data"]) for r in rows]
            execute_values(cur, """
                INSERT INTO \"ParticipanteSorteio\" (id, \"sorteioId\", jogador, data)
                VALUES %s
                ON CONFLICT (id) DO NOTHING
            """, values)
            print(f"  ParticipanteSorteio: {len(rows)} registros")
            total_inserted += len(rows)

        # === Loterica (0 registros) ===
        rows = data.get("lotericas", [])
        if rows:
            values = [(r["id"], r.get("status", "vendas_abertas"), r["valorNumero"], r["moedaAceita"], r.get("premioMinimo", 0), r.get("premioAcumulado", 0), r.get("duracaoMinutos", 60), r["dataCriacao"], r.get("dataFimVendas"), r.get("dataSorteio"), r.get("numeroSorteado"), r.get("ganhador"), r.get("valorPremio", 0), r.get("arrecadadoTotal", 0)) for r in rows]
            execute_values(cur, """
                INSERT INTO \"Loterica\" (id, status, \"valorNumero\", \"moedaAceita\", \"premioMinimo\", \"premioAcumulado\", \"duracaoMinutos\", \"dataCriacao\", \"dataFimVendas\", \"dataSorteio\", \"numeroSorteado\", ganhador, \"valorPremio\", \"arrecadadoTotal\")
                VALUES %s
                ON CONFLICT (id) DO NOTHING
            """, values)
            print(f"  Loterica: {len(rows)} registros")
            total_inserted += len(rows)

        # === NumeroLoterica (0 registros) ===
        rows = data.get("numerosLoterica", [])
        if rows:
            values = [(r["id"], r["lotericaId"], r["numero"], r.get("comprador"), r.get("dataCompra")) for r in rows]
            execute_values(cur, """
                INSERT INTO \"NumeroLoterica\" (id, \"lotericaId\", numero, comprador, \"dataCompra\")
                VALUES %s
                ON CONFLICT (id) DO NOTHING
            """, values)
            print(f"  NumeroLoterica: {len(rows)} registros")
            total_inserted += len(rows)

        # === ItemOverride (0 registros) ===
        rows = data.get("itemOverrides", [])
        if rows:
            values = [(r["id"], r["itemId"], r.get("name"), r.get("categoryId"), r.get("img"), r.get("wikiLink"), r.get("steel"), r.get("cement"), r.get("rarity"), r.get("demand"), r.get("notes"), r.get("action", "edit"), r["data"]) for r in rows]
            execute_values(cur, """
                INSERT INTO \"ItemOverride\" (id, \"itemId\", name, \"categoryId\", img, \"wikiLink\", steel, cement, rarity, demand, notes, action, data)
                VALUES %s
                ON CONFLICT (id) DO NOTHING
            """, values)
            print(f"  ItemOverride: {len(rows)} registros")
            total_inserted += len(rows)

        # === ChatSala (0 registros) ===
        rows = data.get("chatSalas", [])
        if rows:
            values = [(r["id"], r["nome"], r["criadoPor"], r.get("senha"), r["dataCriacao"]) for r in rows]
            execute_values(cur, """
                INSERT INTO \"ChatSala\" (id, nome, \"criadoPor\", senha, \"dataCriacao\")
                VALUES %s
                ON CONFLICT (id) DO NOTHING
            """, values)
            print(f"  ChatSala: {len(rows)} registros")
            total_inserted += len(rows)

        # === Propaganda (0 registros) ===
        rows = data.get("propagandas", [])
        if rows:
            values = [(r["id"], r["slotId"], r.get("codigo", ""), r["updatedAt"]) for r in rows]
            execute_values(cur, """
                INSERT INTO \"Propaganda\" (id, \"slotId\", codigo, \"updatedAt\")
                VALUES %s
                ON CONFLICT (id) DO NOTHING
            """, values)
            print(f"  Propaganda: {len(rows)} registros")
            total_inserted += len(rows)

        conn.commit()
        print(f"\nMigração concluída! Total inserido: {total_inserted} registros")

    except Exception as e:
        conn.rollback()
        print(f"\nERRO na migração: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    migrate()
