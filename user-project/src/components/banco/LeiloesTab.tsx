"use client";
import { useState, useEffect, useRef } from "react";
import { useBank, type Leilao, type Lance } from "@/lib/useBank";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Gavel, Plus, Trash2, Clock, Trophy, User, Timer, AlertCircle, Pause, CheckCircle, Shield, ImageIcon, Package } from "lucide-react";
import AdSlot from "@/components/AdSlot";
import { getDateLocale } from "./TranslationPopup";

interface PtItemMap { pt: string; file: string }

const DURACOES = [
  { label: "1 minuto (teste)", ms: 60000 },
  { label: "1 hora", ms: 3600000 },
  { label: "6 horas", ms: 6 * 3600000 },
  { label: "12 horas", ms: 12 * 3600000 },
  { label: "24 horas", ms: 24 * 3600000 },
  { label: "48 horas", ms: 48 * 3600000 },
];

const TIPOS_ORIGEM = [
  { value: "especial", label: "Especial (0%)" },
  { value: "top10", label: "Top 10 (5%)" },
  { value: "investidor", label: "Investidor (10%)" },
  { value: "comum", label: "Comum (15%)" },
  { value: "nao_contribuinte", label: "Não Contribuinte (20%)" },
  { value: "banco", label: "Banco (100%)" },
];

function getTaxaFromTipo(tipo: string): number {
  if (tipo === "especial") return 0;
  if (tipo === "top10") return 5;
  if (tipo === "investidor") return 10;
  if (tipo === "comum") return 15;
  if (tipo === "nao_contribuinte") return 20;
  return 100; // banco
}

function LeilaoImg({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [error, setError] = useState(false);
  if (error) return <img src="/items/blank.png" alt={alt} className={className} style={{ imageRendering: "pixelated" }} />;
  return <img src={src} alt={alt} className={className} style={{ imageRendering: "pixelated" }} onError={() => setError(true)} />;
}

function LeilaoTimer({ leilao }: { leilao: Leilao }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [phase, setPhase] = useState<"contando" | "espera" | "encerrado">("contando");

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const exp = new Date(leilao.dataExpiracao).getTime();
      const diff = exp - now;

      if (leilao.status === "finalizado") {
        setPhase("encerrado");
        setTimeLeft("");
        return;
      }

      if (leilao.status === "espera") {
        if (diff <= 0) {
          setPhase("espera");
          setTimeLeft("");
        } else {
          setPhase("contando");
          const m = Math.floor(diff / 60000);
          const s = Math.floor((diff % 60000) / 1000);
          setTimeLeft(`${m}m ${s}s`);
          setIsUrgent(diff < 30000);
        }
        return;
      }

      // ativo
      if (diff <= 0) {
        setPhase("espera");
        setTimeLeft("");
        setIsUrgent(false);
      } else {
        setPhase("contando");
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(h > 0 ? `${h}h ${m}m ${s}s` : m > 0 ? `${m}m ${s}s` : `${s}s`);
        setIsUrgent(diff < 300000); // urgente nos últimos 5min
      }
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [leilao.dataExpiracao, leilao.status]);

  if (phase === "encerrado") return null;
  if (phase === "espera") {
    return (
      <span className="text-xs font-bold text-yellow-400 flex items-center gap-1">
        <Pause className="w-3 h-3" /> EM ESPERA
      </span>
    );
  }
  return (
    <span className={`text-xs font-bold font-mono flex items-center gap-1 ${isUrgent ? "text-red-400 animate-pulse" : "text-primary"}`}>
      <Timer className="w-3 h-3" /> {timeLeft}
    </span>
  );
}

function LanceModal({ leilao, onClose }: { leilao: Leilao; onClose: () => void }) {
  const { darLance, getLancesByLeilao } = useBank();
  const [jogador, setJogador] = useState("");
  const [valor, setValor] = useState("");
  const ll = getLancesByLeilao(leilao.id);
  const maior = ll.length > 0 ? ll[0] : null;
  const min = maior ? maior.valor + 1 : leilao.valorInicial;

  const canBid = leilao.status === "ativo" || (leilao.status === "espera" && new Date() < new Date(leilao.dataExpiracao));

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
        <p className="text-sm text-muted-foreground mb-4">Item: <span className="text-foreground font-semibold">{leilao.nomeItem}</span>{leilao.quantidade > 1 && <span className="text-blue-400 font-semibold"> x{leilao.quantidade}</span>} | Moeda: <span className="text-primary">{leilao.moedaAceita}</span></p>
        <div className="space-y-3">
          <div><Label className="text-xs text-muted-foreground">Seu Nome</Label><Input placeholder="Player" value={jogador} onChange={(e) => setJogador(e.target.value)} className="text-sm" /></div>
          <div><Label className="text-xs text-muted-foreground">Valor (mín: {min})</Label><Input type="number" placeholder={`${min}`} value={valor} onChange={(e) => setValor(e.target.value)} className="text-sm font-mono" /></div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button onClick={onClose} variant="outline" className="flex-1">Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!canBid} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"><Gavel className="w-4 h-4 mr-1" /> Dar Lance</Button>
        </div>
        {!canBid && <p className="text-xs text-yellow-400 mt-2 text-center">O tempo de disputa acabou.</p>}
      </div>
    </div>);
}

interface LeiloesTabProps {
  isAdmin: boolean;
}

/* Seletor visual de itens com busca e imagens */
function ItemPicker({
  ptItems,
  onSelect,
}: {
  ptItems: PtItemMap[];
  onSelect: (item: PtItemMap) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = search.trim()
    ? ptItems.filter((p) => p.pt.toLowerCase().includes(search.trim().toLowerCase()))
    : ptItems;

  // Fechar ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Focar no input ao abrir
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const handleSelect = (item: PtItemMap) => {
    onSelect(item);
    setOpen(false);
    setSearch("");
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm text-left hover:border-primary/50 transition-colors"
      >
        <ImageIcon className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="text-muted-foreground truncate">Clique para escolher o item...</span>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-72 max-h-80 flex flex-col rounded-md border border-primary/30 bg-card shadow-lg overflow-hidden">
          <div className="p-2 border-b border-border">
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <div ref={listRef} className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">Nenhum item encontrado.</div>
            ) : (
              filtered.map((item) => (
                <button
                  key={item.file}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left hover:bg-primary/10 transition-colors"
                >
                  <img
                    src={`/items/${item.file}.png`}
                    alt={item.pt}
                    className="w-6 h-6 rounded object-contain shrink-0"
                    style={{ imageRendering: "pixelated" }}
                    loading="lazy"
                  />
                  <span className="truncate text-foreground">{item.pt}</span>
                </button>
              ))
            )}
          </div>
          <div className="p-1.5 border-t border-border text-[10px] text-muted-foreground text-center">
            {filtered.length} item{filtered.length !== 1 ? "s" : ""}{search.trim() ? ` encontrado${filtered.length !== 1 ? "s" : ""}` : " no total"}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LeiloesTab({ isAdmin }: LeiloesTabProps) {
  const { leiloes, addLeilao, getLancesByLeilao, finalizarLeilao, removeLeilao } = useBank();
  const [showForm, setShowForm] = useState(false);
  const [lanceLeilao, setLanceLeilao] = useState<Leilao | null>(null);
  const [donoItem, setDonoItem] = useState("");
  const [nomeItem, setNomeItem] = useState("");
  const [imagemUrl, setImagemUrl] = useState("");
  const [valorInicial, setValorInicial] = useState("");
  const [moedaAceita, setMoedaAceita] = useState("");

  const [quantidade, setQuantidade] = useState("1");
  const [ptItems, setPtItems] = useState<PtItemMap[]>([]);

  const imgPreview = nomeItem.trim() ? `/items/${imagemUrl.trim() || nomeItem.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_")}.png` : null;
  const [tipoOrigem, setTipoOrigem] = useState("comum");
  const [duracaoIdx, setDuracaoIdx] = useState(4); // default 24h

  const taxaCasa = getTaxaFromTipo(tipoOrigem);

  // Quando seleciona um item no picker visual
  const handleItemSelect = (item: PtItemMap) => {
    setNomeItem(item.pt);
    setImagemUrl(item.file);
  };

  useEffect(() => {
    fetch("/items/_pt_index.json")
      .then((r) => r.json())
      .then((data: PtItemMap[]) => setPtItems(data))
      .catch(() => {});
  }, []);

  const handleAdd = () => {
    if (!donoItem.trim() || !nomeItem.trim() || !valorInicial || !moedaAceita.trim()) { toast.error("Preencha os campos obrigatórios."); return; }
    const duracao = DURACOES[duracaoIdx];
    const exp = new Date(Date.now() + duracao.ms);
    const imgUrl = imagemUrl.trim() ? `/items/${imagemUrl.trim()}.png` : `/items/${nomeItem.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_")}.png`;
    const qty = parseInt(quantidade) || 1;
    addLeilao({
      donoItem: donoItem.trim(),
      nomeItem: nomeItem.trim(),
      imagemUrl: imgUrl,
      quantidade: qty,
      valorInicial: parseFloat(valorInicial),
      moedaAceita: moedaAceita.trim(),
      taxaCasa,
      dataExpiracao: exp.toISOString(),
      tipoOrigem,
    });
    toast.success(`Leilão criado! Duração: ${duracao.label}`);
    setDonoItem(""); setNomeItem(""); setImagemUrl(""); setValorInicial(""); setMoedaAceita(""); setQuantidade("1"); setTipoOrigem("comum"); setDuracaoIdx(4);
    setShowForm(false);
  };

  const ativos = leiloes.filter((l) => l.status === "ativo" || l.status === "espera");
  const filaEspera = ativos.filter((l) => l.status === "espera" && new Date() >= new Date(l.dataExpiracao));
  const emDisputa = ativos.filter((l) => !(l.status === "espera" && new Date() >= new Date(l.dataExpiracao)));
  const finalizados = leiloes.filter((l) => l.status === "finalizado");

  return (
    <div className="space-y-4">
      <AdSlot size="banner" id="leiloes-top" isAdmin={isAdmin} className="my-3" />
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-primary">🔨 Leilões</h2>
        {!isAdmin && <span className="text-xs text-muted-foreground flex items-center gap-1"><Shield className="w-3 h-3" /> Modo visual</span>}
      </div>
      <div className="rounded-lg border border-primary/20 bg-card p-4">
        <h3 className="text-sm font-bold text-primary mb-2 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Como Funciona</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• O leilão conta o tempo escolhido (1h a 48h).</li>
          <li>• Qualquer pessoa pode dar lance durante o tempo.</li>
          <li>• Após o tempo acabar, cada novo lance adiciona <span className="text-primary font-semibold">+1 minuto</span> de disputa.</li>
          <li>• Quando o tempo de disputa acaba, o leilão vai para <span className="text-yellow-400 font-semibold">fila de espera</span>.</li>
          <li>• O admin finaliza após entregar o item e receber o pagamento.</li>
        </ul>
      </div>
      {isAdmin && (
        <>
          <Button onClick={() => setShowForm(!showForm)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="w-4 h-4 mr-1" /> {showForm ? "Fechar" : "Novo Leilão"}
          </Button>
          {showForm && (
            <div className="rounded-md border border-border bg-card p-4">
              <h3 className="text-sm font-bold text-foreground mb-3"><Plus className="w-4 h-4 text-primary mr-1" /> Novo Leilão</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div><Label className="text-xs text-muted-foreground">Dono</Label><Input placeholder="Nome" value={donoItem} onChange={(e) => setDonoItem(e.target.value)} className="text-sm" /></div>
                <div>
                  <Label className="text-xs text-muted-foreground">Item</Label>
                  <ItemPicker ptItems={ptItems} onSelect={handleItemSelect} />
                </div>
                <div><Label className="text-xs text-muted-foreground">Quantidade</Label><Input type="number" min="1" placeholder="1" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} className="text-sm font-mono" /></div>
                <div><Label className="text-xs text-muted-foreground">Valor Inicial (total do lote)</Label><Input type="number" placeholder="1000" value={valorInicial} onChange={(e) => setValorInicial(e.target.value)} className="text-sm font-mono" /></div>
                <div><Label className="text-xs text-muted-foreground">Moeda</Label><Input placeholder="Ex: Moeda" value={moedaAceita} onChange={(e) => setMoedaAceita(e.target.value)} className="text-sm" /></div>
                <div>
                  <Label className="text-xs text-muted-foreground">Origem / Taxa</Label>
                  <Select value={tipoOrigem} onValueChange={setTipoOrigem}>
                    <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TIPOS_ORIGEM.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Duração</Label>
                  <Select value={String(duracaoIdx)} onValueChange={(v) => setDuracaoIdx(Number(v))}>
                    <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DURACOES.map((d, i) => (<SelectItem key={i} value={String(i)}>{d.label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <Label className="text-xs text-muted-foreground">Item selecionado</Label>
                  {nomeItem.trim() ? (
                    <div className="flex items-center gap-3 rounded-md border border-primary/30 bg-primary/5 px-3 py-2">
                      {imgPreview && <LeilaoImg src={imgPreview} alt={nomeItem} className="w-10 h-10 rounded object-contain border border-border bg-accent/50" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{nomeItem}</p>
                        <p className="text-[10px] text-muted-foreground font-mono truncate">{imagemUrl}.png</p>
                      </div>
                      <button type="button" onClick={() => { setNomeItem(""); setImagemUrl(""); }} className="text-muted-foreground hover:text-red-400 transition-colors shrink-0" title="Remover item">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic py-1">Nenhum item selecionado. Use o seletor acima.</p>
                  )}
                </div>
              </div>
              <div className="mt-3"><Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground"><Gavel className="w-4 h-4 mr-1" /> Criar Leilão</Button></div>
            </div>
          )}
        </>
      )}

      {/* Fila de espera - precisa finalizar */}
      {filaEspera.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Pause className="w-4 h-4 text-yellow-400" /> Fila de Espera ({filaEspera.length})</h3>
          <div className="space-y-2">
            {filaEspera.map((leilao) => {
              const ll = getLancesByLeilao(leilao.id);
              const maior = ll.length > 0 ? ll[0] : null;
              return (
                <div key={leilao.id} className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <LeilaoImg src={leilao.imagemUrl || `/items/${leilao.nomeItem.toLowerCase().replace(/[^a-z0-9_]/g, "_")}.png`} alt={leilao.nomeItem} className="w-10 h-10 rounded object-contain border border-border bg-accent/50" />
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{leilao.nomeItem} {leilao.quantidade > 1 && <span className="text-xs font-normal text-muted-foreground">x{leilao.quantidade}</span>}</h4>
                        <p className="text-xs text-muted-foreground">Dono: <span data-no-translate translate="no">{leilao.donoItem}</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {leilao.quantidade > 1 && <span className="text-xs font-bold text-blue-400 flex items-center gap-1"><Package className="w-3 h-3" /> x{leilao.quantidade}</span>}
                      <span className="text-xs font-bold text-yellow-400 flex items-center gap-1"><Pause className="w-3 h-3" /> EM ESPERA</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mb-3 py-2 border-t border-b border-border/50">
                    {leilao.quantidade > 1 && <div className="text-center"><p className="text-xs text-muted-foreground">Qtd</p><p className="text-sm font-bold text-blue-400">x{leilao.quantidade}</p></div>}
                    <div className="text-center"><p className="text-xs text-muted-foreground">Inicial</p><p className="text-sm font-bold text-foreground">{leilao.valorInicial}</p></div>
                    <div className="text-center"><p className="text-xs text-muted-foreground">Maior</p><p className="text-sm font-bold text-primary">{maior ? maior.valor : "-"}</p></div>
                    <div className="text-center"><p className="text-xs text-muted-foreground">Vencedor</p><p className="text-sm font-bold text-green-400" data-no-translate translate="no">{maior?.jogador || "-"}</p></div>
                    <div className="text-center"><p className="text-xs text-muted-foreground">Moeda</p><p className="text-xs font-semibold text-primary">{leilao.moedaAceita}</p></div>
                    <div className="text-center"><p className="text-xs text-muted-foreground">Taxa</p><p className="text-sm font-bold text-yellow-400">{leilao.taxaCasa}%</p></div>
                  </div>
                  <div className="flex gap-2">
                    {isAdmin && <Button onClick={() => finalizarLeilao(leilao)} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs"><CheckCircle className="w-3 h-3 mr-1" /> Finalizar Entrega</Button>}
                    {isAdmin && <Button onClick={() => { if (confirm("Remover?")) removeLeilao(leilao.id); }} variant="destructive" className="text-xs"><Trash2 className="w-3 h-3" /></Button>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Leilões ativos / em disputa */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Ativos ({emDisputa.length})</h3>
        {emDisputa.length === 0 ? <div className="rounded-md border border-border bg-card p-4 text-center text-muted-foreground text-sm">Nenhum leilão ativo.</div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emDisputa.map((leilao) => {
              const ll = getLancesByLeilao(leilao.id);
              const maior = ll.length > 0 ? ll[0] : null;
              const canBid = leilao.status === "ativo" || (leilao.status === "espera" && new Date() < new Date(leilao.dataExpiracao));
              return (
                <div key={leilao.id} className={`rounded-lg border overflow-hidden ${leilao.status === "espera" ? "border-yellow-500/30 bg-yellow-500/5" : "border-primary/20 bg-card"}`}>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <LeilaoImg src={leilao.imagemUrl || `/items/${leilao.nomeItem.toLowerCase().replace(/[^a-z0-9_]/g, "_")}.png`} alt={leilao.nomeItem} className="w-12 h-12 rounded object-contain border border-border bg-accent/50" />
                        <div>
                          <h4 className="text-sm font-bold text-foreground">{leilao.nomeItem} {leilao.quantidade > 1 && <span className="text-xs font-normal text-muted-foreground">x{leilao.quantidade}</span>}</h4>
                          <p className="text-xs text-muted-foreground">Dono: <span data-no-translate translate="no">{leilao.donoItem}</span></p>
                          {leilao.status === "espera" && <p className="text-xs text-yellow-400 font-semibold mt-1"><Pause className="w-3 h-3 inline" /> Disputa final!</p>}
                        </div>
                      </div>
                      <LeilaoTimer leilao={leilao} />
                    </div>
                    <div className="flex items-center gap-4 mb-3 py-2 border-t border-b border-border/50">
                      {leilao.quantidade > 1 && <div className="text-center"><p className="text-xs text-muted-foreground">Qtd</p><p className="text-sm font-bold text-blue-400">x{leilao.quantidade}</p></div>}
                      <div className="text-center"><p className="text-xs text-muted-foreground">Inicial</p><p className="text-sm font-bold text-foreground">{leilao.valorInicial}</p></div>
                      <div className="text-center"><p className="text-xs text-muted-foreground">Maior</p><p className="text-sm font-bold text-primary">{maior ? maior.valor : leilao.valorInicial}</p></div>
                      <div className="text-center"><p className="text-xs text-muted-foreground">Lances</p><p className="text-sm font-bold text-foreground">{ll.length}</p></div>
                      <div className="text-center"><p className="text-xs text-muted-foreground">Moeda</p><p className="text-xs font-semibold text-primary">{leilao.moedaAceita}</p></div>
                      <div className="text-center"><p className="text-xs text-muted-foreground">Taxa</p><p className="text-sm font-bold text-yellow-400">{leilao.taxaCasa}%</p></div>
                    </div>
                    {ll.length > 0 && (
                      <div className="mb-3 max-h-24 overflow-y-auto space-y-1">
                        {ll.slice(0, 5).map((lance) => (
                          <div key={lance.id} className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground flex items-center gap-1" data-no-translate translate="no"><User className="w-3 h-3" /> {lance.jogador}</span>
                            <span className="font-mono text-foreground">{lance.valor}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      {canBid && <Button onClick={() => setLanceLeilao(leilao)} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-xs"><Gavel className="w-3 h-3 mr-1" /> Dar Lance</Button>}
                      {isAdmin && <Button onClick={() => { if (confirm("Remover?")) removeLeilao(leilao.id); }} variant="destructive" className="text-xs"><Trash2 className="w-3 h-3" /></Button>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Finalizados */}
      {finalizados.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-400" /> Histórico de Ganhadores ({finalizados.length})</h3>
          <div className="rounded-md border border-border bg-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-accent/50">
                  <th className="text-left px-3 py-2 text-xs font-bold text-muted-foreground">Item</th>
                  <th className="text-center px-3 py-2 text-xs font-bold text-muted-foreground">Qtd</th>
                  <th className="text-left px-3 py-2 text-xs font-bold text-muted-foreground">Dono</th>
                  <th className="text-left px-3 py-2 text-xs font-bold text-muted-foreground">Vencedor</th>
                  <th className="text-center px-3 py-2 text-xs font-bold text-muted-foreground">Valor</th>
                  <th className="text-center px-3 py-2 text-xs font-bold text-muted-foreground">Moeda</th>
                  <th className="text-center px-3 py-2 text-xs font-bold text-muted-foreground">Taxa</th>
                  <th className="text-left px-3 py-2 text-xs font-bold text-muted-foreground">Data</th>
                </tr>
              </thead>
              <tbody>
                {finalizados.map((l) => (
                  <tr key={l.id} className="border-b border-border/50 hover:bg-accent/30">
                    <td className="px-3 py-2 flex items-center gap-2">
                      <LeilaoImg src={l.imagemUrl || `/items/${l.nomeItem.toLowerCase().replace(/[^a-z0-9_]/g, "_")}.png`} alt={l.nomeItem} className="w-6 h-6 rounded object-contain" />
                      <span className="font-semibold text-foreground">{l.nomeItem}</span>
                    </td>
                    <td className="px-3 py-2 text-center font-mono text-blue-400">{l.quantidade > 1 ? `x${l.quantidade}` : "-"}</td>
                    <td className="px-3 py-2 text-muted-foreground" data-no-translate translate="no">{l.donoItem}</td>
                    <td className="px-3 py-2 text-yellow-400 font-semibold" data-no-translate translate="no">{l.vencedor || "-"}</td>
                    <td className="px-3 py-2 text-center font-mono text-primary font-bold">{l.valorVencedor || 0}</td>
                    <td className="px-3 py-2 text-center text-foreground">{l.moedaAceita}</td>
                    <td className="px-3 py-2 text-center text-yellow-400">{l.taxaCasa}%</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{l.dataCriacao ? new Date(l.dataCriacao).toLocaleDateString(getDateLocale()) : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {lanceLeilao && <LanceModal leilao={lanceLeilao} onClose={() => setLanceLeilao(null)} />}
      <AdSlot size="banner" id="leiloes-bottom" isAdmin={isAdmin} className="my-3" />
    </div>
  );
}
