"use client";
import { useBank } from "@/lib/useBank";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, ArrowDownCircle, ArrowUpCircle, Search, Package, AlertTriangle, RefreshCw, Gavel, Dices, BookImage, ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { getDateLocale } from "./TranslationPopup";

interface FigurinhaForSale {
  id: string;
  nome: string;
  imageData: string;
  preco: number;
  _count?: { codigos: number };
}

export default function CaixaTab() {
  const { caixa, inventory, addCaixaManual, resetBanco, isLoading } = useBank();
  const [filtro, setFiltro] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<"todos" | "entrada" | "saida">("todos");
  const [descManual, setDescManual] = useState("");
  const [itemManual, setItemManual] = useState("");
  const [qtdManual, setQtdManual] = useState("");
  const [itemPagManual, setItemPagManual] = useState("");
  const [qtdPagManual, setQtdPagManual] = useState("");
  const [tipoManual, setTipoManual] = useState<"entrada" | "saida">("entrada");
  const [leilaoItem, setLeilaoItem] = useState("");
  const [leilaoQtd, setLeilaoQtd] = useState("");
  const [sorteioItem, setSorteioItem] = useState("");
  const [sorteioQtd, setSorteioQtd] = useState("");
  const [sorteioGanhador, setSorteioGanhador] = useState("");

  // Figurinha sales
  const [figurinhas, setFigurinhas] = useState<FigurinhaForSale[]>([]);
  const [showFigSales, setShowFigSales] = useState(false);
  const [figSaleId, setFigSaleId] = useState("");
  const [figSaleQty, setFigSaleQty] = useState("1");
  const [figSaleValor, setFigSaleValor] = useState("");
  const [figSaleComprador, setFigSaleComprador] = useState("");

  useEffect(() => {
    fetch("/api/figurinhas?action=figurinhas")
      .then(res => res.ok ? res.json() : [])
      .then(data => setFigurinhas(data))
      .catch(() => {});
  }, []);

  const handleManual = () => {
    if (!descManual || !itemManual || !qtdManual) { toast.error("Preencha os obrigatórios."); return; }
    addCaixaManual({ tipo: tipoManual, descricao: descManual, item: itemManual, quantidade: parseInt(qtdManual), valor: parseInt(qtdManual), origem: "Manual" });
    if (itemPagManual.trim() && qtdPagManual) {
      addCaixaManual({ tipo: tipoManual === "entrada" ? "saida" : "entrada", descricao: `${tipoManual === "entrada" ? "PAGO COM" : "RECEBIDO EM"} ${itemPagManual}`, item: itemPagManual.trim(), quantidade: parseInt(qtdPagManual), valor: parseInt(qtdPagManual), origem: "Manual" });
    }
    toast.success("Registro adicionado!");
    setDescManual(""); setItemManual(""); setQtdManual(""); setItemPagManual(""); setQtdPagManual("");
  };

  const handleLeilaoSaida = () => {
    if (!leilaoItem.trim() || !leilaoQtd) { toast.error("Preencha o item e a quantidade."); return; }
    addCaixaManual({ tipo: "saida", descricao: `Leilão do Banco: ${leilaoItem.trim()}`, item: leilaoItem.trim(), quantidade: parseInt(leilaoQtd), valor: parseInt(leilaoQtd), origem: "leilao_banco" });
    toast.success(`Saída de leilão registrada: ${leilaoQtd}x ${leilaoItem.trim()}`);
    setLeilaoItem(""); setLeilaoQtd("");
  };

  const handleSorteioSaida = () => {
    if (!sorteioItem.trim() || !sorteioQtd || !sorteioGanhador.trim()) { toast.error("Preencha o item, quantidade e ganhador."); return; }
    addCaixaManual({ tipo: "saida", descricao: `Sorteio: ${sorteioItem.trim()} (ganhador: ${sorteioGanhador.trim()})`, item: sorteioItem.trim(), quantidade: parseInt(sorteioQtd), valor: parseInt(sorteioQtd), origem: "sorteio" });
    toast.success(`Saída de sorteio registrada: ${sorteioQtd}x ${sorteioItem.trim()} para ${sorteioGanhador.trim()}`);
    setSorteioItem(""); setSorteioQtd(""); setSorteioGanhador("");
  };

  const getAuthHeaders = () => {
    const pwd = sessionStorage.getItem("adminPwd");
    const modToken = sessionStorage.getItem("modToken");
    const headers: Record<string, string> = {};
    if (pwd) headers["x-admin-password"] = pwd;
    else if (modToken) headers["x-moderador-token"] = modToken;
    return headers;
  };

  const handleFigSale = async () => {
    if (!figSaleId || !figSaleValor || !figSaleComprador.trim()) { toast.error("Preencha figurinha, valor e comprador."); return; }
    const fig = figurinhas.find(f => f.id === figSaleId);
    if (!fig) { toast.error("Figurinha não encontrada."); return; }
    try {
      const res = await fetch("/api/figurinhas", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          action: "addSale",
          figurinhaId: figSaleId,
          figurinhaNome: fig.nome,
          quantidade: parseInt(figSaleQty) || 1,
          valorPago: parseFloat(figSaleValor),
          comprador: figSaleComprador.trim(),
        }),
      });
      const data = await res.json();
      if ("error" in data) { toast.error(data.error); return; }
      // Also register in caixa
      addCaixaManual({
        tipo: "entrada",
        descricao: `Venda figurinha: ${fig.nome} (x${figSaleQty}) para ${figSaleComprador.trim()}`,
        item: `Figurinha: ${fig.nome}`,
        quantidade: parseInt(figSaleQty) || 1,
        valor: parseFloat(figSaleValor),
        origem: "figurinha_venda",
      });
      toast.success(`Venda de figurinha "${fig.nome}" registrada!`);
      setFigSaleId(""); setFigSaleQty("1"); setFigSaleValor(""); setFigSaleComprador("");
    } catch {
      toast.error("Erro ao registrar venda.");
    }
  };

  const caixaFiltrado = caixa
    .filter((c) => tipoFiltro === "todos" || c.tipo === tipoFiltro)
    .filter((c) => !filtro || c.descricao.toLowerCase().includes(filtro.toLowerCase()) || c.item.toLowerCase().includes(filtro.toLowerCase()) || c.origem.toLowerCase().includes(filtro.toLowerCase()));

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Carregando...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-primary">💰 Caixa do Banco</h2>
      <div className="rounded-md border border-red-500/20 bg-red-500/5 p-4">
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Gavel className="w-4 h-4 text-red-400" /> Saída por Leilão do Banco (100%)</h3>
        <p className="text-xs text-muted-foreground mb-3">Registre itens que saíram do estoque para leilões do banco.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div><Label className="text-xs text-muted-foreground">Item</Label><Input placeholder="Ex: Katana" value={leilaoItem} onChange={(e) => setLeilaoItem(e.target.value)} className="text-sm" /></div>
          <div><Label className="text-xs text-muted-foreground">Quantidade</Label><Input type="number" placeholder="1" value={leilaoQtd} onChange={(e) => setLeilaoQtd(e.target.value)} className="text-sm font-mono" /></div>
          <div className="flex items-end"><Button onClick={handleLeilaoSaida} className="bg-red-600 hover:bg-red-700 text-white w-full"><Gavel className="w-4 h-4 mr-1" /> Registrar Saída</Button></div>
        </div>
      </div>
      <div className="rounded-md border border-purple-500/20 bg-purple-500/5 p-4">
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Dices className="w-4 h-4 text-purple-400" /> Saída por Sorteio (Prêmio)</h3>
        <p className="text-xs text-muted-foreground mb-3">Registre o prêmio que saiu do estoque quando um sorteio for finalizado.</p>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div><Label className="text-xs text-muted-foreground">Item</Label><Input placeholder="Ex: Katana" value={sorteioItem} onChange={(e) => setSorteioItem(e.target.value)} className="text-sm" /></div>
          <div><Label className="text-xs text-muted-foreground">Quantidade</Label><Input type="number" placeholder="1" value={sorteioQtd} onChange={(e) => setSorteioQtd(e.target.value)} className="text-sm font-mono" /></div>
          <div><Label className="text-xs text-muted-foreground">Ganhador</Label><Input placeholder="Nome do jogador" value={sorteioGanhador} onChange={(e) => setSorteioGanhador(e.target.value)} className="text-sm" /></div>
          <div className="flex items-end"><Button onClick={handleSorteioSaida} className="bg-purple-600 hover:bg-purple-700 text-white w-full"><Dices className="w-4 h-4 mr-1" /> Registrar Prêmio</Button></div>
        </div>
      </div>
      {/* Figurinha Sales Section */}
      <div className="rounded-md border border-primary/20 bg-primary/5 p-4">
        <button onClick={() => setShowFigSales(!showFigSales)} className="flex items-center justify-between w-full">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><BookImage className="w-4 h-4 text-primary" /> Venda de Figurinhas</h3>
          {showFigSales ? <ArrowUpCircle className="w-4 h-4 text-primary" /> : <ArrowDownCircle className="w-4 h-4 text-primary" />}
        </button>
        {showFigSales && (
          <div className="mt-3 space-y-3">
            <p className="text-xs text-muted-foreground">Registre a venda de figurinhas e o valor pago pelo comprador para entrar no estoque do caixa.</p>
            {figurinhas.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">Nenhuma figurinha cadastrada ainda.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Figurinha</Label>
                  <select value={figSaleId} onChange={(e) => {
                    setFigSaleId(e.target.value);
                    const fig = figurinhas.find(f => f.id === e.target.value);
                    if (fig && fig.preco > 0) setFigSaleValor(String(fig.preco));
                  }} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">Selecione...</option>
                    {figurinhas.map(f => (
                      <option key={f.id} value={f.id}>{f.nome} ({f._count?.codigos || 0} códigos)</option>
                    ))}
                  </select>
                </div>
                <div><Label className="text-xs text-muted-foreground">Quantidade</Label><Input type="number" min="1" value={figSaleQty} onChange={(e) => setFigSaleQty(e.target.value)} className="text-sm font-mono" /></div>
                <div><Label className="text-xs text-muted-foreground">Valor pago</Label><Input type="number" placeholder="0" value={figSaleValor} onChange={(e) => setFigSaleValor(e.target.value)} className="text-sm font-mono" /></div>
                <div><Label className="text-xs text-muted-foreground">Comprador</Label><Input placeholder="Nome do jogador" value={figSaleComprador} onChange={(e) => setFigSaleComprador(e.target.value)} className="text-sm" /></div>
                <div className="flex items-end"><Button onClick={handleFigSale} className="bg-primary hover:bg-primary/90 text-primary-foreground w-full gap-1"><ShoppingCart className="w-4 h-4" /> Registrar Venda</Button></div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="rounded-md border border-border bg-card p-4">
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Plus className="w-4 h-4 text-primary" /> Registro Manual</h3>
        <div className={`mb-3 p-2 rounded-md text-xs border ${tipoManual === "entrada" ? "bg-green-500/10 border-green-400/20 text-green-300" : "bg-red-500/10 border-red-400/20 text-red-300"}`}>
          {tipoManual === "entrada" ? "📦 ENTRADA" : "📤 SAÍDA"}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
          <div><Label className="text-xs text-muted-foreground">Tipo</Label><div className="flex gap-2 mt-1"><Button size="sm" variant={tipoManual === "entrada" ? "default" : "outline"} onClick={() => setTipoManual("entrada")} className={`text-xs flex-1 ${tipoManual === "entrada" ? "bg-green-600 hover:bg-green-700" : ""}`}>📦 Entrada</Button><Button size="sm" variant={tipoManual === "saida" ? "default" : "outline"} onClick={() => setTipoManual("saida")} className={`text-xs flex-1 ${tipoManual === "saida" ? "bg-red-600 hover:bg-red-700" : ""}`}>📤 Saída</Button></div></div>
          <div><Label className="text-xs text-muted-foreground">Descrição</Label><Input placeholder="Ex: Compra" value={descManual} onChange={(e) => setDescManual(e.target.value)} className="text-sm" /></div>
          <div><Label className="text-xs text-muted-foreground">Item</Label><Input placeholder="Item" value={itemManual} onChange={(e) => setItemManual(e.target.value)} className="text-sm" /></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div><Label className="text-xs text-muted-foreground">Quantidade</Label><Input type="number" placeholder="1000" value={qtdManual} onChange={(e) => setQtdManual(e.target.value)} className="text-sm font-mono" /></div>
          <div><Label className="text-xs text-muted-foreground">Item Pagamento (opcional)</Label><Input placeholder="Ex: Moeda" value={itemPagManual} onChange={(e) => setItemPagManual(e.target.value)} className="text-sm" /></div>
          <div><Label className="text-xs text-muted-foreground">Qtd Pagamento</Label><Input type="number" placeholder="5000" value={qtdPagManual} onChange={(e) => setQtdPagManual(e.target.value)} className="text-sm font-mono" /></div>
          <div className="flex items-end"><Button onClick={handleManual} className="bg-primary hover:bg-primary/90 text-primary-foreground w-full">Registrar</Button></div>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-48"><Search className="w-4 h-4 text-muted-foreground" /><Input placeholder="Buscar..." value={filtro} onChange={(e) => setFiltro(e.target.value)} className="text-sm" /></div>
        <div className="flex gap-2"><Button size="sm" variant={tipoFiltro === "todos" ? "default" : "outline"} onClick={() => setTipoFiltro("todos")} className="text-xs">Todos</Button><Button size="sm" variant={tipoFiltro === "entrada" ? "default" : "outline"} onClick={() => setTipoFiltro("entrada")} className="text-xs">Entrada</Button><Button size="sm" variant={tipoFiltro === "saida" ? "default" : "outline"} onClick={() => setTipoFiltro("saida")} className="text-xs">Saída</Button></div>
      </div>
      {caixaFiltrado.length === 0 ? (<div className="rounded-md border border-border bg-card p-6 text-center text-muted-foreground text-sm">Nenhum registro.</div>) : (
        <div className="rounded-md border border-border bg-card overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-border bg-accent/50"><th className="text-left px-3 py-2 text-xs font-bold text-muted-foreground">Tipo</th><th className="text-left px-3 py-2 text-xs font-bold text-muted-foreground">Descrição</th><th className="text-left px-3 py-2 text-xs font-bold text-muted-foreground">Item</th><th className="text-center px-3 py-2 text-xs font-bold text-muted-foreground">Qtd</th><th className="text-left px-3 py-2 text-xs font-bold text-muted-foreground">Origem</th><th className="text-right px-3 py-2 text-xs font-bold text-muted-foreground">Data</th></tr></thead><tbody>{caixaFiltrado.map((c) => (<tr key={c.id} className="border-b border-border/50 hover:bg-accent/30"><td className="px-3 py-2">{c.tipo === "entrada" ? <ArrowDownCircle className="w-4 h-4 text-green-400" /> : <ArrowUpCircle className="w-4 h-4 text-red-400" />}</td><td className="px-3 py-2 text-foreground text-xs" data-no-translate translate="no">{c.descricao}</td><td className="px-3 py-2 text-foreground text-xs font-mono" data-no-translate translate="no">{c.item}</td><td className={`px-3 py-2 text-center font-mono text-xs ${c.tipo === "entrada" ? "text-green-400" : "text-red-400"}`}>{c.tipo === "entrada" ? "+" : "-"}{c.quantidade}</td><td className="px-3 py-2 text-xs text-muted-foreground" data-no-translate translate="no">{c.origem}</td><td className="px-3 py-2 text-right text-xs text-muted-foreground">{new Date(c.data).toLocaleDateString(getDateLocale(), { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td></tr>))}</tbody></table></div>
      )}
      <div className="border-t border-border pt-4">
        <div className="flex items-center justify-between mb-3"><h3 className="text-lg font-bold text-primary flex items-center gap-2"><Package className="w-5 h-5" /> Estoque Atual</h3><Button variant="outline" size="sm" onClick={() => { if (window.confirm("ATENCAO: Isso vai apagar TODOS os dados do banco (emprestimos, leiloes, sorteios, loterica, chat, trocas, caixa, tudo!). Tem certeza?")) resetBanco(); }} className="border-red-500/30 text-red-400 hover:bg-red-500/10"><RefreshCw className="w-4 h-4 mr-2" /> Resetar Tudo</Button></div>
        {(() => {
          const itens = Object.entries(inventory).filter(([, q]) => q !== 0).sort(([, a], [, b]) => b - a);
          if (itens.length === 0) return <div className="rounded-md border border-dashed border-border bg-card p-8 text-center text-muted-foreground text-sm">Estoque vazio.</div>;
          return <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">{itens.map(([nome, qtd]) => (<div key={nome} className="rounded-md border border-border bg-card p-3"><div className="flex justify-between items-start mb-1"><span className="text-[10px] font-bold text-muted-foreground uppercase">{nome.length > 20 ? nome.substring(0, 20) + "..." : nome}</span>{qtd > 0 && qtd < 100 && <span className="text-[10px] text-yellow-500 font-bold bg-yellow-500/10 px-1 py-0.5 rounded"><AlertTriangle className="w-2.5 h-2.5 inline" /> BAIXO</span>}</div><span className={`text-lg font-mono font-bold ${qtd > 0 ? "text-green-400" : "text-red-400"}`}>{qtd > 0 ? "+" : ""}{qtd.toLocaleString()}</span></div>))}</div>;
        })()}
      </div>
    </div>
  );
}
