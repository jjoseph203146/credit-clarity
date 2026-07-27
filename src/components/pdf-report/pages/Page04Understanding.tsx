import { PageFooter } from "../PageFooter";
import { factorLabelStyle, type PdfReportData } from "../report-data";

// P4 UNDERSTANDING
export function Page04Understanding({ data }: { data: PdfReportData }) {
  return (
    <section
      className="page"
      id="p4"
      data-screen-label="PDF Understanding Score"
      style={{ padding: "52px 60px 40px", display: "flex", flexDirection: "column", background: "#fff" }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", color: "#0e9f77", marginBottom: 6 }}>
        UNDERSTANDING YOUR SCORE
      </div>
      <h1 style={{ fontSize: 27, letterSpacing: "-.02em", margin: "0 0 20px" }}>What&apos;s helping, what&apos;s hurting</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div style={{ background: "#f4f8f6", borderRadius: 15, padding: "20px 22px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", color: "#0b7d5e", marginBottom: 12 }}>
            ✓ WHAT IS HELPING
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 12.5, lineHeight: 1.55 }}>
            {data.helpingFactors.map((f, i) => (
              <div key={i}>
                <strong>{f.title}</strong> {f.detail}
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: "#fdf6f6", borderRadius: 15, padding: "20px 22px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", color: "#a33232", marginBottom: 12 }}>
            ✕ WHAT IS HURTING
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 12.5, lineHeight: 1.55 }}>
            {data.hurtingFactors.map((f, i) => (
              <div key={i}>
                <strong>{f.title}</strong> {f.detail}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ border: "2px solid #0e9f77", borderRadius: 15, padding: "20px 22px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", color: "#0b7d5e", marginBottom: 8 }}>
          ★ MOST IMPACTFUL FACTOR
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.65, textWrap: "pretty" }}>
          <strong>{data.mostImpactfulFactor.title}</strong> {data.mostImpactfulFactor.detail}
        </div>
      </div>

      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 9 }}>
        {data.factors.map((f) => (
          <div
            key={f.label}
            style={{
              display: "grid",
              gridTemplateColumns: "150px 1fr 120px",
              gap: 14,
              alignItems: "center",
              breakInside: "avoid",
            }}
          >
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>{f.label}</div>
            <div style={{ height: 8, background: "#eef2f7", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ width: `${f.barPct}%`, height: "100%", background: f.barColor, borderRadius: 999 }} />
            </div>
            <div style={factorLabelStyle(f.tagColor)}>{f.tag}</div>
          </div>
        ))}
      </div>

      <PageFooter page={4} />
    </section>
  );
}
