/**
 * Caixa do Banco - Registro manual de entradas e saídas
 * CORREÇÃO: Registro manual agora tem campo "Item de Pagamento" para informar o que entra/sai
 * Quando é Entrada: informa o item que ENTRA + o item usado para pagar (saída)
 * Quando é Saída: informa o item que SAI + o item recebido em troca (entrada)
 */
import { useBank } from "@/contexts/BankContext";
import { useCanEdit } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { toast } from "sonner";
import { Plus, ArrowDownCircle, ArrowUpCircle, Search, Package, AlertTriangle, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Label } from "@/components/ui/label";

export default function Caixa() {
  const { caixa, inventory, addCaixaManual, resetBanco, isLoading } = useBank();
  const canEdit = useCanEdit();
  const [filtro, setFiltro] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<"todos" | "entrada" | "saida">("todos");

  // Form para entrada manual - COM ITEM DE PAGAMENTO
  const [descManual, setDescManual] = useState("");
  const [itemManual, setItemManual] = useState("");
  const [qtdManual, setQtdManual] = useState("");
  const [itemPagamentoManual, setItemPagamentoManual] = useState("");
  const [qtdPagamentoManual, setQtdPagamentoManual] = useState("");
  const [tipoManual, setTipoManual] = useState<"entrada" | "saida">("entrada");

  const handleManualEntry = () => {
    if (!descManual || !itemManual || !qtdManual) {
      toast.error("Preencha os campos obrigatórios.");
      return;
    }

    // Registro principal
    addCaixaManual({
      tipo: tipoManual,
      descricao: descManual,
      item: itemManual,
      quantidade: parseInt(qtdManual),
      valor: parseInt(qtdManual),
      origem: "Registro Manual",
    });

    // Se informou item de pagamento, registrar a troca também
    if (itemPagamentoManual.trim() && qtdPagamentoManual) {
      addCaixaManual({
        tipo: tipoManual === "entrada" ? "saida" : "entrada",
        descricao: `${tipoManual === "entrada" ? "PAGO COM" : "RECEBIDO EM"} ${itemPagamentoManual}`,
        item: itemPagamentoManual.trim(),
        quantidade: parseInt(qtdPagamentoManual),
        valor: parseInt(qtdPagamentoManual),
        origem: "Registro Manual",
      });
    }

    toast.success("Registro manual adicionado ao caixa!");
    setDescManual("");
    setItemManual("");
    setQtdManual("");
    setItemPagamentoManual("");
    setQtdPagamentoManual("");
  };

  const caixaFiltrado = caixa
    .filter((c) => tipoFiltro === "todos" || c.tipo === tipoFiltro)
    .filter((c) =>
      filtro === "" ||
      c.descricao.toLowerCase().includes(filtro.toLowerCase()) ||
      c.item.toLowerCase().includes(filtro.toLowerCase()) ||
      c.origem.toLowerCase().includes(filtro.toLowerCase())
    );

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Carregando caixa...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-primary">💰 Caixa do Banco</h2>

      {/* Registro Manual COM ITEM DE PAGAMENTO - apenas admin */}
      {canEdit && (
      <div className="rounded-md border border-border bg-card p-4">
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" /> Registro Manual
        </h3>

        {/* Legenda dinâmica */}
        <div className={`mb-3 p-2 rounded-md text-xs border ${tipoManual === "entrada" ? "bg-green-500/10 border-green-400/20 text-green-300" : "bg-red-500/10 border-red-400/20 text-red-300"}`}>
          {tipoManual === "entrada" ? (
            <span>📦 <strong>ENTRADA:</strong> Informe o item que ENTRA no banco e com qual item você PAGOU (saída)</span>
          ) : (
            <span>📤 <strong>SAÍDA:</strong> Informe o item que SAI do banco e o que RECEBEU em troca (entrada)</span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
          <div>
            <Label className="text-xs text-muted-foreground">Tipo</Label>
            <div className="flex gap-2 mt-1">
              <Button size="sm" variant={tipoManual === "entrada" ? "default" : "outline"} onClick={() => setTipoManual("entrada")} className={`text-xs flex-1 ${tipoManual === "entrada" ? "bg-green-600 hover:bg-green-700" : ""}`}>📦 Entrada</Button>
              <Button size="sm" variant={tipoManual === "saida" ? "default" : "outline"} onClick={() => setTipoManual("saida")} className={`text-xs flex-1 ${tipoManual === "saida" ? "bg-red-600 hover:bg-red-700" : ""}`}>📤 Saída</Button>
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Descrição</Label>
            <Input placeholder="Ex: Compra de estoque" value={descManual} onChange={(e) => setDescManual(e.target.value)} className="text-sm" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">
              {tipoManual === "entrada" ? "📦 Item que ENTRA" : "📤 Item que SAI"}
            </Label>
            <Input placeholder={tipoManual === "entrada" ? "Ex: Carne Salgada" : "Ex: Moeda Amaldiçoada"} value={itemManual} onChange={(e) => setItemManual(e.target.value)} className="text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">
              {tipoManual === "entrada" ? "Quantidade que ENTRA" : "Quantidade que SAI"}
            </Label>
            <Input type="number" placeholder="1000" value={qtdManual} onChange={(e) => setQtdManual(e.target.value)} className="text-sm font-mono" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">
              {tipoManual === "entrada" ? "💀 Com qual item PAGOU? (opcional)" : "💰 O que RECEBEU em troca? (opcional)"}
            </Label>
            <Input placeholder={tipoManual === "entrada" ? "Ex: Moeda Amaldiçoada" : "Ex: Carne Salgada"} value={itemPagamentoManual} onChange={(e) => setItemPagamentoManual(e.target.value)} className="text-sm" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">
              {tipoManual === "entrada" ? "Quantidade de Pagamento" : "Quantidade Recebida"}
            </Label>
            <Input type="number" placeholder="5000" value={qtdPagamentoManual} onChange={(e) => setQtdPagamentoManual(e.target.value)} className="text-sm font-mono" />
          </div>
          <div className="flex items-end">
            <Button onClick={handleManualEntry} className="bg-primary hover:bg-primary/90 text-primary-foreground w-full">Registrar</Button>
          </div>
        </div>
      </div>
      )}

      {/* Filtros do Caixa */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar no caixa..." value={filtro} onChange={(e) => setFiltro(e.target.value)} className="text-sm" />
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant={tipoFiltro === "todos" ? "default" : "outline"} onClick={() => setTipoFiltro("todos")} className="text-xs">Todos</Button>
          <Button size="sm" variant={tipoFiltro === "entrada" ? "default" : "outline"} onClick={() => setTipoFiltro("entrada")} className="text-xs">Entrada</Button>
          <Button size="sm" variant={tipoFiltro === "saida" ? "default" : "outline"} onClick={() => setTipoFiltro("saida")} className="text-xs">Saída</Button>
        </div>
      </div>

      {/* Tabela do Caixa */}
      {caixaFiltrado.length === 0 ? (
        <div className="rounded-md border border-border bg-card p-6 text-center text-muted-foreground text-sm">
          Nenhum registro no caixa ainda. Faça empréstimos, trocas, compras ou vendas para ver os registros aqui.
        </div>
      ) : (
        <div className="rounded-md border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-accent/50">
                  <th className="text-left px-3 py-2 text-xs font-bold text-muted-foreground">Tipo</th>
                  <th className="text-left px-3 py-2 text-xs font-bold text-muted-foreground">Descrição</th>
                  <th className="text-left px-3 py-2 text-xs font-bold text-muted-foreground">Item</th>
                  <th className="text-center px-3 py-2 text-xs font-bold text-muted-foreground">Qtd</th>
                  <th className="text-center px-3 py-2 text-xs font-bold text-muted-foreground">Valor</th>
                  <th className="text-left px-3 py-2 text-xs font-bold text-muted-foreground">Origem</th>
                  <th className="text-right px-3 py-2 text-xs font-bold text-muted-foreground">Data</th>
                </tr>
              </thead>
              <tbody>
                {caixaFiltrado.slice().reverse().map((c) => (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-accent/30">
                    <td className="px-3 py-2">
                      {c.tipo === "entrada" ? (
                        <ArrowDownCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <ArrowUpCircle className="w-4 h-4 text-red-400" />
                      )}
                    </td>
                    <td className="px-3 py-2 text-foreground text-xs">{c.descricao}</td>
                    <td className="px-3 py-2 text-foreground text-xs font-mono">{c.item}</td>
                    <td className={`px-3 py-2 text-center font-mono text-xs ${c.tipo === "entrada" ? "text-green-400" : "text-red-400"}`}>
                      {c.tipo === "entrada" ? "+" : "-"}{c.quantidade}
                    </td>
                    <td className="px-3 py-2 text-center font-mono text-xs">
                      {c.valor ? (
                        <span className={c.tipo === "entrada" ? "text-green-400" : "text-red-400"}>
                          {c.tipo === "entrada" ? "+" : "-"}{c.valor}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{c.origem}</td>
                    <td className="px-3 py-2 text-right text-xs text-muted-foreground">
                      {new Date(c.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ESTOQUE */}
      <div className="border-t border-border pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-primary flex items-center gap-2">
            <Package className="w-5 h-5" /> Estoque Atual
          </h3>
          {canEdit && (
            <Button variant="outline" size="sm" onClick={() => { if (window.confirm("Resetar TODO o banco? Esta ação não pode ser desfeita!")) resetBanco(); }} className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300">
              <RefreshCw className="w-4 h-4 mr-2" /> Resetar Tudo
            </Button>
          )}
        </div>

        {(() => {
          const itens = Object.entries(inventory).filter(([_, qtd]) => qtd !== 0).sort(([, a], [, b]) => b - a);
          if (itens.length === 0) {
            return <div className="rounded-md border border-dashed border-border bg-card p-8 text-center text-muted-foreground text-sm">O estoque está vazio. Registre entradas no caixa para ver os itens aqui.</div>;
          }
          return (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {itens.map(([nome, qtd]) => (
                <div key={nome} className="rounded-md border border-border bg-card p-3">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{nome.length > 20 ? nome.substring(0, 20) + "..." : nome}</span>
                    {qtd > 0 && qtd < 100 && (
                      <span className="text-[10px] text-yellow-500 font-bold bg-yellow-500/10 px-1 py-0.5 rounded">
                        <AlertTriangle className="w-2.5 h-2.5 inline" /> BAIXO
                      </span>
                    )}
                  </div>
                  <span className={`text-lg font-mono font-bold ${qtd > 0 ? "text-green-400" : "text-red-400"}`}>
                    {qtd > 0 ? "+" : ""}{qtd.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Registros automáticos: empréstimos, pagamentos, trocas, compras, vendas e doações são registrados automaticamente no caixa. Todos os dados salvam na nuvem automaticamente.
      </p>
    </div>
  );
}
