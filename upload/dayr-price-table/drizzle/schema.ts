import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela para armazenar preços base dos itens
 */
export const itemPrices = mysqlTable("item_prices", {
  id: int("id").autoincrement().primaryKey(),
  itemId: varchar("itemId", { length: 64 }).notNull().unique(),
  itemName: varchar("itemName", { length: 255 }).notNull(),
  steelPrice: int("steelPrice").notNull(),
  cementPrice: int("cementPrice").notNull(),
  rarity: mysqlEnum("rarity", ["common", "uncommon", "rare"])
    .default("common")
    .notNull(),
  demand: mysqlEnum("demand", ["low", "medium", "high", "very_high"])
    .default("medium")
    .notNull(),
  notes: text("notes"),
  category: varchar("category", { length: 64 }).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ItemPrice = typeof itemPrices.$inferSelect;
export type InsertItemPrice = typeof itemPrices.$inferInsert;

/**
 * Tabela para armazenar reportes de preços da comunidade
 */
export const priceReports = mysqlTable("price_reports", {
  id: int("id").autoincrement().primaryKey(),
  itemId: varchar("itemId", { length: 64 }).notNull(),
  playerNickname: varchar("playerNickname", { length: 64 }).notNull(),
  steelPrice: int("steelPrice").notNull(),
  cementPrice: int("cementPrice").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PriceReport = typeof priceReports.$inferSelect;
export type InsertPriceReport = typeof priceReports.$inferInsert;
