import { useState, useEffect } from "react";
import { useBank } from "@/contexts/BankContext";
import { HandCoins, Users, ArrowLeftRight, Wallet, TrendingUp, Clock, ShoppingCart, Crown, Medal, Package, Trophy, Gavel, Dices, Search, Info, Heart, Timer, Dices as DiceIcon } from "lucide-react";

// Discreet countdown component for active sorteios/loterica
function DiscreetTimer({ label, dataFim, expired }: { label: string; dataFim: string; expired?: boolean }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const deadline = new Date(dataFim);
      const diff = deadline.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("0s");
      } else {
        const horas = Math.floor(diff / 3600000);
        const minutos = Math.floor((diff % 3600000) / 60000);
        const segundos = Math.floor((diff % 60000) / 1000);

        if (horas > 0) {
          setTimeLeft(`${horas}h${minutos}m`);
        } else if (minutos > 0) {
          setTimeLeft(`${minutos}m${segundos}s`);
        } else {
          setTimeLeft(`${segundos}s`);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [dataFim]);

  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-primary/10 text-primary border border-primary/20">
      <Timer className="w-2.5 h-2.5" /> {timeLeft}
    </span>
  );
}

export default function Dashboard() {
  const {
    emprestimos, investidores, trocas, caixa, doadores, comprasVendas, leiloes, sorteios, loterica, inventory, isLoading
  } = useBank();

  const [inventorySearch, setInventorySearch] = useState("");

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Carregando dados do banco...</div>;
  }

  const empPendentes = emprestimos.filter((e) => e.status === "pendente").length;
  const empPagos = emprestimos.filter((e) => e.status === "pago").length;
  const leiloesAtivos = leiloes.filter((l: any) => l.status === "ativo" || l.status === "espera").length;
  const sorteiosAtivos = sorteios.filter((s: any) => s.status === "ativo").length;

  const stats = [
    { label: "Empréstimos Pendentes", value: empPendentes, icon: Clock, color: "text-yellow-400" },
    { label: "Empréstimos Pagos", value: empPagos, icon: TrendingUp, color: "text-green-400" },
    { label: "Investidores Ativos", value: investidores.filter((i: any) => i.status === "ativo").length, icon: Users, color: "text-blue-400" },
    { label: "Trocas Realizadas", value: trocas.length, icon: ArrowLeftRight, color: "text-purple-400" },
    { label: "Compras & Vendas", value: comprasVendas.length, icon: ShoppingCart, color: "text-orange-400" },
    { label: "Registros no Caixa", value: caixa.length, icon: Wallet, color: "text-emerald-400" },
    { label: "Doadores", value: doadores.length, icon: Users, color: "text-pink-400" },
    { label: "Leilões Ativos", value: leiloesAtivos, icon: Gavel, color: "text-amber-400" },
    { label: "Sorteios Ativos", value: sorteiosAtivos, icon: DiceIcon, color: "text-cyan-400" },
  ];

  // Active sorteios with timer
  const activeSorteios = sorteios.filter((s: any) => s.status === "ativo");

  // Active lotérica with timer
  const activeLoterica = loterica && (loterica.status === "vendas_abertas") ? loterica : null;

  // Ranking de Doadores (top 10) - agrupar por nome e ordenar pela ordem manual ou total
  const doadoresRanking = (() => {
    const grouped = doadores.reduce((acc: any, d: any) => {
      const key = d.nome.toLowerCase();
      if (!acc[key]) {
        acc[key] = { nome: d.nome, totalQuantidade: 0, itens: [] as string[] };
      }
      acc[key].totalQuantidade += d.quantidade;
      acc[key].itens.push(`${d.quantidade}x ${d.item}`);
      return acc;
    }, {} as Record<string, { nome: string; totalQuantidade: number; itens: string[] }>);

    const list = Object.values(grouped) as { nome: string; totalQuantidade: number; itens: string[] }[];

    // Verificar se há ordem manual
    const doadorOrdens = new Map<string, number>();
    doadores.forEach((d: any) => {
      const key = d.nome.toLowerCase();
      if (d.ordem !== undefined && d.ordem !== null) {
        const current = doadorOrdens.get(key) || 0;
        doadorOrdens.set(key, Math.max(current, d.ordem));
      }
    });

    if (doadorOrdens.size > 0) {
      list.sort((a, b) => (doadorOrdens.get(b.nome.toLowerCase()) || 0) - (doadorOrdens.get(a.nome.toLowerCase()) || 0));
    } else {
      list.sort((a, b) => b.totalQuantidade - a.totalQuantidade);
    }

    return list;
  })();

  // Inventário com filtro de busca
  const inventoryFiltered = Object.entries(inventory)
    .filter(([item, qtd]) => qtd !== 0)
    .filter(([item]) => item.toLowerCase().includes(inventorySearch.toLowerCase()))
    .sort(([a], [b]) => a.localeCompare(b));

  // Caixa completo - todos os registros ordenados por data (mais recentes primeiro)
  const caixaCompleto = [...caixa].sort((a: any, b: any) => {
    const dateA = new Date(a.data).getTime();
    const dateB = new Date(b.data).getTime();
    return dateB - dateA;
  });

  return (
    <div className="space-y-4">
      {/* Hero Section */}
      <div className="rounded-lg border border-primary/20 bg-card p-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 opacity-10">
          <img src="/manus-storage/52c0cbd3-2da0-4c39-ac25-22cd5d42b5f1_ca77e10b.jpg" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">💀</span>
          <div>
            <h2 className="text-xl font-extrabold text-primary tracking-tight uppercase">Terminal de Controle - Banco do Clã</h2>
            <p className="text-xs text-muted-foreground">Sistema de gestão centralizada Day R Survival</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-md border border-border bg-card p-3 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-3.5 h-3.5 ${stat.color}`} />
                <span className="text-[11px] text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-xl font-bold font-mono text-foreground">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Timer discreto para sorteios ativos */}
      {(activeSorteios.length > 0 || activeLoterica) && (
        <div className="rounded-md border border-cyan-500/20 bg-card p-3">
          <h3 className="text-xs font-bold text-foreground mb-2 flex items-center gap-2">
            <DiceIcon className="w-3.5 h-3.5 text-cyan-400" /> Eventos Ativos
          </h3>
          <div className="flex flex-wrap gap-2">
            {activeSorteios.map((s: any) => (
              <div key={s.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-muted/30 border border-border/50">
                <span className="text-[11px] font-semibold text-foreground">{s.nomeItem}</span>
                {s.dataFim && <DiscreetTimer label="Sorteio" dataFim={s.dataFim} />}
              </div>
            ))}
            {activeLoterica && activeLoterica.dataFimVendas && (
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-muted/30 border border-border/50">
                <span className="text-[11px] font-semibold text-foreground">Lotérica</span>
                <DiscreetTimer label="Lotérica" dataFim={activeLoterica.dataFimVendas} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top 10 Doadores */}
      <div className="rounded-md border border-border bg-card p-3">
        <h3 className="text-xs font-bold text-foreground mb-2 flex items-center gap-2">
          <Trophy className="w-3.5 h-3.5 text-yellow-400" /> Top 10 Doadores
        </h3>
        {doadoresRanking.length === 0 ? (
          <p className="text-xs text-muted-foreground">Nenhum doador cadastrado.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5">
            {doadoresRanking.slice(0, 10).map((d, idx: number) => (
              <div
                key={d.nome}
                className={`flex items-center gap-1.5 py-1.5 px-2 rounded-md border transition-colors ${
                  idx === 0 ? "border-yellow-500/40 bg-yellow-500/5" :
                  idx === 1 ? "border-gray-300/30 bg-gray-300/5" :
                  idx === 2 ? "border-orange-700/30 bg-orange-700/5" :
                  "border-border/50 bg-muted/20"
                }`}
              >
                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                  {idx === 0 ? <Crown className="w-3 h-3 text-yellow-400" /> :
                   idx === 1 ? <Medal className="w-3 h-3 text-gray-300" /> :
                   idx === 2 ? <Medal className="w-3 h-3 text-orange-600" /> :
                   <span className="text-[10px] font-bold text-muted-foreground">#{idx + 1}</span>}
                </div>
                <p className="text-[11px] font-semibold text-foreground truncate">{d.nome}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Estoque do Banco - Cards com busca */}
      <div className="rounded-md border border-border bg-card p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
            <Package className="w-3.5 h-3.5 text-emerald-400" /> Estoque do Banco
          </h3>
          <div className="relative">
            <Search className="w-3 h-3 text-muted-foreground absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar item..."
              value={inventorySearch}
              onChange={(e) => setInventorySearch(e.target.value)}
              className="w-32 sm:w-44 pl-7 pr-2 py-1 rounded-md border border-border bg-muted/30 text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
            />
          </div>
        </div>

        {inventoryFiltered.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            {inventorySearch ? "Nenhum item encontrado." : "Estoque vazio."}
          </p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-1.5">
            {inventoryFiltered.map(([item, qtd]) => (
              <div
                key={item}
                className={`rounded-md border px-2 py-1.5 text-center transition-colors ${
                  qtd > 0 ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"
                }`}
              >
                <p className="text-[10px] font-semibold text-foreground truncate leading-tight">{item}</p>
                <p className={`text-xs font-bold font-mono mt-0.5 ${qtd > 0 ? "text-green-400" : "text-red-400"}`}>
                  {qtd > 0 ? "+" : ""}{qtd}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Movimentos do Caixa - COMPLETO */}
      <div className="rounded-md border border-border bg-card p-3">
        <h3 className="text-xs font-bold text-foreground mb-2 flex items-center gap-2">
          <Wallet className="w-3.5 h-3.5 text-emerald-400" /> Movimentos do Caixa
          <span className="text-[10px] text-muted-foreground font-normal">({caixaCompleto.length} registros)</span>
        </h3>
        {caixaCompleto.length === 0 ? (
          <p className="text-xs text-muted-foreground">Nenhum registro ainda. Faça um empréstimo, troca, compra ou venda para começar.</p>
        ) : (
          <div className="space-y-1 max-h-72 overflow-y-auto">
            {caixaCompleto.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between py-1.5 px-2 rounded border-b border-border/30 text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.tipo === "entrada" ? "bg-green-400" : "bg-red-400"}`} />
                  <div>
                    <span className="text-foreground text-[11px]">{c.descricao}</span>
                    <p className="text-[9px] text-muted-foreground">{c.origem}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-muted-foreground text-[10px]">{new Date(c.data).toLocaleDateString("pt-BR")}</span>
                  <span className={`font-mono font-bold text-[11px] ${c.tipo === "entrada" ? "text-green-400" : "text-red-400"}`}>
                    {c.tipo === "entrada" ? "+" : "-"}{c.quantidade}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
