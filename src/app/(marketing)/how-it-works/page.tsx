import Link from "next/link";

const howSteps = [
  {
    num: "1",
    t: "Upload",
    d: "Drop in your PDF credit report from any of the three bureaus. Your file is encrypted in transit and at rest, and you can delete it at any time.",
    tag: "Takes 30 seconds",
    line: true,
  },
  {
    num: "2",
    t: "Analyze",
    d: "Clarity AI reads every account, balance, status, inquiry, and remark — then cross-checks for inconsistencies and possible reporting errors.",
    tag: "Under a minute",
    line: true,
  },
  {
    num: "3",
    t: "Understand",
    d: "You get a plain-English explanation of your score, what's helping, what's hurting, and how much each factor matters — with your free snapshot up front.",
    tag: "Free preview included",
    line: true,
  },
  {
    num: "4",
    t: "Improve",
    d: "A personalized 90-day roadmap, ready-to-send letters and scripts, and Clarity AI chat that knows your report. Re-upload in 90 days to track progress.",
    tag: "$5 one-time",
    line: false,
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-[880px] px-8 pb-24 pt-[72px]">
      <h1 className="mb-3 text-center text-[40px] tracking-[-.03em]">
        Upload → Analyze → Understand → Improve
      </h1>
      <p className="mb-[52px] text-center text-base text-muted">
        What actually happens to your report, step by step.
      </p>
      <div className="flex flex-col">
        {howSteps.map((s) => (
          <div key={s.num} className="grid grid-cols-[64px_1fr] gap-6">
            <div className="flex flex-col items-center">
              <div className="flex h-11 w-11 flex-none items-center justify-center rounded-[14px] bg-gradient-to-br from-navy to-blue text-base font-bold text-white">
                {s.num}
              </div>
              {s.line && <div className="my-2 w-0.5 flex-1 bg-[#dbe3ec]" />}
            </div>
            <div className="pb-10">
              <div className="mb-1.5 text-xl font-bold tracking-[-.01em]">{s.t}</div>
              <div className="max-w-[560px] text-[15px] leading-relaxed text-muted">
                {s.d}
              </div>
              <div className="mt-3 inline-block rounded-full bg-[#e6f5ef] px-3 py-[5px] text-[12.5px] font-semibold text-teal-deep">
                {s.tag}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-center">
        <Link
          href="/upload"
          className="inline-block rounded-xl bg-navy px-7 py-[15px] text-base font-semibold text-white transition-colors hover:bg-[#123152]"
        >
          Analyze My Credit Report
        </Link>
      </div>
    </div>
  );
}
