"use client";
import { useState, useMemo } from "react";
import { Search, ArrowUpDown, ChevronDown, ChevronRight, Calculator, Info, X, TrendingUp, TrendingDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { pricesData } from "@/data/prices";
import { priceTrends } from "@/data/price-trends";
import { getItemIcon } from "@/data/item-icons";

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

function getSteelColor(demand: string): string {
  if (demand === "high") return "text-green-400";
  if (demand === "medium") return "text-yellow-400";
  return "text-foreground";
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

function ProfitCalculator({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [costSteel, setCostSteel] = useState("0");
  const [sellSteel, setSellSteel] = useState("0");
  const [craftTime, setCraftTime] = useState("0");

  const profitPerItem = Math.max(0, parseInt(sellSteel) - parseInt(costSteel));
  const totalProfit = profitPerItem * (parseInt(quantity) || 1);
  const profitPerHour = parseInt(craftTime) > 0 ? (totalProfit / parseInt(craftTime)) * 60 : 0;

  const handleReset = () => { setItemName(""); setQuantity("1"); setCostSteel("0"); setSellSteel("0"); setCraftTime("0"); };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="rounded-lg border border-primary/20 bg-card p-5 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-primary flex items-center gap-2"><Calculator className="w-4 h-4" /> Calculadora de Lucro</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <div><Label className="text-xs text-muted-foreground">Item</Label><Input value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="Ex: Carne Salgada" className="text-sm mt-1" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs text-muted-foreground">Quantidade</Label><Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="text-sm font-mono mt-1" /></div>
            <div><Label className="text-xs text-muted-foreground">Tempo Craft (min)</Label><Input type="number" value={craftTime} onChange={(e) => setCraftTime(e.target.value)} className="text-sm font-mono mt-1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs text-muted-foreground">Custo (Aco $)</Label><Input type="number" value={costSteel} onChange={(e) => setCostSteel(e.target.value)} className="text-sm font-mono mt-1" /></div>
            <div><Label className="text-xs text-muted-foreground">Venda (Aco $)</Label><Input type="number" value={sellSteel} onChange={(e) => setSellSteel(e.target.value)} className="text-sm font-mono mt-1" /></div>
          </div>
          <div className="rounded-md border border-border bg-muted/30 p-3 space-y-2">
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Lucro/Item:</span><span className={`font-mono font-bold ${profitPerItem > 0 ? "text-green-400" : "text-muted-foreground"}`}>{profitPerItem} $</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Lucro Total:</span><span className={`font-mono font-bold text-sm ${totalProfit > 0 ? "text-green-400" : "text-muted-foreground"}`}>{totalProfit} $</span></div>
            {parseInt(craftTime) > 0 && <div className="flex justify-between text-xs pt-2 border-t border-border"><span className="text-muted-foreground">Lucro/Hora:</span><span className={`font-mono font-bold ${profitPerHour > 0 ? "text-green-400" : "text-muted-foreground"}`}>{Math.round(profitPerHour)} $/h</span></div>}
          </div>
          <div className="flex gap-2 pt-2"><Button variant="outline" onClick={handleReset} className="flex-1 text-xs">Limpar</Button><Button onClick={onClose} className="flex-1 bg-primary text-primary-foreground text-xs">Fechar</Button></div>
        </div>
      </div>
    </div>
  );
}

function parsePriceValue(price: string): number {
  const parts = price.split(":");
  if (parts.length !== 2) return 9999;
  const qty = parseInt(parts[0]);
  const val = parseInt(parts[1]);
  if (val === 0) return 9999;
  return qty / val;
}

export default function TabelaTab() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(pricesData.categories.map((c) => c.id)));
  const [sortField, setSortField] = useState<"name" | "steel" | "cement">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showInfo, setShowInfo] = useState(false);
  const [showCalc, setShowCalc] = useState(false);

  const categories = pricesData.categories as Category[];
  const metadata = pricesData.metadata;

  const filteredCategories = useMemo(() => {
    return categories
      .map((cat) => ({
        ...cat,
        items: cat.items
          .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()) || item.id.toLowerCase().includes(search.toLowerCase()) || item.notes.toLowerCase().includes(search.toLowerCase()))
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
  }, [categories, search, activeCategory, sortField, sortDir]);

  const totalItems = filteredCategories.reduce((sum, c) => sum + c.items.length, 0);

  const toggleSort = (field: "name" | "steel" | "cement") => {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-primary">Tabela de Precos</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCalc(true)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border border-primary/30 text-primary hover:bg-primary/10 transition-all"><Calculator className="w-3.5 h-3.5" />Calc</button>
          <button onClick={() => setShowInfo(!showInfo)} className="text-muted-foreground hover:text-foreground transition-colors"><Info className="w-4 h-4" /></button>
        </div>
      </div>

      {showInfo && (
        <div className="rounded-lg border border-primary/20 bg-card p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div><span className="text-muted-foreground">Versao:</span> <span className="text-foreground font-mono">{metadata.game_version}</span></div>
            <div><span className="text-muted-foreground">Atualizado:</span> <span className="text-foreground">{metadata.last_updated}</span></div>
            <div className="col-span-2"><span className="text-muted-foreground">Cambio:</span> <span className="text-foreground font-semibold">{metadata.exchange_rate}</span></div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">{metadata.note}</p>
        </div>
      )}

      <ProfitCalculator isOpen={showCalc} onClose={() => setShowCalc(false)} />

      <div className="relative">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
        <Input placeholder="Buscar item..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-card border-border text-sm" />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button onClick={() => setActiveCategory(null)} className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${activeCategory === null ? "bg-primary/20 text-primary border-primary/30" : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-accent"}`}>Todos ({categories.reduce((s, c) => s + c.items.length, 0)})</button>
        {categories.map((cat) => (
          <button key={cat.id} onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)} className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all whitespace-nowrap ${activeCategory === cat.id ? "bg-primary/20 text-primary border-primary/30" : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-accent"}`}>{cat.name} ({cat.items.length})</button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">{totalItems} {totalItems === 1 ? "item" : "itens"}{search ? ` para "${search}"` : ""}</p>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-12 gap-1 px-3 py-2 border-b border-border bg-muted/30 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          <div className="col-span-1">Icone</div>
          <button onClick={() => toggleSort("name")} className="col-span-3 sm:col-span-3 flex items-center gap-1 hover:text-foreground transition-colors text-left">Item <ArrowUpDown className="w-3 h-3" /></button>
          <button onClick={() => toggleSort("steel")} className="col-span-2 flex items-center gap-1 hover:text-foreground transition-colors text-left">Aco ($) <ArrowUpDown className="w-3 h-3" /></button>
          <button onClick={() => toggleSort("cement")} className="col-span-2 flex items-center gap-1 hover:text-foreground transition-colors text-left">Cimento <ArrowUpDown className="w-3 h-3" /></button>
          <div className="col-span-2 hidden sm:block text-center">Demanda</div>
          <div className="col-span-2 hidden lg:block text-center">Tendencia</div>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">Nenhum item encontrado.</div>
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
                  {cat.items.map((item, idx) => (
                    <div key={item.id} className={`grid grid-cols-12 gap-1 px-3 py-2 border-b border-border/50 hover:bg-muted/20 transition-colors text-xs ${idx % 2 === 0 ? "" : "bg-muted/5"}`}>
                      <div className="col-span-1 text-center text-base leading-6">{getItemIcon(item.id)}</div>
                      <div className="col-span-3 sm:col-span-3">
                        <p className="font-semibold text-foreground truncate">{item.name}</p>
                        {item.notes && <p className="text-[10px] text-muted-foreground truncate hidden sm:block">{item.notes}</p>}
                      </div>
                      <div className={`col-span-2 font-mono font-bold ${getSteelColor(item.demand)}`}>{item.steel}</div>
                      <div className="col-span-2 font-mono font-bold text-foreground">{item.cement}</div>
                      <div className="col-span-2 hidden sm:flex justify-center">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${demandColors[item.demand] || demandColors.medium}`}>{demandLabels[item.demand] || item.demand}</span>
                      </div>
                      <div className="col-span-2 hidden lg:flex justify-center">
                        <Sparkline itemId={item.id} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
