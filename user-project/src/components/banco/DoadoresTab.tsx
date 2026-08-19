"use client";
import { useState } from "react";
import { useBank } from "@/lib/useBank";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Heart, Plus, Trophy, Crown, Medal, ArrowUp, ArrowDown, Save, Shield, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import AdSlot from "@/components/AdSlot";

interface DoadoresTabProps { isAdmin: boolean; }

export default function DoadoresTab({ isAdmin }: DoadoresTabProps) {
  const { doadores, addDoador, removeDoador, reorderDoadores, isLoading } = useBank();
  const [nome, setNome] = useState("");
  const [item, setItem] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [orderedList, setOrderedList] = useState<{ nome: string; totalQuantidade: number; itens: string[] }[]>([]);

  const handleAdd = () => {
    if (!nome.trim() || !item.trim() || !quantidade) { toast.error("Preencha nome, item e quantidade."); return; }
    addDoador(nome.trim(), item.trim(), parseInt(quantidade));
    toast.success(`Doação de ${nome} registrada!`);
    setNome(""); setItem(""); setQuantidade("");
  };

  const handleDelete = async (doador: { id: string; nome: string; item: string; quantidade: number }) => {
    const confirmed = window.confirm(`Excluir a doação de ${doador.nome}?\n\n${doador.quantidade}x ${doador.item} será estornado do estoque.`);
    if (!confirmed) return;
    try {
      await removeDoador(doador.id);
      toast.success("Doação excluída e estoque estornado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível excluir a doação.");
    }
  };

  const buildRanking = () => {
    const grouped = doadores.reduce<Record<string, { nome: string; totalQuantidade: number; itens: string[]; ordem: number }>>((acc, d) => {
      const key = d.nome.toLowerCase();
      if (!acc[key]) acc[key] = { nome: d.nome, totalQuantidade: 0, itens: [], ordem: 0 };
      acc[key].totalQuantidade += d.quantidade;
      acc[key].itens.push(`${d.quantidade}x ${d.item}`);
      acc[key].ordem = Math.max(acc[key].ordem, d.ordem);
      return acc;
    }, {});
    const list = Object.values(grouped);
    list.sort((a, b) => b.ordem - a.ordem);
    return list;
  };

  const rankingList = buildRanking();

  const startReorder = () => { setOrderedList(rankingList as { nome: string; totalQuantidade: number; itens: string[] }[]); setIsReorderMode(true); };
  const moveUp = (i: number) => { if (i === 0) return; const n = [...orderedList]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; setOrderedList(n); };
  const moveDown = (i: number) => { if (i === orderedList.length - 1) return; const n = [...orderedList]; [n[i], n[i + 1]] = [n[i + 1], n[i]]; setOrderedList(n); };

  const saveOrder = async () => {
    const updates: { id: string; ordem: number }[] = [];
    for (const d of orderedList) {
      const dds = doadores.filter((dd) => dd.nome.toLowerCase() === d.nome.toLowerCase());
      dds.forEach((dd) => updates.push({ id: dd.id, ordem: orderedList.length - orderedList.indexOf(d) }));
    }
    await reorderDoadores(updates);
    toast.success("Ordem atualizada!");
    setIsReorderMode(false);
  };

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Carregando...</div>;

  return (
    <div className="space-y-4">
      <AdSlot size="banner" id="doadores-top" isAdmin={isAdmin} className="my-3" />
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-primary">❤️ Doadores</h2>
        {!isAdmin && (<span className="text-xs text-muted-foreground flex items-center gap-1"><Shield className="w-3 h-3" /> Modo visual</span>)}
      </div>
      <p className="text-sm text-muted-foreground">Registre doações. Toda doação entra no estoque automaticamente.</p>
      {rankingList.length > 0 && (
        <div className="rounded-lg border border-primary/20 bg-card overflow-hidden">
          <div className="bg-primary/10 px-4 py-3 border-b border-primary/20"><h3 className="text-sm font-bold text-primary flex items-center gap-2"><Trophy className="w-4 h-4" /> Ranking</h3></div>
          <div className="p-4 space-y-2">
            {rankingList.map((d, i) => (
              <div key={d.nome} className={`rounded-md border p-3 flex items-center justify-between ${i === 0 ? "border-yellow-500/40 bg-yellow-500/5" : i === 1 ? "border-gray-300/30 bg-gray-300/5" : i === 2 ? "border-orange-700/30 bg-orange-700/5" : "border-border bg-card"}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center">{i === 0 ? <Crown className="w-5 h-5 text-yellow-400" /> : i === 1 ? <Medal className="w-5 h-5 text-gray-300" /> : i === 2 ? <Medal className="w-5 h-5 text-orange-600" /> : <span className="text-sm font-bold text-muted-foreground">#{i + 1}</span>}</div>
                  <div><p className="text-sm font-bold text-foreground">{d.nome}</p><p className="text-xs text-muted-foreground">{d.itens.join(", ")}</p></div>
                </div>
                <div className="text-right"><p className="text-lg font-bold font-mono text-primary">{d.totalQuantidade.toLocaleString()}</p><p className="text-xs text-muted-foreground">total</p></div>
              </div>
            ))}
          </div>
        </div>
      )}
      {isAdmin && (<>
      {!isReorderMode ? (
        <Button onClick={startReorder} variant="outline" className="text-sm border-primary/30 text-primary hover:bg-primary/10"><ArrowUp className="w-4 h-4 mr-1" /> Reordenar</Button>
      ) : (
        <div className="rounded-md border border-primary/30 bg-card p-4">
          <h3 className="text-sm font-bold text-foreground mb-3">Reordenar Doadores</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">{orderedList.map((d, i) => (
            <div key={d.nome} className="flex items-center gap-2 p-2 rounded-md border border-border bg-muted/30">
              <div className="flex flex-col gap-1"><button onClick={() => moveUp(i)} className="text-muted-foreground hover:text-primary disabled:opacity-30" disabled={i === 0}><ArrowUp className="w-4 h-4" /></button><button onClick={() => moveDown(i)} className="text-muted-foreground hover:text-primary disabled:opacity-30" disabled={i === orderedList.length - 1}><ArrowDown className="w-4 h-4" /></button></div>
              <div className="flex items-center gap-2 flex-1"><span className="text-sm font-bold text-muted-foreground w-6">{i + 1}º</span><Heart className="w-4 h-4 text-red-400" /><span className="text-sm font-semibold text-foreground">{d.nome}</span></div>
            </div>
          ))}</div>
          <div className="flex gap-2 mt-3"><Button onClick={saveOrder} className="bg-primary hover:bg-primary/90 text-primary-foreground"><Save className="w-4 h-4 mr-1" /> Salvar</Button><Button onClick={() => setIsReorderMode(false)} variant="outline">Cancelar</Button></div>
        </div>
      )}
      <div className="rounded-md border border-border bg-card p-4">
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Plus className="w-4 h-4 text-primary" /> Nova Doação</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div><Label className="text-xs text-muted-foreground">Nome</Label><Input placeholder="Player" value={nome} onChange={(e) => setNome(e.target.value)} className="text-sm" /></div>
          <div><Label className="text-xs text-muted-foreground">Item</Label><Input placeholder="Ex: Moeda" value={item} onChange={(e) => setItem(e.target.value)} className="text-sm" /></div>
          <div><Label className="text-xs text-muted-foreground">Quantidade</Label><Input type="number" placeholder="1000" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} className="text-sm font-mono" /></div>
        </div>
        <div className="mt-3"><Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground"><Heart className="w-4 h-4 mr-1" /> Registrar Doação</Button></div>
      </div>
      </>)}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-2">Histórico ({doadores.length})</h3>
        {doadores.length === 0 ? (<div className="rounded-md border border-border bg-card p-4 text-center text-muted-foreground text-sm">Nenhuma doação.</div>) : (
          <div className="space-y-2">{[...doadores].reverse().map((d) => (<div key={d.id} className="rounded-md border border-border bg-card p-3 flex items-center gap-3 hover:border-primary/20"><Heart className="w-4 h-4 text-red-400" /><div className="min-w-0 flex-1"><p className="text-sm font-bold text-foreground">{d.nome}</p><p className="text-xs text-muted-foreground">{d.quantidade}x {d.item} - {new Date(d.data).toLocaleDateString("pt-BR")}</p></div>{isAdmin && <Button type="button" variant="outline" size="sm" onClick={() => void handleDelete(d)} className="shrink-0 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300" aria-label={`Excluir doação de ${d.nome}`}><Trash2 className="w-4 h-4" /></Button>}</div>))}</div>
        )}
      </div>
      <AdSlot size="banner" id="doadores-bottom" isAdmin={isAdmin} className="my-3" />
    </div>
  );
}
