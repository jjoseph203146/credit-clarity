const securityItems = [
  {
    ic: "AES",
    t: "Encrypted everywhere",
    d: "TLS 1.3 in transit, AES-256 at rest. Your report is never stored unencrypted, and never used to train AI models.",
  },
  {
    ic: "⌫",
    t: "Delete anytime",
    d: 'One click permanently removes your reports, analysis, and account. No retention period, no "soft delete."',
  },
  {
    ic: "∅",
    t: "No credit pull, no SSN",
    d: "We never touch your credit file. You upload a report you already have — we don't ask for your Social Security number.",
  },
  {
    ic: "RLS",
    t: "Isolated by design",
    d: "Row-level security means your data is technically inaccessible to other users — enforced at the database layer, not just the app.",
  },
  {
    ic: "$",
    t: "Payments by Stripe",
    d: "Card details go directly to Stripe and never touch our servers. We see only that a payment succeeded.",
  },
  {
    ic: "✓",
    t: "You stay in control",
    d: "No data sold, no marketing lists, no third-party sharing. Your report exists for one purpose: your analysis.",
  },
];

export default function SecurityPage() {
  return (
    <div className="mx-auto max-w-[880px] px-8 pb-24 pt-[72px]">
      <h1 className="mb-3 text-center text-[40px] tracking-[-.03em]">
        Your report. Your control.
      </h1>
      <p className="mx-auto mb-12 max-w-[560px] text-center text-base text-muted">
        Credit reports are among the most sensitive documents you own. Here is exactly how
        we treat them.
      </p>
      <div className="grid grid-cols-2 gap-[18px] max-md:grid-cols-1">
        {securityItems.map((s) => (
          <div key={s.t} className="rounded-2xl border border-border bg-white p-6">
            <div className="mb-3.5 flex h-9 w-9 items-center justify-center rounded-[11px] bg-navy text-sm font-bold text-mint-light">
              {s.ic}
            </div>
            <div className="mb-1.5 text-base font-bold">{s.t}</div>
            <div className="text-sm leading-relaxed text-muted">{s.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
