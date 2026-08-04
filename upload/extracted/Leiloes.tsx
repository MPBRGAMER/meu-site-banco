/**
 * Leilões - Sistema de leilão do banco do clã
 * Admin cria leilões, qualquer pessoa pode dar lance
 * Timer de 24h, mas se alguém der lance reinicia com 1 minuto
 * Quando timer acaba -> auto status "espera"
 * Admin pode finalizar manualmente (lucro pro caixa)
 */
import { useState, useEffect, useRef } from "react";
import { useBank, type Leilao, type Lance } from "@/contexts/BankContext";
import { useCanEdit } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Gavel, Plus, Trash2, Clock, Trophy, User, Timer, AlertCircle, Pause, CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

// Timer component
function LeilaoTimer({ leilao, lancesLeilao, onTimerEnd }: { leilao: Leilao; lancesLeilao: Lance[]; onTimerEnd?: () => void }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const hasEndedRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const ultimoLance = lancesLeilao.length > 0 ? new Date(lancesLeilao[0].data) : null;
      const deadline = ultimoLance
        ? new Date(ultimoLance.getTime() + 60000)
        : new Date(leilao.dataExpiracao);

      const diff = deadline.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("Encerrado");
        setIsUrgent(false);
        if (!hasEndedRef.current) {
          hasEndedRef.current = true;
          onTimerEnd?.();
        }
      } else {
        const horas = Math.floor(diff / 3600000);
        const minutos = Math.floor((diff % 3600000) / 60000);
        const segundos = Math.floor((diff % 60000) / 1000);

        if (horas > 0) {
          setTimeLeft(`${horas}h ${minutos}m ${segundos}s`);
        } else if (minutos > 0) {
          setTimeLeft(`${minutos}m ${segundos}s`);
        } else {
          setTimeLeft(`${segundos}s`);
        }

        setIsUrgent(diff < 60000);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [leilao.dataExpiracao, lancesLeilao, onTimerEnd]);

  if (timeLeft === "Encerrado") {
    return (
      <span className="text-xs font-bold text-yellow-400 flex items-center gap-1">
        <Pause className="w-3 h-3" /> EM ESPERA
      </span>
    );
  }

  return (
    <span className={`text-xs font-bold font-mono flex items-center gap-1 ${isUrgent ? "text-red-400 animate-pulse" : "text-primary"}`}>
      <Timer className="w-3 h-3" /> {timeLeft}
    </span>
  );
}

// Lance modal
function LanceModal({ leilao, onClose }: { leilao: Leilao; onClose: () => void }) {
  const { darLance, getLancesByLeilao } = useBank();
  const [jogador, setJogador] = useState("");
  const [valor, setValor] = useState("");

  const lancesLeilao = getLancesByLeilao(leilao.id);
  const maiorLance = lancesLeilao.length > 0 ? lancesLeilao[0] : null;
  const valorMinimo = maiorLance ? maiorLance.valor + 1 : leilao.valorInicial;

  const handleSubmit = () => {
    if (!jogador.trim() || !valor) {
      toast.error("Preencha seu nome e o valor do lance.");
      return;
    }
    const valorNum = parseFloat(valor);
    if (valorNum <= valorMinimo) {
      toast.error(`O lance deve ser maior que ${valorMinimo} ${leilao.moedaAceita}`);
      return;
    }
    darLance(leilao.id, jogador.trim(), valorNum);
    toast.success(`Lance de ${valorNum} ${leilao.moedaAceita} registrado!`);
    setJogador("");
    setValor("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Gavel className="w-5 h-5 text-primary" /> Dar Lance
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Item: <span className="text-foreground font-semibold">{leilao.nomeItem}</span> | 
          Moeda: <span className="text-primary">{leilao.moedaAceita}</span>
          {maiorLance && <br />}
          {maiorLance && <span className="text-xs">Maior lance atual: {maiorLance.valor} {leilao.moedaAceita} ({maiorLance.jogador})</span>}
        </p>
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Seu Nome</Label>
            <Input
              placeholder="Nome do player"
              value={jogador}
              onChange={(e) => setJogador(e.target.value)}
              className="text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">
              Valor do Lance (mín: {valorMinimo} {leilao.moedaAceita})
            </Label>
            <Input
              type="number"
              placeholder={`${valorMinimo}`}
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="text-sm font-mono"
              min={valorMinimo + 1}
            />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button onClick={onClose} variant="outline" className="flex-1">Cancelar</Button>
          <Button onClick={handleSubmit} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
            <Gavel className="w-4 h-4 mr-1" /> Dar Lance
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Leiloes() {
  const { leiloes, addLeilao, getLancesByLeilao, updateLeilao, removeLeilao } = useBank();
  const canEdit = useCanEdit();
  const [showForm, setShowForm] = useState(false);
  const [lanceModalLeilao, setLanceModalLeilao] = useState<Leilao | null>(null);

  const utils = trpc.useUtils();
  const addCaiMutation = trpc.caixa.add.useMutation({
    onSuccess: () => { utils.caixa.invalidate(); utils.leiloes.invalidate(); },
  });

  // Form state
  const [donoItem, setDonoItem] = useState("");
  const [nomeItem, setNomeItem] = useState("");
  const [imagemUrl, setImagemUrl] = useState("");
  const [valorInicial, setValorInicial] = useState("");
  const [moedaAceita, setMoedaAceita] = useState("");
  const [taxaCasa, setTaxaCasa] = useState("15");
  const [tipoOrigem, setTipoOrigem] = useState<"comum" | "investidor" | "banco">("comum");

  const handleAdd = () => {
    if (!donoItem.trim() || !nomeItem.trim() || !valorInicial || !moedaAceita.trim()) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    const expiracao = new Date(Date.now() + 24 * 60 * 60 * 1000);
    addLeilao({
      donoItem: donoItem.trim(),
      nomeItem: nomeItem.trim(),
      imagemUrl: imagemUrl.trim() || null,
      valorInicial: parseFloat(valorInicial),
      moedaAceita: moedaAceita.trim(),
      taxaCasa: parseFloat(taxaCasa),
      status: "ativo",
      dataCriacao: new Date().toISOString(),
      dataExpiracao: expiracao.toISOString(),
      dataUltimoLance: null,
      vencedor: null,
      valorVencedor: null,
      tipoOrigem,
    });
    toast.success(`Leilão de ${nomeItem.trim()} criado!`);
    setDonoItem("");
    setNomeItem("");
    setImagemUrl("");
    setValorInicial("");
    setMoedaAceita("");
    setShowForm(false);
  };

  const leiloesAtivos = leiloes.filter(l => l.status === "ativo" || l.status === "espera");
  const leiloesFinalizados = leiloes.filter(l => l.status === "finalizado");

  const handleFinalizarLeilao = (leilao: Leilao) => {
    const lancesLeilao = getLancesByLeilao(leilao.id);
    if (lancesLeilao.length === 0) {
      toast.error("Não há lances neste leilão.");
      return;
    }

    const vencedor = lancesLeilao[0];
    const tipoOrigem = leilao.tipoOrigem || "comum";
    const lucroBanco = tipoOrigem === "banco" ? vencedor.valor : Math.round(vencedor.valor * ((leilao.taxaCasa || 15) / 100));

    updateLeilao(leilao.id, {
      status: "finalizado",
      vencedor: vencedor.jogador,
      valorVencedor: vencedor.valor,
    });

    const descricao = tipoOrigem === "banco"
      ? `Leilão do banco: ${leilao.nomeItem} (vencedor: ${vencedor.jogador})`
      : `Taxa casa leilão: ${leilao.nomeItem} (vencedor: ${vencedor.jogador})`;

    addCaiMutation.mutate({
      tipo: "entrada",
      descricao,
      item: leilao.moedaAceita,
      quantidade: lucroBanco,
      origem: "leilao",
    });

    toast.success(`Leilão finalizado! Lucro do banco: ${lucroBanco} ${leilao.moedaAceita}`);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-primary">🔨 Leilões</h2>

      {/* Regras do Leilão */}
      <div className="rounded-lg border border-primary/20 bg-card p-4">
        <h3 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> Como Funciona o Leilão
        </h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• O leilão dura <span className="text-foreground font-semibold">24 horas</span> após ser criado.</li>
          <li>• Qualquer pessoa pode dar um lance colocando seu nome e o valor oferecido.</li>
          <li>• O lance <span className="text-red-400 font-semibold">não pode ser menor</span> que o maior lance já dado.</li>
          <li>• Se alguém der um novo lance, o timer <span className="text-primary font-semibold">reinicia com 1 minuto</span>.</li>
          <li>• Quando o timer acaba, o leilão <span className="text-yellow-400 font-semibold">encerrará automaticamente</span>.</li>
          <li>• A taxa da casa é: <span className="text-foreground font-semibold">15% (comum)</span>, <span className="text-yellow-400 font-semibold">10% (investidor)</span> ou <span className="text-blue-400 font-semibold">100% (item do banco)</span>.</li>
          <li>• Quando o item é do banco, todo o valor arrecadado vai direto para o caixa.</li>
          <li>• O lucro da taxa vai direto para o caixa do banco na moeda do leilão.</li>
        </ul>
      </div>

      {/* Botão de criar leilão - apenas admin */}
      {canEdit && (
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-1" /> {showForm ? "Fechar" : "Novo Leilão"}
        </Button>
      )}

      {/* Form - apenas admin */}
      {canEdit && showForm && (
        <div className="rounded-md border border-border bg-card p-4">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" /> Novo Leilão
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Dono do Item</Label>
              <Input
                placeholder="Nome do dono"
                value={donoItem}
                onChange={(e) => setDonoItem(e.target.value)}
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Nome do Item</Label>
              <Input
                placeholder="Ex: Katana Lendária"
                value={nomeItem}
                onChange={(e) => setNomeItem(e.target.value)}
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">URL da Imagem (opcional)</Label>
              <Input
                placeholder="https://..."
                value={imagemUrl}
                onChange={(e) => setImagemUrl(e.target.value)}
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Valor Inicial</Label>
              <Input
                type="number"
                placeholder="1000"
                value={valorInicial}
                onChange={(e) => setValorInicial(e.target.value)}
                className="text-sm font-mono"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Moeda Aceita</Label>
              <Input
                placeholder="Ex: Moeda Amaldiçoada"
                value={moedaAceita}
                onChange={(e) => setMoedaAceita(e.target.value)}
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Origem do Item</Label>
              <select
                value={tipoOrigem}
                onChange={(e) => {
                  const t = e.target.value as "comum" | "investidor" | "banco";
                  setTipoOrigem(t);
                  if (t === "comum") setTaxaCasa("15");
                  else if (t === "investidor") setTaxaCasa("10");
                  else if (t === "banco") setTaxaCasa("100");
                }}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/40"
              >
                <option value="comum">Comum (taxa 15%)</option>
                <option value="investidor">Investidor (taxa 10%)</option>
                <option value="banco">Item do Banco (100% pro banco)</option>
              </select>
            </div>
          </div>
          <div className="mt-3">
            <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Gavel className="w-4 h-4 mr-1" /> Criar Leilão
            </Button>
          </div>
        </div>
      )}

      {/* Leilões Ativos (e em espera) */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" /> Leilões Ativos ({leiloesAtivos.length})
        </h3>
        {leiloesAtivos.length === 0 ? (
          <div className="rounded-md border border-border bg-card p-4 text-center text-muted-foreground text-sm">
            Nenhum leilão ativo no momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leiloesAtivos.map((leilao) => {
              const lancesLeilao = getLancesByLeilao(leilao.id);
              const maiorLance = lancesLeilao.length > 0 ? lancesLeilao[0] : null;

              return (
                <div key={leilao.id} className={`rounded-lg border overflow-hidden ${
                  leilao.status === "espera" ? "border-yellow-500/30 bg-yellow-500/5" : "border-primary/20 bg-card"
                }`}>
                  {/* Imagem do item */}
                  {leilao.imagemUrl && (
                    <div className="h-32 bg-muted/50 flex items-center justify-center overflow-hidden">
                      <img
                        src={leilao.imagemUrl}
                        alt={leilao.nomeItem}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{leilao.nomeItem}</h4>
                        <p className="text-xs text-muted-foreground">Dono: {leilao.donoItem}</p>
                        {leilao.status === "espera" && (
                          <p className="text-xs text-yellow-400 font-semibold mt-1 flex items-center gap-1">
                            <Pause className="w-3 h-3" /> Aguardando finalização do admin
                          </p>
                        )}
                      </div>
                      <LeilaoTimer
                        leilao={leilao}
                        lancesLeilao={lancesLeilao}
                        onTimerEnd={() => {
                          if (leilao.status === "ativo") {
                            updateLeilao(leilao.id, { status: "espera" });
                            toast.info(`Leilão "${leilao.nomeItem}" encerrado! Aguardando finalização.`);
                          }
                        }}
                      />
                    </div>

                    <div className="flex items-center gap-4 mb-3 py-2 border-t border-b border-border/50">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Valor Inicial</p>
                        <p className="text-sm font-bold text-foreground">{leilao.valorInicial}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Maior Lance</p>
                        <p className="text-sm font-bold text-primary">{maiorLance ? maiorLance.valor : leilao.valorInicial}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Lances</p>
                        <p className="text-sm font-bold text-foreground">{lancesLeilao.length}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Moeda</p>
                        <p className="text-xs font-semibold text-primary">{leilao.moedaAceita}</p>
                      </div>
                      {leilao.taxaCasa && (
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Taxa</p>
                          <p className="text-xs font-bold text-foreground">{leilao.taxaCasa}%</p>
                        </div>
                      )}
                    </div>

                    {/* Últimos lances */}
                    {lancesLeilao.length > 0 && (
                      <div className="mb-3 max-h-24 overflow-y-auto space-y-1">
                        {lancesLeilao.slice(0, 5).map((lance) => (
                          <div key={lance.id} className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <User className="w-3 h-3" /> {lance.jogador}
                            </span>
                            <span className="font-mono text-foreground">{lance.valor} {leilao.moedaAceita}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      {leilao.status === "ativo" && (
                        <Button
                          onClick={() => setLanceModalLeilao(leilao)}
                          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
                        >
                          <Gavel className="w-3 h-3 mr-1" /> Dar Lance
                        </Button>
                      )}
                      {leilao.status === "espera" && canEdit && (
                        <Button
                          onClick={() => handleFinalizarLeilao(leilao)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs"
                          title="Finalizar leilão e lançar lucro no caixa"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" /> Finalizar
                        </Button>
                      )}
                      {canEdit && (
                        <Button
                          onClick={() => {
                            if (confirm(`Remover leilão "${leilao.nomeItem}"?`)) {
                              removeLeilao(leilao.id);
                            }
                          }}
                          variant="destructive"
                          className="text-xs"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Leilões Finalizados */}
      {leiloesFinalizados.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" /> Leilões Finalizados ({leiloesFinalizados.length})
          </h3>
          <div className="space-y-2">
            {leiloesFinalizados.map((leilao) => (
              <div key={leilao.id} className="rounded-md border border-yellow-500/20 bg-yellow-500/5 p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-sm font-bold text-foreground">{leilao.nomeItem}</p>
                    <p className="text-xs text-muted-foreground">
                      Vencedor: <span className="text-yellow-400">{leilao.vencedor || "Ninguém"}</span> | 
                      Valor: <span className="text-primary font-mono">{leilao.valorVencedor || 0} {leilao.moedaAceita}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Lance */}
      {lanceModalLeilao && (
        <LanceModal leilao={lanceModalLeilao} onClose={() => setLanceModalLeilao(null)} />
      )}
    </div>
  );
}
