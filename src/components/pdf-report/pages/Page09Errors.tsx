import { PageFooter } from "../PageFooter";
import { severityStyle, type PdfReportData } from "../report-data";

// P9 POTENTIAL ERRORS
export function Page09Errors({ data }: { data: PdfReportData }) {
  return (
    <section
      className="page"
      id="p9"
      data-screen-label="PDF Errors"
      style={{ padding: "52px 60px 40px", display: "flex", flexDirection: "column", background: "#fff" }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", color: "#0e9f77", marginBottom: 6 }}>
        POTENTIAL ERRORS
      </div>
      <h1 style={{ fontSize: 27, letterSpacing: "-.02em", margin: "0 0 8px" }}>
        Items worth reviewing for accuracy
      </h1>
      <p style={{ fontSize: 13, lineHeight: 1.7, margin: "0 0 16px", color: "#3d5068", textWrap: "pretty" }}>
        We&apos;re not telling you to dispute anything — only you know your true history. Nothing
        was automatically flagged as inconsistent on this report, but verifying the details below
        against your own records costs nothing. If you find something that&apos;s wrong, the
        dispute template on page 12 is ready.
      </p>

      {data.errRows.length === 0 ? (
        <div style={{ border: "1px solid #e4e9f0", borderRadius: 15, padding: "18px 20px", fontSize: 13, color: "#5a6b80" }}>
          No specific inconsistencies were automatically detected on this report.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {data.errRows.map((e) => (
            <div key={e.title} style={{ border: "1px solid #e4e9f0", borderRadius: 15, padding: "16px 20px", breakInside: "avoid" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{e.title}</span>
                <span style={severityStyle(e.severe)}>{e.sevLabel}</span>
              </div>
              <div style={{ fontSize: 12.5, color: "#3d5068", lineHeight: 1.6, marginBottom: 8 }}>{e.desc}</div>
              <div style={{ fontSize: 12, color: "#0b7d5e", fontWeight: 600 }}>→ {e.check}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 14, background: "#f8fafc", borderRadius: 14, padding: "16px 20px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", color: "#5a6b80", marginBottom: 8 }}>
          WHAT TO WATCH FOR ON ANY REPORT
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 20px", fontSize: 12, color: "#3d5068" }}>
          <div>· Duplicate accounts (same debt listed twice)</div>
          <div>· Addresses you never lived at</div>
          <div>· Status inconsistencies between sections</div>
          <div>· Inquiries you don&apos;t recognize</div>
          <div>· Balances that don&apos;t match your statements</div>
          <div>· Accounts that belong to someone else</div>
        </div>
      </div>

      <PageFooter page={9} />
    </section>
  );
}
