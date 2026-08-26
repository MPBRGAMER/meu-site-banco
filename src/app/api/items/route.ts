import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 10;

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function err(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "dayr2024";

async function verifyAuth(req: NextRequest): Promise<{ ok: boolean; error?: string }> {
  const pwd = req.headers.get("x-admin-password");
  if (pwd && pwd === ADMIN_PASSWORD) return { ok: true };
  const modToken = req.headers.get("x-moderador-token");
  if (modToken) {
    const { db } = await import("@/lib/db");
    const mod = await db.moderador.findFirst({ where: { token: modToken, ativo: true, tokenExpira: { gt: new Date() } } });
    if (mod) {
      const perms = (mod.permissoes || "").split(",");
      if (perms.includes("tabela")) return { ok: true };
      return { ok: false, error: "Sem permissao para gerenciar itens" };
    }
  }
  return { ok: false, error: "Nao autorizado" };
}

export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (!auth.ok) return err(auth.error || "Nao autorizado", 403);

  try {
    const data = await req.json();
    const { action, item } = data;

    if (!action || !item) {
      return err("Campos obrigatorios: action, item");
    }

    switch (action) {
      case "add": {
        const { itemId, name, categoryId, img, wikiLink, steel, cement, rarity, demand, notes } = item;
        if (!itemId || !name || !categoryId) {
          return err("Campos obrigatorios: itemId, name, categoryId");
        }
        const override = await db.itemOverride.upsert({
          where: { itemId },
          update: {
            name,
            categoryId,
            img: img || null,
            wikiLink: wikiLink || null,
            steel: steel || null,
            cement: cement || null,
            rarity: rarity || null,
            demand: demand || null,
            notes: notes || null,
            action: "add",
          },
          create: {
            itemId,
            name,
            categoryId,
            img: img || null,
            wikiLink: wikiLink || null,
            steel: steel || null,
            cement: cement || null,
            rarity: rarity || null,
            demand: demand || null,
            notes: notes || null,
            action: "add",
          },
        });
        return json(override);
      }

      case "edit": {
        const { itemId, name, categoryId, img, wikiLink, steel, cement, demand, notes } = item;
        if (!itemId) {
          return err("itemId obrigatorio");
        }
        const existing = await db.itemOverride.findUnique({ where: { itemId } });
        const updateData: Record<string, unknown> = { action: "edit" };
        if (name !== undefined) updateData.name = name;
        if (categoryId !== undefined) updateData.categoryId = categoryId;
        if (img !== undefined) updateData.img = img || null;
        if (wikiLink !== undefined) updateData.wikiLink = wikiLink || null;
        if (steel !== undefined) updateData.steel = steel;
        if (cement !== undefined) updateData.cement = cement;
        if (demand !== undefined) updateData.demand = demand;
        if (notes !== undefined) updateData.notes = notes;

        if (existing) {
          // Preserve the original action ("add" or "edit") so added items don't disappear
          delete updateData.action;
          const updated = await db.itemOverride.update({ where: { itemId }, data: updateData });
          return json(updated);
        } else {
          const created = await db.itemOverride.create({
            data: { itemId, ...updateData },
          });
          return json(created);
        }
      }

      case "remove": {
        const { itemId, name, categoryId } = item;
        if (!itemId) {
          return err("itemId obrigatorio");
        }
        const override = await db.itemOverride.upsert({
          where: { itemId },
          update: { action: "remove", name: name || null, categoryId: categoryId || null },
          create: { itemId, action: "remove", name: name || null, categoryId: categoryId || null },
        });
        return json(override);
      }

      case "restore": {
        const { itemId } = item;
        if (!itemId) return err("itemId obrigatorio");
        await db.itemOverride.delete({ where: { itemId } });
        return json({ success: true });
      }

      default:
        return err("Acao desconhecida: " + action);
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro interno";
    return err(msg, 500);
  }
}

export async function GET() {
  // Public: anyone can read overrides so all users see the updated table
  try {
    const overrides = await db.itemOverride.findMany({
      orderBy: { data: "desc" },
    });
    return json(overrides);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro interno";
    return err(msg, 500);
  }
}