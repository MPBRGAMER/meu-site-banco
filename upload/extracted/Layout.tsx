/**
 * Layout - Navegação lateral com tema escuro estilo terminal Day R Survival
 * Inclui indicador de modo admin/membro e botão de login
 */
import { Link, useLocation } from "wouter";
import { LayoutDashboard, HandCoins, Users, ArrowLeftRight, ShoppingCart, Wallet, Heart, Settings, Shield, LogIn, Gavel, Dices } from "lucide-react";
import { useState } from "react";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";

const publicNavItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/emprestimos", label: "Empréstimos", icon: HandCoins },
  { path: "/trocas", label: "Trocas", icon: ArrowLeftRight },
  { path: "/doadores", label: "Doadores", icon: Heart },
  { path: "/leiloes", label: "Leilões", icon: Gavel },
  { path: "/sorteios", label: "Sorteios", icon: Dices },
  { path: "/loterica", label: "Lotérica", icon: Dices },
];

const adminOnlyNavItems = [
  { path: "/investidores", label: "Investidores", icon: Users },
  { path: "/config-trocas", label: "Config Trocas", icon: Settings },
  { path: "/compras-vendas", label: "Compras & Vendas", icon: ShoppingCart },
  { path: "/caixa", label: "Estoque & Caixa", icon: Wallet },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: user, isLoading } = trpc.auth.me.useQuery();
  const [isAdminMode, setIsAdminMode] = useState(false);

  const isAdmin = user?.role === "admin";

  // Se o usuário é admin, pode ativar/desativar o modo admin
  // Se não é admin, nunca pode editar
  const canEdit = isAdmin && isAdminMode;

  // Montar nav items: públicos + admin-only (se for admin)
  const navItems = [...publicNavItems, ...(isAdmin ? adminOnlyNavItems : [])];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="shrink-0">
              <rect width="36" height="36" rx="8" fill="#f59e0b" opacity="0.15"/>
              <path d="M18 6L24 10V18C24 22 21 26 18 28C15 26 12 22 12 18V10L18 6Z" stroke="#f59e0b" strokeWidth="1.5" fill="none"/>
              <path d="M18 10L18 20" stroke="#f59e0b" strokeWidth="1.5"/>
              <circle cx="18" cy="15" r="2.5" fill="#f59e0b" opacity="0.5"/>
              <path d="M14 20L18 26L22 20" stroke="#f59e0b" strokeWidth="1" opacity="0.5"/>
            </svg>
            <div>
              <h1 className="text-lg md:text-xl font-extrabold text-primary tracking-tight">
                BANCO DO CLÃ
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Day R Survival - Terminal de Comércio Sobrevivente
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden md:block">
              Moeda Amaldiçoada 💀
            </span>
            {/* Indicador de modo */}
            {isAdmin ? (
              <button
                onClick={() => setIsAdminMode(!isAdminMode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 border ${
                  isAdminMode
                    ? "bg-primary/20 text-primary border-primary/40"
                    : "bg-muted text-muted-foreground border-border"
                }`}
                title={isAdminMode ? "Modo Admin ATIVO - você pode editar" : "Modo Visualização - clique para editar"}
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isAdminMode ? "Admin" : "Visualizar"}</span>
              </button>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-muted text-muted-foreground border border-border">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="hidden sm:inline">Visualização</span>
              </span>
            )}
            {/* Botão de login */}
            {!isLoading && !user && (
              <button
                onClick={startLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Login</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Nav Tabs */}
      <nav className="border-b border-border bg-card/40 backdrop-blur-sm sticky top-[61px] z-40">
        <div className="container">
          <div className="flex overflow-x-auto gap-1 py-1 scrollbar-hide">
            {navItems.map((item) => {
              const isActive = location === item.path;
              const Icon = item.icon;
              return (
                <Link key={item.path} href={item.path}>
                  <button
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all duration-150
                      ${isActive
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent"
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 container py-6">
        {/* Contexto para saber se pode editar */}
        <EditContext.Provider value={canEdit}>
          {children}
        </EditContext.Provider>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        Banco do Clã - Day R Survival © 2026
      </footer>
    </div>
  );
}

// Contexto para compartilhar estado de edição entre componentes
import { createContext, useContext } from "react";
const EditContext = createContext<boolean>(false);

export function useCanEdit() {
  return useContext(EditContext);
}
