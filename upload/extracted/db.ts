import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  emprestimos, investidores, tabelasTroca, trocasRegistro, comprasVendas, caixa, doadores,
  leiloes, lances, sorteios, participantesSorteio, loterica, numerosLoterica
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

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

// Feature Helpers
export const dbHelpers = {
  getEmprestimos: async () => {
    const db = await getDb();
    return db ? db.select().from(emprestimos).orderBy(desc(emprestimos.dataEmprestimo)) : [];
  },
  addEmprestimo: async (data: any) => {
    const db = await getDb();
    if (db) await db.insert(emprestimos).values(data);
  },
  updateEmprestimo: async (id: string, data: any) => {
    const db = await getDb();
    if (db) await db.update(emprestimos).set(data).where(eq(emprestimos.id, id));
  },

  getInvestidores: async () => {
    const db = await getDb();
    return db ? db.select().from(investidores).where(eq(investidores.status, 'ativo')).orderBy(desc(investidores.ordem)) : [];
  },
  addInvestidor: async (data: any) => {
    const db = await getDb();
    if (db) await db.insert(investidores).values(data);
  },
  updateInvestidor: async (id: string, data: any) => {
    const db = await getDb();
    if (db) await db.update(investidores).set(data).where(eq(investidores.id, id));
  },
  removeInvestidor: async (id: string) => {
    const db = await getDb();
    if (db) await db.delete(investidores).where(eq(investidores.id, id));
  },

  getTabelasTroca: async () => {
    const db = await getDb();
    return db ? db.select().from(tabelasTroca) : [];
  },
  addTabelaTroca: async (data: any) => {
    const db = await getDb();
    if (db) await db.insert(tabelasTroca).values(data);
  },
  removeTabelaTroca: async (id: string) => {
    const db = await getDb();
    if (db) await db.delete(tabelasTroca).where(eq(tabelasTroca.id, id));
  },

  getTrocasRegistro: async () => {
    const db = await getDb();
    return db ? db.select().from(trocasRegistro).orderBy(desc(trocasRegistro.data)) : [];
  },
  addTroca: async (data: any) => {
    const db = await getDb();
    if (db) await db.insert(trocasRegistro).values(data);
  },

  getComprasVendas: async () => {
    const db = await getDb();
    return db ? db.select().from(comprasVendas).orderBy(desc(comprasVendas.data)) : [];
  },
  addCompraVenda: async (data: any) => {
    const db = await getDb();
    if (db) await db.insert(comprasVendas).values(data);
  },

  getCaixa: async () => {
    const db = await getDb();
    return db ? db.select().from(caixa).orderBy(desc(caixa.data)) : [];
  },
  addCaixa: async (data: any) => {
    const db = await getDb();
    if (db) await db.insert(caixa).values(data);
  },
  resetCaixa: async () => {
    const db = await getDb();
    if (db) {
      await db.delete(caixa);
      await db.delete(emprestimos);
      await db.delete(trocasRegistro);
      await db.delete(comprasVendas);
      await db.delete(doadores);
    }
  },

  getDoadores: async () => {
    const db = await getDb();
    return db ? db.select().from(doadores).orderBy(desc(doadores.ordem)) : [];
  },
  addDoador: async (data: any) => {
    const db = await getDb();
    if (db) await db.insert(doadores).values(data);
  },
  updateDoador: async (id: string, data: any) => {
    const db = await getDb();
    if (db) await db.update(doadores).set(data).where(eq(doadores.id, id));
  },

  getLeiloes: async () => {
    const db = await getDb();
    return db ? db.select().from(leiloes).orderBy(desc(leiloes.dataCriacao)) : [];
  },
  addLeilao: async (data: any) => {
    const db = await getDb();
    if (db) await db.insert(leiloes).values(data);
  },
  updateLeilao: async (id: string, data: any) => {
    const db = await getDb();
    if (db) await db.update(leiloes).set(data).where(eq(leiloes.id, id));
  },
  removeLeilao: async (id: string) => {
    const db = await getDb();
    if (db) {
      await db.delete(lances).where(eq(lances.leilaoId, id));
      await db.delete(leiloes).where(eq(leiloes.id, id));
    }
  },

  getLances: async (leilaoId: string) => {
    const db = await getDb();
    return db ? db.select().from(lances).where(eq(lances.leilaoId, leilaoId)).orderBy(desc(lances.valor)) : [];
  },
  getAllLances: async () => {
    const db = await getDb();
    return db ? db.select().from(lances) : [];
  },
  addLance: async (data: any) => {
    const db = await getDb();
    if (db) await db.insert(lances).values(data);
  },

  // Sorteios
  getSorteios: async () => {
    const db = await getDb();
    return db ? db.select().from(sorteios).orderBy(desc(sorteios.dataCriacao)) : [];
  },
  getSorteio: async (id: string) => {
    const db = await getDb();
    if (!db) return undefined;
    const result = await db.select().from(sorteios).where(eq(sorteios.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  },
  addSorteio: async (data: any) => {
    const db = await getDb();
    if (db) await db.insert(sorteios).values(data);
  },
  updateSorteio: async (id: string, data: any) => {
    const db = await getDb();
    if (db) await db.update(sorteios).set(data).where(eq(sorteios.id, id));
  },
  removeSorteio: async (id: string) => {
    const db = await getDb();
    if (db) {
      await db.delete(participantesSorteio).where(eq(participantesSorteio.sorteioId, id));
      await db.delete(sorteios).where(eq(sorteios.id, id));
    }
  },
  getParticipantes: async (sorteioId: string) => {
    const db = await getDb();
    return db ? db.select().from(participantesSorteio).where(eq(participantesSorteio.sorteioId, sorteioId)) : [];
  },
  addParticipante: async (data: any) => {
    const db = await getDb();
    if (db) await db.insert(participantesSorteio).values(data);
  },

  // Lotérica
  getLoterica: async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(loterica).orderBy(desc(loterica.dataCriacao)).limit(1);
  },
  getAllLoterica: async () => {
    const db = await getDb();
    return db ? db.select().from(loterica).orderBy(desc(loterica.dataCriacao)) : [];
  },
  addLoterica: async (data: any) => {
    const db = await getDb();
    if (db) await db.insert(loterica).values(data);
  },
  updateLoterica: async (id: string, data: any) => {
    const db = await getDb();
    if (db) await db.update(loterica).set(data).where(eq(loterica.id, id));
  },
  getNumerosLoterica: async (lotericaId: string) => {
    const db = await getDb();
    return db ? db.select().from(numerosLoterica).where(eq(numerosLoterica.lotericaId, lotericaId)).orderBy(numerosLoterica.numero) : [];
  },
  addNumeroLoterica: async (data: any) => {
    const db = await getDb();
    if (db) await db.insert(numerosLoterica).values(data);
  },
  updateNumeroLoterica: async (id: string, data: any) => {
    const db = await getDb();
    if (db) await db.update(numerosLoterica).set(data).where(eq(numerosLoterica.id, id));
  },
};
