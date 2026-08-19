"use client";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  Search, ArrowUpDown, ChevronDown, ChevronRight, X, TrendingUp, TrendingDown,
  MessageSquarePlus, Pencil, BookOpen, Users, BarChart3, AlertCircle, Check,
  ExternalLink, PlusCircle, Settings2, Trash2, RotateCcw, Save, ImageOff,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { pricesData } from "@/data/prices";
import { priceTrends } from "@/data/price-trends";
import { useBank } from "@/lib/useBank";
import { toast } from "sonner";
import AdSlot from "@/components/AdSlot";

interface PriceItem {
  id: string;
  name: string;
  img?: string;
  wikiLink?: string;
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
  wikiLink?: string;
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

function ItemIcon({ itemId, imgPath }: { itemId: string; imgPath?: string }) {
  const resolvedPath = imgPath || `/items/${itemId}.png`;
  const [imgError, setImgError] = useState(false);
  useEffect(() => setImgError(false), [resolvedPath]);
  if (imgError) {
    return <span className="inline-flex w-7 h-7 items-center justify-center rounded-sm bg-muted/40" title={`Imagem indisponível para ${itemId}`}><ImageOff className="w-4 h-4 text-muted-foreground" /></span>;
  }
  return (
    <img
      src={resolvedPath}
      alt={itemId}
      className="w-7 h-7 object-contain rounded-sm"
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
  onReport: (d: { itemId: string; itemName: string; nickname: string; steelQty: number; steelPrice: number; cementQty: number; cementPrice: number }) => void;
}) {
  const [searchText, setSearchText] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [selectedItemName, setSelectedItemName] = useState("");
  const [steelQty, setSteelQty] = useState("");
  const [steelPrice, setSteelPrice] = useState("");
  const [cementQty, setCementQty] = useState("");
  const [cementPrice, setCementPrice] = useState("");
  const [nickname, setNickname] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("reporterNickname");
    if (saved) setNickname(saved);
  }, [isOpen]);

  const selectedDisplayName = selectedItemName || searchText;

  const handleSubmit = async () => {
    if (!selectedItemId || !steelQty || !steelPrice || !cementQty || !cementPrice || !nickname.trim()) {
      toast.error("Preencha todos os campos e selecione um item!");
      return;
    }
    setIsSubmitting(true);
    try {
      await onReport({
        itemId: selectedItemId,
        itemName: selectedDisplayName,
        nickname: nickname.trim(),
        steelQty: parseInt(steelQty),
        steelPrice: parseInt(steelPrice),
        cementQty: parseInt(cementQty),
        cementPrice: parseInt(cementPrice),
      });
      setSearchText("");
      setSelectedItemId("");
      setSelectedItemName("");
      setSteelQty("");
      setSteelPrice("");
      setCementQty("");
      setCementPrice("");
      localStorage.setItem("reporterNickname", nickname.trim());
      toast.success(`Preco de "${selectedDisplayName}" reportado! Obrigado ${nickname.trim()}!`);
      onClose();
    } catch {
      toast.error("Erro ao reportar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = useMemo(() => {
    if (!searchText) return items.slice(0, 50);
    return items.filter((i) => i.name.toLowerCase().includes(searchText.toLowerCase())).slice(0, 50);
  }, [searchText, items]);

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
              <Input value={selectedItemId ? selectedDisplayName : searchText} onChange={(e) => { setSearchText(e.target.value); if (selectedItemId) { setSelectedItemId(""); setSelectedItemName(""); } }} placeholder="Buscar item..." className="pl-8 text-sm h-8" />
            </div>
            {searchText && !selectedItemId && (
              <div className="mt-1 max-h-32 overflow-y-auto rounded-md border border-border bg-muted/20">
                {filteredItems.map((item) => (
                  <button key={item.id} onClick={() => { setSelectedItemId(item.id); setSelectedItemName(item.name); setSearchText(item.name); }} className={`w-full text-left px-3 py-1.5 text-xs hover:bg-primary/10 transition-colors flex items-center gap-2 ${selectedItemId === item.id ? "bg-primary/10 text-primary" : "text-foreground"}`}>
                    <ItemIcon itemId={item.id} imgPath={item.img} />
                    <span className="truncate">{item.name}</span>
                    {isPriceUnknown(item.steel) && <span className="ml-auto text-[9px] text-orange-400 shrink-0">sem preco</span>}
                  </button>
                ))}
                {filteredItems.length === 0 && <p className="text-[10px] text-muted-foreground p-2">Nenhum item encontrado.</p>}
              </div>
            )}
            {selectedItemId && (
              <div className="mt-1 flex items-center gap-2 px-2 py-1 rounded-md bg-primary/10 border border-primary/20">
                <Check className="w-3 h-3 text-primary shrink-0" />
                <span className="text-xs text-primary font-medium truncate">{selectedDisplayName}</span>
                <button onClick={() => { setSelectedItemId(""); setSelectedItemName(""); }} className="ml-auto text-muted-foreground hover:text-foreground shrink-0"><X className="w-3 h-3" /></button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="text-[11px] text-muted-foreground">Qtd Aco</label>
              <Input type="number" min={1} value={steelQty} onChange={(e) => setSteelQty(e.target.value)} placeholder="Ex: 5" className="text-sm font-mono mt-1 h-8" />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground">Valor Aco ($)</label>
              <Input type="number" min={1} value={steelPrice} onChange={(e) => setSteelPrice(e.target.value)} placeholder="Ex: 1" className="text-sm font-mono mt-1 h-8" />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground">Qtd Cimento</label>
              <Input type="number" min={1} value={cementQty} onChange={(e) => setCementQty(e.target.value)} placeholder="Ex: 10" className="text-sm font-mono mt-1 h-8" />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground">Valor Cimento</label>
              <Input type="number" min={1} value={cementPrice} onChange={(e) => setCementPrice(e.target.value)} placeholder="Ex: 1" className="text-sm font-mono mt-1 h-8" />
            </div>
          </div>
          <div className="rounded-md border border-primary/20 bg-primary/5 p-2.5">
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              <span className="text-primary font-semibold">Formato:</span> Qtd:Valor. Ex: Agua 5:1 aco = voce da 5 aguas por 1 aco. 10:1 cimento = voce da 10 aguas por 1 cimento. Os reports calculam a media na Tendencia.
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
            <p className="text-muted-foreground">Os precos estao no formato <span className="font-mono text-foreground">quantidade:valor</span>. Por exemplo, <span className="font-mono text-foreground">5:1</span> significa que voce da 5 unidades do item e recebe 1 de Aco ($). Ou seja, o primeiro numero e a quantidade do item e o segundo e o valor em moeda.</p>
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
            <p className="text-muted-foreground">A coluna Tendencia mostra a media dos precos reportados pela comunidade para cada item. Quando ha reports, aparece o valor medio em Aco ($) e Cimento seguido do numero de reports entre parenteses. Quando nao ha reports, aparece o grafico sparkline com a variacao dos ultimos 7 dias.</p>
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

function GerenciarItensModal({ isOpen, onClose, onSaved, mergedCategories, overrides: itemOverrides }: { isOpen: boolean; onClose: () => void; onSaved?: () => void; mergedCategories: Category[]; overrides: Array<{ itemId: string; action: string; name?: string; categoryId?: string }> }) {
  const [activeTab, setActiveTab] = useState<"add" | "edit" | "removed">("add");
  const [gerenciarSearch, setGerenciarSearch] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemId, setNewItemId] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("");
  const [newItemImg, setNewItemImg] = useState("");
  const [newItemWikiLink, setNewItemWikiLink] = useState("");
  const [newItemSteel, setNewItemSteel] = useState("?:?");
  const [newItemCement, setNewItemCement] = useState("?:?");
  const [newItemDemand, setNewItemDemand] = useState("medium");
  const [newItemRarity, setNewItemRarity] = useState("common");
  const [newItemNotes, setNewItemNotes] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", img: "", steel: "", cement: "", demand: "", wikiLink: "", notes: "", categoryId: "" });
  const [removedItems, setRemovedItems] = useState<Array<{ id: string; name: string; category: string }>>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const categories = mergedCategories;
  const removeSet = new Set(itemOverrides.filter(o => o.action === "remove").map(o => o.itemId));
  const allItems = useMemo(() => categories.flatMap((c) => c.items.map((i) => ({ ...i, categoryId: c.id, categoryName: c.name }))));

  const slugify = (text: string) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

  useEffect(() => {
    if (newItemName && !newItemId) {
      setNewItemId(slugify(newItemName));
    }
  }, [newItemName, newItemId]);

  const filteredGerenciarItems = useMemo(() => {
    if (!gerenciarSearch) return allItems.slice(0, 100);
    return allItems.filter((i) => i.name.toLowerCase().includes(gerenciarSearch.toLowerCase()) || i.id.includes(gerenciarSearch.toLowerCase())).slice(0, 100);
  }, [gerenciarSearch, allItems]);

  const getAdminPwd = () => sessionStorage.getItem("adminPwd") || "";

  const handleAddItem = async () => {
    if (!newItemName.trim() || !newItemId.trim() || !newItemCategory) {
      toast.error("Preencha nome, ID e categoria!");
      return;
    }
    const exists = allItems.find((i) => i.id === newItemId) || removeSet.has(newItemId);
    if (exists) {
      toast.error(`Item com ID "${newItemId}" ja existe!`);
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": getAdminPwd() },
        body: JSON.stringify({
          action: "add",
          item: {
            itemId: newItemId,
            name: newItemName.trim(),
            categoryId: newItemCategory,
            img: newItemImg || `/items/${newItemId}.png`,
            wikiLink: newItemWikiLink || ``,
            steel: newItemSteel,
            cement: newItemCement,
            rarity: newItemRarity,
            demand: newItemDemand,
            notes: newItemNotes,
          },
        }),
      });
      if (res.ok) {
        toast.success(`Item "${newItemName}" adicionado! (salvo no banco)`);
        setNewItemName("");
        setNewItemId("");
        setNewItemImg("");
        setNewItemWikiLink("");
        setNewItemSteel("?:?");
        setNewItemCement("?:?");
        setNewItemDemand("medium");
        setNewItemRarity("common");
        setNewItemNotes("");
        onSaved?.();
      } else {
        const data = await res.json();
        toast.error(data.error || "Erro ao adicionar item.");
      }
    } catch {
      toast.error("Erro de conexao.");
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (item: typeof allItems[0]) => {
    setEditingId(item.id);
    setEditForm({ name: item.name, img: item.img || `/items/${item.id}.png`, steel: item.steel, cement: item.cement, demand: item.demand, wikiLink: item.wikiLink || "", notes: item.notes, categoryId: item.categoryId });
  };

  const uploadItemImage = async (file: File, itemId: string) => {
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("itemId", itemId);
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "x-admin-password": getAdminPwd() },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao enviar imagem");
      return data.url as string;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!editingId) return;
    try {
      const url = await uploadItemImage(file, editingId);
      setEditForm((current) => ({ ...current, img: url }));
      toast.success("Imagem enviada. Clique em Salvar para aplicar ao item.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao enviar imagem.");
    }
  };

  const handleNewImageUpload = async (file: File) => {
    if (!newItemId.trim()) {
      toast.error("Informe o nome do item para gerar o ID antes de enviar a imagem.");
      return;
    }
    try {
      const url = await uploadItemImage(file, newItemId.trim());
      setNewItemImg(url);
      toast.success("Imagem enviada. Ela será salva junto com o novo item.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao enviar imagem.");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": getAdminPwd() },
        body: JSON.stringify({
          action: "edit",
          item: { itemId: editingId, ...editForm },
        }),
      });
      if (res.ok) {
        toast.success(`Item "${editForm.name}" atualizado!`);
        setEditingId(null);
        onSaved?.();
      } else {
        toast.error("Erro ao salvar.");
      }
    } catch {
      toast.error("Erro de conexao.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = (item: typeof allItems[0]) => {
    if (removedItems.find((r) => r.id === item.id)) return;
    setRemovedItems([...removedItems, { id: item.id, name: item.name, category: item.categoryName }]);
    toast.success(`"${item.name}" marcado para remocao.`);
  };

  const handleRestore = (id: string) => {
    setRemovedItems(removedItems.filter((r) => r.id !== id));
    toast.success("Item restaurado.");
  };

  const handleSaveRemoved = async () => {
    if (removedItems.length === 0) return;
    setIsSaving(true);
    try {
      for (const item of removedItems) {
        await fetch("/api/items", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-admin-password": getAdminPwd() },
          body: JSON.stringify({ action: "remove", item: { itemId: item.id, name: item.name, categoryId: item.category } }),
        });
      }
      toast.success(`${removedItems.length} itens removidos!`);
      setRemovedItems([]);
      onSaved?.();
    } catch {
      toast.error("Erro ao remover.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="rounded-lg border border-primary/20 bg-card w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-sm font-bold text-primary flex items-center gap-2">
            <Settings2 className="w-4 h-4" /> Gerenciar Itens
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-4 pt-2 gap-1">
          {(["add", "edit", "removed"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-2 text-xs font-medium rounded-t-md transition-colors ${activeTab === tab ? "bg-primary/10 text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
              {tab === "add" && <span className="flex items-center gap-1"><PlusCircle className="w-3 h-3" /> Adicionar</span>}
              {tab === "edit" && <span className="flex items-center gap-1"><Pencil className="w-3 h-3" /> Editar/Remover</span>}
              {tab === "removed" && <span className="flex items-center gap-1"><Trash2 className="w-3 h-3" /> Removidos ({removedItems.length})</span>}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* ADD TAB */}
          {activeTab === "add" && (
            <div className="space-y-3">
              <p className="text-[10px] text-muted-foreground">Adicione novos itens a tabela. Eles serao salvos no banco de dados como override.</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-muted-foreground">Nome do Item *</label>
                  <Input value={newItemName} onChange={(e) => { setNewItemName(e.target.value); setNewItemId(""); }} placeholder="Ex: Agua Potavel" className="text-sm mt-1 h-8" />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground">ID (auto) *</label>
                  <Input value={newItemId} onChange={(e) => setNewItemId(e.target.value)} placeholder="agua_potavel" className="text-sm mt-1 h-8 font-mono" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-muted-foreground">Categoria *</label>
                  <select value={newItemCategory} onChange={(e) => setNewItemCategory(e.target.value)} className="w-full text-sm bg-card border border-border rounded-md h-8 px-2 mt-1 text-foreground">
                    <option value="">Selecionar...</option>
                    {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground">Imagem do item</label>
                  <div className="flex items-center gap-2 mt-1">
                    {newItemImg ? <img src={newItemImg} alt="Prévia do novo item" className="w-9 h-9 rounded border border-border object-contain bg-muted/20" /> : <div className="w-9 h-9 rounded border border-dashed border-border flex items-center justify-center"><ImageOff className="w-3.5 h-3.5 text-muted-foreground" /></div>}
                    <label className="flex-1 cursor-pointer text-center text-[10px] py-1.5 rounded border border-border hover:bg-muted/30 text-foreground">
                      {isUploadingImage ? "Enviando..." : "Escolher imagem"}
                      <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" disabled={isUploadingImage} onChange={(e) => { const file = e.target.files?.[0]; if (file) void handleNewImageUpload(file); e.currentTarget.value = ""; }} />
                    </label>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground">Wiki Link</label>
                <Input value={newItemWikiLink} onChange={(e) => setNewItemWikiLink(e.target.value)} placeholder="https://dayr.wiki.gg/wiki/..." className="text-sm mt-1 h-8 font-mono" />
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] text-muted-foreground">Preco Aco</label>
                  <Input value={newItemSteel} onChange={(e) => setNewItemSteel(e.target.value)} placeholder="5:1" className="text-sm mt-1 h-8 font-mono" />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground">Preco Cimento</label>
                  <Input value={newItemCement} onChange={(e) => setNewItemCement(e.target.value)} placeholder="10:1" className="text-sm mt-1 h-8 font-mono" />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground">Raridade</label>
                  <select value={newItemRarity} onChange={(e) => setNewItemRarity(e.target.value)} className="w-full text-sm bg-card border border-border rounded-md h-8 px-1.5 mt-1 text-foreground">
                    <option value="common">Comum</option>
                    <option value="uncommon">Incomum</option>
                    <option value="rare">Raro</option>
                    <option value="legendary">Lendario</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground">Demanda</label>
                  <select value={newItemDemand} onChange={(e) => setNewItemDemand(e.target.value)} className="w-full text-sm bg-card border border-border rounded-md h-8 px-1.5 mt-1 text-foreground">
                    <option value="high">Alta</option>
                    <option value="medium">Media</option>
                    <option value="low">Baixa</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground">Notas</label>
                <Input value={newItemNotes} onChange={(e) => setNewItemNotes(e.target.value)} placeholder="Observacoes sobre o item..." className="text-sm mt-1 h-8" />
              </div>
              <Button onClick={handleAddItem} disabled={isSaving} className="w-full bg-primary text-primary-foreground text-xs h-9 mt-2">
                <PlusCircle className="w-3.5 h-3.5 mr-1" /> {isSaving ? "Salvando..." : "Adicionar Item"}
              </Button>
            </div>
          )}

          {/* EDIT/REMOVE TAB */}
          {activeTab === "edit" && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-3 h-3 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                <Input value={gerenciarSearch} onChange={(e) => setGerenciarSearch(e.target.value)} placeholder="Buscar item para editar ou remover..." className="pl-8 text-sm h-8" />
              </div>
              <div className="space-y-1 max-h-[50vh] overflow-y-auto">
                {filteredGerenciarItems.map((item) => (
                  <div key={item.id} className={`rounded-md border px-3 py-2 transition-colors ${editingId === item.id ? "border-primary/40 bg-primary/5" : "border-border/50 hover:bg-muted/20"}`}>
                    {editingId === item.id ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <ItemIcon itemId={item.id} imgPath={item.img} />
                          <span className="text-xs font-semibold truncate">{item.name}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] text-muted-foreground">Nome</label>
                            <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="text-xs h-7 mt-0.5" />
                            <label className="text-[10px] text-muted-foreground mt-2 block">Imagem do item</label>
                            <div className="flex items-center gap-2 mt-1">
                              {editForm.img ? <img src={editForm.img} alt="Prévia do item" className="w-9 h-9 rounded border border-border object-contain bg-muted/20" /> : <div className="w-9 h-9 rounded border border-dashed border-border" />}
                              <label className="flex-1 cursor-pointer text-center text-[10px] py-1.5 rounded border border-border hover:bg-muted/30 text-foreground">
                                {isUploadingImage ? "Enviando..." : "Escolher imagem"}
                                <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" disabled={isUploadingImage} onChange={(e) => { const file = e.target.files?.[0]; if (file) void handleImageUpload(file); e.currentTarget.value = ""; }} />
                              </label>
                            </div>
                          </div>
                          <div>
                            <label className="text-[9px] text-muted-foreground">Categoria</label>
                            <select value={editForm.categoryId} onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })} className="w-full text-xs bg-card border border-border rounded-md h-7 px-1.5 mt-0.5 text-foreground">
                              {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] text-muted-foreground">Wiki Link</label>
                            <Input value={editForm.wikiLink} onChange={(e) => setEditForm({ ...editForm, wikiLink: e.target.value })} className="text-xs h-7 mt-0.5 font-mono" />
                          </div>
                          <div>
                            <label className="text-[9px] text-muted-foreground">Demanda</label>
                            <select value={editForm.demand} onChange={(e) => setEditForm({ ...editForm, demand: e.target.value })} className="w-full text-xs bg-card border border-border rounded-md h-7 px-1.5 mt-0.5 text-foreground">
                              <option value="high">Alta</option>
                              <option value="medium">Media</option>
                              <option value="low">Baixa</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] text-muted-foreground">Aco</label>
                            <Input value={editForm.steel} onChange={(e) => setEditForm({ ...editForm, steel: e.target.value })} className="text-xs h-7 mt-0.5 font-mono" />
                          </div>
                          <div>
                            <label className="text-[9px] text-muted-foreground">Cimento</label>
                            <Input value={editForm.cement} onChange={(e) => setEditForm({ ...editForm, cement: e.target.value })} className="text-xs h-7 mt-0.5 font-mono" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[9px] text-muted-foreground">Notas</label>
                          <Input value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} className="text-xs h-7 mt-0.5" />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setEditingId(null)} className="flex-1 text-[10px] py-1 rounded border border-border hover:bg-muted/30 text-muted-foreground">Cancelar</button>
                          <button onClick={handleSaveEdit} disabled={isSaving} className="flex-1 text-[10px] py-1 rounded bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-1"><Save className="w-3 h-3" />{isSaving ? "..." : "Salvar"}</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <ItemIcon itemId={item.id} imgPath={item.img} />
                          <span className="text-xs text-foreground truncate">{item.name}</span>
                          <span className="text-[9px] text-muted-foreground shrink-0">{item.categoryName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button onClick={() => startEdit(item)} className="text-[10px] text-yellow-400 hover:text-yellow-300">Editar</button>
                          <button onClick={() => handleRemove(item)} className="text-[10px] text-red-400 hover:text-red-300">Remover</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REMOVED TAB */}
          {activeTab === "removed" && (
            <div className="space-y-3">
              <p className="text-[10px] text-muted-foreground">Itens marcados para remocao nesta sessao.</p>
              {removedItems.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Nenhum item removido.</p>
              ) : (
                <>
                  <div className="space-y-1">
                    {removedItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-md border border-red-500/20 bg-red-500/5 px-3 py-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Trash2 className="w-3 h-3 text-red-400 shrink-0" />
                          <span className="text-xs text-foreground truncate">{item.name}</span>
                          <span className="text-[9px] text-muted-foreground shrink-0">({item.category})</span>
                        </div>
                        <button onClick={() => handleRestore(item.id)} className="text-[10px] text-green-400 hover:text-green-300 flex items-center gap-0.5 shrink-0"><RotateCcw className="w-3 h-3" /> Restaurar</button>
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleSaveRemoved} disabled={isSaving} variant="destructive" className="w-full text-xs h-8">
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> {isSaving ? "Salvando..." : `Confirmar Remocao de ${removedItems.length} itens`}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TabelaTab({ isAdmin: isAdminProp }: { isAdmin: boolean }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<"name" | "steel" | "cement">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showGuia, setShowGuia] = useState(false);
  const [showReportar, setShowReportar] = useState(false);
  const [showGerenciar, setShowGerenciar] = useState(false);
  const [showOnlyMissing, setShowOnlyMissing] = useState(false);
  const [priceReports, setPriceReports] = useState<Array<{ id?: number; itemId: string; itemName?: string; steelQty: number; steelPrice: number; cementQty: number; cementPrice: number; nickname: string; data: string }>>([]);
  const [overrides, setOverrides] = useState<Array<{ itemId: string; name?: string; categoryId?: string; img?: string; wikiLink?: string; steel?: string; cement?: string; rarity?: string; demand?: string; notes?: string; action: string }>>([]);
  const { reportPrice } = useBank();
  const isAdmin = isAdminProp;

  const baseCategories = pricesData.categories as Category[];
  const metadata = pricesData.metadata;

  // Fetch item overrides from DB
  const fetchOverrides = useCallback(async () => {
    try {
      const pwd = sessionStorage.getItem("adminPwd");
      if (!pwd) return;
      const res = await fetch("/api/items", { headers: { "x-admin-password": pwd } });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setOverrides(data);
      }
    } catch { /* silent */ }
  }, []);

  // Merge overrides with static data
  const categories = useMemo(() => {
    const removeSet = new Set(overrides.filter(o => o.action === "remove").map(o => o.itemId));
    const editMap = new Map(overrides.filter(o => o.action === "edit").map(o => [o.itemId, o]));
    const addOverrides = overrides.filter(o => o.action === "add");
    const baseItemIds = new Set(baseCategories.flatMap(c => c.items.map(i => i.id)));
    // Apply edits to existing items
    const editedItems: Array<PriceItem & { _overrideCategoryId?: string }> = [];
    for (const cat of baseCategories) {
      for (const item of cat.items) {
        if (removeSet.has(item.id)) continue;
        const override = editMap.get(item.id);
        if (override) {
          editedItems.push({
            ...item,
            ...(override.name ? { name: override.name } : {}),
            ...(override.img ? { img: override.img } : {}),
            ...(override.wikiLink !== undefined ? { wikiLink: override.wikiLink || undefined } : {}),
            ...(override.steel ? { steel: override.steel } : {}),
            ...(override.cement ? { cement: override.cement } : {}),
            ...(override.rarity ? { rarity: override.rarity } : {}),
            ...(override.demand ? { demand: override.demand } : {}),
            ...(override.notes !== undefined ? { notes: override.notes || "" } : {}),
            _overrideCategoryId: override.categoryId || undefined,
          });
        } else {
          editedItems.push({ ...item });
        }
      }
    }
    // Add new items from overrides that don't exist in base data
    for (const o of addOverrides) {
      if (removeSet.has(o.itemId)) continue;
      if (baseItemIds.has(o.itemId)) continue;
      editedItems.push({
        id: o.itemId,
        name: o.name || o.itemId,
        img: o.img || undefined,
        wikiLink: o.wikiLink || undefined,
        steel: o.steel || "?:?",
        cement: o.cement || "?:?",
        rarity: o.rarity || "common",
        demand: o.demand || "medium",
        notes: o.notes || "",
        _overrideCategoryId: o.categoryId || undefined,
      });
    }
    // Rebuild categories
    const catMap = new Map<string, (PriceItem & { _overrideCategoryId?: string })[]>();
    for (const cat of baseCategories) {
      catMap.set(cat.id, []);
    }
    for (const item of editedItems) {
      const catId = item._overrideCategoryId || baseCategories.find(c => c.items.some(i => i.id === item.id))?.id;
      if (catId && catMap.has(catId)) {
        catMap.get(catId)!.push(item);
      }
    }
    return baseCategories.map(cat => ({
      ...cat,
      items: catMap.get(cat.id) || [],
    }));
  }, [baseCategories, overrides]);

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

  useEffect(() => { fetchReports(); fetchOverrides(); }, [fetchReports, fetchOverrides]);

  const reportMap = useMemo(() => {
    const map: Record<string, { avgSteelQty: number; avgSteelPrice: number; avgCementQty: number; avgCementPrice: number; count: number; reports: typeof priceReports }> = {};
    for (const r of priceReports) {
      if (!map[r.itemId]) map[r.itemId] = { avgSteelQty: 0, avgSteelPrice: 0, avgCementQty: 0, avgCementPrice: 0, count: 0, reports: [] };
      const qty = r.steelQty || 0;
      const price = r.steelPrice || 1;
      const cqty = r.cementQty || 0;
      const cprice = r.cementPrice || 1;
      map[r.itemId].avgSteelQty += qty;
      map[r.itemId].avgSteelPrice += price;
      map[r.itemId].avgCementQty += cqty;
      map[r.itemId].avgCementPrice += cprice;
      map[r.itemId].count++;
      map[r.itemId].reports.push(r);
    }
    for (const key of Object.keys(map)) {
      const m = map[key];
      m.avgSteelQty = Math.round(m.avgSteelQty / m.count);
      m.avgSteelPrice = Math.round(m.avgSteelPrice / m.count);
      m.avgCementQty = Math.round(m.avgCementQty / m.count);
      m.avgCementPrice = Math.round(m.avgCementPrice / m.count);
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

  const handleReport = async (d: { itemId: string; itemName: string; nickname: string; steelQty: number; steelPrice: number; cementQty: number; cementPrice: number }) => {
    try {
      await fetch("/api/banco", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reportPrice",
          itemId: d.itemId,
          itemName: d.itemName,
          nickname: d.nickname,
          steelQty: d.steelQty,
          steelPrice: d.steelPrice,
          cementQty: d.cementQty,
          cementPrice: d.cementPrice,
        }),
      });
    } catch { /* silent */ }
    await fetchReports();
  };

  const categoryColorMap: Record<string, { border: string; bg: string; text: string; glow: string }> = {
    food: { border: "border-l-green-500", bg: "bg-green-500/5", text: "text-green-500", glow: "shadow-green-500/5" },
    resources: { border: "border-l-amber-500", bg: "bg-amber-500/5", text: "text-amber-500", glow: "shadow-amber-500/5" },
    medicine: { border: "border-l-red-500", bg: "bg-red-500/5", text: "text-red-500", glow: "shadow-red-500/5" },
    ammo: { border: "border-l-orange-500", bg: "bg-orange-500/5", text: "text-orange-500", glow: "shadow-orange-500/5" },
    weapons: { border: "border-l-purple-500", bg: "bg-purple-500/5", text: "text-purple-500", glow: "shadow-purple-500/5" },
    tools: { border: "border-l-blue-500", bg: "bg-blue-500/5", text: "text-blue-500", glow: "shadow-blue-500/5" },
  };

  return (
    <div className="space-y-5">
      <AdSlot size="leaderboard" id="tabela-top" isAdmin={isAdmin} className="mb-3" />
      {/* ═══ Header Area ═══ */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-primary tracking-tight flex items-center gap-2.5 pb-1.5">
            Tabela de Precos
            <span className="block h-[2px] flex-1 min-w-[60px] max-w-[140px] rounded-full bg-gradient-to-r from-primary/60 via-primary/20 to-transparent" />
          </h2>
          <p className="text-[10px] text-muted-foreground pl-0.5">{totalAllItems} itens &middot; {totalMissing} sem preco &middot; Fonte: dayr.wiki.gg + comunidade</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setShowReportar(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-green-500/30 text-green-400 bg-green-500/5 hover:bg-green-500/15 shadow-sm shadow-green-500/10 transition-all">
            <MessageSquarePlus className="w-3.5 h-3.5" /> Reportar
          </button>
          {isAdmin && (
            <button onClick={() => setShowGerenciar(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-purple-500/30 text-purple-400 bg-purple-500/5 hover:bg-purple-500/15 shadow-sm shadow-purple-500/10 transition-all">
              <Settings2 className="w-3.5 h-3.5" /> Gerenciar Itens
            </button>
          )}
          <button onClick={() => setShowGuia(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-blue-500/30 text-blue-400 bg-blue-500/5 hover:bg-blue-500/15 shadow-sm shadow-blue-500/10 transition-all">
            <BookOpen className="w-3.5 h-3.5" /> Guia
          </button>
        </div>
      </div>

      {/* ═══ Stat Cards ═══ */}
      <div className="grid grid-cols-3 gap-3">
        <div className="relative overflow-hidden rounded-xl border border-border bg-card p-3.5 shadow-md shadow-black/20">
          <div className="absolute -right-2 -top-2 w-14 h-14 rounded-full bg-green-500/5 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
              <MessageSquarePlus className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Reports</p>
              <p className="text-lg font-bold font-mono text-foreground leading-tight">{priceReports.length}</p>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-border bg-card p-3.5 shadow-md shadow-black/20">
          <div className="absolute -right-2 -top-2 w-14 h-14 rounded-full bg-orange-500/5 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Sem Preco</p>
              <p className="text-lg font-bold font-mono text-foreground leading-tight">{totalMissing}</p>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-border bg-card p-3.5 shadow-md shadow-black/20">
          <div className="absolute -right-2 -top-2 w-14 h-14 rounded-full bg-blue-500/5 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Tendencias</p>
              <p className="text-lg font-bold font-mono text-foreground leading-tight">{Object.keys(priceTrends.trends).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Search & Controls Bar ═══ */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 group">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
          <Input placeholder="Buscar item..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-3 bg-card border-border text-sm h-10 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary/40 shadow-sm shadow-black/10 transition-all" />
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card p-1 shadow-sm shadow-black/10">
          <button onClick={() => setShowOnlyMissing(!showOnlyMissing)} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap h-8 ${showOnlyMissing ? "bg-orange-500/20 text-orange-400 shadow-sm shadow-orange-500/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"}`}>
            <AlertCircle className="w-3.5 h-3.5" /> Sem Preco
          </button>
          <div className="w-px h-5 bg-border" />
          <button onClick={expandAll} className="px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all h-8">Abrir</button>
          <button onClick={collapseAll} className="px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all h-8">Fechar</button>
        </div>
      </div>

      {/* ═══ Category Filter Bar ═══ */}
      <div className="overflow-x-auto scrollbar-thin -mx-1 px-1">
        <div className="flex gap-2 min-w-max">
          <button onClick={() => setActiveCategory(null)} className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap border-l-[3px] ${activeCategory === null ? "bg-primary/15 text-primary border-primary/30 border-l-primary shadow-sm shadow-primary/10" : "bg-card text-muted-foreground border-border border-l-border hover:text-foreground hover:bg-muted/30"}`}>
            Todos
            <span className="ml-1.5 text-[10px] opacity-70">{totalAllItems}</span>
          </button>
          {categories.map((cat) => {
            const cc = categoryColorMap[cat.id] || categoryColorMap.resources;
            const isActive = activeCategory === cat.id;
            return (
              <button key={cat.id} onClick={() => setActiveCategory(isActive ? null : cat.id)} className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap border-l-[3px] ${isActive ? `${cc.bg} ${cc.text} border-l-current shadow-sm ${cc.glow}` : "bg-card text-muted-foreground border-border border-l-border hover:text-foreground hover:bg-muted/30"}`}>
                {cat.name}
                <span className="ml-1.5 text-[10px] opacity-70">{cat.items.length}</span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground pl-0.5">
        {totalItems} {totalItems === 1 ? "item" : "itens"}{search ? ` para "${search}"` : ""}{showOnlyMissing ? " (sem preco)" : ""}
      </p>

      {/* ═══ Table ═══ */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-lg shadow-black/20">
        {/* Table Header - Sticky */}
        <div className="sticky top-0 z-10 grid grid-cols-12 gap-1 px-4 py-2.5 border-b border-border bg-muted/60 backdrop-blur-md text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          <div className="col-span-1">Icone</div>
          <button onClick={() => toggleSort("name")} className="col-span-3 flex items-center gap-1 hover:text-foreground transition-colors text-left">Item <ArrowUpDown className="w-3 h-3" /></button>
          <button onClick={() => toggleSort("steel")} className="col-span-2 flex items-center gap-1 hover:text-foreground transition-colors text-left">Aco ($) <ArrowUpDown className="w-3 h-3" /></button>
          <button onClick={() => toggleSort("cement")} className="col-span-2 flex items-center gap-1 hover:text-foreground transition-colors text-left">Cimento <ArrowUpDown className="w-3 h-3" /></button>
          <div className="col-span-1 hidden sm:flex justify-center">Dem.</div>
          <div className="col-span-2 hidden sm:flex justify-center">Tendencia</div>
          <div className="col-span-1 hidden md:flex justify-center">Rep.</div>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-muted-foreground">Nenhum item encontrado.</p>
          </div>
        ) : (
          filteredCategories.map((cat) => {
            const cc = categoryColorMap[cat.id] || categoryColorMap.resources;
            return (
              <div key={cat.id}>
                {/* Category Header */}
                <button onClick={() => toggleCategory(cat.id)} className={`w-full px-4 py-3 border-b border-border ${cc.bg} hover:brightness-125 transition-all text-left border-l-[3px] ${cc.border}`}>
                  <div className="flex items-center gap-2.5">
                    {expandedCategories.has(cat.id) ? <ChevronDown className="w-3.5 h-3.5 text-primary" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                    <span className="text-sm font-bold text-foreground">{cat.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded">{cat.items.length}</span>
                  </div>
                </button>
                {expandedCategories.has(cat.id) && (
                  <div>
                    {cat.items.map((item, idx) => {
                      const missing = isPriceUnknown(item.steel);
                      const rep = reportMap[item.id];
                      return (
                        <div key={item.id} className={`grid grid-cols-12 gap-1 px-4 py-2.5 border-b border-border/40 transition-all text-xs border-l-[3px] border-l-transparent hover:border-l-primary/40 hover:bg-muted/15 ${idx % 2 === 0 ? "" : "bg-muted/[0.03]"} ${missing ? "opacity-60" : ""}`}>
                          <div className="col-span-1 text-center flex items-center justify-center"><ItemIcon itemId={item.id} imgPath={item.img} /></div>
                          <div className="col-span-3 min-w-0">
                            {item.wikiLink ? (
                              <a href={item.wikiLink} target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground hover:text-primary transition-colors truncate block" title={"Ver no Wiki: " + item.name}>
                                {item.name} <ExternalLink className="w-2.5 h-2.5 inline ml-1 opacity-40" />
                              </a>
                            ) : (
                              <p className="font-semibold text-foreground truncate">{item.name}</p>
                            )}
                            {item.notes && item.notes !== "Preco pendente - reporte para ajudar!" && <p className="text-[10px] text-muted-foreground truncate hidden sm:block mt-0.5">{item.notes}</p>}
                            {missing && <p className="text-[9px] text-orange-400 truncate mt-0.5">Preco pendente</p>}
                          </div>
                          <div className={`col-span-2 font-mono font-bold flex items-center ${missing ? "text-orange-400/60" : getSteelColor(item.demand)}`}>{item.steel}</div>
                          <div className={`col-span-2 font-mono font-bold flex items-center ${missing ? "text-orange-400/60" : "text-foreground/80"}`}>{item.cement}</div>
                          <div className="col-span-1 hidden sm:flex justify-center items-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${demandColors[item.demand] || demandColors.medium}`}>{demandLabels[item.demand] || "?"}</span>
                          </div>
                          <div className="col-span-2 hidden sm:flex justify-center items-center">
                            {rep ? (
                              <div className="flex items-center gap-1.5 text-[10px] font-mono">
                                <span className="font-bold text-green-400">{rep.avgSteelQty}:{rep.avgSteelPrice}$</span>
                                <span className="text-muted-foreground">/</span>
                                <span className="font-bold text-foreground/80">{rep.avgCementQty}:{rep.avgCementPrice}c</span>
                                <span className="text-muted-foreground">({rep.count})</span>
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
            );
          })
        )}
      </div>

      {/* ═══ Reports Section ═══ */}
      <AdSlot size="banner" id="tabela-mid" isAdmin={isAdmin} className="my-3" />
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-lg shadow-black/20">
        <div className="px-4 py-3 border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-primary" /> Ultimos Reports da Comunidade
          </h3>
        </div>
        <div className="p-3">
          {priceReports.length === 0 ? (
            <p className="text-[11px] text-muted-foreground py-3 text-center">Nenhum report ainda. Seja o primeiro a reportar precos!</p>
          ) : (
            <div className="space-y-1 max-h-52 overflow-y-auto">
              {priceReports.slice(0, 20).map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/20 transition-colors text-[11px]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-primary font-semibold shrink-0">{r.nickname}</span>
                    <span className="text-muted-foreground truncate">reportou {r.itemName}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono font-semibold text-green-400">{r.steelQty}:{r.steelPrice}$</span>
                    <span className="font-mono font-semibold text-foreground/80">{r.cementQty}:{r.cementPrice}c</span>
                    <span className="font-mono text-muted-foreground text-[10px]">{new Date(r.data).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <ReportarModal isOpen={showReportar} onClose={() => setShowReportar(false)} items={allItems} onReport={handleReport} />
      <GuiaModal isOpen={showGuia} onClose={() => setShowGuia(false)} />
      {isAdmin && <GerenciarItensModal isOpen={showGerenciar} onClose={() => setShowGerenciar(false)} onSaved={fetchOverrides} mergedCategories={categories} overrides={overrides} />}
      <AdSlot size="banner" id="tabela-bottom" isAdmin={isAdmin} className="my-3" />
    </div>
  );
}
