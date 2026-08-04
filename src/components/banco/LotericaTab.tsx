"use client";
import { useState, useEffect } from "react";
import { useBank } from "@/lib/useBank";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Dices, Plus, Clock, Trophy, Timer, AlertCircle, PartyPopper, Search, History, ChevronDown, ChevronUp, Users, Coins, Ticket } from "lucide-react";
import { Label } from "@/components/ui/label";

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
    premioMinimo: number; duracaoMinutos: number; dataCriacao: string;
    dataFimVendas: string | null; dataSorteio: string | null;
    numeroSorteado: number | null; ganhador: string | null;
    valorPremio: number; arrecadadoTotal: number; totalVendidos: number;
  };
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);

  const taxaBanco = Math.round(entry.arrecadadoTotal * 0.2);
  const premio = entry.arrecadadoTotal - taxaBanco;
  const acerto = entry.ganhador ? true : false;

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
            <p className="text-xs text-muted-foreground">{new Date(entry.dataCriacao).toLocaleDateString("pt-BR")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-muted-foreground">Vendidos</p>
            <p className="text-sm font-bold font-mono text-foreground">{entry.totalVendidos}/1000</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Ganhador</p>
            <p className={`text-sm font-bold ${acerto ? "text-green-400" : "text-red-400"}`}>{entry.ganhador || "Acumulou"}</p>
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
              <p className="text-sm font-bold font-mono text-primary">{entry.arrecadadoTotal}</p>
              <p className="text-[10px] text-muted-foreground">{entry.valorNumero} {entry.moedaAceita}/num</p>
            </div>
            <div className="text-center p-2 rounded-md border border-border bg-card">
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Trophy className="w-3 h-3" /> Premio</p>
              <p className="text-sm font-bold font-mono text-yellow-400">{premio.toFixed(0)}</p>
            </div>
            <div className="text-center p-2 rounded-md border border-border bg-card">
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Clock className="w-3 h-3" /> Data Sorteio</p>
              <p className="text-sm font-bold text-foreground">{entry.dataSorteio ? new Date(entry.dataSorteio).toLocaleDateString("pt-BR") : "-"}</p>
            </div>
          </div>
          <div className={`rounded-md border p-3 ${acerto ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"}`}>
            <div className="flex items-center gap-3">
              {acerto ? <PartyPopper className="w-6 h-6 text-green-400" /> : <AlertCircle className="w-6 h-6 text-red-400" />}
              <div>
                <p className={`text-sm font-bold ${acerto ? "text-green-400" : "text-red-400"}`}>
                  {acerto ? "Teve Ganhador!" : "Ninguem acertou - Premio acumulou"}
                </p>
                {acerto ? (
                  <p className="text-xs text-foreground">
                    Numero <span className="font-bold font-mono text-green-400">{String(entry.numeroSorteado).padStart(3, "0")}</span> - Ganhador: <span className="font-bold text-green-400">{entry.ganhador}</span>
                  </p>
                ) : (
                  <p className="text-xs text-foreground">
                    Numero sorteado: <span className="font-bold font-mono text-red-400">{String(entry.numeroSorteado).padStart(3, "0")}</span> - Nao foi vendido
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LotericaTab() {
  const { loterica, lotericaNumeros, historicoLoterica, criarLoterica, comprarNumero, iniciarSorteioLoterica, isLoading } = useBank();
  const [showForm, setShowForm] = useState(false);
  const [valorNumero, setValorNumero] = useState("");
  const [moedaAceita, setMoedaAceita] = useState("");
  const [premioMinimo, setPremioMinimo] = useState("");
  const [duracao, setDuracao] = useState("");
  const [numeroInput, setNumeroInput] = useState("");
  const [compradorNome, setCompradorNome] = useState("");
  const [showComprar, setShowComprar] = useState(false);
  const [searchNumero, setSearchNumero] = useState("");

  const handleCriar = () => {
    if (!valorNumero || !moedaAceita.trim()) { toast.error("Preencha valor e moeda."); return; }
    if (loterica && (loterica.status === "vendas_abertas" || loterica.status === "configurando")) { toast.error("Ja existe loterica ativa."); return; }
    criarLoterica(parseFloat(valorNumero), moedaAceita.trim(), parseInt(premioMinimo) || 0, parseInt(duracao) || 60);
    toast.success("Loterica criada!");
    setValorNumero(""); setMoedaAceita(""); setPremioMinimo(""); setDuracao(""); setShowForm(false);
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
  const taxaBanco = loterica ? Math.round((loterica.arrecadadoTotal || 0) * 0.2) : 0;
  const premioEstimado = loterica ? (loterica.arrecadadoTotal || 0) - taxaBanco : 0;

  const filteredNumeros = searchNumero
    ? lotericaNumeros.filter((n) => n.numero.toString().includes(searchNumero) || (n.comprador && n.comprador.toLowerCase().includes(searchNumero.toLowerCase())))
    : [];

  // Historico: todas as lotericas que ja tiveram sorteio realizado (excluindo a ativa)
  const historico = historicoLoterica.filter(
    (l) => l.status === "sorteio_realizado" && (!loterica || l.id !== loterica.id)
  );

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Carregando...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-primary">Loterica</h2>
      <div className="rounded-lg border border-primary/20 bg-card p-4"><h3 className="text-sm font-bold text-primary mb-2 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Como Funciona</h3><ul className="text-xs text-muted-foreground space-y-1"><li><span className="text-foreground font-semibold">1000 numeros</span> (001-1000).</li><li>Preco fixo por numero. <span className="text-yellow-400 font-semibold">Quanto mais vender, maior o premio!</span></li><li>Se o sorteado nao foi vendido, o premio <span className="text-yellow-400 font-semibold">acumula</span>.</li></ul></div>
      {!loterica && <Button onClick={() => setShowForm(!showForm)} className="bg-primary hover:bg-primary/90 text-primary-foreground"><Plus className="w-4 h-4 mr-1" /> {showForm ? "Fechar" : "Nova Loterica"}</Button>}
      {showForm && !loterica && (
        <div className="rounded-md border border-border bg-card p-4">
          <h3 className="text-sm font-bold text-foreground mb-3"><Dices className="w-4 h-4 text-primary mr-1" /> Configurar</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div><Label className="text-xs text-muted-foreground">Valor/Numero</Label><Input type="number" placeholder="10" value={valorNumero} onChange={(e) => setValorNumero(e.target.value)} className="text-sm font-mono" /></div>
            <div><Label className="text-xs text-muted-foreground">Moeda</Label><Input placeholder="Ex: Moeda" value={moedaAceita} onChange={(e) => setMoedaAceita(e.target.value)} className="text-sm" /></div>
            <div><Label className="text-xs text-muted-foreground">Premio Min.</Label><Input type="number" placeholder="500" value={premioMinimo} onChange={(e) => setPremioMinimo(e.target.value)} className="text-sm font-mono" /></div>
            <div><Label className="text-xs text-muted-foreground">Duracao (min)</Label><Input type="number" placeholder="1440" value={duracao} onChange={(e) => setDuracao(e.target.value)} className="text-sm font-mono" /></div>
          </div>
          <div className="mt-3"><Button onClick={handleCriar} className="bg-primary hover:bg-primary/90 text-primary-foreground"><Dices className="w-4 h-4 mr-1" /> Criar</Button></div>
        </div>
      )}
      {loterica && (
        <div className="rounded-lg border border-primary/20 bg-card overflow-hidden">
          <div className="bg-primary/10 px-4 py-3 border-b border-primary/20 flex items-center justify-between">
            <div><h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Dices className="w-4 h-4 text-primary" /> Loterica Ativa</h3><p className="text-xs text-muted-foreground">{loterica.status === "vendas_abertas" ? "Vendas abertas" : loterica.status === "sorteio_realizado" ? "Sorteio realizado" : "Configurando"}</p></div>
            {loterica.dataFimVendas && <LotericaTimer dataFim={loterica.dataFimVendas} />}
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="text-center p-2 rounded-md border border-border bg-muted/30"><p className="text-xs text-muted-foreground">Vendidos</p><p className="text-lg font-bold font-mono text-foreground">{numerosVendidos.length}</p></div>
              <div className="text-center p-2 rounded-md border border-border bg-muted/30"><p className="text-xs text-muted-foreground">Disponiveis</p><p className="text-lg font-bold font-mono text-green-400">{numerosDisp}</p></div>
              <div className="text-center p-2 rounded-md border border-border bg-muted/30"><p className="text-xs text-muted-foreground">Arrecadado</p><p className="text-lg font-bold font-mono text-primary">{loterica.arrecadadoTotal || 0}</p></div>
              <div className="text-center p-2 rounded-md border border-border bg-muted/30"><p className="text-xs text-muted-foreground">Premio</p><p className="text-lg font-bold font-mono text-yellow-400">{premioEstimado.toFixed(0)}</p></div>
            </div>
            <div className="text-xs text-muted-foreground mb-3 flex items-center gap-4">
              <span>Preco: <strong className="text-foreground">{loterica.valorNumero} {loterica.moedaAceita}</strong></span>
              <span>Taxa: <strong className="text-red-400">20%</strong></span>
            </div>
            {loterica.status === "sorteio_realizado" && (
              <div className="rounded-md border border-yellow-500/40 bg-yellow-500/5 p-4 mb-4">
                <div className="flex items-center gap-3"><PartyPopper className="w-6 h-6 text-yellow-400" /><div><p className="text-sm font-bold text-yellow-400">Sorteio Realizado!</p><p className="text-xs text-foreground">Numero: <span className="font-bold font-mono text-yellow-400">{String(loterica.numeroSorteado).padStart(3, "0")}</span></p>{loterica.ganhador ? <p className="text-xs text-foreground">Ganhador: <span className="font-bold text-yellow-400">{loterica.ganhador}</span></p> : <p className="text-xs text-red-400 font-semibold">Nao vendido! Premio acumulou.</p>}</div></div>
              </div>
            )}
            {loterica.status === "vendas_abertas" && (
              <>
                <Button size="sm" variant="outline" onClick={() => setShowComprar(!showComprar)} className="border-primary/30 text-primary hover:bg-primary/10"><Dices className="w-3 h-3 mr-1" /> Comprar Numero</Button>
                {showComprar && (
                  <div className="rounded-md border border-border bg-muted/30 p-3 mb-4">
                    <h4 className="text-xs font-bold text-foreground mb-2">Comprar Numero</h4>
                    <div className="flex gap-3"><div className="flex-1"><Label className="text-xs text-muted-foreground">Numero (1-1000)</Label><Input type="number" placeholder="042" value={numeroInput} onChange={(e) => setNumeroInput(e.target.value)} className="text-sm font-mono" min={1} max={1000} /></div><div className="flex-1"><Label className="text-xs text-muted-foreground">Seu Nome</Label><Input placeholder="Player" value={compradorNome} onChange={(e) => setCompradorNome(e.target.value)} className="text-sm" /></div><div className="flex items-end"><Button size="sm" onClick={handleComprar} className="bg-primary text-primary-foreground">Comprar</Button></div></div>
                  </div>
                )}
                {loterica.status === "vendas_abertas" && loterica.dataFimVendas && new Date(loterica.dataFimVendas).getTime() < Date.now() && (
                  <div className="mb-3"><Button size="sm" onClick={() => iniciarSorteioLoterica(loterica.id)} className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold">Realizar Sorteio</Button></div>
                )}
              </>
            )}
            <div className="flex gap-2 mb-3"><Input placeholder="Buscar numero ou comprador..." value={searchNumero} onChange={(e) => setSearchNumero(e.target.value)} className="text-sm flex-1" /><Button variant="outline" size="sm" onClick={() => setSearchNumero("")}><Search className="w-3 h-3" /></Button></div>
            <div className="max-h-64 overflow-y-auto">
              {(filteredNumeros.length > 0 ? filteredNumeros : lotericaNumeros.slice(0, 50)).map((n) => (
                <div key={n.id} className={`flex items-center justify-between py-1.5 px-2 rounded text-xs border-b border-border/30 ${n.comprador ? "bg-green-500/5" : ""}`}>
                  <div className="flex items-center gap-2"><span className={`font-mono font-bold w-10 ${n.comprador ? "text-green-400" : "text-muted-foreground"}`}>{String(n.numero).padStart(3, "0")}</span>{n.comprador ? <span className="text-foreground">{n.comprador}</span> : <span className="text-muted-foreground italic">Disponivel</span>}</div>
                  {n.dataCompra && <span className="text-muted-foreground">{new Date(n.dataCompra).toLocaleDateString("pt-BR")}</span>}
                </div>
              ))}
              {lotericaNumeros.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Nenhum numero.</p>}
            </div>
          </div>
        </div>
      )}
      {!loterica && historico.length === 0 && <div className="rounded-md border border-border bg-card p-4 text-center text-muted-foreground text-sm">Nenhuma loterica ativa.</div>}
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
    </div>
  );
}
