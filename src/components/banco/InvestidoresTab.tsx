"use client";
import { useState } from "react";
import { useBank } from "@/lib/useBank";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { UserPlus, Crown, Trash2, ArrowUp, ArrowDown, Save } from "lucide-react";
import { Label } from "@/components/ui/label";
import { getDateLocale } from "./TranslationPopup";

export default function InvestidoresTab() {
  const { investidores, addInvestidor, removeInvestidor, reorderInvestidores, isLoading } = useBank();
  const [nome, setNome] = useState("");
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [orderedList, setOrderedList] = useState<Investidor[]>([]);

  const handleAdd = () => {
    if (!nome.trim()) { toast.error("Digite o nome do investidor."); return; }
    addInvestidor(nome.trim());
    toast.success(`Investidor ${nome} adicionado!`);
    setNome("");
  };

  const startReorder = () => {
    const sorted = [...investidores].sort((a, b) => (b.ordem || 0) - (a.ordem || 0));
    setOrderedList(sorted);
    setIsReorderMode(true);
  };

  const moveUp = (i: number) => { if (i === 0) return; const n = [...orderedList]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; setOrderedList(n); };
  const moveDown = (i: number) => { if (i === orderedList.length - 1) return; const n = [...orderedList]; [n[i], n[i + 1]] = [n[i + 1], n[i]]; setOrderedList(n); };

  const saveOrder = () => {
    const updates = orderedList.map((item, i) => ({ id: item.id, ordem: orderedList.length - i }));
    reorderInvestidores(updates);
    toast.success("Ordem atualizada!");
    setIsReorderMode(false);
  };

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Carregando...</div>;
  const ativos = investidores;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-primary">💎 Membros Investidores</h2>
      <div className="rounded-md border border-primary/30 bg-primary/5 p-4">
        <p className="text-sm text-foreground"><strong className="text-primary">Benefício:</strong> Taxa de <strong className="text-green-400">10%</strong> em empréstimos e trocas (vs <strong className="text-yellow-400">15%</strong> comum).</p>
      </div>
      <div className="rounded-md border border-yellow-500/30 bg-yellow-500/5 p-4">
        <div className="flex items-start gap-3"><Crown className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" /><div><p className="text-sm font-bold text-yellow-400 mb-1">Como obter a tag?</p><p className="text-sm text-foreground">Ajude o banco — doando itens, fazendo trocas ou de qualquer outra forma.</p></div></div>
      </div>
      <div className="rounded-md border border-border bg-card p-4">
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><UserPlus className="w-4 h-4 text-primary" /> Adicionar Investidor</h3>
        <div className="flex gap-3">
          <div className="flex-1"><Label className="text-xs text-muted-foreground">Nome</Label><Input placeholder="Nome do investidor" value={nome} onChange={(e) => setNome(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} className="text-sm" /></div>
          <div className="flex items-end"><Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground"><Crown className="w-4 h-4 mr-1" /> Adicionar</Button></div>
        </div>
      </div>
      {!isReorderMode ? (
        <Button onClick={startReorder} variant="outline" className="text-sm border-primary/30 text-primary hover:bg-primary/10"><ArrowUp className="w-4 h-4 mr-1" /> Reordenar</Button>
      ) : (
        <div className="rounded-md border border-primary/30 bg-card p-4">
          <h3 className="text-sm font-bold text-foreground mb-3">Reordenar Investidores</h3>
          <div className="space-y-2">
            {orderedList.map((inv, i) => (
              <div key={inv.id} className="flex items-center gap-2 p-2 rounded-md border border-border bg-muted/30">
                <div className="flex flex-col gap-1">
                  <button onClick={() => moveUp(i)} className="text-muted-foreground hover:text-primary disabled:opacity-30" disabled={i === 0}><ArrowUp className="w-4 h-4" /></button>
                  <button onClick={() => moveDown(i)} className="text-muted-foreground hover:text-primary disabled:opacity-30" disabled={i === orderedList.length - 1}><ArrowDown className="w-4 h-4" /></button>
                </div>
                <div className="flex items-center gap-2 flex-1"><span className="text-sm font-bold text-muted-foreground w-6">{i + 1}º</span><Crown className="w-4 h-4 text-yellow-400" /><span className="text-sm font-semibold text-foreground">{inv.nome}</span><span className="text-xs text-muted-foreground ml-auto">Desde {new Date(inv.dataEntrada).toLocaleDateString(getDateLocale())}</span></div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3"><Button onClick={saveOrder} className="bg-primary hover:bg-primary/90 text-primary-foreground"><Save className="w-4 h-4 mr-1" /> Salvar</Button><Button onClick={() => setIsReorderMode(false)} variant="outline">Cancelar</Button></div>
        </div>
      )}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2"><Crown className="w-4 h-4 text-yellow-400" /> Ativos ({ativos.length})</h3>
        {ativos.length === 0 ? <div className="rounded-md border border-border bg-card p-4 text-center text-muted-foreground text-sm">Nenhum investidor.</div> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {ativos.map((inv, idx) => (
              <div key={inv.id} className={`rounded-md border p-3 flex items-center justify-between transition-colors ${idx === 0 ? "border-yellow-500/40 bg-yellow-500/5" : idx === 1 ? "border-gray-300/30 bg-gray-300/5" : idx === 2 ? "border-orange-700/30 bg-orange-700/5" : "border-primary/20 bg-card hover:border-primary/40"}`}>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 flex items-center justify-center">{idx === 0 ? <Crown className="w-5 h-5 text-yellow-400" /> : idx === 1 ? <span className="text-sm font-bold text-gray-300">2</span> : idx === 2 ? <span className="text-sm font-bold text-orange-600">3</span> : <span className="text-xs font-bold text-muted-foreground">#{idx + 1}</span>}</div>
                  <div><p className="text-sm font-bold text-foreground">{inv.nome}</p><p className="text-xs text-muted-foreground">Desde {new Date(inv.dataEntrada).toLocaleDateString(getDateLocale())}</p></div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeInvestidor(inv.id)} className="text-xs text-muted-foreground hover:text-red-400"><Trash2 className="w-4 h-4" /></Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
