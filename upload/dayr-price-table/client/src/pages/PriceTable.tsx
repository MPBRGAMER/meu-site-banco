import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, TrendingUp, TrendingDown, Calculator, Share2, Info, Edit, BookOpen } from "lucide-react";
import { Sparkline } from "@/components/Sparkline";
import { ProfitCalculator } from "@/components/ProfitCalculator";
import { PriceReporter } from "@/components/PriceReporter";
import { PriceEditor } from "@/components/PriceEditor";
import { ContributorRanking, type ContributorStats } from "@/components/ContributorRanking";
import { getItemIcon } from "@/data/item-icons";
import { usePriceHistory } from "@/hooks/usePriceHistory";
import { removeAccents } from "@/lib/removeAccents";
import priceData from "../data/prices.json";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { LogIn, LogOut } from "lucide-react";

type Item = {
  id: string;
  name: string;
  steel: string;
  cement: string;
  rarity: "common" | "uncommon" | "rare";
  demand: "low" | "medium" | "high" | "very_high";
  notes: string;
};

type Category = {
  id: string;
  name: string;
  items: Item[];
};

type TrendData = {
  history: number[];
  trend: "up" | "down" | "stable";
  change: number;
};

const rarityColors: Record<string, string> = {
  common: "bg-gray-500",
  uncommon: "bg-orange-500",
  rare: "bg-red-600",
};

const demandColors: Record<string, string> = {
  low: "text-gray-400",
  medium: "text-orange-400",
  high: "text-orange-600",
  very_high: "text-red-600",
};

export default function PriceTable() {
  const { user, isAuthenticated, logout } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("food");
  const [sortBy, setSortBy] = useState<"name" | "steel" | "cement">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [reporterOpen, setReporterOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>(priceData.categories as Category[]);
  const [, navigate] = useLocation();

  // Carregar dados do banco de dados
  const { data: dbPrices = [] } = trpc.prices.getAll.useQuery();
  const { data: dbContributors = [] } = trpc.prices.getContributors.useQuery();

  // Atualizar categorias com preços do banco
  useEffect(() => {
    if (dbPrices.length > 0) {
      const updatedCategories = categories.map((cat) => ({
        ...cat,
        items: cat.items.map((item) => {
          const dbPrice = dbPrices.find((p) => p.itemId === item.id);
          if (dbPrice) {
            return {
              ...item,
              steel: `${dbPrice.steelPrice}:1`,
              cement: `${dbPrice.cementPrice}:1`,
            };
          }
          return item;
        }),
      }));
      setCategories(updatedCategories);
    }
  }, [dbPrices]);

  const { reports, addReport, calculateTrend } = usePriceHistory();

  const allItems = useMemo(() => {
    return categories.flatMap((cat) => cat.items);
  }, [categories]);

  // Calcular estatísticas de contribuidores
  const contributorStats = useMemo(() => {
    const stats: Record<string, ContributorStats> = {};
    reports.forEach((report) => {
      if (!stats[report.playerNickname]) {
        stats[report.playerNickname] = {
          nickname: report.playerNickname,
          reportCount: 0,
          lastReportDate: 0,
        };
      }
      stats[report.playerNickname].reportCount++;
      stats[report.playerNickname].lastReportDate = Math.max(
        stats[report.playerNickname].lastReportDate,
        report.timestamp
      );
    });
    return Object.values(stats);
  }, [reports]);

  // Mapa de reportes mais recentes por item
  const latestReportByItem = useMemo(() => {
    const map: Record<string, { playerNickname: string; timestamp: number }> = {};
    reports.forEach((report) => {
      if (!map[report.itemId] || report.timestamp > map[report.itemId].timestamp) {
        map[report.itemId] = {
          playerNickname: report.playerNickname,
          timestamp: report.timestamp,
        };
      }
    });
    return map;
  }, [reports]);

  const filteredAndSortedItems = useMemo(() => {
    const category = categories.find((c) => c.id === activeCategory);
    if (!category) return [];

    const normalizedSearch = removeAccents(searchTerm);
    let items = category.items.filter((item) =>
      removeAccents(item.name).includes(normalizedSearch)
    );

    items.sort((a, b) => {
      let aVal: string | number = a.name;
      let bVal: string | number = b.name;

      if (sortBy === "steel") {
        aVal = parseInt(a.steel.split(":")[0]) || 0;
        bVal = parseInt(b.steel.split(":")[0]) || 0;
      } else if (sortBy === "cement") {
        aVal = parseInt(a.cement.split(":")[0]) || 0;
        bVal = parseInt(b.cement.split(":")[0]) || 0;
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return items;
  }, [activeCategory, searchTerm, sortBy, sortOrder, categories]);

  const handleSort = (column: "name" | "steel" | "cement") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const getTrendData = (itemId: string) => {
    // Primeiro tenta usar dados reportados pela comunidade
    const communityTrend = calculateTrend(itemId, "steel");
    if (communityTrend) {
      return communityTrend;
    }
    // Sem dados de demonstração - retorna null
    return null;
  };

  const handlePriceUpdate = (updatedCategories: Category[]) => {
    setCategories(updatedCategories);
    // Salvar no localStorage
    localStorage.setItem("dayr_prices", JSON.stringify(updatedCategories));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-orange-500 font-mono">
                ⚙️ TERMINAL DE COMÉRCIO SOBREVIVENTE
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Day R Survival - Preços de Mercado (Atualizado: {priceData.metadata.last_updated})
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 mb-2">Taxa de Câmbio</p>
              <p className="text-lg font-mono font-bold text-orange-400">
                1 $ = 2 €
              </p>
            </div>
          </div>

          {/* Login/Logout e Search Bar */}
          <div className="flex gap-2 flex-wrap items-center mb-4">
            {!isAuthenticated ? (
              <Button
                onClick={() => startLogin()}
                className="bg-green-600 hover:bg-green-700 text-white font-bold flex items-center gap-2"
                title="Fazer login como admin"
              >
                <LogIn className="w-4 h-4" />
                Login Admin
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-300">{user?.name || 'Admin'}</span>
                {isAdmin && <span className="text-xs bg-purple-600 px-2 py-1 rounded text-white">ADMIN</span>}
                <Button
                  onClick={() => logout()}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-2"
                  title="Fazer logout"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            )}
          </div>

          {/* Search Bar e Botões */}
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Buscar itens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
              />
            </div>
            <Button
              onClick={() => navigate("/instructions")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2"
              title="Ver guia de uso"
            >
              <BookOpen className="w-4 h-4" />
              Guia
            </Button>
            <Button
              onClick={() => setReporterOpen(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center gap-2"
              title="Reportar preços que você vê no jogo"
            >
              <Share2 className="w-4 h-4" />
              Reportar
            </Button>
            <Button
              onClick={() => setCalculatorOpen(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold flex items-center gap-2"
            >
              <Calculator className="w-4 h-4" />
              Calculadora
            </Button>
            {isAdmin && (
              <Button
                onClick={() => setEditorOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center gap-2"
                title="Editar preços (apenas admin)"
              >
                <Edit className="w-4 h-4" />
                Editar
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Info Banner */}
        <Card className="mb-6 bg-teal-900/20 border-teal-700/50 p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-teal-300">
            <strong>💡 Dados em Tempo Real:</strong> Os preços e tendências agora são alimentados por reportes da comunidade! Clique em "Reportar" para compartilhar os preços que você vê no jogo.
          </div>
        </Card>

        {/* Ranking de Contribuidores */}
        {contributorStats.length > 0 && (
          <div className="mb-6">
            <ContributorRanking contributors={contributorStats} />
          </div>
        )}

        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-2 bg-slate-800 p-1 mb-8">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className="text-xs sm:text-sm data-[state=active]:bg-orange-600 data-[state=active]:text-white"
              >
                {cat.name.split(" ")[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <Card className="bg-slate-800 border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-700">
                  <h2 className="text-2xl font-bold text-orange-500 font-mono">
                    {category.name}
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    {filteredAndSortedItems.length} itens
                  </p>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700 bg-slate-900/50">
                        <th className="px-6 py-4 text-left">
                          <button
                            onClick={() => handleSort("name")}
                            className="flex items-center gap-2 text-slate-300 hover:text-orange-400 transition-colors font-mono font-bold"
                          >
                            Item
                            {sortBy === "name" && (
                              sortOrder === "asc" ? (
                                <TrendingUp className="w-4 h-4" />
                              ) : (
                                <TrendingDown className="w-4 h-4" />
                              )
                            )}
                          </button>
                        </th>
                        <th className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleSort("steel")}
                            className="flex items-center justify-center gap-2 text-slate-300 hover:text-orange-400 transition-colors font-mono font-bold"
                          >
                            Aço ($)
                            {sortBy === "steel" && (
                              sortOrder === "asc" ? (
                                <TrendingUp className="w-4 h-4" />
                              ) : (
                                <TrendingDown className="w-4 h-4" />
                              )
                            )}
                          </button>
                        </th>
                        <th className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleSort("cement")}
                            className="flex items-center justify-center gap-2 text-slate-300 hover:text-orange-400 transition-colors font-mono font-bold"
                          >
                            Cimento (€)
                            {sortBy === "cement" && (
                              sortOrder === "asc" ? (
                                <TrendingUp className="w-4 h-4" />
                              ) : (
                                <TrendingDown className="w-4 h-4" />
                              )
                            )}
                          </button>
                        </th>
                        <th className="px-6 py-4 text-center">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-slate-300 font-mono font-bold cursor-help">
                                Tendência
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-900 border-slate-700 text-slate-200 text-xs max-w-xs">
                              Tendência baseada em reportes da comunidade. Mais reportes = dados mais precisos.
                            </TooltipContent>
                          </Tooltip>
                        </th>
                        <th className="px-6 py-4 text-center">
                          <span className="text-slate-300 font-mono font-bold">
                            Demanda
                          </span>
                        </th>
                        <th className="px-6 py-4 text-left">
                          <span className="text-slate-300 font-mono font-bold">
                            Reportado por
                          </span>
                        </th>
                        <th className="px-6 py-4 text-left">
                          <span className="text-slate-300 font-mono font-bold">
                            Notas
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAndSortedItems.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                            Nenhum item encontrado na busca.
                          </td>
                        </tr>
                      ) : (
                        filteredAndSortedItems.map((item, idx) => {
                          const trend = getTrendData(item.id);
                          const latestReport = latestReportByItem[item.id];
                          return (
                            <tr
                              key={item.id}
                              className={`border-b border-slate-700 hover:bg-slate-700/50 transition-colors ${
                                idx % 2 === 0 ? "bg-slate-800/30" : ""
                              }`}
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`w-2 h-2 rounded-full ${rarityColors[item.rarity]}`}
                                  />
                                  <span className="text-lg">{getItemIcon(item.id)}</span>
                                  <span className="text-slate-100 font-medium">
                                    {item.name}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="font-mono text-orange-400 font-bold">
                                  {item.steel}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="font-mono text-teal-400 font-bold">
                                  {item.cement}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                {trend && trend.history && trend.history.length > 0 ? (
                                  <Sparkline
                                    data={trend.history}
                                    trend={trend.trend}
                                    change={trend.change}
                                  />
                                ) : (
                                  <span className="text-xs text-slate-500">-</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span
                                  className={`text-xs font-mono font-bold uppercase ${
                                    demandColors[item.demand]
                                  }`}
                                >
                                  {item.demand === "low"
                                    ? "BAIXA"
                                    : item.demand === "medium"
                                      ? "MÉDIA"
                                      : item.demand === "high"
                                        ? "ALTA"
                                        : "MTO ALTA"}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-xs text-slate-300 font-medium">
                                  {latestReport ? latestReport.playerNickname : "-"}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-xs text-slate-400">
                                  {item.notes}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Info Section */}
        <Card className="mt-8 bg-slate-800 border-slate-700 p-6">
          <h3 className="text-lg font-bold text-orange-500 font-mono mb-4">
            📊 Informações de Mercado
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-300">
            <div>
              <p className="text-slate-400 mb-1">Taxa de Câmbio</p>
              <p className="font-mono font-bold text-orange-400">1 Aço ($) = 2 Cimentos (€)</p>
            </div>
            <div>
              <p className="text-slate-400 mb-1">Versão do Jogo</p>
              <p className="font-mono font-bold text-teal-400">{priceData.metadata.game_version}</p>
            </div>
            <div>
              <p className="text-slate-400 mb-1">Fonte de Dados</p>
              <p className="font-mono font-bold text-slate-300">Mercado da Comunidade (Jogadores)</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">
            {priceData.metadata.note}
          </p>
        </Card>
      </main>

      {/* Modals */}
      <ProfitCalculator isOpen={calculatorOpen} onClose={() => setCalculatorOpen(false)} />
      <PriceReporter
        isOpen={reporterOpen}
        onClose={() => setReporterOpen(false)}
        items={allItems}
        onReportSuccess={() => {
          // Recarregar dados após reporte bem-sucedido
          window.location.reload();
        }}
      />
      <PriceEditor
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        categories={categories}
        onPriceUpdate={() => {
          // Recarregar dados após atualização bem-sucedida
          window.location.reload();
        }}
      />
    </div>
  );
}
