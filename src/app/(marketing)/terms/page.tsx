export const metadata = {
  title: "Terms of Service — Credit Clarity",
};

const sections = [
  {
    h: "1. The service",
    body: [
      "Credit Clarity is an educational tool that helps you understand a credit report you already have. You upload a PDF, we parse it, and — after a one-time payment — provide an AI-generated analysis, a 90-day action plan, and access to Clarity AI chat.",
      "Credit Clarity is not credit repair. We do not remove accurate information from your credit file, dispute items on your behalf, or guarantee any change to your credit score. Any dispute letters or scripts we generate are templates for your own use, not action taken by us.",
      "The \"Credit Clarity Score\" shown in the app is an educational estimate only. It is not a FICO® score, not a VantageScore® score, and is not used by lenders.",
    ],
  },
  {
    h: "2. No credit pull, no SSN",
    body: [
      "We never perform a credit pull, soft inquiry, or hard inquiry. You are responsible for obtaining your own credit report (e.g. from annualcreditreport.com or your bureau/lender) and uploading it.",
      "We do not request or store your Social Security number.",
    ],
  },
  {
    h: "3. Accounts and eligibility",
    body: [
      "You must be at least 18 years old and able to form a binding contract to use Credit Clarity.",
      "You are responsible for keeping your account credentials secure and for all activity under your account.",
    ],
  },
  {
    h: "4. Payment",
    body: [
      "The paid analysis is a one-time fee processed by Stripe. Card details are handled entirely by Stripe and never stored on our servers.",
      "Refund requests are handled case by case — contact us using the details below.",
    ],
  },
  {
    h: "5. Your data and your right to delete",
    body: [
      "You own the data you upload. You may permanently delete any report or your entire account at any time from Settings, with no retention period afterward.",
      "See our Privacy Policy for the full detail on what we collect, how it's protected, and how deletion works.",
    ],
  },
  {
    h: "6. Disclaimers",
    body: [
      "Credit Clarity provides educational information generated in part by an AI model. It is not legal, financial, tax, or credit repair advice, and should not be relied on as a substitute for advice from a qualified professional.",
      "We make no guarantee about the accuracy of parsed data or AI-generated analysis, or about any change to your credit score, loan approval odds, or financial outcomes.",
      "The service is provided \"as is\" without warranties of any kind, to the maximum extent permitted by law.",
    ],
  },
  {
    h: "7. Changes to these terms",
    body: [
      "We may update these terms from time to time. Continued use of Credit Clarity after a change constitutes acceptance of the updated terms.",
    ],
  },
  {
    h: "8. Contact us",
    body: ["Questions about these terms? Email legal@creditclarity.example."],
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-[760px] px-8 pb-24 pt-[72px]">
      <h1 className="mb-3 text-[36px] tracking-[-.03em]">Terms of Service</h1>
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
