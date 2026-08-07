import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { clientIp, hit, tooManyRequests } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";
import { reportError } from "@/lib/report-error";

// Unauthenticated by design (anonymous upload), so it needs its own abuse
// ceiling: each call mints a report row plus a signed Storage upload URL.
const UPLOAD_LIMIT = 5;
const UPLOAD_WINDOW_MS = 10 * 60 * 1000;

// Step 1 of the core flow (BUILD.md): anonymous upload.
//
// Creates a `reports` row (user_id null — claimed later at signup) and
// returns a Supabase Storage signed upload URL. The client PUTs the PDF
// bytes directly to that URL; this route never touches the file itself.
export async function POST(req: Request) {
  const limit = hit(
    `upload:${clientIp(req)}`,
    UPLOAD_LIMIT,
    UPLOAD_WINDOW_MS,
  );
  if (!limit.ok) return tooManyRequests(limit);

  const admin = createAdminClient();

  const reportId = randomUUID();
  const storagePath = `${reportId}/report.pdf`;

  const { data: report, error: insertError } = await admin
    .from("reports")
    .insert({
      id: reportId,
      user_id: null,
      status: "uploaded",
      storage_path: storagePath,
    })
    .select()
    .single();

  if (insertError || !report) {
    // Raw provider messages go to the logs, never to the user — they leak
    // schema/infrastructure detail and mean nothing to someone uploading a PDF.
    void reportError({ event: "upload_row_create_failed", severity: "error", error: insertError });
    return NextResponse.json(
      { error: "We couldn't start your upload. Please try again." },
      { status: 500 },
    );
  }

  const { data: signedUpload, error: signError } = await admin.storage
    .from("reports")
    .createSignedUploadUrl(storagePath);

  if (signError || !signedUpload) {
    void reportError({ event: "upload_sign_failed", severity: "error", error: signError });
    return NextResponse.json(
      { error: "We couldn't start your upload. Please try again." },
      { status: 500 },
    );
  }

  void audit({ action: "report_uploaded", reportId: report.id, req });

  return NextResponse.json({
    reportId: report.id,
    signedUrl: signedUpload.signedUrl,
    path: signedUpload.path,
    token: signedUpload.token,
  });
}
