// Heuristic credit score extraction.
//
// We only trust a small set of explicit "label near number" patterns
// (e.g. "Credit Score: 642", "FICO Score 642", "VantageScore: 705").
// A bare 3-digit number in the 300-850 range is NOT enough on its own —
// bureau reports are full of 3-digit numbers (account balances, zip code
// fragments, page numbers) so scanning for "any number that could be a
// score" produces too many false positives. We require the number to be
// within a short distance of one of the known score-label keywords.
const LABELS = [
  /credit\s*score/i,
  /fico\s*score/i,
  /\bfico\b/i,
  /vantage\s*score/i,
];

const SCORE_MIN = 300;
const SCORE_MAX = 850;

export function extractScore(rawText: string): number | null {
  for (const label of LABELS) {
    // Look for the label followed (within ~20 chars, allowing for a colon,
    // "of", "is", etc.) by a 3-digit number.
    const pattern = new RegExp(
      label.source + String.raw`[^0-9]{0,20}(\d{3})`,
      "i",
    );
    const match = rawText.match(pattern);
    if (match) {
      const value = Number(match[1]);
      if (value >= SCORE_MIN && value <= SCORE_MAX) {
        return value;
      }
    }
  }

  return null;
}
