import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Step 1 of the core flow (BUILD.md): anonymous upload.
//
// Creates a `reports` row (user_id null — claimed later at signup) and
// returns a Supabase Storage signed upload URL. The client PUTs the PDF
// bytes directly to that URL; this route never touches the file itself.
export async function POST() {
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
    return NextResponse.json(
      { error: insertError?.message ?? "Failed to create report" },
      { status: 500 },
    );
  }

  const { data: signedUpload, error: signError } = await admin.storage
    .from("reports")
    .createSignedUploadUrl(storagePath);

  if (signError || !signedUpload) {
    return NextResponse.json(
      { error: signError?.message ?? "Failed to create signed upload URL" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    reportId: report.id,
    signedUrl: signedUpload.signedUrl,
    path: signedUpload.path,
    token: signedUpload.token,
  });
}
