import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import {
  getAllItemPrices,
  getItemPrice,
  updateItemPrice,
  addPriceReport,
  getPriceReportsForItem,
  getContributorStats,
} from "./db";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  prices: router({
    /**
     * Obter todos os preços de itens
     */
    getAll: publicProcedure.query(async () => {
      return getAllItemPrices();
    }),

    /**
     * Obter preço de um item específico
     */
    getById: publicProcedure
      .input(z.object({ itemId: z.string() }))
      .query(async ({ input }) => {
        return getItemPrice(input.itemId);
      }),

    /**
     * Atualizar preço de um item
     */
    update: publicProcedure
      .input(
        z.object({
          itemId: z.string(),
          steelPrice: z.number().int().positive(),
          cementPrice: z.number().int().positive(),
        })
      )
      .mutation(async ({ input }) => {
        await updateItemPrice(input.itemId, input.steelPrice, input.cementPrice);
        return { success: true };
      }),

    /**
     * Reportar preço de um item
     */
    report: publicProcedure
      .input(
        z.object({
          itemId: z.string(),
          playerNickname: z.string().min(1).max(64),
          steelPrice: z.number().int().positive(),
          cementPrice: z.number().int().positive(),
        })
      )
      .mutation(async ({ input }) => {
        await addPriceReport(
          input.itemId,
          input.playerNickname,
          input.steelPrice,
          input.cementPrice
        );
        return { success: true };
      }),

    /**
     * Obter reportes de preço de um item
     */
    getReports: publicProcedure
      .input(z.object({ itemId: z.string() }))
      .query(async ({ input }) => {
        return getPriceReportsForItem(input.itemId);
      }),

    /**
     * Obter estatísticas de contribuidores
     */
    getContributors: publicProcedure.query(async () => {
      return getContributorStats();
    }),
  }),
});

export type AppRouter = typeof appRouter;
