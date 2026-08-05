const MONO = "font-[family-name:var(--font-jetbrains-mono)]";

const icons: Record<string, React.ReactNode> = {
  lock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
      <rect x="4" y="11" width="16" height="10" rx="2.5" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  ),
  trash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
      <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14" />
    </svg>
  ),
  file: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
      <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6z" />
    </svg>
  ),
  card: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3 10h18" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.5 2.5 4.5-5" />
    </svg>
  ),
};

const securityItems = [
  {
    ic: "lock",
    t: "Encrypted everywhere",
    d: "Your report is encrypted while it's uploaded and while it's stored. We never use your documents to train AI models.",
    tech: "TLS 1.3 in transit · AES-256 at rest",
  },
  {
    ic: "trash",
    t: "Delete anytime",
    d: "Delete your account and permanently remove your reports, analysis, and chat history whenever you choose.",
  },
  {
    ic: "file",
    t: "No credit pull. No SSN.",
    d: "We never check your credit and never ask for your Social Security number. You simply upload a report you already have.",
  },
  {
    ic: "shield",
    t: "Built for privacy",
    d: "Your information is isolated to your account. Other users cannot access your reports or analysis.",
    tech: "Powered by database-level row-level security",
  },
  {
    ic: "card",
    t: "Secure payments",
    d: "Payments are processed securely by Stripe. Your card information never passes through our servers.",
  },
  {
    ic: "check",
    t: "Your data stays yours",
    d: "We don't sell your data, share your reports with third parties, or use your uploads for advertising. Your report is used only to generate the analysis you requested.",
  },
];

const faqs = [
  {
    q: "Who can see my report?",
    a: "Only you. Credit Clarity analyzes your uploaded report and does not share it with other users.",
  },
  {
    q: "Do you pull my credit?",
    a: "No. You upload a report you already have.",
  },
  {
    q: "Can I delete my data?",
    a: "Yes. You can permanently delete your account and associated data from your settings.",
  },
];

export default function SecurityPage() {
  return (
    <div className="mx-auto max-w-[880px] px-8 pb-24 pt-[72px]">
      <div className="mb-3 text-center text-[12.5px] font-bold tracking-[.12em] text-teal">
        QUESTIONS ABOUT SECURITY?
      </div>
      <h1 className="mb-3 text-center text-[40px] tracking-[-.03em]">
        Your report. Your control.
      </h1>
      <p className="mx-auto mb-12 max-w-[620px] text-center text-base leading-relaxed text-muted">
        We&apos;ve built Credit Clarity with the same principles you expect from modern
        financial software: encryption, least-privilege access, and user-controlled data
        deletion.
      </p>
      <div className="grid grid-cols-2 gap-[18px] max-md:grid-cols-1">
        {securityItems.map((s) => (
          <div key={s.t} className="flex flex-col rounded-2xl border border-border bg-white p-6">
            <div className="mb-3.5 flex h-9 w-9 items-center justify-center rounded-[11px] bg-navy text-mint-light">
              {icons[s.ic]}
            </div>
            <div className="mb-1.5 text-base font-bold">{s.t}</div>
            <div className="text-sm leading-relaxed text-muted">{s.d}</div>
            {s.tech && (
              <div className={`mt-3 border-t border-border pt-2.5 text-[11.5px] text-[#8fa3ba] ${MONO}`}>
                {s.tech}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-16">
        <h2 className="mb-6 text-center text-[26px] tracking-[-.02em]">
          Before you upload
        </h2>
        <div className="mx-auto max-w-[620px]">
          {faqs.map((f) => (
            <div key={f.q} className="border-b border-border py-5 first:border-t">
              <div className="mb-1.5 text-[15px] font-bold">{f.q}</div>
              <div className="text-sm leading-relaxed text-muted">{f.a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
