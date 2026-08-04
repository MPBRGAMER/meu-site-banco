import { useState, useEffect } from "react";
import { useBank } from "@/contexts/BankContext";
import { useCanEdit } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeftRight, Calculator, Plus, Clock } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function Trocas() {
  const { tabelasTroca, trocas, addTroca, isLoading } = useBank();
  const canEdit = useCanEdit();
  
  const [player, setPlayer] = useState("");
  const [tipoMembro, setTipoMembro] = useState<"comum" | "investidor">("comum");
  const [tabelaId, setTabelaId] = useState("");
  const [qtdBase, setQtdBase] = useState("");
  const [observacao, setObservacao] = useState("");

  // Estado para visualização do cálculo
  const [preview, setPreview] = useState<{
    taxa: number;
    valorBruto: number;
    valorDesconto: number;
    valorFinal: number;
    lucroBanco: number;
  } | null>(null);

  const tabelaSelecionada = tabelasTroca.find((t) => t.id === tabelaId);

  // Atualizar preview sempre que os inputs mudarem
  useEffect(() => {
    if (!tabelaSelecionada || !qtdBase || parseFloat(qtdBase) <= 0) {
      setPreview(null);
      return;
    }

    const qtdBaseNum = parseFloat(qtdBase);
    // Quantos "grupos" de troca o player está fazendo
    const grupos = qtdBaseNum / tabelaSelecionada.quantidadeBase;
    const valorBruto = grupos * tabelaSelecionada.quantidadeResultado;
    
    const taxa = tipoMembro === "comum" ? 0.15 : 0.10;
    const valorDesconto = Math.ceil(valorBruto * taxa);
    const valorFinal = Math.floor(valorBruto) - valorDesconto;
    const lucroBanco = valorDesconto;

    setPreview({
      taxa,
      valorBruto,
      valorDesconto,
      valorFinal,
      lucroBanco
    });
  }, [tabelaId, qtdBase, tipoMembro, tabelaSelecionada]);

  const handleRegistrar = () => {
    if (!player || !tabelaSelecionada || !qtdBase || parseFloat(qtdBase) <= 0) {
      toast.error("Preencha todos os campos.");
      return;
    }

    if (!preview) {
      toast.error("Erro ao calcular a troca.");
      return;
    }

    addTroca({
      player,
      itemEnviado: tabelaSelecionada.itemBase,
      quantidadeEnviada: parseFloat(qtdBase),
      itemRecebido: tabelaSelecionada.itemResultado,
      quantidadeRecebida: preview.valorFinal,
      tipoMembro,
      taxaAplicada: preview.taxa * 100,
      lucroBanco: preview.lucroBanco,
    });

    toast.success(`Troca registrada! Player receberá ${preview.valorFinal}x ${tabelaSelecionada.itemResultado}`);
    setPlayer("");
    setQtdBase("");
    setObservacao("");
    setTabelaId("");
    setPreview(null);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Carregando trocas...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-primary flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5" /> Registro de Trocas
        </h2>
      </div>

      {canEdit && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Formulário */}
        <div className="rounded-md border border-border bg-card p-4 h-full">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" /> Nova Troca
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Player</Label>
                <Input 
                  placeholder="Nome do player" 
                  value={player} 
                  onChange={(e) => setPlayer(e.target.value)} 
                  className="text-sm mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Tipo de Membro</Label>
                <Select value={tipoMembro} onValueChange={(v) => setTipoMembro(v as "comum" | "investidor")}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comum">Comum (Taxa 15%)</SelectItem>
                    <SelectItem value="investidor">Investidor (Taxa 10%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Qual item ele vai entregar?</Label>
              <Select value={tabelaId} onValueChange={setTabelaId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione a tabela de troca" />
                </SelectTrigger>
                <SelectContent>
                  {tabelasTroca.length === 0 ? (
                    <SelectItem value="empty" disabled>Nenhuma tabela configurada</SelectItem>
                  ) : (
                    tabelasTroca.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.quantidadeBase}x {t.itemBase} ➜ {t.quantidadeResultado}x {t.itemResultado}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Quantidade do item (em base)</Label>
              <Input 
                type="number" 
                placeholder="Ex: 1000 (se a tabela for 1000:10)" 
                value={qtdBase} 
                onChange={(e) => setQtdBase(e.target.value)} 
                className="text-sm font-mono mt-1"
              />
            </div>
            
            <Button 
              onClick={handleRegistrar} 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-2"
              disabled={!preview}
            >
              Registrar Troca e Calcular Caixa
            </Button>
          </div>
        </div>

        {/* Calculadora Visual */}
        <div className="rounded-md border border-border bg-card p-4 h-full">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-primary" /> Calculadora Automática
          </h3>
          
          {!preview ? (
            <div className="flex flex-col items-center justify-center h-[calc(100%-2rem)] text-center text-muted-foreground border-2 border-dashed border-border/50 rounded-md p-6">
              <p className="text-sm">Preencha o formulário ao lado para ver o cálculo automático.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-accent/30 p-3 rounded-md border border-border">
                <p className="text-xs text-muted-foreground mb-1">Player entregou:</p>
                <p className="text-lg font-bold font-mono text-primary">{qtdBase}x {tabelaSelecionada?.itemBase}</p>
              </div>

              <div className="flex items-center justify-center">
                <ArrowLeftRight className="w-6 h-6 text-muted-foreground" />
              </div>

              <div className="bg-card p-3 rounded-md border border-border space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Valor Bruto (sem taxas):</span>
                  <span className="font-mono text-foreground">{Math.floor(preview.valorBruto)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-border pt-2">
                  <span className="text-sm text-red-400">Taxa do Banco ({preview.taxa * 100}%):</span>
                  <span className="font-mono text-red-400">-{preview.valorDesconto}</span>
                </div>
                <div className="flex justify-between items-center border-t border-border pt-2 bg-green-500/10 p-2 rounded">
                  <span className="text-sm font-bold text-green-400">Player Recebe (Final):</span>
                  <span className="text-xl font-bold font-mono text-green-400">{preview.valorFinal}</span>
                </div>
              </div>

              <div className="bg-primary/10 p-3 rounded-md border border-primary/30">
                <p className="text-xs text-primary/70">
                  <strong>Entrega:</strong> Você deve entregar exatamente <strong className="text-primary">{preview.valorFinal}x {tabelaSelecionada?.itemResultado}</strong> ao player.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Histórico */}
      {trocas.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2 mt-6">
            <Clock className="w-4 h-4 text-muted-foreground" /> Histórico de Trocas
          </h3>
          <div className="rounded-md border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-accent/50">
                    <th className="text-left px-3 py-2 text-xs font-bold text-muted-foreground">Data</th>
                    <th className="text-left px-3 py-2 text-xs font-bold text-muted-foreground">Player</th>
                    <th className="text-left px-3 py-2 text-xs font-bold text-muted-foreground">Entregou</th>
                    <th className="text-left px-3 py-2 text-xs font-bold text-muted-foreground">Recebeu</th>
                    <th className="text-center px-3 py-2 text-xs font-bold text-muted-foreground">Taxa</th>
                    <th className="text-center px-3 py-2 text-xs font-bold text-muted-foreground">Lucro Banco</th>
                  </tr>
                </thead>
                <tbody>
                  {trocas.slice().reverse().map((t) => (
                    <tr key={t.id} className="border-b border-border/50 hover:bg-accent/30">
                      <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(t.data).toLocaleDateString("pt-BR")}</td>
                      <td className="px-3 py-2 text-foreground">{t.player}</td>
                      <td className="px-3 py-2 text-red-400 font-mono">{t.quantidadeEnviada}x {t.itemEnviado}</td>
                      <td className="px-3 py-2 text-green-400 font-mono">{t.quantidadeRecebida}x {t.itemRecebido}</td>
                      <td className="px-3 py-2 text-center text-muted-foreground">{t.taxaAplicada}%</td>
                      <td className="px-3 py-2 text-center font-mono text-primary">{t.lucroBanco}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
