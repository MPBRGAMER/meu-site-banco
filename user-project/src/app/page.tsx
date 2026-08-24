"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  LayoutDashboard, HandCoins, Users, ArrowLeftRight, ShoppingCart,
  Wallet, Heart, Settings, Gavel, Dices, Shield, Table2, X, Lock, MessageCircle, Download, Trash2, AlertTriangle, Upload, UserCog, KeyRound, LogOut,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useBank } from "@/lib/useBank";
import DashboardTab from "@/components/banco/DashboardTab";
import EmprestimosTab from "@/components/banco/EmprestimosTab";
import InvestidoresTab from "@/components/banco/InvestidoresTab";
import TrocasTab from "@/components/banco/TrocasTab";
import ConfigTrocasTab from "@/components/banco/ConfigTrocasTab";
import ComprasVendasTab from "@/components/banco/ComprasVendasTab";
import CaixaTab from "@/components/banco/CaixaTab";
import DoadoresTab from "@/components/banco/DoadoresTab";
import LeiloesTab from "@/components/banco/LeiloesTab";
import SorteiosTab from "@/components/banco/SorteiosTab";
import LotericaTab from "@/components/banco/LotericaTab";
import TabelaTab from "@/components/banco/TabelaTab";
import ChatTab from "@/components/banco/ChatTab";
import ModeradoresTab, { ALL_PERMISSIONS } from "@/components/banco/ModeradoresTab";
import { TranslationPopup } from "@/components/banco/TranslationPopup";
import SiteProtection from "@/components/SiteProtection";
import { Toaster } from "@/components/ui/sonner";

const publicTabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "chat", label: "Chat", icon: MessageCircle },
  { id: "tabela", label: "Tabela", icon: Table2 },
  { id: "emprestimos", label: "Empréstimos", icon: HandCoins },
  { id: "trocas", label: "Trocas", icon: ArrowLeftRight },
  { id: "doadores", label: "Doadores", icon: Heart },
  { id: "leiloes", label: "Leilões", icon: Gavel },
  { id: "sorteios", label: "Sorteios", icon: Dices },
  { id: "loterica", label: "Lotérica", icon: Dices },
];

const adminTabs = [
  { id: "investidores", label: "Investidores", icon: Users, perm: "investidores" },
  { id: "config-trocas", label: "Config Trocas", icon: Settings, perm: "config-trocas" },
  { id: "compras-vendas", label: "Compras & Vendas", icon: ShoppingCart, perm: "compras-vendas" },
  { id: "caixa", label: "Estoque & Caixa", icon: Wallet, perm: "caixa" },
];

// Map: tabId -> permission needed for admin actions within that tab
const TAB_PERMISSIONS: Record<string, string> = {
  emprestimos: "emprestimos", trocas: "trocas", doadores: "doadores",
  leiloes: "leiloes", sorteios: "sorteios", loterica: "loterica",
  chat: "chat", tabela: "tabela",
};

type AuthMode = "none" | "superadmin" | "moderador";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [authMode, setAuthMode] = useState<AuthMode>("none");
  const [modNome, setModNome] = useState("");
  const [modPermissoes, setModPermissoes] = useState<string[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginTab, setLoginTab] = useState<"admin" | "mod">("admin");
  const [adminPwd, setAdminPwd] = useState("");
  const [modUsuario, setModUsuario] = useState("");
  const [modSenha, setModSenha] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDownloadingBackup, setIsDownloadingBackup] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [changePwdCurrent, setChangePwdCurrent] = useState("");
  const [changePwdNew, setChangePwdNew] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isLoading } = useBank();

  const isSuperAdmin = authMode === "superadmin";
  const isModerador = authMode === "moderador";

  const canAdminTab = useCallback((tabId: string) => {
    if (isSuperAdmin) return true;
    if (isModerador) {
      const perm = TAB_PERMISSIONS[tabId] || tabId;
      return modPermissoes.includes(perm);
    }
    return false;
  }, [isSuperAdmin, isModerador, modPermissoes]);

  // Filter tabs based on permissions
  const visibleAdminTabs = adminTabs.filter(t => canAdminTab(t.perm));
  const allTabs = [...publicTabs, ...visibleAdminTabs];
  if (isSuperAdmin) {
    // Add moderadores tab only for super admin
    if (!allTabs.find(t => t.id === "moderadores")) {
      allTabs.push({ id: "moderadores", label: "Moderadores", icon: UserCog });
    }
  }

  // Auto-restore session on page load
  useEffect(() => {
    const savedPwd = sessionStorage.getItem("adminPwd");
    if (savedPwd) {
      fetch(`/api/banco?action=verifyAdmin&password=${encodeURIComponent(savedPwd)}`)
        .then(res => { if (res.ok) { setAuthMode("superadmin"); } else sessionStorage.removeItem("adminPwd"); })
        .catch(() => {});
      return;
    }
    const savedToken = sessionStorage.getItem("modToken");
    if (savedToken) {
      setAuthMode("moderador");
      setModNome(sessionStorage.getItem("modNome") || "");
      try { setModPermissoes(JSON.parse(sessionStorage.getItem("modPermissoes") || "[]")); } catch {}
      // Validate token
      fetch("/api/banco", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-moderador-token": savedToken },
        body: JSON.stringify({ action: "loginModerador" }),
      }).then(res => {
        if (!res.ok) {
          sessionStorage.removeItem("modToken");
          sessionStorage.removeItem("modNome");
          sessionStorage.removeItem("modPermissoes");
          setAuthMode("none");
          toast.error("Sessão expirada. Faça login novamente.");
        }
      }).catch(() => {});
    }
  }, []);

  const handleLogout = () => {
    const token = sessionStorage.getItem("modToken");
    if (token) {
      fetch("/api/banco", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logoutModerador", token }),
      }).catch(() => {});
    }
    sessionStorage.removeItem("adminPwd");
    sessionStorage.removeItem("modToken");
    sessionStorage.removeItem("modNome");
    sessionStorage.removeItem("modPermissoes");
    setAuthMode("none"); setModNome(""); setModPermissoes([]);
    toast.success("Desconectado.");
  };

  const handleAdminToggle = () => {
    if (authMode !== "none") { handleLogout(); return; }
    setShowLoginModal(true); setLoginTab("admin");
    setAdminPwd(""); setModUsuario(""); setModSenha("");
  };

  const handleAdminLogin = async () => {
    if (!adminPwd.trim()) { toast.error("Digite a senha!"); return; }
    setIsVerifying(true);
    try {
      const res = await fetch(`/api/banco?action=verifyAdmin&password=${encodeURIComponent(adminPwd)}`);
      if (res.ok) {
        setAuthMode("superadmin"); setShowLoginModal(false);
        sessionStorage.setItem("adminPwd", adminPwd);
        setAdminPwd(""); toast.success("Modo Admin ativado!");
      } else toast.error("Senha incorreta!");
    } catch { toast.error("Erro ao verificar."); }
    finally { setIsVerifying(false); }
  };

  const handleModLogin = async () => {
    if (!modUsuario.trim() || !modSenha.trim()) { toast.error("Preencha usuário e senha!"); return; }
    setIsVerifying(true);
    try {
      const res = await fetch("/api/banco", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "loginModerador", usuario: modUsuario.trim(), senha: modSenha }),
      });
      const data = await res.json();
      if ("error" in data) { toast.error(data.error); return; }
      setAuthMode("moderador"); setShowLoginModal(false);
      setModNome(data.nome); setModPermissoes(data.permissoes);
      sessionStorage.setItem("modToken", data.token);
      sessionStorage.setItem("modNome", data.nome);
      sessionStorage.setItem("modPermissoes", JSON.stringify(data.permissoes));
      setModUsuario(""); setModSenha("");
      toast.success(`Bem-vindo, ${data.nome}!`);
    } catch { toast.error("Erro ao fazer login."); }
    finally { setIsVerifying(false); }
  };

  const handleChangePassword = async () => {
    if (!changePwdCurrent || !changePwdNew) { toast.error("Preencha ambas as senhas!"); return; }
    try {
      const token = sessionStorage.getItem("modToken");
      const res = await fetch("/api/banco", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-moderador-token": token || "" },
        body: JSON.stringify({ action: "setModeradorSenha", senhaAtual: changePwdCurrent, senhaNova: changePwdNew }),
      });
      const data = await res.json();
      if ("error" in data) { toast.error(data.error); return; }
      toast.success("Senha alterada! Faça login novamente.");
      handleLogout(); setShowChangePwd(false);
    } catch { toast.error("Erro ao alterar senha."); }
  };

  const handleDownloadBackup = async () => {
    const password = sessionStorage.getItem("adminPwd");
    if (!password) { toast.error("Apenas Super Admin."); return; }
    setIsDownloadingBackup(true);
    try {
      const response = await fetch("/api/banco", {
        method: "POST", headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ action: "backup" }),
      });
      if (!response.ok) throw new Error("Não foi possível gerar o backup.");
      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") || "";
      const filenameMatch = disposition.match(/filename=\"?([^\"]+)\"?/i);
      const filename = filenameMatch?.[1] || `backup-dayr-${new Date().toISOString().slice(0, 10)}.json`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url; link.download = filename;
      document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
      toast.success("Backup baixado!");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Erro ao baixar backup."); }
    finally { setIsDownloadingBackup(false); }
  };

  const handleResetDatabase = async () => {
    const password = sessionStorage.getItem("adminPwd");
    if (!password) { toast.error("Apenas Super Admin."); return; }
    setIsResetting(true);
    try {
      const res = await fetch("/api/banco", {
        method: "POST", headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ action: "resetAll" }),
      });
      if (!res.ok) throw new Error("Erro ao resetar.");
      toast.success("Banco resetado! Recarregando...");
      setShowResetConfirm(false);
      setTimeout(() => window.location.reload(), 1500);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erro ao resetar."); }
    finally { setIsResetting(false); }
  };

  const handleRestoreBackup = async (file: File) => {
    const password = sessionStorage.getItem("adminPwd");
    if (!password) { toast.error("Apenas Super Admin."); return; }
    setIsRestoring(true);
    try {
      const text = await file.text(); const backupData = JSON.parse(text);
      const res = await fetch("/api/banco", {
        method: "POST", headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ action: "restoreBackup", backupData }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Erro ao restaurar."); }
      toast.success("Backup restaurado! Recarregando...");
      setTimeout(() => window.location.reload(), 1500);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erro ao restaurar."); }
    finally { setIsRestoring(false); }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".json")) { toast.error("Selecione um .json"); return; }
    handleRestoreBackup(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const navRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!navRef.current) return;
    isDragging.current = true; startX.current = e.pageX - navRef.current.offsetLeft;
    scrollLeft.current = navRef.current.scrollLeft;
    navRef.current.style.cursor = "grabbing"; navRef.current.style.userSelect = "none";
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !navRef.current) return; e.preventDefault();
    const x = e.pageX - navRef.current.offsetLeft;
    navRef.current.scrollLeft = scrollLeft.current - (x - startX.current) * 1.5;
  }, []);

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
    if (navRef.current) { navRef.current.style.cursor = "grab"; navRef.current.style.userSelect = ""; }
  }, []);

  const onMouseLeave = useCallback(() => {
    if (isDragging.current) { isDragging.current = false; if (navRef.current) { navRef.current.style.cursor = "grab"; navRef.current.style.userSelect = ""; } }
  }, []);

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard": return <DashboardTab isAdmin={canAdminTab("dashboard")} />;
      case "emprestimos": return <EmprestimosTab isAdmin={canAdminTab("emprestimos")} />;
      case "investidores": return <InvestidoresTab />;
      case "trocas": return <TrocasTab isAdmin={canAdminTab("trocas")} />;
      case "config-trocas": return <ConfigTrocasTab />;
      case "compras-vendas": return <ComprasVendasTab />;
      case "caixa": return <CaixaTab />;
      case "doadores": return <DoadoresTab isAdmin={canAdminTab("doadores")} />;
      case "leiloes": return <LeiloesTab isAdmin={canAdminTab("leiloes")} />;
      case "sorteios": return <SorteiosTab isAdmin={canAdminTab("sorteios")} />;
      case "loterica": return <LotericaTab isAdmin={canAdminTab("loterica")} />;
      case "chat": return <ChatTab isAdmin={canAdminTab("chat")} />;
      case "tabela": return <TabelaTab isAdmin={canAdminTab("tabela")} />;
      case "moderadores": return isSuperAdmin ? <ModeradoresTab /> : <DashboardTab />;
      default: return <DashboardTab />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteProtection />
      <Toaster theme="dark" richColors position="top-right" />
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="shrink-0">
              <rect width="36" height="36" rx="8" fill="#f59e0b" opacity="0.15" />
              <path d="M18 6L24 10V18C24 22 21 26 18 28C15 26 12 22 12 18V10L18 6Z" stroke="#f59e0b" strokeWidth="1.5" fill="none" />
              <path d="M18 10L18 20" stroke="#f59e0b" strokeWidth="1.5" />
              <circle cx="18" cy="15" r="2.5" fill="#f59e0b" opacity="0.5" />
              <path d="M14 20L18 26L22 20" stroke="#f59e0b" strokeWidth="1" opacity="0.5" />
            </svg>
            <div>
              <h1 className="text-lg md:text-xl font-extrabold text-primary tracking-tight">Day R Survival</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Posto de Trocas - Sobreviventes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isSuperAdmin && (
              <>
                <button onClick={handleDownloadBackup} disabled={isDownloadingBackup}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all border bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 disabled:opacity-60"
                  title="Baixar backup">
                  <Download className="w-3.5 h-3.5" /><span className="hidden sm:inline">{isDownloadingBackup ? "Gerando..." : "Backup"}</span>
                </button>
                <button onClick={() => fileInputRef.current?.click()} disabled={isRestoring}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all border bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20 disabled:opacity-60"
                  title="Restaurar backup">
                  <Upload className="w-3.5 h-3.5" /><span className="hidden sm:inline">{isRestoring ? "Restaurando..." : "Restaurar"}</span>
                </button>
                <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileSelect} />
                <button onClick={() => setShowResetConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all border bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"
                  title="Resetar banco">
                  <Trash2 className="w-3.5 h-3.5" /><span className="hidden sm:inline">Resetar BD</span>
                </button>
              </>
            )}
            {isModerador && (
              <button onClick={() => setShowChangePwd(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all border bg-muted text-muted-foreground border-border hover:text-foreground"
                title="Alterar senha">
                <KeyRound className="w-3.5 h-3.5" /><span className="hidden sm:inline">Senha</span>
              </button>
            )}
            <button onClick={handleAdminToggle}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all border ${
                authMode !== "none"
                  ? "bg-primary/20 text-primary border-primary/40"
                  : "bg-muted text-muted-foreground border-border hover:text-foreground"
              }`}
              title={authMode !== "none" ? `Sair (${isSuperAdmin ? "Super Admin" : modNome})` : "Entrar"}>
              {authMode !== "none"
                ? <><LogOut className="w-3.5 h-3.5" /><span className="hidden sm:inline max-w-[100px] truncate">{isSuperAdmin ? "Admin" : modNome}</span></>
                : <><Shield className="w-3.5 h-3.5" /><span className="hidden sm:inline">Entrar</span></>
              }
            </button>
          </div>
        </div>
      </header>

      {/* Nav Tabs */}
      <nav className="border-b border-border bg-card/40 backdrop-blur-sm sticky top-[61px] z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div ref={navRef}
            className="flex overflow-x-auto gap-1 py-1 scrollbar-hide cursor-grab"
            onMouseDown={onMouseDown} onMouseMove={onMouseMove}
            onMouseUp={onMouseUp} onMouseLeave={onMouseLeave}>
            {allTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${
                    isActive ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent"
                  }`}>
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">{renderTab()}</main>

      {/* Footer */}
      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        Day R Survival - Posto de Trocas
      </footer>

      <TranslationPopup />

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60" onClick={() => setShowLoginModal(false)}>
          <div className="rounded-lg border border-primary/20 bg-card p-5 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <Shield className="w-4 h-4" /> Login
              </h3>
              <button onClick={() => setShowLoginModal(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </div>
            {/* Login Tabs */}
            <div className="flex gap-1 mb-4 bg-muted rounded-md p-0.5">
              <button onClick={() => setLoginTab("admin")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${loginTab === "admin" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>
                Super Admin
              </button>
              <button onClick={() => setLoginTab("mod")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${loginTab === "mod" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>
                Moderador
              </button>
            </div>
            {loginTab === "admin" ? (
              <div className="space-y-3">
                <p className="text-[11px] text-muted-foreground">Senha de administrador principal.</p>
                <Input type="password" placeholder="Senha de admin" value={adminPwd}
                  onChange={e => setAdminPwd(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleAdminLogin(); }}
                  className="text-sm h-9" autoFocus />
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowLoginModal(false)} className="flex-1 text-xs h-8">Cancelar</Button>
                  <Button onClick={handleAdminLogin} disabled={isVerifying} className="flex-1 bg-primary text-primary-foreground text-xs h-8">
                    {isVerifying ? "Verificando..." : "Entrar"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[11px] text-muted-foreground">Login de moderador (usuário e senha definidos pelo admin).</p>
                <Input placeholder="Usuário" value={modUsuario} onChange={e => setModUsuario(e.target.value)} className="text-sm h-9" autoFocus />
                <Input type="password" placeholder="Senha" value={modSenha} onChange={e => setModSenha(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleModLogin(); }} className="text-sm h-9" />
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowLoginModal(false)} className="flex-1 text-xs h-8">Cancelar</Button>
                  <Button onClick={handleModLogin} disabled={isVerifying} className="flex-1 bg-primary text-primary-foreground text-xs h-8">
                    {isVerifying ? "Verificando..." : "Entrar"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePwd && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60" onClick={() => setShowChangePwd(false)}>
          <div className="rounded-lg border border-primary/20 bg-card p-5 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <KeyRound className="w-4 h-4" /> Alterar Senha
              </h3>
              <button onClick={() => setShowChangePwd(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-[11px] text-muted-foreground mb-3">Você será desconectado após alterar a senha.</p>
            <div className="space-y-3">
              <Input type="password" placeholder="Senha atual" value={changePwdCurrent} onChange={e => setChangePwdCurrent(e.target.value)} className="text-sm h-9" autoFocus />
              <Input type="password" placeholder="Nova senha" value={changePwdNew} onChange={e => setChangePwdNew(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleChangePassword(); }} className="text-sm h-9" />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowChangePwd(false)} className="flex-1 text-xs h-8">Cancelar</Button>
                <Button onClick={handleChangePassword} className="flex-1 bg-primary text-primary-foreground text-xs h-8">Alterar</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Database Confirm Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60" onClick={() => setShowResetConfirm(false)}>
          <div className="rounded-lg border border-red-500/30 bg-card p-5 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Resetar Banco de Dados
              </h3>
              <button onClick={() => setShowResetConfirm(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-muted-foreground mb-2">Essa acao vai apagar <b className="text-red-400">TODOS</b> os dados do banco:</p>
            <ul className="text-[11px] text-muted-foreground mb-4 space-y-0.5 list-disc list-inside">
              <li>Emprestimos, Investidores, Trocas</li>
              <li>Compras/Vendas, Caixa, Doadores</li>
              <li>Leiloes e Lances</li>
              <li>Sorteios e Loterica</li>
              <li>Chat, Tabela de Trocas</li>
              <li>Relatorios e Itens Customizados</li>
            </ul>
            <p className="text-[11px] text-red-400 font-semibold mb-4">Essa acao nao pode ser desfeita!</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowResetConfirm(false)} className="flex-1 text-xs h-8" disabled={isResetting}>Cancelar</Button>
              <Button onClick={handleResetDatabase} disabled={isResetting} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs h-8">
                {isResetting ? "Resetando..." : "Sim, Resetar Tudo"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
