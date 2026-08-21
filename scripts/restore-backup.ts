import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const DATABASE_URL = 'postgresql://neondb_owner:npg_emS5JCcNK7tW@ep-soft-mouse-acta9yhb-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require';

// Create Prisma client with direct connection
const prisma = new PrismaClient({
  datasources: { db: { url: DATABASE_URL } },
});

async function main() {
  const backup = JSON.parse(fs.readFileSync('/home/z/my-project/upload/backup-dayr-2026-08-09T03-09-50-827Z.json', 'utf-8'));
  const d = backup.data;

  console.log('Starting restore...');

  // 1. Investidores
  if (d.investidores?.length) {
    console.log(`Restoring ${d.investidores.length} investidores...`);
    await prisma.investidor.createMany({ data: d.investidores, skipDuplicates: true });
  }

  // 2. TabelasTroca
  if (d.tabelasTroca?.length) {
    console.log(`Restoring ${d.tabelasTroca.length} tabelasTroca...`);
    await prisma.tabelaTroca.createMany({ data: d.tabelasTroca, skipDuplicates: true });
  }

  // 3. Trocas
  if (d.trocas?.length) {
    console.log(`Restoring ${d.trocas.length} trocas...`);
    await prisma.trocaRegistro.createMany({ data: d.trocas, skipDuplicates: true });
  }

  // 4. ComprasVendas
  if (d.comprasVendas?.length) {
    console.log(`Restoring ${d.comprasVendas.length} comprasVendas...`);
    await prisma.compraVenda.createMany({ data: d.comprasVendas, skipDuplicates: true });
  }

  // 5. Caixa
  if (d.caixa?.length) {
    console.log(`Restoring ${d.caixa.length} caixa registros...`);
    await prisma.caixaRegistro.createMany({ data: d.caixa, skipDuplicates: true });
  }

  // 6. Doadores
  if (d.doadores?.length) {
    console.log(`Restoring ${d.doadores.length} doadores...`);
    await prisma.doador.createMany({ data: d.doadores, skipDuplicates: true });
  }

  // 7. PriceReports
  if (d.priceReports?.length) {
    console.log(`Restoring ${d.priceReports.length} priceReports...`);
    await prisma.priceReport.createMany({ data: d.priceReports, skipDuplicates: true });
  }

  // 8. ChatMensagens (need salaId handling - orphans ok since ChatSala doesn't exist)
  if (d.chatMensagens?.length) {
    console.log(`Restoring ${d.chatMensagens.length} chatMensagens...`);
    // Clear salaId if the sala doesn't exist to avoid FK errors
    const msgs = d.chatMensagens.map((m: any) => ({
      id: m.id,
      canal: m.canal || 'geral',
      autor: m.autor,
      conteudo: m.conteudo,
      data: m.data,
      isAdmin: m.isAdmin || false,
      salaId: null, // No salas in backup, set to null
    }));
    await prisma.chatMensagem.createMany({ data: msgs, skipDuplicates: true });
  }

  console.log('Restore complete!');

  // Verify
  const counts = {
    investidores: await prisma.investidor.count(),
    tabelasTroca: await prisma.tabelaTroca.count(),
    trocas: await prisma.trocaRegistro.count(),
    comprasVendas: await prisma.compraVenda.count(),
    caixa: await prisma.caixaRegistro.count(),
    doadores: await prisma.doador.count(),
    priceReports: await prisma.priceReport.count(),
    chatMensagens: await prisma.chatMensagem.count(),
  };
  console.log('Verification:', JSON.stringify(counts, null, 2));
}

main()
  .catch((e) => { console.error('ERROR:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
