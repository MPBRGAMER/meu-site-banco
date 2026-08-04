/**
 * Lotérica - Sistema de lotérica do banco do clã
 * 1000 números (1-1000), 20% taxa do banco, admin configura
 */
import { useState, useEffect } from "react";
import { useBank } from "@/contexts/BankContext";
import { useCanEdit } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Dices, Plus, Trash2, Clock, Trophy, Timer, AlertCircle, PartyPopper, CheckCircle2, Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";

function LotericaTimer({ dataFim }: { dataFim: string }) {
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

export default function Loterica() {
  const { loterica, criarLoterica, comprarNumero, iniciarSorteioLoterica, isLoading } = useBank();
  const canEdit = useCanEdit();
  const [showForm, setShowForm] = useState(false);
  const [valorNumero, setValorNumero] = useState("");
  const [moedaAceita, setMoedaAceita] = useState("");
  const [premioMinimo, setPremioMinimo] = useState("");
  const [duracao, setDuracao] = useState("");

  // Compra de número
  const [numeroInput, setNumeroInput] = useState("");
  const [compradorNome, setCompradorNome] = useState("");
  const [showComprar, setShowComprar] = useState(false);

  // Buscar número
  const [searchNumero, setSearchNumero] = useState("");
  const { data: lotericaNumeros = [] } = trpc.loterica.numeros.useQuery(
    { lotericaId: loterica?.id || "" },
    { enabled: !!loterica?.id }
  );

  const handleCriar = () => {
    if (!valorNumero || !moedaAceita.trim() || !premioMinimo || !duracao) {
      toast.error("Preencha todos os campos.");
      return;
    }
    if (loterica && (loterica.status === "configurando" || loterica.status === "vendas_abertas")) {
      toast.error("Já existe uma lotérica ativa. Finalize-a primeiro.");
      return;
    }
    criarLoterica(
      parseFloat(valorNumero),
      moedaAceita.trim(),
      parseInt(premioMinimo),
      parseInt(duracao)
    );
    toast.success("Lotérica criada com sucesso!");
    setValorNumero("");
    setMoedaAceita("");
    setPremioMinimo("");
    setDuracao("");
    setShowForm(false);
  };

  const handleComprar = () => {
    if (!numeroInput.trim() || !compradorNome.trim()) {
      toast.error("Digite o número e seu nome.");
      return;
    }
    const num = parseInt(numeroInput.trim());
    if (num < 1 || num > 1000) {
      toast.error("Número deve ser entre 001 e 1000.");
      return;
    }
    if (!loterica) {
      toast.error("Nenhuma lotérica ativa.");
      return;
    }
    comprarNumero(loterica.id, num, compradorNome.trim());
    setNumeroInput("");
    setCompradorNome("");
    setShowComprar(false);
  };

  const handleIniciarSorteio = () => {
    if (!loterica) return;
    iniciarSorteioLoterica(loterica.id);
  };

  const numerosVendidos = lotericaNumeros.filter((n: any) => n.comprador);
  const numerosDisponiveis = 1000 - numerosVendidos.length;
  const taxaBanco = loterica ? Math.round((loterica.arrecadadoTotal || 0) * 0.2) : 0;
  const premioEstimado = loterica ? (loterica.arrecadadoTotal || 0) - taxaBanco : 0;

  // Filtrar por busca
  const filteredNumeros = searchNumero
    ? lotericaNumeros.filter((n: any) =>
        n.numero.toString().includes(searchNumero) ||
        (n.comprador && n.comprador.toLowerCase().includes(searchNumero.toLowerCase()))
      )
    : [];

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Carregando lotérica...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-primary">🎰 Lotérica</h2>

      {/* Regras */}
      <div className="rounded-lg border border-primary/20 bg-card p-4">
        <h3 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> Como Funciona a Lotérica
        </h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Existem <span className="text-foreground font-semibold">1000 números</span> disponíveis (001 a 1000).</li>
          <li>• Cada número tem um valor fixo definido pelo admin.</li>
          <li>• O admin define a <span className="text-primary font-semibold">duração</span> das vendas.</li>
          <li>• Quando o tempo acaba, o sorteio <span className="text-yellow-400 font-semibold">se iniciará automaticamente</span>.</li>
          <li>• <span className="text-yellow-400 font-semibold">Quanto mais números venderem, maior o prêmio!</span></li>
          <li>• Um número de 1 a 1000 é sorteado <span className="text-red-400 font-semibold">aleatoriamente</span> pelo sistema.</li>
          <li>• Se o número sorteado NÃO foi vendido, o prêmio <span className="text-yellow-400 font-semibold">acumula para a próxima lotérica!</span></li>
        </ul>
      </div>

      {/* Botão de criar - apenas admin */}
      {canEdit && !loterica && (
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-1" /> {showForm ? "Fechar" : "Nova Lotérica"}
        </Button>
      )}

      {/* Form - apenas admin */}
      {canEdit && showForm && !loterica && (
        <div className="rounded-md border border-border bg-card p-4">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Dices className="w-4 h-4 text-primary" /> Configurar Lotérica
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Valor por Número</Label>
              <Input
                type="number"
                placeholder="10"
                value={valorNumero}
                onChange={(e) => setValorNumero(e.target.value)}
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
              <Label className="text-xs text-muted-foreground">Prêmio Mínimo</Label>
              <Input
                type="number"
                placeholder="500"
                value={premioMinimo}
                onChange={(e) => setPremioMinimo(e.target.value)}
                className="text-sm font-mono"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Duração (minutos)</Label>
              <Input
                type="number"
                placeholder="1440"
                value={duracao}
                onChange={(e) => setDuracao(e.target.value)}
                className="text-sm font-mono"
              />
            </div>
          </div>
          <div className="mt-3">
            <Button onClick={handleCriar} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Dices className="w-4 h-4 mr-1" /> Criar Lotérica
            </Button>
          </div>
        </div>
      )}

      {/* Lotérica Ativa */}
      {loterica && (
        <div className="rounded-lg border border-primary/20 bg-card overflow-hidden">
          <div className="bg-primary/10 px-4 py-3 border-b border-primary/20 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Dices className="w-4 h-4 text-primary" /> Lotérica Ativa
              </h3>
              <p className="text-xs text-muted-foreground">
                {loterica.status === "configurando" && "Fase de configuração"}
                {loterica.status === "vendas_abertas" && "Vendas abertas"}
                {loterica.status === "sorteio_realizado" && "Sorteio realizado"}
              </p>
            </div>
            {loterica.dataFimVendas && (
              <LotericaTimer dataFim={loterica.dataFimVendas} />
            )}
          </div>

          <div className="p-4">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="text-center p-2 rounded-md border border-border bg-muted/30">
                <p className="text-xs text-muted-foreground">Números Vendidos</p>
                <p className="text-lg font-bold font-mono text-foreground">{numerosVendidos.length}</p>
              </div>
              <div className="text-center p-2 rounded-md border border-border bg-muted/30">
                <p className="text-xs text-muted-foreground">Disponíveis</p>
                <p className="text-lg font-bold font-mono text-green-400">{numerosDisponiveis}</p>
              </div>
              <div className="text-center p-2 rounded-md border border-border bg-muted/30">
                <p className="text-xs text-muted-foreground">Arrecadado</p>
                <p className="text-lg font-bold font-mono text-primary">{loterica.arrecadadoTotal || 0}</p>
              </div>
              <div className="text-center p-2 rounded-md border border-border bg-muted/30">
                <p className="text-xs text-muted-foreground">Prêmio Atual</p>
                <p className="text-lg font-bold font-mono text-yellow-400">{premioEstimado.toFixed(0)}</p>
              </div>
            </div>

            {/* Info */}
            <div className="text-xs text-muted-foreground mb-3 flex items-center gap-4">
              <span>Valor/Número: <strong className="text-foreground">{loterica.valorNumero} {loterica.moedaAceita}</strong></span>
              <span>Taxa do Banco: <strong className="text-red-400">20%</strong></span>
              {loterica.premioMinimo && (
                <span>Prêmio Mínimo: <strong className="text-yellow-400">{loterica.premioMinimo}</strong></span>
              )}
            </div>

            {/* Resultado do Sorteio */}
            {loterica.status === "sorteio_realizado" && (
              <div className="rounded-md border border-yellow-500/40 bg-yellow-500/5 p-4 mb-4">
                <div className="flex items-center gap-3">
                  <PartyPopper className="w-6 h-6 text-yellow-400" />
                  <div>
                    <p className="text-sm font-bold text-yellow-400">Sorteio Realizado!</p>
                    <p className="text-xs text-foreground">
                      Número Sorteado: <span className="font-bold font-mono text-yellow-400">{String(loterica.numeroSorteado).padStart(3, '0')}</span>
                    </p>
                    {loterica.ganhador ? (
                      <p className="text-xs text-foreground">
                        Ganhador: <span className="font-bold text-yellow-400">{loterica.ganhador}</span>
                      </p>
                    ) : (
                      <p className="text-xs text-red-400 font-semibold">
                        Número não vendido! Prêmio acumulou para a próxima lotérica.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Ações */}
            <div className="flex flex-wrap gap-2 mb-4">
              {loterica.status === "vendas_abertas" && loterica.dataFimVendas && new Date(loterica.dataFimVendas).getTime() < Date.now() && (
                <span className="text-xs text-muted-foreground italic">Sorteio será realizado automaticamente...</span>
              )}
              {canEdit && loterica.status === "configurando" && (
                <p className="text-xs text-muted-foreground">Lotérica em configuração. Aguardando abertura de vendas pelo admin.</p>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowComprar(!showComprar)}
                className="border-primary/30 text-primary hover:bg-primary/10"
              >
                <Dices className="w-3 h-3 mr-1" /> Comprar Número
              </Button>
            </div>

            {/* Form Comprar */}
            {showComprar && (
              <div className="rounded-md border border-border bg-muted/30 p-3 mb-4">
                <h4 className="text-xs font-bold text-foreground mb-2">Comprar Número</h4>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Número (001-1000)</Label>
                    <Input
                      type="number"
                      placeholder="042"
                      value={numeroInput}
                      onChange={(e) => setNumeroInput(e.target.value)}
                      className="text-sm font-mono"
                      min={1}
                      max={1000}
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Seu Nome</Label>
                    <Input
                      placeholder="Nome do player"
                      value={compradorNome}
                      onChange={(e) => setCompradorNome(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      size="sm"
                      onClick={handleComprar}
                      className="bg-primary text-primary-foreground"
                    >
                      Comprar
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Busca de números */}
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Buscar por número ou comprador..."
                value={searchNumero}
                onChange={(e) => setSearchNumero(e.target.value)}
                className="text-sm flex-1"
              />
              <Button variant="outline" size="sm" onClick={() => setSearchNumero("")}>
                <Search className="w-3 h-3" />
              </Button>
            </div>

            {/* Lista de números */}
            <div className="max-h-64 overflow-y-auto">
              {(filteredNumeros.length > 0 ? filteredNumeros : lotericaNumeros.slice(0, 50)).map((n: any) => (
                <div
                  key={n.id}
                  className={`flex items-center justify-between py-1.5 px-2 rounded text-xs border-b border-border/30 ${
                    n.comprador ? "bg-green-500/5" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`font-mono font-bold w-10 ${n.comprador ? "text-green-400" : "text-muted-foreground"}`}>
                      {String(n.numero).padStart(3, '0')}
                    </span>
                    {n.comprador && (
                      <span className="text-foreground">{n.comprador}</span>
                    )}
                    {!n.comprador && (
                      <span className="text-muted-foreground italic">Disponível</span>
                    )}
                  </div>
                  {n.dataCompra && (
                    <span className="text-muted-foreground">
                      {new Date(n.dataCompra).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </div>
              ))}
              {lotericaNumeros.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">Nenhum número registrado ainda.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {!loterica && (
        <div className="rounded-md border border-border bg-card p-4 text-center text-muted-foreground text-sm">
          Nenhuma lotérica ativa no momento. O admin pode criar uma nova.
        </div>
      )}
    </div>
  );
}
