"use client";
import { useState } from "react";
import { useBank } from "@/lib/useBank";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Settings } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

export default function ConfigTrocasTab() {
  const { tabelasTroca, addTabelaTroca, removeTabelaTroca } = useBank();
  const [itemBase, setItemBase] = useState("");
  const [qtdBase, setQtdBase] = useState("1");
  const [itemResult, setItemResult] = useState("");
  const [qtdResult, setQtdResult] = useState("");

  const handleAdd = () => {
    if (!itemBase || !qtdBase || !itemResult || !qtdResult) { toast.error("Preencha todos os campos."); return; }
    addTabelaTroca({ itemBase, quantidadeBase: parseFloat(qtdBase), itemResultado: itemResult, quantidadeResultado: parseFloat(qtdResult) });
    toast.success("Tabela adicionada!");
    setItemBase(""); setQtdBase("1"); setItemResult(""); setQtdResult("");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-primary flex items-center gap-2"><Settings className="w-5 h-5" /> Configuração de Tabelas de Troca</h2>
      <div className="rounded-md border border-border bg-card p-4">
        <h3 className="text-sm font-bold text-foreground mb-3">Nova Regra</h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
          <div className="sm:col-span-2 space-y-2"><Label className="text-xs text-muted-foreground">Se o player der...</Label><div className="flex gap-2"><Input type="number" placeholder="Qtd" value={qtdBase} onChange={(e) => setQtdBase(e.target.value)} className="w-20 font-mono text-sm" /><Input placeholder="Item" value={itemBase} onChange={(e) => setItemBase(e.target.value)} className="flex-1 text-sm" /></div></div>
          <div className="flex justify-center pb-2 text-muted-foreground"><span>➜</span></div>
          <div className="sm:col-span-2 space-y-2"><Label className="text-xs text-muted-foreground">Ele recebe...</Label><div className="flex gap-2"><Input type="number" placeholder="Qtd" value={qtdResult} onChange={(e) => setQtdResult(e.target.value)} className="w-20 font-mono text-sm" /><Input placeholder="Item" value={itemResult} onChange={(e) => setItemResult(e.target.value)} className="flex-1 text-sm" /></div></div>
        </div>
        <Button onClick={handleAdd} className="mt-4 w-full bg-primary hover:bg-primary/90"><Plus className="w-4 h-4 mr-2" /> Adicionar</Button>
      </div>
      <div className="rounded-md border border-border bg-card overflow-hidden">
        <table className="w-full text-sm"><thead><tr className="border-b border-border bg-accent/50"><th className="text-left px-4 py-2 text-xs font-bold text-muted-foreground">Base</th><th className="text-center px-4 py-2 text-xs font-bold text-muted-foreground">Proporção</th><th className="text-left px-4 py-2 text-xs font-bold text-muted-foreground">Resultado</th><th className="text-right px-4 py-2 text-xs font-bold text-muted-foreground">Ações</th></tr></thead>
          <tbody>{tabelasTroca.length === 0 ? (<tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground italic">Nenhuma regra configurada.</td></tr>) : tabelasTroca.map((t) => (<tr key={t.id} className="border-b border-border/50 hover:bg-accent/30"><td className="px-4 py-3"><span className="font-bold text-primary">{t.quantidadeBase}x</span> {t.itemBase}</td><td className="px-4 py-3 text-center text-muted-foreground">=</td><td className="px-4 py-3"><span className="font-bold text-green-400">{t.quantidadeResultado}x</span> {t.itemResultado}</td><td className="px-4 py-3 text-right"><Button variant="ghost" size="sm" onClick={() => removeTabelaTroca(t.id)} className="text-red-400 hover:text-red-300 hover:bg-red-400/10"><Trash2 className="w-4 h-4" /></Button></td></tr>))}</tbody>
        </table>
      </div>
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-md"><p className="text-xs text-primary/80 leading-relaxed"><strong>Como funciona:</strong> As regras são usadas na aba &quot;Trocas&quot; para calcular automaticamente. Taxas: 15% comum / 10% investidor.</p></div>
    </div>
  );
}
