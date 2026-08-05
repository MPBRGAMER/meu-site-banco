// Re-export prices.json with proper typing
import pricesDataRaw from "./prices.json";

export const pricesData = pricesDataRaw as {
  metadata: {
    version: string;
    game_version: string;
    last_updated: string;
    exchange_rate: string;
    note: string;
  };
  categories: Array<{
    id: string;
    name: string;
    items: Array<{
      id: string;
      name: string;
      steel: string;
      cement: string;
      rarity: string;
      demand: string;
      notes: string;
    }>;
  }>;
};
