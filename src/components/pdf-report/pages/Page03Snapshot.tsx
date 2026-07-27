import { PageFooter } from "../PageFooter";
import { pillStyle, snapshotValueStyle, type PdfReportData } from "../report-data";
import { monoFontFamily } from "../fonts";

// P3 SNAPSHOT
export function Page03Snapshot({ data }: { data: PdfReportData }) {
  return (
    <section
      className="page"
      id="p3"
      data-screen-label="PDF Snapshot"
      style={{ padding: "52px 60px 40px", display: "flex", flexDirection: "column", background: "#fff" }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", color: "#0e9f77", marginBottom: 6 }}>
        CREDIT SNAPSHOT
      </div>
      <h1 style={{ fontSize: 27, letterSpacing: "-.02em", margin: "0 0 20px" }}>Your report at a glance</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 14 }}>
        {data.snapshot.map((c) => (
          <div
            key={c.label}
            style={{ border: "1px solid #e4e9f0", borderRadius: 15, padding: 20, breakInside: "avoid" }}
          >
            <div style={{ fontSize: 11, color: "#5a6b80", fontWeight: 600 }}>{c.label}</div>
            <div style={snapshotValueStyle(c.valueColor)}>{c.value}</div>
            <div style={{ fontSize: 11.5, color: "#5a6b80", marginTop: 3 }}>{c.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ border: "1px solid #e4e9f0", borderRadius: 15, padding: "20px 22px", marginBottom: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Major factors on this report</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {data.majorFactors.map((f, i) => (
            <span
              key={i}
              style={{
                ...pillStyle(f.tone),
                fontSize: 12,
                fontWeight: 600,
                padding: "7px 13px",
              }}
            >
              {f.label}
            </span>
          ))}
        </div>
      </div>

      <div style={{ border: "1px solid #e4e9f0", borderRadius: 15, padding: "20px 22px" }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Score history</div>
        {data.progBars.length === 0 ? (
          <div style={{ fontSize: 12.5, color: "#5a6b80" }}>
            No score history yet — this builds as you upload updated reports over time.
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 36, height: 130, padding: "0 8px" }}>
            {data.progBars.map((b) => (
              <div
                key={b.month}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 7,
                  height: "100%",
                  justifyContent: "flex-end",
                }}
              >
                <div style={{ fontFamily: monoFontFamily, fontWeight: 600, fontSize: 13 }}>{b.scoreLabel}</div>
                <div
                  style={{
                    width: 52,
                    borderRadius: "7px 7px 3px 3px",
                    height: `${b.heightPct}%`,
                    background: b.dashed ? "none" : b.barColor,
                    border: b.dashed ? "2px dashed #b9c8da" : "none",
                  }}
                />
                <div style={{ fontSize: 11, fontWeight: 600, color: "#5a6b80" }}>{b.month}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <PageFooter page={3} />
    </section>
  );
}
