import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

export async function POST(req: NextRequest) {
  const adminPwd = req.headers.get("x-admin-password");
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "dayr2024";
  if (!adminPwd || adminPwd !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  try {
    // 1. Buscar todas as tabelas do banco
    const results = await Promise.all([
      db.emprestimo.findMany().catch(() => [] as never[]),
      db.investidor.findMany().catch(() => [] as never[]),
      db.tabelaTroca.findMany().catch(() => [] as never[]),
      db.trocaRegistro.findMany().catch(() => [] as never[]),
      db.compraVenda.findMany().catch(() => [] as never[]),
      db.caixaRegistro.findMany().catch(() => [] as never[]),
      db.doador.findMany().catch(() => [] as never[]),
      db.leilao.findMany().catch(() => [] as never[]),
      db.lance.findMany().catch(() => [] as never[]),
      db.sorteio.findMany().catch(() => [] as never[]),
      db.participanteSorteio.findMany().catch(() => [] as never[]),
      db.loterica.findMany().catch(() => [] as never[]),
      db.numeroLoterica.findMany().catch(() => [] as never[]),
      db.priceReport.findMany().catch(() => [] as never[]),
      db.itemOverride.findMany().catch(() => [] as never[]),
      db.propaganda.findMany().catch(() => [] as never[]),
      db.chatSala.findMany().catch(() => [] as never[]),
      db.chatMensagem.findMany().catch(() => [] as never[]),
      db.itemCatalogo.findMany().catch(() => [] as never[]),
      db.moderador.findMany().catch(() => [] as never[]),
    ]);

    const [
      emprestimos, investidores, tabelasTroca, trocas, comprasVendas, caixa, doadores,
      leiloes, lances, sorteios, participantes, lotericas, numeros,
      priceReports, itemOverrides, propagandas, chatSalas, chatMensagens, itemCatalogo, moderadores,
    ] = results;

    const dbBackup = {
      version: 2, type: "completo", exportDate: new Date().toISOString(),
      emprestimos, investidores, tabelasTroca, trocas, comprasVendas, caixa, doadores,
      leiloes, lances, sorteios, participantes, lotericas, numeros,
      priceReports, itemOverrides, propagandas, chatSalas, chatMensagens, itemCatalogo, moderadores,
    };

    // 2. Baixar codigo fonte do GitHub
    const ghRes = await fetch(
      "https://api.github.com/repos/MPBRGAMER/meu-site-banco/zipball/main",
      { headers: { "User-Agent": "posto-de-trocas-backup" } }
    );
    if (!ghRes.ok) throw new Error("Erro ao baixar codigo do GitHub");
    const ghBuffer = await ghRes.arrayBuffer();

    // 3. Abrir o ZIP do GitHub e adicionar o banco + instrucoes
    const zip = await JSZip.loadAsync(ghBuffer);

    // Adicionar backup do banco na raiz
    zip.file("database-backup.json", JSON.stringify(dbBackup, null, 2));

    // Adicionar instrucoes de restauracao
    const readme = `=== BACKUP COMPLETO - POSTO DE TROCAS ===
Data: ${new Date().toISOString()}

=== COMO RESTAURAR EM OUTRA HOSPEDAGEM ===

1. Descompacte este arquivo ZIP
2. A pasta do codigo fonte tera um nome como MPBRGAMER-meu-site-banco-XXXXXXX
3. Abra um terminal nessa pasta
4. Crie o arquivo .env com:
   DATABASE_URL=sua_url_do_banco_postgres
   ADMIN_PASSWORD=sua_senha_admin
5. Instale as dependencias:
   npm install
6. Gere o Prisma client:
   npx prisma generate
7. Crie as tabelas no banco:
   npx prisma db push
8. Restaure os dados do banco:
   Use o botao "Restaurar" no painel admin do site,
   selecionando o arquivo database-backup.json que esta na raiz deste ZIP
9. Execute o site:
   npm run build && npm start

Ou se for usar Vercel:
   Apos os passos 1-6, faca deploy no Vercel
   e configure as variaveis de ambiente no painel.

=== ESTRUTURA DO ZIP ===
- database-backup.json: Todos os dados do banco (20 tabelas)
- MPBRGAMER-meu-site-banco-xxx/: Codigo fonte completo do site
`;
    zip.file("LEIA-ME-RESTAURACAO.txt", readme);

    // 4. Gerar ZIP final
    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    const filename = `backup-site-completo-${new Date().toISOString().slice(0, 10)}.zip`;
    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(zipBuffer.length),
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro ao gerar backup completo";
    return NextResponse.json({ error: msg }, { status: 500 });
  } finally {
    await db.$disconnect().catch(() => {});
  }
}
