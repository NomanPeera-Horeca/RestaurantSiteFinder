import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { createFeedback, getRecentFeedback } from "../db";

export const feedbackRouter = router({
  submit: publicProcedure
    .input(
      z.object({
        category: z.enum(["bug_report", "feature_request", "report_is_wrong", "missing_my_city", "other"]),
        message: z.string().min(1).max(2000),
        email: z.string().email().optional(),
        page: z.string().max(512).optional(),
      })
    )
    .mutation(async ({ input }) => {
      await createFeedback({
        category: input.category,
        message: input.message,
        email: input.email ?? null,
        page: input.page ?? null,
      });
      return { success: true };
    }),

  list: publicProcedure
    .input(z.object({ sinceDays: z.number().min(1).max(90).default(7) }))
    .query(async ({ input }) => {
      const since = new Date(Date.now() - input.sinceDays * 24 * 60 * 60 * 1000);
      return getRecentFeedback(since);
    }),
});
