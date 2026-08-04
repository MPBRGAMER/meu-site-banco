/**
 * Sorteios - Sistema de sorteios do banco do clã
 * Admin cria sorteio, membros participam, timer define fim
 */
import { useState, useEffect } from "react";
import { useBank } from "@/contexts/BankContext";
import { useCanEdit } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Dices, Plus, Trash2, Clock, Trophy, Users, Timer, AlertCircle, PartyPopper } from "lucide-react";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";

function SorteoTimer({ dataFim }: { dataFim: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const deadline = new Date(dataFim);
      const diff = deadline.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("Encerrado");
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
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [dataFim]);

  if (timeLeft === "Encerrado") {
    return (
      <span className="text-xs font-bold text-red-400 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" /> ENCERRADO
      </span>
    );
  }

  return (
    <span className="text-xs font-bold font-mono flex items-center gap-1 text-primary">
      <Timer className="w-3 h-3" /> {timeLeft}
    </span>
  );
}

function SorteioCard({ sorteio }: { sorteio: any }) {
  const { participarSorteio, sortear, removeSorteio } = useBank();
  const canEdit = useCanEdit();
  const [jogadorNome, setJogadorNome] = useState("");
  const [showParticipar, setShowParticipar] = useState(false);

  // Query de participantes
  const { data: participantes = [], refetch } = trpc.sorteios.participantes.useQuery(
    { sorteioId: sorteio.id },
    { refetchInterval: 5000 }
  );

  const handleParticipar = () => {
    if (!jogadorNome.trim()) {
      toast.error("Digite seu nome para participar.");
      return;
    }
    participarSorteio(sorteio.id, jogadorNome.trim());
    toast.success(`Você está participando do sorteio!`);
    setJogadorNome("");
    setShowParticipar(false);
    refetch();
  };

  return (
    <div className="rounded-lg border border-primary/20 bg-card overflow-hidden">
      <div className="bg-primary/10 px-4 py-3 border-b border-primary/20 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-foreground">{sorteio.nomeItem}</h4>
          <p className="text-xs text-muted-foreground">Quantidade: {sorteio.quantidade}</p>
        </div>
        {sorteio.dataFim && <SorteoTimer dataFim={sorteio.dataFim} />}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-4 mb-3 py-2 border-t border-b border-border/50">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Participantes</p>
            <p className="text-sm font-bold text-foreground flex items-center gap-1">
              <Users className="w-3 h-3" /> {participantes.length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Criado em</p>
            <p className="text-xs font-mono text-foreground">
              {new Date(sorteio.dataCriacao).toLocaleDateString("pt-BR")}
            </p>
          </div>
          {sorteio.dataFim && new Date(sorteio.dataFim).getTime() < Date.now() && (
            <div className="ml-auto">
              <span className="text-xs text-muted-foreground italic">Finalizando automaticamente...</span>
            </div>
          )}
        </div>

        {/* Lista de participantes */}
        {participantes.length > 0 && (
          <div className="mb-3 max-h-20 overflow-y-auto space-y-1">
            {participantes.map((p: any) => (
              <div key={p.id} className="flex items-center gap-2 text-xs">
                <Users className="w-3 h-3 text-primary" />
                <span className="text-foreground">{p.jogador}</span>
                <span className="text-muted-foreground ml-auto">
                  {new Date(p.data).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Participar */}
        <div className="mt-3">
          {showParticipar ? (
            <div className="flex gap-2">
              <Input
                placeholder="Seu nome"
                value={jogadorNome}
                onChange={(e) => setJogadorNome(e.target.value)}
                className="text-sm flex-1"
                onKeyDown={(e) => e.key === "Enter" && handleParticipar()}
              />
              <Button
                size="sm"
                onClick={handleParticipar}
                className="bg-primary text-primary-foreground"
              >
                Entrar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => { setShowParticipar(false); setJogadorNome(""); }}
              >
                X
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowParticipar(true)}
              className="w-full border-primary/30 text-primary hover:bg-primary/10"
            >
              <Dices className="w-3 h-3 mr-1" /> Participar do Sorteio
            </Button>
          )}
        </div>

        {/* Botão remover - admin */}
        {canEdit && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => removeSorteio(sorteio.id)}
            className="mt-2 text-xs text-muted-foreground hover:text-red-400"
          >
            <Trash2 className="w-3 h-3 mr-1" /> Remover
          </Button>
        )}
      </div>
    </div>
  );
}

export default function Sorteios() {
  const { sorteios, addSorteio, removeSorteio, isLoading } = useBank();
  const canEdit = useCanEdit();
  const [showForm, setShowForm] = useState(false);
  const [nomeItem, setNomeItem] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [duracao, setDuracao] = useState("");

  const handleAdd = () => {
    if (!nomeItem.trim() || !quantidade || !duracao) {
      toast.error("Preencha todos os campos.");
      return;
    }
    addSorteio(nomeItem.trim(), parseInt(quantidade), parseInt(duracao));
    toast.success(`Sorteio de ${nomeItem.trim()} criado!`);
    setNomeItem("");
    setQuantidade("");
    setDuracao("");
    setShowForm(false);
  };

  const sorteiosAtivos = (sorteios || []).filter((s: any) => s.status === "ativo");
  const sorteiosFinalizados = (sorteios || []).filter((s: any) => s.status === "finalizado");

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Carregando sorteios...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-primary">🎲 Sorteios</h2>

      {/* Regras */}
      <div className="rounded-lg border border-primary/20 bg-card p-4">
        <h3 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> Como Funciona o Sorteio
        </h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• O admin cria um sorteio definindo o <span className="text-foreground font-semibold">item, quantidade e duração</span>.</li>
          <li>• Qualquer membro pode participar registrando seu nome.</li>
          <li>• Quando o <span className="text-primary font-semibold">timer acaba</span>, o sorteio se iniciara automaticamente.</li>
          <li>• Um participante é escolhido aleatoriamente como <span className="text-yellow-400 font-semibold">ganhador</span>.</li>
        </ul>
      </div>

      {/* Botão de criar - apenas admin */}
      {canEdit && (
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-1" /> {showForm ? "Fechar" : "Novo Sorteio"}
        </Button>
      )}

      {/* Form - apenas admin */}
      {canEdit && showForm && (
        <div className="rounded-md border border-border bg-card p-4">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Dices className="w-4 h-4 text-primary" /> Novo Sorteio
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              <Label className="text-xs text-muted-foreground">Quantidade</Label>
              <Input
                type="number"
                placeholder="1"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                className="text-sm font-mono"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Duração (minutos)</Label>
              <Input
                type="number"
                placeholder="60"
                value={duracao}
                onChange={(e) => setDuracao(e.target.value)}
                className="text-sm font-mono"
              />
            </div>
          </div>
          <div className="mt-3">
            <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Dices className="w-4 h-4 mr-1" /> Criar Sorteio
            </Button>
          </div>
        </div>
      )}

      {/* Sorteios Ativos */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" /> Sorteios Ativos ({sorteiosAtivos.length})
        </h3>
        {sorteiosAtivos.length === 0 ? (
          <div className="rounded-md border border-border bg-card p-4 text-center text-muted-foreground text-sm">
            Nenhum sorteio ativo no momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sorteiosAtivos.map((s: any) => (
              <SorteioCard key={s.id} sorteio={s} />
            ))}
          </div>
        )}
      </div>

      {/* Sorteios Finalizados */}
      {sorteiosFinalizados.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" /> Sorteios Finalizados ({sorteiosFinalizados.length})
          </h3>
          <div className="space-y-2">
            {sorteiosFinalizados.map((s: any) => (
              <div key={s.id} className="rounded-md border border-border bg-card p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PartyPopper className="w-4 h-4 text-yellow-400" />
                  <div>
                    <p className="text-sm font-bold text-foreground">{s.nomeItem} (x{s.quantidade})</p>
                    <p className="text-xs text-muted-foreground">
                      Ganhador: <span className="text-yellow-400 font-semibold">{s.ganhador}</span>
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(s.dataCriacao).toLocaleDateString("pt-BR")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
