import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Fix CaixaRegistro
  const all = await prisma.caixaRegistro.findMany({ select: { id: true, item: true } });
  const toFix = all.filter(r => r.item !== r.item.trim());
  console.log(`CaixaRegistro: Found ${toFix.length} records with whitespace in item name:`);
  for (const r of toFix) {
    console.log(`  ID: ${r.id}, Name: ${JSON.stringify(r.item)} -> ${JSON.stringify(r.item.trim())}`);
  }
  if (toFix.length > 0) {
    await Promise.all(toFix.map(r =>
      prisma.caixaRegistro.update({ where: { id: r.id }, data: { item: r.item.trim() } })
    ));
    console.log(`Fixed ${toFix.length} records.`);
  }

  // Fix Doador table too
  const allDoadores = await prisma.doador.findMany({ select: { id: true, item: true } });
  const toFixD = allDoadores.filter(r => r.item !== r.item.trim());
  console.log(`\nDoador: Found ${toFixD.length} records with whitespace:`);
  for (const r of toFixD) {
    console.log(`  ID: ${r.id}, Name: ${JSON.stringify(r.item)} -> ${JSON.stringify(r.item.trim())}`);
  }
  if (toFixD.length > 0) {
    await Promise.all(toFixD.map(r =>
      prisma.doador.update({ where: { id: r.id }, data: { item: r.item.trim() } })
    ));
    console.log(`Fixed ${toFixD.length} doador records.`);
  }

  await prisma.$disconnect();
}

main();
