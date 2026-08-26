import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { PrismaClient } from "@prisma/client";
import { readdir, readFile } from "fs";
import { join } from "path";

const db = new PrismaClient();

function getAllTables() {
  return Promise.all([
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
}

async function addDirToZip(
  zip: JSZip, 
  dirPath: string, 
  zipPrefix: string, 
  maxFiles: number
): Promise<number> {
  let count = 0;
  const entries = await readdir(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (count >= maxFiles) break;
    const fullPath = join(dirPath, entry.name);
    if (entry.name === "node_modules" || entry.name === ".next" || entry.name === ".git") continue;
    if (entry.isDirectory()) {
      count += await addDirToZip(zip, fullPath, zipPrefix + entry.name + "/", maxFiles - count);
    } else {
      try {
        const data = await readFile(fullPath);
        zip.file(zipPrefix + entry.name, data);
        count++;
      } catch { /* skip unreadable files */ }
    }
  }
  return count;
}

export async function POST(req: NextRequest) {
  const adminPwd = req.headers.get("x-admin-password");
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "dayr2024";
  if (!adminPwd || adminPwd !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  try {
    const [results] = await Promise.all([getAllTables()]);
    const [
      emprestimos, investidores, tabelasTroca, trocas, comprasVendas, caixa, doadores,
      leiloes, lances, sorteios, participantes, lotericas, numeros,
      priceReports, itemOverrides, propagandas, chatSalas, chatMensagens, itemCatalogo, moderadores,
    ] = results;

    const dbBackup = {
      version: 2,
      type: "completo",
      exportDate: new Date().toISOString(),
      emprestimos, investidores, tabelasTroca, trocas, comprasVendas, caixa, doadores,
      leiloes, lances, sorteios, participantes, lotericas, numeros,
      priceReports, itemOverrides, propagandas, chatSalas, chatMensagens, itemCatalogo, moderadores,
    };

    const zip = new JSZip();

    // 1. Database backup
    zip.file("database-backup.json", JSON.stringify(dbBackup, null, 2));

    // 2. Source code
    const rootDir = process.cwd();
    await addDirToZip(zip, join(rootDir, "src"), "src/", 2000);
    await addDirToZip(zip, join(rootDir, "public"), "public/", 500);

    // 3. Config files
    const configFiles = [
      "package.json", "next.config.ts", "next.config.mjs", "tsconfig.json",
      "tailwind.config.ts", "postcss.config.mjs", "middleware.ts", ".env.example",
    ];
    for (const f of configFiles) {
      try {
        const data = await readFile(join(rootDir, f));
        zip.file(f, data);
      } catch { /* file may not exist */ }
    }

    // 4. Prisma schema
    try {
      const prismaDir = join(rootDir, "prisma");
      await addDirToZip(zip, prismaDir, "prisma/", 100);
    } catch {}

    // 5. Restore instructions
    const readme = `=== BACKUP COMPLETO - POSTO DE TROCAS ===
Data: ${new Date().toISOString()}

=== COMO RESTAURAR EM OUTRA HOSPEDAGEM ===

1. Descompacte este arquivo ZIP
2. Abra um terminal na pasta descompactada
3. Crie o arquivo .env com:
   DATABASE_URL=sua_url_do_banco_postgres
   ADMIN_PASSWORD=sua_senha_admin
4. Instale as dependencias:
   npm install
5. Gere o Prisma client:
   npx prisma generate
6. Crie as tabelas no banco:
   npx prisma db push
7. Restaure os dados do banco:
   Use a funcao "Restaurar" no painel admin do site,
   selecionando o arquivo database-backup.json
8. Execute o site:
   npm run build && npm start

Ou se for usar Vercel:
   Apos os passos 1-6, faca deploy no Vercel
   e configure as variaveis de ambiente no painel.

=== ESTRUTURA DO ZIP ===
- database-backup.json: Todos os dados do banco
- src/: Codigo fonte do site
- public/: Arquivos estaticos
- prisma/: Schema do banco de dados
- package.json + configs: Configuracoes do projeto
`;
    zip.file("LEIA-ME-RESTAURACAO.txt", readme);

    // Generate ZIP
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
