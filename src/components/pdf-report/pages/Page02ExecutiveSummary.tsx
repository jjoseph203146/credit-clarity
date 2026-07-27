import { PageFooter } from "../PageFooter";
import type { PdfReportData } from "../report-data";

// P2 EXEC SUMMARY
export function Page02ExecutiveSummary({ data }: { data: PdfReportData }) {
  return (
    <section
      className="page"
      id="p2"
      data-screen-label="PDF Executive Summary"
      style={{ padding: "52px 60px 40px", display: "flex", flexDirection: "column", background: "#fff" }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", color: "#0e9f77", marginBottom: 6 }}>
        EXECUTIVE SUMMARY
      </div>
      <h1 style={{ fontSize: 27, letterSpacing: "-.02em", margin: "0 0 6px" }}>
        If you only read one page, read this.
      </h1>
      <p style={{ fontSize: 13.5, lineHeight: 1.7, margin: "12px 0 18px", textWrap: "pretty" }}>
        {data.executiveSummary}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div style={{ background: "#f4f8f6", borderRadius: 14, padding: "18px 20px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", color: "#0b7d5e", marginBottom: 10 }}>
            YOUR TOP {data.topPriorities.length} PRIORIT{data.topPriorities.length === 1 ? "Y" : "IES"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13, lineHeight: 1.5 }}>
            {data.topPriorities.map((p, i) => (
              <div key={i} style={{ display: "flex", gap: 10 }}>
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 7,
                    background: "#0b1f3a",
                    color: "#5bd6a9",
                    fontSize: 11,
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "none",
                  }}
                >
                  {i + 1}
                </span>
                <span>{p}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: "#e6f5ef", borderRadius: 14, padding: "16px 20px", flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", color: "#0b7d5e", marginBottom: 6 }}>
              BIGGEST OPPORTUNITY
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.55 }}>{data.biggestOpportunity}</div>
          </div>
          <div style={{ background: "#fdf1f1", borderRadius: 14, padding: "16px 20px", flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", color: "#a33232", marginBottom: 6 }}>
              BIGGEST RISK
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.55 }}>{data.biggestRisk}</div>
          </div>
        </div>
      </div>

      <div style={{ background: "#0b1f3a", color: "#fff", borderRadius: 14, padding: "18px 22px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", color: "#5bd6a9", marginBottom: 6 }}>
          90-DAY OUTLOOK
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.6, color: "#d6e1ee" }}>{data.ninetyDayOutlook}</div>
      </div>

      <PageFooter page={2} />
    </section>
  );
}
