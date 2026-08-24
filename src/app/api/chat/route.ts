import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 10;

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function err(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

const VALID_CANAIS = ['geral', 'atendimento', 'guias', 'clas', 'comercio', 'sala'] as const;
type Canal = (typeof VALID_CANAIS)[number];

function isValidCanal(val: string): val is Canal {
  return (VALID_CANAIS as readonly string[]).includes(val);
}

// ─── GET ───────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      // ── List Mensagens ─────────────────────────────────────────────────────
      case 'listMensagens': {
        const canal = searchParams.get('canal');
        if (!canal || !isValidCanal(canal)) {
          return err(
            `Canal inválido. Valores aceitos: ${VALID_CANAIS.join(', ')}`,
            400
          );
        }

        const salaId = searchParams.get('salaId') ?? undefined;
        if (canal === 'sala' && !salaId) {
          return err('salaId obrigatório quando canal é sala.', 400);
        }
        const lastId = searchParams.get('lastId') ?? undefined;
        const limit = Math.min(
          Math.max(Number(searchParams.get('limit')) || 50, 1),
          200
        );

        const where: Record<string, unknown> = { canal };

        if (salaId) {
          const salaExists = await db.chatSala.findUnique({
            where: { id: salaId },
          });
          if (!salaExists) {
            return err('Sala não encontrada.', 404);
          }
          where.salaId = salaId;
        }

        if (lastId) {
          where.id = { gt: lastId };
        }

        const mensagens = await db.chatMensagem.findMany({
          where,
          orderBy: { data: 'asc' },
          take: limit,
        });

        return json(mensagens);
      }

      // ── List Salas ─────────────────────────────────────────────────────────
      case 'listSalas': {
        const salas = await db.chatSala.findMany({
          orderBy: { dataCriacao: 'desc' },
          include: {
            _count: {
              select: { mensagens: true },
            },
          },
        });

        const salasWithCount = salas.map((sala) => ({
          id: sala.id,
          nome: sala.nome,
          criadoPor: sala.criadoPor,
          senha: sala.senha ? true : false,
          dataCriacao: sala.dataCriacao,
          totalMensagens: sala._count.mensagens,
        }));

        return json(salasWithCount);
      }

      default:
        return err('Ação GET desconhecida. Use: listMensagens, listSalas', 400);
    }
  } catch (error) {
    console.error('[GET /api/chat]', error);
    return err('Erro interno do servidor.', 500);
  }
}

// ─── POST ──────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      // ── Send Message ───────────────────────────────────────────────────────
      case 'sendMessage': {
        const { canal, salaId, conteudo, autor, isAdmin } = body;

        if (!canal || !isValidCanal(canal)) {
          return err(
            `Canal inválido. Valores aceitos: ${VALID_CANAIS.join(', ')}`,
            400
          );
        }

        if (!conteudo || typeof conteudo !== 'string') {
          return err('O conteúdo da mensagem é obrigatório.', 400);
        }

        const trimmedConteudo = conteudo.trim();
        if (trimmedConteudo.length === 0) {
          return err('A mensagem não pode estar vazia.', 400);
        }
        if (trimmedConteudo.length > 2000) {
          return err('A mensagem não pode exceder 2000 caracteres.', 400);
        }

        if (!autor || typeof autor !== 'string' || autor.trim().length === 0) {
          return err('O autor é obrigatório.', 400);
        }

        // If a salaId is provided, verify it exists
        if (salaId) {
          const salaExists = await db.chatSala.findUnique({
            where: { id: salaId },
          });
          if (!salaExists) {
            return err('Sala não encontrada.', 404);
          }
        }

        const mensagem = await db.chatMensagem.create({
          data: {
            canal,
            salaId: salaId || null,
            conteudo: trimmedConteudo,
            autor: autor.trim(),
            isAdmin: typeof isAdmin === 'boolean' ? isAdmin : false,
          },
        });

        return json(mensagem, 201);
      }

      // ── Create Sala ────────────────────────────────────────────────────────
      case 'createSala': {
        const { nome, criadoPor, senha } = body;

        if (!nome || typeof nome !== 'string' || nome.trim().length === 0) {
          return err('O nome da sala é obrigatório.', 400);
        }

        const trimmedNome = nome.trim();
        if (trimmedNome.length > 30) {
          return err('O nome da sala não pode exceder 30 caracteres.', 400);
        }

        if (
          !criadoPor ||
          typeof criadoPor !== 'string' ||
          criadoPor.trim().length === 0
        ) {
          return err('O criador da sala é obrigatório.', 400);
        }

        const sala = await db.chatSala.create({
          data: {
            nome: trimmedNome,
            criadoPor: criadoPor.trim(),
            senha: senha && typeof senha === 'string' && senha.trim().length > 0
              ? senha
              : null,
          },
        });

        return json(sala, 201);
      }

      // ── Delete Mensagem ────────────────────────────────────────────────────
      case 'deleteMensagem': {
        const { id, adminPassword } = body;

        if (!id || typeof id !== 'string') {
          return err('O ID da mensagem é obrigatório.', 400);
        }

        if (!adminPassword || typeof adminPassword !== 'string') {
          return err('A senha de administrador é obrigatória.', 400);
        }

        if (adminPassword !== process.env.ADMIN_PASSWORD) {
          return err('Senha de administrador inválida.', 403);
        }

        const mensagem = await db.chatMensagem.findUnique({
          where: { id },
        });

        if (!mensagem) {
          return err('Mensagem não encontrada.', 404);
        }

        await db.chatMensagem.delete({
          where: { id },
        });

        return json({ success: true, deletedId: id });
      }

      // ── Delete Sala ────────────────────────────────────────────────────────
      case 'deleteSala': {
        const { id, adminPassword } = body;

        if (!id || typeof id !== 'string') {
          return err('O ID da sala é obrigatório.', 400);
        }

        if (!adminPassword || typeof adminPassword !== 'string') {
          return err('A senha de administrador é obrigatória.', 400);
        }

        if (adminPassword !== process.env.ADMIN_PASSWORD) {
          return err('Senha de administrador inválida.', 403);
        }

        const sala = await db.chatSala.findUnique({
          where: { id },
        });

        if (!sala) {
          return err('Sala não encontrada.', 404);
        }

        await db.chatSala.delete({
          where: { id },
        });

        return json({ success: true, deletedId: id });
      }

      default:
        return err(
          'Ação POST desconhecida. Use: sendMessage, createSala, deleteMensagem, deleteSala',
          400
        );
    }
  } catch (error) {
    console.error('[POST /api/chat]', error);
    return err('Erro interno do servidor.', 500);
  }
}
