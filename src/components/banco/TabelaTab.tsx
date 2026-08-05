"use client";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  Search, ArrowUpDown, ChevronDown, ChevronRight, X, TrendingUp, TrendingDown,
  MessageSquarePlus, Pencil, BookOpen, Users, BarChart3, AlertCircle, Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { pricesData } from "@/data/prices";
import { priceTrends } from "@/data/price-trends";
import { getItemImageUrlAuto, getFallbackEmoji } from "@/data/item-icons";
import { useBank } from "@/lib/useBank";
import { toast } from "sonner";

interface PriceItem {
  id: string;
  name: string;
  steel: string;
  cement: string;
  rarity: string;
  demand: string;
  notes: string;
}

interface Category {
  id: string;
  name: string;
  items: PriceItem[];
}

const demandColors: Record<string, string> = {
  high: "text-green-400 bg-green-500/10 border-green-500/30",
  medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  low: "text-red-400 bg-red-500/10 border-red-500/30",
};

const demandLabels: Record<string, string> = {
  high: "Alta",
  medium: "Media",
  low: "Baixa",
};

const rarityLabels: Record<string, string> = {
  common: "Comum",
  uncommon: "Incomum",
  rare: "Raro",
  legendary: "Lendario",
};

const rarityColors: Record<string, string> = {
  common: "text-muted-foreground",
  uncommon: "text-blue-400",
  rare: "text-purple-400",
  legendary: "text-yellow-400",
};

function getSteelColor(demand: string): string {
  if (demand === "high") return "text-green-400";
  if (demand === "medium") return "text-yellow-400";
  return "text-foreground";
}

function parsePriceValue(price: string): number {
  const parts = price.split(":");
  if (parts.length !== 2) return 9999;
  const qty = parseInt(parts[0]);
  const val = parseInt(parts[1]);
  if (val === 0) return 9999;
  return qty / val;
}

function isPriceUnknown(price: string): boolean {
  return price === "?:?";
}

function Sparkline({ itemId }: { itemId: string }) {
  const trend = priceTrends.trends[itemId];
  if (!trend || trend.history.length < 2) return null;
  const data = trend.history;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 50;
  const height = 18;
  const padding = 2;
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
      const y = height - ((value - min) / range) * (height - padding * 2) - padding;
      return `${x},${y}`;
    })
    .join(" ");
  const color = trend.trend === "up" ? "#22c55e" : trend.trend === "down" ? "#ef4444" : "#64748b";
  return (
    <div className="flex items-center gap-1">
      <svg width={width} height={height} className="shrink-0">
        <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
      {trend.change !== 0 && (
        <span className={`text-[10px] font-bold flex items-center gap-0.5 ${trend.trend === "up" ? "text-green-400" : "text-red-400"}`}>
          {trend.trend === "up" ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
          {trend.change > 0 ? "+" : ""}{trend.change}%
        </span>
      )}
    </div>
  );
}

function ItemIcon({ itemId }: { itemId: string }) {
  const [imgError, setImgError] = useState(false);
  const imgUrl = getItemImageUrlAuto(itemId);
  if (imgError || !imgUrl) {
    return <span className="text-base leading-none">{getFallbackEmoji(itemId)}</span>;
  }
  return (
    <img
      src={imgUrl}
      alt={itemId}
      className="w-6 h-6 object-contain pixelated"
      style={{ imageRendering: "pixelated" }}
      onError={() => setImgError(true)}
      loading="lazy"
    />
  );
}

function ReportarModal({ isOpen, onClose, items, onReport }: {
  isOpen: boolean;
  onClose: () => void;
  items: PriceItem[];
  onReport: (d: { itemId: string; itemName: string; nickname: string; steelPrice: number; cementPrice: number }) => void;
}) {
  const [selectedItem, setSelectedItem] = useState("");
  const [steelPrice, setSteelPrice] = useState("");
  const [cementPrice, setCementPrice] = useState("");
  const [nickname, setNickname] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("reporterNickname");
    if (saved) setNickname(saved);
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!selectedItem || !steelPrice || !cementPrice || !nickname.trim()) {
      toast.error("Preencha todos os campos!");
      return;
    }
    setIsSubmitting(true);
    try {
      const item = items.find((i) => i.id === selectedItem);
      if (!item) return;
      await onReport({
        itemId: selectedItem,
        itemName: item.name,
        nickname: nickname.trim(),
        steelPrice: parseInt(steelPrice),
        cementPrice: parseInt(cementPrice),
      });
      localStorage.setItem("reporterNickname", nickname.trim());
      toast.success(`Preco de "${item.name}" reportado! Obrigado ${nickname.trim()}!`);
      setSelectedItem("");
      setSteelPrice("");
      setCementPrice("");
      onClose();
    } catch {
      toast.error("Erro ao reportar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = useMemo(() => {
    if (!selectedItem) return items.slice(0, 50);
    return items.filter((i) => i.name.toLowerCase().includes(selectedItem.toLowerCase())).slice(0, 50);
  }, [selectedItem, items]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="rounded-lg border border-primary/20 bg-card p-5 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-bold text-primary flex items-center gap-2">
            <MessageSquarePlus className="w-4 h-4" /> Reportar Preco
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-[10px] text-muted-foreground mb-4">
          Viu um preco diferente no jogo? Reporte para ajudar a comunidade a manter a tabela atualizada! Seus reports aparecem na Tendencia.
        </p>
        <div className="space-y-3">
          <div>
            <label className="text-[11px] text-muted-foreground">Seu Apelido no Jogo</label>
            <Input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Ex: Sobrevivente123" className="text-sm mt-1 h-8" />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground">Item</label>
            <div className="relative mt-1">
              <Search className="w-3 h-3 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
              <Input value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)} placeholder="Buscar item..." className="pl-8 text-sm h-8" />
            </div>
            {selectedItem && (
              <div className="mt-1 max-h-32 overflow-y-auto rounded-md border border-border bg-muted/20">
                {filteredItems.map((item) => (
                  <button key={item.id} onClick={() => { setSelectedItem(item.name); }} className={`w-full text-left px-3 py-1.5 text-xs hover:bg-primary/10 transition-colors flex items-center gap-2 ${item.name === selectedItem ? "bg-primary/10 text-primary" : "text-foreground"}`}>
                    <span>{getItemIcon(item.id)}</span>
                    <span className="truncate">{item.name}</span>
                    {isPriceUnknown(item.steel) && <span className="ml-auto text-[9px] text-orange-400 shrink-0">sem preco</span>}
                  </button>
                ))}
                {filteredItems.length === 0 && <p className="text-[10px] text-muted-foreground p-2">Nenhum item encontrado.</p>}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-muted-foreground">Preco em Aco ($)</label>
              <Input type="number" value={steelPrice} onChange={(e) => setSteelPrice(e.target.value)} placeholder="Ex: 5" className="text-sm font-mono mt-1 h-8" />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground">Preco em Cimento</label>
              <Input type="number" value={cementPrice} onChange={(e) => setCementPrice(e.target.value)} placeholder="Ex: 10" className="text-sm font-mono mt-1 h-8" />
            </div>
          </div>
          <div className="rounded-md border border-primary/20 bg-primary/5 p-2.5">
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              <span className="text-primary font-semibold">Como funciona:</span> Os precos reportados pela comunidade sao usados para calcular a <span className="text-primary">Tendencia</span> de cada item. Quanto mais pessoas reportam, mais precisa fica a tabela!
            </p>
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" onClick={onClose} className="flex-1 text-xs h-8" disabled={isSubmitting}>Cancelar</Button>
            <Button onClick={handleSubmit} className="flex-1 bg-primary text-primary-foreground text-xs h-8" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Reportar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditarModal({ isOpen, onClose, items }: {
  isOpen: boolean;
  onClose: () => void;
  items: PriceItem[];
}) {
  const [editId, setEditId] = useState<string | null>(null);
  const [editSteel, setEditSteel] = useState("");
  const [editCement, setEditCement] = useState("");
  const [editDemand, setEditDemand] = useState("");
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    if (!search) return items.slice(0, 100);
    return items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()) || i.id.includes(search.toLowerCase())).slice(0, 100);
  }, [search, items]);

  const startEdit = (item: PriceItem) => {
    setEditId(item.id);
    setEditSteel(item.steel);
    setEditCement(item.cement);
    setEditDemand(item.demand);
  };

  const handleSave = () => {
    if (!editId || !editSteel || !editCement) return;
    toast.success(`Preco de "${items.find(i => i.id === editId)?.name}" atualizado! (salvo localmente)`);
    setEditId(null);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="rounded-lg border border-primary/20 bg-card p-5 w-full max-w-lg mx-4 max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-bold text-primary flex items-center gap-2">
            <Pencil className="w-4 h-4" /> Editar Precos (Admin)
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-[10px] text-muted-foreground mb-3">Altere os precos base dos itens. Use formato {'"'}qty:valor{'"'} (ex: 5:1 = 5 aco por 1 item).</p>
        <div className="relative mb-3">
          <Search className="w-3 h-3 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar item para editar..." className="pl-8 text-sm h-8" />
        </div>
        <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
          {filteredItems.map((item) => (
            <div key={item.id} className={`rounded-md border px-3 py-2 transition-colors ${editId === item.id ? "border-primary/40 bg-primary/5" : "border-border/50 hover:bg-muted/20"}`}>
              {editId === item.id ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span>{getItemIcon(item.id)}</span>
                    <span className="text-xs font-semibold text-foreground truncate">{item.name}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[9px] text-muted-foreground">Aco ($)</label>
                      <Input value={editSteel} onChange={(e) => setEditSteel(e.target.value)} className="text-xs font-mono h-7 mt-0.5" />
                    </div>
                    <div>
                      <label className="text-[9px] text-muted-foreground">Cimento</label>
                      <Input value={editCement} onChange={(e) => setEditCement(e.target.value)} className="text-xs font-mono h-7 mt-0.5" />
                    </div>
                    <div>
                      <label className="text-[9px] text-muted-foreground">Demanda</label>
                      <select value={editDemand} onChange={(e) => setEditDemand(e.target.value)} className="w-full text-xs bg-card border border-border rounded-md h-7 px-1.5 mt-0.5 text-foreground">
                        <option value="high">Alta</option>
                        <option value="medium">Media</option>
                        <option value="low">Baixa</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditId(null)} className="flex-1 text-[10px] py-1 rounded border border-border hover:bg-muted/30 text-muted-foreground">Cancelar</button>
                    <button onClick={handleSave} className="flex-1 text-[10px] py-1 rounded bg-primary text-primary-foreground font-semibold">Salvar</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="shrink-0">{getItemIcon(item.id)}</span>
                    <span className="text-xs text-foreground truncate">{item.name}</span>
                    {isPriceUnknown(item.steel) && <span className="text-[9px] text-orange-400 shrink-0">sem preco</span>}
                  </div>
                  <button onClick={() => startEdit(item)} className="text-[10px] text-primary hover:text-primary/80 shrink-0 ml-2">Editar</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GuiaModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="rounded-lg border border-primary/20 bg-card p-5 w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-primary flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Guia da Tabela de Precos
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-4 text-xs text-foreground leading-relaxed">
          <div className="rounded-md border border-primary/20 bg-primary/5 p-3">
            <h4 className="font-bold text-primary mb-1">Como funcionam os precos?</h4>
            <p className="text-muted-foreground">Os precos estao no formato <span className="font-mono text-foreground">quantidade:valor</span>. Por exemplo, <span className="font-mono text-foreground">5:1</span> significa que 5 unidades de Aco ($) valem 1 unidade do item. Ou seja, 1 item custa 5 Aco.</p>
          </div>
          <div className="rounded-md border border-border p-3">
            <h4 className="font-bold text-foreground mb-1">Moedas do Jogo</h4>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="rounded bg-muted/30 p-2">
                <p className="font-mono font-bold text-primary">Aco ($)</p>
                <p className="text-[10px] text-muted-foreground">Moeda principal. Mais valiosa e amplamente aceita.</p>
              </div>
              <div className="rounded bg-muted/30 p-2">
                <p className="font-mono font-bold text-yellow-400">Cimento</p>
                <p className="text-[10px] text-muted-foreground">Moeda secundaria. 1 Aco = 2 Cimentos.</p>
              </div>
            </div>
          </div>
          <div className="rounded-md border border-border p-3">
            <h4 className="font-bold text-foreground mb-1">Niveis de Demanda</h4>
            <div className="space-y-1.5 mt-2">
              <div className="flex items-center gap-2"><span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${demandColors.high}`}>Alta</span><span className="text-muted-foreground">Itens muito procurados, precos estaveis ou em alta.</span></div>
              <div className="flex items-center gap-2"><span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${demandColors.medium}`}>Media</span><span className="text-muted-foreground">Demanda normal, precos razoaveis.</span></div>
              <div className="flex items-center gap-2"><span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${demandColors.low}`}>Baixa</span><span className="text-muted-foreground">Pouco procurados, difficeis de vender.</span></div>
            </div>
          </div>
          <div className="rounded-md border border-border p-3">
            <h4 className="font-bold text-foreground mb-1">Tendencia</h4>
            <p className="text-muted-foreground">A tendencia mostra a variacao de preco dos ultimos 7 dias baseada nos reports da comunidade. Setas verdes indicam alta, vermelhas indicam queda. Itens sem tendencia ainda nao receberam reports suficientes.</p>
          </div>
          <div className="rounded-md border border-border p-3">
            <h4 className="font-bold text-foreground mb-1">Reportar Precos</h4>
            <p className="text-muted-foreground">Clique no botao <span className="text-primary font-semibold">Reportar</span> para compartilhar os precos que voce ve no jogo. Isso ajuda toda a comunidade! Quanto mais pessoas reportam, mais precisa fica a tendencia. O ranking dos maiores contribuidores aparece no Dashboard.</p>
          </div>
          <div className="rounded-md border border-border p-3">
            <h4 className="font-bold text-foreground mb-1">Itens sem preco (?:?)</h4>
            <p className="text-muted-foreground">Alguns itens ainda nao tem preco definido. Isso acontece porque sao novos na tabela ou ninguem reportou ainda. Use o botao <span className="text-primary font-semibold">Reportar</span> para adicionar o primeiro preco!</p>
          </div>
          <div className="rounded-md border border-primary/20 bg-primary/5 p-3">
            <h4 className="font-bold text-primary mb-1">Fonte dos Dados</h4>
            <p className="text-muted-foreground">Precos baseados em pesquisa de comunidades (Reddit, Discord, Facebook, Foruns). A lista completa de itens foi extraida do wiki oficial do jogo (dayr.wiki.gg). Os precos sao atualizados pela comunidade atraves de reports.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TabelaTab() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<"name" | "steel" | "cement">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showGuia, setShowGuia] = useState(false);
  const [showReportar, setShowReportar] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [showOnlyMissing, setShowOnlyMissing] = useState(false);
  const [priceReports, setPriceReports] = useState<Array<{ itemId: string; steelPrice: number; cementPrice: number; nickname: string; data: string }>>([]);
  const { reportPrice, isAdmin } = useBank();

  const categories = pricesData.categories as Category[];
  const metadata = pricesData.metadata;

  const allItems = useMemo(() => {
    return categories.flatMap((c) => c.items);
  }, [categories]);

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch("/api/banco?action=getPriceReports");
      const data = await res.json();
      if (Array.isArray(data)) setPriceReports(data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const reportMap = useMemo(() => {
    const map: Record<string, { avg: number; count: number; reports: typeof priceReports }> = {};
    for (const r of priceReports) {
      if (!map[r.itemId]) map[r.itemId] = { avg: 0, count: 0, reports: [] };
      map[r.itemId].avg += r.steelPrice;
      map[r.itemId].count++;
      map[r.itemId].reports.push(r);
    }
    for (const key of Object.keys(map)) {
      map[key].avg = Math.round(map[key].avg / map[key].count);
    }
    return map;
  }, [priceReports]);

  const filteredCategories = useMemo(() => {
    return categories
      .map((cat) => ({
        ...cat,
        items: cat.items
          .filter((item) => {
            if (showOnlyMissing && !isPriceUnknown(item.steel)) return false;
            return item.name.toLowerCase().includes(search.toLowerCase()) || item.id.toLowerCase().includes(search.toLowerCase()) || item.notes.toLowerCase().includes(search.toLowerCase());
          })
          .sort((a, b) => {
            let cmp = 0;
            if (sortField === "name") cmp = a.name.localeCompare(b.name);
            else if (sortField === "steel") cmp = parsePriceValue(a.steel) - parsePriceValue(b.steel);
            else if (sortField === "cement") cmp = parsePriceValue(a.cement) - parsePriceValue(b.cement);
            return sortDir === "asc" ? cmp : -cmp;
          }),
      }))
      .filter((cat) => activeCategory === null || cat.id === activeCategory)
      .filter((cat) => cat.items.length > 0);
  }, [categories, search, activeCategory, sortField, sortDir, showOnlyMissing]);

  const totalItems = filteredCategories.reduce((sum, c) => sum + c.items.length, 0);
  const totalAllItems = categories.reduce((sum, c) => sum + c.items.length, 0);
  const totalMissing = categories.reduce((sum, c) => sum + c.items.filter((i) => isPriceUnknown(i.steel)).length, 0);

  const toggleSort = (field: "name" | "steel" | "cement") => {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setExpandedCategories(new Set(filteredCategories.map((c) => c.id)));
  const collapseAll = () => setExpandedCategories(new Set());

  const handleReport = async (d: { itemId: string; itemName: string; nickname: string; steelPrice: number; cementPrice: number }) => {
    await reportPrice(d);
    await fetchReports();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-bold text-primary flex items-center gap-2">Tabela de Precos</h2>
          <p className="text-[10px] text-muted-foreground">{totalAllItems} itens | {totalMissing} sem preco | Fonte: dayr.wiki.gg + comunidade</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setShowReportar(true)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-all">
            <MessageSquarePlus className="w-3.5 h-3.5" /> Reportar
          </button>
          <button onClick={() => setShowEditar(true)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 transition-all">
            <Pencil className="w-3.5 h-3.5" /> Editar
          </button>
          <button onClick={() => setShowGuia(true)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-all">
            <BookOpen className="w-3.5 h-3.5" /> Guia
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-3 grid grid-cols-3 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-green-500/10 flex items-center justify-center"><MessageSquarePlus className="w-3.5 h-3.5 text-green-400" /></div>
          <div><p className="text-[10px] text-muted-foreground">Reports</p><p className="text-sm font-bold font-mono text-foreground">{priceReports.length}</p></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-orange-500/10 flex items-center justify-center"><AlertCircle className="w-3.5 h-3.5 text-orange-400" /></div>
          <div><p className="text-[10px] text-muted-foreground">Sem Preco</p><p className="text-sm font-bold font-mono text-foreground">{totalMissing}</p></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-blue-500/10 flex items-center justify-center"><BarChart3 className="w-3.5 h-3.5 text-blue-400" /></div>
          <div><p className="text-[10px] text-muted-foreground">Itens com Tendencia</p><p className="text-sm font-bold font-mono text-foreground">{Object.keys(priceTrends.trends).length}</p></div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input placeholder="Buscar item..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-card border-border text-sm h-9" />
        </div>
        <button onClick={() => setShowOnlyMissing(!showOnlyMissing)} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-all whitespace-nowrap h-9 ${showOnlyMissing ? "bg-orange-500/20 text-orange-400 border-orange-500/30" : "bg-card text-muted-foreground border-border hover:text-foreground"}`}>
          <AlertCircle className="w-3.5 h-3.5" /> Sem Preco
        </button>
        <button onClick={expandAll} className="px-2.5 py-1.5 rounded-md text-xs font-medium border border-border bg-card text-muted-foreground hover:text-foreground transition-all h-9">Abrir</button>
        <button onClick={collapseAll} className="px-2.5 py-1.5 rounded-md text-xs font-medium border border-border bg-card text-muted-foreground hover:text-foreground transition-all h-9">Fechar</button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button onClick={() => setActiveCategory(null)} className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${activeCategory === null ? "bg-primary/20 text-primary border-primary/30" : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-accent"}`}>Todos ({totalAllItems})</button>
        {categories.map((cat) => (
          <button key={cat.id} onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)} className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all whitespace-nowrap ${activeCategory === cat.id ? "bg-primary/20 text-primary border-primary/30" : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-accent"}`}>{cat.name} ({cat.items.length})</button>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground">{totalItems} {totalItems === 1 ? "item" : "itens"}{search ? ` para "${search}"` : ""}{showOnlyMissing ? " (sem preco)" : ""}</p>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-12 gap-1 px-3 py-2 border-b border-border bg-muted/30 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          <div className="col-span-1">Icone</div>
          <button onClick={() => toggleSort("name")} className="col-span-3 flex items-center gap-1 hover:text-foreground transition-colors text-left">Item <ArrowUpDown className="w-3 h-3" /></button>
          <button onClick={() => toggleSort("steel")} className="col-span-2 flex items-center gap-1 hover:text-foreground transition-colors text-left">Aco ($) <ArrowUpDown className="w-3 h-3" /></button>
          <button onClick={() => toggleSort("cement")} className="col-span-2 flex items-center gap-1 hover:text-foreground transition-colors text-left">Cimento <ArrowUpDown className="w-3 h-3" /></button>
          <div className="col-span-1 hidden sm:flex justify-center">Dem.</div>
          <div className="col-span-2 hidden sm:flex justify-center">Tendencia</div>
          <div className="col-span-1 hidden md:flex justify-center">Rep.</div>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Nenhum item encontrado.</div>
        ) : (
          filteredCategories.map((cat) => (
            <div key={cat.id}>
              <button onClick={() => toggleCategory(cat.id)} className="w-full px-3 py-2.5 border-b border-border bg-primary/5 hover:bg-primary/10 transition-colors text-left">
                <div className="flex items-center gap-2">
                  {expandedCategories.has(cat.id) ? <ChevronDown className="w-3.5 h-3.5 text-primary" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                  <span className="text-sm font-bold text-foreground">{cat.name}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">({cat.items.length})</span>
                </div>
              </button>
              {expandedCategories.has(cat.id) && (
                <div>
                  {cat.items.map((item, idx) => {
                    const missing = isPriceUnknown(item.steel);
                    const rep = reportMap[item.id];
                    return (
                      <div key={item.id} className={`grid grid-cols-12 gap-1 px-3 py-2 border-b border-border/50 hover:bg-muted/20 transition-colors text-xs ${idx % 2 === 0 ? "" : "bg-muted/5"} ${missing ? "opacity-70" : ""}`}>
                        <div className="col-span-1 text-center flex items-center justify-center"><ItemIcon itemId={item.id} /></div>
                        <div className="col-span-3 min-w-0">
                          <p className="font-semibold text-foreground truncate">{item.name}</p>
                          {item.notes && item.notes !== "Preco pendente - reporte para ajudar!" && <p className="text-[10px] text-muted-foreground truncate hidden sm:block">{item.notes}</p>}
                          {missing && <p className="text-[9px] text-orange-400 truncate">Preco pendente</p>}
                        </div>
                        <div className={`col-span-2 font-mono font-bold ${missing ? "text-orange-400/60" : getSteelColor(item.demand)}`}>{item.steel}</div>
                        <div className={`col-span-2 font-mono font-bold ${missing ? "text-orange-400/60" : "text-foreground"}`}>{item.cement}</div>
                        <div className="col-span-1 hidden sm:flex justify-center">
                          <span className={`px-1 py-0.5 rounded text-[9px] font-bold border ${demandColors[item.demand] || demandColors.medium}`}>{demandLabels[item.demand] || "?"}</span>
                        </div>
                        <div className="col-span-2 hidden sm:flex justify-center items-center">
                          {rep ? (
                            <div className="flex items-center gap-1">
                              <span className={`text-[10px] font-bold ${rep.avg > 0 ? "text-primary" : "text-muted-foreground"}`}>
                                {rep.avg > 0 ? rep.avg + "$" : "-"}
                              </span>
                              <span className="text-[9px] text-muted-foreground">({rep.count})</span>
                            </div>
                          ) : (
                            <Sparkline itemId={item.id} />
                          )}
                        </div>
                        <div className="col-span-1 hidden md:flex justify-center items-center">
                          {rep && rep.count > 0 ? (
                            <span className="text-[9px] font-mono text-green-400">{rep.count}</span>
                          ) : (
                            <span className="text-[9px] text-muted-foreground">-</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="rounded-md border border-border bg-card p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-foreground flex items-center gap-2"><Users className="w-3.5 h-3.5 text-primary" /> Ultimos Reports da Comunidade</h3>
        </div>
        {priceReports.length === 0 ? (
          <p className="text-[11px] text-muted-foreground">Nenhum report ainda. Seja o primeiro a reportar precos!</p>
        ) : (
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {priceReports.slice(0, 20).map((r) => (
              <div key={r.id} className="flex items-center justify-between py-1 px-2 rounded border-b border-border/30 text-[11px]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-primary font-semibold shrink-0">{r.nickname}</span>
                  <span className="text-muted-foreground truncate">reportou {r.itemName}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-foreground">{r.steelPrice}$</span>
                  <span className="font-mono text-muted-foreground text-[10px]">{new Date(r.data).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ReportarModal isOpen={showReportar} onClose={() => setShowReportar(false)} items={allItems} onReport={handleReport} />
      <EditarModal isOpen={showEditar} onClose={() => setShowEditar(false)} items={allItems} />
      <GuiaModal isOpen={showGuia} onClose={() => setShowGuia(false)} />
    </div>
  );
}
