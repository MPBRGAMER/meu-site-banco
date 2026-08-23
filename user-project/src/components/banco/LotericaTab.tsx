"use client";
import { useState, useEffect } from "react";
import { useBank } from "@/lib/useBank";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Dices, Plus, Clock, Trophy, Timer, AlertCircle, PartyPopper, Search, History, ChevronDown, ChevronUp, Users, Coins, Ticket, Shield, TrendingUp, CheckCircle, XCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import AdSlot from "@/components/AdSlot";
import { getDateLocale } from "./TranslationPopup";

function LotericaTimer({ dataFim }: { dataFim: string }) {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    const t = setInterval(() => {
      const diff = new Date(dataFim).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Encerrado"); return; }
      const h = Math.floor(diff / 3600000); const m = Math.floor((diff % 3600000) / 60000); const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(h > 0 ? `${h}h ${m}m ${s}s` : m > 0 ? `${m}m ${s}s` : `${s}s`);
    }, 1000);
    return () => clearInterval(t);
  }, [dataFim]);
  if (timeLeft === "Encerrado") return <span className="text-xs font-bold text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> ENCERRADO</span>;
  return <span className="text-xs font-bold font-mono flex items-center gap-1 text-primary"><Timer className="w-3 h-3" /> {timeLeft}</span>;
}

function HistoricoLotericaEntry({ entry, index }: {
  entry: {
    id: string; status: string; valorNumero: number; moedaAceita: string;
    premioMinimo: number; premioAcumulado: number; duracaoMinutos: number; dataCriacao: string;
    dataFimVendas: string | null; dataSorteio: string | null;
    numeroSorteado: number | null; ganhador: string | null;
    valorPremio: number; arrecadadoTotal: number; totalVendidos: number;
  };
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);

  const alcMin = (entry.arrecadadoTotal * 0.8) > entry.premioMinimo;
  const taxaBanco = Math.round(alcMin ? entry.arrecadadoTotal * 0.2 : entry.arrecadadoTotal);
  const premio80 = entry.arrecadadoTotal * 0.8;
  const acerto = entry.ganhador ? true : false;
  // Usa valorPremio direto (ja calculado no sorteio)
  const premioFinal = entry.valorPremio || Math.max(premio80, Math.max(entry.premioMinimo, entry.premioAcumulado || 0));

  return (
    <div className="rounded-md border border-border bg-card overflow-hidden">
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-7 h-7 rounded-full border ${acerto ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}>
            <span className="text-xs font-bold">#{index + 1}</span>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">
              Numero: <span className="font-mono text-primary">{String(entry.numeroSorteado || 0).padStart(3, "0")}</span>
            </p>
            <p className="text-xs text-muted-foreground">{new Date(entry.dataCriacao).toLocaleDateString(getDateLocale())}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-muted-foreground">Vendidos</p>
            <p className="text-sm font-bold font-mono text-foreground">{entry.totalVendidos}/1000</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Ganhador</p>
            <p className={`text-sm font-bold ${acerto ? "text-green-400" : "text-red-400"}`}>{entry.ganhador ? <span data-no-translate translate="no">{entry.ganhador}</span> : <span>Acumulou</span>}</p>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>
      {expanded && (
        <div className="border-t border-border bg-muted/20 p-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            <div className="text-center p-2 rounded-md border border-border bg-card">
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Ticket className="w-3 h-3" /> Vendidos</p>
              <p className="text-sm font-bold font-mono text-foreground">{entry.totalVendidos}<span className="text-muted-foreground font-normal">/1000</span></p>
            </div>
            <div className="text-center p-2 rounded-md border border-border bg-card">
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Coins className="w-3 h-3" /> Arrecadado</p>
              <p className="text-sm font-bold font-mono text-primary">{Math.round(entry.arrecadadoTotal)}</p>
              <p className="text-[10px] text-muted-foreground">{entry.valorNumero} {entry.moedaAceita}/num</p>
            </div>
            <div className="text-center p-2 rounded-md border border-border bg-card">
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Trophy className="w-3 h-3" /> Premio Final</p>
              <p className="text-sm font-bold font-mono text-yellow-400">{Math.round(premioFinal)}</p>
              {(entry.premioAcumulado || 0) > 0 && <p className="text-[10px] text-orange-400">+{Math.round(entry.premioAcumulado)} acumulado</p>}
            </div>
            <div className="text-center p-2 rounded-md border border-border bg-card">
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Clock className="w-3 h-3" /> Data Sorteio</p>
              <p className="text-sm font-bold text-foreground">{entry.dataSorteio ? new Date(entry.dataSorteio).toLocaleDateString(getDateLocale()) : "-"}</p>
            </div>
          </div>
          <div className={`rounded-md border p-3 mb-3 ${acerto ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"}`}>
            <div className="flex items-center gap-3">
              {acerto ? <PartyPopper className="w-6 h-6 text-green-400" /> : <AlertCircle className="w-6 h-6 text-red-400" />}
              <div>
                <p className={`text-sm font-bold ${acerto ? "text-green-400" : "text-red-400"}`}>
                  {acerto ? "Teve Ganhador!" : "Ninguem acertou - Premio acumulou"}
                </p>
                {acerto ? (
                  <p className="text-xs text-foreground">
                    Numero <span className="font-bold font-mono text-green-400">{String(entry.numeroSorteado).padStart(3, "0")}</span> - Ganhador: <span className="font-bold text-green-400" data-no-translate translate="no">{entry.ganhador}</span> - Premio: <span className="font-bold text-yellow-400">{Math.round(entry.valorPremio)} {entry.moedaAceita}</span>
                  </p>
                ) : (
                  <p className="text-xs text-foreground">
                    Numero sorteado: <span className="font-bold font-mono text-red-400">{String(entry.numeroSorteado).padStart(3, "0")}</span> - Nao foi vendido - <span className="font-bold text-orange-400">{Math.round(premioFinal)} {entry.moedaAceita} acumulados</span>
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className={`text-center p-2 rounded-md border bg-card ${!alcMin ? "border-red-500/30" : "border-border"}`}>
              <p className="text-[10px] text-muted-foreground">Taxa Banco ({alcMin ? "20%" : "100%"})</p>
              <p className={`text-xs font-bold font-mono ${!alcMin ? "text-red-400" : "text-primary"}`}>{taxaBanco}</p>
              {!alcMin && <p className="text-[9px] text-red-400">80% &lt; minimo</p>}
            </div>
            <div className="text-center p-2 rounded-md border border-border bg-card">
              <p className="text-[10px] text-muted-foreground">Premio Min.</p>
              <p className="text-xs font-bold font-mono text-foreground">{Math.round(entry.premioMinimo)}</p>
            </div>
            <div className="text-center p-2 rounded-md border border-border bg-card">
              <p className="text-[10px] text-muted-foreground">Acumulado Anterior</p>
              <p className="text-xs font-bold font-mono text-orange-400">{Math.round(entry.premioAcumulado || 0)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface LotericaTabProps {
  isAdmin: boolean;
}

export default function LotericaTab({ isAdmin }: LotericaTabProps) {
  const { loterica, lotericaNumeros, historicoLoterica, criarLoterica, comprarNumero, iniciarSorteioLoterica, finalizarLoterica, isLoading } = useBank();
  const [showForm, setShowForm] = useState(false);
  const [valorNumero, setValorNumero] = useState("");
  const [moedaAceita, setMoedaAceita] = useState("");
  const [premioMinimo, setPremioMinimo] = useState("");
  const [duracao, setDuracao] = useState("");
  const [numeroInput, setNumeroInput] = useState("");
  const [compradorNome, setCompradorNome] = useState("");
  const [showComprar, setShowComprar] = useState(false);
  const [searchNumero, setSearchNumero] = useState("");

  const handleCriar = async () => {
    if (!valorNumero || !moedaAceita.trim()) { toast.error("Preencha valor e moeda."); return; }
    if (loterica && (loterica.status === "vendas_abertas" || loterica.status === "sorteio_realizado")) { toast.error("Ja existe loterica ativa. Finalize a atual."); return; }
    try {
      await criarLoterica(parseFloat(valorNumero), moedaAceita.trim(), parseInt(premioMinimo) || 0, parseInt(duracao) || 60);
      toast.success("Lotérica criada!");
      setValorNumero(""); setMoedaAceita(""); setPremioMinimo(""); setDuracao(""); setShowForm(false);
    } catch (e) {
      // handled by hook
    }
  };

  const handleComprar = async () => {
    if (!numeroInput.trim() || !compradorNome.trim()) { toast.error("Numero e nome obrigatorios."); return; }
    const num = parseInt(numeroInput.trim());
    if (num < 1 || num > 1000) { toast.error("Numero entre 1 e 1000."); return; }
    if (!loterica) { toast.error("Sem loterica ativa."); return; }
    try { await comprarNumero(loterica.id, num, compradorNome.trim()); setNumeroInput(""); setCompradorNome(""); setShowComprar(false); } catch { /* handled */ }
  };

  const numerosVendidos = lotericaNumeros.filter((n) => n.comprador);
  const numerosDisp = 1000 - numerosVendidos.length;

  // Acumulado SUBSTITUI o minimo (nao soma)
  // Ex: minimo 100, acumulado 160 → minimo efetivo = 160
  const premio80 = loterica ? (loterica.arrecadadoTotal || 0) * 0.8 : 0;
  const effectiveMin = loterica ? Math.max(loterica.premioMinimo, loterica.premioAcumulado || 0) : 0;
  const alcancaMinimo = loterica ? premio80 > loterica.premioMinimo : false;
  const premioEstimado = alcancaMinimo ? Math.max(premio80, effectiveMin) : effectiveMin;
  const taxaBanco = loterica ? Math.round(alcancaMinimo ? (loterica.arrecadadoTotal || 0) * 0.2 : (loterica.arrecadadoTotal || 0)) : 0;
  const temAcumulado = loterica ? (loterica.premioAcumulado || 0) > loterica.premioMinimo : false;
  const bancoFicaCom100 = loterica && (loterica.arrecadadoTotal || 0) > 0 && !alcancaMinimo;

  const filteredNumeros = searchNumero
    ? lotericaNumeros.filter((n) => n.numero.toString().includes(searchNumero) || (n.comprador && n.comprador.toLowerCase().includes(searchNumero.toLowerCase())))
    : [];

  // Historico: todas as lotericas que ja tiveram sorteio realizado ou finalizada (excluindo a ativa)
  const historico = historicoLoterica.filter(
    (l) => (l.status === "sorteio_realizado" || l.status === "finalizada") && (!loterica || l.id !== loterica.id)
  );

  const vendasExpiradas = loterica && loterica.dataFimVendas && new Date(loterica.dataFimVendas).getTime() < Date.now();

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Carregando...</div>;

  return (
    <div className="space-y-4">
      <AdSlot size="banner" id="loterica-top" isAdmin={isAdmin} className="my-3" />
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-primary flex items-center gap-2"><Dices className="w-5 h-5" /> Lotérica</h2>
        {!isAdmin && <span className="text-xs text-muted-foreground flex items-center gap-1"><Shield className="w-3 h-3" /> Modo visual</span>}
      </div>

      {/* Como Funciona */}
      <div className="rounded-lg border border-primary/20 bg-card p-4">
        <h3 className="text-sm font-bold text-primary mb-2 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Como Funciona</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li><span className="text-foreground font-semibold">1000 numeros</span> (001-1000), preco fixo por numero.</li>
          <li>Se <span className="text-yellow-400 font-semibold">80% das vendas ultrapassar o minimo</span>: <span className="text-red-400 font-semibold">20%</span> banco + <span className="text-yellow-400 font-semibold">80%</span> premio.</li>
          <li>Se <span className="text-red-400 font-semibold">80% das vendas NAO ultrapassar o minimo</span>: banco fica com <span className="text-red-400 font-bold">100%</span> das vendas.</li>
          <li>Premio = <span className="text-foreground font-semibold">maior entre 80% das vendas e o minimo efetivo</span>.</li>
          <li>Se ninguem acertar e 80% ultrapassar o minimo, o premio <span className="text-orange-400 font-semibold">acumula</span>. Senao, <span className="text-red-400 font-semibold">nao acumula</span>.</li>
          <li>So reseta quando sair um <span className="text-green-400 font-semibold">ganhador</span>!</li>
        </ul>
      </div>

      {/* Botao Criar - so admin */}
      {isAdmin && !loterica && (
        <>
          <Button onClick={() => setShowForm(!showForm)} className="bg-primary hover:bg-primary/90 text-primary-foreground"><Plus className="w-4 h-4 mr-1" /> {showForm ? "Fechar" : "Nova Lotérica"}</Button>
          {showForm && (
            <div className="rounded-md border border-border bg-card p-4">
              <h3 className="text-sm font-bold text-foreground mb-3"><Dices className="w-4 h-4 text-primary mr-1" /> Configurar Lotérica</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div><Label className="text-xs text-muted-foreground">Valor/Numero</Label><Input type="number" placeholder="100" value={valorNumero} onChange={(e) => setValorNumero(e.target.value)} className="text-sm font-mono" /></div>
                <div><Label className="text-xs text-muted-foreground">Moeda</Label><Input placeholder="Ex: Aco" value={moedaAceita} onChange={(e) => setMoedaAceita(e.target.value)} className="text-sm" /></div>
                <div><Label className="text-xs text-muted-foreground">Premio Minimo</Label><Input type="number" placeholder="800" value={premioMinimo} onChange={(e) => setPremioMinimo(e.target.value)} className="text-sm font-mono" /></div>
                <div><Label className="text-xs text-muted-foreground">Duracao Vendas (min)</Label><Input type="number" placeholder="1440" value={duracao} onChange={(e) => setDuracao(e.target.value)} className="text-sm font-mono" /></div>
              </div>
              <div className="mt-3"><Button onClick={handleCriar} className="bg-primary hover:bg-primary/90 text-primary-foreground"><Dices className="w-4 h-4 mr-1" /> Criar Lotérica</Button></div>
            </div>
          )}
        </>
      )}

      {/* Loterica Ativa */}
      {loterica && (
        <div className="rounded-lg border border-primary/20 bg-card overflow-hidden">
          <div className="bg-primary/10 px-4 py-3 border-b border-primary/20 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Dices className="w-4 h-4 text-primary" /> Lotérica Ativa</h3>
              <p className="text-xs text-muted-foreground">
                {loterica.status === "vendas_abertas" ? "Vendas abertas" : loterica.status === "sorteio_realizado" ? "Sorteio realizado" : loterica.status === "finalizada" ? "Finalizada" : "Configurando"}
              </p>
            </div>
            {loterica.dataFimVendas && loterica.status === "vendas_abertas" && <LotericaTimer dataFim={loterica.dataFimVendas} />}
          </div>
          <div className="p-4">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
              <div className="text-center p-2 rounded-md border border-border bg-muted/30">
                <p className="text-xs text-muted-foreground">Vendidos</p>
                <p className="text-lg font-bold font-mono text-foreground">{numerosVendidos.length}<span className="text-muted-foreground text-xs font-normal">/1000</span></p>
              </div>
              <div className="text-center p-2 rounded-md border border-border bg-muted/30">
                <p className="text-xs text-muted-foreground">Disponiveis</p>
                <p className="text-lg font-bold font-mono text-green-400">{numerosDisp}</p>
              </div>
              <div className="text-center p-2 rounded-md border border-border bg-muted/30">
                <p className="text-xs text-muted-foreground">Arrecadado Total</p>
                <p className="text-lg font-bold font-mono text-primary">{Math.round(loterica.arrecadadoTotal || 0)}</p>
                <p className="text-[10px] text-muted-foreground">{loterica.valorNumero} {loterica.moedaAceita}/num</p>
              </div>
              <div className="text-center p-2 rounded-md border border-yellow-500/30 bg-yellow-500/5">
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Trophy className="w-3 h-3" /> Premio</p>
                <p className="text-lg font-bold font-mono text-yellow-400">{Math.round(premioEstimado)}</p>
                {temAcumulado && <p className="text-[10px] text-orange-400 flex items-center justify-center gap-0.5"><TrendingUp className="w-2.5 h-2.5" /> Min. acumulado</p>}
              </div>
              <div className={`text-center p-2 rounded-md border ${bancoFicaCom100 ? "border-red-500/40 bg-red-500/5" : "border-border bg-muted/30"}`}>
                <p className="text-xs text-muted-foreground">Taxa Banco {alcancaMinimo ? "(20%)" : "(100%)"}</p>
                <p className={`text-lg font-bold font-mono ${bancoFicaCom100 ? "text-red-500" : "text-red-400"}`}>{taxaBanco}</p>
                {bancoFicaCom100 ? <p className="text-[10px] text-red-400 font-bold">80% nao ultrapassou o minimo!</p> : <p className="text-[10px] text-muted-foreground">Credita ao finalizar</p>}
              </div>
            </div>

            {/* Detalhes do premio */}
            <div className={`rounded-md border p-3 mb-4 ${bancoFicaCom100 ? "border-red-500/30 bg-red-500/5" : "border-border bg-muted/20"}`}>
              <p className="text-xs font-bold text-muted-foreground mb-2">Calculo do Premio</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className={`flex justify-between p-1.5 rounded bg-card border ${premio80 > loterica.premioMinimo ? "border-green-500/30" : "border-red-500/30"}`}>
                  <span className="text-muted-foreground">80% arrecadado</span>
                  <span className={`font-mono ${premio80 > loterica.premioMinimo ? "text-green-400" : "text-red-400"}`}>{Math.round(premio80)}</span>
                </div>
                <div className="flex justify-between p-1.5 rounded bg-card border border-border">
                  <span className="text-muted-foreground">Minimo original</span>
                  <span className="font-mono text-foreground">{Math.round(loterica.premioMinimo)}</span>
                </div>
                <div className={`flex justify-between p-1.5 rounded bg-card border ${temAcumulado ? "border-orange-500/30" : "border-border"}`}>
                  <span className="text-muted-foreground">Min. efetivo</span>
                  <span className={`font-mono ${temAcumulado ? "text-orange-400 font-bold" : "text-foreground"}`}>{Math.round(effectiveMin)}</span>
                </div>
              </div>
              {alcancaMinimo ? (
                <p className="text-[10px] text-green-400 mt-1.5">80% ({Math.round(premio80)}) &gt; minimo ({Math.round(loterica.premioMinimo)}) = Split 20/80 ativado.</p>
              ) : (
                <p className="text-[10px] text-red-400 mt-1.5 font-bold">80% ({Math.round(premio80)}) NAO ultrapassou o minimo ({Math.round(loterica.premioMinimo)}) = Banco fica com 100%!</p>
              )}
            </div>

            {/* Resultado do sorteio */}
            {loterica.status === "sorteio_realizado" && (
              <div className={`rounded-md border p-4 mb-4 ${loterica.ganhador ? "border-green-500/40 bg-green-500/5" : "border-orange-500/40 bg-orange-500/5"}`}>
                <div className="flex items-center gap-3">
                  {loterica.ganhador ? <PartyPopper className="w-6 h-6 text-green-400" /> : <AlertCircle className="w-6 h-6 text-orange-400" />}
                  <div>
                    <p className={`text-sm font-bold ${loterica.ganhador ? "text-green-400" : "text-orange-400"}`}>
                      {loterica.ganhador ? "Teve Ganhador!" : "Ninguem acertou - Premio acumulou!"}
                    </p>
                    <p className="text-xs text-foreground">
                      Numero: <span className="font-bold font-mono text-primary">{String(loterica.numeroSorteado).padStart(3, "0")}</span>
                      {loterica.ganhador && <> - Ganhador: <span className="font-bold text-green-400" data-no-translate translate="no">{loterica.ganhador}</span></>}
                      {!loterica.ganhador && <> - Nao foi vendido - <span className="font-bold text-orange-400">{Math.round(loterica.valorPremio || 0)} {loterica.moedaAceita} acumulados</span></>}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {alcancaMinimo
                        ? `20% das vendas (${taxaBanco} ${loterica.moedaAceita}) creditado no estoque.`
                        : `Banco ficou com 100% das vendas (${taxaBanco} ${loterica.moedaAceita}) - 80% nao ultrapassou o minimo.`
                      }
                    </p>
                  </div>
                </div>
                {/* Botao Finalizar - so admin */}
                {isAdmin && (
                  <div className="mt-3">
                    <Button size="sm" onClick={() => finalizarLoterica(loterica.id)} className="bg-green-600 hover:bg-green-700 text-white"><CheckCircle className="w-3 h-3 mr-1" /> Finalizar Lotérica</Button>
                  </div>
                )}
              </div>
            )}

            {/* Acoes admin - Vender e Sortear */}
            {isAdmin && loterica.status === "vendas_abertas" && (
              <>
                <Button size="sm" variant="outline" onClick={() => setShowComprar(!showComprar)} className="border-primary/30 text-primary hover:bg-primary/10"><Dices className="w-3 h-3 mr-1" /> Vender Numero</Button>
                {showComprar && (
                  <div className="rounded-md border border-border bg-muted/30 p-3 mb-4">
                    <h4 className="text-xs font-bold text-foreground mb-2">Vender Numero</h4>
                    <div className="flex gap-3">
                      <div className="flex-1"><Label className="text-xs text-muted-foreground">Numero (1-1000)</Label><Input type="number" placeholder="042" value={numeroInput} onChange={(e) => setNumeroInput(e.target.value)} className="text-sm font-mono" min={1} max={1000} /></div>
                      <div className="flex-1"><Label className="text-xs text-muted-foreground">Nome do Comprador</Label><Input placeholder="Player" value={compradorNome} onChange={(e) => setCompradorNome(e.target.value)} className="text-sm" /></div>
                      <div className="flex items-end"><Button size="sm" onClick={handleComprar} className="bg-primary text-primary-foreground">Vender</Button></div>
                    </div>
                  </div>
                )}
                {vendasExpiradas && numerosVendidos.length > 0 && (
                  <div className="mb-3">
                    <Button size="sm" onClick={() => iniciarSorteioLoterica(loterica.id)} className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold"><Dices className="w-3 h-3 mr-1" /> Realizar Sorteio</Button>
                    <p className="text-[10px] text-muted-foreground mt-1">As vendas encerraram. Sorteie para definir o ganhador.</p>
                  </div>
                )}
                {vendasExpiradas && numerosVendidos.length === 0 && (
                  <div className="rounded-md border border-red-500/30 bg-red-500/5 p-3 mb-3">
                    <p className="text-xs text-red-400 font-semibold flex items-center gap-1"><XCircle className="w-3 h-3" /> Nenhum numero vendido! Nao e possivel sortear.</p>
                  </div>
                )}
              </>
            )}

            {/* Busca e lista de numeros */}
            <div className="flex gap-2 mb-3"><Input placeholder="Buscar numero ou comprador..." value={searchNumero} onChange={(e) => setSearchNumero(e.target.value)} className="text-sm flex-1" /><Button variant="outline" size="sm" onClick={() => setSearchNumero("")}><Search className="w-3 h-3" /></Button></div>
            <div className="max-h-64 overflow-y-auto">
              {(filteredNumeros.length > 0 ? filteredNumeros : lotericaNumeros.slice(0, 50)).map((n) => (
                <div key={n.id} className={`flex items-center justify-between py-1.5 px-2 rounded text-xs border-b border-border/30 ${n.comprador ? "bg-green-500/5" : ""}`}>
                  <div className="flex items-center gap-2">
                    <span className={`font-mono font-bold w-10 ${n.comprador ? "text-green-400" : "text-muted-foreground"}`}>{String(n.numero).padStart(3, "0")}</span>
                    {n.comprador ? <span className="text-foreground" data-no-translate translate="no">{n.comprador}</span> : <span className="text-muted-foreground italic">Disponivel</span>}
                  </div>
                  {n.dataCompra && <span className="text-muted-foreground">{new Date(n.dataCompra).toLocaleDateString(getDateLocale())}</span>}
                </div>
              ))}
              {lotericaNumeros.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Nenhum numero.</p>}
            </div>
          </div>
        </div>
      )}

      {/* Sem loterica ativa */}
      {!loterica && historico.length === 0 && (
        <div className="rounded-md border border-border bg-card p-4 text-center text-muted-foreground text-sm">
          {isAdmin ? "Nenhuma lotérica ativa. Crie uma nova acima." : "Nenhuma lotérica ativa no momento."}
        </div>
      )}

      {/* Historico */}
      {historico.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><History className="w-4 h-4 text-yellow-400" /> Historico de Sorteios ({historico.length})</h3>
          <div className="space-y-2">
            {historico.map((l, i) => (
              <HistoricoLotericaEntry key={l.id} entry={l} index={i} />
            ))}
          </div>
        </div>
      )}
      <AdSlot size="banner" id="loterica-bottom" isAdmin={isAdmin} className="my-3" />
    </div>
  );
}
