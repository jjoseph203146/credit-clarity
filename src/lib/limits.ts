// Hard ceilings on anything that reaches a billed Claude call or grows
// without bound in the database.
//
// The threat is not only malice. A credit report PDF with an unusual layout
// can make the regex parser in src/lib/parsing/* match hundreds of spurious
// "accounts", and every one of them is then serialized into the analysis
// prompt. One strange PDF becoming a very expensive request is a realistic
// accident, not just an attack.
//
// Raw PDF text is deliberately never sent to Claude — only the structured
// fields below — so these caps are what actually bound prompt size.

/** Rows kept per report. Beyond this, extra matches are dropped. */
export const MAX_ACCOUNTS = 100;
export const MAX_COLLECTIONS = 50;
export const MAX_INQUIRIES = 100;

/**
 * Longest single parsed string (account name, creditor, payment history)
 * stored or sent to the model. Real values are far shorter; a long one means
 * the regex swallowed a page of text.
 */
export const MAX_FIELD_CHARS = 300;

/**
 * Ceiling on the serialized report JSON in the analysis prompt. Reached only
 * if the per-row caps above somehow aren't enough; treated as a hard failure
 * rather than silently truncating into invalid JSON.
 */
export const MAX_PROMPT_CHARS = 200_000;

/** Longest chat message accepted from a user. */
export const MAX_CHAT_MESSAGE_CHARS = 2_000;

/**
 * Prior turns replayed into a chat request. History is resent on every
 * message, so without this the cost of a conversation grows quadratically.
 */
export const MAX_CHAT_HISTORY_TURNS = 20;

/** Chat messages allowed per user per window. */
export const CHAT_RATE_LIMIT = 20;
export const CHAT_RATE_WINDOW_MS = 10 * 60 * 1000;

/**
 * Truncates an over-long parsed string, marking it so a truncated value is
 * never mistaken for the real one. Passes through null/undefined unchanged —
 * the parser uses null to mean "not confidently found", which must survive.
 */
export function clampField<T extends string | null | undefined>(value: T): T {
  if (typeof value !== "string" || value.length <= MAX_FIELD_CHARS) return value;
  return `${value.slice(0, MAX_FIELD_CHARS)}…[truncated]` as T;
}

/**
 * Caps a parsed row list, returning what was kept and how many were dropped
 * so the caller can log the loss rather than silently discarding data.
 */
export function clampRows<T>(rows: T[], max: number): { kept: T[]; dropped: number } {
  if (rows.length <= max) return { kept: rows, dropped: 0 };
  return { kept: rows.slice(0, max), dropped: rows.length - max };
}
