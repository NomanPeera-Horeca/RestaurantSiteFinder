import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { db } from "../db";
import { feedback } from "../../drizzle/schema";
import { desc } from "drizzle-orm";

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
      await db.insert(feedback).values({
        category: input.category,
        message: input.message,
        email: input.email ?? null,
        page: input.page ?? null,
      });
      return { success: true };
    }),

  list: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(50) }))
    .query(async ({ input }) => {
      const rows = await db
        .select()
        .from(feedback)
        .orderBy(desc(feedback.createdAt))
        .limit(input.limit);
      return rows;
    }),
});
