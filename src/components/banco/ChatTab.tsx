"use client";
import { useState, useEffect, useRef } from "react";
import { useChat } from "@/lib/useChat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  MessageCircle, Hash, Lock, Plus, Trash2, Send, Shield, ChevronRight, X, LogIn, Menu, Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AdSlot from "@/components/AdSlot";
import { TranslationPopupSmall } from "./TranslationPopup";
import ChatMessageContent from "./ChatMessageContent";

const CANAIS = [
  { id: "geral", nome: "Geral", icon: "💬", cor: "text-blue-400" },
  { id: "atendimento", nome: "Atendimento", icon: "🎧", cor: "text-green-400" },
  { id: "guias", nome: "Guias", icon: "📚", cor: "text-purple-400" },
  { id: "clas", nome: "Clãs", icon: "🏰", cor: "text-orange-400" },
  { id: "comercio", nome: "Comércio", icon: "💰", cor: "text-yellow-400" },
] as const;

const DESCRICOES: Record<string, string> = {
  geral: "Bem-vindo ao Chat Geral. Espaço para todos conversarem, fazerem amizades, compartilharem experiências e trocarem conhecimentos sobre Day R Survival. Trate todos com respeito.",
  atendimento: "Espaço para contato direto com a administração. Tire dúvidas, solicite ajuda, reporte problemas, denuncie comportamentos ou envie sugestões.",
  guias: "Espaço para compartilhar guias, dicas de sobrevivência, estratégias de combate, rotas de exploração e tutoriais sobre Day R Survival.",
  clas: "Espaço para clãs se apresentarem, divulgarem recrutamentos, fazerem parcerias e compartilharem eventos. Respeito entre todos.",
  comercio: "Espaço para comprar, vender ou trocar itens. Anuncie ofertas, procure recursos específicos e negocie com educação.",
};

const REGRAS_RESUMO: Record<string, string[]> = {
  geral: ["Respeite todos os participantes", "Sem spam ou flood", "Rivalidades ficam no jogo", "Pedir/Oferecer ajuda", "Compartilhar dicas"],
  atendimento: ["Seja claro no problema", "Aguarde atendimento", "Sem spam", "Admin responde com discrição", "Não use pra conversas gerais"],
  guias: ["Conteúdo relacionado ao jogo", "Informe a versão do guia", "Evite informações sem confirmação", "Não repita conteúdos", "Respeite o trabalho dos autores"],
  clas: ["Proibido atacar outros clãs", "Sem rivalidades no chat", "Divulgue sem spam", "Jogadores sem clã são bem-vindos", "Faça parcerias"],
  comercio: ["Seja claro nas ofertas", "Respeite os acordos", "Sem spam de anúncios", "Negocie com honestidade", "Trocas são por conta dos participantes"],
};

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Hoje";
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Ontem";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

interface ChatTabProps {
  isAdmin: boolean;
}

export default function ChatTab({ isAdmin }: ChatTabProps) {
  const {
    mensagens, salas, canalAtivo, salaAtiva, isLoading, autoScrollRef,
    sendMessage, createSala, deleteMensagem, deleteSala, joinSala, leaveSala, switchCanal,
  } = useChat();

  const [nomeUsuario, setNomeUsuario] = useState("");
  const [nomeSetado, setNomeSetado] = useState(false);
  const [inputMsg, setInputMsg] = useState("");
  const [showCriarSala, setShowCriarSala] = useState(false);
  const [novaSalaNome, setNovaSalaNome] = useState("");
  const [novaSalaSenha, setNovaSalaSenha] = useState("");
  const [salaSenhaInput, setSalaSenhaInput] = useState("");
  const [salaParaEntrar, setSalaParaEntrar] = useState<ChatSala | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("chatNickname");
    if (saved) {
      setNomeUsuario(saved);
      setNomeSetado(true);
    }
  }, []);

  useEffect(() => {
    if (autoScrollRef.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [mensagens]);

  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    autoScrollRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const handleSend = () => {
    if (!inputMsg.trim()) return;
    sendMessage(inputMsg, nomeUsuario);
    setInputMsg("");
    autoScrollRef.current = true;
  };

  const handleCreateSala = async () => {
    if (!novaSalaNome.trim()) { toast.error("Nome da sala é obrigatório."); return; }
    try {
      const sala = await createSala(novaSalaNome, nomeUsuario, novaSalaSenha || undefined);
      setNovaSalaNome("");
      setNovaSalaSenha("");
      setShowCriarSala(false);
      joinSala(sala.id);
    } catch { /* handled */ }
  };

  const handleJoinSala = (sala: ChatSala) => {
    if (sala.senha) {
      setSalaParaEntrar(sala);
      setSalaSenhaInput("");
    } else {
      joinSala(sala.id);
    }
  };

  const confirmJoinSala = () => {
    if (!salaParaEntrar) return;
    joinSala(salaParaEntrar.id);
    setSalaParaEntrar(null);
  };

  const handleSetNome = () => {
    if (!nomeUsuario.trim()) { toast.error("Digite um nome."); return; }
    localStorage.setItem("chatNickname", nomeUsuario.trim());
    setNomeSetado(true);
  };

  const currentCanalInfo = CANAIS.find((c) => c.id === canalAtivo);
  const currentSala = salas.find((s) => s.id === salaAtiva);
  const isSala = !!salaAtiva;

  const groupedMessages: { date: string; msgs: typeof mensagens }[] = [];
  let currentDate = "";
  for (const msg of mensagens) {
    const dateKey = new Date(msg.data).toDateString();
    if (dateKey !== currentDate) {
      currentDate = dateKey;
      groupedMessages.push({ date: msg.data, msgs: [msg] });
    } else {
      groupedMessages[groupedMessages.length - 1].msgs.push(msg);
    }
  }

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Carregando chat...</div>;

  if (!nomeSetado) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="rounded-lg border border-primary/20 bg-card p-6 w-full max-w-sm">
          <div className="text-center mb-4">
            <MessageCircle className="w-10 h-10 text-primary mx-auto mb-2" />
            <h2 className="text-lg font-bold text-foreground">Chat - Posto de Trocas</h2>
            <p className="text-xs text-muted-foreground mt-1">Digite seu nome para entrar no chat.</p>
          </div>
          <div className="flex gap-2">
            <Input placeholder="Seu nome no jogo" value={nomeUsuario} onChange={(e) => setNomeUsuario(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSetNome()} className="flex-1" autoFocus />
            <Button onClick={handleSetNome} className="bg-primary text-primary-foreground">Entrar</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <AdSlot size="leaderboard" id="chat-top" isAdmin={isAdmin} className="my-3" />
    <div className="flex gap-0 rounded-lg border border-border bg-card overflow-hidden" style={{ height: "calc(100vh - 180px)", minHeight: 400 }}>
      <div className={cn(
        "border-r border-border bg-muted/30 flex flex-col shrink-0 transition-all duration-200",
        sidebarOpen ? "w-56" : "w-10"
      )}>
        <div className="p-2 border-b border-border flex items-center justify-between">
          {sidebarOpen && <span className="text-xs font-bold text-muted-foreground uppercase">Canais</span>}
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-1 space-y-0.5">
          {sidebarOpen && (
            <>
              {CANAIS.map((canal) => (
                <button
                  key={canal.id}
                  onClick={() => { switchCanal(canal.id); setShowWelcome(false); }}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors text-left",
                    canalAtivo === canal.id && !isSala
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <span>{canal.icon}</span>
                  <Hash className="w-3 h-3 opacity-50" />
                  <span className="truncate text-xs font-medium">{canal.nome}</span>
                  {canalAtivo === canal.id && !isSala && <ChevronRight className="w-3 h-3 ml-auto" />}
                </button>
              ))}

              <div className="flex items-center gap-2 px-2 py-1.5 mt-2 mb-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Salas Privadas</span>
                {sidebarOpen && (
                  <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-auto" onClick={() => setShowCriarSala(true)}>
                    <Plus className="w-3 h-3 text-muted-foreground" />
                  </Button>
                )}
              </div>

              {salas.map((sala) => (
                <div key={sala.id} className="flex items-center group">
                  <button
                    onClick={() => { handleJoinSala(sala); setShowWelcome(false); }}
                    className={cn(
                      "flex-1 flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors text-left",
                      salaAtiva === sala.id
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Lock className="w-3 h-3 opacity-50" />
                    <span className="truncate text-xs font-medium">{sala.nome}</span>
                    {isAdmin && (
                      <button
                        onClick={(e) => { e.stopPropagation(); if (confirm(`Deletar sala ${sala.nome}?`)) deleteSala(sala.id); }}
                        className="opacity-0 group-hover:opacity-100 ml-auto text-muted-foreground hover:text-red-400 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </button>
                </div>
              ))}
              {salas.length === 0 && sidebarOpen && (
                <p className="text-[10px] text-muted-foreground px-2 py-1 italic">Nenhuma sala criada.</p>
              )}
            </>
          )}
          {!sidebarOpen && (
            <div className="space-y-1 mt-1">
              {CANAIS.map((canal) => (
                <button
                  key={canal.id}
                  onClick={() => { switchCanal(canal.id); setShowWelcome(false); }}
                  title={canal.nome}
                  className={cn(
                    "w-full flex items-center justify-center p-1.5 rounded-md transition-colors",
                    canalAtivo === canal.id && !isSala ? "bg-primary/15" : "hover:bg-muted/50"
                  )}
                >
                  <span className="text-sm">{canal.icon}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {sidebarOpen && showCriarSala && (
          <div className="border-t border-border p-2 space-y-2">
            <Input placeholder="Nome da sala" value={novaSalaNome} onChange={(e) => setNovaSalaNome(e.target.value)} className="text-xs h-7" maxLength={30} />
            <Input placeholder="Senha (opcional)" type="password" value={novaSalaSenha} onChange={(e) => setNovaSalaSenha(e.target.value)} className="text-xs h-7" />
            <div className="flex gap-1">
              <Button size="sm" onClick={handleCreateSala} className="flex-1 bg-primary text-primary-foreground text-xs h-7">Criar</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowCriarSala(false)} className="text-xs h-7"><X className="w-3 h-3" /></Button>
            </div>
          </div>
        )}

        {sidebarOpen && (
          <AdSlot size="mobile-banner" id="chat-sidebar" isAdmin={isAdmin} className="mx-1 mt-1" />
        )}
        {sidebarOpen && (
          <div className="border-t border-border p-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                {nomeUsuario.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{nomeUsuario}</p>
                <p className="text-[10px] text-muted-foreground">{isAdmin ? "Admin" : "Membro"}</p>
              </div>
              {isAdmin && <Shield className="w-3 h-3 text-primary" />}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="border-b border-border px-4 py-2 flex items-center justify-between bg-card shrink-0">
          <div className="flex items-center gap-2">
            {isSala ? (
              <>
                <Lock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-bold text-foreground">{currentSala?.nome || "Sala"}</span>
                <span className="text-[10px] text-muted-foreground">por {currentSala?.criadoPor}</span>
              </>
            ) : (
              <>
                <span className="text-base">{currentCanalInfo?.icon}</span>
                <Hash className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-bold text-foreground">{currentCanalInfo?.nome}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
              onClick={() => setShowTranslation(true)}
              title="Como traduzir o site"
            >
              <Globe className="w-3.5 h-3.5" />
            </Button>
            {isSala && (
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={leaveSala}>
                <X className="w-3 h-3 mr-1" /> Voltar
              </Button>
            )}
          </div>
        </div>

        {showWelcome && !isSala && currentCanalInfo && mensagens.length === 0 && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-lg mx-auto space-y-4">
              <div className="text-center">
                <span className="text-3xl">{currentCanalInfo.icon}</span>
                <h3 className="text-lg font-bold text-foreground mt-2">Chat {currentCanalInfo.nome} - Posto de Trocas</h3>
                <p className="text-xs text-muted-foreground mt-1">Posto de Trocas - Sobreviventes</p>
                <p className="text-[10px] text-muted-foreground italic">"Um território onde todos os sobreviventes são bem-vindos."</p>
              </div>
              <div className="rounded-md border border-border bg-muted/20 p-3">
                <p className="text-xs text-foreground leading-relaxed">{DESCRICOES[currentCanalInfo.id]}</p>
              </div>
              <div className="rounded-md border border-yellow-500/20 bg-yellow-500/5 p-3">
                <p className="text-xs font-bold text-yellow-400 mb-2">Regras:</p>
                <ul className="space-y-1">
                  {(REGRAS_RESUMO[currentCanalInfo.id] || []).map((regra, i) => (
                    <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                      <span className="text-yellow-500 mt-0.5">•</span> {regra}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-center text-[10px] text-muted-foreground">Posto de Trocas - Sobreviventes</p>
            </div>
          </div>
        )}

        {(!showWelcome || mensagens.length > 0 || isSala) && (
          <>
            <div ref={messagesContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
              {groupedMessages.map((group) => (
                <div key={group.date}>
                  <div className="flex items-center gap-3 py-1">
                    <div className="flex-1 border-t border-border/50" />
                    <span className="text-[10px] text-muted-foreground font-medium">{formatDate(group.date)}</span>
                    <div className="flex-1 border-t border-border/50" />
                  </div>
                  {group.msgs.map((msg) => (
                    <div key={msg.id} className="group flex items-start gap-2 py-0.5 px-1 rounded hover:bg-muted/20 transition-colors">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5",
                        msg.isAdmin ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        {msg.autor.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className={cn("text-xs font-bold", msg.isAdmin ? "text-primary" : "text-foreground")}>
                            {msg.autor}
                            {msg.isAdmin && <Shield className="w-2.5 h-2.5 inline ml-1 text-primary" />}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">{formatTime(msg.data)}</span>
                        </div>
                        <div className="text-xs text-foreground/90 break-words whitespace-pre-wrap leading-relaxed">
                          <ChatMessageContent content={msg.conteudo} />
                        </div>
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => { if (confirm("Deletar mensagem?")) deleteMensagem(msg.id); }}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-opacity shrink-0 mt-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ))}
              {mensagens.length === 0 && !isSala && (
                <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                  Nenhuma mensagem ainda. Seja o primeiro a conversar!
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-border px-4 py-2 flex gap-2 shrink-0 bg-card">
              <Input
                placeholder={isSala ? `Mensagem em ${currentSala?.nome || "sala"}...` : `Mensagem em #${currentCanalInfo?.nome || canalAtivo}...`}
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                className="flex-1 text-sm h-9"
                maxLength={2000}
              />
              <Button onClick={handleSend} size="sm" className="bg-primary text-primary-foreground h-9 px-3" disabled={!inputMsg.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </div>

      {showTranslation && <TranslationPopupSmall show={showTranslation} onClose={() => setShowTranslation(false)} />}

      {salaParaEntrar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setSalaParaEntrar(null)}>
          <div className="rounded-lg border border-primary/20 bg-card p-5 w-full max-w-xs mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2"><Lock className="w-4 h-4" /> Sala Privada</h3>
            <p className="text-xs text-muted-foreground mb-3">A sala <strong>{salaParaEntrar.nome}</strong> requer senha.</p>
            <Input placeholder="Senha da sala" type="password" value={salaSenhaInput} onChange={(e) => setSalaSenhaInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && confirmJoinSala()} className="text-sm mb-3" autoFocus />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSalaParaEntrar(null)} className="flex-1 text-xs">Cancelar</Button>
              <Button onClick={confirmJoinSala} className="flex-1 bg-primary text-primary-foreground text-xs"><LogIn className="w-3 h-3 mr-1" /> Entrar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
      <AdSlot size="leaderboard" id="chat-bottom" isAdmin={isAdmin} className="my-3" />
    </>
  );
}
