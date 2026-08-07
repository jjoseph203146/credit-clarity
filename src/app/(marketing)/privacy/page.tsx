import { siteConfig } from "@/lib/site-config";

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
      "Payment metadata from Stripe (e.g. that a charge succeeded, and Stripe's identifiers for it) — we do not receive or store your card number.",
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
    h: "Who we share it with",
    body: [
      "We do not sell your data, share it for marketing, or add you to third-party mailing lists. We share it only with the service providers below, only as needed to run the product:",
      "Supabase — database, authentication, and encrypted file storage. Your report and account data are stored here.",
      "Anthropic (Claude) — the AI model that generates your analysis, action plan, and Clarity AI chat responses. To produce your analysis we send the parsed contents of your credit report (accounts, balances, statuses, collections, inquiries) to Anthropic's API. Anthropic does not train its models on data submitted through its API.",
      "Stripe — payment processing. Stripe receives your payment details directly; we receive only the confirmation and identifiers.",
      "We may also disclose data where legally required, or to protect the rights and safety of our users.",
    ],
  },
  {
    h: "How your data is protected",
    body: [
      "All data is encrypted in transit with TLS, and encrypted at rest by our infrastructure provider, Supabase.",
      "Access is enforced with row-level security at the database layer, scoped to your account — not just at the application layer.",
      "Your report and its parsed data are not used to train AI models: analysis runs on Anthropic's Claude API, which under Anthropic's commercial terms does not train on data submitted through it.",
      "Card details are handled entirely by Stripe and never touch our servers.",
    ],
  },
  {
    h: "How your data is used",
    body: [
      "To generate your free preview, your paid Credit Clarity analysis, your 90-day action plan, and responses in the Clarity AI chat.",
      "To send you account-related notifications (e.g. deadlines, task reminders) that you can manage in Settings.",
    ],
  },
  {
    h: "How long we keep it",
    body: [
      "Reports attached to your account are kept until you delete them, or until you delete your account. We do not expire them on our own.",
      `If you upload a report but never create an account, that upload is not attached to anyone — we automatically and permanently delete it, along with the stored file, within ${siteConfig.anonymousRetentionHours} hours.`,
      "Payment records are retained as required for accounting and tax purposes even after an associated report is deleted. These contain no card details.",
    ],
  },
  {
    h: "Your right to delete",
    body: [
      "You can permanently delete an individual report, or your entire account, at any time from Settings.",
      "Deletion is immediate and permanent: the database rows and the stored PDF are hard-deleted, not flagged or archived. We do not keep a soft-deleted copy, and there is no grace period during which we can restore it for you.",
      "Deleting your account also deletes your reports, action plans, chat history, and learning progress.",
    ],
  },
  {
    h: "Your rights",
    body: [
      "Depending on where you live, you may have the right to access, correct, export, or delete the personal data we hold about you, and to object to certain processing.",
      "Access, export, and deletion are available directly in Settings. For anything else, email us and we will respond within the timeframe your local law requires.",
      "We do not sell personal information, and we do not share it for cross-context behavioral advertising.",
    ],
  },
  {
    h: "Cookies",
    body: [
      "We use only the cookies required to keep you signed in and to keep your session secure. We do not use advertising or cross-site tracking cookies.",
    ],
  },
  {
    h: "Children",
    body: [
      "Credit Clarity is not intended for anyone under 18, and we do not knowingly collect data from children. If you believe a child has given us data, email us and we will delete it.",
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
    h: "Changes to this policy",
    body: [
      "If we change how we handle your data in a material way, we will update this page and revise the date above. Continued use after a change means you accept the updated policy.",
    ],
  },
  {
    h: "Contact us",
    body: [
      `Questions about this policy or your data? Email ${siteConfig.privacyEmail}.`,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-[760px] px-8 pb-24 pt-[72px]">
      <h1 className="mb-3 text-[36px] tracking-[-.03em]">Privacy Policy</h1>
      <p className="mb-10 text-sm text-muted">Last updated: August 7, 2026</p>
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
