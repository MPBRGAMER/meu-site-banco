import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const tables = ["Emprestimo","Investidor","TabelaTroca","TrocaRegistro","CompraVenda","CaixaRegistro","Doador","Leilao","LanceLeilao","Sorteio","ParticipanteSorteio","Loterica","BilheteLoterica","ResultadoLoterica","MensagemChat","SalaChat","PriceReport"];
    for (const t of tables) {
      await db.$executeRawUnsafe(`TRUNCATE TABLE "${t}" RESTART IDENTITY CASCADE;`);
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Erro" }, { status: 500 });
  }
}
