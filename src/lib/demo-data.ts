// Static demo data for the authenticated app shell, mirroring the Jordan
// Ellis fixture used throughout `Credit Clarity App.dc.html`. This is
// prototype-parity content only — no live Supabase/Claude calls happen here.
// A later task wires these screens to real data.

export type Tone = "good" | "warn" | "bad" | "neutral";

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  /** Unread-style badge count shown on the right of the nav row. */
  dot?: number;
}

// Launch sidebar. Learning Center, Progress, Goals & Simulator, and
// Notifications were cut pre-launch — see the deletion commit to restore.
// Action Plan is reachable from the dashboard and report, not top-level nav.
export const navMain: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "◧" },
  { label: "My Reports", href: "/reports", icon: "⧉" },
  { label: "Clarity AI", href: "/chat", icon: "✦" },
];

export const navAccount: NavItem[] = [
  { label: "Profile", href: "/settings", icon: "⚙" },
];

export const currentUser = {
  name: "Jordan Ellis",
  initials: "JE",
  plan: "Pay per report",
};

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export const dashboard = {
  greetingName: "Jordan",
  bureau: "Experian",
  reportDate: "Apr 12, 2026",
  nextUpload: "Jul 11",
  clarityScore: 74,
  clarityScoreMax: 100,
  clarityNote: "Improving. Focus on utilization and your collection account.",
  creditScore: 642,
  scoreDelta: "+14",
  utilization: 72,
  planDone: 1,
  planTotal: 9,
  scoreTrend: "+31",
  scoreTrendSince: "since October",
};

export interface DashboardTask {
  id: string;
  label: string;
  sub: string;
  tag: string;
  done: boolean;
}

export const todayTasks: DashboardTask[] = [
  {
    id: "t1",
    label: "Verify your mailing address",
    sub: "Needed before sending letters",
    tag: "TODAY",
    done: true,
  },
  {
    id: "t2",
    label: "Download your Equifax + TransUnion reports",
    sub: "annualcreditreport.com — free",
    tag: "TODAY",
    done: false,
  },
  {
    id: "t3",
    label: "Review your collection account",
    sub: "5 min · opens the walkthrough",
    tag: "TODAY",
    done: false,
  },
];

export interface DashboardNotification {
  icon: string;
  tone: Tone;
  title: string;
  sub: string;
}

export const dashboardNotifications: DashboardNotification[] = [
  {
    icon: "✉",
    tone: "good",
    title: "Validation letter — day 12 of 30",
    sub: "Midland must respond by May 26",
  },
  {
    icon: "!",
    tone: "warn",
    title: "Task overdue: Chase payment",
    sub: "Planned for Apr 20",
  },
  {
    icon: "↻",
    tone: "neutral",
    title: "Re-upload opens Jul 11",
    sub: "Track your progress next quarter",
  },
];

// ---------------------------------------------------------------------------
// My Reports
// ---------------------------------------------------------------------------

export interface ReportRow {
  id: string;
  logo: string;
  gradient: string;
  date: string;
  bureau: string;
  score: string;
  change: string;
  changeUp: boolean;
  status: string;
  current?: boolean;
}

export const reportRows: ReportRow[] = [
  {
    id: "2026-04",
    logo: "EXP",
    gradient: "linear-gradient(135deg,#3d2a8f,#6a3bd8)",
    date: "April 12, 2026",
    bureau: "Experian · current",
    score: "642",
    change: "+14",
    changeUp: true,
    status: "Analyzed",
    current: true,
  },
  {
    id: "2026-01",
    logo: "EXP",
    gradient: "linear-gradient(135deg,#3d2a8f,#6a3bd8)",
    date: "January 8, 2026",
    bureau: "Experian",
    score: "628",
    change: "+17",
    changeUp: true,
    status: "Analyzed",
  },
  {
    id: "2025-10",
    logo: "EXP",
    gradient: "linear-gradient(135deg,#3d2a8f,#6a3bd8)",
    date: "October 2, 2025",
    bureau: "Experian · first report",
    score: "611",
    change: "—",
    changeUp: false,
    status: "Analyzed",
  },
];

// ---------------------------------------------------------------------------
// Report Viewer — Overview
// ---------------------------------------------------------------------------

export const executiveSummary =
  "Your profile is fair (642) and trending up — +31 since October. Two factors outweigh everything else: card utilization (72%) and one collection ($684). Account age and mix are strong, so your score responds quickly once balances drop.";

export interface ScoreFactor {
  sign: "+" | "–";
  positive: boolean;
  title: string;
  detail: string;
}

export const scoreWhy: ScoreFactor[] = [
  {
    sign: "–",
    positive: false,
    title: "High utilization (72%)",
    detail: "Biggest drag. Responds within 1-2 statement cycles of paying down.",
  },
  {
    sign: "–",
    positive: false,
    title: "Collection ($684)",
    detail: "Caps your ceiling until validated or resolved.",
  },
  {
    sign: "+",
    positive: true,
    title: "Account age (6.2 yrs)",
    detail: "Oldest card from 2017 — keep it open.",
  },
  {
    sign: "+",
    positive: true,
    title: "Mix & inquiries",
    detail: "4 account types, only 2 recent inquiries.",
  },
];

// ---------------------------------------------------------------------------
// Report Viewer — Accounts
// ---------------------------------------------------------------------------

export interface Account {
  id: string;
  name: string;
  type: string;
  balance: string;
  limit: string;
  utilization: string;
  utilTone: Tone;
  history: string;
  pill: string;
  pillTone: Tone;
  impact: "High" | "Medium" | "Low" | "None";
  ai: string;
  action: string;
  actionDetail: string;
  benefit: string;
  confidence: string;
  confidenceWhy: string;
}

export const accounts: Account[] = [
  {
    id: "chase-freedom",
    name: "Chase Freedom",
    type: "Credit card · opened 2019 · Open",
    balance: "$2,860",
    limit: "$3,500",
    utilization: "82%",
    utilTone: "bad",
    history: "On time",
    pill: "HIGH IMPACT",
    pillTone: "bad",
    impact: "High",
    ai: "This account has the largest utilization on your report — 82% of a $3,500 limit. Utilization above 30% on any single card drags your score even when overall utilization is lower, and this card alone accounts for most of your revolving-balance penalty. There are no late payments here, so the fix is purely mathematical: reduce the balance.",
    action: "Pay $1,810",
    actionDetail:
      "Brings this card to 30% ($1,050). At your planned $210/mo extra plus minimums, that is roughly 8 weeks.",
    benefit: "High",
    confidence: "★★★★★",
    confidenceWhy: "Highest single-card utilization on your file — the math is unambiguous.",
  },
  {
    id: "capital-one-quicksilver",
    name: "Capital One Quicksilver",
    type: "Credit card · opened 2017 · Open",
    balance: "$4,320",
    limit: "$6,000",
    utilization: "72%",
    utilTone: "bad",
    history: "1 late · Mar 2024",
    pill: "HIGH IMPACT",
    pillTone: "bad",
    impact: "High",
    ai: "Your oldest active card — which makes it valuable for account age — but it carries two problems: 72% utilization and your only recent late payment (March 2024). You have 13 consecutive on-time payments since, which makes a goodwill adjustment request realistic.",
    action: "Pay $2,520 + goodwill letter",
    actionDetail:
      "Target $1,800 (30%). Send the goodwill letter now — your 13-month clean streak is the argument.",
    benefit: "High",
    confidence: "★★★★☆",
    confidenceWhy: "Payoff math is certain; goodwill approval depends on the issuer.",
  },
  {
    id: "midland",
    name: "Midland Credit Mgmt",
    type: "Collection · opened Aug 2024",
    balance: "$684",
    limit: "—",
    utilization: "—",
    utilTone: "neutral",
    history: "Unpaid",
    pill: "NEEDS ATTENTION",
    pillTone: "bad",
    impact: "High",
    ai: "A collection sold by Synchrony Bank (Amazon Store Card). We found a $72 discrepancy between Midland's reported balance and the original charge-off — grounds to demand validation before any payment. Do not pay or acknowledge this debt by phone.",
    action: "Send validation letter",
    actionDetail:
      "Certified mail, 30-day response window. The letter is ready in Letters & Scripts.",
    benefit: "High",
    confidence: "★★★★★",
    confidenceWhy: "FDCPA validation is your legal right; the balance mismatch strengthens it.",
  },
  {
    id: "navient",
    name: "Navient",
    type: "Student loan · opened 2018 · Open",
    balance: "$8,900",
    limit: "—",
    utilization: "—",
    utilTone: "neutral",
    history: "1 late · 2023",
    pill: "WATCH",
    pillTone: "warn",
    impact: "Medium",
    ai: "An installment loan in good standing since one late payment in 2023. Installment balances matter far less than revolving ones — your payoff pace here is fine. The one risk is a repeat late, which autopay eliminates.",
    action: "Enroll in autopay",
    actionDetail: "Most servicers also give a 0.25% rate discount for autopay.",
    benefit: "Medium",
    confidence: "★★★★☆",
    confidenceWhy: "Preventive — protects your payment history rather than lifting the score now.",
  },
  {
    id: "discover-it",
    name: "Discover it",
    type: "Credit card · opened 2021 · Open",
    balance: "$410",
    limit: "$2,000",
    utilization: "21%",
    utilTone: "good",
    history: "On time",
    pill: "HEALTHY",
    pillTone: "good",
    impact: "Low",
    ai: "Your best-managed card: 21% utilization, spotless history. You paid this down from $980 in January — that improvement contributed to your +14 this cycle. Nothing to fix.",
    action: "Keep under 30%",
    actionDetail: "No change needed. This card is your template for the other two.",
    benefit: "Maintains",
    confidence: "★★★★★",
    confidenceWhy: "Already healthy — recommendation is to preserve behavior.",
  },
  {
    id: "toyota-financial",
    name: "Toyota Financial",
    type: "Auto loan · opened 2023 · Open",
    balance: "$11,240",
    limit: "$18,500 orig.",
    utilization: "—",
    utilTone: "neutral",
    history: "On time",
    pill: "HEALTHY",
    pillTone: "good",
    impact: "Low",
    ai: "Perfect payment history on an installment loan — this is quietly one of the strongest lines on your report and adds to your credit mix. No action improves it beyond continuing on-time payments.",
    action: "No action",
    actionDetail: "Stay the course. Paying it off early would not meaningfully help your score.",
    benefit: "Maintains",
    confidence: "★★★★★",
    confidenceWhy: "On-time installment history — nothing to optimize.",
  },
  {
    id: "macys",
    name: "Macy's Store Card",
    type: "Retail card · opened 2020 · Open",
    balance: "$0",
    limit: "$800",
    utilization: "0%",
    utilTone: "good",
    history: "On time",
    pill: "HEALTHY",
    pillTone: "good",
    impact: "Low",
    ai: "A zero-balance retail card. Its only job is adding available credit and account age — closing it would raise your overall utilization by shrinking your total limits. Use it once or twice a year so the issuer doesn't close it for inactivity.",
    action: "Keep open",
    actionDetail: "Small purchase every 6 months, paid in full.",
    benefit: "Maintains",
    confidence: "★★★★☆",
    confidenceWhy: "Issuers sometimes close inactive cards regardless.",
  },
  {
    id: "wells-fargo",
    name: "Wells Fargo Platinum",
    type: "Credit card · closed 2022",
    balance: "$0",
    limit: "—",
    utilization: "—",
    utilTone: "neutral",
    history: "On time",
    pill: "CLOSED",
    pillTone: "good",
    impact: "None",
    ai: "Closed in good standing in 2022. Positive closed accounts stay on your report for up to 10 years and keep helping your history — this one ages off naturally around 2032.",
    action: "No action",
    actionDetail: "Nothing to do — it quietly helps until it ages off.",
    benefit: "—",
    confidence: "★★★★★",
    confidenceWhy: "Closed account; no available action.",
  },
];

// ---------------------------------------------------------------------------
// Report Viewer — Collections
// ---------------------------------------------------------------------------

export const collection = {
  name: "Midland Credit Management",
  original: "Synchrony Bank",
  amount: "$684",
  opened: "Aug 2024",
  fallsOff: "Feb 2031",
  status: "NEEDS ATTENTION",
  explainParagraphs: [
    "A collection means your original debt (an Amazon Store Card from Synchrony) was sold to a collection agency after going unpaid. Midland now owns it and reports it monthly, which suppresses your score.",
    "Important: don't pay it yet. You have a legal right to demand proof they own the debt and that the amount is correct — and we found a $72 mismatch between what Midland claims and the original charge-off. About 1 in 3 collections contain errors like this.",
  ],
};

// ---------------------------------------------------------------------------
// Report Viewer — Inquiries
// ---------------------------------------------------------------------------

export interface Inquiry {
  creditor: string;
  detail: string;
  pill: string;
  pillTone: Tone;
}

export const inquiries: Inquiry[] = [
  {
    creditor: "Chase Bank",
    detail: "Credit card application · Nov 2025",
    pill: "SMALL · FADING",
    pillTone: "warn",
  },
  {
    creditor: "Toyota Financial Services",
    detail: "Auto loan · Mar 2023",
    pill: "NO EFFECT",
    pillTone: "good",
  },
];

export const inquiriesNote =
  "No action needed. Inquiries stop affecting your score after 12 months and fall off after 24.";

// ---------------------------------------------------------------------------
// Report Viewer — Recommendations
// ---------------------------------------------------------------------------

export interface Recommendation {
  category: string;
  title: string;
  detail: string;
  confidence: string;
  confidenceWhy: string;
}

export const recommendations: Recommendation[] = [
  {
    category: "PAYMENT STRATEGY",
    title: "Pay Chase first, then Capital One",
    detail:
      "Highest single-card utilization first gives the fastest lift. Minimums everywhere else.",
    confidence: "★★★★★",
    confidenceWhy: "Highest utilization — unambiguous.",
  },
  {
    category: "COLLECTIONS",
    title: "Validate before paying Midland",
    detail:
      "The $72 balance mismatch is real leverage. Validation first, negotiation second, everything in writing.",
    confidence: "★★★★★",
    confidenceWhy: "Legal right + documented discrepancy.",
  },
  {
    category: "CREDIT BUILDING",
    title: "Ask, don't apply",
    detail:
      "Request a Capital One limit increase (soft pull) instead of a new card. $6,000→$9,000 drops utilization 12 points.",
    confidence: "★★★★☆",
    confidenceWhy: "Issuer discretion on approval.",
  },
  {
    category: "BUDGET",
    title: "Route $210/mo extra to cards",
    detail: "Clears the 30% goal in about 8 weeks without touching savings.",
    confidence: "★★★☆☆",
    confidenceWhy: "Depends on your monthly cash flow.",
  },
];

// ---------------------------------------------------------------------------
// Report Viewer — Letters & Scripts
// ---------------------------------------------------------------------------

export interface Script {
  label: string;
  title: string;
  sub: string;
  body: string;
}

export const scripts: Script[] = [
  {
    label: "Debt validation",
    title: "Debt Validation Letter — Midland",
    sub: "Certified mail · 30-day window",
    body: "[Your name / address / date]\n\nMidland Credit Management\nP.O. Box 939069, San Diego, CA 92193\n\nRe: Account #[number] — Request for Validation\n\nI request validation of this debt under 15 U.S.C. § 1692g (FDCPA). Please provide: (1) itemized amount and age of the debt, (2) the original creditor, (3) proof of your license to collect in my state, (4) proof you own or are authorized to collect this debt.\n\nUntil validated, cease reporting this account to the bureaus and cease collection activity as required by law. This is a request for verification, not a refusal to pay.\n\nSincerely, [Your name]",
  },
  {
    label: "Goodwill letter",
    title: "Goodwill Adjustment — Capital One",
    sub: "For the Mar 2024 late · cite your 13-month streak",
    body: "[Your name / address / date]\n\nCapital One — Executive Response Team\nP.O. Box 30285, Salt Lake City, UT 84130\n\nRe: Account ending [1234] — Goodwill adjustment request\n\nI've been a customer since 2017. In March 2024 I missed one payment due to [brief honest reason]. Since then I've made 13 consecutive on-time payments and enrolled in autopay.\n\nI respectfully request a goodwill adjustment removing the March 2024 late payment from my credit reports — the only blemish in an otherwise positive history with you.\n\nSincerely, [Your name]",
  },
  {
    label: "Phone script",
    title: "Phone Script — Collection Agency",
    sub: "Only after validation. Get everything in writing.",
    body: "BEFORE CALLING\n• Max number: $410 (60% of $684)\n• Pay by mailed check — never bank access\n\nOPEN: \"I'm calling about account [number]. I received your validation response and want to discuss resolving it.\"\n\nOFFER: \"I can resolve this today for $340 if you agree to delete the tradeline from all three bureaus.\"\n\nLADDER: start $340 → cap $410. If they refuse deletion: \"Then I need that offer in writing before I pay anything.\"\n\nNEVER SAY: \"this is my debt\" · \"I can pay next week\" · employer, bank, or income.\n\nCLOSE: \"Send the agreement in writing. I'll pay within 10 days of receiving it.\"",
  },
  {
    label: "Pay-for-delete",
    title: "Pay-for-Delete Offer — Email",
    sub: "Written settlement conditioned on removal",
    body: "Subject: Settlement offer — Account #[number]\n\nThis is an offer to settle account #[number] ($684 claimed).\n\nI offer $340 as payment in full, contingent on: (1) deletion of this tradeline from Experian, Equifax, and TransUnion upon payment; (2) the account considered settled in full, with no balance sold or transferred; (3) written confirmation of these terms before payment.\n\nThis offer does not acknowledge the debt's validity. Please respond in writing within 15 days.\n\nSincerely, [Your name]",
  },
];

// ---------------------------------------------------------------------------
// Report Viewer — Timeline
// ---------------------------------------------------------------------------

export interface TimelineEvent {
  date: string;
  title: string;
  detail: string;
  tone: Tone;
}

export const timeline: TimelineEvent[] = [
  {
    date: "APR 2026",
    title: "Report analyzed — score 642 (+14)",
    detail: "Utilization down 9 points; Discover paid down.",
    tone: "good",
  },
  {
    date: "APR 2026",
    title: "Validation letter sent to Midland",
    detail: "Certified mail · response due May 26.",
    tone: "good",
  },
  {
    date: "JAN 2026",
    title: "Report uploaded — score 628 (+17)",
    detail: "First full quarter following the plan.",
    tone: "neutral",
  },
  {
    date: "OCT 2025",
    title: "First report — score 611",
    detail: "Baseline analysis; 90-day plan created.",
    tone: "neutral",
  },
  {
    date: "AUG 2024",
    title: "Collection opened — Midland ($684)",
    detail: "Sold by Synchrony Bank after Feb 2024 delinquency.",
    tone: "bad",
  },
  {
    date: "MAR 2024",
    title: "Late payment — Capital One",
    detail: "The last late on your file. 13 clean months since.",
    tone: "bad",
  },
];

// ---------------------------------------------------------------------------
// Report Comparison
// ---------------------------------------------------------------------------

export interface CompareRow {
  metric: string;
  jan: string;
  apr: string;
  pill: string;
  pillTone: Tone;
}

export const compareRows: CompareRow[] = [
  { metric: "Credit score", jan: "628", apr: "642", pill: "▲ IMPROVED", pillTone: "good" },
  { metric: "Card utilization", jan: "81%", apr: "72%", pill: "▲ IMPROVED", pillTone: "good" },
  { metric: "Collections", jan: "1", apr: "1", pill: "VALIDATION SENT", pillTone: "neutral" },
  {
    metric: "Late payments (12 mo)",
    jan: "1",
    apr: "0",
    pill: "▲ IMPROVED",
    pillTone: "good",
  },
  { metric: "Hard inquiries", jan: "2", apr: "2", pill: "UNCHANGED", pillTone: "neutral" },
];

export const compareNote =
  "Your January-to-April change was driven almost entirely by paying Discover down and zero new lates. Keep the same pattern on Chase and the next comparison should show your biggest jump yet.";

// ---------------------------------------------------------------------------
// "Explain This" glossary (Clarity AI info panel)
// ---------------------------------------------------------------------------

export interface GlossaryEntry {
  term: string;
  what: string;
  why: string;
  action: string;
  misconception: string;
  lesson: string;
}

export const glossary: Record<string, GlossaryEntry> = {
  utilization: {
    term: "Utilization",
    what: "The share of your credit limits you're currently using — per card and overall. Yours: 72% overall, 82% on Chase Freedom.",
    why: "About 30% of your score. High utilization reads as financial stress even with perfect payments.",
    action: "Yes — pay revolving balances under 30% of each limit. Your fastest available lift.",
    misconception:
      '"Carrying a small balance builds credit" — false. Paying in full is best; utilization is measured from your statement balance.',
    lesson: "Understanding Utilization",
  },
  collection: {
    term: "Collection",
    what: "A debt your original creditor sold to a collection agency after non-payment. The agency now owns it and reports it monthly.",
    why: "One of the heaviest negative marks — it caps how high your score can climb until resolved.",
    action: "Yes — demand written validation before paying anything. ~1 in 3 contain errors.",
    misconception:
      '"Paying it instantly removes it" — paid collections still report for 7 years unless you negotiate deletion in writing.',
    lesson: "Collections, Explained",
  },
  inquiry: {
    term: "Hard Inquiry",
    what: "A lender checking your full report because you applied for credit. Yours: 2 in the last 12 months.",
    why: "Small (~3-5 points), fades within 12 months, falls off after 24.",
    action: "Rarely — only dispute inquiries you never authorized.",
    misconception:
      '"Checking my own score hurts it" — no. Self-checks are soft pulls and never affect your score.',
    lesson: "Hard Inquiries",
  },
};
