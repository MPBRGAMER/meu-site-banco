import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, adminProcedure, router } from "./_core/trpc";
import { dbHelpers } from "./db";
import { nanoid } from "nanoid";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Empréstimos - queries públicas, mutations admin
  emprestimos: router({
    list: publicProcedure.query(() => dbHelpers.getEmprestimos()),
    add: adminProcedure
      .input(z.object({
        player: z.string(),
        item: z.string(),
        quantidade: z.number(),
        dataEmprestimo: z.string().datetime(),
        tipoMembro: z.enum(["comum", "investidor"]),
        status: z.enum(["pendente", "pago"]),
      }))
      .mutation(({ input }) => {
        const data = { 
          ...input, 
          id: nanoid(),
          dataEmprestimo: new Date(input.dataEmprestimo),
        };
        return dbHelpers.addEmprestimo(data);
      }),
    update: adminProcedure
      .input(z.object({
        id: z.string(),
        data: z.object({
          status: z.enum(["pendente", "pago"]),
          dataPagamento: z.string().datetime(),
          itemPagamento: z.string(),
          quantidadePaga: z.number(),
        }),
      }))
      .mutation(({ input }) => {
        return dbHelpers.updateEmprestimo(input.id, {
          ...input.data,
          dataPagamento: new Date(input.data.dataPagamento),
        });
      }),
  }),

  // Investidores - queries públicas, mutations admin
  investidores: router({
    list: publicProcedure.query(() => dbHelpers.getInvestidores()),
    add: adminProcedure
      .input(z.object({
        nome: z.string(),
        observacao: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const data = { ...input, id: nanoid(), ordem: 0 };
        return dbHelpers.addInvestidor(data);
      }),
    remove: adminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(({ input }) => {
        return dbHelpers.removeInvestidor(input.id);
      }),
    reorder: adminProcedure
      .input(z.object({
        updates: z.array(z.object({ id: z.string(), ordem: z.number() })),
      }))
      .mutation(async ({ input }) => {
        for (const u of input.updates) {
          await dbHelpers.updateInvestidor(u.id, { ordem: u.ordem });
        }
        return { success: true };
      }),
  }),

  // Tabelas de Troca - queries públicas, mutations admin
  tabelasTroca: router({
    list: publicProcedure.query(() => dbHelpers.getTabelasTroca()),
    add: adminProcedure
      .input(z.object({
        itemBase: z.string(),
        quantidadeBase: z.number(),
        itemResultado: z.string(),
        quantidadeResultado: z.number(),
        categoria: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const data = { ...input, id: nanoid() };
        return dbHelpers.addTabelaTroca(data);
      }),
    remove: adminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(({ input }) => {
        return dbHelpers.removeTabelaTroca(input.id);
      }),
  }),

  // Trocas Registro - queries públicas, mutations admin
  trocas: router({
    list: publicProcedure.query(() => dbHelpers.getTrocasRegistro()),
    add: adminProcedure
      .input(z.object({
        player: z.string(),
        itemEnviado: z.string(),
        quantidadeEnviada: z.number(),
        itemRecebido: z.string(),
        quantidadeRecebida: z.number(),
        tipoMembro: z.enum(["comum", "investidor"]),
        taxaAplicada: z.number(),
        lucroBanco: z.number(),
      }))
      .mutation(({ input }) => {
        const data = { ...input, id: nanoid() };
        return dbHelpers.addTroca(data);
      }),
  }),

  // Compras e Vendas - queries públicas, mutations admin
  comprasVendas: router({
    list: publicProcedure.query(() => dbHelpers.getComprasVendas()),
    add: adminProcedure
      .input(z.object({
        tipo: z.enum(["compra", "venda"]),
        player: z.string(),
        item: z.string(),
        quantidade: z.number(),
        itemPagamento: z.string().optional(),
        valor: z.number(),
        observacao: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const data = { ...input, id: nanoid() };
        return dbHelpers.addCompraVenda(data);
      }),
  }),

  // Caixa - queries públicas, mutations admin
  caixa: router({
    list: publicProcedure.query(() => dbHelpers.getCaixa()),
    add: adminProcedure
      .input(z.object({
        tipo: z.enum(["entrada", "saida"]),
        descricao: z.string(),
        item: z.string(),
        quantidade: z.number(),
        valor: z.number().optional(),
        origem: z.string(),
      }))
      .mutation(({ input }) => {
        const data = { ...input, id: nanoid() };
        return dbHelpers.addCaixa(data);
      }),
    reset: adminProcedure.mutation(() => {
      return dbHelpers.resetCaixa();
    }),
  }),

  // Doadores - queries públicas, mutations admin
  doadores: router({
    list: publicProcedure.query(() => dbHelpers.getDoadores()),
    add: adminProcedure
      .input(z.object({
        nome: z.string(),
        item: z.string(),
        quantidade: z.number(),
      }))
      .mutation(({ input }) => {
        const data = { ...input, id: nanoid(), ordem: 0 };
        return dbHelpers.addDoador(data);
      }),
    reorder: adminProcedure
      .input(z.object({
        updates: z.array(z.object({ id: z.string(), ordem: z.number() })),
      }))
      .mutation(async ({ input }) => {
        for (const u of input.updates) {
          await dbHelpers.updateDoador(u.id, { ordem: u.ordem });
        }
        return { success: true };
      }),
  }),

  // Leilões - queries públicas, mutations de criação admin
  leiloes: router({
    list: publicProcedure.query(() => dbHelpers.getLeiloes()),
    add: adminProcedure
      .input(z.object({
        donoItem: z.string(),
        nomeItem: z.string(),
        imagemUrl: z.string().optional(),
        valorInicial: z.number(),
        moedaAceita: z.string(),
        taxaCasa: z.number().default(15),
        dataExpiracao: z.string().datetime(),
        tipoOrigem: z.enum(["comum", "investidor", "banco"]).default("comum"),
      }))
      .mutation(({ input }) => {
        const data = { 
          ...input, 
          id: nanoid(),
          dataExpiracao: new Date(input.dataExpiracao),
          status: "ativo" as const,
        };
        return dbHelpers.addLeilao(data);
      }),
    update: adminProcedure
      .input(z.object({
        id: z.string(),
        data: z.object({
          status: z.enum(["ativo", "espera", "finalizado"]).optional(),
          vencedor: z.string().optional(),
          valorVencedor: z.number().optional(),
          tipoMembroVencedor: z.string().optional(),
        }),
      }))
      .mutation(({ input }) => {
        return dbHelpers.updateLeilao(input.id, input.data);
      }),
    remove: adminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(({ input }) => {
        return dbHelpers.removeLeilao(input.id);
      }),
  }),

  // Lances - queries públicas, mutations públicas (qualquer um pode dar lance)
  lances: router({
    list: publicProcedure
      .input(z.object({ leilaoId: z.string() }))
      .query(({ input }) => dbHelpers.getLances(input.leilaoId)),
    allList: publicProcedure.query(() => dbHelpers.getAllLances()),
    add: publicProcedure
      .input(z.object({
        leilaoId: z.string(),
        jogador: z.string(),
        valor: z.number(),
      }))
      .mutation(async ({ input }) => {
        // Verificar valor mínimo
        const lances = await dbHelpers.getLances(input.leilaoId);
        const leiloes = await dbHelpers.getLeiloes();
        const leilao = leiloes.find(l => l.id === input.leilaoId);
        
        if (!leilao) throw new Error("Leilão não encontrado");
        if (leilao.status !== "ativo") throw new Error("Leilão não está mais ativo");
        
        const maiorLance = lances.length > 0 ? lances[0] : null;
        const valorMinimo = maiorLance ? maiorLance.valor : leilao.valorInicial;
        
        if (input.valor <= valorMinimo) {
          throw new Error(`O lance deve ser maior que ${valorMinimo} ${leilao.moedaAceita}`);
        }
        
        const data = { ...input, id: nanoid() };
        await dbHelpers.addLance(data);
        
        // Atualizar leilão com data do último lance
        await dbHelpers.updateLeilao(input.leilaoId, {
          dataUltimoLance: new Date(),
        });
        
        return { success: true };
      }),
  }),

  // Sorteios - queries públicas, mutations admin (criar/iniciar/finalizar), mutation pública (participar)
  sorteios: router({
    list: publicProcedure.query(() => dbHelpers.getSorteios()),
    participantes: publicProcedure
      .input(z.object({ sorteioId: z.string() }))
      .query(({ input }) => dbHelpers.getParticipantes(input.sorteioId)),
    add: adminProcedure
      .input(z.object({
        nomeItem: z.string(),
        quantidade: z.number(),
        duracaoMinutos: z.number(),
      }))
      .mutation(async ({ input }) => {
        const dataFim = new Date(Date.now() + input.duracaoMinutos * 60 * 1000);
        const data = { ...input, id: nanoid(), dataFim, status: "ativo" as const };
        await dbHelpers.addSorteio(data);
        return { success: true };
      }),
    participar: publicProcedure
      .input(z.object({
        sorteioId: z.string(),
        jogador: z.string(),
      }))
      .mutation(async ({ input }) => {
        const sorteio = await dbHelpers.getSorteio(input.sorteioId);
        if (!sorteio) throw new Error("Sorteio não encontrado");
        if (sorteio.status !== "ativo") throw new Error("Sorteio não está ativo");
        
        // Verificar se o tempo ainda não acabou
        if (sorteio.dataFim && new Date(sorteio.dataFim) < new Date()) {
          throw new Error("O tempo do sorteio acabou");
        }
        
        // Verificar se já participando
        const participantes = await dbHelpers.getParticipantes(input.sorteioId);
        if (participantes.some(p => p.jogador === input.jogador)) {
          throw new Error("Você já está participando deste sorteio");
        }
        
        const data = { ...input, id: nanoid() };
        await dbHelpers.addParticipante(data);
        return { success: true };
      }),
    sortear: adminProcedure
      .input(z.object({ sorteioId: z.string() }))
      .mutation(async ({ input }) => {
        const participantes = await dbHelpers.getParticipantes(input.sorteioId);
        if (participantes.length === 0) throw new Error("Nenhum participante no sorteio");
        
        const randomIndex = Math.floor(Math.random() * participantes.length);
        const ganhador = participantes[randomIndex];
        
        await dbHelpers.updateSorteio(input.sorteioId, {
          status: "finalizado",
          ganhador: ganhador.jogador,
          dataFim: new Date(),
        });
        
        return { sucesso: true, ganhador: ganhador.jogador };
      }),
    remove: adminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(({ input }) => {
        return dbHelpers.removeSorteio(input.id);
      }),
  }),

  // Lotérica
  loterica: router({
    get: publicProcedure.query(() => dbHelpers.getLoterica()),
    history: publicProcedure.query(() => dbHelpers.getAllLoterica()),
    numeros: publicProcedure
      .input(z.object({ lotericaId: z.string() }))
      .query(({ input }) => dbHelpers.getNumerosLoterica(input.lotericaId)),
    criar: adminProcedure
      .input(z.object({
        valorNumero: z.number(),
        moedaAceita: z.string(),
        premioMinimo: z.number().default(0),
        duracaoMinutos: z.number().default(60),
      }))
      .mutation(async ({ input }) => {
        const dataFimVendas = new Date(Date.now() + input.duracaoMinutos * 60 * 1000);
        const lotericaData = {
          id: nanoid(),
          ...input,
          status: "vendas_abertas" as const,
          dataFimVendas,
          valorPremio: 0,
          arrecadadoTotal: 0,
        };
        await dbHelpers.addLoterica(lotericaData);
        
        // Criar 1000 números
        for (let i = 1; i <= 1000; i++) {
          await dbHelpers.addNumeroLoterica({
            id: nanoid(),
            lotericaId: lotericaData.id,
            numero: i,
          });
        }
        
        return { success: true, lotericaId: lotericaData.id };
      }),
    comprar: publicProcedure
      .input(z.object({
        lotericaId: z.string(),
        numero: z.number(),
        comprador: z.string(),
      }))
      .mutation(async ({ input }) => {
        const lotericaList = await dbHelpers.getLoterica();
        const lotericaData = lotericaList[0];
        if (!lotericaData) throw new Error("Loterica não encontrada");
        if (lotericaData.status !== "vendas_abertas") throw new Error("Vendas não estão abertas");
        if (lotericaData.dataFimVendas && new Date(lotericaData.dataFimVendas) < new Date()) {
          throw new Error("Tempo de vendas encerrado");
        }
        
        const numeros = await dbHelpers.getNumerosLoterica(input.lotericaId);
        const numeroEntry = numeros.find(n => n.numero === input.numero);
        if (!numeroEntry) throw new Error("Número inválido");
        if (numeroEntry.comprador) throw new Error("Número já vendido");
        
        // Atualizar número com comprador
        await dbHelpers.updateNumeroLoterica(numeroEntry.id, {
          comprador: input.comprador,
          dataCompra: new Date(),
        });
        
        // Atualizar lotérica: 20% vai pro caixa, 80% pro prêmio
        const valorDaVenda = lotericaData.valorNumero;
        const valorCaixa = valorDaVenda * 0.20;
        const valorPremio = valorDaVenda * 0.80;
        
        const novoArrecadado = (lotericaData.arrecadadoTotal || 0) + valorDaVenda;
        const novoPremio = (lotericaData.valorPremio || 0) + valorPremio;
        
        await dbHelpers.updateLoterica(input.lotericaId, {
          arrecadadoTotal: novoArrecadado,
          valorPremio: novoPremio,
        });
        
        // Registrar 20% no caixa
        await dbHelpers.addCaixa({
          id: nanoid(),
          tipo: "entrada",
          descricao: `Venda número ${input.numero} - Lotérica (${input.comprador})`,
          item: lotericaData.moedaAceita,
          quantidade: 1,
          valor: valorCaixa,
          origem: "loterica",
        });
        
        return { success: true };
      }),
    iniciarSorteio: adminProcedure
      .input(z.object({ lotericaId: z.string() }))
      .mutation(async ({ input }) => {
        const numeros = await dbHelpers.getNumerosLoterica(input.lotericaId);
        const numerosVendidos = numeros.filter(n => n.comprador);
        
        if (numerosVendidos.length === 0) throw new Error("Nenhum número vendido");
        
        // Sortear número aleatório de 1 a 1000 (pode cair em número não vendido)
        const numeroSorteadoAleatorio = Math.floor(Math.random() * 1000) + 1;
        
        // Verificar se o número foi vendido
        const ganhador = numeros.find(n => n.numero === numeroSorteadoAleatorio && n.comprador);
        
        const lotericaList = await dbHelpers.getLoterica();
        const lotericaData = lotericaList[0];
        
        await dbHelpers.updateLoterica(input.lotericaId, {
          status: "sorteio_realizado",
          numeroSorteado: numeroSorteadoAleatorio,
          ganhador: ganhador ? ganhador.comprador : null,
          dataSorteio: new Date(),
        });
        
        // Se o número sorteado foi vendido, pagar o prêmio (saída do caixa)
        if (lotericaData && ganhador) {
          await dbHelpers.addCaixa({
            id: nanoid(),
            tipo: "saida",
            descricao: `Prêmio Lotérica - Número ${numeroSorteadoAleatorio} (${ganhador.comprador})`,
            item: lotericaData.moedaAceita,
            quantidade: 1,
            valor: lotericaData.valorPremio || 0,
            origem: "loterica",
          });
        }
        
        return { 
          success: true, 
          numeroSorteado: numeroSorteadoAleatorio, 
          ganhador: ganhador ? ganhador.comprador : null 
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
