/**
 * Estoque - Mostra a quantidade atual de cada item no banco
 * Calculado automaticamente com base em todas as entradas e saídas do caixa
 * Usa tRPC para salvar automático na nuvem
 */
import { useBank } from "@/contexts/BankContext";
import { Package, Search, TrendingUp, TrendingDown, AlertTriangle, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Estoque() {
  const { inventory, resetBanco, isLoading } = useBank();
  const [filtro, setFiltro] = useState("");

  const itens = Object.entries(inventory)
    .filter(([_, qtd]) => qtd !== 0)
    .filter(([nome]) => nome.toLowerCase().includes(filtro.toLowerCase()))
    .sort(([, a], [, b]) => b - a);

  const totalItensDiferentes = itens.length;
  const totalPositivo = itens.reduce((acc, [_, qtd]) => (qtd > 0 ? acc + qtd : acc), 0);
  const totalNegativo = itens.reduce((acc, [_, qtd]) => (qtd < 0 ? acc + qtd : acc), 0);

  const handleReset = () => {
    if (window.confirm("Tem certeza que deseja resetar TODO o banco? Esta ação não pode ser desfeita!")) {
      resetBanco();
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Carregando estoque...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-primary flex items-center gap-2">
          <Package className="w-5 h-5" /> Estoque & Caixa
        </h2>
        <Button variant="outline" size="sm" onClick={handleReset} className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300">
          <RefreshCw className="w-4 h-4 mr-2" /> Resetar Tudo
        </Button>
      </div>

      {/* Stats de Estoque */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-md border border-green-500/20 bg-green-500/5 p-4">
          <p className="text-xs text-muted-foreground">Itens Diferentes</p>
          <p className="text-2xl font-bold font-mono text-green-400">{totalItensDiferentes}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Positivo em Estoque</p>
          <p className="text-2xl font-bold font-mono text-foreground">{totalPositivo.toLocaleString()}</p>
        </div>
        {totalNegativo !== 0 && (
          <div className="rounded-md border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-xs text-muted-foreground">Pendências (saídas &gt; entradas)</p>
            <p className="text-2xl font-bold font-mono text-red-400">{Math.abs(totalNegativo).toLocaleString()}</p>
          </div>
        )}
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar no estoque..." 
          value={filtro} 
          onChange={(e) => setFiltro(e.target.value)} 
          className="pl-9 text-sm"
        />
      </div>

      {/* Grade de Itens */}
      {itens.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
          {filtro ? "Nenhum item encontrado para esta busca." : "O estoque está vazio. Registre entradas no caixa para ver os itens aqui."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {itens.map(([nome, qtd]) => (
            <div key={nome} className="rounded-md border border-border bg-card p-3 hover:border-primary/50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Item</span>
                {qtd > 0 && qtd < 100 && (
                  <span className="flex items-center gap-1 text-[10px] text-yellow-500 font-bold bg-yellow-500/10 px-1.5 py-0.5 rounded">
                    <AlertTriangle className="w-3 h-3" /> BAIXO
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-foreground mb-3 truncate" title={nome}>
                {nome}
              </h4>
              <div className="flex items-end justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground">Quantidade</span>
                  <span className={`text-xl font-mono font-bold ${qtd > 0 ? "text-green-400" : "text-red-400"}`}>
                    {qtd > 0 ? "+" : ""}{qtd.toLocaleString()}
                  </span>
                </div>
                <div className="p-2 rounded-full bg-accent">
                  {qtd > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center italic mt-4">
        O estoque é atualizado automaticamente a cada entrada ou saída registrada no Caixa do Banco. Todos os dados são salvos na nuvem.
      </p>
    </div>
  );
}
