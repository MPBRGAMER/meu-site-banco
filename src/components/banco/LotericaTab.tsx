"use client";
import { useState, useEffect } from "react";
import { useBank } from "@/lib/useBank";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Dices, Plus, Clock, Trophy, Timer, AlertCircle, PartyPopper, Search } from "lucide-react";
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

export default function LotericaTab() {
  const { loterica, lotericaNumeros, criarLoterica, comprarNumero, iniciarSorteioLoterica, isLoading } = useBank();
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
    if (loterica && (loterica.status === "vendas_abertas" || loterica.status === "configurando")) { toast.error("Já existe lotérica ativa."); return; }
    criarLoterica(parseFloat(valorNumero), moedaAceita.trim(), parseInt(premioMinimo) || 0, parseInt(duracao) || 60);
    toast.success("Lotérica criada!");
    setValorNumero(""); setMoedaAceita(""); setPremioMinimo(""); setDuracao(""); setShowForm(false);
  };

  const handleComprar = async () => {
    if (!numeroInput.trim() || !compradorNome.trim()) { toast.error("Número e nome obrigatórios."); return; }
    const num = parseInt(numeroInput.trim());
    if (num < 1 || num > 1000) { toast.error("Número entre 1 e 1000."); return; }
    if (!loterica) { toast.error("Sem lotérica ativa."); return; }
    try { await comprarNumero(loterica.id, num, compradorNome.trim()); setNumeroInput(""); setCompradorNome(""); setShowComprar(false); } catch { /* handled */ }
  };

  const numerosVendidos = lotericaNumeros.filter((n) => n.comprador);
  const numerosDisp = 1000 - numerosVendidos.length;
  const taxaBanco = loterica ? Math.round((loterica.arrecadadoTotal || 0) * 0.2) : 0;
  const premioEstimado = loterica ? (loterica.arrecadadoTotal || 0) - taxaBanco : 0;

  const filteredNumeros = searchNumero
    ? lotericaNumeros.filter((n) => n.numero.toString().includes(searchNumero) || (n.comprador && n.comprador.toLowerCase().includes(searchNumero.toLowerCase())))
    : [];

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Carregando...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-primary">🎰 Lotérica</h2>
      <div className="rounded-lg border border-primary/20 bg-card p-4"><h3 className="text-sm font-bold text-primary mb-2 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Como Funciona</h3><ul className="text-xs text-muted-foreground space-y-1"><li>• <span className="text-foreground font-semibold">1000 números</span> (001-1000).</li><li>• Preço fixo por número. <span className="text-yellow-400 font-semibold">Quanto mais vender, maior o prêmio!</span></li><li>• Se o sorteado não foi vendido, o prêmio <span className="text-yellow-400 font-semibold">acumula</span>.</li></ul></div>
      {!loterica && <Button onClick={() => setShowForm(!showForm)} className="bg-primary hover:bg-primary/90 text-primary-foreground"><Plus className="w-4 h-4 mr-1" /> {showForm ? "Fechar" : "Nova Lotérica"}</Button>}
      {showForm && !loterica && (
        <div className="rounded-md border border-border bg-card p-4">
          <h3 className="text-sm font-bold text-foreground mb-3"><Dices className="w-4 h-4 text-primary mr-1" /> Configurar</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div><Label className="text-xs text-muted-foreground">Valor/Número</Label><Input type="number" placeholder="10" value={valorNumero} onChange={(e) => setValorNumero(e.target.value)} className="text-sm font-mono" /></div>
            <div><Label className="text-xs text-muted-foreground">Moeda</Label><Input placeholder="Ex: Moeda" value={moedaAceita} onChange={(e) => setMoedaAceita(e.target.value)} className="text-sm" /></div>
            <div><Label className="text-xs text-muted-foreground">Prêmio Mín.</Label><Input type="number" placeholder="500" value={premioMinimo} onChange={(e) => setPremioMinimo(e.target.value)} className="text-sm font-mono" /></div>
            <div><Label className="text-xs text-muted-foreground">Duração (min)</Label><Input type="number" placeholder="1440" value={duracao} onChange={(e) => setDuracao(e.target.value)} className="text-sm font-mono" /></div>
          </div>
          <div className="mt-3"><Button onClick={handleCriar} className="bg-primary hover:bg-primary/90 text-primary-foreground"><Dices className="w-4 h-4 mr-1" /> Criar</Button></div>
        </div>
      )}
      {loterica && (
        <div className="rounded-lg border border-primary/20 bg-card overflow-hidden">
          <div className="bg-primary/10 px-4 py-3 border-b border-primary/20 flex items-center justify-between">
            <div><h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Dices className="w-4 h-4 text-primary" /> Lotérica Ativa</h3><p className="text-xs text-muted-foreground">{loterica.status === "vendas_abertas" ? "Vendas abertas" : loterica.status === "sorteio_realizado" ? "Sorteio realizado" : "Configurando"}</p></div>
            {loterica.dataFimVendas && <LotericaTimer dataFim={loterica.dataFimVendas} />}
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="text-center p-2 rounded-md border border-border bg-muted/30"><p className="text-xs text-muted-foreground">Vendidos</p><p className="text-lg font-bold font-mono text-foreground">{numerosVendidos.length}</p></div>
              <div className="text-center p-2 rounded-md border border-border bg-muted/30"><p className="text-xs text-muted-foreground">Disponíveis</p><p className="text-lg font-bold font-mono text-green-400">{numerosDisp}</p></div>
              <div className="text-center p-2 rounded-md border border-border bg-muted/30"><p className="text-xs text-muted-foreground">Arrecadado</p><p className="text-lg font-bold font-mono text-primary">{loterica.arrecadadoTotal || 0}</p></div>
              <div className="text-center p-2 rounded-md border border-border bg-muted/30"><p className="text-xs text-muted-foreground">Prêmio</p><p className="text-lg font-bold font-mono text-yellow-400">{premioEstimado.toFixed(0)}</p></div>
            </div>
            <div className="text-xs text-muted-foreground mb-3 flex items-center gap-4">
              <span>Preço: <strong className="text-foreground">{loterica.valorNumero} {loterica.moedaAceita}</strong></span>
              <span>Taxa: <strong className="text-red-400">20%</strong></span>
            </div>
            {loterica.status === "sorteio_realizado" && (
              <div className="rounded-md border border-yellow-500/40 bg-yellow-500/5 p-4 mb-4">
                <div className="flex items-center gap-3"><PartyPopper className="w-6 h-6 text-yellow-400" /><div><p className="text-sm font-bold text-yellow-400">Sorteio Realizado!</p><p className="text-xs text-foreground">Número: <span className="font-bold font-mono text-yellow-400">{String(loterica.numeroSorteado).padStart(3, "0")}</span></p>{loterica.ganhador ? <p className="text-xs text-foreground">Ganhador: <span className="font-bold text-yellow-400">{loterica.ganhador}</span></p> : <p className="text-xs text-red-400 font-semibold">Não vendido! Prêmio acumulou.</p>}</div></div>
              </div>
            )}
            {loterica.status === "vendas_abertas" && (
              <>
                <Button size="sm" variant="outline" onClick={() => setShowComprar(!showComprar)} className="border-primary/30 text-primary hover:bg-primary/10"><Dices className="w-3 h-3 mr-1" /> Comprar Número</Button>
                {showComprar && (
                  <div className="rounded-md border border-border bg-muted/30 p-3 mb-4">
                    <h4 className="text-xs font-bold text-foreground mb-2">Comprar Número</h4>
                    <div className="flex gap-3"><div className="flex-1"><Label className="text-xs text-muted-foreground">Número (1-1000)</Label><Input type="number" placeholder="042" value={numeroInput} onChange={(e) => setNumeroInput(e.target.value)} className="text-sm font-mono" min={1} max={1000} /></div><div className="flex-1"><Label className="text-xs text-muted-foreground">Seu Nome</Label><Input placeholder="Player" value={compradorNome} onChange={(e) => setCompradorNome(e.target.value)} className="text-sm" /></div><div className="flex items-end"><Button size="sm" onClick={handleComprar} className="bg-primary text-primary-foreground">Comprar</Button></div></div>
                  </div>
                )}
                {loterica.status === "vendas_abertas" && loterica.dataFimVendas && new Date(loterica.dataFimVendas).getTime() < Date.now() && (
                  <div className="mb-3"><Button size="sm" onClick={() => iniciarSorteioLoterica(loterica.id)} className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold">🎰 Realizar Sorteio</Button></div>
                )}
              </>
            )}
            <div className="flex gap-2 mb-3"><Input placeholder="Buscar número ou comprador..." value={searchNumero} onChange={(e) => setSearchNumero(e.target.value)} className="text-sm flex-1" /><Button variant="outline" size="sm" onClick={() => setSearchNumero("")}><Search className="w-3 h-3" /></Button></div>
            <div className="max-h-64 overflow-y-auto">
              {(filteredNumeros.length > 0 ? filteredNumeros : lotericaNumeros.slice(0, 50)).map((n) => (
                <div key={n.id} className={`flex items-center justify-between py-1.5 px-2 rounded text-xs border-b border-border/30 ${n.comprador ? "bg-green-500/5" : ""}`}>
                  <div className="flex items-center gap-2"><span className={`font-mono font-bold w-10 ${n.comprador ? "text-green-400" : "text-muted-foreground"}`}>{String(n.numero).padStart(3, "0")}</span>{n.comprador ? <span className="text-foreground">{n.comprador}</span> : <span className="text-muted-foreground italic">Disponível</span>}</div>
                  {n.dataCompra && <span className="text-muted-foreground">{new Date(n.dataCompra).toLocaleDateString("pt-BR")}</span>}
                </div>
              ))}
              {lotericaNumeros.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Nenhum número.</p>}
            </div>
          </div>
        </div>
      )}
      {!loterica && <div className="rounded-md border border-border bg-card p-4 text-center text-muted-foreground text-sm">Nenhuma lotérica ativa.</div>}
    </div>
  );
}
