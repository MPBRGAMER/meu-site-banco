import { useState, useEffect } from "react";

export interface PriceReport {
  itemId: string;
  itemName: string;
  steelPrice: number;
  cementPrice: number;
  timestamp: number;
  playerNickname: string;
}

export interface PriceTrend {
  history: number[];
  trend: "up" | "down" | "stable";
  change: number;
  lastUpdate: number;
  reportCount: number;
}

const STORAGE_KEY = "dayr_price_reports";
const MAX_HISTORY_DAYS = 30;

export function usePriceHistory() {
  const [reports, setReports] = useState<PriceReport[]>([]);

  // Carregar relatórios do localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Filtrar relatórios antigos (mais de 30 dias)
        const now = Date.now();
        const filtered = parsed.filter(
          (report: PriceReport) => now - report.timestamp < MAX_HISTORY_DAYS * 24 * 60 * 60 * 1000
        );
        setReports(filtered);
      } catch (e) {
        console.error("Erro ao carregar histórico de preços:", e);
      }
    }
  }, []);

  // Salvar relatórios no localStorage sempre que mudarem
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  }, [reports]);

  const addReport = (report: PriceReport) => {
    setReports((prev) => [report, ...prev]);
  };

  const calculateTrend = (itemId: string, currency: "steel" | "cement"): PriceTrend | null => {
    const itemReports = reports
      .filter((r) => r.itemId === itemId)
      .sort((a, b) => a.timestamp - b.timestamp);

    if (itemReports.length < 2) {
      return null;
    }

    // Agrupar por dia e calcular média
    const dailyAverages: Record<string, number> = {};
    itemReports.forEach((report) => {
      const date = new Date(report.timestamp).toLocaleDateString();
      const price = currency === "steel" ? report.steelPrice : report.cementPrice;

      if (!dailyAverages[date]) {
        dailyAverages[date] = 0;
      }
      dailyAverages[date] += price;
    });

    // Calcular média por dia
    const dates = Object.keys(dailyAverages).sort();
    const history = dates.slice(-7).map((date) => {
      const dayReports = itemReports.filter(
        (r) => new Date(r.timestamp).toLocaleDateString() === date
      );
      const sum = dayReports.reduce(
        (acc, r) => acc + (currency === "steel" ? r.steelPrice : r.cementPrice),
        0
      );
      return Math.round(sum / dayReports.length);
    });

    if (history.length < 2) {
      return null;
    }

    // Calcular tendência
    const firstPrice = history[0];
    const lastPrice = history[history.length - 1];
    const change = Math.round(((lastPrice - firstPrice) / firstPrice) * 100);

    let trend: "up" | "down" | "stable" = "stable";
    if (change > 5) trend = "up";
    else if (change < -5) trend = "down";

    return {
      history,
      trend,
      change,
      lastUpdate: itemReports[itemReports.length - 1].timestamp,
      reportCount: itemReports.length,
    };
  };

  const getReportsForItem = (itemId: string): PriceReport[] => {
    return reports.filter((r) => r.itemId === itemId).sort((a, b) => b.timestamp - a.timestamp);
  };

  const clearOldReports = () => {
    const now = Date.now();
    const filtered = reports.filter(
      (report) => now - report.timestamp < MAX_HISTORY_DAYS * 24 * 60 * 60 * 1000
    );
    setReports(filtered);
  };

  return {
    reports,
    addReport,
    calculateTrend,
    getReportsForItem,
    clearOldReports,
  };
}
