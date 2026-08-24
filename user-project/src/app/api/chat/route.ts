import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 10;

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function err(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const VALID_CANAIS = ['geral', 'atendimento', 'guias', 'clas', 'comercio', 'sala'] as const;
type Canal = (typeof VALID_CANAIS)[number];

function isValidCanal(val: string): val is Canal {
  return (VALID_CANAIS as readonly string[]).includes(val);
}

async function verifyChatAdmin(req: NextRequest, bodyPassword?: string): Promise<boolean> {
  const adminPwd = req.headers.get('x-admin-password');
  if (adminPwd && adminPwd === ADMIN_PASSWORD) return true;
  const modToken = req.headers.get('x-moderador-token');
  if (modToken) {
    const mod = await db.moderador.findFirst({ where: { token: modToken, ativo: true, tokenExpira: { gt: new Date() } } });
    if (mod) {
      const perms = JSON.parse(mod.permissoes);
      return perms.includes('chat');
    }
  }
  if (bodyPassword && bodyPassword === ADMIN_PASSWORD) return true;
  return false;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'listMensagens': {
        const canal = searchParams.get('canal');
        if (!canal || !isValidCanal(canal)) {
          return err(`Canal inválido. Valores aceitos: ${VALID_CANAIS.join(', ')}`, 400);
        }
        const salaId = searchParams.get('salaId') ?? undefined;
        if (canal === 'sala' && !salaId) {
          return err('salaId obrigatório quando canal é sala.', 400);
        }
        const lastId = searchParams.get('lastId') ?? undefined;
        const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 50, 1), 200);
        const where: Record<string, unknown> = { canal };
        if (salaId) {
          const salaExists = await db.chatSala.findUnique({ where: { id: salaId } });
          if (!salaExists) return err('Sala não encontrada.', 404);
          where.salaId = salaId;
        }
        if (lastId) where.id = { gt: lastId };
        const mensagens = await db.chatMensagem.findMany({ where, orderBy: { data: 'asc' }, take: limit });
        return json(mensagens);
      }

      case 'listSalas': {
        const salas = await db.chatSala.findMany({
          orderBy: { dataCriacao: 'desc' },
          include: { _count: { select: { mensagens: true } } },
        });
        const salasWithCount = salas.map((sala) => ({
          id: sala.id, nome: sala.nome, criadoPor: sala.criadoPor,
          senha: sala.senha ? true : false, dataCriacao: sala.dataCriacao, totalMensagens: sala._count.mensagens,
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'sendMessage': {
        const { canal, salaId, conteudo, autor, isAdmin } = body;
        if (!canal || !isValidCanal(canal)) return err(`Canal inválido.`, 400);
        if (!conteudo || typeof conteudo !== 'string') return err('Conteúdo obrigatório.', 400);
        const trimmedConteudo = conteudo.trim();
        if (trimmedConteudo.length === 0) return err('Mensagem vazia.', 400);
        if (trimmedConteudo.length > 2000) return err('Mensagem muito longa (max 2000).', 400);
        if (!autor || typeof autor !== 'string' || autor.trim().length === 0) return err('Autor obrigatório.', 400);
        if (salaId) {
          const salaExists = await db.chatSala.findUnique({ where: { id: salaId } });
          if (!salaExists) return err('Sala não encontrada.', 404);
        }
        const mensagem = await db.chatMensagem.create({
          data: { canal, salaId: salaId || null, conteudo: trimmedConteudo, autor: autor.trim(), isAdmin: typeof isAdmin === 'boolean' ? isAdmin : false },
        });
        return json(mensagem, 201);
      }

      case 'createSala': {
        const { nome, criadoPor, senha } = body;
        if (!nome || typeof nome !== 'string' || nome.trim().length === 0) return err('Nome obrigatório.', 400);
        const trimmedNome = nome.trim();
        if (trimmedNome.length > 30) return err('Nome muito longo (max 30).', 400);
        if (!criadoPor || typeof criadoPor !== 'string' || criadoPor.trim().length === 0) return err('Criador obrigatório.', 400);
        const sala = await db.chatSala.create({
          data: { nome: trimmedNome, criadoPor: criadoPor.trim(), senha: senha && typeof senha === 'string' && senha.trim().length > 0 ? senha : null },
        });
        return json(sala, 201);
      }

      case 'deleteMensagem': {
        const { id } = body;
        if (!id || typeof id !== 'string') return err('ID obrigatório.', 400);
        if (!(await verifyChatAdmin(request, body.adminPassword))) return err('Não autorizado.', 403);
        const mensagem = await db.chatMensagem.findUnique({ where: { id } });
        if (!mensagem) return err('Mensagem não encontrada.', 404);
        await db.chatMensagem.delete({ where: { id } });
        return json({ success: true, deletedId: id });
      }

      case 'deleteSala': {
        const { id } = body;
        if (!id || typeof id !== 'string') return err('ID obrigatório.', 400);
        if (!(await verifyChatAdmin(request, body.adminPassword))) return err('Não autorizado.', 403);
        const sala = await db.chatSala.findUnique({ where: { id } });
        if (!sala) return err('Sala não encontrada.', 404);
        await db.chatSala.delete({ where: { id } });
        return json({ success: true, deletedId: id });
      }

      default:
        return err('Ação POST desconhecida.', 400);
    }
  } catch (error) {
    console.error('[POST /api/chat]', error);
    return err('Erro interno do servidor.', 500);
  }
}
