import { PageFooter } from "../PageFooter";
import type { PdfReportData } from "../report-data";
import { AccountCard } from "./AccountCard";

// P6 ACCOUNTS 2
export function Page06Accounts2({ data }: { data: PdfReportData }) {
  return (
    <section
      className="page"
      id="p6"
      data-screen-label="PDF Accounts 2"
      style={{ padding: "52px 60px 40px", display: "flex", flexDirection: "column", background: "#fff" }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", color: "#0e9f77", marginBottom: 6 }}>
        ACCOUNT-BY-ACCOUNT ANALYSIS · 2 OF 2
      </div>
      {data.accountsP2.length === 0 ? (
        <div style={{ fontSize: 13, color: "#5a6b80", marginTop: 12 }}>No additional accounts on this report.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
          {data.accountsP2.map((a) => (
            <AccountCard key={a.name} a={a} />
          ))}
        </div>
      )}
      <PageFooter page={6} />
    </section>
  );
}
