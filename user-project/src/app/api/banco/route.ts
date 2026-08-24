import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 10;

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function err(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const ACTION_PERMISSIONS: Record<string, string> = {
  addEmprestimo: "emprestimos", updateEmprestimo: "emprestimos", deleteEmprestimo: "emprestimos",
  addInvestidor: "investidores", removeInvestidor: "investidores", reorderInvestidores: "investidores",
  addTabelaTroca: "config-trocas", removeTabelaTroca: "config-trocas",
  addTroca: "trocas", removeTroca: "trocas",
  addCompraVenda: "compras-vendas",
  addDoador: "doadores", removeDoador: "doadores", reorderDoadores: "doadores",
  addCaixaManual: "caixa",
  addLeilao: "leiloes", updateLeilao: "leiloes", removeLeilao: "leiloes",
  addSorteio: "sorteios", sortear: "sorteios", removeSorteio: "sorteios",
  criarLoterica: "loterica", iniciarSorteioLoterica: "loterica", finalizarLoterica: "loterica",
};

const SUPER_ADMIN_ONLY = new Set(["resetAll","backup","restoreBackup","bulkInsertDoadores","createModerador","updateModerador","removeModerador","setupModeradores"]);

function generateToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}


export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const action = searchParams.get("action");

  try {
    switch (action) {
      case "verifyAdmin": {
        const pwd = searchParams.get("password");
        if (!pwd) return err("Senha obrigatória", 401);
        if (pwd !== ADMIN_PASSWORD) return err("Senha incorreta", 403);
        return json({ success: true });
      }

      // === UNIFIED LOAD ALL - 1 request instead of 14+ ===
      case "loadAll": {
        const sinceParam = searchParams.get("since");
        const since = sinceParam ? new Date(sinceParam) : null;

        // If no 'since' param, return all data (full load)
        // If 'since' provided, only return data changed after that timestamp
        const [emprestimos, investidores, tabelasTroca, trocas, comprasVendas, caixa, doadores, leiloes, lances, sorteios, lotericaActive, allLoterica, reporterRanking] =
          await Promise.all([
            db.emprestimo.findMany({
              orderBy: { dataEmprestimo: "desc" },
            }),
            db.investidor.findMany({
              where: { status: "ativo" },
              orderBy: { ordem: "desc" },
            }),
            db.tabelaTroca.findMany(),
            db.trocaRegistro.findMany({
              orderBy: { data: "desc" },
            }),
            db.compraVenda.findMany({
              orderBy: { data: "desc" },
            }),
            db.caixaRegistro.findMany({
              orderBy: { data: "desc" },
            }),
            db.doador.findMany({
              orderBy: { ordem: "desc" },
            }),
            db.leilao.findMany({
              orderBy: { dataCriacao: "desc" },
            }),
            db.lance.findMany({
              orderBy: { valor: "desc" },
            }),
            db.sorteio.findMany({
              orderBy: { dataCriacao: "desc" },
            }),
            db.loterica.findMany({
              where: { status: { in: ["vendas_abertas", "sorteio_realizado"] } },
              orderBy: { dataCriacao: "desc" },
              take: 1,
            }),
            db.loterica.findMany({
              orderBy: { dataCriacao: "desc" },
            }),
            // Reporter ranking via Prisma (avoid raw SQL table name issues)
            db.priceReport.groupBy({
              by: ["nickname"],
              _count: { id: true },
              _max: { data: true },
              orderBy: { _count: { id: "desc" } },
              take: 10,
            }),
          ]);

        // Build historico with counts (avoid N+1 by using includes or parallel counts)
        const [historicoSorteios, lotericaWithCounts] = await Promise.all([
          // Sorteio participant counts via Prisma
          Promise.all(
            sorteios.filter((s) => s.status === "finalizado").map(async (s) => {
              const count = await db.participanteSorteio.count({ where: { sorteioId: s.id } });
              return { ...s, totalParticipantes: count };
            })
          ),
          // Loterica sold counts via Prisma
          Promise.all(
            allLoterica.map(async (l) => {
              const count = await db.numeroLoterica.count({ where: { lotericaId: l.id, comprador: { not: null } } });
              return { ...l, totalVendidos: count };
            })
          ),
        ]);

        // Get loterica numeros if there's an active loterica
        let lotericaNumeros: unknown[] = [];
        if (lotericaActive.length > 0) {
          lotericaNumeros = await db.numeroLoterica.findMany({
            where: { lotericaId: lotericaActive[0].id },
            orderBy: { numero: "asc" },
          });
        }

        // Compute server timestamp for delta polling
        const serverNow = new Date().toISOString();

        return json({
          emprestimos,
          investidores,
          tabelasTroca,
          trocas,
          comprasVendas,
          caixa,
          doadores,
          leiloes,
          lances,
          sorteios,
          loterica: lotericaActive.length > 0 ? lotericaActive[0] : null,
          lotericaNumeros,
          historicoSorteios,
          historicoLoterica: lotericaWithCounts,
          reporterRanking: reporterRanking.map((r: any) => ({
            nickname: r.nickname,
            count: r._count.id,
            lastReport: r._max.data?.toISOString?.() || "",
          })),
          _ts: serverNow,
        });
      }

      case "listEmprestimos": {
        const data = await db.emprestimo.findMany({
          orderBy: { dataEmprestimo: "desc" },
        });
        return json(data);
      }
      case "listInvestidores": {
        const data = await db.investidor.findMany({
          where: { status: "ativo" },
          orderBy: { ordem: "desc" },
        });
        return json(data);
      }
      case "listTabelasTroca": {
        const data = await db.tabelaTroca.findMany();
        return json(data);
      }
      case "listTrocas": {
        const data = await db.trocaRegistro.findMany({
          orderBy: { data: "desc" },
        });
        return json(data);
      }
      case "listComprasVendas": {
        const data = await db.compraVenda.findMany({
          orderBy: { data: "desc" },
        });
        return json(data);
      }
      case "listCaixa": {
        const data = await db.caixaRegistro.findMany({
          orderBy: { data: "desc" },
        });
        return json(data);
      }
      case "listDoadores": {
        const data = await db.doador.findMany({
          orderBy: { ordem: "desc" },
        });
        return json(data);
      }
      case "listLeiloes": {
        const data = await db.leilao.findMany({
          orderBy: { dataCriacao: "desc" },
        });
        return json(data);
      }
      case "listLances": {
        const leilaoId = searchParams.get("leilaoId");
        if (!leilaoId) return err("leilaoId obrigatório");
        const data = await db.lance.findMany({
          where: { leilaoId },
          orderBy: { valor: "desc" },
        });
        return json(data);
      }
      case "listAllLances": {
        const data = await db.lance.findMany({
          orderBy: { valor: "desc" },
        });
        return json(data);
      }
      case "listItemCatalogo": {
        try {
          const data = await db.itemCatalogo.findMany({
            orderBy: { nome: "asc" },
          });
          return json(data);
        } catch {
          // Tabela pode ainda não existir
          return json([]);
        }
      }
      case "listSorteios": {
        const data = await db.sorteio.findMany({
          orderBy: { dataCriacao: "desc" },
        });
        return json(data);
      }
      case "getHistoricoSorteios": {
        const sorteios = await db.sorteio.findMany({
          where: { status: "finalizado" },
          orderBy: { dataCriacao: "desc" },
        });
        const historico = await Promise.all(
          sorteios.map(async (s) => {
            const count = await db.participanteSorteio.count({
              where: { sorteioId: s.id },
            });
            return { ...s, totalParticipantes: count };
          })
        );
        return json(historico);
      }
      case "listParticipantes": {
        const sorteioId = searchParams.get("sorteioId");
        if (!sorteioId) return err("sorteioId obrigatório");
        const data = await db.participanteSorteio.findMany({
          where: { sorteioId },
          orderBy: { data: "desc" },
        });
        return json(data);
      }
      case "getLoterica": {
        const data = await db.loterica.findMany({
          where: { status: { in: ["vendas_abertas", "sorteio_realizado"] } },
          orderBy: { dataCriacao: "desc" },
          take: 1,
        });
        return json(data);
      }
      case "getAllLoterica": {
        const data = await db.loterica.findMany({
          orderBy: { dataCriacao: "desc" },
        });
        const historico = await Promise.all(
          data.map(async (l) => {
            const numsVendidos = await db.numeroLoterica.count({
              where: { lotericaId: l.id, comprador: { not: null } },
            });
            return { ...l, totalVendidos: numsVendidos };
          })
        );
        return json(historico);
      }
      case "getNumerosLoterica": {
        const lotericaId = searchParams.get("lotericaId");
        if (!lotericaId) return err("lotericaId obrigatório");
        const data = await db.numeroLoterica.findMany({
          where: { lotericaId },
          orderBy: { numero: "asc" },
        });
        return json(data);
      }
      case "getPriceReports": {
        const itemId = searchParams.get("itemId");
        const where = itemId ? { itemId } : {};
        const data = await db.priceReport.findMany({
          where,
          orderBy: { data: "desc" },
          take: 200,
        });
        return json(data);
      }
      case "getReporterRanking": {
        const reports = await db.priceReport.findMany({
          orderBy: { data: "desc" },
        });
        const grouped: Record<string, { nickname: string; count: number; lastReport: string }> = {};
        for (const r of reports) {
          const key = r.nickname.toLowerCase();
          if (!grouped[key]) {
            grouped[key] = { nickname: r.nickname, count: 0, lastReport: r.data.toISOString() };
          }
          grouped[key].count++;
          if (r.data > new Date(grouped[key].lastReport)) {
            grouped[key].lastReport = r.data.toISOString();
          }
        }
        const ranking = Object.values(grouped)
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
        return json(ranking);
      }
      case "getAd": {
        const slotId = searchParams.get("slotId");
        if (!slotId) return err("slotId obrigatório");
        const ad = await db.propaganda.findUnique({ where: { slotId } });
        return json({ slotId, codigo: ad?.codigo || "" });
      }
      case "getAllAds": {
        const ads = await db.propaganda.findMany();
        const map: Record<string, string> = {};
        for (const a of ads) {
          if (a.codigo) map[a.slotId] = a.codigo;
        }
        return NextResponse.json(map, {
          headers: { "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30" },
        });
      }
      // SSE kept for compatibility but no longer triggers full reloads
      case "events": {
        const stream = new ReadableStream({
          start(controller) {
            const interval = setInterval(() => {
              try {
                controller.enqueue(`data: ${JSON.stringify({ t: Date.now() })}\n\n`);
              } catch {
                clearInterval(interval);
                controller.close();
              }
            }, 30000); // Reduced from 5s to 30s
            req.signal.addEventListener("abort", () => {
              clearInterval(interval);
              controller.close();
            });
          },
        });
        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
          },
        });
      }
      default:
        return err("Ação GET desconhecida: " + action);
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro interno";
    return err(msg, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ...data } = body;

    if (!action) return err("Campo 'action' é obrigatório");

    const PUBLIC_ACTIONS = new Set([
      "participarSorteio",
      "comprarNumero",
      "addLance",
      "reportPrice",
      "loginModerador",
      "logoutModerador",
      "setModeradorSenha",
    ]);

    if (!PUBLIC_ACTIONS.has(action)) {
      const adminPwd = req.headers.get("x-admin-password");
      const modToken = req.headers.get("x-moderador-token");
      let isSuperAdmin = false;
      let modPermissoes: string[] | null = null;

      if (adminPwd && adminPwd === ADMIN_PASSWORD) {
        isSuperAdmin = true;
      } else if (modToken) {
        try {
          const mod = await db.moderador.findFirst({ where: { token: modToken, ativo: true, tokenExpira: { gt: new Date() } } });
          if (!mod) return err("Sessão expirada. Faça login novamente.", 401);
          modPermissoes = JSON.parse(mod.permissoes);
        } catch { return err("Sessão inválida.", 401); }
      } else {
        return err("Não autorizado", 403);
      }

      if (SUPER_ADMIN_ONLY.has(action) && !isSuperAdmin) {
        return err("Apenas o Super Admin pode fazer isso.", 403);
      }
      if (!isSuperAdmin && modPermissoes) {
        const requiredPerm = ACTION_PERMISSIONS[action];
        if (requiredPerm && !modPermissoes.includes(requiredPerm)) {
          return err("Sem permissão para: " + action, 403);
        }
      }
    }

    switch (action) {
      case "addEmprestimo": {
        const { player, item, quantidade, dataEmprestimo, tipoMembro, status } = data;
        if (!player || !item || !quantidade) return err("Campos obrigatórios: player, item, quantidade");
        const emp = await db.emprestimo.create({
          data: {
            player, item,
            quantidade: Number(quantidade),
            dataEmprestimo: dataEmprestimo ? new Date(dataEmprestimo) : new Date(),
            tipoMembro: tipoMembro || "comum",
            status: status || "pendente",
          },
        });
        return json(emp);
      }
      case "updateEmprestimo": {
        const { id, status, dataPagamento, itemPagamento, quantidadePaga } = data;
        if (!id) return err("id obrigatório");
        const updateData: Record<string, unknown> = {};
        if (status) updateData.status = status;
        if (dataPagamento) updateData.dataPagamento = new Date(dataPagamento);
        if (itemPagamento) updateData.itemPagamento = itemPagamento;
        if (quantidadePaga !== undefined) updateData.quantidadePaga = Number(quantidadePaga);
        const emp = await db.emprestimo.update({ where: { id }, data: updateData });
        return json(emp);
      }
      case "addInvestidor": {
        const { nome, observacao } = data;
        if (!nome) return err("nome obrigatório");
        const inv = await db.investidor.create({
          data: { nome, observacao: observacao || null, ordem: 0 },
        });
        return json(inv);
      }
      case "removeInvestidor": {
        const { id } = data;
        if (!id) return err("id obrigatório");
        await db.investidor.delete({ where: { id } });
        return json({ success: true });
      }
      case "reorderInvestidores": {
        const { updates } = data;
        if (!Array.isArray(updates)) return err("updates deve ser array");
        for (const u of updates) {
          await db.investidor.update({ where: { id: u.id }, data: { ordem: u.ordem } });
        }
        return json({ success: true });
      }
      case "addTabelaTroca": {
        const { itemBase, quantidadeBase, itemResultado, quantidadeResultado, categoria } = data;
        if (!itemBase || !quantidadeBase || !itemResultado || !quantidadeResultado) {
          return err("Campos obrigatórios: itemBase, quantidadeBase, itemResultado, quantidadeResultado");
        }
        const tab = await db.tabelaTroca.create({
          data: {
            itemBase, quantidadeBase: Number(quantidadeBase),
            itemResultado, quantidadeResultado: Number(quantidadeResultado),
            categoria: categoria || null,
          },
        });
        return json(tab);
      }
      case "removeTabelaTroca": {
        const { id } = data;
        if (!id) return err("id obrigatório");
        await db.tabelaTroca.delete({ where: { id } });
        return json({ success: true });
      }
      case "addTroca": {
        const { player, itemEnviado, quantidadeEnviada, itemRecebido, quantidadeRecebida, tipoMembro, taxaAplicada, lucroBanco } = data;
        if (!player || !itemEnviado || !quantidadeEnviada || !itemRecebido || !quantidadeRecebida) {
          return err("Campos obrigatórios: player, itemEnviado, quantidadeEnviada, itemRecebido, quantidadeRecebida");
        }
        const troca = await db.trocaRegistro.create({
          data: {
            player, itemEnviado, quantidadeEnviada: Number(quantidadeEnviada),
            itemRecebido, quantidadeRecebida: Number(quantidadeRecebida),
            tipoMembro: tipoMembro || "comum",
            taxaAplicada: Number(taxaAplicada) || 0,
            lucroBanco: Number(lucroBanco) || 0,
          },
        });
        return json(troca);
      }
      case "removeTroca": {
        const { id } = data;
        if (!id) return err("id obrigatório");
        await db.trocaRegistro.delete({ where: { id } });
        return json({ success: true });
      }
      case "addCompraVenda": {
        const { tipo, player, item, quantidade, itemPagamento, valor, observacao } = data;
        if (!tipo || !player || !item || !quantidade || valor === undefined) {
          return err("Campos obrigatórios: tipo, player, item, quantidade, valor");
        }
        const cv = await db.compraVenda.create({
          data: {
            tipo, player, item, quantidade: Number(quantidade),
            itemPagamento: itemPagamento || null,
            valor: Number(valor), observacao: observacao || null,
          },
        });
        return json(cv);
      }
      case "addCaixa": {
        const { tipo, descricao, item, quantidade, valor, origem } = data;
        if (!tipo || !descricao || !item || !quantidade || !origem) {
          return err("Campos obrigatórios: tipo, descricao, item, quantidade, origem");
        }
        const reg = await db.caixaRegistro.create({
          data: {
            tipo, descricao, item, quantidade: Number(quantidade),
            valor: valor !== undefined ? Number(valor) : null, origem,
          },
        });
        return json(reg);
      }
      case "resetCaixa": {
        await db.caixaRegistro.deleteMany();
        await db.emprestimo.deleteMany();
        await db.trocaRegistro.deleteMany();
        await db.compraVenda.deleteMany();
        await db.doador.deleteMany();
        return json({ success: true });
      }
      case "addDoador": {
        const { nome, item, quantidade } = data;
        if (!nome || !item || !quantidade) return err("Campos obrigatórios: nome, item, quantidade");
        const doador = await db.doador.create({
          data: { nome, item, quantidade: Number(quantidade), ordem: 0 },
        });
        return json(doador);
      }
      case "reorderDoadores": {
        const { updates } = data;
        if (!Array.isArray(updates)) return err("updates deve ser array");
        for (const u of updates) {
          await db.doador.update({ where: { id: u.id }, data: { ordem: u.ordem } });
        }
        return json({ success: true });
      }
      case "removeDoador": {
        const { id } = data;
        if (!id) return err("id obrigatório");
        const doador = await db.doador.findUnique({ where: { id } });
        if (doador) {
          await db.caixaRegistro.create({
            data: {
              tipo: "saida",
              descricao: `Estorno doação removida - ${doador.nome}`,
              item: doador.item, quantidade: doador.quantidade,
              origem: `estorno_doacao:${doador.id}`,
            },
          });
        }
        await db.doador.delete({ where: { id } });
        return json({ success: true });
      }
      case "addLeilao": {
        const { donoItem, nomeItem, imagemUrl, quantidade, valorInicial, moedaAceita, taxaCasa, dataExpiracao, tipoOrigem } = data;
        if (!donoItem || !nomeItem || valorInicial === undefined || !moedaAceita || !dataExpiracao) {
          return err("Campos obrigatórios: donoItem, nomeItem, valorInicial, moedaAceita, dataExpiracao");
        }
        const leilao = await db.leilao.create({
          data: {
            donoItem, nomeItem, imagemUrl: imagemUrl || null,
            quantidade: Number(quantidade) || 1,
            valorInicial: Number(valorInicial), moedaAceita,
            taxaCasa: Number(taxaCasa) || 15,
            dataExpiracao: new Date(dataExpiracao),
            tipoOrigem: tipoOrigem || "comum",
          },
        });
        return json(leilao);
      }
      case "updateLeilao": {
        const { id, ...updateData } = data;
        if (!id) return err("id obrigatório");
        const cleaned: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(updateData)) {
          if (v !== undefined && v !== null) {
            if (k === "valorVencedor") cleaned[k] = Number(v);
            else cleaned[k] = v;
          }
        }
        const leilao = await db.leilao.update({ where: { id }, data: cleaned });
        return json(leilao);
      }
      case "removeLeilao": {
        const { id } = data;
        if (!id) return err("id obrigatório");
        await db.leilao.delete({ where: { id } });
        return json({ success: true });
      }
      case "addLance": {
        const { leilaoId, jogador, valor } = data;
        if (!leilaoId || !jogador || valor === undefined) {
          return err("Campos obrigatórios: leilaoId, jogador, valor");
        }
        const leilao = await db.leilao.findUnique({ where: { id: leilaoId } });
        if (!leilao) return err("Leilão não encontrado", 404);
        if (leilao.status === "finalizado") return err("Leilão já finalizado");
        if (leilao.status === "espera" && new Date() >= new Date(leilao.dataExpiracao)) {
          return err("O tempo de disputa acabou. Aguardando finalização.");
        }
        const lances = await db.lance.findMany({
          where: { leilaoId },
          orderBy: { valor: "desc" },
        });
        const maiorLance = lances.length > 0 ? lances[0] : null;
        const valorMinimo = maiorLance ? maiorLance.valor : leilao.valorInicial;
        if (Number(valor) <= valorMinimo) {
          return err(`O lance deve ser maior que ${valorMinimo} ${leilao.moedaAceita}`);
        }
        const lance = await db.lance.create({
          data: { leilaoId, jogador, valor: Number(valor) },
        });
        const now = new Date();
        const originalExpired = now >= new Date(leilao.dataExpiracao);
        if (originalExpired || leilao.status === "espera") {
          const newDeadline = new Date(now.getTime() + 60000);
          await db.leilao.update({
            where: { id: leilaoId },
            data: { dataUltimoLance: new Date(), dataExpiracao: newDeadline, status: "espera" },
          });
        } else {
          await db.leilao.update({
            where: { id: leilaoId },
            data: { dataUltimoLance: new Date() },
          });
        }
        return json(lance);
      }
      case "addSorteio": {
        const { nomeItem, quantidade, duracaoMinutos } = data;
        if (!nomeItem || !quantidade || !duracaoMinutos) {
          return err("Campos obrigatórios: nomeItem, quantidade, duracaoMinutos");
        }
        const dataFim = new Date(Date.now() + Number(duracaoMinutos) * 60 * 1000);
        const sorteio = await db.sorteio.create({
          data: { nomeItem, quantidade: Number(quantidade), duracaoMinutos: Number(duracaoMinutos), dataFim },
        });
        return json(sorteio);
      }
      case "participarSorteio": {
        const { sorteioId, jogador } = data;
        if (!sorteioId || !jogador) return err("Campos obrigatórios: sorteioId, jogador");
        const sorteio = await db.sorteio.findUnique({ where: { id: sorteioId } });
        if (!sorteio) return err("Sorteio não encontrado", 404);
        if (sorteio.status !== "ativo") return err("Sorteio não está ativo");
        if (sorteio.dataFim && new Date(sorteio.dataFim) < new Date()) {
          return err("O tempo do sorteio acabou");
        }
        const existing = await db.participanteSorteio.findFirst({
          where: { sorteioId, jogador },
        });
        if (existing) return err("Você já está participando deste sorteio");
        const p = await db.participanteSorteio.create({ data: { sorteioId, jogador } });
        return json(p);
      }
      case "sortear": {
        const { sorteioId } = data;
        if (!sorteioId) return err("sorteioId obrigatório");
        const participantes = await db.participanteSorteio.findMany({ where: { sorteioId } });
        if (participantes.length === 0) return err("Nenhum participante no sorteio");
        const randomIndex = Math.floor(Math.random() * participantes.length);
        const ganhador = participantes[randomIndex];
        await db.sorteio.update({
          where: { id: sorteioId },
          data: { status: "finalizado", ganhador: ganhador.jogador, dataFim: new Date() },
        });
        return json({ sucesso: true, ganhador: ganhador.jogador });
      }
      case "removeSorteio": {
        const { id } = data;
        if (!id) return err("id obrigatório");
        await db.sorteio.delete({ where: { id } });
        return json({ success: true });
      }
      case "criarLoterica": {
        const { valorNumero, moedaAceita, premioMinimo, duracaoMinutos } = data;
        if (!valorNumero || !moedaAceita) return err("Campos obrigatórios: valorNumero, moedaAceita");
        const ativa = await db.loterica.findFirst({
          where: { status: { in: ["vendas_abertas", "sorteio_realizado"] } },
        });
        if (ativa) return err("Já existe lotérica ativa. Finalize a atual antes de criar uma nova.");
        const dur = Number(duracaoMinutos) || 60;
        const prem = Number(premioMinimo) || 0;
        const dataFimVendas = new Date(Date.now() + dur * 60 * 1000);
        let acumulado = 0;
        const ultimaSemGanhador = await db.loterica.findFirst({
          where: { ganhador: null, valorPremio: { gt: 0 } },
          orderBy: { dataCriacao: "desc" },
        });
        if (ultimaSemGanhador) {
          acumulado = ultimaSemGanhador.valorPremio || 0;
        }
        const lot = await db.loterica.create({
          data: {
            valorNumero: Number(valorNumero), moedaAceita,
            premioMinimo: prem, premioAcumulado: acumulado,
            duracaoMinutos: dur, dataFimVendas, status: "vendas_abertas",
          },
        });
        const nums = Array.from({ length: 1000 }, (_, i) => ({
          lotericaId: lot.id, numero: i + 1,
        }));
        await db.numeroLoterica.createMany({ data: nums });
        return json({ success: true, lotericaId: lot.id, acumulado });
      }
      case "comprarNumero": {
        const { lotericaId, numero, comprador } = data;
        if (!lotericaId || numero === undefined || !comprador) {
          return err("Campos obrigatórios: lotericaId, numero, comprador");
        }
        const lotData = await db.loterica.findUnique({ where: { id: lotericaId } });
        if (!lotData) return err("Lotérica não encontrada", 404);
        if (lotData.status !== "vendas_abertas") return err("Vendas não estão abertas");
        if (lotData.dataFimVendas && new Date(lotData.dataFimVendas) < new Date()) {
          return err("Tempo de vendas encerrado");
        }
        const numEntry = await db.numeroLoterica.findFirst({
          where: { lotericaId, numero: Number(numero) },
        });
        if (!numEntry) return err("Número inválido");
        if (numEntry.comprador) return err("Número já vendido");
        await db.numeroLoterica.update({
          where: { id: numEntry.id },
          data: { comprador, dataCompra: new Date() },
        });
        const novoArrecadado = (lotData.arrecadadoTotal || 0) + lotData.valorNumero;
        await db.loterica.update({
          where: { id: lotericaId },
          data: { arrecadadoTotal: novoArrecadado },
        });
        return json({ success: true });
      }
      case "iniciarSorteioLoterica": {
        const { lotericaId } = data;
        if (!lotericaId) return err("lotericaId obrigatório");
        const numeros = await db.numeroLoterica.findMany({ where: { lotericaId } });
        const numerosVendidos = numeros.filter((n) => n.comprador);
        const lotData = await db.loterica.findUnique({ where: { id: lotericaId } });
        if (!lotData) return err("Lotérica não encontrada", 404);
        if (numerosVendidos.length === 0) return err("Nenhum número vendido");
        const numeroSorteado = Math.floor(Math.random() * 1000) + 1;
        const ganhador = numeros.find((n) => n.numero === numeroSorteado && n.comprador);

        // Nova lógica: 80% das vendas precisa ultrapassar o prêmio mínimo para o split 20/80
        const premio80 = lotData.arrecadadoTotal * 0.8;
        const effectiveMin = Math.max(lotData.premioMinimo, lotData.premioAcumulado || 0);
        const alcancaMinimo = premio80 > lotData.premioMinimo;

        let taxaBanco: number;
        let premioFinal: number;

        if (alcancaMinimo) {
          // Vendas suficientes: split normal 20% banco / 80% prêmio
          taxaBanco = lotData.arrecadadoTotal * 0.2;
          premioFinal = Math.max(premio80, effectiveMin);
        } else {
          // Vendas insuficientes: banco fica com 100%
          taxaBanco = lotData.arrecadadoTotal;
          premioFinal = effectiveMin; // prêmio vem do acumulado/mínimo, não das vendas
        }

        await db.loterica.update({
          where: { id: lotericaId },
          data: {
            status: "sorteio_realizado", numeroSorteado,
            ganhador: ganhador ? ganhador.comprador : null,
            valorPremio: premioFinal, dataSorteio: new Date(),
          },
        });

        // Entrada no caixa: taxa do banco (20% ou 100%)
        if (taxaBanco > 0) {
          await db.caixaRegistro.create({
            data: {
              tipo: "entrada",
              descricao: alcancaMinimo
                ? "Taxa bancária Lotérica (20% das vendas)"
                : "Lotérica - Banco ficou com 100% (80% não ultrapassou o mínimo)",
              item: lotData.moedaAceita, quantidade: Math.round(taxaBanco),
              valor: Math.round(taxaBanco), origem: "loterica",
            },
          });
        }

        if (ganhador) {
          // Tem ganhador: registra saída do prêmio no caixa
          await db.caixaRegistro.create({
            data: {
              tipo: "saida",
              descricao: `Prêmio Lotérica - Número ${numeroSorteado} (${ganhador.comprador})`,
              item: lotData.moedaAceita, quantidade: Math.round(premioFinal),
              valor: Math.round(premioFinal), origem: "loterica_premio",
            },
          });
        } else {
          // Sem ganhador: acumula o prêmio APENAS se as vendas alcançaram o mínimo
          if (alcancaMinimo) {
            await db.loterica.update({
              where: { id: lotericaId },
              data: { premioAcumulado: Math.round(premioFinal) },
            });
          }
          // Se !alcancaMinimo, o prêmio NÃO acumula (dinheiro ficou com o banco)
        }

        return json({
          success: true, numeroSorteado,
          ganhador: ganhador ? ganhador.comprador : null,
          premioFinal: Math.round(premioFinal),
          taxaBanco: Math.round(taxaBanco),
          acumulou: !ganhador,
          alcancaMinimo,
        });
      }
      case "finalizarLoterica": {
        const { lotericaId } = data;
        if (!lotericaId) return err("lotericaId obrigatório");
        const lotData = await db.loterica.findUnique({ where: { id: lotericaId } });
        if (!lotData) return err("Lotérica não encontrada", 404);
        if (lotData.status !== "sorteio_realizado") return err("Sorteio ainda não foi realizado");
        await db.loterica.update({
          where: { id: lotericaId },
          data: { status: "finalizada" },
        });
        return json({ success: true, acumuladoProxima: lotData.premioAcumulado || 0 });
      }
      case "reportPrice": {
        const { itemId, itemName, nickname, steelQty, steelPrice, cementQty, cementPrice } = data;
        if (!itemId || !itemName || !nickname || steelQty === undefined || cementQty === undefined) {
          return err("Campos obrigatorios: itemId, itemName, nickname, steelQty, cementQty");
        }
        const report = await db.priceReport.create({
          data: {
            itemId, itemName, nickname,
            steelQty: Number(steelQty), steelPrice: Number(steelPrice) || 1,
            cementQty: Number(cementQty), cementPrice: Number(cementPrice) || 1,
          },
        });
        return json(report);
      }
      case "setAd": {
        const { slotId, codigo } = data;
        if (!slotId) return err("slotId obrigatório");
        const pwd = req.headers.get("x-admin-password");
        if (!pwd || pwd !== ADMIN_PASSWORD) return err("Não autorizado", 403);
        const ad = await db.propaganda.upsert({
          where: { slotId },
          create: { slotId, codigo: codigo || "" },
          update: { codigo: codigo || "" },
        });
        return json({ success: true, id: ad.id });
      }
      case "deleteAd": {
        const { slotId } = data;
        if (!slotId) return err("slotId obrigatório");
        const pwd = req.headers.get("x-admin-password");
        if (!pwd || pwd !== ADMIN_PASSWORD) return err("Não autorizado", 403);
        await db.propaganda.delete({ where: { slotId } });
        return json({ success: true });
      }
      case "addItemCatalogo": {
        const { nome, arquivo } = data;
        if (!nome || !arquivo) return err("nome e arquivo obrigatórios");
        // Criar tabela se não existir
        try {
          await db.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "ItemCatalogo" (
              "id" TEXT NOT NULL PRIMARY KEY,
              "nome" TEXT NOT NULL,
              "arquivo" TEXT NOT NULL,
              "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
              CONSTRAINT "ItemCatalogo_nome_key" UNIQUE("nome")
            );
          `);
        } catch { /* tabela já existe */ }
        const item = await db.itemCatalogo.create({
          data: { nome: nome.trim(), arquivo: arquivo.trim() },
        });
        return json(item);
      }
      case "removeItemCatalogo": {
        const { id } = data;
        if (!id) return err("id obrigatório");
        await db.itemCatalogo.delete({ where: { id } });
        return json({ success: true });
      }
      case "bulkInsertDoadores": {
        const { doadores } = data;
        if (!Array.isArray(doadores)) return err("doadores array obrigatório");
        try {
          await db.doador.createMany({ data: doadores as any[], skipDuplicates: true });
          return json({ success: true, inserted: doadores.length });
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          return err(`Erro ao inserir doadores: ${msg}`, 500);
        }
      }
      case "restoreBackup": {
        const { backupData } = data;
        if (!backupData) return err("backupData obrigatório");

        // Handle both backup formats (old wrapped in .data, new flat)
        let d = backupData;
        if (d.format && d.data) d = d.data;
        else if (!d.emprestimos && d.data) d = d.data;

        // First clear all tables (same as resetAll)
        const clearTables = [
          () => db.chatMensagem.deleteMany(),
          () => db.chatSala.deleteMany(),
          () => db.numeroLoterica.deleteMany(),
          () => db.loterica.deleteMany(),
          () => db.participanteSorteio.deleteMany(),
          () => db.sorteio.deleteMany(),
          () => db.lance.deleteMany(),
          () => db.leilao.deleteMany(),
          () => db.priceReport.deleteMany(),
          () => db.itemOverride.deleteMany(),
          () => db.itemCatalogo.deleteMany(),
          () => db.propaganda.deleteMany(),
          () => db.doador.deleteMany(),
          () => db.compraVenda.deleteMany(),
          () => db.trocaRegistro.deleteMany(),
          () => db.tabelaTroca.deleteMany(),
          () => db.investidor.deleteMany(),
          () => db.emprestimo.deleteMany(),
          () => db.caixaRegistro.deleteMany(),
        ];
        for (const fn of clearTables) {
          try { await fn(); } catch {}
        }

        // Helper: safely insert records into a table
        async function safeInsert(model: { createMany: (args: { data: Record<string, unknown>[]; skipDuplicates?: boolean }) => Promise<unknown> }, records: unknown[]) {
          if (!records || records.length === 0) return;
          try {
            await model.createMany({ data: records as Record<string, unknown>[], skipDuplicates: true });
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            console.error(`Restore table error: ${msg}`);
          }
        }

        // Restore each table (SKIP trocas and troca-related caixa entries)
        const skipCaixa = (d.caixa as Record<string, string>[] || []).filter((c) =>
          !(c.origem || "").startsWith("troca") && !(c.origem || "").startsWith("estorno_troca")
        );

        await safeInsert(db.investidor, d.investidores || []);
        await safeInsert(db.emprestimo, d.emprestimos || []);
        await safeInsert(db.tabelaTroca, d.tabelasTroca || []);
        // trocas SKIPPED intentionally
        await safeInsert(db.compraVenda, d.comprasVendas || []);
        await safeInsert(db.caixaRegistro, skipCaixa);
        await safeInsert(db.doador, d.doadores || []);
        await safeInsert(db.leilao, d.leiloes || []);
        await safeInsert(db.lance, d.lances || []);
        await safeInsert(db.sorteio, d.sorteios || []);
        await safeInsert(db.participanteSorteio, d.participantes || d.participantesSorteio || []);
        await safeInsert(db.loterica, d.lotericas || []);
        await safeInsert(db.numeroLoterica, d.numeros || d.numerosLoterica || []);
        await safeInsert(db.priceReport, d.priceReports || []);
        await safeInsert(db.itemOverride, d.itemOverrides || []);
        await safeInsert(db.chatSala, d.chatSalas || []);
        await safeInsert(db.chatMensagem, d.chatMensagens || []);
        await safeInsert(db.propaganda, d.propagandas || []);
        await safeInsert(db.itemCatalogo, d.itemCatalogo || []);

        return json({ success: true, message: "Backup restaurado (trocas ignoradas)!" });
      }
      case "resetAll": {
        const tables = [
          () => db.chatMensagem.deleteMany(),
          () => db.chatSala.deleteMany(),
          () => db.numeroLoterica.deleteMany(),
          () => db.loterica.deleteMany(),
          () => db.participanteSorteio.deleteMany(),
          () => db.sorteio.deleteMany(),
          () => db.lance.deleteMany(),
          () => db.leilao.deleteMany(),
          () => db.priceReport.deleteMany(),
          () => db.itemOverride.deleteMany(),
          () => db.itemCatalogo.deleteMany(),
          () => db.propaganda.deleteMany(),
          () => db.doador.deleteMany(),
          () => db.compraVenda.deleteMany(),
          () => db.trocaRegistro.deleteMany(),
          () => db.tabelaTroca.deleteMany(),
          () => db.investidor.deleteMany(),
          () => db.emprestimo.deleteMany(),
          () => db.caixaRegistro.deleteMany(),
        ];
        for (const fn of tables) {
          try { await fn(); } catch {}
        }
        return json({ success: true, message: "Banco de dados resetado com sucesso!" });
      }
      case "backup": {
        const pwd = req.headers.get("x-admin-password");
        if (!pwd || pwd !== ADMIN_PASSWORD) return err("Não autorizado", 403);
        const [emprestimos, investidores, tabelasTroca, trocas, comprasVendas, caixa, doadores, leiloes, lances, sorteios, participantes, lotericas, numeros, priceReports, itemOverrides, propagandas, chatSalas, chatMensagens, itemCatalogo] = await Promise.all([
          db.emprestimo.findMany(), db.investidor.findMany(), db.tabelaTroca.findMany(),
          db.trocaRegistro.findMany(), db.compraVenda.findMany(), db.caixaRegistro.findMany(),
          db.doador.findMany(), db.leilao.findMany(), db.lance.findMany(),
          db.sorteio.findMany(), db.participanteSorteio.findMany(), db.loterica.findMany(),
          db.numeroLoterica.findMany(), db.priceReport.findMany(), db.itemOverride.findMany(),
          db.propaganda.findMany(), db.chatSala.findMany(), db.chatMensagem.findMany(),
          db.itemCatalogo.findMany(),
        ]);
        const backup = JSON.stringify({
          version: 1, exportDate: new Date().toISOString(),
          emprestimos, investidores, tabelasTroca, trocas, comprasVendas, caixa, doadores,
          leiloes, lances, sorteios, participantes, lotericas, numeros,
          priceReports, itemOverrides, propagandas, chatSalas, chatMensagens, itemCatalogo,
        }, null, 2);
        const filename = `backup-dayr-${new Date().toISOString().slice(0, 10)}.json`;
        return new Response(backup, {
          headers: {
            "Content-Type": "application/json",
            "Content-Disposition": `attachment; filename="${filename}"`,
          },
        });
      }
      // === MODERADORES ===
      case "setupModeradores": {
        try {
          await db.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "Moderador" (
              "id" TEXT NOT NULL PRIMARY KEY,
              "nome" TEXT NOT NULL,
              "usuario" TEXT NOT NULL,
              "senha" TEXT NOT NULL,
              "permissoes" TEXT NOT NULL,
              "token" TEXT,
              "tokenExpira" TIMESTAMP(3),
              "ativo" BOOLEAN NOT NULL DEFAULT true,
              "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE UNIQUE INDEX IF NOT EXISTS "Moderador_usuario_key" ON "Moderador"("usuario");
          `);
          return json({ success: true, message: "Tabela Moderador criada!" });
        } catch (e: unknown) { return err(e instanceof Error ? e.message : "Erro ao criar tabela"); }
      }

      case "loginModerador": {
        const { usuario, senha } = data;
        if (!usuario || !senha) return err("Usuário e senha obrigatórios");
        const mod = await db.moderador.findFirst({ where: { usuario, senha, ativo: true } });
        if (!mod) return err("Usuário ou senha incorretos", 401);
        const token = generateToken();
        const expira = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await db.moderador.update({ where: { id: mod.id }, data: { token, tokenExpira: expira } });
        return json({ success: true, nome: mod.nome, permissoes: JSON.parse(mod.permissoes), token });
      }

      case "logoutModerador": {
        const { token } = data;
        if (token) {
          await db.moderador.updateMany({ where: { token }, data: { token: null, tokenExpira: null } });
        }
        return json({ success: true });
      }

      case "setModeradorSenha": {
        const { senhaAtual, senhaNova } = data;
        if (!senhaAtual || !senhaNova) return err("Senhas obrigatórias");
        const modToken = req.headers.get("x-moderador-token");
        if (!modToken) return err("Não autorizado", 401);
        const mod = await db.moderador.findFirst({ where: { token: modToken, ativo: true } });
        if (!mod) return err("Sessão inválida", 401);
        if (mod.senha !== senhaAtual) return err("Senha atual incorreta", 403);
        await db.moderador.update({ where: { id: mod.id }, data: { senha: senhaNova, token: null, tokenExpira: null } });
        return json({ success: true, message: "Senha alterada! Faça login novamente." });
      }

      case "listModeradores": {
        const mods = await db.moderador.findMany({ orderBy: { criadoEm: "desc" } });
        return json(mods.map(m => ({ id: m.id, nome: m.nome, usuario: m.usuario, permissoes: JSON.parse(m.permissoes), ativo: m.ativo, criadoEm: m.criadoEm })));
      }

      case "createModerador": {
        const { nome, usuario, senha, permissoes } = data;
        if (!nome || !usuario || !senha) return err("Nome, usuário e senha obrigatórios");
        if (!Array.isArray(permissoes)) return err("Permissões deve ser um array");
        try {
          const mod = await db.moderador.create({ data: { nome, usuario, senha, permissoes: JSON.stringify(permissoes) } });
          return json({ success: true, id: mod.id, message: `Moderador "${nome}" criado!` });
        } catch (e: unknown) {
          if (e instanceof Error && e.message.includes("Unique")) return err("Usuário já existe");
          return err(e instanceof Error ? e.message : "Erro ao criar moderador");
        }
      }

      case "updateModerador": {
        const { id, permissoes, ativo, nome } = data;
        if (!id) return err("id obrigatório");
        const updateData: Record<string, unknown> = {};
        if (Array.isArray(permissoes)) updateData.permissoes = JSON.stringify(permissoes);
        if (typeof ativo === "boolean") updateData.ativo = ativo;
        if (nome) updateData.nome = nome;
        const mod = await db.moderador.update({ where: { id }, data: updateData });
        return json({ success: true, message: "Moderador atualizado!" });
      }

      case "removeModerador": {
        const { id } = data;
        if (!id) return err("id obrigatório");
        await db.moderador.delete({ where: { id } });
        return json({ success: true, message: "Moderador removido!" });
      }


      default:
        return err("Ação POST desconhecida: " + action);
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro interno";
    return err(msg, 500);
  }
}
// Build fix