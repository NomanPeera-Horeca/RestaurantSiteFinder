import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { createFeedback, getRecentFeedback } from "../db";

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS \`feedback\` (
    \`id\` int AUTO_INCREMENT NOT NULL,
    \`category\` enum('bug_report','feature_request','report_is_wrong','missing_my_city','other') NOT NULL,
    \`message\` text NOT NULL,
    \`email\` varchar(320),
    \`page\` varchar(512),
    \`createdAt\` timestamp NOT NULL DEFAULT (now()),
    CONSTRAINT \`feedback_id\` PRIMARY KEY(\`id\`)
  )
`;

let tableEnsured = false;

async function ensureTable() {
  if (tableEnsured) return;
  try {
    if (!process.env.DATABASE_URL) return;
    const mysql = await import("mysql2/promise");
    const conn = await mysql.createConnection(process.env.DATABASE_URL);
    await conn.execute(CREATE_TABLE_SQL);
    await conn.end();
    tableEnsured = true;
    console.log("[feedback] table ready");
  } catch (err) {
    console.warn("[feedback] table ensure failed:", err);
  }
}

// Ensure table on module load
ensureTable();

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
      await ensureTable();
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
      await ensureTable();
      const since = new Date(Date.now() - input.sinceDays * 24 * 60 * 60 * 1000);
      return getRecentFeedback(since);
    }),
});
