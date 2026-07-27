// Maps real Supabase report rows (reports / report_accounts /
// report_collections / report_inquiries / action_plans) into the display
// shapes the 13 PDF report page components render. Originally this file was
// a hardcoded "Jordan Ellis" fixture ported verbatim from
// `Credit Clarity PDF Report.dc.html`; it now derives every user-specific
// data point from the real, signed-in user's report. Purely
// editorial/cosmetic copy that isn't user-specific (glossary-style tips,
// lesson catalog blurbs, generic "what to watch for" checklists) is kept
// static in the page components themselves.
import type { CSSProperties } from "react";
import { monoFontFamily } from "./fonts";
import type {
  Report,
  ReportAccount,
  ReportCollection,
  ReportInquiry,
  ActionPlan,
  ActionPlanTask,
  User,
} from "@/lib/supabase/types";
import {
  accountPill,
  accountSubtitle,
  bureauLabel as bureauLabelOf,
  confidenceStars,
  deriveScoreFactors,
  formatDate,
  formatMoney,
  formatPercent,
  generateExecutiveSummary,
  overallUtilization,
  utilizationTone,
  type Tone as DerivTone,
} from "@/lib/report-derivations";

export type Tone = "good" | "bad" | "warn" | "";

function toLocalTone(t: DerivTone): Tone {
  return t === "neutral" ? "" : t;
}

// ---- style helpers (mirror the prototype's inline-style-string helpers) ----

export const snapshotValueStyle = (color: string): CSSProperties => ({
  fontFamily: monoFontFamily,
  fontSize: 26,
  fontWeight: 600,
  marginTop: 7,
  color,
});

export const pillStyle = (tone: Tone): CSSProperties => ({
  fontSize: 10,
  fontWeight: 700,
  borderRadius: 999,
  padding: "4px 10px",
  background: tone === "bad" ? "#fbecec" : tone === "warn" ? "#fdf3e7" : "#e6f5ef",
  color: tone === "bad" ? "#a33232" : tone === "warn" ? "#9a6314" : "#0b7d5e",
});

export const utilValueStyle = (tone: Tone): CSSProperties => ({
  fontFamily: monoFontFamily,
  color: tone === "bad" ? "#c23e3e" : tone === "good" ? "#0b7d5e" : "#16283e",
});

export const impactStyle = (impact: string): CSSProperties => ({
  color: impact === "High" ? "#c23e3e" : impact === "Medium" ? "#c2731a" : "#0b7d5e",
});

export const severityStyle = (severe: boolean): CSSProperties => ({
  fontSize: 10,
  fontWeight: 700,
  borderRadius: 999,
  padding: "4px 10px",
  background: severe ? "#fbecec" : "#fdf3e7",
  color: severe ? "#a33232" : "#9a6314",
});

export const factorLabelStyle = (color: string): CSSProperties => ({
  fontSize: 11.5,
  fontWeight: 700,
  color,
  textAlign: "right",
});

// ---- shapes consumed by the page components ----

export interface SnapshotItem {
  label: string;
  value: string;
  valueColor: string;
  desc: string;
}

export interface ProgBar {
  month: string;
  scoreLabel: string;
  heightPct: number;
  dashed: boolean;
  barColor: string;
}

export interface FactorRow {
  label: string;
  barPct: number;
  barColor: string;
  tag: string;
  tagColor: string;
}

export interface AccountRow {
  name: string;
  type: string;
  bal: string;
  limit: string;
  util: string;
  utilTone: Tone;
  hist: string;
  impact: "High" | "Medium" | "Low" | "None";
  pillLabel: string;
  pillTone: Tone;
  ai: string;
  action: string;
  confidence: string;
}

export interface ErrorRow {
  title: string;
  severe: boolean;
  sevLabel: string;
  desc: string;
  check: string;
}

export interface PlanItem {
  title: string;
  desc: string;
}

export interface PlanMonth {
  title: string;
  sub: string;
  items: PlanItem[];
}

export interface CollectionCardData {
  id: string;
  agencyName: string;
  amountLabel: string;
  originalCreditor: string;
  openedLabel: string;
  firstDelinquencyLabel: string;
  fallsOffLabel: string;
  pillLabel: string;
  pillTone: Tone;
  aiSummary: string | null;
}

export interface InquiryCardData {
  id: string;
  lenderName: string;
  typeLabel: string;
  dateLabel: string;
  statusLabel: string;
  note: string;
  pillLabel: string;
  pillTone: Tone;
}

export interface FactorBullet {
  title: string;
  detail: string;
}

export interface PdfReportData {
  personName: string;
  bureauName: string;
  reportDateLabel: string;
  creditScore: number | null;
  creditScoreBand: string;
  clarityScore: number | null;
  clarityScoreDesc: string;

  executiveSummary: string;
  topPriorities: string[];
  biggestOpportunity: string;
  biggestRisk: string;
  ninetyDayOutlook: string;

  snapshot: SnapshotItem[];
  majorFactors: { label: string; tone: Tone }[];
  progBars: ProgBar[];

  helpingFactors: FactorBullet[];
  hurtingFactors: FactorBullet[];
  mostImpactfulFactor: FactorBullet;
  factors: FactorRow[];

  accountsP1: AccountRow[];
  accountsP2: AccountRow[];

  collectionsHeadline: string;
  collectionsData: CollectionCardData[];

  inquiriesHeadline: string;
  inquiriesData: InquiryCardData[];

  errRows: ErrorRow[];

  planMonths: PlanMonth[];

  toolkitValidationAddressee: string;
  toolkitGoodwillAddressee: string;

  nextReviewLabel: string;
}

// ---- helpers ----

function scoreBand(score: number | null): string {
  if (score == null) return "Not yet scored";
  if (score >= 740) return "Very good";
  if (score >= 670) return "Good";
  if (score >= 580) return "Fair";
  return "Building";
}

function capitalizeImpact(impact: ReportAccount["impact"], status: ReportAccount["status"]): AccountRow["impact"] {
  if (status === "closed") return "None";
  if (impact === "high") return "High";
  if (impact === "medium") return "Medium";
  if (impact === "low") return "Low";
  return "None";
}

function buildAccountRow(a: ReportAccount): AccountRow {
  const pill = accountPill(a);
  return {
    name: a.name,
    type: accountSubtitle(a),
    bal: formatMoney(a.balance),
    limit: formatMoney(a.credit_limit),
    util: formatPercent(a.utilization),
    utilTone: toLocalTone(utilizationTone(a.utilization)),
    hist: a.payment_history ?? "—",
    impact: capitalizeImpact(a.impact, a.status),
    pillLabel: pill.label,
    pillTone: toLocalTone(pill.tone),
    ai: a.ai_summary ?? "Analysis for this account hasn't been generated yet.",
    action: a.recommended_action ?? "No action recommended yet.",
    confidence: confidenceStars(a.confidence),
  };
}

const IMPACT_RANK: Record<string, number> = { high: 3, medium: 2, low: 1 };

function sortByImpact(accounts: ReportAccount[]) {
  return [...accounts].sort(
    (a, b) =>
      (IMPACT_RANK[b.impact ?? ""] ?? 0) - (IMPACT_RANK[a.impact ?? ""] ?? 0) ||
      (b.confidence ?? 0) - (a.confidence ?? 0),
  );
}

function buildSnapshot(
  report: Report,
  accounts: ReportAccount[],
  collections: ReportCollection[],
  inquiries: ReportInquiry[],
): SnapshotItem[] {
  const util = overallUtilization(accounts);
  const openAccounts = accounts.filter((a) => a.status === "open" && a.type !== "collection");
  const revolving = openAccounts.filter((a) => a.type === "credit_card" || a.type === "retail_card");
  const installment = openAccounts.filter(
    (a) => a.type === "auto_loan" || a.type === "student_loan" || a.type === "mortgage",
  );
  const collectionsTotal = collections.reduce((s, c) => s + (c.amount ?? 0), 0);
  const oneYearAgo = Date.now() - 365 * 24 * 3600 * 1000;
  const recentInquiries = inquiries.filter((q) => q.inquiry_date && new Date(q.inquiry_date).getTime() >= oneYearAgo);

  return [
    {
      label: "Credit Score",
      value: report.credit_score != null ? String(report.credit_score) : "—",
      valueColor: "#16283e",
      desc: scoreBand(report.credit_score),
    },
    {
      label: "Clarity Score",
      value: report.clarity_score != null ? `${report.clarity_score}/100` : "—",
      valueColor: "#16283e",
      desc: "Educational score — not a FICO®/VantageScore®",
    },
    {
      label: "Utilization",
      value: util != null ? `${util}%` : "—",
      valueColor: util != null && util > 30 ? "#c23e3e" : "#16283e",
      desc: "Goal: below 30%",
    },
    {
      label: "Open Accounts",
      value: String(openAccounts.length),
      valueColor: "#16283e",
      desc: `${revolving.length} revolving · ${installment.length} installment`,
    },
    {
      label: "Collections",
      value: String(collections.length),
      valueColor: collections.length > 0 ? "#c23e3e" : "#16283e",
      desc: collections.length > 0 ? `${formatMoney(collectionsTotal)} · validation recommended` : "None on file",
    },
    {
      label: "Inquiries (12 mo)",
      value: String(recentInquiries.length),
      valueColor: recentInquiries.length > 2 ? "#c2731a" : "#0b7d5e",
      desc: recentInquiries.length > 2 ? "Higher than typical" : "Normal — no action",
    },
  ];
}

function buildMajorFactors(
  accounts: ReportAccount[],
  collections: ReportCollection[],
  inquiries: ReportInquiry[],
): { label: string; tone: Tone }[] {
  const out: { label: string; tone: Tone }[] = [];
  const util = overallUtilization(accounts);
  if (util != null) {
    out.push({ label: `Card utilization — ${util}%`, tone: util > 30 ? "bad" : "good" });
  }
  if (collections.length > 0) {
    const total = collections.reduce((s, c) => s + (c.amount ?? 0), 0);
    out.push({ label: `${collections.length} collection${collections.length > 1 ? "s" : ""} — ${formatMoney(total)}`, tone: "bad" });
  }
  const lateAccounts = accounts.filter((a) => a.payment_history && !/on time/i.test(a.payment_history));
  if (lateAccounts.length > 0) {
    out.push({ label: `${lateAccounts.length} late payment${lateAccounts.length > 1 ? "s" : ""} on file`, tone: "warn" });
  } else {
    out.push({ label: "No late payments on file", tone: "good" });
  }
  const opened = accounts.filter((a) => a.opened_date).map((a) => new Date(a.opened_date!).getTime());
  if (opened.length > 0) {
    const avgYears = opened.reduce((s, t) => s + (Date.now() - t), 0) / opened.length / (365.25 * 24 * 3600 * 1000);
    out.push({ label: `${avgYears.toFixed(1)} yrs average account age`, tone: "good" });
  }
  const types = new Set(accounts.map((a) => a.type).filter(Boolean));
  if (types.size > 0) {
    out.push({ label: `${types.size} account type${types.size > 1 ? "s" : ""} — mix`, tone: "good" });
  }
  const oneYearAgo = Date.now() - 365 * 24 * 3600 * 1000;
  const recentInquiries = inquiries.filter((q) => q.inquiry_date && new Date(q.inquiry_date).getTime() >= oneYearAgo);
  out.push({
    label: `${recentInquiries.length} inquir${recentInquiries.length === 1 ? "y" : "ies"} in 12 months`,
    tone: recentInquiries.length > 2 ? "warn" : "good",
  });
  return out;
}

function buildProgBars(report: Report): ProgBar[] {
  // No score-history table exists yet, so we can only plot the current
  // score — not a fabricated trend line.
  if (report.credit_score == null) return [];
  return [
    {
      month: formatDate(report.report_date ?? report.created_at, { month: "short", year: "numeric" }),
      scoreLabel: String(report.credit_score),
      heightPct: Math.max(6, Math.min(100, Math.round(((report.credit_score - 300) / (850 - 300)) * 100))),
      dashed: false,
      barColor: "linear-gradient(180deg,#2ee6a8,#0e9f77)",
    },
  ];
}

function buildFactorRows(
  report: Report,
  accounts: ReportAccount[],
  inquiries: ReportInquiry[],
): FactorRow[] {
  const util = overallUtilization(accounts);
  const utilPct = util == null ? 50 : Math.max(0, 100 - util);
  const utilTone: Tone = util == null ? "" : util <= 30 ? "good" : util <= 70 ? "warn" : "bad";

  const relevant = accounts.filter((a) => a.payment_history);
  const clean = relevant.filter((a) => /on time/i.test(a.payment_history ?? ""));
  const paymentPct = relevant.length > 0 ? Math.round((clean.length / relevant.length) * 100) : 70;
  const paymentTone: Tone = paymentPct >= 90 ? "good" : paymentPct >= 60 ? "warn" : "bad";

  const opened = accounts.filter((a) => a.opened_date).map((a) => new Date(a.opened_date!).getTime());
  const avgYears = opened.length > 0
    ? opened.reduce((s, t) => s + (Date.now() - t), 0) / opened.length / (365.25 * 24 * 3600 * 1000)
    : 0;
  const agePct = Math.max(5, Math.min(100, Math.round((avgYears / 10) * 100)));
  const ageTone: Tone = avgYears >= 5 ? "good" : avgYears >= 2 ? "warn" : "bad";

  const types = new Set(accounts.map((a) => a.type).filter(Boolean));
  const mixPct = Math.max(10, Math.min(100, Math.round((types.size / 5) * 100)));
  const mixTone: Tone = types.size >= 3 ? "good" : "warn";

  const oneYearAgo = Date.now() - 365 * 24 * 3600 * 1000;
  const recentInquiries = inquiries.filter((q) => q.inquiry_date && new Date(q.inquiry_date).getTime() >= oneYearAgo);
  const inqPct = Math.max(5, Math.min(100, 100 - recentInquiries.length * 20));
  const inqTone: Tone = recentInquiries.length <= 2 ? "good" : recentInquiries.length <= 4 ? "warn" : "bad";

  const toneColor = (t: Tone) => (t === "bad" ? "#d05252" : t === "warn" ? "#e0a23a" : "#0e9f77");
  const toneTag = (t: Tone) => (t === "bad" ? "High" : t === "warn" ? "Needs attention" : "Good");
  const toneTagColor = (t: Tone) => (t === "bad" ? "#c23e3e" : t === "warn" ? "#c2731a" : "#0b7d5e");

  return [
    { label: "Payment history · 35%", barPct: paymentPct, barColor: toneColor(paymentTone), tag: toneTag(paymentTone), tagColor: toneTagColor(paymentTone) },
    { label: "Utilization · 30%", barPct: utilPct, barColor: toneColor(utilTone), tag: toneTag(utilTone), tagColor: toneTagColor(utilTone) },
    { label: "Account age · 15%", barPct: agePct, barColor: toneColor(ageTone), tag: toneTag(ageTone), tagColor: toneTagColor(ageTone) },
    { label: "Credit mix · 10%", barPct: mixPct, barColor: toneColor(mixTone), tag: toneTag(mixTone), tagColor: toneTagColor(mixTone) },
    { label: "New inquiries · 10%", barPct: inqPct, barColor: toneColor(inqTone), tag: toneTag(inqTone), tagColor: toneTagColor(inqTone) },
  ];
}

function buildHelpingHurting(
  accounts: ReportAccount[],
  collections: ReportCollection[],
): { helping: FactorBullet[]; hurting: FactorBullet[] } {
  const why = deriveScoreFactors(accounts, collections);
  const helping = why.filter((w) => w.positive).map((w) => ({ title: w.title, detail: w.detail }));
  const hurting = why.filter((w) => !w.positive).map((w) => ({ title: w.title, detail: w.detail }));
  if (helping.length === 0) {
    helping.push({ title: "Building history", detail: "Keep making on-time payments — history is the largest factor in your score over time." });
  }
  if (hurting.length === 0) {
    hurting.push({ title: "No major negatives found", detail: "Nothing on this report is actively working against you right now." });
  }
  return { helping, hurting };
}

function buildMostImpactfulFactor(accounts: ReportAccount[], collections: ReportCollection[]): FactorBullet {
  const util = overallUtilization(accounts);
  if (util != null && util > 30) {
    return {
      title: "Credit utilization.",
      detail:
        "Unlike late payments and collections — which fade slowly with time — utilization has no memory. The moment lower balances report, the penalty lifts. That's why paydown is priority #1: it's the only factor on your report you can change in weeks, not years.",
    };
  }
  if (collections.length > 0) {
    return {
      title: "Open collections.",
      detail: "Collections cap how high your score can climb until they're validated and resolved. Addressing them is the fastest way to raise your ceiling.",
    };
  }
  return {
    title: "Consistency.",
    detail: "Your biggest lever from here is simply staying consistent — on-time payments and low balances, month after month.",
  };
}

function buildTopPriorities(accounts: ReportAccount[], collections: ReportCollection[]): string[] {
  const priorities: string[] = [];
  const ranked = sortByImpact(accounts).filter((a) => a.recommended_action);
  for (const a of ranked) {
    if (priorities.length >= 3) break;
    priorities.push(`${a.name}: ${a.recommended_action}`);
  }
  if (priorities.length < 3 && collections.length > 0) {
    priorities.push(`Send a validation request before paying ${collections[0].agency_name ?? "your collection agency"}.`);
  }
  if (priorities.length === 0) {
    priorities.push("Keep every account current — no missed payments in the next 90 days.");
  }
  return priorities.slice(0, 3);
}

function buildBiggestOpportunity(accounts: ReportAccount[]): string {
  const revolving = accounts.filter(
    (a) => (a.type === "credit_card" || a.type === "retail_card") && a.credit_limit && a.credit_limit > 0,
  );
  const neededPaydown = revolving.reduce((sum, a) => {
    const target = (a.credit_limit ?? 0) * 0.3;
    return sum + Math.max(0, (a.balance ?? 0) - target);
  }, 0);
  if (neededPaydown > 0) {
    return `Roughly ${formatMoney(neededPaydown)} in card paydown brings every card under 30% utilization — the threshold where scores respond most.`;
  }
  return "Your card balances are already in a healthy range — the next opportunity is keeping them there while your history ages.";
}

function buildBiggestRisk(collections: ReportCollection[]): string {
  if (collections.length > 0) {
    return `Paying ${collections[0].agency_name ?? "a collection"} without validation or a written deletion agreement — it can reset the clock without helping your score.`;
  }
  return "Applying for new credit unnecessarily in the next 90 days — new inquiries and accounts can offset the progress you're making.";
}

function buildCollections(collections: ReportCollection[]): CollectionCardData[] {
  return collections.map((c) => ({
    id: c.id,
    agencyName: c.agency_name ?? "Unknown agency",
    amountLabel: formatMoney(c.amount),
    originalCreditor: c.original_creditor ?? "—",
    openedLabel: formatDate(c.opened_date, { month: "short", year: "numeric" }),
    firstDelinquencyLabel: formatDate(c.first_delinquency_date, { month: "short", year: "numeric" }),
    fallsOffLabel: formatDate(c.falls_off_date, { month: "short", year: "numeric" }),
    pillLabel: c.validation_status === "resolved" ? "RESOLVED" : c.validation_status === "sent" || c.validation_status === "responded" ? "IN PROGRESS" : "NEEDS ATTENTION",
    pillTone: c.validation_status === "resolved" ? "good" : c.validation_status === "sent" || c.validation_status === "responded" ? "warn" : "bad",
    aiSummary: c.ai_summary,
  }));
}

function buildInquiries(inquiries: ReportInquiry[]): InquiryCardData[] {
  return inquiries.map((q) => {
    const date = q.inquiry_date ? new Date(q.inquiry_date) : null;
    const stopsAffecting = date ? new Date(date.getFullYear(), date.getMonth() + 12) : null;
    const fallsOff = date ? new Date(date.getFullYear(), date.getMonth() + 24) : null;
    const monthsOld = date ? (Date.now() - date.getTime()) / (30.44 * 24 * 3600 * 1000) : null;
    const note =
      q.ai_note ??
      (monthsOld == null
        ? "Date unavailable for this inquiry."
        : monthsOld >= 12
          ? "Already past the 12-month mark — no longer affects your score at all."
          : "Recent but routine — the effect fades over the next several months.");
    const pill =
      q.impact === "none"
        ? { label: "NO EFFECT", tone: "good" as Tone }
        : q.impact === "medium"
          ? { label: "MEDIUM · FADING", tone: "warn" as Tone }
          : { label: "SMALL · FADING", tone: "warn" as Tone };
    return {
      id: q.id,
      lenderName: q.lender_name ?? "Unknown lender",
      typeLabel: q.inquiry_type ?? "Inquiry",
      dateLabel: formatDate(q.inquiry_date, { month: "short", year: "numeric" }),
      statusLabel: stopsAffecting && fallsOff
        ? `Stops affecting score ${formatDate(stopsAffecting.toISOString(), { month: "short", year: "numeric" })} · falls off ${formatDate(fallsOff.toISOString(), { month: "short", year: "numeric" })}`
        : "—",
      note,
      pillLabel: pill.label,
      pillTone: pill.tone,
    };
  });
}

const PLAN_MONTH_META: Record<number, { title: string; sub: string }> = {
  1: { title: "MONTH 1 — STABILIZE", sub: "Weeks 1-4 · stop the bleeding" },
  2: { title: "MONTH 2 — REDUCE", sub: "Weeks 5-8 · attack utilization" },
  3: { title: "MONTH 3 — OPTIMIZE", sub: "Weeks 9-12 · lock in gains" },
};

function buildPlanMonths(tasks: ActionPlanTask[]): PlanMonth[] {
  const months: PlanMonth[] = [1, 2, 3].map((m) => ({
    title: PLAN_MONTH_META[m].title,
    sub: PLAN_MONTH_META[m].sub,
    items: [],
  }));
  const sorted = [...tasks].sort((a, b) => a.month - b.month || a.week - b.week);
  for (const t of sorted) {
    const idx = Math.min(3, Math.max(1, t.month)) - 1;
    months[idx].items.push({
      title: `Week ${t.week}: ${t.label}`,
      desc: t.sub ?? "",
    });
  }
  return months;
}

function buildErrorRows(): ErrorRow[] {
  // No automated data-quality/anomaly detection exists yet (that would need
  // a dedicated pass over the parsed report), so there is nothing
  // user-specific to list here without fabricating findings.
  return [];
}

export function buildPdfReportData(
  report: Report,
  user: Pick<User, "full_name" | "email"> | null,
  accounts: ReportAccount[],
  collections: ReportCollection[],
  inquiries: ReportInquiry[],
  actionPlan: ActionPlan | null,
): PdfReportData {
  const sorted = sortByImpact(accounts);
  const half = Math.ceil(sorted.length / 2);
  const accountsP1 = sorted.slice(0, half).map(buildAccountRow);
  const accountsP2 = sorted.slice(half).map(buildAccountRow);

  const { helping, hurting } = buildHelpingHurting(accounts, collections);

  const collectionsData = buildCollections(collections);
  const inquiriesData = buildInquiries(inquiries);

  const reportDate = report.report_date ?? report.created_at;
  const nextReview = new Date(new Date(reportDate).getTime() + 90 * 24 * 3600 * 1000);

  return {
    personName: user?.full_name ?? "Your Report",
    bureauName: bureauLabelOf(report.bureau),
    reportDateLabel: formatDate(reportDate, { month: "long", day: "numeric", year: "numeric" }),
    creditScore: report.credit_score,
    creditScoreBand: scoreBand(report.credit_score),
    clarityScore: report.clarity_score,
    clarityScoreDesc: "Educational score",

    executiveSummary: generateExecutiveSummary(report, accounts, collections),
    topPriorities: buildTopPriorities(accounts, collections),
    biggestOpportunity: buildBiggestOpportunity(accounts),
    biggestRisk: buildBiggestRisk(collections),
    ninetyDayOutlook:
      "Follow the plan on page 10 and upload an updated report in about 90 days. Expected trajectory: utilization trending toward 30%, collections validated (and possibly removed), and zero new late payments — the conditions under which profiles typically move to the next score tier.",

    snapshot: buildSnapshot(report, accounts, collections, inquiries),
    majorFactors: buildMajorFactors(accounts, collections, inquiries),
    progBars: buildProgBars(report),

    helpingFactors: helping,
    hurtingFactors: hurting,
    mostImpactfulFactor: buildMostImpactfulFactor(accounts, collections),
    factors: buildFactorRows(report, accounts, inquiries),

    accountsP1,
    accountsP2,

    collectionsHeadline:
      collections.length === 0
        ? "No collections on this report"
        : collections.length === 1
          ? "One collection needs your attention"
          : `${collections.length} collections need your attention`,
    collectionsData,

    inquiriesHeadline:
      inquiries.length === 0
        ? "No hard inquiries — no action needed"
        : `${inquiries.length} inquir${inquiries.length === 1 ? "y" : "ies"} — review below`,
    inquiriesData,

    errRows: buildErrorRows(),

    planMonths: buildPlanMonths(actionPlan?.tasks ?? []),

    toolkitValidationAddressee: collections[0]?.agency_name ?? "[Collection Agency Name]",
    toolkitGoodwillAddressee: accounts.find((a) => a.payment_history && !/on time/i.test(a.payment_history))?.name ?? "[Creditor Name]",

    nextReviewLabel: formatDate(nextReview.toISOString(), { month: "long", day: "numeric", year: "numeric" }),
  };
}
