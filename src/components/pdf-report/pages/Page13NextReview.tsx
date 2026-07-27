import { PageFooter } from "../PageFooter";
import type { PdfReportData } from "../report-data";

// P13 LEARNING + NEXT REVIEW
export function Page13NextReview({ data }: { data: PdfReportData }) {
  return (
    <section
      className="page"
      id="p13"
      data-screen-label="PDF Next Steps"
      style={{ padding: "52px 60px 40px", display: "flex", flexDirection: "column", background: "#fff" }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", color: "#0e9f77", marginBottom: 6 }}>
        LEARNING PLAN &amp; NEXT REVIEW
      </div>
      <h1 style={{ fontSize: 27, letterSpacing: "-.02em", margin: "0 0 16px" }}>What to understand next</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div style={{ border: "1px solid #e4e9f0", borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: "#0b7d5e", marginBottom: 6 }}>LESSON 1 · 4 MIN</div>
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 4 }}>Credit Utilization</div>
          <div style={{ fontSize: 11.5, color: "#5a6b80", lineHeight: 1.55 }}>
            Your #1 factor. Per-card vs. overall, and statement-timing tricks.
          </div>
        </div>
        <div style={{ border: "1px solid #e4e9f0", borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: "#0b7d5e", marginBottom: 6 }}>LESSON 2 · 6 MIN</div>
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 4 }}>Collections</div>
          <div style={{ fontSize: 11.5, color: "#5a6b80", lineHeight: 1.55 }}>
            Your FDCPA rights, validation, and pay-for-delete — before you talk to a
            collection agency.
          </div>
        </div>
        <div style={{ border: "1px solid #e4e9f0", borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: "#0b7d5e", marginBottom: 6 }}>LESSON 3 · 5 MIN</div>
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 4 }}>Payment History</div>
          <div style={{ fontWeight: 400, fontSize: 11.5, color: "#5a6b80", lineHeight: 1.55 }}>
            How lates age off, and when goodwill letters actually work.
          </div>
        </div>
      </div>

      <div style={{ background: "linear-gradient(160deg,#0b1f3a,#134066)", color: "#fff", borderRadius: 16, padding: "24px 26px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em", color: "#5bd6a9", marginBottom: 8 }}>
          NEXT REVIEW — AROUND {data.nextReviewLabel.toUpperCase()}
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.6, color: "#d6e1ee", marginBottom: 16 }}>
          Upload a new report in approximately 90 days. Clarity AI will compare it against
          this one and show you exactly what moved.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "9px 20px" }}>
          <div style={{ display: "flex", gap: 9, alignItems: "center", fontSize: 12.5 }}>
            <span style={{ width: 14, height: 14, border: "1.5px solid #5bd6a9", borderRadius: 4, flex: "none" }} />
            Lower utilization below 30%
          </div>
          <div style={{ display: "flex", gap: 9, alignItems: "center", fontSize: 12.5 }}>
            <span style={{ width: 14, height: 14, border: "1.5px solid #5bd6a9", borderRadius: 4, flex: "none" }} />
            Review collection response
          </div>
          <div style={{ display: "flex", gap: 9, alignItems: "center", fontSize: 12.5 }}>
            <span style={{ width: 14, height: 14, border: "1.5px solid #5bd6a9", borderRadius: 4, flex: "none" }} />
            Continue on-time payments
          </div>
          <div style={{ display: "flex", gap: 9, alignItems: "center", fontSize: 12.5 }}>
            <span style={{ width: 14, height: 14, border: "1.5px solid #5bd6a9", borderRadius: 4, flex: "none" }} />
            Upload updated report
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 8,
            background: "linear-gradient(135deg,#0e9f77,#2ee6a8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#fff" }} />
        </div>
        <div style={{ fontSize: 12, color: "#5a6b80" }}>
          Questions between reviews? Clarity AI has read this report and is available in
          your dashboard.
        </div>
      </div>

      <PageFooter page={13} />
    </section>
  );
}
