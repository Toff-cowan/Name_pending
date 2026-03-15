import { z } from 'zod';
import { publicProcedure, router } from '@Name_Pending/api';
import { generateTradeRecommendation } from './service';

export const chatRouter = router({
  message: publicProcedure
    .input(
      z.object({
        message: z.string().min(1).max(1000),
        symbol: z.string().default('AAPL'),
      }).transform(data => ({
        ...data,
        symbol: data.symbol.toUpperCase(),
      }))
    )
    .mutation(async ({ input }) => {
      try {
        const response = await generateTradeRecommendation(
          input.message,
          input.symbol
        );

        return {
          success: true,
          response,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
      }
    }),
});
