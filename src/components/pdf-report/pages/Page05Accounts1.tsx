import { PageFooter } from "../PageFooter";
import type { PdfReportData } from "../report-data";
import { AccountCard } from "./AccountCard";

// P5 ACCOUNTS 1
export function Page05Accounts1({ data }: { data: PdfReportData }) {
  return (
    <section
      className="page"
      id="p5"
      data-screen-label="PDF Accounts 1"
      style={{ padding: "52px 60px 40px", display: "flex", flexDirection: "column", background: "#fff" }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", color: "#0e9f77", marginBottom: 6 }}>
        ACCOUNT-BY-ACCOUNT ANALYSIS · 1 OF 2
      </div>
      <h1 style={{ fontSize: 27, letterSpacing: "-.02em", margin: "0 0 18px" }}>Your accounts, explained</h1>
      {data.accountsP1.length === 0 ? (
        <div style={{ fontSize: 13, color: "#5a6b80" }}>No accounts found on this report.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {data.accountsP1.map((a) => (
            <AccountCard key={a.name} a={a} />
          ))}
        </div>
      )}
      <PageFooter page={5} />
    </section>
  );
}
