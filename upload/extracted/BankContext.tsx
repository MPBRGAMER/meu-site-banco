import React, { createContext, useContext, useMemo, useCallback, useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// Tipos baseados no schema do banco
export interface Emprestimo {
  id: string;
  player: string;
  item: string;
  quantidade: number;
  dataEmprestimo: string;
  tipoMembro: "comum" | "investidor";
  status: "pendente" | "pago";
  dataPagamento?: string | null;
  itemPagamento?: string | null;
  quantidadePaga?: number | null;
}

export interface Investidor {
  id: string;
  nome: string;
  dataEntrada: string;
  status: "ativo" | "inativo";
  observacao?: string;
  ordem: number;
}

export interface TabelaTroca {
  id: string;
  itemBase: string;
  quantidadeBase: number;
  itemResultado: string;
  quantidadeResultado: number;
  categoria?: string;
}

export interface TrocaRegistro {
  id: string;
  player: string;
  itemEnviado: string;
  quantidadeEnviada: number;
  itemRecebido: string;
  quantidadeRecebida: number;
  tipoMembro: "comum" | "investidor";
  taxaAplicada: number;
  lucroBanco: number;
  data: string;
}

export interface CompraVenda {
  id: string;
  tipo: "compra" | "venda";
  player: string;
  item: string;
  quantidade: number;
  itemPagamento?: string;
  valor: number;
  data: string;
  observacao?: string;
}

export interface CaixaRegistro {
  id: string;
  tipo: "entrada" | "saida";
  descricao: string;
  item: string;
  quantidade: number;
  valor?: number;
  data: string;
  origem: string;
}

export interface Doador {
  id: string;
  nome: string;
  item: string;
  quantidade: number;
  data: string;
  ordem: number;
}

export interface Leilao {
  id: string;
  donoItem: string;
  nomeItem: string;
  imagemUrl?: string | null;
  valorInicial: number;
  moedaAceita: string;
  taxaCasa: number | null;
  status: "ativo" | "espera" | "finalizado";
  dataCriacao: string;
  dataExpiracao: string;
  dataUltimoLance?: string | null;
  vencedor?: string | null;
  valorVencedor?: number | null;
  tipoMembroVencedor?: string | null;
  tipoOrigem?: "comum" | "investidor" | "banco";
}

export interface Lance {
  id: string;
  leilaoId: string;
  jogador: string;
  valor: number;
  data: string;
}

export interface Sorteio {
  id: string;
  nomeItem: string;
  quantidade: number;
  duracaoMinutos: number;
  status: "ativo" | "finalizado";
  dataCriacao: string;
  dataFim?: string;
  ganhador?: string | null;
}

export interface Participante {
  id: string;
  sorteioId: string;
  jogador: string;
  data: string;
}

export interface LotericaData {
  id: string;
  status: "configurando" | "vendas_abertas" | "sorteio_realizado";
  valorNumero: number;
  moedaAceita: string;
  premioMinimo: number | null;
  duracaoMinutos: number | null;
  dataCriacao: string;
  dataFimVendas?: string | null;
  dataSorteio?: string | null;
  numeroSorteado?: number | null;
  ganhador?: string | null;
  valorPremio: number | null;
  arrecadadoTotal: number | null;
}

export interface NumeroLoterica {
  id: string;
  lotericaId: string;
  numero: number;
  comprador?: string | null;
  dataCompra?: string | null;
}

interface BankContextType {
  emprestimos: Emprestimo[];
  investidores: Investidor[];
  tabelasTroca: TabelaTroca[];
  trocas: TrocaRegistro[];
  comprasVendas: CompraVenda[];
  caixa: CaixaRegistro[];
  doadores: Doador[];
  leiloes: Leilao[];
  lances: Lance[];
  inventory: Record<string, number>;
  sorteios: Sorteio[];
  loterica: LotericaData | null;
  
  addEmprestimo: (data: Omit<Emprestimo, "id">) => void;
  pagarEmprestimo: (id: string, dataPagamento: { itemPagamento: string; quantidadePaga: number }) => void;
  addInvestidor: (nome: string, observacao?: string) => void;
  removeInvestidor: (id: string) => void;
  reorderInvestidores: (updates: { id: string; ordem: number }[]) => void;
  addTabelaTroca: (data: Omit<TabelaTroca, "id">) => void;
  removeTabelaTroca: (id: string) => void;
  addTroca: (data: Omit<TrocaRegistro, "id" | "data">) => void;
  addCompraVenda: (data: Omit<CompraVenda, "id" | "data">) => void;
  addDoador: (nome: string, item: string, quantidade: number) => void;
  reorderDoadores: (updates: { id: string; ordem: number }[]) => void;
  updateDoadorOrdem: (nome: string, ordem: number) => void;
  addCaixaManual: (data: Omit<CaixaRegistro, "id" | "data">) => void;
  resetBanco: () => void;
  addLeilao: (data: Omit<Leilao, "id">) => void;
  updateLeilao: (id: string, data: { status?: string; vencedor?: string; valorVencedor?: number; tipoMembroVencedor?: string }) => void;
  removeLeilao: (id: string) => void;
  darLance: (leilaoId: string, jogador: string, valor: number) => void;
  getLancesByLeilao: (leilaoId: string) => Lance[];
  addSorteio: (nomeItem: string, quantidade: number, duracaoMinutos: number) => void;
  participarSorteio: (sorteioId: string, jogador: string) => void;
  sortear: (sorteioId: string) => void;
  removeSorteio: (id: string) => void;
  getParticipantes: (sorteioId: string) => Participante[];
  criarLoterica: (valorNumero: number, moedaAceita: string, premioMinimo: number, duracaoMinutos: number) => void;
  comprarNumero: (lotericaId: string, numero: number, comprador: string) => void;
  iniciarSorteioLoterica: (lotericaId: string) => void;
  isLoading: boolean;
}

const BankContext = createContext<BankContextType | undefined>(undefined);

export function BankProvider({ children }: { children: React.ReactNode }) {
  const utils = trpc.useUtils();

  // Queries
  const { data: emprestimos = [], isLoading: loadingEmp } = trpc.emprestimos.list.useQuery();
  const { data: investidores = [], isLoading: loadingInv } = trpc.investidores.list.useQuery();
  const { data: tabelasTroca = [], isLoading: loadingTab } = trpc.tabelasTroca.list.useQuery();
  const { data: trocas = [], isLoading: loadingTro } = trpc.trocas.list.useQuery();
  const { data: comprasVendas = [], isLoading: loadingCV } = trpc.comprasVendas.list.useQuery();
  const { data: caixa = [], isLoading: loadingCai } = trpc.caixa.list.useQuery();
  const { data: doadores = [], isLoading: loadingDoa } = trpc.doadores.list.useQuery();
  const { data: leiloes = [], isLoading: loadingLei } = trpc.leiloes.list.useQuery();
  const { data: lancesRaw = [], isLoading: loadingLan } = trpc.lances.allList.useQuery();
  const { data: sorteios = [], isLoading: loadingSor } = trpc.sorteios.list.useQuery();
  const { data: lotericaData, isLoading: loadingLot } = trpc.loterica.get.useQuery();
  const { data: lotericaNumeros = [], isLoading: loadingNum } = trpc.loterica.numeros.useQuery(
    { lotericaId: lotericaData?.[0]?.id || "" },
    { enabled: !!lotericaData?.[0]?.id }
  );

  // Converter Date para string
  const lances = useMemo(() => 
    (lancesRaw || []).map((l: any) => ({
      ...l,
      data: l.data instanceof Date ? l.data.toISOString() : l.data,
    }))
  , [lancesRaw]);

  const isLoading = loadingEmp || loadingInv || loadingTab || loadingTro || loadingCV || loadingCai || loadingDoa || loadingLei || loadingLan || loadingSor || loadingLot || loadingNum;

  // Mutations
  const addEmpMutation = trpc.emprestimos.add.useMutation({ onSuccess: () => utils.emprestimos.invalidate() });
  const updateEmpMutation = trpc.emprestimos.update.useMutation({ onSuccess: () => utils.emprestimos.invalidate() });
  const addInvMutation = trpc.investidores.add.useMutation({ onSuccess: () => utils.investidores.invalidate() });
  const removeInvMutation = trpc.investidores.remove.useMutation({ onSuccess: () => utils.investidores.invalidate() });
  const reorderInvMutation = trpc.investidores.reorder.useMutation({ onSuccess: () => utils.investidores.invalidate() });
  const addTabMutation = trpc.tabelasTroca.add.useMutation({ onSuccess: () => utils.tabelasTroca.invalidate() });
  const removeTabMutation = trpc.tabelasTroca.remove.useMutation({ onSuccess: () => utils.tabelasTroca.invalidate() });
  const addTrocaMutation = trpc.trocas.add.useMutation({ onSuccess: () => utils.trocas.invalidate() });
  const addCVMutation = trpc.comprasVendas.add.useMutation({ onSuccess: () => utils.comprasVendas.invalidate() });
  const addCaiMutation = trpc.caixa.add.useMutation({ onSuccess: () => utils.caixa.invalidate() });
  const resetCaiMutation = trpc.caixa.reset.useMutation({ 
    onSuccess: () => {
      utils.caixa.invalidate();
      utils.emprestimos.invalidate();
      utils.trocas.invalidate();
      utils.comprasVendas.invalidate();
      utils.doadores.invalidate();
    } 
  });
  const addDoaMutation = trpc.doadores.add.useMutation({ onSuccess: () => utils.doadores.invalidate() });
  const reorderDoaMutation = trpc.doadores.reorder.useMutation({ onSuccess: () => utils.doadores.invalidate() });
  const addLeiMutation = trpc.leiloes.add.useMutation({ onSuccess: () => { utils.leiloes.invalidate(); utils.lances.invalidate(); } });
  const updateLeiMutation = trpc.leiloes.update.useMutation({ onSuccess: () => { utils.leiloes.invalidate(); utils.lances.invalidate(); } });
  const removeLeiMutation = trpc.leiloes.remove.useMutation({ onSuccess: () => { utils.leiloes.invalidate(); utils.lances.invalidate(); } });
  const addLanceMutation = trpc.lances.add.useMutation({ 
    onSuccess: () => { utils.lances.invalidate(); utils.leiloes.invalidate(); },
    onError: (err) => toast.error(err.message)
  });
  const addSorMutation = trpc.sorteios.add.useMutation({ onSuccess: () => utils.sorteios.invalidate() });
  const participarMutation = trpc.sorteios.participar.useMutation({ 
    onSuccess: () => utils.sorteios.invalidate(),
    onError: (err) => toast.error(err.message)
  });
  const sortearMutation = trpc.sorteios.sortear.useMutation({
    onSuccess: (data) => { toast.success(`Sorteio finalizado! Ganhador: ${data.ganhador}`); utils.sorteios.invalidate(); },
    onError: (err) => toast.error(err.message),
  });
  const participantesQuery = trpc.sorteios.participantes.useQuery;
  const removeSorMutation = trpc.sorteios.remove.useMutation({ onSuccess: () => utils.sorteios.invalidate() });
  const criarLotMutation = trpc.loterica.criar.useMutation({ onSuccess: () => { utils.loterica.invalidate(); } });
  const comprarNumMutation = trpc.loterica.comprar.useMutation({ 
    onSuccess: () => { utils.loterica.invalidate(); toast.success("Número comprado com sucesso!"); },
    onError: (err) => toast.error(err.message)
  });
  const iniciarSortLotMutation = trpc.loterica.iniciarSorteio.useMutation({
    onSuccess: (data) => { toast.success(`Número sorteado: ${data.numeroSorteado} - Ganhador: ${data.ganhador}`); utils.loterica.invalidate(); },
    onError: (err) => toast.error(err.message),
  });

  // Helpers
  const addCaixa = useCallback((data: Omit<CaixaRegistro, "id" | "data">) => {
    addCaiMutation.mutate(data);
  }, [addCaiMutation]);

  const addEmprestimo = useCallback((data: Omit<Emprestimo, "id">) => {
    addEmpMutation.mutate(data);
    addCaixa({
      tipo: "saida",
      descricao: `Empréstimo para ${data.player}`,
      item: data.item,
      quantidade: data.quantidade,
      origem: "emprestimo",
    });
  }, [addEmpMutation, addCaixa]);

  const pagarEmprestimo = useCallback((id: string, dataPagamento: { itemPagamento: string; quantidadePaga: number }) => {
    const emp = emprestimos.find((e: any) => e.id === id);
    if (!emp) return;

    updateEmpMutation.mutate({
      id,
      data: {
        status: "pago",
        dataPagamento: new Date().toISOString(),
        itemPagamento: dataPagamento.itemPagamento,
        quantidadePaga: dataPagamento.quantidadePaga,
      },
    });

    addCaixa({
      tipo: "entrada",
      descricao: `Pagamento de empréstimo - ${emp.player}`,
      item: dataPagamento.itemPagamento,
      quantidade: dataPagamento.quantidadePaga,
      origem: "emprestimo",
    });
  }, [emprestimos, updateEmpMutation, addCaixa]);

  const addInvestidor = useCallback((nome: string, observacao?: string) => {
    addInvMutation.mutate({ nome, observacao });
  }, [addInvMutation]);

  const removeInvestidor = useCallback((id: string) => {
    removeInvMutation.mutate({ id });
  }, [removeInvMutation]);

  const reorderInvestidores = useCallback((updates: { id: string; ordem: number }[]) => {
    reorderInvMutation.mutate({ updates });
  }, [reorderInvMutation]);

  const addTabelaTroca = useCallback((data: Omit<TabelaTroca, "id">) => {
    addTabMutation.mutate(data);
  }, [addTabMutation]);

  const removeTabelaTroca = useCallback((id: string) => {
    removeTabMutation.mutate({ id });
  }, [removeTabMutation]);

  const addTroca = useCallback((data: Omit<TrocaRegistro, "id" | "data">) => {
    addTrocaMutation.mutate(data);
    addCaixa({
      tipo: "entrada",
      descricao: `Lucro de troca - ${data.player}`,
      item: data.itemRecebido,
      quantidade: data.lucroBanco,
      origem: "troca",
    });
  }, [addTrocaMutation, addCaixa]);

  const addCompraVenda = useCallback((data: Omit<CompraVenda, "id" | "data">) => {
    addCVMutation.mutate(data);
    if (data.tipo === "compra") {
      addCaixa({
        tipo: "entrada",
        descricao: `Compra de ${data.player}`,
        item: data.item,
        quantidade: data.quantidade,
        origem: "compra_venda",
      });
      addCaixa({
        tipo: "saida",
        descricao: `Pagamento compra - ${data.player}`,
        item: data.itemPagamento || "Valor",
        quantidade: data.valor,
        origem: "compra_venda",
      });
    } else {
      addCaixa({
        tipo: "saida",
        descricao: `Venda para ${data.player}`,
        item: data.item,
        quantidade: data.quantidade,
        origem: "compra_venda",
      });
      addCaixa({
        tipo: "entrada",
        descricao: `Recebimento venda - ${data.player}`,
        item: data.itemPagamento || "Valor",
        quantidade: data.valor,
        origem: "compra_venda",
      });
    }
  }, [addCVMutation, addCaixa]);

  const addDoador = useCallback((nome: string, item: string, quantidade: number) => {
    addDoaMutation.mutate({ nome, item, quantidade });
    addCaixa({
      tipo: "entrada",
      descricao: `Doação de ${nome}`,
      item: item,
      quantidade: quantidade,
      origem: "doacao",
    });
  }, [addDoaMutation, addCaixa]);

  const reorderDoadores = useCallback((updates: { id: string; ordem: number }[]) => {
    reorderDoaMutation.mutate({ updates });
  }, [reorderDoaMutation]);

  const updateDoadorOrdem = useCallback((nome: string, ordem: number) => {
    // Atualizar a ordem de todas as doações desse nome
    const doacoesDoNome = doadores.filter((d: any) => d.nome === nome);
    const updates = doacoesDoNome.map((d: any) => ({ id: d.id, ordem }));
    if (updates.length > 0) {
      reorderDoaMutation.mutate({ updates });
    }
  }, [doadores, reorderDoaMutation]);

  const addCaixaManual = useCallback((data: Omit<CaixaRegistro, "id" | "data">) => {
    addCaixa(data);
  }, [addCaixa]);

  const resetBanco = useCallback(() => {
    resetCaiMutation.mutate();
    toast.success("Banco resetado com sucesso!");
  }, [resetCaiMutation]);

  const addLeilao = useCallback((data: Omit<Leilao, "id">) => {
    addLeiMutation.mutate({
      donoItem: data.donoItem,
      nomeItem: data.nomeItem,
      imagemUrl: data.imagemUrl || undefined,
      valorInicial: data.valorInicial,
      moedaAceita: data.moedaAceita,
      taxaCasa: data.taxaCasa || 15,
      dataExpiracao: data.dataExpiracao,
    });
  }, [addLeiMutation]);

  const updateLeilao = useCallback((id: string, data: { status?: string; vencedor?: string; valorVencedor?: number; tipoMembroVencedor?: string }) => {
    updateLeiMutation.mutate({ id, data } as any);
  }, [updateLeiMutation]);

  const removeLeilao = useCallback((id: string) => {
    removeLeiMutation.mutate({ id });
    toast.success("Leilão removido!");
  }, [removeLeiMutation]);

  const darLance = useCallback((leilaoId: string, jogador: string, valor: number) => {
    addLanceMutation.mutate({ leilaoId, jogador, valor });
  }, [addLanceMutation]);

  const getLancesByLeilao = useCallback((leilaoId: string): Lance[] => {
    return lances.filter((l: any) => l.leilaoId === leilaoId).sort((a: any, b: any) => b.valor - a.valor);
  }, [lances]);

  // Sorteios
  const addSorteio = useCallback((nomeItem: string, quantidade: number, duracaoMinutos: number) => {
    addSorMutation.mutate({ nomeItem, quantidade, duracaoMinutos });
  }, [addSorMutation]);

  const participarSorteio = useCallback((sorteioId: string, jogador: string) => {
    participarMutation.mutate({ sorteioId, jogador });
  }, [participarMutation]);

  const sortear = useCallback((sorteioId: string) => {
    sortearMutation.mutate({ sorteioId });
  }, [sortearMutation]);

  const removeSorteio = useCallback((id: string) => {
    removeSorMutation.mutate({ id });
  }, [removeSorMutation]);

  const [participantesCache, setParticipantesCache] = useState<Record<string, Participante[]>>({});

  const getParticipantes = useCallback((sorteioId: string): Participante[] => {
    return participantesCache[sorteioId] || [];
  }, [participantesCache]);

  // Carregar participantes de sorteios ativos
  useEffect(() => {
    if (sorteios && sorteios.length > 0) {
      sorteios.forEach((s: any) => {
        if (s.status === "ativo") {
          const queryFn = participantesQuery({ sorteioId: s.id });
          if (queryFn.data) {
            setParticipantesCache((prev: Record<string, Participante[]>) => ({ ...prev, [s.id]: queryFn.data as Participante[] }));
          }
        }
      });
    }
  }, [sorteios]);

  // Lotérica
  const criarLoterica = useCallback((valorNumero: number, moedaAceita: string, premioMinimo: number, duracaoMinutos: number) => {
    criarLotMutation.mutate({ valorNumero, moedaAceita, premioMinimo, duracaoMinutos });
  }, [criarLotMutation]);

  const comprarNumero = useCallback((lotericaId: string, numero: number, comprador: string) => {
    comprarNumMutation.mutate({ lotericaId, numero, comprador });
  }, [comprarNumMutation]);

  const iniciarSorteioLoterica = useCallback((lotericaId: string) => {
    iniciarSortLotMutation.mutate({ lotericaId });
  }, [iniciarSortLotMutation]);

  // Estoque calculado dinamicamente
  const inventory = useMemo(() => {
    const inv: Record<string, number> = {};
    caixa.forEach((reg: any) => {
      const item = reg.item;
      if (!inv[item]) inv[item] = 0;
      if (reg.tipo === "entrada") {
        inv[item] += reg.quantidade;
      } else {
        inv[item] -= reg.quantidade;
      }
    });
    return inv;
  }, [caixa]);

  const loterica = lotericaData?.[0] ? {
    ...lotericaData[0],
    dataCriacao: lotericaData[0].dataCriacao instanceof Date ? lotericaData[0].dataCriacao.toISOString() : lotericaData[0].dataCriacao,
    dataFimVendas: lotericaData[0].dataFimVendas ? (lotericaData[0].dataFimVendas instanceof Date ? lotericaData[0].dataFimVendas.toISOString() : lotericaData[0].dataFimVendas) : null,
    dataSorteio: lotericaData[0].dataSorteio ? (lotericaData[0].dataSorteio instanceof Date ? lotericaData[0].dataSorteio.toISOString() : lotericaData[0].dataSorteio) : null,
  } as LotericaData : null;

  return (
    <BankContext.Provider
      value={{
        emprestimos: emprestimos as any,
        investidores: investidores as any,
        tabelasTroca: tabelasTroca as any,
        trocas: trocas as any,
        comprasVendas: comprasVendas as any,
        caixa: caixa as any,
        doadores: doadores as any,
        leiloes: leiloes as any,
        lances: lances as any,
        inventory,
        sorteios: sorteios as any,
        loterica,
        addEmprestimo,
        pagarEmprestimo,
        addInvestidor,
        removeInvestidor,
        reorderInvestidores,
        addTabelaTroca,
        removeTabelaTroca,
        addTroca,
        addCompraVenda,
        addDoador,
        reorderDoadores,
        updateDoadorOrdem,
        addCaixaManual,
        resetBanco,
        addLeilao,
        updateLeilao,
        removeLeilao,
        darLance,
        getLancesByLeilao,
        addSorteio,
        participarSorteio,
        sortear,
        removeSorteio,
        getParticipantes,
        criarLoterica,
        comprarNumero,
        iniciarSorteioLoterica,
        isLoading,
      }}
    >
      {children}
    </BankContext.Provider>
  );
}

export function useBank() {
  const context = useContext(BankContext);
  if (context === undefined) {
    throw new Error("useBank must be used within a BankProvider");
  }
  return context;
}
