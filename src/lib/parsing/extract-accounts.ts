import type { AccountStatus, AccountType } from "@/lib/supabase/types";

// Heuristic tradeline (account) extraction.
//
// KNOWN LIMITATION: credit bureau PDFs do not share one layout, and
// `pdf-parse` flattens multi-column tables into a single text stream with
// whitespace/column alignment that no longer reflects the visual layout.
// There is no general parser for this without OCR + layout analysis. This
// module implements a *heuristic* block-scanner that works on the common
// pattern of "creditor name, followed a few lines later by a cluster of
// labeled fields (Account Type / Balance / Credit Limit / Opened Date /
// Payment Status)". It will:
//   - catch most accounts on reports that follow this label:value pattern
//     (which covers a large share of real Experian/Equifax/TransUnion
//     consumer-disclosure layouts, and all three major bureaus' typical
//     text exports)
//   - MISS accounts on reports with unusual layouts, heavily tabular PDFs
//     where pdf-parse interleaves columns, or scanned/image-only PDFs
//     (no extractable text at all)
//   - leave any field it can't confidently find as `null` rather than
//     fabricate a value
//
// This is expected to be approximate. A human/AI review step downstream
// (BUILD.md step 5, the Claude analysis pass) can still work from the raw
// free text even when a given account isn't fully structured here.

export type ExtractedAccount = {
  name: string;
  type: AccountType | null;
  status: AccountStatus;
  balance: number | null;
  credit_limit: number | null;
  utilization: number | null;
  payment_history: string | null;
  opened_date: string | null; // ISO yyyy-mm-dd when confidently found
};

const ACCOUNT_TYPE_MAP: Array<[RegExp, AccountType]> = [
  [/retail|store\s*card/i, "retail_card"],
  [/credit\s*card|revolving/i, "credit_card"],
  [/auto|vehicle/i, "auto_loan"],
  [/student/i, "student_loan"],
  [/mortgage|real\s*estate/i, "mortgage"],
  [/collection|charge[d\s-]*off/i, "collection"],
];

const MONTH_YEAR = /(\d{1,2})[\/\-](\d{4})/; // 03/2019
const FULL_DATE = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/; // 03/15/2019

function toIsoDate(raw: string): string | null {
  const full = raw.match(FULL_DATE);
  if (full) {
    const [, m, d, y] = full;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const monthYear = raw.match(MONTH_YEAR);
  if (monthYear) {
    const [, m, y] = monthYear;
    return `${y}-${m.padStart(2, "0")}-01`;
  }
  return null;
}

function toAmount(raw: string): number | null {
  const match = raw.match(/\$?\s*([\d,]+(?:\.\d{1,2})?)/);
  if (!match) return null;
  const value = Number(match[1].replace(/,/g, ""));
  return Number.isFinite(value) ? value : null;
}

function mapAccountType(raw: string): AccountType | null {
  for (const [pattern, type] of ACCOUNT_TYPE_MAP) {
    if (pattern.test(raw)) return type;
  }
  return null;
}

function isPlausibleName(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length < 3 || trimmed.length > 60) return false;
  // Reject label:value lines and pure-number/date lines.
  if (/:/.test(trimmed)) return false;
  if (/^\$?[\d,.\s\/-]+$/.test(trimmed)) return false;
  return true;
}

/**
 * Scans raw PDF text for "Account Type:" anchor lines, then looks
 * backward for a plausible creditor name and forward for a small cluster
 * of related labeled fields.
 */
export function extractAccounts(rawText: string): ExtractedAccount[] {
  const lines = rawText.split(/\r?\n/);
  const accounts: ExtractedAccount[] = [];
  const seenNameAtLine = new Set<number>();

  for (let i = 0; i < lines.length; i++) {
    if (!/account\s*type\s*:/i.test(lines[i])) continue;

    // Look backward up to 5 lines for a plausible creditor name.
    let name: string | null = null;
    let nameLine = -1;
    for (let j = i - 1; j >= Math.max(0, i - 5); j--) {
      if (isPlausibleName(lines[j])) {
        name = lines[j].trim();
        nameLine = j;
        break;
      }
    }
    if (!name || seenNameAtLine.has(nameLine)) continue;
    seenNameAtLine.add(nameLine);

    // Scan forward a window of lines for related fields, stopping early if
    // we hit what looks like the start of the next account block.
    const windowEnd = Math.min(lines.length, i + 15);
    const windowLines = lines.slice(i, windowEnd);
    const window = windowLines.join("\n");

    const typeMatch = window.match(/account\s*type\s*:\s*([^\n]+)/i);
    const type = typeMatch ? mapAccountType(typeMatch[1]) : null;

    const statusMatch = window.match(
      /account\s*status\s*:\s*([^\n]+)|payment\s*status\s*:\s*([^\n]+)/i,
    );
    const statusText = statusMatch ? statusMatch[1] ?? statusMatch[2] : "";
    const status: AccountStatus = /closed|paid|charge[d\s-]*off/i.test(
      statusText,
    )
      ? "closed"
      : "open";

    const balanceMatch = window.match(/balance\s*:\s*([^\n]+)/i);
    const balance = balanceMatch ? toAmount(balanceMatch[1]) : null;

    const limitMatch = window.match(/credit\s*limit\s*:\s*([^\n]+)/i);
    const creditLimit = limitMatch ? toAmount(limitMatch[1]) : null;

    const utilization =
      balance != null && creditLimit != null && creditLimit > 0
        ? Math.round((balance / creditLimit) * 1000) / 10
        : null;

    const openedMatch = window.match(
      /opened\s*(?:date)?\s*:\s*([^\n]+)/i,
    );
    const openedDate = openedMatch ? toIsoDate(openedMatch[1]) : null;

    const historyMatch = window.match(/payment\s*history\s*:\s*([^\n]+)/i);
    const paymentHistory = historyMatch ? historyMatch[1].trim() : null;

    accounts.push({
      name,
      type,
      status,
      balance,
      credit_limit: creditLimit,
      utilization,
      payment_history: paymentHistory,
      opened_date: openedDate,
    });
  }

  return accounts;
}
