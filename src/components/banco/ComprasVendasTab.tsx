"use client";
import { useState } from "react";
import { useBank } from "@/lib/useBank";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ShoppingCart, Plus, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { getDateLocale } from "./TranslationPopup";

export default function ComprasVendasTab() {
  const { comprasVendas, addCompraVenda } = useBank();
  const [tipo, setTipo] = useState<"compra" | "venda">("compra");
  const [player, setPlayer] = useState("");
  const [item, setItem] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [itemPagamento, setItemPagamento] = useState("");
  const [valor, setValor] = useState("");
  const [observacao, setObservacao] = useState("");

  const handleAdd = () => {
    if (!player || !item || !quantidade || !itemPagamento || !valor) { toast.error("Preencha todos os campos."); return; }
    addCompraVenda({ tipo, player, item, quantidade: parseInt(quantidade), itemPagamento: itemPagamento.trim(), valor: parseFloat(valor), observacao: observacao || undefined });
    toast.success(`${tipo === "compra" ? "Compra" : "Venda"} registrada!`);
    setPlayer(""); setItem(""); setQuantidade(""); setItemPagamento(""); setValor(""); setObservacao("");
  };

  const compras = comprasVendas.filter((cv) => cv.tipo === "compra");
  const vendas = comprasVendas.filter((cv) => cv.tipo === "venda");

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-primary">🛒 Compras e Vendas</h2>
      <div className="rounded-md border border-border bg-card p-4">
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Plus className="w-4 h-4 text-primary" /> Registrar</h3>
        <div className={`mb-3 p-2 rounded-md text-xs border ${tipo === "compra" ? "bg-red-500/10 border-red-400/20 text-red-300" : "bg-green-500/10 border-green-400/20 text-green-300"}`}>
          {tipo === "compra" ? <span>💀 <strong>COMPRA:</strong> Você paga → Recebe do player</span> : <span>💰 <strong>VENDA:</strong> Você entrega → Recebe do player</span>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
          <div><Label className="text-xs text-muted-foreground">Tipo</Label><Select value={tipo} onValueChange={(v) => setTipo(v as "compra" | "venda")}><SelectTrigger className="text-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="compra">🔴 Compra</SelectItem><SelectItem value="venda">🟢 Venda</SelectItem></SelectContent></Select></div>
          <div><Label className="text-xs text-muted-foreground">Player</Label><Input placeholder="Nome" value={player} onChange={(e) => setPlayer(e.target.value)} className="text-sm" /></div>
          <div><Label className="text-xs text-muted-foreground">Item</Label><Input placeholder="Item" value={item} onChange={(e) => setItem(e.target.value)} className="text-sm" /></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div><Label className="text-xs text-muted-foreground">Quantidade</Label><Input type="number" placeholder="1000" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} className="text-sm font-mono" /></div>
          <div><Label className="text-xs text-muted-foreground">Item Pagamento</Label><Input placeholder="Ex: Moeda" value={itemPagamento} onChange={(e) => setItemPagamento(e.target.value)} className="text-sm" /></div>
          <div><Label className="text-xs text-muted-foreground">Qtd Pagamento</Label><Input type="number" placeholder="5000" value={valor} onChange={(e) => setValor(e.target.value)} className="text-sm font-mono" /></div>
          <div className="sm:col-span-2"><Label className="text-xs text-muted-foreground">Observação</Label><Input placeholder="Opcional" value={observacao} onChange={(e) => setObservacao(e.target.value)} className="text-sm" /></div>
        </div>
        <div className="mt-3"><Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground">Registrar {tipo === "compra" ? "Compra" : "Venda"}</Button></div>
      </div>
      {compras.length > 0 && (<div><h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2"><ArrowDownCircle className="w-4 h-4 text-red-400" /> Compras ({compras.length})</h3><div className="rounded-md border border-border bg-card overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-border bg-accent/50"><th className="text-left px-3 py-2 text-xs font-bold text-muted-foreground">Data</th><th className="text-left px-3 py-2 text-xs font-bold text-muted-foreground">Player</th><th className="text-left px-3 py-2 text-xs font-bold text-muted-foreground">Entra</th><th className="text-center px-3 py-2 text-xs font-bold text-muted-foreground">Qtd</th><th className="text-center px-3 py-2 text-xs font-bold text-muted-foreground">Paga</th><th className="text-left px-3 py-2 text-xs font-bold text-muted-foreground">Obs</th></tr></thead><tbody>{compras.map((cv) => (<tr key={cv.id} className="border-b border-border/50 hover:bg-accent/30"><td className="px-3 py-2 text-xs text-muted-foreground">{new Date(cv.data).toLocaleDateString(getDateLocale())}</td><td className="px-3 py-2 text-foreground">{cv.player}</td><td className="px-3 py-2 text-green-400 font-mono">{cv.item}</td><td className="px-3 py-2 text-center font-mono text-green-400">+{cv.quantidade}</td><td className="px-3 py-2 text-center font-mono text-red-400">-{cv.valor}</td><td className="px-3 py-2 text-xs text-muted-foreground">{cv.observacao || "-"}</td></tr>))}</tbody></table></div></div>)}
      {vendas.length > 0 && (<div><h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2"><ArrowUpCircle className="w-4 h-4 text-green-400" /> Vendas ({vendas.length})</h3><div className="rounded-md border border-border bg-card overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-border bg-accent/50"><th className="text-left px-3 py-2 text-xs font-bold text-muted-foreground">Data</th><th className="text-left px-3 py-2 text-xs font-bold text-muted-foreground">Player</th><th className="text-left px-3 py-2 text-xs font-bold text-muted-foreground">Sai</th><th className="text-center px-3 py-2 text-xs font-bold text-muted-foreground">Qtd</th><th className="text-center px-3 py-2 text-xs font-bold text-muted-foreground">Recebe</th><th className="text-left px-3 py-2 text-xs font-bold text-muted-foreground">Obs</th></tr></thead><tbody>{vendas.map((cv) => (<tr key={cv.id} className="border-b border-border/50 hover:bg-accent/30"><td className="px-3 py-2 text-xs text-muted-foreground">{new Date(cv.data).toLocaleDateString(getDateLocale())}</td><td className="px-3 py-2 text-foreground">{cv.player}</td><td className="px-3 py-2 text-red-400 font-mono">{cv.item}</td><td className="px-3 py-2 text-center font-mono text-red-400">-{cv.quantidade}</td><td className="px-3 py-2 text-center font-mono text-green-400">+{cv.valor}</td><td className="px-3 py-2 text-xs text-muted-foreground">{cv.observacao || "-"}</td></tr>))}</tbody></table></div></div>)}
      {compras.length === 0 && vendas.length === 0 && (<div className="rounded-md border border-border bg-card p-6 text-center text-muted-foreground text-sm">Nenhuma compra ou venda.</div>)}
    </div>
  );
}