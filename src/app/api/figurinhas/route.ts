import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

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
    const mod = await db.moderador.findFirst({ where: { token: modToken, ativo: true, tokenExpira: { gt: new Date() } } });
    if (mod) {
      let perms: string[] = [];
      try { perms = JSON.parse(mod.permissoes || "[]"); } catch {}
      if (perms.includes("figurinhas")) return { ok: true };
      return { ok: false, error: "Sem permissao" };
    }
  }
  return { ok: false, error: "Nao autorizado" };
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    if (i > 0) code += "-";
    for (let j = 0; j < 4; j++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return code;
}

// GET - Public: list figurinhas; Admin: can see codes, albums, sales
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    switch (action) {
      case "figurinhas": {
        // Public: list all figurinhas (without imageData to save bandwidth)
        const figurinhas = await db.figurinha.findMany({
          select: { id: true, nome: true, imageData: true, preco: true, data: true, _count: { select: { codigos: true } } },
          orderBy: { data: "desc" },
        });
        return json(figurinhas);
      }

      case "figurinhaDetail": {
        const id = url.searchParams.get("id");
        if (!id) return err("ID obrigatorio");

        // Check if admin
        const auth = await verifyAuth(req);

        if (auth.ok) {
          // Admin sees full details with all codes
          const fig = await db.figurinha.findUnique({
            where: { id },
            include: { codigos: { orderBy: { data: "desc" } } },
          });
          if (!fig) return err("Figurinha nao encontrada");
          return json(fig);
        }

        // Public sees figurinha with code counts only
        const fig = await db.figurinha.findUnique({
          where: { id },
          include: { codigos: { select: { status: true } } },
        });
        if (!fig) return err("Figurinha nao encontrada");
        const available = fig.codigos.filter(c => c.status === "available").length;
        const redeemed = fig.codigos.filter(c => c.status === "redeemed").length;
        return json({
          id: fig.id,
          nome: fig.nome,
          imageData: fig.imageData,
          preco: fig.preco,
          data: fig.data,
          codigos: [], // Don't expose codes to public
          _count: { available, redeemed, total: fig.codigos.length },
        });
      }

      case "album": {
        const playerName = url.searchParams.get("playerName");
        const senha = url.searchParams.get("senha");
        if (!playerName || !senha) return err("playerName e senha obrigatorios");
        const album = await db.album.findFirst({
          where: { playerName, senha },
          include: {
            figurinhas: {
              include: {
                figurinhaCodigo: {
                  include: { figurinha: { select: { id: true, nome: true, imageData: true, preco: true } } },
                },
              },
            },
          },
        });
        if (!album) return err("Album nao encontrado ou senha incorreta", 404);
        return json(album);
      }

      case "codes": {
        // Admin: list all codes with status
        const auth = await verifyAuth(req);
        if (!auth.ok) return err(auth.error || "Nao autorizado", 403);
        const figurinhaId = url.searchParams.get("figurinhaId");
        const where = figurinhaId ? { figurinhaId } : {};
        const codes = await db.figurinhaCodigo.findMany({
          where,
          include: {
            figurinha: { select: { nome: true } },
            albumItem: { include: { album: { select: { playerName: true } } } },
          },
          orderBy: { data: "desc" },
        });
        return json(codes);
      }

      case "sales": {
        // Admin: figurinha sales
        const auth = await verifyAuth(req);
        if (!auth.ok) return err(auth.error || "Nao autorizado", 403);
        const sales = await db.figurinhaVenda.findMany({ orderBy: { data: "desc" } });
        return json(sales);
      }

      case "redeemedCodes": {
        // Admin: codes that have been redeemed recently
        const auth = await verifyAuth(req);
        if (!auth.ok) return err(auth.error || "Nao autorizado", 403);
        const redeemed = await db.figurinhaCodigo.findMany({
          where: { status: "redeemed" },
          include: {
            figurinha: { select: { nome: true } },
            albumItem: { include: { album: { select: { playerName: true } } } },
          },
          orderBy: { data: "desc" },
        });
        return json(redeemed);
      }

      default:
        // Default: return figurinhas list
        const figurinhas = await db.figurinha.findMany({
          select: { id: true, nome: true, imageData: true, preco: true, data: true, _count: { select: { codigos: true } } },
          orderBy: { data: "desc" },
        });
        return json(figurinhas);
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro interno";
    return err(msg, 500);
  }
}

// POST - all mutations
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // Handle FormData (for image upload)
    if (contentType.includes("multipart/form-data")) {
      const auth = await verifyAuth(req);
      if (!auth.ok) return err(auth.error || "Nao autorizado", 403);

      const formData = await req.formData();
      const action = formData.get("action") as string;
      const nome = formData.get("nome") as string;
      const preco = parseFloat(formData.get("preco") as string) || 0;
      const qtyCodes = parseInt(formData.get("qtyCodes") as string) || 1;
      const imageFile = formData.get("image") as File | null;

      if (action === "createFigurinha") {
        if (!nome?.trim()) return err("Nome obrigatorio");
        if (!imageFile) return err("Imagem obrigatoria");

        // Convert image to base64 data URL
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const base64 = buffer.toString("base64");
        const mimeType = imageFile.type || "image/png";
        const imageData = `data:${mimeType};base64,${base64}`;

        // Generate unique codes
        const codes: string[] = [];
        for (let i = 0; i < qtyCodes; i++) {
          let code: string;
          let attempts = 0;
          do {
            code = generateCode();
            const exists = await db.figurinhaCodigo.findUnique({ where: { codigo: code } });
            if (!exists) break;
            attempts++;
          } while (attempts < 100);
          codes.push(code);
        }

        const figurinha = await db.figurinha.create({
          data: {
            nome: nome.trim(),
            imageData,
            preco,
            codigos: { create: codes.map(c => ({ codigo: c })) },
          },
          include: { codigos: true },
        });

        return json(figurinha, 201);
      }

      return err("Acao desconhecida para FormData");
    }

    // Handle JSON
    const data = await req.json();
    const { action } = data;

    switch (action) {
      case "createAlbum": {
        const { playerName, senha } = data;
        if (!playerName?.trim() || !senha?.trim()) return err("playerName e senha obrigatorios");
        if (playerName.trim().length > 50) return err("Nome muito longo");
        // Check if album already exists
        const existing = await db.album.findFirst({ where: { playerName: playerName.trim() } });
        if (existing) return err("Ja existe um album com esse nome. Tente outro.");
        const album = await db.album.create({
          data: { playerName: playerName.trim(), senha },
        });
        return json({ id: album.id, playerName: album.playerName }, 201);
      }

      case "redeemCode": {
        const { albumId, codigo } = data;
        if (!albumId || !codigo?.trim()) return err("albumId e codigo obrigatorios");

        // Find the code
        const figCode = await db.figurinhaCodigo.findUnique({
          where: { codigo: codigo.trim().toUpperCase() },
          include: { figurinha: true, albumItem: true },
        });
        if (!figCode) return err("Codigo invalido");
        if (figCode.status !== "available") return err("Codigo ja utilizado");

        // Check if album already has this figurinha type
        const existingInAlbum = await db.albumFigurinha.findFirst({
          where: {
            albumId,
            figurinhaCodigo: { figurinhaId: figCode.figurinhaId },
          },
        });
        if (existingInAlbum) return err("Voce ja tem essa figurinha no seu album!");

        // Add to album
        const albumFig = await db.albumFigurinha.create({
          data: { albumId, figurinhaCodigoId: figCode.id },
        });

        // Mark code as redeemed
        await db.figurinhaCodigo.update({
          where: { id: figCode.id },
          data: { status: "redeemed" },
        });

        return json({ success: true, figurinha: figCode.figurinha, albumFigId: albumFig.id });
      }

      case "deleteFigurinha": {
        const auth = await verifyAuth(req);
        if (!auth.ok) return err(auth.error || "Nao autorizado", 403);
        const { id } = data;
        if (!id) return err("ID obrigatorio");
        await db.figurinha.delete({ where: { id } });
        return json({ success: true });
      }

      case "deleteCode": {
        const auth = await verifyAuth(req);
        if (!auth.ok) return err(auth.error || "Nao autorizado", 403);
        const { id } = data;
        if (!id) return err("ID obrigatorio");
        await db.figurinhaCodigo.delete({ where: { id } });
        return json({ success: true });
      }

      case "addSale": {
        const auth = await verifyAuth(req);
        if (!auth.ok) return err(auth.error || "Nao autorizado", 403);
        const { figurinhaId, figurinhaNome, quantidade, valorPago, comprador } = data;
        if (!figurinhaId || !figurinhaNome || !quantidade || valorPago === undefined || !comprador) {
          return err("Campos obrigatorios: figurinhaId, figurinhaNome, quantidade, valorPago, comprador");
        }
        const sale = await db.figurinhaVenda.create({
          data: { figurinhaId, figurinhaNome, quantidade: parseInt(quantidade), valorPago: parseFloat(valorPago), comprador },
        });
        return json(sale, 201);
      }

      case "removeFigurinhaFromAlbum": {
        // Remove a figurinha from album (for trading - the code becomes available again)
        const { albumId, figurinhaCodigoId } = data;
        if (!albumId || !figurinhaCodigoId) return err("albumId e figurinhaCodigoId obrigatorios");

        // Remove from album
        const deleted = await db.albumFigurinha.deleteMany({
          where: { albumId, figurinhaCodigoId },
        });

        if (deleted.count > 0) {
          // Make code available again
          await db.figurinhaCodigo.update({
            where: { id: figurinhaCodigoId },
            data: { status: "available" },
          });
          return json({ success: true });
        }
        return err("Figurinha nao encontrada no album");
      }

      default:
        return err("Acao desconhecida: " + action);
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro interno";
    return err(msg, 500);
  }
}
