/**
 * Doadores - Registro de doadores do banco do clã com ranking
 * Reorder funciona por PESSOA (nome agrupado), não por doação individual
 */
import { useState } from "react";
import { useBank } from "@/contexts/BankContext";
import { useCanEdit } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Heart, Plus, Trophy, Crown, Medal, ArrowUp, ArrowDown, Save } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function Doadores() {
  const { doadores, addDoador, isLoading } = useBank();
  const canEdit = useCanEdit();
  const [nome, setNome] = useState("");
  const [item, setItem] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [orderedList, setOrderedList] = useState<{ nome: string; totalQuantidade: number; itens: string[] }[]>([]);

  const handleAdd = () => {
    if (!nome.trim() || !item.trim() || !quantidade) {
      toast.error("Preencha nome, item e quantidade.");
      return;
    }
    addDoador(nome.trim(), item.trim(), parseInt(quantidade));
    toast.success(`Doação de ${nome} registrada!`);
    setNome("");
    setItem("");
    setQuantidade("");
  };

  // Agrupar doadores por nome
  const buildRankingList = () => {
    const grouped = doadores.reduce((acc: any, d: any) => {
      const key = d.nome.toLowerCase();
      if (!acc[key]) {
        acc[key] = { nome: d.nome, totalQuantidade: 0, itens: [] as string[], ordem: 0 };
      }
      acc[key].totalQuantidade += d.quantidade;
      acc[key].itens.push(`${d.quantidade}x ${d.item}`);
      // Pegar a maior ordem entre as doações desse nome
      if (d.ordem !== undefined && d.ordem !== null) {
        acc[key].ordem = Math.max(acc[key].ordem, d.ordem);
      }
      return acc;
    }, {} as Record<string, { nome: string; totalQuantidade: number; itens: string[]; ordem: number }>);

    const list = Object.values(grouped) as { nome: string; totalQuantidade: number; itens: string[]; ordem: number }[];
    list.sort((a, b) => (b.ordem || 0) - (a.ordem || 0));
    return list;
  };

  const rankingList = buildRankingList();

  const startReorder = () => {
    setOrderedList(rankingList);
    setIsReorderMode(true);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newList = [...orderedList];
    [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
    setOrderedList(newList);
  };

  const moveDown = (index: number) => {
    if (index === orderedList.length - 1) return;
    const newList = [...orderedList];
    [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
    setOrderedList(newList);
  };

  // Usar updateDoadorOrdem para atualizar a ordem por nome (atualiza todas as doações desse nome)
  const { updateDoadorOrdem } = useBank();

  const saveOrder = () => {
    if (typeof updateDoadorOrdem === 'function') {
      orderedList.forEach((d, index) => {
        const ordem = orderedList.length - index;
        updateDoadorOrdem(d.nome, ordem);
      });
    }
    toast.success("Ordem dos doadores atualizada!");
    setIsReorderMode(false);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Carregando doadores...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-primary">❤️ Doadores</h2>

      <p className="text-sm text-muted-foreground">
        Registre aqui as doações feitas ao banco do clã. Toda doação entra automaticamente no estoque do banco.
      </p>

      {/* Ranking de Doadores */}
      {rankingList.length > 0 && (
        <div className="rounded-lg border border-primary/20 bg-card overflow-hidden">
          <div className="bg-primary/10 px-4 py-3 border-b border-primary/20">
            <h3 className="text-sm font-bold text-primary flex items-center gap-2">
              <Trophy className="w-4 h-4" /> Ranking de Doadores
            </h3>
          </div>
          <div className="p-4 space-y-2">
            {rankingList.map((d: any, index: number) => (
              <div
                key={d.nome}
                className={`rounded-md border p-3 flex items-center justify-between transition-colors ${
                  index === 0
                    ? "border-yellow-500/40 bg-yellow-500/5"
                    : index === 1
                    ? "border-gray-300/30 bg-gray-300/5"
                    : index === 2
                    ? "border-orange-700/30 bg-orange-700/5"
                    : "border-border bg-card hover:border-primary/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center">
                    {index === 0 ? (
                      <Crown className="w-5 h-5 text-yellow-400" />
                    ) : index === 1 ? (
                      <Medal className="w-5 h-5 text-gray-300" />
                    ) : index === 2 ? (
                      <Medal className="w-5 h-5 text-orange-600" />
                    ) : (
                      <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{d.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.itens.join(", ")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold font-mono text-primary">{d.totalQuantidade.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">total</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botão Reorder - apenas admin */}
      {canEdit && !isReorderMode && (
        <Button
          onClick={startReorder}
          variant="outline"
          className="text-sm border-primary/30 text-primary hover:bg-primary/10"
        >
          <ArrowUp className="w-4 h-4 mr-1" /> Reordenar Doadores
        </Button>
      )}

      {/* Modo Reorder - por PESSOA */}
      {canEdit && isReorderMode && (
        <div className="rounded-md border border-primary/30 bg-card p-4">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <ArrowUp className="w-4 h-4 text-primary" /> Reordenar Doadores (arraste os nomes)
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {orderedList.map((d, index) => (
              <div key={d.nome} className="flex items-center gap-2 p-2 rounded-md border border-border bg-muted/30">
                <div className="flex flex-col gap-1">
                  <button onClick={() => moveUp(index)} className="text-muted-foreground hover:text-primary disabled:opacity-30" disabled={index === 0}>
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => moveDown(index)} className="text-muted-foreground hover:text-primary disabled:opacity-30" disabled={index === orderedList.length - 1}>
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm font-bold text-muted-foreground w-6">{index + 1}º</span>
                  <Heart className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-semibold text-foreground">{d.nome}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <Button onClick={saveOrder} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Save className="w-4 h-4 mr-1" /> Salvar Ordem
            </Button>
            <Button onClick={() => setIsReorderMode(false)} variant="outline">
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Form - apenas admin */}
      {canEdit && (
      <div className="rounded-md border border-border bg-card p-4">
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" /> Nova Doação
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Nome do Doador</Label>
            <Input
              placeholder="Nome do player"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Item Doado</Label>
            <Input
              placeholder="Ex: Moeda Amaldiçoada"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              className="text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Quantidade</Label>
            <Input
              type="number"
              placeholder="1000"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              className="text-sm font-mono"
            />
          </div>
        </div>
        <div className="mt-3">
          <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Heart className="w-4 h-4 mr-1" /> Registrar Doação
          </Button>
        </div>
      </div>
      )}

      {/* Lista Completa de Doações */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-2">Histórico de Doações ({doadores.length})</h3>
        {doadores.length === 0 ? (
          <div className="rounded-md border border-border bg-card p-4 text-center text-muted-foreground text-sm">
            Nenhuma doação registrada ainda.
          </div>
        ) : (
          <div className="space-y-2">
            {doadores
              .slice()
              .reverse()
              .map((d: any) => (
                <div
                  key={d.id}
                  className="rounded-md border border-border bg-card p-3 flex items-center justify-between hover:border-primary/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Heart className="w-4 h-4 text-red-400" />
                    <div>
                      <p className="text-sm font-bold text-foreground">{d.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {d.quantidade}x {d.item} -{" "}
                        {new Date(d.data).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
