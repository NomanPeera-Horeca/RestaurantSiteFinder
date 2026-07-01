import { TRPCClientError } from "@trpc/client";

type ZodIssue = {
  path?: (string | number)[];
  message?: string;
};

const DEFAULT_MESSAGE = "Something went wrong. Please try again.";

const FIELD_MESSAGES: Record<string, string> = {
  email: "Please enter a valid email address",
  phone: "Please enter a valid phone number",
};

function isJsonLike(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.startsWith("[") || trimmed.startsWith("{");
}

function extractZodIssues(raw: string): ZodIssue[] | null {
  try {
    const parsed: unknown = JSON.parse(raw.trim());
    if (Array.isArray(parsed)) {
      return parsed as ZodIssue[];
    }
    if (
      parsed &&
      typeof parsed === "object" &&
      "issues" in parsed &&
      Array.isArray((parsed as { issues: unknown }).issues)
    ) {
      return (parsed as { issues: ZodIssue[] }).issues;
    }
  } catch {
    /* not JSON */
  }
  return null;
}

function issueToMessage(issue: ZodIssue): string {
  const field = issue.path?.[0];
  if (typeof field === "string" && field in FIELD_MESSAGES) {
    return FIELD_MESSAGES[field];
  }

  const text = issue.message ?? "";
  if (text.toLowerCase().includes("email")) {
    return FIELD_MESSAGES.email;
  }
  if (text.toLowerCase().includes("phone") || text.toLowerCase().includes("too small")) {
    return FIELD_MESSAGES.phone;
  }

  if (text && !isJsonLike(text)) {
    return text;
  }

  return DEFAULT_MESSAGE;
}

function fieldErrorsFromTrpcData(error: TRPCClientError<unknown>): string | null {
  const data = error.data as {
    zodError?: {
      fieldErrors?: Record<string, string[] | undefined>;
      formErrors?: string[];
    };
  } | null;

  const fieldErrors = data?.zodError?.fieldErrors;
  if (fieldErrors) {
    if (fieldErrors.phone?.[0]) return FIELD_MESSAGES.phone;
    if (fieldErrors.email?.[0]) return FIELD_MESSAGES.email;
  }

  const formError = data?.zodError?.formErrors?.[0];
  if (formError && !isJsonLike(formError)) {
    return formError;
  }

  return null;
}

/** Never surfaces raw JSON Zod/tRPC validation payloads to end users. */
export function formatTrpcErrorMessage(
  error: unknown,
  fallback = DEFAULT_MESSAGE,
): string {
  if (error instanceof TRPCClientError) {
    if (error.message.includes("Database")) {
      return "We couldn't save your contact info, but you can still view your report. Please try again.";
    }

    const fromData = fieldErrorsFromTrpcData(error);
    if (fromData) return fromData;

    const issues = extractZodIssues(error.message);
    if (issues?.length) {
      return issueToMessage(issues[0]);
    }

    if (error.message && !isJsonLike(error.message)) {
      return error.message;
    }

    return fallback;
  }

  if (error instanceof Error) {
    if (error.message.includes("Database")) {
      return "We couldn't save your contact info, but you can still view your report. Please try again.";
    }

    const issues = extractZodIssues(error.message);
    if (issues?.length) {
      return issueToMessage(issues[0]);
    }

    if (error.message && !isJsonLike(error.message)) {
      return error.message;
    }
  }

  return fallback;
}

/** Map server validation issues to inline form field errors when possible. */
export function trpcFieldErrors(
  error: unknown,
): Partial<Record<"email" | "phone", string>> {
  const out: Partial<Record<"email" | "phone", string>> = {};

  const applyIssue = (issue: ZodIssue) => {
    const field = issue.path?.[0];
    if (field === "email") out.email = FIELD_MESSAGES.email;
    if (field === "phone") out.phone = FIELD_MESSAGES.phone;
  };

  if (error instanceof TRPCClientError) {
    const data = error.data as {
      zodError?: { fieldErrors?: Record<string, string[] | undefined> };
    } | null;

    if (data?.zodError?.fieldErrors?.email) {
      out.email = FIELD_MESSAGES.email;
    }
    if (data?.zodError?.fieldErrors?.phone) {
      out.phone = FIELD_MESSAGES.phone;
    }

    const issues = extractZodIssues(error.message);
    issues?.forEach(applyIssue);
  } else if (error instanceof Error) {
    const issues = extractZodIssues(error.message);
    issues?.forEach(applyIssue);
  }

  return out;
}
