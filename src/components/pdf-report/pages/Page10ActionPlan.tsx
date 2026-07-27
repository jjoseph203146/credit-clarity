import { PageFooter } from "../PageFooter";
import type { PdfReportData } from "../report-data";

// P10 90-DAY PLAN
export function Page10ActionPlan({ data }: { data: PdfReportData }) {
  const hasTasks = data.planMonths.some((m) => m.items.length > 0);
  return (
    <section
      className="page"
      id="p10"
      data-screen-label="PDF Action Plan"
      style={{ padding: "52px 60px 40px", display: "flex", flexDirection: "column", background: "#fff" }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", color: "#0e9f77", marginBottom: 6 }}>
        YOUR 90-DAY ACTION PLAN
      </div>
      <h1 style={{ fontSize: 27, letterSpacing: "-.02em", margin: "0 0 16px" }}>Check these off as you go</h1>

      {!hasTasks ? (
        <div style={{ border: "1px solid #e4e9f0", borderRadius: 15, padding: "20px 22px", fontSize: 13, color: "#5a6b80" }}>
          Your personalized 90-day plan will appear here once Clarity AI finishes analyzing your
          report.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {data.planMonths.map((m) => (
            <div key={m.title} style={{ border: "1px solid #e4e9f0", borderRadius: 15, padding: "16px 18px", breakInside: "avoid" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", color: "#0b1f3a", marginBottom: 3 }}>
                {m.title}
              </div>
              <div style={{ fontSize: 11, color: "#8fa3ba", marginBottom: 12 }}>{m.sub}</div>
              {m.items.length === 0 ? (
                <div style={{ fontSize: 11.5, color: "#8fa3ba" }}>No tasks for this month.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {m.items.map((i, idx) => (
                    <div key={idx} style={{ breakInside: "avoid" }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <span
                          style={{
                            width: 13,
                            height: 13,
                            border: "1.5px solid #b9c8da",
                            borderRadius: 4,
                            flex: "none",
                            marginTop: 2,
                          }}
                        />
                        <span style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.4 }}>{i.title}</span>
                      </div>
                      {i.desc && (
                        <div style={{ fontSize: 10.5, color: "#8fa3ba", margin: "2px 0 0 21px", lineHeight: 1.45 }}>
                          {i.desc}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 14, background: "#0b1f3a", color: "#fff", borderRadius: 14, padding: "16px 20px", fontSize: 12.5, lineHeight: 1.6 }}>
        <strong style={{ color: "#5bd6a9" }}>The one rule that matters most:</strong> no new
        credit applications for the next 90 days. Every other action on this page works
        better when nothing new hits your file.
      </div>

      <PageFooter page={10} />
    </section>
  );
}
