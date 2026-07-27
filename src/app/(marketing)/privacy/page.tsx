export const metadata = {
  title: "Privacy Policy — Credit Clarity",
};

const sections = [
  {
    h: "What we collect",
    body: [
      "The credit report file you upload (PDF), and the data our parser extracts from it: bureau, credit score, accounts, balances, credit limits, payment history, collections, and inquiries.",
      "Account information: your name, email address, and (after signup) authentication credentials managed by our auth provider, Supabase.",
      "Goal-questionnaire answers (e.g. your financial goal, timeline, and challenges) used to personalize your action plan.",
      "Payment metadata from Stripe (e.g. that a charge succeeded) — we do not receive or store your card number.",
      "Basic usage data (pages visited, actions taken) to keep the product working and to fix bugs.",
    ],
  },
  {
    h: "What we never collect",
    body: [
      "We do not perform a credit pull or soft/hard inquiry of any kind — you upload a report you already have.",
      "We do not ask for or store your Social Security number.",
    ],
  },
  {
    h: "How your data is protected",
    body: [
      "All data is encrypted in transit (TLS 1.3) and at rest (AES-256).",
      "Access is enforced with row-level security at the database layer, scoped to your account — not just at the application layer.",
      "Your report and its parsed data are never used to train AI models.",
      "Card details are handled entirely by Stripe and never touch our servers.",
    ],
  },
  {
    h: "How your data is used",
    body: [
      "To generate your free preview, your paid Credit Clarity analysis, your 90-day action plan, and responses in the Clarity AI chat.",
      "To send you account-related notifications (e.g. deadlines, task reminders) that you can manage in Settings.",
      "We do not sell your data, share it with third parties for marketing, or add you to third-party mailing lists.",
    ],
  },
  {
    h: "Your right to delete",
    body: [
      "You can permanently delete an individual report, or your entire account, at any time from Settings.",
      "Deletion is immediate and permanent — there is no retention period, backup window, or \"soft delete\" state we hold your data in afterward.",
    ],
  },
  {
    h: "Not credit repair",
    body: [
      "Credit Clarity is an educational service. We do not repair credit, remove accurate information from your credit file, dispute items on your behalf, or guarantee any change to your score.",
      "The Credit Clarity Score shown in the app is educational only and is not a FICO® or VantageScore® credit score.",
    ],
  },
  {
    h: "Contact us",
    body: [
      "Questions about this policy or your data? Email privacy@creditclarity.example.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-[760px] px-8 pb-24 pt-[72px]">
      <h1 className="mb-3 text-[36px] tracking-[-.03em]">Privacy Policy</h1>
      <p className="mb-10 text-sm text-muted">Last updated: July 26, 2026</p>
      <div className="flex flex-col gap-8">
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="mb-2.5 text-lg font-bold tracking-[-.01em]">{s.h}</h2>
            <ul className="flex flex-col gap-2">
              {s.body.map((line, i) => (
                <li key={i} className="text-sm leading-relaxed text-muted">
                  {line}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
