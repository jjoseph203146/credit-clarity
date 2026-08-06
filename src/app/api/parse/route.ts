import { NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import { createAdminClient } from "@/lib/supabase/admin";
import { detectBureau } from "@/lib/parsing/detect-bureau";
import { extractScore } from "@/lib/parsing/extract-score";
import { extractAccounts } from "@/lib/parsing/extract-accounts";
import { extractCollections } from "@/lib/parsing/extract-collections";
import { extractInquiries } from "@/lib/parsing/extract-inquiries";
import { clientIp, hit, tooManyRequests } from "@/lib/rate-limit";

// Unauthenticated and CPU-heavy (downloads the PDF and runs pdf-parse on
// it), so it gets a tighter ceiling than the routes that only touch the DB.
const PARSE_LIMIT = 10;
const PARSE_WINDOW_MS = 10 * 60 * 1000;

// Step 2 of the core flow (BUILD.md): server-side parse job.
//
// IMPORTANT / HONEST LIMITATION: credit bureau PDFs (Experian, Equifax,
// TransUnion) do not share one standardized text layout, and `pdf-parse`
// gives us a flattened text stream where the original visual
// columns/whitespace are not reliably preserved. There is no general,
// deterministic parser for "every bureau PDF" without OCR + layout
// analysis. What's implemented here (see `src/lib/parsing/*`) is a
// REGEX-BASED HEURISTIC extraction pass:
//   - bureau detection: looks for letterhead/domain mentions
//     (experian.com / equifax.com / transunion.com), null if ambiguous
//   - score: only trusts "label near a 300-850 number" patterns
//     (Credit Score / FICO / VantageScore), null if not confidently found
//   - accounts / collections / inquiries: scans for repeating
//     label:value blocks (Balance / Credit Limit / Account Type /
//     Opened Date / Payment Status, Original Creditor / Collection
//     Agency, inquiry name+date lines) and leaves any field it can't
//     confidently find as `null` rather than fabricate a value
//
// This heuristic catches accounts/collections/inquiries on reports that
// follow a fairly common label:value text layout, and will legitimately
// miss data on reports with unusual layouts, heavily tabular exports
// where pdf-parse interleaves columns, or scanned/image-only PDFs with no
// extractable text. That's a known, expected limitation of a no-AI regex
// pass — it is NOT a claim that this works perfectly on all real bureau
// PDFs. The downstream Claude analysis pass (BUILD.md step 5) and the
// free-preview screen are both designed to work from whatever subset of
// structured fields (plus the raw free text) actually got extracted.
export async function POST(req: Request) {
  const limit = hit(`parse:${clientIp(req)}`, PARSE_LIMIT, PARSE_WINDOW_MS);
  if (!limit.ok) return tooManyRequests(limit);

  const { reportId } = (await req.json()) as { reportId: string };

  const admin = createAdminClient();

  const { data: report, error: reportError } = await admin
    .from("reports")
    .select("*")
    .eq("id", reportId)
    .single();

  if (reportError || !report) {
    return NextResponse.json(
      { error: reportError?.message ?? "Report not found" },
      { status: 404 },
    );
  }

  if (report.status !== "uploaded") {
    return NextResponse.json(
      { error: "Report is not in an uploadable state for parsing" },
      { status: 409 },
    );
  }

  const { data: file, error: downloadError } = await admin.storage
    .from("reports")
    .download(report.storage_path);

  if (downloadError || !file) {
    return NextResponse.json(
      { error: downloadError?.message ?? "Report file not found in storage" },
      { status: 404 },
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { text: rawText } = await pdfParse(buffer);

    const bureau = detectBureau(rawText);
    const creditScore = extractScore(rawText);
    const accounts = extractAccounts(rawText);
    const collections = extractCollections(rawText);
    const inquiries = extractInquiries(rawText);

    const extractedAnything =
      bureau != null ||
      creditScore != null ||
      accounts.length > 0 ||
      collections.length > 0 ||
      inquiries.length > 0;

    if (!extractedAnything) {
      // Not an error: the upload -> parse -> preview pipeline should still
      // proceed with just the raw text available downstream. Log clearly
      // so this is visible in server logs / observability rather than
      // silently swallowed.
      console.warn(
        `[parse] report ${reportId}: no bureau/score/accounts/collections/inquiries ` +
          `confidently extracted from PDF text (unrecognized format, scanned PDF, ` +
          `or extraction heuristics didn't match). Proceeding with status 'parsed' ` +
          `anyway — free preview / downstream AI pass will work from raw text only.`,
      );
    }

    if (accounts.length > 0) {
      const { error: accountsError } = await admin.from("report_accounts").insert(
        accounts.map((account) => ({
          report_id: reportId,
          name: account.name,
          type: account.type,
          status: account.status,
          balance: account.balance,
          credit_limit: account.credit_limit,
          utilization: account.utilization,
          payment_history: account.payment_history,
          opened_date: account.opened_date,
        })),
      );
      if (accountsError) {
        console.warn(
          `[parse] report ${reportId}: failed to insert report_accounts: ${accountsError.message}`,
        );
      }
    }

    if (collections.length > 0) {
      const { error: collectionsError } = await admin
        .from("report_collections")
        .insert(
          collections.map((collection) => ({
            report_id: reportId,
            original_creditor: collection.original_creditor,
            agency_name: collection.agency_name,
            amount: collection.amount,
            opened_date: collection.opened_date,
            first_delinquency_date: collection.first_delinquency_date,
            falls_off_date: collection.falls_off_date,
          })),
        );
      if (collectionsError) {
        console.warn(
          `[parse] report ${reportId}: failed to insert report_collections: ${collectionsError.message}`,
        );
      }
    }

    if (inquiries.length > 0) {
      const { error: inquiriesError } = await admin
        .from("report_inquiries")
        .insert(
          inquiries.map((inquiry) => ({
            report_id: reportId,
            lender_name: inquiry.lender_name,
            inquiry_type: inquiry.inquiry_type,
            inquiry_date: inquiry.inquiry_date,
            impact: inquiry.impact,
          })),
        );
      if (inquiriesError) {
        console.warn(
          `[parse] report ${reportId}: failed to insert report_inquiries: ${inquiriesError.message}`,
        );
      }
    }

    const { error: updateError } = await admin
      .from("reports")
      .update({
        status: "parsed",
        bureau: bureau ?? report.bureau,
        credit_score: creditScore ?? report.credit_score,
      })
      .eq("id", reportId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      status: "parsed",
      extracted: {
        bureau,
        creditScore,
        accountCount: accounts.length,
        collectionCount: collections.length,
        inquiryCount: inquiries.length,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[parse] report ${reportId}: parsing failed:`, err);
    await admin
      .from("reports")
      .update({ status: "error", error_message: message.slice(0, 500) })
      .eq("id", reportId);
    return NextResponse.json({ error: "Failed to parse report" }, { status: 500 });
  }
}
