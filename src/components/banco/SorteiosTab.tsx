"use client";
import { useState, useEffect, useRef } from "react";
import { useBank } from "@/lib/useBank";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Dices, Plus, Trash2, Clock, Trophy, Users, Timer, AlertCircle, PartyPopper } from "lucide-react";
import { Label } from "@/components/ui/label";
import type { Participante } from "@/lib/useBank";

function SorteioTimer({ dataFim }: { dataFim: string }) {
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

function SorteioCard({ sorteio }: { sorteio: { id: string; nomeItem: string; quantidade: number; dataCriacao: string; dataFim: string | null; status: string } }) {
  const { participarSorteio, sortear, removeSorteio, getParticipantes } = useBank();
  const [jogadorNome, setJogadorNome] = useState("");
  const [showPart, setShowPart] = useState(false);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const loaded = useRef(false);

  useEffect(() => {
    if (!loaded.current && sorteio.status === "ativo") {
      loaded.current = true;
      getParticipantes(sorteio.id).then(setParticipantes);
      const intv = setInterval(() => getParticipantes(sorteio.id).then(setParticipantes), 5000);
      return () => clearInterval(intv);
    }
  }, [sorteio.id, sorteio.status, getParticipantes]);

  const handlePart = async () => {
    if (!jogadorNome.trim()) { toast.error("Digite seu nome."); return; }
    try { await participarSorteio(sorteio.id, jogadorNome.trim()); toast.success("Participando!"); setJogadorNome(""); setShowPart(false); const p = await getParticipantes(sorteio.id); setParticipantes(p); } catch { /* handled */ }
  };

  return (
    <div className="rounded-lg border border-primary/20 bg-card overflow-hidden">
      <div className="bg-primary/10 px-4 py-3 border-b border-primary/20 flex items-center justify-between">
        <div><h4 className="text-sm font-bold text-foreground">{sorteio.nomeItem}</h4><p className="text-xs text-muted-foreground">Quantidade: {sorteio.quantidade}</p></div>
        {sorteio.dataFim && <SorteioTimer dataFim={sorteio.dataFim} />}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-4 mb-3 py-2 border-t border-b border-border/50">
          <div className="text-center"><p className="text-xs text-muted-foreground">Participantes</p><p className="text-sm font-bold text-foreground flex items-center gap-1"><Users className="w-3 h-3" /> {participantes.length}</p></div>
          <div className="text-center"><p className="text-xs text-muted-foreground">Criado</p><p className="text-xs font-mono text-foreground">{new Date(sorteio.dataCriacao).toLocaleDateString("pt-BR")}</p></div>
        </div>
        {participantes.length > 0 && <div className="mb-3 max-h-20 overflow-y-auto space-y-1">{participantes.map((p) => (<div key={p.id} className="flex items-center gap-2 text-xs"><Users className="w-3 h-3 text-primary" /><span className="text-foreground">{p.jogador}</span></div>))}</div>}
        <div className="mt-3">
          {showPart ? (
            <div className="flex gap-2"><Input placeholder="Seu nome" value={jogadorNome} onChange={(e) => setJogadorNome(e.target.value)} className="text-sm flex-1" onKeyDown={(e) => e.key === "Enter" && handlePart()} /><Button size="sm" onClick={handlePart} className="bg-primary text-primary-foreground">Entrar</Button><Button size="sm" variant="ghost" onClick={() => { setShowPart(false); setJogadorNome(""); }}>X</Button></div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setShowPart(true)} className="w-full border-primary/30 text-primary hover:bg-primary/10"><Dices className="w-3 h-3 mr-1" /> Participar</Button>
          )}
        </div>
        <div className="flex gap-2 mt-2">
          <Button size="sm" variant="ghost" onClick={() => sortear(sorteio.id)} className="text-xs text-yellow-400 hover:text-yellow-300">🎲 Sortear</Button>
          <Button size="sm" variant="ghost" onClick={() => removeSorteio(sorteio.id)} className="text-xs text-muted-foreground hover:text-red-400"><Trash2 className="w-3 h-3 mr-1" /> Remover</Button>
        </div>
      </div>
    </div>
  );
}

export default function SorteiosTab() {
  const { sorteios, addSorteio, isLoading } = useBank();
  const [showForm, setShowForm] = useState(false);
  const [nomeItem, setNomeItem] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [duracao, setDuracao] = useState("");

  const handleAdd = () => {
    if (!nomeItem.trim() || !quantidade || !duracao) { toast.error("Preencha todos."); return; }
    addSorteio(nomeItem.trim(), parseInt(quantidade), parseInt(duracao));
    toast.success(`Sorteio criado!`);
    setNomeItem(""); setQuantidade(""); setDuracao(""); setShowForm(false);
  };

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Carregando...</div>;
  const ativos = sorteios.filter((s) => s.status === "ativo");
  const finalizados = sorteios.filter((s) => s.status === "finalizado");

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-primary">🎲 Sorteios</h2>
      <div className="rounded-lg border border-primary/20 bg-card p-4"><h3 className="text-sm font-bold text-primary mb-2 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Como Funciona</h3><ul className="text-xs text-muted-foreground space-y-1"><li>• Admin cria sorteio com <span className="text-foreground font-semibold">item e duração</span>.</li><li>• Qualquer membro participa com seu nome.</li><li>• Timer acaba → ganhador <span className="text-yellow-400 font-semibold">sorteado</span>.</li></ul></div>
      <Button onClick={() => setShowForm(!showForm)} className="bg-primary hover:bg-primary/90 text-primary-foreground"><Plus className="w-4 h-4 mr-1" /> {showForm ? "Fechar" : "Novo Sorteio"}</Button>
      {showForm && (
        <div className="rounded-md border border-border bg-card p-4">
          <h3 className="text-sm font-bold text-foreground mb-3"><Dices className="w-4 h-4 text-primary mr-1" /> Novo Sorteio</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div><Label className="text-xs text-muted-foreground">Item</Label><Input placeholder="Ex: Katana" value={nomeItem} onChange={(e) => setNomeItem(e.target.value)} className="text-sm" /></div>
            <div><Label className="text-xs text-muted-foreground">Quantidade</Label><Input type="number" placeholder="1" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} className="text-sm font-mono" /></div>
            <div><Label className="text-xs text-muted-foreground">Duração (min)</Label><Input type="number" placeholder="60" value={duracao} onChange={(e) => setDuracao(e.target.value)} className="text-sm font-mono" /></div>
          </div>
          <div className="mt-3"><Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground"><Dices className="w-4 h-4 mr-1" /> Criar</Button></div>
        </div>
      )}
      <div><h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Ativos ({ativos.length})</h3>
        {ativos.length === 0 ? <div className="rounded-md border border-border bg-card p-4 text-center text-muted-foreground text-sm">Nenhum.</div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{ativos.map((s) => <SorteioCard key={s.id} sorteio={s} />)}</div>
        )}
      </div>
      {finalizados.length > 0 && <div><h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-400" /> Finalizados ({finalizados.length})</h3><div className="space-y-2">{finalizados.map((s) => (<div key={s.id} className="rounded-md border border-border bg-card p-3 flex items-center justify-between"><div className="flex items-center gap-3"><PartyPopper className="w-4 h-4 text-yellow-400" /><div><p className="text-sm font-bold text-foreground">{s.nomeItem} (x{s.quantidade})</p><p className="text-xs text-muted-foreground">Ganhador: <span className="text-yellow-400 font-semibold">{s.ganhador}</span></p></div></div><span className="text-xs text-muted-foreground">{new Date(s.dataCriacao).toLocaleDateString("pt-BR")}</span></div>))}</div></div>}
    </div>
  );
}
