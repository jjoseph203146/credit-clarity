import { monoFontFamily } from "../fonts";
import { AccountRow, impactStyle, pillStyle, utilValueStyle } from "../report-data";

// Shared account card used on both "Accounts 1 of 2" (p5) and "Accounts 2 of 2" (p6).
export function AccountCard({ a }: { a: AccountRow }) {
  return (
    <div style={{ border: "1px solid #e4e9f0", borderRadius: 15, padding: "16px 20px", breakInside: "avoid" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 14.5 }}>{a.name}</span>
          <span style={{ fontSize: 11, color: "#8fa3ba" }}>{a.type}</span>
        </div>
        <span style={pillStyle(a.pillTone)}>{a.pillLabel}</span>
      </div>
      <div style={{ display: "flex", gap: 22, fontSize: 11.5, marginBottom: 9 }}>
        <span>
          <span style={{ color: "#8fa3ba", fontWeight: 600 }}>Balance</span>{" "}
          <strong style={{ fontFamily: monoFontFamily }}>{a.bal}</strong>
        </span>
        <span>
          <span style={{ color: "#8fa3ba", fontWeight: 600 }}>Limit</span>{" "}
          <strong style={{ fontFamily: monoFontFamily }}>{a.limit}</strong>
        </span>
        <span>
          <span style={{ color: "#8fa3ba", fontWeight: 600 }}>Utilization</span>{" "}
          <strong style={utilValueStyle(a.utilTone)}>{a.util}</strong>
        </span>
        <span>
          <span style={{ color: "#8fa3ba", fontWeight: 600 }}>History</span> <strong>{a.hist}</strong>
        </span>
        <span>
          <span style={{ color: "#8fa3ba", fontWeight: 600 }}>Impact</span>{" "}
          <strong style={impactStyle(a.impact)}>{a.impact}</strong>
        </span>
      </div>
      <div style={{ fontSize: 12.5, lineHeight: 1.6, color: "#3d5068", marginBottom: 9 }}>{a.ai}</div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#f4f8f6",
          borderRadius: 10,
          padding: "9px 13px",
        }}
      >
        <span style={{ fontSize: 12 }}>
          <span style={{ fontWeight: 700, color: "#0b7d5e" }}>Recommended:</span> <strong>{a.action}</strong>
        </span>
        <span style={{ fontSize: 11, color: "#8fa3ba" }}>
          Confidence <span style={{ color: "#e0a23a", letterSpacing: 1 }}>{a.confidence}</span>
        </span>
      </div>
    </div>
  );
}
