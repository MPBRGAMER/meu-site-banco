/**
 * Compras e Vendas - Registro do que o banco compra e vende
 * CORREÇÃO: Agora inclui campo "Item de Pagamento" para informar com qual item se paga/recebe
 * COMPRA: Banco paga com "Item de Pagamento" → Recebe o "Item" do player
 * VENDA: Banco entrega o "Item" → Recebe "Item de Pagamento" do player
 */
import { useState } from "react";
import { useBank } from "@/contexts/BankContext";
import { useCanEdit } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ShoppingCart, Plus, ArrowUpCircle, ArrowDownCircle, ArrowRight } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function ComprasVendas() {
  const { comprasVendas, addCompraVenda } = useBank();
  const canEdit = useCanEdit();
  const [tipo, setTipo] = useState<"compra" | "venda">("compra");
  const [player, setPlayer] = useState("");
  const [item, setItem] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [itemPagamento, setItemPagamento] = useState("");
  const [valor, setValor] = useState("");
  const [observacao, setObservacao] = useState("");

  const handleAdd = () => {
    if (!player || !item || !quantidade || !itemPagamento || !valor) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    addCompraVenda({
      tipo,
      player,
      item,
      quantidade: parseInt(quantidade),
      itemPagamento: itemPagamento.trim() || undefined,
      valor: parseFloat(valor),
      observacao: observacao || undefined,
    });

    toast.success(
      `${tipo === "compra" ? "Compra" : "Venda"} de ${quantidade}x ${item} registrada!`
    );
    setPlayer("");
    setItem("");
    setQuantidade("");
    setItemPagamento("");
    setValor("");
    setObservacao("");
  };

  const compras = comprasVendas.filter((cv) => cv.tipo === "compra");
  const vendas = comprasVendas.filter((cv) => cv.tipo === "venda");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-primary">🛒 Compras e Vendas</h2>
      </div>

      {/* Form - apenas admin */}
      {canEdit && (
      <div className="rounded-md border border-border bg-card p-4">
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" /> Registrar Compra ou Venda
        </h3>
        
        {/* Legenda dinâmica */}
        <div className={`mb-3 p-2 rounded-md text-xs border ${tipo === "compra" ? "bg-red-500/10 border-red-400/20 text-red-300" : "bg-green-500/10 border-green-400/20 text-green-300"}`}>
          {tipo === "compra" ? (
            <span>💀 <strong>COMPRA:</strong> Você paga com <strong>{itemPagamento || "???"}</strong> → Recebe <strong>{item || "???"}</strong> do player</span>
          ) : (
            <span>💰 <strong>VENDA:</strong> Você entrega <strong>{item || "???"}</strong> → Recebe <strong>{itemPagamento || "???"}</strong> do player</span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
          <div>
            <Label className="text-xs text-muted-foreground">Tipo</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as "compra" | "venda")}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compra">🔴 Compra</SelectItem>
                <SelectItem value="venda">🟢 Venda</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Player</Label>
            <Input placeholder="Nome do player" value={player} onChange={(e) => setPlayer(e.target.value)} className="text-sm" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">
              {tipo === "compra" ? "📦 Item que ENTRA (que você compra)" : "📦 Item que SAI (que você vende)"}
            </Label>
            <Input placeholder={tipo === "compra" ? "Ex: Carne Salgada" : "Ex: Moeda Amaldiçoada"} value={item} onChange={(e) => setItem(e.target.value)} className="text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Quantidade</Label>
            <Input type="number" placeholder="1000" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} className="text-sm font-mono" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">
              {tipo === "compra" ? "💀 Com qual item você PAGA?" : "💰 Com qual item o player PAGA?"}
            </Label>
            <Input placeholder={tipo === "compra" ? "Ex: Moeda Amaldiçoada" : "Ex: Carne Salgada"} value={itemPagamento} onChange={(e) => setItemPagamento(e.target.value)} className="text-sm" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Quantidade de Pagamento</Label>
            <Input type="number" placeholder="5000" value={valor} onChange={(e) => setValor(e.target.value)} className="text-sm font-mono" />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs text-muted-foreground">Observação (opcional)</Label>
            <Input
              placeholder="Ex: Negociação especial, desconto, etc."
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              className="text-sm mt-1"
            />
          </div>
        </div>

        <div className="mt-3">
          <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Registrar {tipo === "compra" ? "Compra" : "Venda"}
          </Button>
        </div>
      </div>
      )}

      {/* Compras */}
      {compras.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
            <ArrowDownCircle className="w-4 h-4 text-red-400" /> Compras ({compras.length})
          </h3>
          <p className="text-xs text-muted-foreground mb-2">
            💀 Sai <strong>item de pagamento</strong> → 📦 Entra <strong>item comprado</strong>
          </p>
          <div className="rounded-md border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-accent/50">
                    <th className="text-left px-3 py-2 text-xs font-bold text-muted-foreground">Data</th>
                    <th className="text-left px-3 py-2 text-xs font-bold text-muted-foreground">Player</th>
                    <th className="text-left px-3 py-2 text-xs font-bold text-muted-foreground">📦 Entra (compra)</th>
                    <th className="text-center px-3 py-2 text-xs font-bold text-muted-foreground">Qtd</th>
                    <th className="text-center px-3 py-2 text-xs font-bold text-muted-foreground">💀 Paga com</th>
                    <th className="text-center px-3 py-2 text-xs font-bold text-muted-foreground">Qtd Paga</th>
                    <th className="text-left px-3 py-2 text-xs font-bold text-muted-foreground">Obs</th>
                  </tr>
                </thead>
                <tbody>
                  {compras.slice().reverse().map((cv) => (
                    <tr key={cv.id} className="border-b border-border/50 hover:bg-accent/30">
                      <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(cv.data).toLocaleDateString("pt-BR")}</td>
                      <td className="px-3 py-2 text-foreground">{cv.player}</td>
                      <td className="px-3 py-2 text-green-400 font-mono">{cv.item}</td>
                      <td className="px-3 py-2 text-center font-mono text-green-400">+{cv.quantidade}</td>
                      <td className="px-3 py-2 text-red-400 font-mono">{cv.itemPagamento || "-"}</td>
                      <td className="px-3 py-2 text-center font-mono text-red-400">-{cv.valor}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{cv.observacao || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Vendas */}
      {vendas.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
            <ArrowUpCircle className="w-4 h-4 text-green-400" /> Vendas ({vendas.length})
          </h3>
          <p className="text-xs text-muted-foreground mb-2">
            📦 Sai <strong>item vendido</strong> → 💰 Entra <strong>item de pagamento</strong>
          </p>
          <div className="rounded-md border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-accent/50">
                    <th className="text-left px-3 py-2 text-xs font-bold text-muted-foreground">Data</th>
                    <th className="text-left px-3 py-2 text-xs font-bold text-muted-foreground">Player</th>
                    <th className="text-left px-3 py-2 text-xs font-bold text-muted-foreground">📦 Sai (venda)</th>
                    <th className="text-center px-3 py-2 text-xs font-bold text-muted-foreground">Qtd</th>
                    <th className="text-center px-3 py-2 text-xs font-bold text-muted-foreground">💰 Recebe</th>
                    <th className="text-center px-3 py-2 text-xs font-bold text-muted-foreground">Qtd Recebe</th>
                    <th className="text-left px-3 py-2 text-xs font-bold text-muted-foreground">Obs</th>
                  </tr>
                </thead>
                <tbody>
                  {vendas.slice().reverse().map((cv) => (
                    <tr key={cv.id} className="border-b border-border/50 hover:bg-accent/30">
                      <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(cv.data).toLocaleDateString("pt-BR")}</td>
                      <td className="px-3 py-2 text-foreground">{cv.player}</td>
                      <td className="px-3 py-2 text-red-400 font-mono">{cv.item}</td>
                      <td className="px-3 py-2 text-center font-mono text-red-400">-{cv.quantidade}</td>
                      <td className="px-3 py-2 text-green-400 font-mono">{cv.itemPagamento || "-"}</td>
                      <td className="px-3 py-2 text-center font-mono text-green-400">+{cv.valor}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{cv.observacao || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {compras.length === 0 && vendas.length === 0 && (
        <div className="rounded-md border border-border bg-card p-6 text-center text-muted-foreground text-sm">
          Nenhuma compra ou venda registrada ainda.
        </div>
      )}
    </div>
  );
}
