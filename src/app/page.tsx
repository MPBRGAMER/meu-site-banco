"use client";
import { useState, useRef, useCallback } from "react";
import {
  LayoutDashboard, HandCoins, Users, ArrowLeftRight, ShoppingCart,
  Wallet, Heart, Settings, Gavel, Dices, Shield, Table2, X, Lock,
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

const publicTabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "tabela", label: "Tabela", icon: Table2 },
  { id: "emprestimos", label: "Empréstimos", icon: HandCoins },
  { id: "trocas", label: "Trocas", icon: ArrowLeftRight },
  { id: "doadores", label: "Doadores", icon: Heart },
  { id: "leiloes", label: "Leilões", icon: Gavel },
  { id: "sorteios", label: "Sorteios", icon: Dices },
  { id: "loterica", label: "Lotérica", icon: Dices },
];

const adminTabs = [
  { id: "investidores", label: "Investidores", icon: Users },
  { id: "config-trocas", label: "Config Trocas", icon: Settings },
  { id: "compras-vendas", label: "Compras & Vendas", icon: ShoppingCart },
  { id: "caixa", label: "Estoque & Caixa", icon: Wallet },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPwd, setAdminPwd] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const { isLoading } = useBank();
  const allTabs = [...publicTabs, ...(isAdmin ? adminTabs : [])];

  const handleAdminToggle = async () => {
    if (isAdmin) {
      setIsAdmin(false);
      return;
    }
    setShowAdminLogin(true);
    setAdminPwd("");
  };

  const handleAdminLogin = async () => {
    if (!adminPwd.trim()) {
      toast.error("Digite a senha de admin!");
      return;
    }
    setIsVerifying(true);
    try {
      const res = await fetch(`/api/banco?action=verifyAdmin&password=${encodeURIComponent(adminPwd)}`);
      if (res.ok) {
        setIsAdmin(true);
        setShowAdminLogin(false);
        sessionStorage.setItem("adminPwd", adminPwd);
        setAdminPwd("");
        toast.success("Modo Admin ativado!");
      } else {
        toast.error("Senha incorreta!");
      }
    } catch {
      toast.error("Erro ao verificar senha.");
    } finally {
      setIsVerifying(false);
    }
  };
  const navRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!navRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - navRef.current.offsetLeft;
    scrollLeft.current = navRef.current.scrollLeft;
    navRef.current.style.cursor = "grabbing";
    navRef.current.style.userSelect = "none";
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !navRef.current) return;
    e.preventDefault();
    const x = e.pageX - navRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    navRef.current.scrollLeft = scrollLeft.current - walk;
  }, []);

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
    if (navRef.current) {
      navRef.current.style.cursor = "grab";
      navRef.current.style.userSelect = "";
    }
  }, []);

  const onMouseLeave = useCallback(() => {
    if (isDragging.current) {
      isDragging.current = false;
      if (navRef.current) {
        navRef.current.style.cursor = "grab";
        navRef.current.style.userSelect = "";
      }
    }
  }, []);

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard": return <DashboardTab />;
      case "emprestimos": return <EmprestimosTab isAdmin={isAdmin} />;
      case "investidores": return <InvestidoresTab />;
      case "trocas": return <TrocasTab isAdmin={isAdmin} />;
      case "config-trocas": return <ConfigTrocasTab />;
      case "compras-vendas": return <ComprasVendasTab />;
      case "caixa": return <CaixaTab />;
      case "doadores": return <DoadoresTab isAdmin={isAdmin} />;
      case "leiloes": return <LeiloesTab isAdmin={isAdmin} />;
      case "sorteios": return <SorteiosTab />;
      case "loterica": return <LotericaTab />;
      case "tabela": return <TabelaTab isAdmin={isAdmin} />;
      default: return <DashboardTab />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
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
              <h1 className="text-lg md:text-xl font-extrabold text-primary tracking-tight">
                Day R Survival
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Posto de Trocas - Sobreviventes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleAdminToggle}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 border ${
                isAdmin
                  ? "bg-primary/20 text-primary border-primary/40"
                  : "bg-muted text-muted-foreground border-border hover:text-foreground"
              }`}
              title={isAdmin ? "Clique para sair do modo Admin" : "Entrar como Admin (requer senha)"}
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          </div>
        </div>
      </header>

      {/* Nav Tabs */}
      <nav className="border-b border-border bg-card/40 backdrop-blur-sm sticky top-[61px] z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div
            ref={navRef}
            className="flex overflow-x-auto gap-1 py-1 scrollbar-hide cursor-grab"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
          >
            {allTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                    isActive
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {renderTab()}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        Day R Survival - Posto de Trocas
      </footer>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60" onClick={() => setShowAdminLogin(false)}>
          <div className="rounded-lg border border-primary/20 bg-card p-5 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <Lock className="w-4 h-4" /> Login Admin
              </h3>
              <button onClick={() => setShowAdminLogin(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-[11px] text-muted-foreground mb-3">Digite a senha de administrador para acessar o modo Admin.</p>
            <div className="space-y-3">
              <Input
                type="password"
                placeholder="Senha de admin"
                value={adminPwd}
                onChange={(e) => setAdminPwd(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAdminLogin(); }}
                className="text-sm h-9"
                autoFocus
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowAdminLogin(false)} className="flex-1 text-xs h-8">Cancelar</Button>
                <Button onClick={handleAdminLogin} disabled={isVerifying} className="flex-1 bg-primary text-primary-foreground text-xs h-8">
                  {isVerifying ? "Verificando..." : "Entrar"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
