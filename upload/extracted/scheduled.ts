/**
 * Scheduled handlers for auto-finalizing sorteios and lotérica
 * These run every minute via Heartbeat cron
 */
import type { Request, Response } from "express";
import { sdk } from "./_core/sdk";
import { dbHelpers } from "./db";

/**
 * Auto-finalize sorteios that have expired.
 * Picks a random participant as winner and updates the sorteio status.
 */
export async function autoFinalizarSorteios(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron) {
      return res.status(403).json({ error: "cron-only" });
    }

    const allSorteios = await dbHelpers.getSorteios();
    const now = new Date();
    let finalized = 0;

    for (const sorteio of allSorteios) {
      if (sorteio.status !== "ativo") continue;
      if (!sorteio.dataFim) continue;

      const dataFim = new Date(sorteio.dataFim);
      if (dataFim > now) continue; // Not expired yet

      // Get participants
      const participantes = await dbHelpers.getParticipantes(sorteio.id);

      if (participantes.length === 0) {
        // No participants, just mark as finished with no winner
        await dbHelpers.updateSorteio(sorteio.id, {
          status: "finalizado",
          ganhador: null,
          dataFim: now,
        });
        finalized++;
        continue;
      }

      // Pick random winner
      const randomIndex = Math.floor(Math.random() * participantes.length);
      const ganhador = participantes[randomIndex];

      await dbHelpers.updateSorteio(sorteio.id, {
        status: "finalizado",
        ganhador: ganhador.jogador,
        dataFim: now,
      });
      finalized++;
    }

    res.json({ ok: true, finalized });
  } catch (error) {
    const err = error as Error;
    console.error("[Scheduled] autoFinalizarSorteios error:", err.message);
    res.status(500).json({
      error: err.message,
      stack: err.stack,
      context: { url: req.url },
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Auto-start lotérica sorteio when timer expires.
 * Draws a random number 1-1000, checks if it was sold.
 * If not sold, prize accumulates (no payout).
 */
export async function autoSortearLoterica(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron) {
      return res.status(403).json({ error: "cron-only" });
    }

    const lotericaList = await dbHelpers.getLoterica();
    const loterica = lotericaList[0];

    if (!loterica) {
      return res.json({ ok: true, skipped: "no active loterica" });
    }

    if (loterica.status !== "vendas_abertas") {
      return res.json({ ok: true, skipped: "not in vendas_abertas" });
    }

    if (!loterica.dataFimVendas) {
      return res.json({ ok: true, skipped: "no dataFimVendas" });
    }

    const dataFimVendas = new Date(loterica.dataFimVendas);
    if (dataFimVendas > new Date()) {
      return res.json({ ok: true, skipped: "timer not expired" });
    }

    const numeros = await dbHelpers.getNumerosLoterica(loterica.id);
    const numerosVendidos = numeros.filter((n: any) => n.comprador);

    if (numerosVendidos.length === 0) {
      // No numbers sold, just mark as done
      await dbHelpers.updateLoterica(loterica.id, {
        status: "sorteio_realizado",
        dataSorteio: new Date(),
      });
      return res.json({ ok: true, sorteado: true, noWinner: true });
    }

    // Draw random number 1-1000
    const numeroSorteadoAleatorio = Math.floor(Math.random() * 1000) + 1;

    // Check if the drawn number was sold
    const ganhador = numeros.find(n => n.numero === numeroSorteadoAleatorio && n.comprador);

    await dbHelpers.updateLoterica(loterica.id, {
      status: "sorteio_realizado",
      numeroSorteado: numeroSorteadoAleatorio,
      ganhador: ganhador ? ganhador.comprador : null,
      dataSorteio: new Date(),
    });

    // If the drawn number was sold, pay out the prize
    if (ganhador && (loterica.valorPremio || 0) > 0) {
      await dbHelpers.addCaixa({
        id: generateId(),
        tipo: "saida",
        descricao: `Prêmio Lotérica - Número ${String(numeroSorteadoAleatorio).padStart(3, '0')} (${ganhador.comprador})`,
        item: loterica.moedaAceita,
        quantidade: 1,
        valor: loterica.valorPremio,
        origem: "loterica",
      });
    }

    res.json({
      ok: true,
      sorteado: true,
      numero: numeroSorteadoAleatorio,
      ganhador: ganhador ? ganhador.comprador : null,
    });
  } catch (error) {
    const err = error as Error;
    console.error("[Scheduled] autoSortearLoterica error:", err.message);
    res.status(500).json({
      error: err.message,
      stack: err.stack,
      context: { url: req.url },
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Generate a simple ID (nanoid-compatible)
 */
function generateId(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(21)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 21);
}
