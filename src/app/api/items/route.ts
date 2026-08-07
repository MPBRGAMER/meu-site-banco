import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function err(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

function verifyAdmin(req: NextRequest): boolean {
  const pwd = req.headers.get("x-admin-password");
  if (!pwd || pwd !== ADMIN_PASSWORD) return false;
  return true;
}

export async function POST(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return err("Senha de admin invalida", 403);
  }

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
        const { itemId, name, categoryId, wikiLink, steel, cement, demand, notes } = item;
        if (!itemId) {
          return err("itemId obrigatorio");
        }
        const existing = await db.itemOverride.findUnique({ where: { itemId } });
        const updateData: Record<string, unknown> = { action: "edit" };
        if (name !== undefined) updateData.name = name;
        if (categoryId !== undefined) updateData.categoryId = categoryId;
        if (wikiLink !== undefined) updateData.wikiLink = wikiLink || null;
        if (steel !== undefined) updateData.steel = steel;
        if (cement !== undefined) updateData.cement = cement;
        if (demand !== undefined) updateData.demand = demand;
        if (notes !== undefined) updateData.notes = notes;

        if (existing) {
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

export async function GET(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return err("Senha de admin invalida", 403);
  }

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