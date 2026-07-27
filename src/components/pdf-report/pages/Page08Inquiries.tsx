import { PageFooter } from "../PageFooter";
import { pillStyle, type PdfReportData } from "../report-data";

// P8 INQUIRIES
export function Page08Inquiries({ data }: { data: PdfReportData }) {
  return (
    <section
      className="page"
      id="p8"
      data-screen-label="PDF Inquiries"
      style={{ padding: "52px 60px 40px", display: "flex", flexDirection: "column", background: "#fff" }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", color: "#0e9f77", marginBottom: 6 }}>
        HARD INQUIRIES
      </div>
      <h1 style={{ fontSize: 27, letterSpacing: "-.02em", margin: "0 0 18px" }}>{data.inquiriesHeadline}</h1>
      <p style={{ fontSize: 13, lineHeight: 1.7, margin: "0 0 16px", color: "#3d5068", textWrap: "pretty" }}>
        A hard inquiry appears when a lender checks your full report for an application.
        Each costs a few points at most, stops affecting your score after 12 months, and
        disappears entirely after 24.
      </p>

      {data.inquiriesData.length === 0 ? (
        <div style={{ background: "#e6f5ef", borderRadius: 12, padding: "14px 18px", fontSize: 13, color: "#22354d", marginBottom: 14 }}>
          ✓ <strong>No hard inquiries on this report.</strong>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
          {data.inquiriesData.map((q) => (
            <div
              key={q.id}
              style={{
                border: "1px solid #e4e9f0",
                borderRadius: 14,
                padding: "16px 20px",
                display: "grid",
                gridTemplateColumns: "1.2fr .7fr 1.1fr 1.4fr",
                gap: 14,
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>{q.lenderName}</div>
                <div style={{ fontSize: 11, color: "#8fa3ba" }}>{q.typeLabel}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#8fa3ba", fontWeight: 600 }}>DATE</div>
                <div style={{ fontWeight: 600, fontSize: 12.5 }}>{q.dateLabel}</div>
              </div>
              <div>
                <span style={pillStyle(q.pillTone)}>{q.pillLabel}</span>
              </div>
              <div style={{ fontSize: 12, color: "#3d5068", lineHeight: 1.5 }}>{q.note}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: "#f4f8f6", borderRadius: 14, padding: "16px 20px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", color: "#0b7d5e", marginBottom: 6 }}>
          GOOD TO KNOW
        </div>
        <div style={{ fontSize: 12.5, lineHeight: 1.65, color: "#3d5068" }}>
          Checking your own score is a <strong>soft pull</strong> and never hurts you. And
          when rate-shopping for a car or mortgage, multiple inquiries within a 14-day
          window count as one — shop freely inside that window.
        </div>
      </div>

      <PageFooter page={8} />
    </section>
  );
}
