"use client";
import { useState, useMemo } from "react";
import { useBank } from "@/lib/useBank";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeftRight, Calculator, Plus, Clock, Shield } from "lucide-react";
import { Label } from "@/components/ui/label";

interface TrocasTabProps {
  isAdmin: boolean;
}

export default function TrocasTab({ isAdmin }: TrocasTabProps) {
  const { tabelasTroca, trocas, addTroca, isLoading } = useBank();
  const [player, setPlayer] = useState("");
  const [tipoMembro, setTipoMembro] = useState<string>("comum");
  const [tabelaId, setTabelaId] = useState("");
  const [qtdBase, setQtdBase] = useState("");
  const tabela = tabelasTroca.find((t) => t.id === tabelaId);

  const preview = useMemo(() => {
    if (!tabela || !qtdBase || parseFloat(qtdBase) <= 0) return null;
    const q = parseFloat(qtdBase);
    const grupos = q / tabela.quantidadeBase;
    const vb = grupos * tabela.quantidadeResultado;
    const taxa = tipoMembro === "especial" ? 0 : tipoMembro === "top10" ? 0.05 : tipoMembro === "investidor" ? 0.10 : tipoMembro === "comum" ? 0.15 : 0.20;
    const vd = Math.ceil(vb * taxa);
    return { taxa, valorBruto: vb, valorDesconto: vd, valorFinal: Math.floor(vb) - vd, lucroBanco: vd };
  }, [tabela, qtdBase, tipoMembro]);

  const handleRegistrar = () => {
    if (!player || !tabela || !qtdBase || parseFloat(qtdBase) <= 0 || !preview) { toast.error("Preencha todos os campos."); return; }
    addTroca({ player, itemEnviado: tabela.itemBase, quantidadeEnviada: parseFloat(qtdBase), itemRecebido: tabela.itemResultado, quantidadeRecebida: preview.valorFinal, tipoMembro, taxaAplicada: preview.taxa * 100, lucroBanco: preview.lucroBanco });
    toast.success(`Troca registrada! ${preview.valorFinal}x ${tabela.itemResultado} para ${player}`);
    setPlayer(""); setQtdBase(""); setTabelaId("");
  };

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Carregando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-primary flex items-center gap-2"><ArrowLeftRight className="w-5 h-5" /> Registro de Trocas</h2>
        {!isAdmin && (<span className="text-xs text-muted-foreground flex items-center gap-1"><Shield className="w-3 h-3" /> Modo visual</span>)}
      </div>
      {isAdmin && (<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-md border border-border bg-card p-4 h-full">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Plus className="w-4 h-4 text-primary" /> Nova Troca</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs text-muted-foreground">Player</Label><Input placeholder="Nome" value={player} onChange={(e) => setPlayer(e.target.value)} className="text-sm mt-1" /></div>
              <div><Label className="text-xs text-muted-foreground">Tipo</Label><Select value={tipoMembro} onValueChange={setTipoMembro}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="especial">Especial (0%)</SelectItem><SelectItem value="top10">Top 10 (5%)</SelectItem><SelectItem value="investidor">Investidor (10%)</SelectItem><SelectItem value="comum">Comum (15%)</SelectItem><SelectItem value="nao_contribuinte">Não Contribuinte (20%)</SelectItem></SelectContent></Select></div>
            </div>
            <div><Label className="text-xs text-muted-foreground">Item que ele entrega</Label><Select value={tabelaId} onValueChange={setTabelaId}><SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{tabelasTroca.length === 0 ? <SelectItem value="empty" disabled>Nenhuma tabela</SelectItem> : tabelasTroca.map((t) => (<SelectItem key={t.id} value={t.id}>{t.quantidadeBase}x {t.itemBase} ➜ {t.quantidadeResultado}x {t.itemResultado}</SelectItem>))}</SelectContent></Select></div>
            <div><Label className="text-xs text-muted-foreground">Quantidade (em base)</Label><Input type="number" placeholder="1000" value={qtdBase} onChange={(e) => setQtdBase(e.target.value)} className="text-sm font-mono mt-1" /></div>
            <Button onClick={handleRegistrar} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-2" disabled={!preview}>Registrar Troca</Button>
          </div>
        </div>
        <div className="rounded-md border border-border bg-card p-4 h-full">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Calculator className="w-4 h-4 text-primary" /> Calculadora</h3>
          {!preview ? (<div className="flex flex-col items-center justify-center h-[calc(100%-2rem)] text-center text-muted-foreground border-2 border-dashed border-border/50 rounded-md p-6"><p className="text-sm">Preencha o formulário ao lado.</p></div>) : (
            <div className="space-y-4">
              <div className="bg-accent/30 p-3 rounded-md border border-border"><p className="text-xs text-muted-foreground mb-1">Player entregou:</p><p className="text-lg font-bold font-mono text-primary">{qtdBase}x {tabela?.itemBase}</p></div>
              <div className="flex items-center justify-center"><ArrowLeftRight className="w-6 h-6 text-muted-foreground" /></div>
              <div className="bg-card p-3 rounded-md border border-border space-y-3">
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Bruto:</span><span className="font-mono text-foreground">{Math.floor(preview.valorBruto)}</span></div>
                <div className="flex justify-between border-t border-border pt-2"><span className="text-sm text-red-400">Taxa ({preview.taxa * 100}%):</span><span className="font-mono text-red-400">-{preview.valorDesconto}</span></div>
                <div className="flex justify-between border-t border-border pt-2 bg-green-500/10 p-2 rounded"><span className="text-sm font-bold text-green-400">Player Recebe:</span><span className="text-xl font-bold font-mono text-green-400">{preview.valorFinal}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>)}
      {trocas.length > 0 && (
        <div><h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" /> Histórico</h3>
          <div className="rounded-md border border-border bg-card overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-border bg-accent/50"><th className="text-left px-3 py-2 text-xs font-bold text-muted-foreground">Data</th><th className="text-left px-3 py-2 text-xs font-bold text-muted-foreground">Player</th><th className="text-left px-3 py-2 text-xs font-bold text-muted-foreground">Entregou</th><th className="text-left px-3 py-2 text-xs font-bold text-muted-foreground">Recebeu</th><th className="text-center px-3 py-2 text-xs font-bold text-muted-foreground">Taxa</th><th className="text-center px-3 py-2 text-xs font-bold text-muted-foreground">Lucro</th></tr></thead><tbody>{trocas.map((t) => (<tr key={t.id} className="border-b border-border/50 hover:bg-accent/30"><td className="px-3 py-2 text-xs text-muted-foreground">{new Date(t.data).toLocaleDateString("pt-BR")}</td><td className="px-3 py-2 text-foreground">{t.player}</td><td className="px-3 py-2 text-red-400 font-mono">{t.quantidadeEnviada}x {t.itemEnviado}</td><td className="px-3 py-2 text-green-400 font-mono">{t.quantidadeRecebida}x {t.itemRecebido}</td><td className="px-3 py-2 text-center text-muted-foreground">{t.taxaAplicada}%</td><td className="px-3 py-2 text-center font-mono text-primary">{t.lucroBanco}</td></tr>))}</tbody></table></div>
        </div>
      )}
    </div>
  );
}
