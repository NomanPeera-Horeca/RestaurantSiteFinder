/** Internal admin emails with unlimited report generation for testing. */
export const ADMIN_EMAILS = ["nomanpeera@gmail.com"] as const;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = normalizeEmail(email);
  return (ADMIN_EMAILS as readonly string[]).includes(normalized);
}
