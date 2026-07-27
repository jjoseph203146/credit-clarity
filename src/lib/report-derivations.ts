// Pure helper functions that turn real Supabase rows (reports, report_accounts,
// report_collections, report_inquiries) into the display shapes the app
// screens render. Introduced while converting the dashboard/reports/report
// viewer/compare screens off `src/lib/demo-data.ts` and onto live data.
//
// Several fields the old demo fixtures showed (a free-text "action detail",
// a "confidence why" sentence, letter/script bodies, a structured timeline)
// have no backing column in `supabase-schema.sql` — that content is meant to
// come from the Claude analysis pass (BUILD.md step 5), which is a later,
// out-of-scope task. Where noted below we synthesize a reasonable
// approximation from the columns that do exist instead of inventing data.

import type {
  Report,
  ReportAccount,
  ReportCollection,
  ReportInquiry,
} from "@/lib/supabase/types";

export type Tone = "good" | "warn" | "bad" | "neutral";

export function formatMoney(n: number | null | undefined) {
  if (n == null) return "—";
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

export function formatPercent(n: number | null | undefined) {
  if (n == null) return "—";
  return `${Math.round(n)}%`;
}

export function formatDate(
  d: string | null | undefined,
  opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" },
) {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", opts);
}

export function bureauLabel(bureau: Report["bureau"]) {
  if (bureau === "experian") return "Experian";
  if (bureau === "equifax") return "Equifax";
  if (bureau === "transunion") return "TransUnion";
  return "Unknown bureau";
}

export function bureauShort(bureau: Report["bureau"]) {
  if (bureau === "experian") return "EXP";
  if (bureau === "equifax") return "EQF";
  if (bureau === "transunion") return "TU";
  return "—";
}

export function bureauGradient(bureau: Report["bureau"]) {
  if (bureau === "equifax") return "linear-gradient(135deg,#8f2a2a,#d83b3b)";
  if (bureau === "transunion") return "linear-gradient(135deg,#2a6a8f,#3ba8d8)";
  return "linear-gradient(135deg,#3d2a8f,#6a3bd8)"; // experian / default
}

export function statusLabel(status: Report["status"]) {
  switch (status) {
    case "analyzed":
      return "Analyzed";
    case "paid":
      return "Paid";
    case "parsed":
      return "Parsed";
    case "uploaded":
      return "Uploaded";
    case "error":
      return "Error";
    default:
      return status;
  }
}

/** Overall revolving utilization across accounts that carry a credit limit. */
export function overallUtilization(accounts: Pick<ReportAccount, "balance" | "credit_limit" | "type">[]) {
  const revolving = accounts.filter(
    (a) => (a.type === "credit_card" || a.type === "retail_card") && a.credit_limit && a.credit_limit > 0,
  );
  const totalBalance = revolving.reduce((s, a) => s + (a.balance ?? 0), 0);
  const totalLimit = revolving.reduce((s, a) => s + (a.credit_limit ?? 0), 0);
  if (totalLimit <= 0) return null;
  return Math.round((totalBalance / totalLimit) * 100);
}

export function utilizationTone(pct: number | null): Tone {
  if (pct == null) return "neutral";
  if (pct <= 30) return "good";
  if (pct <= 70) return "warn";
  return "bad";
}

export function impactTone(impact: ReportAccount["impact"]): Tone {
  if (impact === "high") return "bad";
  if (impact === "medium") return "warn";
  return "good";
}

export function accountPill(account: ReportAccount): { label: string; tone: Tone } {
  if (account.status === "closed") return { label: "CLOSED", tone: "good" };
  if (account.impact === "high") {
    return {
      label: account.type === "collection" ? "NEEDS ATTENTION" : "HIGH IMPACT",
      tone: "bad",
    };
  }
  if (account.impact === "medium") return { label: "WATCH", tone: "warn" };
  return { label: "HEALTHY", tone: "good" };
}

export function accountTypeLabel(type: ReportAccount["type"]) {
  switch (type) {
    case "credit_card":
      return "Credit card";
    case "retail_card":
      return "Retail card";
    case "auto_loan":
      return "Auto loan";
    case "student_loan":
      return "Student loan";
    case "mortgage":
      return "Mortgage";
    case "collection":
      return "Collection";
    default:
      return "Account";
  }
}

export function accountSubtitle(account: ReportAccount) {
  const parts = [accountTypeLabel(account.type)];
  if (account.opened_date) {
    parts.push(`opened ${new Date(account.opened_date).getFullYear()}`);
  }
  parts.push(account.status === "closed" ? "Closed" : "Open");
  return parts.join(" · ");
}

export function confidenceStars(confidence: number | null) {
  if (!confidence) return "—";
  const filled = Math.max(0, Math.min(5, confidence));
  return "★".repeat(filled) + "☆".repeat(5 - filled);
}

export function validationStatusLabel(status: ReportCollection["validation_status"]) {
  switch (status) {
    case "sent":
      return "VALIDATION SENT";
    case "responded":
      return "RESPONSE RECEIVED";
    case "resolved":
      return "RESOLVED";
    default:
      return "NEEDS ATTENTION";
  }
}

export function validationStatusTone(status: ReportCollection["validation_status"]): Tone {
  if (status === "resolved") return "good";
  if (status === "sent" || status === "responded") return "neutral";
  return "bad";
}

export function inquiryPill(impact: ReportInquiry["impact"]): { label: string; tone: Tone } {
  if (impact === "none") return { label: "NO EFFECT", tone: "good" };
  if (impact === "medium") return { label: "MEDIUM · FADING", tone: "warn" };
  return { label: "SMALL · FADING", tone: "warn" };
}

/**
 * Overview "why" factors, derived from the account/collection mix since
 * there is no persisted structured-factors column yet (that lands with the
 * Claude analysis pass). Picks up to 2 negative + 2 positive factors.
 */
export function deriveScoreFactors(
  accounts: ReportAccount[],
  collections: ReportCollection[],
): {
  sign: "+" | "–";
  positive: boolean;
  tone: Tone;
  title: string;
  detail: string;
  narrative: string;
}[] {
  const factors: {
    sign: "+" | "–";
    positive: boolean;
    tone: Tone;
    title: string;
    detail: string;
    narrative: string;
  }[] = [];

  const util = overallUtilization(accounts);
  if (util != null && util > 30) {
    const worst = [...accounts]
      .filter((a) => a.utilization != null)
      .sort((a, b) => (b.utilization ?? 0) - (a.utilization ?? 0))[0];
    factors.push({
      sign: "–",
      positive: false,
      tone: "bad",
      title: `High utilization (${util}%)`,
      detail: worst
        ? `${worst.name} carries the largest share. Responds within 1-2 statement cycles of paying down.`
        : "Responds within 1-2 statement cycles of paying down.",
      narrative: "Your credit utilization is elevated and may be limiting your score.",
    });
  }

  if (collections.length > 0) {
    const total = collections.reduce((s, c) => s + (c.amount ?? 0), 0);
    const count = collections.length;
    factors.push({
      sign: "–",
      positive: false,
      tone: "bad",
      title: `${count} collection${count > 1 ? "s" : ""} (${formatMoney(total)})`,
      detail: "Caps your ceiling until validated or resolved.",
      narrative: `${count === 1 ? "One collection account requires" : `${count} collection accounts require`} attention.`,
    });
  }

  const oldest = [...accounts]
    .filter((a) => a.opened_date)
    .sort((a, b) => new Date(a.opened_date!).getTime() - new Date(b.opened_date!).getTime())[0];
  if (oldest) {
    const years = Math.max(
      0,
      (Date.now() - new Date(oldest.opened_date!).getTime()) / (365.25 * 24 * 3600 * 1000),
    );
    factors.push({
      sign: "+",
      positive: true,
      tone: "good",
      title: `Account age (${years.toFixed(1)} yrs)`,
      detail: `Oldest account: ${oldest.name} — keep it open.`,
      narrative: "Your long credit history is a strength.",
    });
  }

  const types = new Set(accounts.map((a) => a.type).filter(Boolean));
  if (types.size > 0) {
    factors.push({
      sign: "+",
      positive: true,
      tone: "warn",
      title: "Mix & inquiries",
      detail: `${types.size} account type${types.size > 1 ? "s" : ""} on file.`,
      narrative: "Credit mix and recent inquiries may be limiting future borrowing.",
    });
  }

  return factors.slice(0, 4);
}

export function generateExecutiveSummary(
  report: Report,
  accounts: ReportAccount[],
  collections: ReportCollection[],
) {
  const score = report.credit_score;
  const util = overallUtilization(accounts);
  const tier = score == null ? "unrated" : score >= 740 ? "very good" : score >= 670 ? "good" : score >= 580 ? "fair" : "building";

  const parts: string[] = [];
  parts.push(
    score != null
      ? `Your profile is ${tier} (${score}).`
      : "Your profile hasn't been scored yet.",
  );
  if (util != null) {
    parts.push(
      util > 30
        ? `Card utilization (${util}%) is the biggest lever available to you right now.`
        : `Card utilization (${util}%) is already in a healthy range.`,
    );
  }
  if (collections.length > 0) {
    parts.push(
      `${collections.length} collection${collections.length > 1 ? "s" : ""} on file — validate before paying anything.`,
    );
  } else {
    parts.push("No collections on file.");
  }
  return parts.join(" ");
}
