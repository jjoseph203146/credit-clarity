import { PageFooter } from "../PageFooter";
import { monoFontFamily } from "../fonts";
import type { PdfReportData } from "../report-data";

const disputeTemplateFor = (bureau: string) => `Name: ______________________   DOB: ____________   SSN (last 4): ______
Address: _____________________________________________

${bureau}, [bureau mailing address — see their website]

Re: Dispute of inaccurate information

I dispute the following item(s) on my credit report:

Item 1: _____________________________  Reason: ______________________
Item 2: _____________________________  Reason: ______________________

Enclosed: copy of ID, proof of address, and supporting documents. Under FCRA § 611, please investigate within 30 days and correct or delete any information that cannot be verified. Please send written results of your investigation.

Signature: ______________________   Date: ____________`;

// P12 TOOLKIT 2
export function Page12Toolkit2({ data }: { data: PdfReportData }) {
  return (
    <section
      className="page"
      id="p12"
      data-screen-label="PDF Toolkit 2"
      style={{ padding: "52px 60px 40px", display: "flex", flexDirection: "column", background: "#fff" }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", color: "#0e9f77", marginBottom: 6 }}>
        APPENDIX — COMMUNICATION TOOLKIT · 2 OF 2
      </div>
      <h1 style={{ fontSize: 27, letterSpacing: "-.02em", margin: "0 0 16px" }}>Scripts &amp; dispute template</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div style={{ border: "1px solid #e4e9f0", borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>3 · Collection Negotiation Script</div>
          <div style={{ fontSize: 11, lineHeight: 1.7, color: "#3d5068" }}>
            <div style={{ marginBottom: 6 }}>
              <strong>Before calling:</strong> validation response in hand · decide your maximum
              offer ahead of time · never give bank account access.
            </div>
            <div style={{ marginBottom: 6 }}>
              <strong>Offer:</strong> &quot;I can resolve this today for [amount] if you agree to
              delete the tradeline from all three bureaus.&quot;
            </div>
            <div style={{ marginBottom: 6 }}>
              <strong>If they refuse deletion:</strong> &quot;Then I need that offer in
              writing before I pay anything.&quot;
            </div>
            <div>
              <strong>Never say:</strong> &quot;this is my debt&quot; · &quot;I can pay next
              week&quot; · your employer, bank, or income.
            </div>
          </div>
        </div>
        <div style={{ border: "1px solid #e4e9f0", borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>4 · Creditor Phone Script (goodwill)</div>
          <div style={{ fontSize: 11, lineHeight: 1.7, color: "#3d5068" }}>
            <div style={{ marginBottom: 6 }}>
              <strong>Open:</strong> &quot;I&apos;ve been a customer for some time, and
              I&apos;m calling about a late payment on my account.&quot;
            </div>
            <div style={{ marginBottom: 6 }}>
              <strong>The ask:</strong> &quot;I&apos;ve made consistent on-time payments since
              then. Would you consider a goodwill adjustment removing that late mark?&quot;
            </div>
            <div>
              <strong>If no:</strong> &quot;I understand. Could you note my request, and
              may I follow up in writing?&quot; — then send letter #2.
            </div>
          </div>
        </div>
      </div>

      <div style={{ border: "1px solid #e4e9f0", borderRadius: 14, padding: "16px 18px" }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>5 · Bureau Dispute Template</div>
        <div style={{ fontSize: 10.5, color: "#8fa3ba", marginBottom: 10 }}>
          To: {data.bureauName} · use only for items your records show are inaccurate
        </div>
        <div style={{ fontFamily: monoFontFamily, fontSize: 9, lineHeight: 1.7, color: "#3d5068", whiteSpace: "pre-line" }}>
          {disputeTemplateFor(data.bureauName)}
        </div>
      </div>

      <PageFooter page={12} />
    </section>
  );
}
