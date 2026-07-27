// Heuristic collections extraction.
//
// Same caveats as extract-accounts.ts: no standardized layout, pdf-parse
// flattens columns, this is a best-effort regex scan. We anchor on
// "Original Creditor:" / "Collection Agency:" labels (or a nearby
// "Collection"/"Charged Off" keyword) and pull whatever adjacent labeled
// fields we can confidently find. Anything not found is left `null`.
export type ExtractedCollection = {
  original_creditor: string | null;
  agency_name: string | null;
  amount: number | null;
  opened_date: string | null;
  first_delinquency_date: string | null;
  falls_off_date: string | null;
};

const MONTH_YEAR = /(\d{1,2})[\/\-](\d{4})/;
const FULL_DATE = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/;

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

export function extractCollections(rawText: string): ExtractedCollection[] {
  const lines = rawText.split(/\r?\n/);
  const collections: ExtractedCollection[] = [];
  let consumedUntil = -1;

  for (let i = 0; i < lines.length; i++) {
    const isAnchor =
      /original\s*creditor\s*:/i.test(lines[i]) ||
      /collection\s*agency\s*:/i.test(lines[i]);
    if (!isAnchor || i <= consumedUntil) continue;

    // Only treat this as a collection block if a "collection" or
    // "charged off" signal appears within a nearby window — otherwise an
    // "Original Creditor" label alone is too weak (could appear elsewhere).
    const contextStart = Math.max(0, i - 5);
    const contextEnd = Math.min(lines.length, i + 15);
    const context = lines.slice(contextStart, contextEnd).join("\n");
    if (!/collection|charge[d\s-]*off/i.test(context)) continue;

    // Both "Original Creditor:" and "Collection Agency:" anchors typically
    // appear within the same block — consume the whole window so we don't
    // double-count a single collection tradeline.
    consumedUntil = contextEnd - 1;

    const creditorMatch = context.match(/original\s*creditor\s*:\s*([^\n]+)/i);
    const agencyMatch = context.match(/collection\s*agency\s*:\s*([^\n]+)/i);
    const amountMatch = context.match(/amount\s*:\s*([^\n]+)/i);
    const openedMatch = context.match(/opened\s*(?:date)?\s*:\s*([^\n]+)/i);
    const firstDelinquencyMatch = context.match(
      /(?:first\s*delinquency|date\s*of\s*first\s*delinquency)\s*:?\s*([^\n]+)/i,
    );
    const fallsOffMatch = context.match(
      /falls?\s*off\s*(?:date)?\s*:\s*([^\n]+)/i,
    );

    collections.push({
      original_creditor: creditorMatch ? creditorMatch[1].trim() : null,
      agency_name: agencyMatch ? agencyMatch[1].trim() : null,
      amount: amountMatch ? toAmount(amountMatch[1]) : null,
      opened_date: openedMatch ? toIsoDate(openedMatch[1]) : null,
      first_delinquency_date: firstDelinquencyMatch
        ? toIsoDate(firstDelinquencyMatch[1])
        : null,
      falls_off_date: fallsOffMatch ? toIsoDate(fallsOffMatch[1]) : null,
    });
  }

  return collections;
}
