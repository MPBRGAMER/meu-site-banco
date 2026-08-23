import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const tables = [
      "Emprestimo", "Investidor", "TabelaTroca", "TrocaRegistro",
      "CompraVenda", "CaixaRegistro", "Doador",
      "Leilao", "Lance", "Sorteio", "ParticipanteSorteio",
      "Loterica", "NumeroLoterica", "PriceReport",
      "ItemOverride", "ChatMensagem", "ChatSala", "Propaganda",
    ];
    for (const t of tables) {
      await db.$executeRawUnsafe(`TRUNCATE TABLE "${t}" RESTART IDENTITY CASCADE;`);
    }
    return NextResponse.json({ success: true, message: "Banco resetado!" });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Erro" }, { status: 500 });
  }
}
