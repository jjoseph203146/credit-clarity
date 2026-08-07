import { siteConfig } from "@/lib/site-config";

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
    h: "4. Payment and refunds",
    body: [
      "The paid analysis is a one-time $5 fee processed by Stripe. It is not a subscription and does not renew. Card details are handled entirely by Stripe and never stored on our servers.",
      "If the analysis is not useful to you, email us within 7 days of your payment and we will refund it in full. Refunds are returned to the original payment method and typically appear within 5-10 business days, depending on your bank.",
      "Requesting a refund does not automatically delete your report or analysis — you can delete those yourself at any time from Settings.",
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
    h: "7. Acceptable use",
    body: [
      "Upload only a credit report that is yours. Do not upload another person's report, or any document you do not have the right to share with us.",
      "Do not attempt to disrupt, overload, reverse engineer, or gain unauthorized access to the service or to other users' data.",
      "Do not use the service to attempt to manipulate the AI into producing output that violates these terms.",
      "We may suspend or terminate an account that violates these terms, or where required by law.",
    ],
  },
  {
    h: "8. Limitation of liability",
    body: [
      "To the maximum extent permitted by law, our total liability arising out of or relating to the service is limited to the amount you paid us in the twelve months preceding the claim.",
      "We are not liable for indirect, incidental, special, consequential, or punitive damages, including lost profits, lost data, or financial outcomes such as a declined loan or a change in your credit score.",
      "Some jurisdictions do not allow these limitations, in which case they apply to the fullest extent permitted there.",
    ],
  },
  {
    h: "9. Governing law",
    body: [
      `These terms are governed by the laws of ${siteConfig.governingLaw}, without regard to its conflict-of-laws rules. The courts located there have exclusive jurisdiction over any dispute arising from these terms or the service.`,
    ],
  },
  {
    h: "10. Changes to these terms",
    body: [
      "We may update these terms from time to time. Continued use of Credit Clarity after a change constitutes acceptance of the updated terms.",
    ],
  },
  {
    h: "11. Contact us",
    body: [
      `These terms are between you and ${siteConfig.legalEntity}, which operates Credit Clarity.`,
      `Questions about these terms? Email ${siteConfig.legalEmail}.`,
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-[760px] px-8 pb-24 pt-[72px]">
      <h1 className="mb-3 text-[36px] tracking-[-.03em]">Terms of Service</h1>
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
