import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function err(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

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

    switch (action) {
      // === EMPRÉSTIMOS ===
      case "addEmprestimo": {
        const { player, item, quantidade, dataEmprestimo, tipoMembro, status } = data;
        if (!player || !item || !quantidade) return err("Campos obrigatórios: player, item, quantidade");
        const emp = await db.emprestimo.create({
          data: {
            player,
            item,
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
        const emp = await db.emprestimo.update({
          where: { id },
          data: updateData,
        });
        return json(emp);
      }

      // === INVESTIDORES ===
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
          await db.investidor.update({
            where: { id: u.id },
            data: { ordem: u.ordem },
          });
        }
        return json({ success: true });
      }

      // === TABELAS DE TROCA ===
      case "addTabelaTroca": {
        const { itemBase, quantidadeBase, itemResultado, quantidadeResultado, categoria } = data;
        if (!itemBase || !quantidadeBase || !itemResultado || !quantidadeResultado) {
          return err("Campos obrigatórios: itemBase, quantidadeBase, itemResultado, quantidadeResultado");
        }
        const tab = await db.tabelaTroca.create({
          data: {
            itemBase,
            quantidadeBase: Number(quantidadeBase),
            itemResultado,
            quantidadeResultado: Number(quantidadeResultado),
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

      // === TROCAS ===
      case "addTroca": {
        const { player, itemEnviado, quantidadeEnviada, itemRecebido, quantidadeRecebida, tipoMembro, taxaAplicada, lucroBanco } = data;
        if (!player || !itemEnviado || !quantidadeEnviada || !itemRecebido || !quantidadeRecebida) {
          return err("Campos obrigatórios: player, itemEnviado, quantidadeEnviada, itemRecebido, quantidadeRecebida");
        }
        const troca = await db.trocaRegistro.create({
          data: {
            player,
            itemEnviado,
            quantidadeEnviada: Number(quantidadeEnviada),
            itemRecebido,
            quantidadeRecebida: Number(quantidadeRecebida),
            tipoMembro: tipoMembro || "comum",
            taxaAplicada: Number(taxaAplicada) || 0,
            lucroBanco: Number(lucroBanco) || 0,
          },
        });
        return json(troca);
      }

      // === COMPRAS E VENDAS ===
      case "addCompraVenda": {
        const { tipo, player, item, quantidade, itemPagamento, valor, observacao } = data;
        if (!tipo || !player || !item || !quantidade || valor === undefined) {
          return err("Campos obrigatórios: tipo, player, item, quantidade, valor");
        }
        const cv = await db.compraVenda.create({
          data: {
            tipo,
            player,
            item,
            quantidade: Number(quantidade),
            itemPagamento: itemPagamento || null,
            valor: Number(valor),
            observacao: observacao || null,
          },
        });
        return json(cv);
      }

      // === CAIXA ===
      case "addCaixa": {
        const { tipo, descricao, item, quantidade, valor, origem } = data;
        if (!tipo || !descricao || !item || !quantidade || !origem) {
          return err("Campos obrigatórios: tipo, descricao, item, quantidade, origem");
        }
        const reg = await db.caixaRegistro.create({
          data: {
            tipo,
            descricao,
            item,
            quantidade: Number(quantidade),
            valor: valor !== undefined ? Number(valor) : null,
            origem,
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

      // === DOADORES ===
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
          await db.doador.update({
            where: { id: u.id },
            data: { ordem: u.ordem },
          });
        }
        return json({ success: true });
      }

      // === LEILÕES ===
      case "addLeilao": {
        const { donoItem, nomeItem, imagemUrl, quantidade, valorInicial, moedaAceita, taxaCasa, dataExpiracao, tipoOrigem } = data;
        if (!donoItem || !nomeItem || valorInicial === undefined || !moedaAceita || !dataExpiracao) {
          return err("Campos obrigatórios: donoItem, nomeItem, valorInicial, moedaAceita, dataExpiracao");
        }
        const leilao = await db.leilao.create({
          data: {
            donoItem,
            nomeItem,
            imagemUrl: imagemUrl || null,
            quantidade: Number(quantidade) || 1,
            valorInicial: Number(valorInicial),
            moedaAceita,
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

      // === LANCES ===
      case "addLance": {
        const { leilaoId, jogador, valor } = data;
        if (!leilaoId || !jogador || valor === undefined) {
          return err("Campos obrigatórios: leilaoId, jogador, valor");
        }
        const leilao = await db.leilao.findUnique({ where: { id: leilaoId } });
        if (!leilao) return err("Leilão não encontrado", 404);
        if (leilao.status === "finalizado") return err("Leilão já finalizado");
        // Bloqueia lances em espera quando o tempo +1min já expirou
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

        // Se o tempo original já passou, qualquer lance adiciona +1min e vai para espera
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

      // === SORTEIOS ===
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
        const updated = await db.sorteio.update({
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

      // === LOTÉRICA ===
      case "criarLoterica": {
        const { valorNumero, moedaAceita, premioMinimo, duracaoMinutos } = data;
        if (!valorNumero || !moedaAceita) return err("Campos obrigatórios: valorNumero, moedaAceita");
        // Verificar se ja existe loterica ativa (nao finalizada)
        const ativa = await db.loterica.findFirst({
          where: { status: { in: ["vendas_abertas", "sorteio_realizado"] } },
        });
        if (ativa) return err("Já existe lotérica ativa. Finalize a atual antes de criar uma nova.");

        const dur = Number(duracaoMinutos) || 60;
        const prem = Number(premioMinimo) || 0;
        const dataFimVendas = new Date(Date.now() + dur * 60 * 1000);

        // Buscar premio acumulado da ultima loterica sem ganhador
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
            valorNumero: Number(valorNumero),
            moedaAceita,
            premioMinimo: prem,
            premioAcumulado: acumulado,
            duracaoMinutos: dur,
            dataFimVendas,
            status: "vendas_abertas",
          },
        });
        // Create 1000 numbers
        const nums = Array.from({ length: 1000 }, (_, i) => ({
          lotericaId: lot.id,
          numero: i + 1,
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

        // Arrecadado total aumenta, mas NAO credita no estoque ainda
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

        // Calcular premio: acumulado SUBSTITUI o minimo (nao soma)
        // Ex: minimo 100, acumulado 160 → minimo efetivo = 160
        const effectiveMin = Math.max(lotData.premioMinimo, lotData.premioAcumulado || 0);
        const premio80 = lotData.arrecadadoTotal * 0.8;
        const premioFinal = Math.max(premio80, effectiveMin);
        const taxaBanco = lotData.arrecadadoTotal * 0.2;

        await db.loterica.update({
          where: { id: lotericaId },
          data: {
            status: "sorteio_realizado",
            numeroSorteado,
            ganhador: ganhador ? ganhador.comprador : null,
            valorPremio: premioFinal,
            dataSorteio: new Date(),
          },
        });

        // Creditar 20% das vendas no estoque do banco
        if (taxaBanco > 0) {
          await db.caixaRegistro.create({
            data: {
              tipo: "entrada",
              descricao: `Taxa bancária Lotérica (20% das vendas)`,
              item: lotData.moedaAceita,
              quantidade: Math.round(taxaBanco),
              valor: Math.round(taxaBanco),
              origem: "loterica",
            },
          });
        }

        // Se teve ganhador, registrar saida do premio
        if (ganhador) {
          await db.caixaRegistro.create({
            data: {
              tipo: "saida",
              descricao: `Prêmio Lotérica - Número ${numeroSorteado} (${ganhador.comprador})`,
              item: lotData.moedaAceita,
              quantidade: Math.round(premioFinal),
              valor: Math.round(premioFinal),
              origem: "loterica_premio",
            },
          });
        } else {
          // Ninguem acertou - o premio vira o novo minimo para a proxima
          await db.loterica.update({
            where: { id: lotericaId },
            data: { premioAcumulado: Math.round(premioFinal) },
          });
        }

        return json({
          success: true,
          numeroSorteado,
          ganhador: ganhador ? ganhador.comprador : null,
          premioFinal: Math.round(premioFinal),
          taxaBanco: Math.round(taxaBanco),
          acumulou: !ganhador,
        });
      }
      case "finalizarLoterica": {
        const { lotericaId } = data;
        if (!lotericaId) return err("lotericaId obrigatório");
        const lotData = await db.loterica.findUnique({ where: { id: lotericaId } });
        if (!lotData) return err("Lotérica não encontrada", 404);
        if (lotData.status !== "sorteio_realizado") return err("Sorteio ainda não foi realizado");

        // Marca como finalizada - pronto para criar proxima
        await db.loterica.update({
          where: { id: lotericaId },
          data: { status: "finalizada" },
        });

        return json({ success: true, acumuladoProxima: lotData.premioAcumulado || 0 });
      }

      // === PRICE REPORTS ===
      case "reportPrice": {
        const { itemId, itemName, nickname, steelQty, steelPrice, cementQty, cementPrice } = data;
        if (!itemId || !itemName || !nickname || steelQty === undefined || cementQty === undefined) {
          return err("Campos obrigatorios: itemId, itemName, nickname, steelQty, cementQty");
        }
        const report = await db.priceReport.create({
          data: {
            itemId,
            itemName,
            nickname,
            steelQty: Number(steelQty),
            steelPrice: Number(steelPrice) || 1,
            cementQty: Number(cementQty),
            cementPrice: Number(cementPrice) || 1,
          },
        });
        return json(report);
      }

      default:
        return err("Ação POST desconhecida: " + action);
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro interno";
    return err(msg, 500);
  }
}
