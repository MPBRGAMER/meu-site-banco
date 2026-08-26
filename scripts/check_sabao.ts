import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.caixaRegistro.findMany({
    where: {
      OR: [
        { item: { contains: 'sab', mode: 'insensitive' } },
        { item: { contains: 'Sab', mode: 'insensitive' } },
        { item: { contains: 'SAB', mode: 'insensitive' } },
      ],
    },
    select: { item: true, tipo: true, quantidade: true, descricao: true },
  });

  // Group by exact item name
  const grouped = new Map<string, typeof rows>();
  for (const r of rows) {
    const key = r.item;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(r);
  }

  console.log(`Found ${grouped.size} distinct item name(s):`);
  for (const [name, records] of grouped) {
    const saldo = records.reduce((acc, r) => r.tipo === 'entrada' ? acc + r.quantidade : acc - r.quantidade, 0);
    console.log('---');
    console.log('Name:', JSON.stringify(name));
    console.log('Length:', name.length);
    console.log('Hex bytes:', Buffer.from(name).toString('hex'));
    console.log('Saldo:', saldo);
    console.log('Records:', records.length);
    for (const r of records) {
      console.log(`  ${r.tipo} ${r.quantidade} - ${r.descricao}`);
    }
  }

  if (grouped.size === 0) {
    console.log('No matches found. Listing ALL items for reference:');
    const allItems = await prisma.caixaRegistro.findMany({
      select: { item: true },
      distinct: ['item'],
    });
    for (const r of allItems) {
      console.log(JSON.stringify(r.item));
    }
  }

  await prisma.$disconnect();
}

main();
