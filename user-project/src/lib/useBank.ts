import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

// === TYPES ===
export interface Emprestimo {
  id: string; player: string; item: string; quantidade: number;
  dataEmprestimo: string; tipoMembro: string; status: string;
  dataPagamento: string | null; itemPagamento: string | null; quantidadePaga: number | null;
}
export interface Investidor {
  id: string; nome: string; dataEntrada: string;
  status: string; observacao: string | null; ordem: number;
}
export interface TabelaTroca {
  id: string; itemBase: string; quantidadeBase: number;
  itemResultado: string; quantidadeResultado: number; categoria: string | null;
}
export interface TrocaRegistro {
  id: string; player: string; itemEnviado: string; quantidadeEnviada: number;
  itemRecebido: string; quantidadeRecebida: number; tipoMembro: string;
  taxaAplicada: number; lucroBanco: number; data: string;
}
export interface CompraVenda {
  id: string; tipo: string; player: string; item: string;
  quantidade: number; itemPagamento: string | null; valor: number;
  data: string; observacao: string | null;
}
export interface CaixaRegistro {
  id: string; tipo: string; descricao: string; item: string;
  quantidade: number; valor: number | null; data: string; origem: string;
}
export interface Doador {
  id: string; nome: string; item: string; quantidade: number;
  data: string; ordem: number;
}
export interface Leilao {
  id: string; donoItem: string; nomeItem: string; imagemUrl: string | null;
  quantidade: number; valorInicial: number; moedaAceita: string; taxaCasa: number;
  status: string; dataCriacao: string; dataExpiracao: string;
  dataUltimoLance: string | null; vencedor: string | null;
  valorVencedor: number | null; tipoMembroVencedor: string | null; tipoOrigem: string;
}
export interface Lance {
  id: string; leilaoId: string; jogador: string; valor: number; data: string;
}
export interface Sorteio {
  id: string; nomeItem: string; quantidade: number; duracaoMinutos: number;
  status: string; dataCriacao: string; dataFim: string | null; ganhador: string | null;
}
export interface Participante {
  id: string; sorteioId: string; jogador: string; data: string;
}
export interface LotericaData {
  id: string; status: string; valorNumero: number; moedaAceita: string;
  premioMinimo: number; premioAcumulado: number; duracaoMinutos: number;
  dataCriacao: string; dataFimVendas: string | null; dataSorteio: string | null;
  numeroSorteado: number | null; ganhador: string | null; valorPremio: number;
  arrecadadoTotal: number;
}
export interface NumeroLoterica {
  id: string; lotericaId: string; numero: number;
  comprador: string | null; dataCompra: string | null;
}
export interface SorteioHistorico extends Sorteio { totalParticipantes: number; }
export interface LotericaHistorico extends LotericaData { totalVendidos: number; }
export interface PriceReportData {
  id: string; itemId: string; itemName: string; nickname: string;
  steelPrice: number; cementPrice: number; data: string;
}
export interface ReporterRanking {
  nickname: string; count: number; lastReport: string;
}

function dateStr(d: string | Date): string {
  if (!d) return "";
  return d instanceof Date ? d.toISOString() : d;
}

function parseDates<T extends Record<string, unknown>>(
  items: T[], dateFields: string[]
): T[] {
  return items.map((item) => {
    const parsed = { ...item };
    for (const f of dateFields) {
      if (parsed[f]) parsed[f] = dateStr(parsed[f] as string) as never;
    }
    return parsed;
  });
}

// === API HELPERS ===
async function apiGet(action: string, params?: Record<string, string>): Promise<unknown> {
  const url = new URL("/api/banco", window.location.origin);
  url.searchParams.set("action", action);
  if (params) for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString());
  const data = await res.json();
  if ("error" in data) throw new Error(data.error as string);
  return data;
}

async function apiPost(action: string, body: Record<string, unknown>): Promise<unknown> {
  const adminPassword = sessionStorage.getItem('adminPwd');
  const modToken = sessionStorage.getItem('modToken');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (adminPassword) headers['x-admin-password'] = adminPassword;
  else if (modToken) headers['x-moderador-token'] = modToken;
  const res = await fetch('/api/banco', {
    method: 'POST', headers,
    body: JSON.stringify({ action, ...body }),
  });
  const data = await res.json();
  if ('error' in data) throw new Error(data.error as string);
  return data;
}

// === HOOK ===
export function useBank() {
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [investidores, setInvestidores] = useState<Investidor[]>([]);
  const [tabelasTroca, setTabelasTroca] = useState<TabelaTroca[]>([]);
  const [trocas, setTrocas] = useState<TrocaRegistro[]>([]);
  const [comprasVendas, setComprasVendas] = useState<CompraVenda[]>([]);
  const [caixa, setCaixa] = useState<CaixaRegistro[]>([]);
  const [doadores, setDoadores] = useState<Doador[]>([]);
  const [leiloes, setLeiloes] = useState<Leilao[]>([]);
  const [lances, setLances] = useState<Lance[]>([]);
  const [sorteios, setSorteios] = useState<Sorteio[]>([]);
  const [loterica, setLoterica] = useState<LotericaData | null>(null);
  const [lotericaNumeros, setLotericaNumeros] = useState<NumeroLoterica[]>([]);
  const [historicoSorteios, setHistoricoSorteios] = useState<SorteioHistorico[]>([]);
  const [historicoLoterica, setHistoricoLoterica] = useState<LotericaHistorico[]>([]);
  const [reporterRanking, setReporterRanking] = useState<ReporterRanking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);
  const loadTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const loadAll = useCallback(async () => {
    if (!mountedRef.current) return;
    try {
      // === SINGLE unified request instead of 14+ parallel requests ===
      const data = await apiGet("loadAll") as Record<string, unknown>;
      if (!mountedRef.current) return;

      setEmprestimos(parseDates(data.emprestimos as Emprestimo[], ["dataEmprestimo", "dataPagamento"]));
      setInvestidores(parseDates(data.investidores as Investidor[], ["dataEntrada"]));
      setTabelasTroca(data.tabelasTroca as TabelaTroca[]);
      setTrocas(parseDates(data.trocas as TrocaRegistro[], ["data"]));
      setComprasVendas(parseDates(data.comprasVendas as CompraVenda[], ["data"]));
      setCaixa(parseDates(data.caixa as CaixaRegistro[], ["data"]));
      setDoadores(parseDates(data.doadores as Doador[], ["data"]));
      setLeiloes(parseDates(data.leiloes as Leilao[], ["dataCriacao", "dataExpiracao", "dataUltimoLance"]));
      setLances(parseDates(data.lances as Lance[], ["data"]));
      setSorteios(parseDates(data.sorteios as Sorteio[], ["dataCriacao", "dataFim"]));
      setHistoricoSorteios(parseDates(data.historicoSorteios as SorteioHistorico[], ["dataCriacao", "dataFim"]));
      setHistoricoLoterica(parseDates(data.historicoLoterica as LotericaHistorico[], ["dataCriacao", "dataFimVendas", "dataSorteio"]));
      setReporterRanking(data.reporterRanking as ReporterRanking[]);

      const lotArr = data.loterica as LotericaData[] | null;
      if (lotArr && !(Array.isArray(lotArr) && lotArr.length === 0)) {
        const lotParsed = parseDates([lotArr as unknown as LotericaData], ["dataCriacao", "dataFimVendas", "dataSorteio"])[0];
        setLoterica(lotParsed);
      } else {
        setLoterica(null);
      }
      setLotericaNumeros(parseDates((data.lotericaNumeros || []) as NumeroLoterica[], ["dataCompra"]));
    } catch {
      // silent - will retry on next interval
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, []);

  // Polling: 60s interval, pauses when tab is hidden
  const POLL_INTERVAL = 60000;
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        isVisibleRef.current = false;
      } else {
        isVisibleRef.current = true;
        loadAll();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [loadAll]);

  useEffect(() => {
    mountedRef.current = true;
    loadAll();
    const interval = setInterval(() => {
      if (isVisibleRef.current) loadAll();
    }, POLL_INTERVAL);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [loadAll]);

  // Inventory calculated from caixa
  const inventory = useMemo(() => {
    const inv: Record<string, number> = {};
    caixa.forEach((reg) => {
      if (!inv[reg.item]) inv[reg.item] = 0;
      if (reg.tipo === "entrada") inv[reg.item] += reg.quantidade;
      else inv[reg.item] -= reg.quantidade;
    });
    return inv;
  }, [caixa]);

  // Helper: add caixa record
  const addCaixa = useCallback(async (data: {
    tipo: string; descricao: string; item: string;
    quantidade: number; valor?: number; origem: string;
  }) => {
    await apiPost("addCaixa", data);
  }, []);

  // === EMPRÉSTIMOS ===
  const addEmprestimo = useCallback(async (d: {
    player: string; item: string; quantidade: number;
    tipoMembro: string; dataEmprestimo: string; status: string;
  }) => {
    await apiPost("addEmprestimo", d);
    await addCaixa({
      tipo: "saida", descricao: `Empréstimo para ${d.player}`,
      item: d.item, quantidade: d.quantidade, origem: "emprestimo",
    });
    loadAll();
  }, [addCaixa, loadAll]);

  const pagarEmprestimo = useCallback(async (id: string, pagamento: { itemPagamento: string; quantidadePaga: number }) => {
    const emp = emprestimos.find((e) => e.id === id);
    if (!emp) return;
    await apiPost("updateEmprestimo", {
      id, status: "pago", dataPagamento: new Date().toISOString(), ...pagamento,
    });
    await addCaixa({
      tipo: "entrada", descricao: `Pagamento de empréstimo - ${emp.player}`,
      item: pagamento.itemPagamento, quantidade: pagamento.quantidadePaga, origem: "emprestimo",
    });
    loadAll();
  }, [emprestimos, addCaixa, loadAll]);

  // === INVESTIDORES ===
  const addInvestidor = useCallback(async (nome: string, observacao?: string) => {
    await apiPost("addInvestidor", { nome, observacao }); loadAll();
  }, [loadAll]);
  const removeInvestidor = useCallback(async (id: string) => {
    await apiPost("removeInvestidor", { id }); loadAll();
  }, [loadAll]);
  const reorderInvestidores = useCallback(async (updates: { id: string; ordem: number }[]) => {
    await apiPost("reorderInvestidores", { updates }); loadAll();
  }, [loadAll]);

  // === TABELAS DE TROCA ===
  const addTabelaTroca = useCallback(async (d: {
    itemBase: string; quantidadeBase: number; itemResultado: string;
    quantidadeResultado: number; categoria?: string;
  }) => {
    await apiPost("addTabelaTroca", d); loadAll();
  }, [loadAll]);
  const removeTabelaTroca = useCallback(async (id: string) => {
    await apiPost("removeTabelaTroca", { id }); loadAll();
  }, [loadAll]);

  // === TROCAS ===
  const addTroca = useCallback(async (d: {
    player: string; itemEnviado: string; quantidadeEnviada: number;
    itemRecebido: string; quantidadeRecebida: number; tipoMembro: string;
    taxaAplicada: number; lucroBanco: number;
  }) => {
    await apiPost("addTroca", d);
    if (d.tipoMembro === "banco") {
      // Banco: itens saem e entram do estoque do banco (sem taxa)
      await addCaixa({ tipo: "saida", descricao: `Troca interna banco: saiu ${d.quantidadeEnviada}x ${d.itemEnviado}`, item: d.itemEnviado, quantidade: d.quantidadeEnviada, origem: "troca_banco" });
      await addCaixa({ tipo: "entrada", descricao: `Troca interna banco: entrou ${d.quantidadeRecebida}x ${d.itemRecebido}`, item: d.itemRecebido, quantidade: d.quantidadeRecebida, origem: "troca_banco" });
    } else {
      // Player: só registra o lucro (taxa) no caixa do banco
      if (d.lucroBanco > 0) {
        await addCaixa({ tipo: "entrada", descricao: `Lucro troca de ${d.player} (${d.taxaAplicada}%)`, item: d.itemRecebido, quantidade: d.lucroBanco, origem: `troca:${d.player}` });
      }
    }
    loadAll();
  }, [addCaixa, loadAll]);
  const removeTroca = useCallback(async (id: string) => {
    const troca = trocas.find((t) => t.id === id);
    if (troca) {
      if (troca.tipoMembro === "banco") {
        // Estorno banco: reverte entrada e saída completa
        await addCaixa({ tipo: "entrada", descricao: `Estorno troca interna: devolveu ${troca.quantidadeEnviada}x ${troca.itemEnviado}`, item: troca.itemEnviado, quantidade: troca.quantidadeEnviada, origem: "estorno_troca_banco" });
        await addCaixa({ tipo: "saida", descricao: `Estorno troca interna: removeu ${troca.quantidadeRecebida}x ${troca.itemRecebido}`, item: troca.itemRecebido, quantidade: troca.quantidadeRecebida, origem: "estorno_troca_banco" });
      } else {
        // Estorno player: só reverte o lucro
        if (troca.lucroBanco > 0) {
          await addCaixa({ tipo: "saida", descricao: `Estorno lucro troca de ${troca.player} (${troca.taxaAplicada}%)`, item: troca.itemRecebido, quantidade: troca.lucroBanco, origem: `estorno_troca:${troca.player}` });
        }
      }
    }
    await apiPost("removeTroca", { id });
    loadAll();
  }, [trocas, addCaixa, loadAll]);

  // === COMPRAS VENDAS ===
  const addCompraVenda = useCallback(async (d: {
    tipo: string; player: string; item: string; quantidade: number;
    itemPagamento?: string; valor: number; observacao?: string;
  }) => {
    await apiPost("addCompraVenda", d);
    if (d.tipo === "compra") {
      await addCaixa({ tipo: "entrada", descricao: `Compra de ${d.player}`, item: d.item, quantidade: d.quantidade, origem: "compra_venda" });
      await addCaixa({ tipo: "saida", descricao: `Pagamento compra - ${d.player}`, item: d.itemPagamento || "Valor", quantidade: d.valor, origem: "compra_venda" });
    } else {
      await addCaixa({ tipo: "saida", descricao: `Venda para ${d.player}`, item: d.item, quantidade: d.quantidade, origem: "compra_venda" });
      await addCaixa({ tipo: "entrada", descricao: `Recebimento venda - ${d.player}`, item: d.itemPagamento || "Valor", quantidade: d.valor, origem: "compra_venda" });
    }
    loadAll();
  }, [addCaixa, loadAll]);

  // === DOADORES ===
  const addDoador = useCallback(async (nome: string, item: string, quantidade: number) => {
    const created = await apiPost("addDoador", { nome, item, quantidade }) as Doador;
    await addCaixa({ tipo: "entrada", descricao: `Doação de ${nome}`, item, quantidade, origem: `doacao:${created.id}` });
    loadAll();
  }, [addCaixa, loadAll]);
  const removeDoador = useCallback(async (id: string) => {
    await apiPost("removeDoador", { id }); loadAll();
  }, [loadAll]);
  const reorderDoadores = useCallback(async (updates: { id: string; ordem: number }[]) => {
    await apiPost("reorderDoadores", { updates }); loadAll();
  }, [loadAll]);

  // === CAIXA ===
  const addCaixaManual = useCallback(async (d: {
    tipo: string; descricao: string; item: string;
    quantidade: number; valor?: number; origem: string;
  }) => {
    await addCaixa(d); loadAll();
  }, [addCaixa, loadAll]);
  const resetBanco = useCallback(async () => {
    await apiPost("resetAll", {});
    toast.success("Banco resetado com sucesso!");
    loadAll();
  }, [loadAll]);

  // === LEILÕES ===
  const addLeilao = useCallback(async (d: {
    donoItem: string; nomeItem: string; imagemUrl?: string | null;
    quantidade?: number; valorInicial: number; moedaAceita: string;
    taxaCasa: number; dataExpiracao: string; tipoOrigem: string;
  }) => {
    await apiPost("addLeilao", d); loadAll();
  }, [loadAll]);
  const updateLeilao = useCallback(async (id: string, data: Record<string, unknown>) => {
    await apiPost("updateLeilao", { id, ...data }); loadAll();
  }, [loadAll]);
  const removeLeilao = useCallback(async (id: string) => {
    await apiPost("removeLeilao", { id });
    toast.success("Leilão removido!"); loadAll();
  }, [loadAll]);
  const darLance = useCallback(async (leilaoId: string, jogador: string, valor: number) => {
    try {
      await apiPost("addLance", { leilaoId, jogador, valor });
      loadAll();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao dar lance");
      throw e;
    }
  }, [loadAll]);
  const getLancesByLeilao = useCallback((leilaoId: string): Lance[] => {
    return lances.filter((l) => l.leilaoId === leilaoId).sort((a, b) => b.valor - a.valor);
  }, [lances]);
  const finalizarLeilao = useCallback(async (leilao: Leilao) => {
    const lancesLeilao = getLancesByLeilao(leilao.id);
    if (lancesLeilao.length === 0) { toast.error("Não há lances neste leilão."); return; }
    const vencedor = lancesLeilao[0];
    const tipoOrigem = leilao.tipoOrigem || "comum";
    const lucroBanco = tipoOrigem === "banco"
      ? vencedor.valor
      : Math.round(vencedor.valor * ((leilao.taxaCasa || 15) / 100));
    await updateLeilao(leilao.id, {
      status: "finalizado", vencedor: vencedor.jogador, valorVencedor: vencedor.valor,
    });
    await addCaixa({
      tipo: "entrada",
      descricao: tipoOrigem === "banco"
        ? `Leilão do banco: ${leilao.nomeItem} (vencedor: ${vencedor.jogador})`
        : `Taxa casa leilão: ${leilao.nomeItem} (vencedor: ${vencedor.jogador})`,
      item: leilao.moedaAceita, quantidade: lucroBanco, origem: "leilao",
    });
    toast.success(`Leilão finalizado! Lucro do banco: ${lucroBanco} ${leilao.moedaAceita}`);
  }, [getLancesByLeilao, updateLeilao, addCaixa]);

  // === SORTEIOS ===
  const addSorteio = useCallback(async (nomeItem: string, quantidade: number, duracaoMinutos: number) => {
    await apiPost("addSorteio", { nomeItem, quantidade, duracaoMinutos }); loadAll();
  }, [loadAll]);
  const participarSorteio = useCallback(async (sorteioId: string, jogador: string) => {
    try {
      await apiPost("participarSorteio", { sorteioId, jogador }); loadAll();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao participar"); throw e;
    }
  }, [loadAll]);
  const sortear = useCallback(async (sorteioId: string) => {
    try {
      const result = (await apiPost("sortear", { sorteioId })) as { ganhador: string };
      toast.success(`Sorteio finalizado! Ganhador: ${result.ganhador}`);
      loadAll();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro no sorteio");
    }
  }, [loadAll]);
  const removeSorteio = useCallback(async (id: string) => {
    await apiPost("removeSorteio", { id }); loadAll();
  }, [loadAll]);
  const getParticipantes = useCallback(async (sorteioId: string): Promise<Participante[]> => {
    const data = await apiGet("listParticipantes", { sorteioId });
    return parseDates(data as Participante[], ["data"]);
  }, []);

  // === LOTÉRICA ===
  const criarLoterica = useCallback(async (valorNumero: number, moedaAceita: string, premioMinimo: number, duracaoMinutos: number) => {
    await apiPost("criarLoterica", { valorNumero, moedaAceita, premioMinimo, duracaoMinutos }); loadAll();
  }, [loadAll]);
  const comprarNumero = useCallback(async (lotericaId: string, numero: number, comprador: string) => {
    try {
      await apiPost("comprarNumero", { lotericaId, numero, comprador });
      toast.success("Número comprado com sucesso!"); loadAll();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao comprar"); throw e;
    }
  }, [loadAll]);
  const iniciarSorteioLoterica = useCallback(async (lotericaId: string) => {
    try {
      const result = (await apiPost("iniciarSorteioLoterica", { lotericaId })) as {
        numeroSorteado: number; ganhador: string | null; premioFinal: number; taxaBanco: number; acumulou: boolean;
      };
      if (result.acumulou) {
        toast.success(`Número sorteado: ${result.numeroSorteado} - Ninguém acertou! Prêmio de ${result.premioFinal} acumulou!`);
      } else {
        toast.success(`Número sorteado: ${result.numeroSorteado} - Ganhador: ${result.ganhador}! Prêmio: ${result.premioFinal}`);
      }
      loadAll();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro no sorteio");
    }
  }, [loadAll]);
  const finalizarLoterica = useCallback(async (lotericaId: string) => {
    try {
      const result = (await apiPost("finalizarLoterica", { lotericaId })) as { acumuladoProxima: number };
      if (result.acumuladoProxima > 0) {
        toast.success(`Lotérica finalizada! ${result.acumuladoProxima} acumulado para a próxima.`);
      } else {
        toast.success("Lotérica finalizada! Pode criar uma nova.");
      }
      loadAll();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao finalizar");
    }
  }, [loadAll]);

  return {
    emprestimos, investidores, tabelasTroca, trocas, comprasVendas,
    caixa, doadores, leiloes, lances, sorteios, loterica, lotericaNumeros,
    historicoSorteios, historicoLoterica, reporterRanking,
    inventory, isLoading,
    addEmprestimo, pagarEmprestimo,
    addInvestidor, removeInvestidor, reorderInvestidores,
    addTabelaTroca, removeTabelaTroca,
    addTroca, removeTroca,
    addCompraVenda,
    addDoador, removeDoador, reorderDoadores,
    addCaixaManual, resetBanco,
    addLeilao, updateLeilao, removeLeilao,
    darLance, getLancesByLeilao, finalizarLeilao,
    addSorteio, participarSorteio, sortear, removeSorteio, getParticipantes,
    criarLoterica, comprarNumero, iniciarSorteioLoterica, finalizarLoterica,
    reportPrice: async (d: { itemId: string; itemName: string; nickname: string; steelPrice: number; cementPrice: number }) => {
      await apiPost("reportPrice", d); loadAll();
    },
  };
}
