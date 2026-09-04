import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function err(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "dayr2024";

async function verifyAuth(req: NextRequest): Promise<{ ok: boolean; isSuperAdmin: boolean; modName?: string; error?: string }> {
  const pwd = req.headers.get("x-admin-password");
  if (pwd && pwd === ADMIN_PASSWORD) return { ok: true, isSuperAdmin: true };
  const modToken = req.headers.get("x-moderador-token");
  if (modToken) {
    const mod = await db.moderador.findFirst({ where: { token: modToken, ativo: true, tokenExpira: { gt: new Date() } } });
    if (mod) {
      let perms: string[] = [];
      try { perms = JSON.parse(mod.permissoes || "[]"); } catch {}
      if (perms.includes("blacklist")) return { ok: true, isSuperAdmin: false, modName: mod.nome };
      return { ok: false, isSuperAdmin: false, error: "Sem permissao para gerenciar blacklist" };
    }
  }
  return { ok: false, isSuperAdmin: false, error: "Nao autorizado" };
}

// GET - Public: returns approved entries; Admin: can see all with ?status=pending or ?status=all
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const statusFilter = url.searchParams.get("status");

    // Check if admin is requesting
    const auth = await verifyAuth(req);

    if (statusFilter && auth.ok) {
      // Admin requesting specific status
      if (statusFilter === "all") {
        const entries = await db.blacklistEntry.findMany({ orderBy: { dataCriacao: "desc" } });
        return json(entries);
      }
      const entries = await db.blacklistEntry.findMany({ where: { status: statusFilter }, orderBy: { dataCriacao: "desc" } });
      return json(entries);
    }

    // Public: only approved entries
    const entries = await db.blacklistEntry.findMany({
      where: { status: "approved" },
      orderBy: { dataCriacao: "desc" },
    });
    return json(entries);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro interno";
    return err(msg, 500);
  }
}

// POST - Submit a new blacklist entry (public) or admin actions (approve/reject/delete)
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { action } = data;

    // Public: submit new entry
    if (!action || action === "submit") {
      const { reporterName, targetName, reason } = data;
      if (!reporterName?.trim() || !targetName?.trim() || !reason?.trim()) {
        return err("Campos obrigatorios: reporterName, targetName, reason");
      }
      if (reporterName.trim().length > 50 || targetName.trim().length > 50) {
        return err("Nome muito longo (max 50 caracteres)");
      }
      if (reason.trim().length > 500) {
        return err("Motivo muito longo (max 500 caracteres)");
      }
      const entry = await db.blacklistEntry.create({
        data: {
          reporterName: reporterName.trim(),
          targetName: targetName.trim(),
          reason: reason.trim(),
          status: "pending",
        },
      });
      return json(entry, 201);
    }

    // Admin actions
    const auth = await verifyAuth(req);
    if (!auth.ok) return err(auth.error || "Nao autorizado", 403);

    const reviewerName = auth.isSuperAdmin ? "Admin" : (auth.modName || "Moderador");

    switch (action) {
      case "approve": {
        const { id, reviewNote } = data;
        if (!id) return err("ID obrigatorio");
        const entry = await db.blacklistEntry.update({
          where: { id },
          data: { status: "approved", reviewedBy: reviewerName, reviewNote: reviewNote?.trim() || null, dataReview: new Date() },
        });
        return json(entry);
      }

      case "reject": {
        const { id, reviewNote } = data;
        if (!id) return err("ID obrigatorio");
        const entry = await db.blacklistEntry.update({
          where: { id },
          data: { status: "rejected", reviewedBy: reviewerName, reviewNote: reviewNote?.trim() || null, dataReview: new Date() },
        });
        return json(entry);
      }

      case "delete": {
        const { id } = data;
        if (!id) return err("ID obrigatorio");
        await db.blacklistEntry.delete({ where: { id } });
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
