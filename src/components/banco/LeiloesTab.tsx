"use client";
import { useState, useEffect, useRef } from "react";
import { useBank, type Leilao, type Lance } from "@/lib/useBank";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Gavel, Plus, Trash2, Clock, Trophy, User, Timer, AlertCircle, Pause, CheckCircle } from "lucide-react";

function LeilaoTimer({ leilao, lancesLeilao, onTimerEnd }: { leilao: Leilao; lancesLeilao: Lance[]; onTimerEnd?: () => void }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const hasEnded = useRef(false);
  useEffect(() => {
    const t = setInterval(() => {
      const ultimo = lancesLeilao.length > 0 ? new Date(lancesLeilao[0].data) : null;
      const deadline = ultimo ? new Date(ultimo.getTime() + 60000) : new Date(leilao.dataExpiracao);
      const diff = deadline.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Encerrado"); setIsUrgent(false); if (!hasEnded.current) { hasEnded.current = true; onTimerEnd?.(); } }
      else { const h = Math.floor(diff / 3600000); const m = Math.floor((diff % 3600000) / 60000); const s = Math.floor((diff % 60000) / 1000); setTimeLeft(h > 0 ? `${h}h ${m}m ${s}s` : m > 0 ? `${m}m ${s}s` : `${s}s`); setIsUrgent(diff < 60000); }
    }, 1000);
    return () => clearInterval(t);
  }, [leilao.dataExpiracao, lancesLeilao, onTimerEnd]);
  if (timeLeft === "Encerrado") return <span className="text-xs font-bold text-yellow-400 flex items-center gap-1"><Pause className="w-3 h-3" /> EM ESPERA</span>;
  return <span className={`text-xs font-bold font-mono flex items-center gap-1 ${isUrgent ? "text-red-400 animate-pulse" : "text-primary"}`}><Timer className="w-3 h-3" /> {timeLeft}</span>;
}

function LanceModal({ leilao, onClose }: { leilao: Leilao; onClose: () => void }) {
  const { darLance, getLancesByLeilao } = useBank();
  const [jogador, setJogador] = useState("");
  const [valor, setValor] = useState("");
  const ll = getLancesByLeilao(leilao.id);
  const maior = ll.length > 0 ? ll[0] : null;
  const min = maior ? maior.valor + 1 : leilao.valorInicial;
  const handleSubmit = async () => {
    if (!jogador.trim() || !valor) { toast.error("Preencha nome e valor."); return; }
    const v = parseFloat(valor);
    if (v <= min) { toast.error(`Lance deve ser > ${min}`); return; }
    try { await darLance(leilao.id, jogador.trim(), v); toast.success(`Lance de ${v} registrado!`); onClose(); } catch { /* handled */ }
  };
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"><Gavel className="w-5 h-5 text-primary" /> Dar Lance</h3>
        <p className="text-sm text-muted-foreground mb-4">Item: <span className="text-foreground font-semibold">{leilao.nomeItem}</span> | Moeda: <span className="text-primary">{leilao.moedaAceita}</span></p>
        <div className="space-y-3"><div><Label className="text-xs text-muted-foreground">Seu Nome</Label><Input placeholder="Player" value={jogador} onChange={(e) => setJogador(e.target.value)} className="text-sm" /></div><div><Label className="text-xs text-muted-foreground">Valor (mín: {min})</Label><Input type="number" placeholder={`${min}`} value={valor} onChange={(e) => setValor(e.target.value)} className="text-sm font-mono" /></div></div>
        <div className="flex gap-2 mt-4"><Button onClick={onClose} variant="outline" className="flex-1">Cancelar</Button><Button onClick={handleSubmit} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"><Gavel className="w-4 h-4 mr-1" /> Dar Lance</Button></div>
      </div>
    </div>);
}

export default function LeiloesTab() {
  const { leiloes, addLeilao, getLancesByLeilao, finalizarLeilao, removeLeilao } = useBank();
  const [showForm, setShowForm] = useState(false);
  const [lanceLeilao, setLanceLeilao] = useState<Leilao | null>(null);
  const [donoItem, setDonoItem] = useState("");
  const [nomeItem, setNomeItem] = useState("");
  const [valorInicial, setValorInicial] = useState("");
  const [moedaAceita, setMoedaAceita] = useState("");
  const [taxaCasa, setTaxaCasa] = useState("15");
  const [tipoOrigem, setTipoOrigem] = useState("comum");

  const handleAdd = () => {
    if (!donoItem.trim() || !nomeItem.trim() || !valorInicial || !moedaAceita.trim()) { toast.error("Preencha os campos."); return; }
    const exp = new Date(Date.now() + 24 * 3600000);
    addLeilao({ donoItem: donoItem.trim(), nomeItem: nomeItem.trim(), valorInicial: parseFloat(valorInicial), moedaAceita: moedaAceita.trim(), taxaCasa: parseFloat(taxaCasa), dataExpiracao: exp.toISOString(), tipoOrigem });
    toast.success(`Leilão criado!`);
    setDonoItem(""); setNomeItem(""); setValorInicial(""); setMoedaAceita(""); setShowForm(false);
  };

  const ativos = leiloes.filter((l) => l.status === "ativo" || l.status === "espera");
  const finalizados = leiloes.filter((l) => l.status === "finalizado");

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-primary">🔨 Leilões</h2>
      <div className="rounded-lg border border-primary/20 bg-card p-4"><h3 className="text-sm font-bold text-primary mb-2 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Como Funciona</h3><ul className="text-xs text-muted-foreground space-y-1"><li>• Leilão dura <span className="text-foreground font-semibold">24h</span>.</li><li>• Qualquer pessoa pode dar lance.</li><li>• Novo lance reinicia timer com <span className="text-primary font-semibold">1 minuto</span>.</li><li>• Taxa: 15% comum, 10% investidor, 100% banco.</li></ul></div>
      <Button onClick={() => setShowForm(!showForm)} className="bg-primary hover:bg-primary/90 text-primary-foreground"><Plus className="w-4 h-4 mr-1" /> {showForm ? "Fechar" : "Novo Leilão"}</Button>
      {showForm && (
        <div className="rounded-md border border-border bg-card p-4">
          <h3 className="text-sm font-bold text-foreground mb-3"><Plus className="w-4 h-4 text-primary mr-1" /> Novo Leilão</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div><Label className="text-xs text-muted-foreground">Dono</Label><Input placeholder="Nome" value={donoItem} onChange={(e) => setDonoItem(e.target.value)} className="text-sm" /></div>
            <div><Label className="text-xs text-muted-foreground">Item</Label><Input placeholder="Ex: Katana" value={nomeItem} onChange={(e) => setNomeItem(e.target.value)} className="text-sm" /></div>
            <div><Label className="text-xs text-muted-foreground">Valor Inicial</Label><Input type="number" placeholder="1000" value={valorInicial} onChange={(e) => setValorInicial(e.target.value)} className="text-sm font-mono" /></div>
            <div><Label className="text-xs text-muted-foreground">Moeda</Label><Input placeholder="Ex: Moeda" value={moedaAceita} onChange={(e) => setMoedaAceita(e.target.value)} className="text-sm" /></div>
            <div><Label className="text-xs text-muted-foreground">Origem</Label><select value={tipoOrigem} onChange={(e) => { setTipoOrigem(e.target.value); if (e.target.value === "comum") setTaxaCasa("15"); else if (e.target.value === "investidor") setTaxaCasa("10"); else setTaxaCasa("100"); }} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"><option value="comum">Comum (15%)</option><option value="investidor">Investidor (10%)</option><option value="banco">Banco (100%)</option></select></div>
          </div>
          <div className="mt-3"><Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground"><Gavel className="w-4 h-4 mr-1" /> Criar</Button></div>
        </div>
      )}
      <div><h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Ativos ({ativos.length})</h3>
        {ativos.length === 0 ? <div className="rounded-md border border-border bg-card p-4 text-center text-muted-foreground text-sm">Nenhum leilão ativo.</div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{ativos.map((leilao) => {
            const ll = getLancesByLeilao(leilao.id);
            const maior = ll.length > 0 ? ll[0] : null;
            return (
              <div key={leilao.id} className={`rounded-lg border overflow-hidden ${leilao.status === "espera" ? "border-yellow-500/30 bg-yellow-500/5" : "border-primary/20 bg-card"}`}>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2"><div><h4 className="text-sm font-bold text-foreground">{leilao.nomeItem}</h4><p className="text-xs text-muted-foreground">Dono: {leilao.donoItem}</p>{leilao.status === "espera" && <p className="text-xs text-yellow-400 font-semibold mt-1"><Pause className="w-3 h-3 inline" /> Aguardando finalização</p>}</div><LeilaoTimer leilao={leilao} lancesLeilao={ll} onTimerEnd={() => { if (leilao.status === "ativo") { removeLeilao(leilao.id); toast.info(`Leilão encerrado.`); } }} /></div>
                  <div className="flex items-center gap-4 mb-3 py-2 border-t border-b border-border/50">
                    <div className="text-center"><p className="text-xs text-muted-foreground">Inicial</p><p className="text-sm font-bold text-foreground">{leilao.valorInicial}</p></div>
                    <div className="text-center"><p className="text-xs text-muted-foreground">Maior</p><p className="text-sm font-bold text-primary">{maior ? maior.valor : leilao.valorInicial}</p></div>
                    <div className="text-center"><p className="text-xs text-muted-foreground">Lances</p><p className="text-sm font-bold text-foreground">{ll.length}</p></div>
                    <div className="text-center"><p className="text-xs text-muted-foreground">Moeda</p><p className="text-xs font-semibold text-primary">{leilao.moedaAceita}</p></div>
                  </div>
                  {ll.length > 0 && <div className="mb-3 max-h-24 overflow-y-auto space-y-1">{ll.slice(0, 5).map((lance) => (<div key={lance.id} className="flex items-center justify-between text-xs"><span className="text-muted-foreground flex items-center gap-1"><User className="w-3 h-3" /> {lance.jogador}</span><span className="font-mono text-foreground">{lance.valor}</span></div>))}</div>}
                  <div className="flex gap-2">
                    {leilao.status === "ativo" && <Button onClick={() => setLanceLeilao(leilao)} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-xs"><Gavel className="w-3 h-3 mr-1" /> Dar Lance</Button>}
                    {leilao.status === "espera" && <Button onClick={() => finalizarLeilao(leilao)} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs"><CheckCircle className="w-3 h-3 mr-1" /> Finalizar</Button>}
                    <Button onClick={() => { if (confirm(`Remover?`)) removeLeilao(leilao.id); }} variant="destructive" className="text-xs"><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </div>
              </div>
            );
          })}</div>
        )}
      </div>
      {finalizados.length > 0 && <div><h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-400" /> Finalizados ({finalizados.length})</h3><div className="space-y-2">{finalizados.map((l) => (<div key={l.id} className="rounded-md border border-yellow-500/20 bg-yellow-500/5 p-3 flex items-center justify-between"><div className="flex items-center gap-3"><Trophy className="w-5 h-5 text-yellow-400" /><div><p className="text-sm font-bold text-foreground">{l.nomeItem}</p><p className="text-xs text-muted-foreground">Vencedor: <span className="text-yellow-400">{l.vencedor || "Ninguém"}</span> | {l.valorVencedor || 0} {l.moedaAceita}</p></div></div></div>))}</div></div>}
      {lanceLeilao && <LanceModal leilao={lanceLeilao} onClose={() => setLanceLeilao(null)} />}
    </div>
  );
}
