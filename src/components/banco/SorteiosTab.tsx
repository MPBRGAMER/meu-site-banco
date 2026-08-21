"use client";
import { useState, useEffect, useRef } from "react";
import { useBank } from "@/lib/useBank";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Dices, Plus, Trash2, Clock, Trophy, Users, Timer, AlertCircle, PartyPopper, History, ChevronDown, ChevronUp, Shield } from "lucide-react";
import { Label } from "@/components/ui/label";
import type { Participante } from "@/lib/useBank";
import AdSlot from "@/components/AdSlot";
import { getDateLocale } from "./TranslationPopup";

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

interface SorteiosTabProps {
  isAdmin: boolean;
}

function SorteioCard({ sorteio, isAdmin }: { sorteio: { id: string; nomeItem: string; quantidade: number; dataCriacao: string; dataFim: string | null; status: string }; isAdmin: boolean }) {
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
          <div className="text-center"><p className="text-xs text-muted-foreground">Criado</p><p className="text-xs font-mono text-foreground">{new Date(sorteio.dataCriacao).toLocaleDateString(getDateLocale())}</p></div>
        </div>
        {participantes.length > 0 && <div className="mb-3 max-h-20 overflow-y-auto space-y-1">{participantes.map((p) => (<div key={p.id} className="flex items-center gap-2 text-xs"><Users className="w-3 h-3 text-primary" /><span className="text-foreground" data-no-translate translate="no">{p.jogador}</span></div>))}</div>}
        <div className="mt-3">
          {showPart ? (
            <div className="flex gap-2"><Input placeholder="Seu nome" value={jogadorNome} onChange={(e) => setJogadorNome(e.target.value)} className="text-sm flex-1" onKeyDown={(e) => e.key === "Enter" && handlePart()} /><Button size="sm" onClick={handlePart} className="bg-primary text-primary-foreground">Entrar</Button><Button size="sm" variant="ghost" onClick={() => { setShowPart(false); setJogadorNome(""); }}>X</Button></div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setShowPart(true)} className="w-full border-primary/30 text-primary hover:bg-primary/10"><Dices className="w-3 h-3 mr-1" /> Participar</Button>
          )}
        </div>
        {isAdmin && (
          <div className="flex gap-2 mt-2">
            <Button size="sm" variant="ghost" onClick={() => sortear(sorteio.id)} className="text-xs text-yellow-400 hover:text-yellow-300">Sortear</Button>
            <Button size="sm" variant="ghost" onClick={() => removeSorteio(sorteio.id)} className="text-xs text-muted-foreground hover:text-red-400"><Trash2 className="w-3 h-3 mr-1" /> Remover</Button>
          </div>
        )}
      </div>
    </div>
  );
}

function HistoricoEntry({ entry, index }: { entry: { id: string; nomeItem: string; quantidade: number; dataCriacao: string; dataFim: string | null; ganhador: string | null; totalParticipantes: number }; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const { getParticipantes } = useBank();
  const [participantes, setParticipantes] = useState<Participante[]>([]);

  const toggleExpand = async () => {
    if (!expanded && participantes.length === 0) {
      const p = await getParticipantes(entry.id);
      setParticipantes(p);
    }
    setExpanded(!expanded);
  };

  return (
    <div className="rounded-md border border-border bg-card overflow-hidden">
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={toggleExpand}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-yellow-500/10 border border-yellow-500/30">
            <span className="text-xs font-bold text-yellow-400">#{index + 1}</span>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{entry.nomeItem} <span className="text-muted-foreground font-normal">x{entry.quantidade}</span></p>
            <p className="text-xs text-muted-foreground">
              {new Date(entry.dataCriacao).toLocaleDateString(getDateLocale())}{entry.dataFim ? ` - ${new Date(entry.dataFim).toLocaleDateString(getDateLocale())}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-muted-foreground">Participantes</p>
            <p className="text-sm font-bold text-foreground">{entry.totalParticipantes}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Ganhador</p>
            <p className="text-sm font-bold text-yellow-400" data-no-translate translate="no">{entry.ganhador || "-"}</p>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>
      {expanded && (
        <div className="border-t border-border bg-muted/20 p-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            <div className="text-center p-2 rounded-md border border-border bg-card">
              <p className="text-xs text-muted-foreground">Item</p>
              <p className="text-sm font-bold text-foreground">{entry.nomeItem}</p>
            </div>
            <div className="text-center p-2 rounded-md border border-border bg-card">
              <p className="text-xs text-muted-foreground">Qtd</p>
              <p className="text-sm font-bold font-mono text-foreground">{entry.quantidade}</p>
            </div>
            <div className="text-center p-2 rounded-md border border-border bg-card">
              <p className="text-xs text-muted-foreground">Participantes</p>
              <p className="text-sm font-bold font-mono text-foreground">{entry.totalParticipantes}</p>
            </div>
            <div className="text-center p-2 rounded-md border border-border bg-card">
              <p className="text-xs text-muted-foreground">Data do Sorteio</p>
              <p className="text-sm font-bold text-foreground">{entry.dataFim ? new Date(entry.dataFim).toLocaleDateString(getDateLocale()) : "-"}</p>
            </div>
          </div>
          <div className="rounded-md border border-yellow-500/30 bg-yellow-500/5 p-3 mb-3">
            <p className="text-xs text-muted-foreground mb-1">Ganhador</p>
            <p className="text-base font-bold text-yellow-400 flex items-center gap-2"><Trophy className="w-4 h-4" /> {entry.ganhador ? <span data-no-translate translate="no">{entry.ganhador}</span> : "Nenhum"}</p>
          </div>
          {participantes.length > 0 && (
            <div>
              <p className="text-xs font-bold text-muted-foreground mb-2">Todos os Participantes ({participantes.length})</p>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {participantes.map((p) => (
                  <div key={p.id} className={`flex items-center gap-2 text-xs py-1 px-2 rounded ${p.jogador === entry.ganhador ? "bg-yellow-500/10 border border-yellow-500/30" : ""}`}>
                    {p.jogador === entry.ganhador && <Trophy className="w-3 h-3 text-yellow-400" />}
                    <span className={p.jogador === entry.ganhador ? "text-yellow-400 font-bold" : "text-foreground"} data-no-translate translate="no">{p.jogador}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SorteiosTab({ isAdmin }: SorteiosTabProps) {
  const { sorteios, historicoSorteios, addSorteio, isLoading } = useBank();
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

  return (
    <div className="space-y-4">
      <AdSlot size="banner" id="sorteios-top" isAdmin={isAdmin} className="my-3" />
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-primary">Sorteios</h2>
        {!isAdmin && <span className="text-xs text-muted-foreground flex items-center gap-1"><Shield className="w-3 h-3" /> Modo visual</span>}
      </div>
      <div className="rounded-lg border border-primary/20 bg-card p-4"><h3 className="text-sm font-bold text-primary mb-2 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Como Funciona</h3><ul className="text-xs text-muted-foreground space-y-1"><li>Admin cria sorteio com <span className="text-foreground font-semibold">item e duracao</span>.</li><li>Qualquer membro participa com seu nome.</li><li>Timer acaba  ganhador <span className="text-yellow-400 font-semibold">sorteado</span>.</li></ul></div>
      {isAdmin && (
        <>
          <Button onClick={() => setShowForm(!showForm)} className="bg-primary hover:bg-primary/90 text-primary-foreground"><Plus className="w-4 h-4 mr-1" /> {showForm ? "Fechar" : "Novo Sorteio"}</Button>
          {showForm && (
        <div className="rounded-md border border-border bg-card p-4">
          <h3 className="text-sm font-bold text-foreground mb-3"><Dices className="w-4 h-4 text-primary mr-1" /> Novo Sorteio</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div><Label className="text-xs text-muted-foreground">Item</Label><Input placeholder="Ex: Katana" value={nomeItem} onChange={(e) => setNomeItem(e.target.value)} className="text-sm" /></div>
            <div><Label className="text-xs text-muted-foreground">Quantidade</Label><Input type="number" placeholder="1" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} className="text-sm font-mono" /></div>
            <div><Label className="text-xs text-muted-foreground">Duracao (min)</Label><Input type="number" placeholder="60" value={duracao} onChange={(e) => setDuracao(e.target.value)} className="text-sm font-mono" /></div>
          </div>
          <div className="mt-3"><Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground"><Dices className="w-4 h-4 mr-1" /> Criar</Button></div>
        </div>
          )}
        </>
      )}
      <div><h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Ativos ({ativos.length})</h3>
        {ativos.length === 0 ? <div className="rounded-md border border-border bg-card p-4 text-center text-muted-foreground text-sm">Nenhum.</div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{ativos.map((s) => <SorteioCard key={s.id} sorteio={s} isAdmin={isAdmin} />)}</div>
        )}
      </div>
      {historicoSorteios.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><History className="w-4 h-4 text-yellow-400" /> Historico de Ganhadores ({historicoSorteios.length})</h3>
          <div className="space-y-2">
            {historicoSorteios.map((s, i) => (
              <HistoricoEntry key={s.id} entry={s} index={i} />
            ))}
          </div>
        </div>
      )}
      <AdSlot size="banner" id="sorteios-bottom" isAdmin={isAdmin} className="my-3" />
    </div>
  );
}
