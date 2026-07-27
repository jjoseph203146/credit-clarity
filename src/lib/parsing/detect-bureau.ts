import type { Bureau } from "@/lib/supabase/types";

// Heuristic bureau detection.
//
// Bureau PDFs carry their identity in letterhead text, domains in footers,
// and disclosure boilerplate ("As a service of Experian..."). We look for
// the strongest, least-ambiguous signals first (domains), then fall back to
// plain name mentions. If more than one bureau's signals appear with similar
// strength (e.g. a report that quotes another bureau's name in boilerplate
// text), we bail out to `null` rather than guess — a wrong bureau tag is
// worse than a missing one downstream (wrong enum semantics on `reports`).
const SIGNALS: Record<Bureau, RegExp[]> = {
  experian: [/experian\.com/i, /\bexperian\b/i],
  equifax: [/equifax\.com/i, /\bequifax\b/i],
  transunion: [/transunion\.com/i, /trans\s*union/i],
};

export function detectBureau(rawText: string): Bureau | null {
  const scores: Record<Bureau, number> = {
    experian: 0,
    equifax: 0,
    transunion: 0,
  };

  for (const bureau of Object.keys(SIGNALS) as Bureau[]) {
    for (const pattern of SIGNALS[bureau]) {
      const matches = rawText.match(new RegExp(pattern, "gi"));
      if (matches) {
        // Domain-style matches are a stronger signal than a bare name
        // mention; weight them heavier.
        const weight = pattern.source.includes("\\.com") ? 5 : 1;
        scores[bureau] += matches.length * weight;
      }
    }
  }

  const ranked = (Object.keys(scores) as Bureau[])
    .filter((b) => scores[b] > 0)
    .sort((a, b) => scores[b] - scores[a]);

  if (ranked.length === 0) return null;
  if (ranked.length === 1) return ranked[0];

  // Ambiguous: top two are too close to call confidently.
  const [top, second] = ranked;
  if (scores[top] > scores[second] * 2) return top;

  return null;
}
