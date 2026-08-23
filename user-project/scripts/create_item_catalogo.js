const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  await p.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ItemCatalogo" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "nome" TEXT NOT NULL,
      "arquivo" TEXT NOT NULL,
      "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "ItemCatalogo_nome_key" UNIQUE("nome")
    );
  `);
  console.log('Tabela ItemCatalogo criada com sucesso!');
  await p.$disconnect();
}

main().catch((e) => {
  console.error('Erro:', e.message);
  p.$disconnect();
  process.exit(1);
});
