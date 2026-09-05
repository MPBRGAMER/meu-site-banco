"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  BookImage, Plus, Key, Trash2, ImagePlus, Tag, Check, X,
  ChevronDown, ChevronUp, Eye, Copy, Package, LogIn, UserPlus,
  Search, QrCode, ArrowLeft, Send, Lock
} from "lucide-react";

interface Figurinha {
  id: string;
  nome: string;
  imageData: string;
  preco: number;
  data: string;
  _count?: { codigos: number };
}

interface FigurinhaCodigo {
  id: string;
  figurinhaId: string;
  codigo: string;
  status: string;
  figurinha?: { id: string; nome: string; imageData: string };
  albumItem?: { album: { playerName: string } } | null;
  data: string;
}

interface AlbumFigurinhaItem {
  id: string;
  figurinhaCodigoId: string;
  figurinhaCodigo: {
    id: string;
    codigo: string;
    figurinha: { id: string; nome: string; imageData: string; preco: number };
  };
  data: string;
}

interface Album {
  id: string;
  playerName: string;
  senha: string;
  figurinhas: AlbumFigurinhaItem[];
}

interface FigurinhasTabProps {
  isAdmin?: boolean;
}

export default function FigurinhasTab({ isAdmin = false }: FigurinhasTabProps) {
  const [figurinhas, setFigurinhas] = useState<Figurinha[]>([]);
  const [loading, setLoading] = useState(true);

  // Album state
  const [album, setAlbum] = useState<Album | null>(null);
  const [loginName, setLoginName] = useState("");
  const [loginSenha, setLoginSenha] = useState("");
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [newAlbumSenha, setNewAlbumSenha] = useState("");

  // Redeem code
  const [redeemCode, setRedeemCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);

  // Send sticker to another player
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendFigCodigoId, setSendFigCodigoId] = useState("");
  const [sendFigNome, setSendFigNome] = useState("");
  const [sending, setSending] = useState(false);

  // Figurinha detail modal (click to see codes/status)
  const [detailFig, setDetailFig] = useState<Figurinha | null>(null);
  const [detailCodes, setDetailCodes] = useState<FigurinhaCodigo[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailPublicCount, setDetailPublicCount] = useState<{ available: number; redeemed: number; total: number } | null>(null);

  // Admin state
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [newFigNome, setNewFigNome] = useState("");
  const [newFigPreco, setNewFigPreco] = useState("");
  const [newFigQtyCodes, setNewFigQtyCodes] = useState("10");
  const [newFigImage, setNewFigImage] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);
  const [allCodes, setAllCodes] = useState<FigurinhaCodigo[]>([]);
  const [codesFilter, setCodesFilter] = useState("");
  const [showCodesPanel, setShowCodesPanel] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const getAuthHeaders = () => {
    const pwd = sessionStorage.getItem("adminPwd");
    const modToken = sessionStorage.getItem("modToken");
    const headers: Record<string, string> = {};
    if (pwd) headers["x-admin-password"] = pwd;
    else if (modToken) headers["x-moderador-token"] = modToken;
    return headers;
  };

  const loadFigurinhas = async () => {
    try {
      const res = await fetch("/api/figurinhas?action=figurinhas");
      if (res.ok) setFigurinhas(await res.json());
    } catch {}
  };

  const loadAlbum = async (playerName: string, senha: string) => {
    try {
      const res = await fetch(`/api/figurinhas?action=album&playerName=${encodeURIComponent(playerName)}&senha=${encodeURIComponent(senha)}`);
      if (res.ok) {
        const data = await res.json();
        setAlbum(data);
        return data;
      } else {
        const data = await res.json();
        toast.error(data.error || "Erro ao acessar album");
        return null;
      }
    } catch {
      toast.error("Erro ao acessar album");
      return null;
    }
  };

  const loadDetailCodes = async (figId: string) => {
    setDetailLoading(true);
    try {
      // Try with auth headers first (admin gets full codes), public gets counts
      const res = await fetch(`/api/figurinhas?action=figurinhaDetail&id=${figId}`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setDetailCodes(data.codigos || []);
        // Store counts from public response
        if (data._count) {
          setDetailPublicCount(data._count);
        }
      }
    } catch {}
    setDetailLoading(false);
  };

  const loadAdminData = async () => {
    if (!isAdmin) return;
    try {
      const headers = getAuthHeaders();
      const codesRes = await fetch("/api/figurinhas?action=codes", { headers });
      if (codesRes.ok) setAllCodes(await codesRes.json());
    } catch {}
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadFigurinhas(), loadAdminData()]).finally(() => setLoading(false));
  }, [isAdmin]);

  const handleLogin = async () => {
    if (!loginName.trim() || !loginSenha.trim()) { toast.error("Preencha nome e senha!"); return; }
    const result = await loadAlbum(loginName.trim(), loginSenha);
    if (result) {
      toast.success(`Bem-vindo, ${result.playerName}!`);
      setLoginName(""); setLoginSenha("");
    }
  };

  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim() || !newAlbumSenha.trim()) { toast.error("Preencha nome e senha!"); return; }
    try {
      const res = await fetch("/api/figurinhas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "createAlbum", playerName: newAlbumName.trim(), senha: newAlbumSenha }),
      });
      const data = await res.json();
      if ("error" in data) { toast.error(data.error); return; }
      toast.success("Album criado! Agora faça login.");
      setShowCreateAlbum(false);
      setNewAlbumName(""); setNewAlbumSenha("");
    } catch { toast.error("Erro ao criar album."); }
  };

  const handleRedeem = async () => {
    if (!album || !redeemCode.trim()) { toast.error("Digite o código!"); return; }
    setRedeeming(true);
    try {
      const res = await fetch("/api/figurinhas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "redeemCode", albumId: album.id, codigo: redeemCode.trim() }),
      });
      const data = await res.json();
      if ("error" in data) { toast.error(data.error); return; }
      toast.success(`Figurinha "${data.figurinha.nome}" adicionada ao album!`);
      setRedeemCode("");
      await loadAlbum(album.playerName, album.senha || "");
      loadAdminData();
    } catch { toast.error("Erro ao resgatar código."); }
    finally { setRedeeming(false); }
  };

  const handleCreateFigurinha = async () => {
    if (!newFigNome.trim() || !newFigImage) { toast.error("Preencha nome e selecione uma imagem!"); return; }
    setCreating(true);
    try {
      const formData = new FormData();
      formData.append("action", "createFigurinha");
      formData.append("nome", newFigNome.trim());
      formData.append("preco", newFigPreco || "0");
      formData.append("qtyCodes", newFigQtyCodes || "10");
      formData.append("image", newFigImage);
      const res = await fetch("/api/figurinhas", {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
      });
      const data = await res.json();
      if ("error" in data) { toast.error(data.error); return; }
      toast.success(`Figurinha "${newFigNome}" criada com ${data.codigos?.length || 0} códigos!`);
      setNewFigNome(""); setNewFigPreco(""); setNewFigQtyCodes("10");
      setNewFigImage(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
      loadFigurinhas(); loadAdminData();
    } catch { toast.error("Erro ao criar figurinha."); }
    finally { setCreating(false); }
  };

  const handleDeleteFigurinha = async (id: string, nome: string) => {
    if (!confirm(`Remover figurinha "${nome}" e todos os seus códigos?`)) return;
    try {
      const res = await fetch("/api/figurinhas", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ action: "deleteFigurinha", id }),
      });
      const data = await res.json();
      if ("error" in data) { toast.error(data.error); return; }
      toast.success("Figurinha removida.");
      loadFigurinhas(); loadAdminData();
      if (detailFig?.id === id) setDetailFig(null);
    } catch { toast.error("Erro ao remover."); }
  };

  const handleDeleteCode = async (id: string) => {
    try {
      const res = await fetch("/api/figurinhas", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ action: "deleteCode", id }),
      });
      const data = await res.json();
      if ("error" in data) { toast.error(data.error); return; }
      toast.success("Código removido.");
      loadAdminData();
      if (detailFig) loadDetailCodes(detailFig.id);
    } catch { toast.error("Erro ao remover código."); }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => toast.success("Código copiado!"));
  };

  const handleRemoveFromAlbum = async (figCodigoId: string, figNome: string) => {
    if (!album) return;
    if (!confirm(`Remover "${figNome}" do seu album?\n\nO código dessa figurinha ficará disponível novamente para outra pessoa resgatar.\n\nIsso NÃO envia a figurinha — apenas libera o código.`)) return;
    try {
      const res = await fetch("/api/figurinhas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "removeFigurinhaFromAlbum", albumId: album.id, figurinhaCodigoId: figCodigoId }),
      });
      const data = await res.json();
      if ("error" in data) { toast.error(data.error); return; }
      toast.success("Figurinha removida. O código está disponível para quem tiver ele.");
      await loadAlbum(album.playerName, album.senha || "");
      loadAdminData();
    } catch { toast.error("Erro ao remover figurinha."); }
  };

  const openDetail = async (fig: Figurinha) => {
    setDetailFig(fig);
    await loadDetailCodes(fig.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const albumFigIds = new Set(album?.figurinhas.map(f => f.figurinhaCodigo.figurinha.id) || []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <BookImage className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Album de Figurinhas</h2>
          <p className="text-xs text-muted-foreground">Colete e troque figurinhas com outros jogadores!</p>
        </div>
      </div>

      {/* Login / Album Section */}
      {!album && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <LogIn className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Acessar meu album</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Seu nome</label>
              <Input value={loginName} onChange={(e) => setLoginName(e.target.value)} placeholder="Nome do album" className="h-9 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Senha</label>
              <Input type="password" value={loginSenha} onChange={(e) => setLoginSenha(e.target.value)} placeholder="Senha do album" className="h-9 text-sm"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleLogin} className="gap-2"><LogIn className="w-4 h-4" /> Entrar</Button>
            <Button variant="outline" onClick={() => setShowCreateAlbum(!showCreateAlbum)} className="gap-2"><UserPlus className="w-4 h-4" /> Criar album</Button>
          </div>
          {showCreateAlbum && (
            <div className="mt-3 pt-3 border-t border-border space-y-3">
              <h4 className="text-xs font-bold text-primary">Criar novo album</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Nome</label>
                  <Input value={newAlbumName} onChange={(e) => setNewAlbumName(e.target.value)} placeholder="Seu nome" className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Senha</label>
                  <Input type="password" value={newAlbumSenha} onChange={(e) => setNewAlbumSenha(e.target.value)} placeholder="Escolha uma senha" className="h-9 text-sm" />
                </div>
              </div>
              <Button onClick={handleCreateAlbum} size="sm" className="gap-2"><Plus className="w-4 h-4" /> Criar</Button>
            </div>
          )}
        </div>
      )}

      {/* Album View */}
      {album && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookImage className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-bold">Album de {album.playerName}</h3>
              <span className="text-xs text-muted-foreground">({album.figurinhas.length}/{figurinhas.length} figurinhas)</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => setAlbum(null)} className="gap-1"><X className="w-3 h-3" /> Sair</Button>
          </div>

          {/* Redeem Code */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center gap-2">
              <Key className="w-4 h-4 text-primary" />
              <Input value={redeemCode} onChange={(e) => setRedeemCode(e.target.value.toUpperCase())} placeholder="DIGITE-O-CODIGO-AQUI" className="h-8 text-sm font-mono uppercase"
                onKeyDown={(e) => e.key === "Enter" && handleRedeem()}
              />
            </div>
            <Button onClick={handleRedeem} disabled={redeeming || !redeemCode.trim()} size="sm" className="gap-1">
              {redeeming ? <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" /> : <Check className="w-4 h-4" />}
              Resgatar
            </Button>
          </div>

          {/* Trading info */}
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-300/80">
            <strong>Como trocar figurinhas:</strong> Para passar uma figurinha para outro jogador, remova ela do seu album (isso libera o código). Depois, envie o código para a pessoa, e ela resgata no album dela. Cada código só funciona em um album por vez.
          </div>

          {/* Sticker Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {figurinhas.map((fig) => {
              const isInAlbum = albumFigIds.has(fig.id);
              const albumItem = album.figurinhas.find(f => f.figurinhaCodigo.figurinha.id === fig.id);
              return (
                <div key={fig.id} className="group relative">
                  {isInAlbum ? (
                    <div className="rounded-lg border-2 border-primary/30 bg-card overflow-hidden transition-all hover:border-primary hover:shadow-md cursor-pointer" onClick={() => openDetail(fig)}>
                      <div className="aspect-square relative">
                        <img src={fig.imageData} alt={fig.nome} className="w-full h-full object-cover" />
                        <div className="absolute top-1 right-1"><Check className="w-4 h-4 text-green-500 drop-shadow-md" /></div>
                      </div>
                      <div className="p-1.5 text-center"><p className="text-[10px] font-medium truncate">{fig.nome}</p></div>
                    </div>
                  ) : (
                    <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 overflow-hidden transition-all hover:border-muted-foreground/30 cursor-pointer" onClick={() => openDetail(fig)}>
                      <div className="aspect-square flex items-center justify-center">
                        <div className="text-center">
                          <ImagePlus className="w-6 h-6 text-muted-foreground/20 mx-auto mb-1" />
                          <span className="text-[9px] text-muted-foreground/30">?</span>
                        </div>
                      </div>
                      <div className="p-1.5 text-center"><p className="text-[10px] font-medium text-muted-foreground/40 truncate">{fig.nome}</p></div>
                    </div>
                  )}
                  {/* Hover actions for owned stickers */}
                  {isInAlbum && albumItem && (
                    <div className="absolute inset-0 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 z-10">
                      <button onClick={(e) => { e.stopPropagation(); handleCopyCode(albumItem.figurinhaCodigo.codigo); }}
                        className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white" title="Copiar código para troca">
                        <Copy className="w-4 h-4" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleRemoveFromAlbum(albumItem.figurinhaCodigoId, fig.nome); }}
                        className="p-2 rounded-full bg-red-500/40 hover:bg-red-500/60 text-white" title="Remover do album (liberar código para troca)">
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {figurinhas.length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <BookImage className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma figurinha disponível ainda.</p>
            </div>
          )}
        </div>
      )}

      {/* Preview when not logged in */}
      {!album && figurinhas.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold flex items-center gap-2"><Eye className="w-4 h-4 text-primary" /> Figurinhas disponíveis</h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
            {figurinhas.map((fig) => (
              <div key={fig.id} className="rounded-md border border-border bg-card overflow-hidden cursor-pointer hover:border-primary/40 transition-colors" onClick={() => openDetail(fig)}>
                <div className="aspect-square"><img src={fig.imageData} alt={fig.nome} className="w-full h-full object-cover" /></div>
                <div className="p-1 text-center">
                  <p className="text-[9px] font-medium truncate">{fig.nome}</p>
                  {fig.preco > 0 && <p className="text-[8px] text-muted-foreground">{fig.preco}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== FIGURINHA DETAIL MODAL ===== */}
      {detailFig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setDetailFig(null)}>
          <div className="rounded-xl border border-border bg-card p-4 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <img src={detailFig.imageData} alt={detailFig.nome} className="w-16 h-16 rounded-lg object-cover border border-border" />
              <div className="flex-1">
                <h3 className="text-base font-bold">{detailFig.nome}</h3>
                <p className="text-xs text-muted-foreground">Preço: {detailFig.preco > 0 ? detailFig.preco : "Gratuito"}</p>
                <p className="text-xs text-muted-foreground">Criada em: {new Date(detailFig.data).toLocaleDateString("pt-BR")}</p>
              </div>
              <button onClick={() => setDetailFig(null)} className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </div>

            {/* Codes list */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <QrCode className="w-4 h-4 text-primary" /> Códigos desta figurinha
              </h4>

              {detailLoading ? (
                <div className="flex justify-center py-4"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" /></div>
              ) : (
                <>
                  {/* Stats */}
                  {(() => {
                    // Admin sees actual codes, public sees counts from API
                    const available = isAdmin
                      ? detailCodes.filter(c => c.status === "available").length
                      : (detailPublicCount?.available ?? detailCodes.filter(c => c.status === "available").length);
                    const redeemed = isAdmin
                      ? detailCodes.filter(c => c.status === "redeemed").length
                      : (detailPublicCount?.redeemed ?? detailCodes.filter(c => c.status === "redeemed").length);
                    const total = isAdmin
                      ? detailCodes.length
                      : (detailPublicCount?.total ?? detailCodes.length);
                    return (
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <div className="rounded-md bg-green-500/10 p-2 text-center">
                          <p className="text-lg font-bold text-green-400">{available}</p>
                          <p className="text-[10px] text-green-400/70">Disponíveis</p>
                        </div>
                        <div className="rounded-md bg-red-500/10 p-2 text-center">
                          <p className="text-lg font-bold text-red-400">{redeemed}</p>
                          <p className="text-[10px] text-red-400/70">Usados</p>
                        </div>
                        <div className="rounded-md bg-primary/10 p-2 text-center">
                          <p className="text-lg font-bold text-primary">{total}</p>
                          <p className="text-[10px] text-primary/70">Total</p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Codes list - only visible to admin */}
                  {isAdmin ? (
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {detailCodes.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-3">Nenhum código.</p>
                      ) : (
                        detailCodes.map((code) => (
                          <div key={code.id} className={`flex items-center gap-2 p-2 rounded text-xs ${code.status === "redeemed" ? "bg-red-500/5 border border-red-500/10" : "bg-green-500/5 border border-green-500/10"}`}>
                            <span className={`font-mono font-bold flex-1 ${code.status === "redeemed" ? "text-red-400" : "text-green-400"}`}>
                              {code.codigo}
                            </span>
                            {code.status === "redeemed" ? (
                              <span className="text-[10px] text-red-400 flex items-center gap-1">
                                <Lock className="w-3 h-3" /> {code.albumItem?.album?.playerName || "Desconhecido"}
                              </span>
                            ) : (
                              <span className="text-[10px] text-green-400 flex items-center gap-1">
                                <Check className="w-3 h-3" /> Livre
                              </span>
                            )}
                            {code.status === "available" && (
                              <button onClick={() => handleDeleteCode(code.id)} className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400" title="Remover código">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                            <button onClick={() => handleCopyCode(code.codigo)} className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground" title="Copiar">
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-3 italic">
                      Os códigos individuais são visíveis apenas para o admin.
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Admin actions */}
            {isAdmin && (
              <div className="mt-4 pt-3 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => handleDeleteFigurinha(detailFig.id, detailFig.nome)} className="gap-1 border-red-500/30 text-red-400 hover:bg-red-500/10">
                  <Trash2 className="w-3 h-3" /> Remover figurinha
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== ADMIN PANEL ===== */}
      {isAdmin && (
        <div className="space-y-3">
          <button onClick={() => setShowAdminPanel(!showAdminPanel)} className="flex items-center gap-2 w-full">
            <div className="p-1.5 rounded-lg bg-amber-500/10"><Package className="w-4 h-4 text-amber-400" /></div>
            <h3 className="text-sm font-semibold text-amber-400">Painel Admin</h3>
            {showAdminPanel ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4 text-amber-400" />}
          </button>

          {showAdminPanel && (
            <div className="space-y-4">
              {/* Create Figurinha */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
                <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2"><Plus className="w-4 h-4" /> Criar Figurinha</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Nome</label>
                    <Input value={newFigNome} onChange={(e) => setNewFigNome(e.target.value)} placeholder="Ex: Katana Rara" className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Quantidade de códigos</label>
                    <Input type="number" value={newFigQtyCodes} onChange={(e) => setNewFigQtyCodes(e.target.value)} placeholder="10" min="1" max="1000" className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Imagem da figurinha</label>
                    <input ref={imageInputRef} type="file" accept="image/*" onChange={(e) => setNewFigImage(e.target.files?.[0] || null)} className="text-xs" />
                    {newFigImage && <p className="text-[10px] text-green-400">{newFigImage.name} selecionada</p>}
                  </div>
                </div>
                <Button onClick={handleCreateFigurinha} disabled={creating} className="gap-2">
                  {creating ? <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" /> : <Plus className="w-4 h-4" />}
                  {creating ? "Criando..." : "Criar figurinha"}
                </Button>
              </div>

              {/* Existing Figurinhas list */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <h4 className="text-sm font-bold flex items-center gap-2"><Tag className="w-4 h-4 text-primary" /> Figurinhas cadastradas ({figurinhas.length})</h4>
                <div className="space-y-2">
                  {figurinhas.map((fig) => {
                    const available = allCodes.filter(c => c.figurinhaId === fig.id && c.status === "available").length;
                    const redeemed = allCodes.filter(c => c.figurinhaId === fig.id && c.status === "redeemed").length;
                    return (
                      <div key={fig.id} className="flex items-center gap-3 p-2 rounded-lg border border-border hover:bg-accent/30 cursor-pointer" onClick={() => openDetail(fig)}>
                        <img src={fig.imageData} alt={fig.nome} className="w-10 h-10 rounded object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{fig.nome}</p>
                          <div className="flex gap-2 text-[10px]">
                            <span className="text-green-400">{available} disponíveis</span>
                            <span className="text-red-400">{redeemed} usados</span>
                            <span className="text-muted-foreground">preço: {fig.preco}</span>
                          </div>
                        </div>
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* All Codes Panel */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <button onClick={() => { setShowCodesPanel(!showCodesPanel); if (!showCodesPanel) loadAdminData(); }}
                  className="flex items-center justify-between w-full">
                  <h4 className="text-sm font-bold flex items-center gap-2"><QrCode className="w-4 h-4 text-primary" /> Todos os códigos ({allCodes.length})</h4>
                  {showCodesPanel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {showCodesPanel && (
                  <>
                    <Input value={codesFilter} onChange={(e) => setCodesFilter(e.target.value.toUpperCase())} placeholder="Filtrar código ou figurinha..." className="h-8 text-xs font-mono" />
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {allCodes
                        .filter(c => !codesFilter || c.codigo.includes(codesFilter) || c.figurinha?.nome?.toLowerCase().includes(codesFilter.toLowerCase()))
                        .map((code) => (
                          <div key={code.id} className={`flex items-center gap-2 p-1.5 rounded text-xs ${code.status === "redeemed" ? "bg-red-500/5" : "bg-green-500/5"}`}>
                            <span className={`font-mono font-bold ${code.status === "redeemed" ? "text-red-400" : "text-green-400"}`}>{code.codigo}</span>
                            <span className="text-muted-foreground">— {code.figurinha?.nome}</span>
                            <span className={`ml-auto text-[10px] ${code.status === "redeemed" ? "text-red-400" : "text-green-400"}`}>
                              {code.status === "redeemed" ? `✗ ${code.albumItem?.album?.playerName || "?"}` : "✓ Livre"}
                            </span>
                            <button onClick={() => handleCopyCode(code.codigo)} className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground"><Copy className="w-3 h-3" /></button>
                          </div>
                        ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
