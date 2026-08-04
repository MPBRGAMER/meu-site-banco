/**
 * Empréstimos - Registro, calculadora e gestão de empréstimos
 * Regras: 15% acréscimo comum, 10% investidor, 1% juros/dia de atraso (automático)
 * Descrições das taxas visíveis nesta aba
 */
import { useState, useCallback } from "react";
import { useBank, type Emprestimo } from "@/contexts/BankContext";
import { useCanEdit } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Calculator, Plus, CheckCircle, AlertTriangle, X, Info } from "lucide-react";
import { Label } from "@/components/ui/label";

// Função local para calcular valor a cobrar com juros automáticos
function calcularValorCobrar(emp: Emprestimo): number {
  const taxa = emp.tipoMembro === "comum" ? 0.15 : 0.10;
  // Calcular dias de atraso baseado no vencimento
  const now = new Date();
  const vencimento = new Date(emp.dataEmprestimo);
  vencimento.setDate(vencimento.getDate() + 1); // 24h = 1 dia
  const jurosDias = now > vencimento ? Math.floor((now.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24)) + 1 : 0;
  const juros = jurosDias * 0.01;
  return Math.ceil(emp.quantidade * (1 + taxa + juros));
}

function CalculadoraEmprestimo() {
  const [quantidade, setQuantidade] = useState("");
  const [tipo, setTipo] = useState<"comum" | "investidor">("comum");
  const [diasAtraso, setDiasAtraso] = useState("0");

  const qtd = parseFloat(quantidade) || 0;
  const taxa = tipo === "comum" ? 0.15 : 0.10;
  const dias = parseInt(diasAtraso) || 0;
  const juros = dias * 0.01;
  const acrescimo = Math.ceil(qtd * (taxa + juros));
  const totalDevolver = qtd + acrescimo;

  return (
    <div className="rounded-md border border-border bg-accent/50 p-4 mt-4">
      <h4 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
        <Calculator className="w-4 h-4" /> Calculadora de Empréstimo
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3">
        <div>
          <Label className="text-xs text-muted-foreground">Quantidade Emprestada</Label>
          <Input type="number" placeholder="1000" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} className="font-mono text-sm" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Tipo de Membro</Label>
          <Select value={tipo} onValueChange={(v) => setTipo(v as "comum" | "investidor")}>
            <SelectTrigger className="font-mono text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="comum">Comum (15%)</SelectItem>
              <SelectItem value="investidor">Investidor (10%)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Dias de Atraso</Label>
          <Input type="number" placeholder="0" value={diasAtraso} onChange={(e) => setDiasAtraso(e.target.value)} className="font-mono text-sm" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Total a Devolver</Label>
          <div className="rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-yellow-400 font-bold">{totalDevolver} itens</div>
        </div>
      </div>
      <div className="text-xs text-muted-foreground mb-1">
        Acréscimo: {Math.ceil(qtd * taxa)} (taxa) + {Math.ceil(qtd * juros)} (juros) = {acrescimo}
      </div>
      {qtd > 0 && dias === 0 && (
        <div className="mt-3 p-2 rounded-md bg-yellow-400/10 border border-yellow-400/30 text-xs text-yellow-300">
          ⚠️ Prazo: 24 horas para devolver. Após o prazo: +1% de juros por dia de atraso (automático).
        </div>
      )}
    </div>
  );
}

function EmprestimoCard({ emp }: { emp: Emprestimo }) {
  const { pagarEmprestimo } = useBank();
  const canEdit = useCanEdit();
  const [showPayment, setShowPayment] = useState(false);
  const [itemPagamento, setItemPagamento] = useState("");
  const [qtdPagamento, setQtdPagamento] = useState("");
  const valorCobrar = calcularValorCobrar(emp);

  const handlePayment = () => {
    if (!itemPagamento || !qtdPagamento) {
      toast.error("Preencha o item e a quantidade do pagamento.");
      return;
    }
    pagarEmprestimo(emp.id, {
      itemPagamento,
      quantidadePaga: parseInt(qtdPagamento),
    });
    toast.success(`Empréstimo de ${emp.player} marcado como pago!`);
    setShowPayment(false);
    setItemPagamento("");
    setQtdPagamento("");
  };

  const statusColors = {
    pendente: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
    pago: "text-green-400 border-green-400/30 bg-green-400/10",
  };

  const statusLabels = {
    pendente: "Pendente",
    pago: "Pago",
  };

  // Verificar se está atrasado
  const now = new Date();
  const vencimento = new Date(emp.dataEmprestimo);
  vencimento.setDate(vencimento.getDate() + 1);
  const estaAtrasado = now > vencimento && emp.status === "pendente";

  return (
    <div className={`rounded-md border border-border bg-card p-3 mb-2 ${estaAtrasado ? "border-red-400/30" : ""}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground">{emp.player}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[emp.status]}`}>
            {statusLabels[emp.status]}
          </span>
          {estaAtrasado && <span className="text-xs px-2 py-0.5 rounded-full border border-red-400/30 bg-red-400/10 text-red-400">Atrasado</span>}
          <span className="text-xs text-muted-foreground">
            {emp.tipoMembro === "investidor" ? "💎 Investidor" : "👤 Comum"}
          </span>
        </div>
        {emp.status === "pendente" && canEdit && (
          <Button size="sm" variant="outline" onClick={() => setShowPayment(!showPayment)}>
            <CheckCircle className="w-3 h-3 mr-1" /> Pagar
          </Button>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div>
          <span className="text-muted-foreground">Item:</span>{" "}
          <span className="font-mono text-foreground">{emp.item}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Quantidade:</span>{" "}
          <span className="font-mono text-foreground">{emp.quantidade}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Valor a cobrar:</span>{" "}
          <span className="font-mono font-bold text-yellow-400">{valorCobrar}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Vencimento:</span>{" "}
          <span className="font-mono text-foreground">{new Date(emp.dataEmprestimo).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
        </div>
      </div>
      {estaAtrasado && (
        <div className="mt-2 text-xs text-red-400 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Empréstimo atrasado - Juros já incluídos no valor acima
        </div>
      )}

      {/* Payment Dialog */}
      {showPayment && (
        <Dialog open={showPayment} onOpenChange={setShowPayment}>
          <DialogContent className="bg-card border-border max-w-md">
            <DialogHeader>
              <DialogTitle className="text-primary">Registrar Pagamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Empréstimo de {emp.quantidade}x {emp.item} para {emp.player}
              </p>
              <div className="rounded-md bg-yellow-400/10 border border-yellow-400/30 p-3">
                <p className="text-xs text-yellow-300 mb-1">Valor a cobrar (já inclui acréscimo + juros):</p>
                <p className="text-xl font-bold font-mono text-yellow-400">{valorCobrar} itens</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Item do Pagamento</Label>
                <Input placeholder="Ex: Sal, Carne, etc." value={itemPagamento} onChange={(e) => setItemPagamento(e.target.value)} className="font-mono text-sm" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Quantidade</Label>
                <Input type="number" placeholder={valorCobrar.toString()} value={qtdPagamento} onChange={(e) => setQtdPagamento(e.target.value)} className="font-mono text-sm" />
              </div>
              <div className="flex gap-2">
                <Button onClick={handlePayment} className="bg-green-600 hover:bg-green-700 text-white flex-1">Confirmar Pagamento</Button>
                <Button variant="outline" onClick={() => setShowPayment(false)}><X className="w-4 h-4" /></Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default function Emprestimos() {
  const { emprestimos, addEmprestimo, isLoading } = useBank();
  const canEdit = useCanEdit();
  const [player, setPlayer] = useState("");
  const [item, setItem] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [tipo, setTipo] = useState<"comum" | "investidor">("comum");
  const [showCalc, setShowCalc] = useState(false);

  const handleAdd = () => {
    if (!player || !item || !quantidade) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    const qtd = parseInt(quantidade);

    addEmprestimo({
      player,
      item,
      quantidade: qtd,
      tipoMembro: tipo,
      dataEmprestimo: new Date().toISOString(),
      status: "pendente",
    });

    toast.success(`Empréstimo para ${player} registrado!`);
    setPlayer("");
    setItem("");
    setQuantidade("");
  };

  const pendentes = emprestimos.filter((e) => e.status === "pendente");
  const pagos = emprestimos.filter((e) => e.status === "pago");

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Carregando empréstimos...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-primary">📋 Empréstimos</h2>
        <Button variant="outline" size="sm" onClick={() => setShowCalc(!showCalc)} className="border-primary/30 text-primary hover:bg-primary/10">
          <Calculator className="w-4 h-4 mr-1" /> Calculadora
        </Button>
      </div>

      {/* Descrições das Taxas */}
      <div className="rounded-md border border-primary/20 bg-card p-4">
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" /> Regras do Banco
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-md bg-accent p-3 border border-yellow-400/20">
            <p className="text-xs text-muted-foreground">Membro Comum</p>
            <p className="text-lg font-bold text-yellow-400 font-mono">+15%</p>
            <p className="text-xs text-muted-foreground">de acréscimo na devolução</p>
          </div>
          <div className="rounded-md bg-accent p-3 border border-green-400/20">
            <p className="text-xs text-muted-foreground">Membro Investidor</p>
            <p className="text-lg font-bold text-green-400 font-mono">+10%</p>
            <p className="text-xs text-muted-foreground">de acréscimo na devolução</p>
          </div>
          <div className="rounded-md bg-accent p-3 border border-red-400/20">
            <p className="text-xs text-muted-foreground">Juros por Atraso</p>
            <p className="text-lg font-bold text-red-400 font-mono">+1%/dia</p>
            <p className="text-xs text-muted-foreground">após 24h de atraso (automático)</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          ⚠️ O prazo é de <strong>24 horas</strong> para devolver. Após as 24h, o sistema adiciona automaticamente <strong>+1% de juros por dia</strong> de atraso sobre a quantidade emprestada.
        </p>
      </div>

      {canEdit && showCalc && <CalculadoraEmprestimo />}

      {/* Form Novo Empréstimo */}
      {canEdit && (
      <div className="rounded-md border border-border bg-card p-4">
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" /> Novo Empréstimo
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Player</Label>
            <Input placeholder="Nome do player" value={player} onChange={(e) => setPlayer(e.target.value)} className="text-sm" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Item</Label>
            <Input placeholder="Item emprestado" value={item} onChange={(e) => setItem(e.target.value)} className="text-sm" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Quantidade</Label>
            <Input type="number" placeholder="1000" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} className="text-sm font-mono" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Tipo</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as "comum" | "investidor")}>
              <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="comum">Comum (15%)</SelectItem>
                <SelectItem value="investidor">Investidor (10%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground w-full">Registrar</Button>
          </div>
        </div>
      </div>
      )}

      {/* Lista de Empréstimos */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-2">Pendentes ({pendentes.length})</h3>
        {pendentes.length === 0 ? (
          <div className="rounded-md border border-border bg-card p-4 text-center text-muted-foreground text-sm">Nenhum empréstimo pendente.</div>
        ) : (
          <div>
            {pendentes.map((emp) => (
              <EmprestimoCard key={emp.id} emp={emp} />
            ))}
          </div>
        )}
      </div>

      {pagos.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-foreground mb-2">Pagos ({pagos.length})</h3>
          <div className="space-y-2">
            {pagos.map((emp) => (
              <EmprestimoCard key={emp.id} emp={emp} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
