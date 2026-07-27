import { PageFooter } from "../PageFooter";
import { monoFontFamily } from "../fonts";
import type { PdfReportData } from "../report-data";

function buildValidationLetter(addressee: string) {
  return `Name: ______________________
Address: ____________________
Date: _______________________

${addressee}

Re: Account #____________ — Request for Validation

I request validation of this debt under 15 U.S.C. § 1692g (FDCPA). Please provide: (1) the itemized amount and age of the debt; (2) the name of the original creditor; (3) proof of your license to collect in my state; (4) proof you own or are authorized to collect this debt.

Until validated, cease reporting this account to the credit bureaus and cease collection activity as required by law. This is a request for verification, not a refusal to pay.

Sincerely, ______________________`;
}

function buildGoodwillLetter(addressee: string) {
  return `Name: ______________________
Address: ____________________
Date: _______________________

${addressee}

Re: Account ending ______ — Goodwill adjustment request

I have been a customer for some time and value the relationship. I missed a payment due to:
____________________________________________

Since then I have made consistent on-time payments and, where applicable, enrolled in autopay so it cannot recur.

I respectfully request a goodwill adjustment removing the late payment from my credit reports.

Sincerely, ______________________`;
}

// P11 TOOLKIT 1
export function Page11Toolkit1({ data }: { data: PdfReportData }) {
  const validationLetter = buildValidationLetter(data.toolkitValidationAddressee);
  const goodwillLetter = buildGoodwillLetter(data.toolkitGoodwillAddressee);
  return (
    <section
      className="page"
      id="p11"
      data-screen-label="PDF Toolkit 1"
      style={{ padding: "52px 60px 40px", display: "flex", flexDirection: "column", background: "#fff" }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", color: "#0e9f77", marginBottom: 6 }}>
        APPENDIX — COMMUNICATION TOOLKIT · 1 OF 2
      </div>
      <h1 style={{ fontSize: 27, letterSpacing: "-.02em", margin: "0 0 4px" }}>Ready-to-send letters</h1>
      <div style={{ fontSize: 12, color: "#5a6b80", marginBottom: 16 }}>
        Fill the blanks, print, and send by certified mail. Keep copies of everything.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ border: "1px solid #e4e9f0", borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>1 · Debt Validation Letter</div>
          <div style={{ fontSize: 10.5, color: "#8fa3ba", marginBottom: 10 }}>
            To: {data.toolkitValidationAddressee} · within 30 days of contact
          </div>
          <div style={{ fontFamily: monoFontFamily, fontSize: 9, lineHeight: 1.7, color: "#3d5068", whiteSpace: "pre-line" }}>
            {validationLetter}
          </div>
        </div>
        <div style={{ border: "1px solid #e4e9f0", borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>2 · Goodwill Adjustment Request</div>
          <div style={{ fontSize: 10.5, color: "#8fa3ba", marginBottom: 10 }}>
            To: {data.toolkitGoodwillAddressee} · for a late payment on file
          </div>
          <div style={{ fontFamily: monoFontFamily, fontSize: 9, lineHeight: 1.7, color: "#3d5068", whiteSpace: "pre-line" }}>
            {goodwillLetter}
          </div>
        </div>
      </div>

      <PageFooter page={11} />
    </section>
  );
}
