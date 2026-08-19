import trendsRaw from "./price-trends.json";

export const priceTrends = trendsRaw as {
  trends: Record<
    string,
    {
      history: number[];
      trend: "up" | "down" | "stable";
      change: number;
    }
  >;
};
