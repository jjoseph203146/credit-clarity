import Link from "next/link";

const howSteps = [
  {
    num: "1",
    t: "Upload",
    d: "Drop in your PDF credit report from any of the three bureaus. Your file is encrypted in transit and at rest, and you can delete it at any time.",
    tag: "Takes 30 seconds",
  },
  {
    num: "2",
    t: "Analyze",
    d: "Clarity AI reads every account, balance, status, inquiry, and remark — then cross-checks for inconsistencies and possible reporting errors.",
    tag: "Under a minute",
  },
  {
    num: "3",
    t: "Understand",
    d: "You get a plain-English explanation of your score, what's helping, what's hurting, and how much each factor matters — with your free snapshot up front.",
    tag: "Free preview included",
  },
  {
    num: "4",
    t: "Improve",
    d: "A personalized 90-day roadmap, ready-to-send letters and scripts, and Clarity AI chat that knows your report. Re-upload in 90 days to track progress.",
    tag: "$5 one-time",
  },
];

// Abstract product vignettes, one per step. Each encodes what actually happens
// at that stage (a document, a parse, a score readout, a plan) rather than
// decorating the row with generic icons.

function ArtUpload() {
  return (
    <svg viewBox="0 0 160 120" className="h-[116px] w-auto" aria-hidden focusable="false">
      <defs>
        <clipPath id="cc-art-upload">
          <rect x="42" y="10" width="76" height="100" rx="10" />
        </clipPath>
      </defs>
      <rect
        x="42"
        y="10"
        width="76"
        height="100"
        rx="10"
        fill="#fff"
        stroke="#e4e9f0"
        strokeWidth="1.5"
      />
      <g clipPath="url(#cc-art-upload)">
        <rect x="42" y="10" width="76" height="15" fill="#0b1f3a" />
      </g>
      <rect x="52" y="36" width="12" height="12" rx="3" fill="#2ee6a8" />
      <rect x="70" y="39" width="36" height="6" rx="3" fill="#eef2f7" />
      <rect x="52" y="60" width="54" height="6" rx="3" fill="#eef2f7" />
      <rect x="52" y="72" width="40" height="6" rx="3" fill="#eef2f7" />
      <rect x="52" y="84" width="48" height="6" rx="3" fill="#eef2f7" />
      <circle cx="113" cy="97" r="14" fill="#0e9f77" />
      <path
        d="M113 104 V91 M108 96 L113 91 L118 96"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function ArtAnalyze() {
  return (
    <svg viewBox="0 0 160 120" className="h-[116px] w-auto" aria-hidden focusable="false">
      <rect
        x="20"
        y="18"
        width="74"
        height="86"
        rx="10"
        fill="#fff"
        stroke="#e4e9f0"
        strokeWidth="1.5"
      />
      <rect x="32" y="32" width="11" height="11" rx="3" fill="#2ee6a8" />
      <rect x="49" y="34" width="32" height="6" rx="3" fill="#eef2f7" />
      <rect x="32" y="54" width="49" height="6" rx="3" fill="#eef2f7" />
      <rect x="32" y="66" width="38" height="6" rx="3" fill="#eef2f7" />
      <rect x="32" y="78" width="44" height="6" rx="3" fill="#eef2f7" />
      {/* Parsed fields lifting out of the document. */}
      <rect x="84" y="36" width="50" height="15" rx="7.5" fill="#0e9f77" />
      <rect x="94" y="58" width="50" height="15" rx="7.5" fill="#0b1f3a" />
      <rect x="84" y="80" width="36" height="13" rx="6.5" fill="#2ee6a8" />
    </svg>
  );
}

function ArtUnderstand() {
  return (
    <svg viewBox="0 0 160 120" className="h-[116px] w-auto" aria-hidden focusable="false">
      <rect
        x="30"
        y="14"
        width="100"
        height="92"
        rx="10"
        fill="#fff"
        stroke="#e4e9f0"
        strokeWidth="1.5"
      />
      {/* Score arc — the same readout the report opens with. */}
      <path
        d="M50 66 A30 30 0 0 1 110 66"
        fill="none"
        stroke="#eef2f7"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M50 66 A30 30 0 0 1 106 51"
        fill="none"
        stroke="#0e9f77"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <rect x="44" y="80" width="32" height="6" rx="3" fill="#eef2f7" />
      <rect x="82" y="80" width="30" height="6" rx="3" fill="#2ee6a8" />
      <rect x="44" y="92" width="50" height="6" rx="3" fill="#eef2f7" />
    </svg>
  );
}

function ArtImprove() {
  return (
    <svg viewBox="0 0 160 120" className="h-[116px] w-auto" aria-hidden focusable="false">
      <rect
        x="18"
        y="16"
        width="72"
        height="88"
        rx="10"
        fill="#fff"
        stroke="#e4e9f0"
        strokeWidth="1.5"
      />
      {[34, 54, 74].map((y) => (
        <g key={y}>
          <circle cx="34" cy={y} r="6.5" fill="#2ee6a8" />
          <path
            d={`M31 ${y} l2.2 2.2 L38 ${y - 3}`}
            stroke="#0b1f3a"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <rect x="47" y={y - 3} width="32" height="6" rx="3" fill="#eef2f7" />
        </g>
      ))}
      {/* Progress after the plan is worked. */}
      <rect
        x="84"
        y="44"
        width="58"
        height="60"
        rx="10"
        fill="#fff"
        stroke="#e4e9f0"
        strokeWidth="1.5"
      />
      <rect x="96" y="80" width="9" height="14" rx="3" fill="#5bd6a9" />
      <rect x="109" y="70" width="9" height="24" rx="3" fill="#0e9f77" />
      <rect x="122" y="58" width="9" height="36" rx="3" fill="#2ee6a8" />
    </svg>
  );
}

const STEP_ART = [ArtUpload, ArtAnalyze, ArtUnderstand, ArtImprove];

/**
 * Dotted arc joining two steps. Endpoints sit on the vertical centre of the
 * illustration band; the bow alternates above/below so the row reads as one
 * continuous path rather than four disconnected columns.
 */
function FlowConnector({ dir, id }: { dir: "down" | "up"; id: string }) {
  const d =
    dir === "down" ? "M4,48 C34,92 94,92 124,48" : "M4,48 C34,4 94,4 124,48";
  return (
    <svg
      viewBox="0 0 128 96"
      width="128"
      height="96"
      aria-hidden
      focusable="false"
      className="overflow-visible"
    >
      <defs>
        <marker
          id={id}
          viewBox="0 0 8 8"
          refX="6.5"
          refY="4"
          markerWidth="5.5"
          markerHeight="5.5"
          orient="auto"
        >
          <path d="M0,0 L8,4 L0,8 z" fill="#0e9f77" fillOpacity="0.75" />
        </marker>
      </defs>
      <path
        d={d}
        fill="none"
        stroke="#0e9f77"
        strokeOpacity="0.5"
        strokeWidth="2"
        strokeDasharray="1 7"
        strokeLinecap="round"
        markerEnd={`url(#${id})`}
      />
    </svg>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="px-6 pb-24 pt-12">
      <div className="mx-auto max-w-[1180px] rounded-[28px] border border-[#eef2f7] bg-white px-8 py-14 shadow-[0_1px_2px_rgba(11,31,58,.04),0_24px_56px_-28px_rgba(11,31,58,.18)] md:px-14">
        <div className="mx-auto mb-7 h-[3px] w-10 rounded-full bg-teal" />
        <h1 className="mb-3 text-center font-display text-[44px] font-normal leading-[1.1] tracking-[-.03em] text-navy max-sm:text-[32px]">
          Upload → Analyze → Understand → Improve
        </h1>
        <p className="mx-auto mb-16 max-w-[520px] text-center text-base leading-[1.7] text-muted">
          What actually happens to your report, step by step.
        </p>

        <div className="relative">
          {/* Connectors ride above the columns; only meaningful once the row
              is actually a row, so they're hidden on stacked layouts. */}
          <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
            {(["down", "up", "down"] as const).map((dir, i) => (
              <div
                key={i}
                className="absolute top-[58px] -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${25 * (i + 1)}%` }}
              >
                <FlowConnector dir={dir} id={`cc-flow-${i}`} />
              </div>
            ))}
          </div>

          <ol className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {howSteps.map((s, i) => {
              const Art = STEP_ART[i];
              return (
                <li key={s.num} className="flex h-full flex-col items-center text-center">
                  <div className="flex h-[116px] items-center justify-center">
                    <Art />
                  </div>
                  <div className="mt-7 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy font-mono text-[12px] font-semibold text-white">
                      {s.num}
                    </span>
                    <span className="text-xl font-bold tracking-[-.01em]">{s.t}</span>
                  </div>
                  <p className="mt-2.5 max-w-[280px] text-[14.5px] leading-[1.7] text-muted">
                    {s.d}
                  </p>
                  {/* mt-auto keeps the pills on one baseline even though the
                      descriptions run to different lengths. */}
                  <div className="mt-auto pt-4">
                    <span className="inline-block rounded-full bg-[#e6f5ef] px-3 py-[5px] text-[12.5px] font-semibold text-teal-deep">
                      {s.tag}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/upload"
            className="group relative isolate inline-block overflow-hidden rounded-full bg-navy px-7 py-[15px] text-base font-semibold text-white shadow-[0_1px_2px_rgba(11,31,58,.20),0_10px_24px_-6px_rgba(11,31,58,.35)] transition-transform duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            <span
              aria-hidden
              className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 group-active:opacity-100 motion-reduce:transition-none"
              style={{ backgroundImage: "var(--grad-teal)" }}
            />
            Analyze My Credit Report
          </Link>
        </div>
      </div>
    </div>
  );
}
