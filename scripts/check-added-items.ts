import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
async function main() {
  const added = await db.itemOverride.findMany({ where: { action: 'add' }, orderBy: { data: 'desc' }, take: 30 });
  console.log(`Total de itens adicionados (action=add): ${added.length}`);
  for (const r of added) {
    console.log(`  ${r.itemId} | ${r.name} | cat:${r.categoryId} | ${new Date(r.data).toISOString()}`);
  }
  const all = await db.itemOverride.count();
  console.log(`\nTotal geral de overrides: ${all}`);
  const byAction = await db.itemOverride.groupBy({ by: ['action'], _count: true });
  console.log('Por ação:', byAction.map(a => `${a.action}: ${a._count}`).join(', '));
}
main().catch(console.error).finally(() => db.$disconnect());
