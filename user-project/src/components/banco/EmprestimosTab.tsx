"use client";
import { useState } from "react";
import { useBank, type Emprestimo } from "@/lib/useBank";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Calculator, Plus, CheckCircle, AlertTriangle, X, Info, HandCoins, Shield } from "lucide-react";
import { Label } from "@/components/ui/label";
import AdSlot from "@/components/AdSlot";
import { getDateLocale } from "./TranslationPopup";

function getTaxa(tipo: string): number {
  if (tipo === "especial") return 0;
  if (tipo === "top10") return 0.05;
  if (tipo === "investidor") return 0.10;
  if (tipo === "comum") return 0.15;
  return 0.20;
}

function getTipoLabel(tipo: string): string {
  if (tipo === "especial") return "⭐ Especial (0%)";
  if (tipo === "top10") return "👑 Top 10 Investidor (5%)";
  if (tipo === "investidor") return "💎 Investidor (10%)";
  if (tipo === "comum") return "👤 Comum (15%)";
  return "⚠️ Não Contribuinte (20%)";
}

function calcularValorCobrar(emp: Emprestimo): number {
  const taxa = getTaxa(emp.tipoMembro);
  const now = new Date();
  const venc = new Date(emp.dataEmprestimo);
  venc.setDate(venc.getDate() + 1);
  const diasAtraso = now > venc ? Math.floor((now.getTime() - venc.getTime()) / 86400000) + 1 : 0;
  return Math.ceil(emp.quantidade * (1 + taxa + diasAtraso * 0.01));
}

function CalcWidget({ show }: { show: boolean }) {
  const [quantidade, setQuantidade] = useState("");
  const [tipo, setTipo] = useState<string>("comum");
  const [dias, setDias] = useState("0");
  const qtd = parseFloat(quantidade) || 0;
  const taxa = getTaxa(tipo);
  const d = parseInt(dias) || 0;
  const acrescimo = Math.ceil(qtd * (taxa + d * 0.01));
  const total = qtd + acrescimo;
  if (!show) return null;
  return (
    <div className="rounded-md border border-border bg-accent/50 p-4">
      <h4 className="text-sm font-bold text-primary mb-3 flex items-center gap-2"><Calculator className="w-4 h-4" /> Calculadora de Empréstimo</h4>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3">
        <div><Label className="text-xs text-muted-foreground">Quantidade</Label><Input type="number" placeholder="1000" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} className="font-mono text-sm" /></div>
        <div><Label className="text-xs text-muted-foreground">Tipo</Label><Select value={tipo} onValueChange={setTipo}><SelectTrigger className="font-mono text-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="especial">Especial (0%)</SelectItem><SelectItem value="top10">Top 10 Investidor (5%)</SelectItem><SelectItem value="investidor">Investidor (10%)</SelectItem><SelectItem value="comum">Comum (15%)</SelectItem><SelectItem value="nao_contribuinte">Não Contribuinte (20%)</SelectItem></SelectContent></Select></div>
        <div><Label className="text-xs text-muted-foreground">Dias de Atraso</Label><Input type="number" placeholder="0" value={dias} onChange={(e) => setDias(e.target.value)} className="font-mono text-sm" /></div>
        <div><Label className="text-xs text-muted-foreground">Total a Devolver</Label><div className="rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-yellow-400 font-bold">{total} itens</div></div>
      </div>
      {qtd > 0 && d === 0 && (
        <div className="mt-3 p-2 rounded-md bg-yellow-400/10 border border-yellow-400/30 text-xs text-yellow-300">⚠️ Prazo: 24 horas. Após: +1% de juros por dia.</div>
      )}
    </div>
  );
}

function EmprestimoCard({ emp, isAdmin }: { emp: Emprestimo; isAdmin: boolean }) {
  const { pagarEmprestimo } = useBank();
  const [showPayment, setShowPayment] = useState(false);
  const [itemPagamento, setItemPagamento] = useState("");
  const [qtdPagamento, setQtdPagamento] = useState("");
  const valorCobrar = calcularValorCobrar(emp);
  const now = new Date();
  const venc = new Date(emp.dataEmprestimo);
  venc.setDate(venc.getDate() + 1);
  const estaAtrasado = now > venc && emp.status === "pendente";

  const handlePayment = () => {
    if (!itemPagamento || !qtdPagamento) { toast.error("Preencha o item e a quantidade."); return; }
    pagarEmprestimo(emp.id, { itemPagamento, quantidadePaga: parseInt(qtdPagamento) });
    toast.success(`Empréstimo de ${emp.player} marcado como pago!`);
    setShowPayment(false); setItemPagamento(""); setQtdPagamento("");
  };

  return (
    <div className={`rounded-md border border-border bg-card p-3 mb-2 ${estaAtrasado ? "border-red-400/30" : ""}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-foreground" data-no-translate>{emp.player}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${emp.status === "pendente" ? "text-yellow-400 border-yellow-400/30 bg-yellow-400/10" : "text-green-400 border-green-400/30 bg-green-400/10"}`}>{emp.status === "pendente" ? "Pendente" : "Pago"}</span>
          {estaAtrasado && <span className="text-xs px-2 py-0.5 rounded-full border border-red-400/30 bg-red-400/10 text-red-400">Atrasado</span>}
          <span className="text-xs text-muted-foreground">{getTipoLabel(emp.tipoMembro)}</span>
        </div>
        {emp.status === "pendente" && isAdmin && (
          <Button size="sm" variant="outline" onClick={() => setShowPayment(!showPayment)}><CheckCircle className="w-3 h-3 mr-1" /> Pagar</Button>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div><span className="text-muted-foreground">Item:</span> <span className="font-mono text-foreground">{emp.item}</span></div>
        <div><span className="text-muted-foreground">Quantidade:</span> <span className="font-mono text-foreground">{emp.quantidade}</span></div>
        <div><span className="text-muted-foreground">Valor a cobrar:</span> <span className="font-mono font-bold text-yellow-400">{valorCobrar}</span></div>
        <div><span className="text-muted-foreground">Vencimento:</span> <span className="font-mono text-foreground">{new Date(emp.dataEmprestimo).toLocaleDateString(getDateLocale(), { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span></div>
      </div>
      {estaAtrasado && <div className="mt-2 text-xs text-red-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Empréstimo atrasado - Juros já incluídos</div>}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader><DialogTitle className="text-primary">Registrar Pagamento</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Empréstimo de {emp.quantidade}x {emp.item} para {emp.player}</p>
            <div className="rounded-md bg-yellow-400/10 border border-yellow-400/30 p-3"><p className="text-xs text-yellow-300 mb-1">Valor a cobrar:</p><p className="text-xl font-bold font-mono text-yellow-400">{valorCobrar} itens</p></div>
            <div><Label className="text-xs text-muted-foreground">Item do Pagamento</Label><Input placeholder="Ex: Sal, Carne..." value={itemPagamento} onChange={(e) => setItemPagamento(e.target.value)} className="font-mono text-sm" /></div>
            <div><Label className="text-xs text-muted-foreground">Quantidade</Label><Input type="number" placeholder={valorCobrar.toString()} value={qtdPagamento} onChange={(e) => setQtdPagamento(e.target.value)} className="font-mono text-sm" /></div>
            <div className="flex gap-2"><Button onClick={handlePayment} className="bg-green-600 hover:bg-green-700 text-white flex-1">Confirmar Pagamento</Button><Button variant="outline" onClick={() => setShowPayment(false)}><X className="w-4 h-4" /></Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface EmprestimosTabProps {
  isAdmin: boolean;
}

export default function EmprestimosTab({ isAdmin }: EmprestimosTabProps) {
  const { emprestimos, addEmprestimo, isLoading } = useBank();
  const [player, setPlayer] = useState("");
  const [item, setItem] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [tipo, setTipo] = useState<string>("comum");
  const [showCalc, setShowCalc] = useState(false);

  const handleAdd = () => {
    if (!player || !item || !quantidade) { toast.error("Preencha todos os campos."); return; }
    addEmprestimo({ player, item, quantidade: parseInt(quantidade), tipoMembro: tipo, dataEmprestimo: new Date().toISOString(), status: "pendente" });
    toast.success(`Empréstimo para ${player} registrado!`);
    setPlayer(""); setItem(""); setQuantidade("");
  };

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Carregando...</div>;
  const pendentes = emprestimos.filter((e) => e.status === "pendente");
  const pagos = emprestimos.filter((e) => e.status === "pago");

  return (
    <div className="space-y-4">
      <AdSlot size="banner" id="emprestimos-top" isAdmin={isAdmin} className="my-3" />
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-primary flex items-center gap-2"><HandCoins className="w-5 h-5" /> Empréstimos</h2>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button variant="outline" size="sm" onClick={() => setShowCalc(!showCalc)} className="border-primary/30 text-primary hover:bg-primary/10"><Calculator className="w-4 h-4 mr-1" /> Calculadora</Button>
          )}
          {!isAdmin && (
            <span className="text-xs text-muted-foreground flex items-center gap-1"><Shield className="w-3 h-3" /> Modo visual</span>
          )}
        </div>
      </div>
      <div className="rounded-md border border-primary/20 bg-card p-4">
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Info className="w-4 h-4 text-primary" /> Regras do Banco</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="rounded-md bg-accent p-3 border border-blue-400/20"><p className="text-xs text-muted-foreground">Membro Especial</p><p className="text-lg font-bold text-blue-400 font-mono">+0%</p><p className="text-xs text-muted-foreground">sem acréscimo</p></div>
          <div className="rounded-md bg-accent p-3 border border-purple-400/20"><p className="text-xs text-muted-foreground">Top 10 Investidor</p><p className="text-lg font-bold text-purple-400 font-mono">+5%</p><p className="text-xs text-muted-foreground">de acréscimo</p></div>
          <div className="rounded-md bg-accent p-3 border border-green-400/20"><p className="text-xs text-muted-foreground">Investidor</p><p className="text-lg font-bold text-green-400 font-mono">+10%</p><p className="text-xs text-muted-foreground">de acréscimo</p></div>
          <div className="rounded-md bg-accent p-3 border border-yellow-400/20"><p className="text-xs text-muted-foreground">Membro Comum</p><p className="text-lg font-bold text-yellow-400 font-mono">+15%</p><p className="text-xs text-muted-foreground">de acréscimo</p></div>
          <div className="rounded-md bg-accent p-3 border border-red-400/20"><p className="text-xs text-muted-foreground">Não Contribuinte</p><p className="text-lg font-bold text-red-400 font-mono">+20%</p><p className="text-xs text-muted-foreground">de acréscimo</p></div>
        </div>
      </div>
      <CalcWidget show={showCalc} />
      {isAdmin && (
        <div className="rounded-md border border-border bg-card p-4">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Plus className="w-4 h-4 text-primary" /> Novo Empréstimo</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div><Label className="text-xs text-muted-foreground">Player</Label><Input placeholder="Nome" value={player} onChange={(e) => setPlayer(e.target.value)} className="text-sm" /></div>
            <div><Label className="text-xs text-muted-foreground">Item</Label><Input placeholder="Item" value={item} onChange={(e) => setItem(e.target.value)} className="text-sm" /></div>
            <div><Label className="text-xs text-muted-foreground">Quantidade</Label><Input type="number" placeholder="1000" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} className="text-sm font-mono" /></div>
            <div><Label className="text-xs text-muted-foreground">Tipo</Label><Select value={tipo} onValueChange={setTipo}><SelectTrigger className="text-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="especial">Especial (0%)</SelectItem><SelectItem value="top10">Top 10 Investidor (5%)</SelectItem><SelectItem value="investidor">Investidor (10%)</SelectItem><SelectItem value="comum">Comum (15%)</SelectItem><SelectItem value="nao_contribuinte">Não Contribuinte (20%)</SelectItem></SelectContent></Select></div>
            <div className="flex items-end"><Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground w-full">Registrar</Button></div>
          </div>
        </div>
      )}
      <div><h3 className="text-sm font-bold text-foreground mb-2">Pendentes ({pendentes.length})</h3>{pendentes.length === 0 ? <div className="rounded-md border border-border bg-card p-4 text-center text-muted-foreground text-sm">Nenhum empréstimo pendente.</div> : pendentes.map((emp) => <EmprestimoCard key={emp.id} emp={emp} isAdmin={isAdmin} />)}</div>
      {pagos.length > 0 && <div><h3 className="text-sm font-bold text-foreground mb-2">Pagos ({pagos.length})</h3>{pagos.map((emp) => <EmprestimoCard key={emp.id} emp={emp} isAdmin={isAdmin} />)}</div>}
      <AdSlot size="banner" id="emprestimos-bottom" isAdmin={isAdmin} className="my-3" />
    </div>
  );
}
