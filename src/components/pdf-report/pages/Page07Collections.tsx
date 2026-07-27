import { PageFooter } from "../PageFooter";
import { pillStyle, type PdfReportData } from "../report-data";

// P7 COLLECTIONS
export function Page07Collections({ data }: { data: PdfReportData }) {
  return (
    <section
      className="page"
      id="p7"
      data-screen-label="PDF Collections"
      style={{ padding: "52px 60px 40px", display: "flex", flexDirection: "column", background: "#fff" }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", color: "#0e9f77", marginBottom: 6 }}>
        COLLECTIONS
      </div>
      <h1 style={{ fontSize: 27, letterSpacing: "-.02em", margin: "0 0 18px" }}>{data.collectionsHeadline}</h1>

      {data.collectionsData.length === 0 && (
        <div style={{ border: "1px solid #e4e9f0", borderRadius: 15, padding: "20px 22px", fontSize: 13, color: "#5a6b80" }}>
          No collections on this report — nice work.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {data.collectionsData.map((c) => (
          <div key={c.id} style={{ border: "1px solid #f0d4d4", borderRadius: 15, padding: "20px 22px", breakInside: "avoid" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>
                {c.agencyName} — {c.amountLabel}
              </div>
              <span style={pillStyle(c.pillTone)}>{c.pillLabel}</span>
            </div>
            <div style={{ display: "flex", gap: 24, fontSize: 11.5, marginBottom: 12, flexWrap: "wrap" }}>
              <span>
                <span style={{ color: "#8fa3ba", fontWeight: 600 }}>Original creditor</span> <strong>{c.originalCreditor}</strong>
              </span>
              <span>
                <span style={{ color: "#8fa3ba", fontWeight: 600 }}>Opened</span> <strong>{c.openedLabel}</strong>
              </span>
              <span>
                <span style={{ color: "#8fa3ba", fontWeight: 600 }}>First delinquency</span> <strong>{c.firstDelinquencyLabel}</strong>
              </span>
              <span>
                <span style={{ color: "#8fa3ba", fontWeight: 600 }}>Falls off</span> <strong>{c.fallsOffLabel}</strong>
              </span>
            </div>
            <div style={{ fontSize: 12.5, lineHeight: 1.65, color: "#3d5068", marginBottom: 12 }}>
              <strong>Why it matters:</strong> an open collection is one of the heaviest marks a
              report can carry — it caps your ceiling regardless of other progress. Before paying
              anything, you have a legal right to demand written validation of the debt.
            </div>
            <div style={{ background: "#f4f8f6", borderRadius: 13, padding: "16px 18px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", color: "#0e9f77", marginBottom: 8 }}>
                CLARITY AI ANALYSIS &amp; SAMPLE VALIDATION LETTER
              </div>
              {c.aiSummary ? (
                <div style={{ fontSize: 11.5, lineHeight: 1.7, color: "#3d5068", whiteSpace: "pre-line" }}>
                  {c.aiSummary}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: "#8fa3ba", fontStyle: "italic" }}>
                  Not yet analyzed — this will populate automatically once Clarity AI finishes
                  analyzing your report.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <PageFooter page={7} />
    </section>
  );
}
