import type { InquiryImpact } from "@/lib/supabase/types";

// Heuristic inquiries extraction.
//
// Same caveats as the other extractors: no standard layout. We look for an
// "Inquiries" section header, then scan the lines that follow for a
// "name ... date ... (optional type)" pattern, stopping once we hit what
// looks like the next section header (an all-caps short line with no
// date). Lines inside the inquiries section that don't match the
// name/date pattern are skipped rather than guessed at.
export type ExtractedInquiry = {
  lender_name: string | null;
  inquiry_type: string | null;
  inquiry_date: string | null;
  impact: InquiryImpact | null;
};

const DATE = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}|\d{1,2}[\/\-]\d{4})/;
const LINE_PATTERN = new RegExp(
  String.raw`^(.{2,40}?)[\s\-,:]{1,5}${DATE.source}[\s\-,:]{0,5}(.*)$`,
);
const FULL_DATE = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/;
const MONTH_YEAR = /(\d{1,2})[\/\-](\d{4})/;

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

function mapImpact(typeText: string): InquiryImpact | null {
  if (/hard/i.test(typeText)) return "medium";
  if (/soft/i.test(typeText)) return "none";
  return null;
}

function looksLikeNextSectionHeader(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length === 0) return false;
  if (DATE.test(trimmed)) return false;
  // Short, no lowercase letters, no digits -> likely a header like
  // "ACCOUNTS" or "PUBLIC RECORDS".
  return trimmed.length < 40 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed);
}

export function extractInquiries(rawText: string): ExtractedInquiry[] {
  const lines = rawText.split(/\r?\n/);
  const inquiries: ExtractedInquiry[] = [];

  const sectionStart = lines.findIndex((line) => /inquir(y|ies)/i.test(line));
  if (sectionStart === -1) return inquiries;

  for (let i = sectionStart + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length === 0) continue;
    if (looksLikeNextSectionHeader(line)) break;

    const match = line.match(LINE_PATTERN);
    if (!match) continue;

    const [, name, date, trailing] = match;
    inquiries.push({
      lender_name: name.trim() || null,
      inquiry_type: trailing?.trim() || null,
      inquiry_date: toIsoDate(date),
      impact: trailing ? mapImpact(trailing) : null,
    });
  }

  return inquiries;
}
