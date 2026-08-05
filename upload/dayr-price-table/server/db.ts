import { and, desc, eq, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, itemPrices, priceReports } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Obter todos os preços de itens
 */
export async function getAllItemPrices() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(itemPrices);
}

/**
 * Obter preço de um item específico
 */
export async function getItemPrice(itemId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(itemPrices)
    .where(eq(itemPrices.itemId, itemId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Atualizar preço de um item
 */
export async function updateItemPrice(
  itemId: string,
  steelPrice: number,
  cementPrice: number
) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(itemPrices)
    .set({ steelPrice, cementPrice })
    .where(eq(itemPrices.itemId, itemId));
}

/**
 * Adicionar reporte de preço
 */
export async function addPriceReport(
  itemId: string,
  playerNickname: string,
  steelPrice: number,
  cementPrice: number
) {
  const db = await getDb();
  if (!db) return;
  await db.insert(priceReports).values({
    itemId,
    playerNickname,
    steelPrice,
    cementPrice,
  });
}

/**
 * Obter reportes de preço de um item (últimos 7 dias)
 */
export async function getPriceReportsForItem(itemId: string) {
  const db = await getDb();
  if (!db) return [];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return db
    .select()
    .from(priceReports)
    .where(
      and(
        eq(priceReports.itemId, itemId),
        gte(priceReports.timestamp, sevenDaysAgo)
      )
    )
    .orderBy(desc(priceReports.timestamp));
}

/**
 * Obter estatísticas de contribuidores
 */
export async function getContributorStats() {
  const db = await getDb();
  if (!db) return [];
  try {
    const result = await db.execute(
      `SELECT playerNickname, COUNT(*) as reportCount, MAX(timestamp) as lastReportDate
       FROM price_reports
       GROUP BY playerNickname
       ORDER BY reportCount DESC
       LIMIT 10`
    );
    return (result[0] as unknown || []) as Array<{
      playerNickname: string;
      reportCount: number;
      lastReportDate: Date;
    }>;
  } catch (error) {
    console.error("[Database] Failed to get contributor stats:", error);
    return [];
  }
}
